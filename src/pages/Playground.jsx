/**
 * Playground.jsx — DecisionMesh Control Plane Test Bench
 *
 * Purpose: test budget enforcement, policy rules, adapter routing
 *          and execution governance — NOT document extraction.
 *
 * Document extraction / BYOM intelligence is an adapter concern.
 * Users who want extraction connect their own adapter (BYOK/BYOM)
 * and submit via the standard intent pipeline.
 */
import { useState, useEffect, useRef } from 'react';
import {
  Send, RefreshCw, Copy, ExternalLink, Zap,
  Shield, Clock, RotateCcw, BookOpen, Key, Cpu,
  ChevronDown, ChevronUp, AlertTriangle,
} from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Page from '../components/shared/Page';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/shared';
import ExecutionTimeline from '../components/timeline/ExecutionTimeline';
import { submitIntent, getIntent, getExecutionsByIntent, request } from '../utils/api';
import { useCredits, MODEL_TIERS } from '../context/CreditContext';

// ── Shared SmartResponseRenderer helpers ──────────────────────────────────────
function tryParseJson(text) {
  if (!text) return null;
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  try { return JSON.parse(cleaned); } catch { return null; }
}

function RiskGauge({ score }) {
  const pct = Math.round((score ?? 0) * 100);
  const color = score >= 0.8 ? '#dc2626' : score >= 0.6 ? '#d97706' : score >= 0.3 ? '#f59e0b' : '#16a34a';
  const label = score >= 0.8 ? 'CRITICAL' : score >= 0.6 ? 'HIGH' : score >= 0.3 ? 'MEDIUM' : 'LOW';
  return (
    <div style={{ textAlign: 'center', padding: '12px 0' }}>
      <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 8px' }}>
        <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: 80, height: 80 }}>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color, lineHeight: 1 }}>{pct}</span>
          <span style={{ fontSize: 9, color: '#94a3b8' }}>/ 100</span>
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.5px' }}>{label} RISK</div>
    </div>
  );
}

function RecommendationBadge({ value }) {
  const styles = {
    APPROVE: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', icon: '✓' },
    REVIEW:  { bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: '!' },
    DECLINE: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: '✗' },
  };
  const s = styles[value?.toUpperCase()] ?? styles.REVIEW;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: s.bg, border: `1.5px solid ${s.border}` }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.icon}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: s.color, letterSpacing: '0.5px' }}>{value?.toUpperCase()}</span>
    </div>
  );
}

function FraudDetectionView({ data }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Risk Score</p>
          <RiskGauge score={data.riskScore} />
        </div>
        <div style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Recommendation</p>
          <RecommendationBadge value={data.recommendation} />
        </div>
      </div>
      {data.riskFactors?.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Risk Factors ({data.riskFactors.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.riskFactors.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 10px', background: '#fef2f2', borderRadius: 7, border: '1px solid #fecaca' }}>
                <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>⚠</span>
                <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.reasoning && (
        <div style={{ background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', padding: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>AI Reasoning</p>
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{data.reasoning}</p>
        </div>
      )}
    </div>
  );
}

function GenericJsonView({ data }) {
  function renderValue(v, depth = 0) {
    if (v === null || v === undefined) return <span style={{ color: '#94a3b8' }}>—</span>;
    if (typeof v === 'boolean') return <span style={{ color: v ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{v ? 'Yes' : 'No'}</span>;
    if (typeof v === 'number') return <span style={{ color: '#2563eb', fontWeight: 600 }}>{v}</span>;
    if (Array.isArray(v)) return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
        {v.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ color: '#94a3b8', fontSize: 11, marginTop: 2, flexShrink: 0 }}>•</span>
            <span style={{ fontSize: 12, color: '#374151' }}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>
          </div>
        ))}
      </div>
    );
    if (typeof v === 'object' && depth < 2) return (
      <div style={{ marginTop: 4, paddingLeft: 8, borderLeft: '2px solid #e2e8f0' }}>
        {Object.entries(v).map(([k2, v2]) => (
          <div key={k2} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, minWidth: 80 }}>{k2.replace(/_/g, ' ')}</span>
            <span style={{ fontSize: 12, color: '#374151' }}>{typeof v2 === 'object' ? JSON.stringify(v2) : String(v2)}</span>
          </div>
        ))}
      </div>
    );
    return <span style={{ fontSize: 12, color: '#374151' }}>{String(v)}</span>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Object.entries(data).map(([k, v]) => (
        <div key={k} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
            {k.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
          </p>
          {renderValue(v)}
        </div>
      ))}
    </div>
  );
}

function SmartResponseRenderer({ responseText, intentType }) {
  const [showRaw, setShowRaw] = useState(false);
  if (!responseText) return (
    <div className="text-center py-3">
      <p className="text-sm text-slate-400">Response text not available</p>
    </div>
  );
  const parsed = tryParseJson(responseText);
  const isJson = parsed !== null && typeof parsed === 'object';
  const type = (intentType ?? '').toLowerCase();
  const isFraud = type.includes('fraud') || (parsed?.riskScore !== undefined && parsed?.recommendation !== undefined);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {isJson ? (isFraud ? 'Fraud Risk Assessment' : 'Structured Response') : 'Adapter Response'}
        </p>
        {isJson && (
          <span onClick={(e) => { e.stopPropagation(); setShowRaw(v => !v); }}
            style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', userSelect: 'none' }}>
            {showRaw ? '← Smart view' : 'Raw JSON →'}
          </span>
        )}
      </div>
      {showRaw || !isJson ? (
        <div style={{ fontFamily: isJson ? "'JetBrains Mono', monospace" : 'inherit', fontSize: 13, color: '#374151', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, lineHeight: 1.6, whiteSpace: isJson ? 'pre-wrap' : 'pre-line', wordBreak: 'break-word', maxHeight: 300, overflowY: 'auto' }}>
          {isJson ? JSON.stringify(parsed, null, 2) : responseText}
        </div>
      ) : (
        isFraud ? <FraudDetectionView data={parsed} /> : <GenericJsonView data={parsed} />
      )}
    </div>
  );
}

// ── Intent type suggestions ───────────────────────────────────────────────────
// intentType is a free-form string in the backend — no enum validation.
// These are common suggestions only. Users can type anything.
const INTENT_SUGGESTIONS = [
  // ── Payments ──────────────────────────────────────────
  { id: 'detect_fraud_transaction', label: 'Detect Fraud Txn', category: 'Payments' },
  { id: 'approve_payment', label: 'Approve Payment', category: 'Payments' },
  { id: 'route_payment', label: 'Route Payment', category: 'Payments' },
  { id: 'retry_payment', label: 'Retry Payment', category: 'Payments' },
  { id: 'optimize_payment_rail', label: 'Optimize Payment Rail', category: 'Payments' },
  { id: 'detect_duplicate_transaction', label: 'Detect Duplicate Txn', category: 'Payments' },
  { id: 'flag_suspicious_transaction', label: 'Flag Suspicious Txn', category: 'Payments' },
  { id: 'validate_transaction_limit', label: 'Validate Txn Limit', category: 'Payments' },
  { id: 'authorize_card', label: 'Authorize Card', category: 'Payments' },
  { id: 'decline_transaction', label: 'Decline Txn', category: 'Payments' },
  { id: 'process_refund', label: 'Process Refund', category: 'Payments' },
  { id: 'handle_chargeback', label: 'Handle Chargeback', category: 'Payments' },
  { id: 'verify_upi', label: 'Verify Upi', category: 'Payments' },
  { id: 'monitor_realtime_payment', label: 'Monitor Realtime Payment', category: 'Payments' },
  { id: 'cross_border_check', label: 'Cross Border Check', category: 'Payments' },
  { id: 'tokenize_card', label: 'Tokenize Card', category: 'Payments' },
  { id: 'validate_card', label: 'Validate Card', category: 'Payments' },
  { id: 'verify_bank_account', label: 'Verify Bank Account', category: 'Payments' },
  { id: 'process_emi', label: 'Process Emi', category: 'Payments' },
  { id: 'split_payment', label: 'Split Payment', category: 'Payments' },
  { id: 'initiate_ach', label: 'Initiate Ach', category: 'Payments' },
  { id: 'process_swift', label: 'Process Swift', category: 'Payments' },
  { id: 'generate_payment_link', label: 'Gen Payment Link', category: 'Payments' },
  { id: 'settle_payment', label: 'Settle Payment', category: 'Payments' },
  { id: 'reverse_payment', label: 'Reverse Payment', category: 'Payments' },
  // ── Lending ───────────────────────────────────────────
  { id: 'approve_loan', label: 'Approve Loan', category: 'Lending' },
  { id: 'reject_loan', label: 'Reject Loan', category: 'Lending' },
  { id: 'calculate_credit_score', label: 'Calculate Credit Score', category: 'Lending' },
  { id: 'assess_borrower_risk', label: 'Assess Borrower Risk', category: 'Lending' },
  { id: 'determine_interest_rate', label: 'Determine Interest Rate', category: 'Lending' },
  { id: 'predict_default', label: 'Predict Default', category: 'Lending' },
  { id: 'detect_synthetic_identity', label: 'Detect Synthetic Identity', category: 'Lending' },
  { id: 'verify_income', label: 'Verify Income', category: 'Lending' },
  { id: 'evaluate_collateral', label: 'Evaluate Collateral', category: 'Lending' },
  { id: 'preapprove_loan', label: 'Preapprove Loan', category: 'Lending' },
  { id: 'recommend_loan', label: 'Recommend Loan', category: 'Lending' },
  { id: 'assess_sme_credit', label: 'Assess Sme Credit', category: 'Lending' },
  { id: 'monitor_loan_risk', label: 'Monitor Loan Risk', category: 'Lending' },
  { id: 'trigger_loan_review', label: 'Trigger Loan Review', category: 'Lending' },
  { id: 'adjust_credit_limit', label: 'Adjust Credit Limit', category: 'Lending' },
  { id: 'disburse_loan', label: 'Disburse Loan', category: 'Lending' },
  { id: 'close_loan', label: 'Close Loan', category: 'Lending' },
  { id: 'restructure_loan', label: 'Restructure Loan', category: 'Lending' },
  { id: 'process_loan_repayment', label: 'Process Loan Repayment', category: 'Lending' },
  { id: 'onboard_borrower', label: 'Onboard Borrower', category: 'Lending' },
  { id: 'verify_employment', label: 'Verify Employment', category: 'Lending' },
  { id: 'generate_loan_statement', label: 'Gen Loan Statement', category: 'Lending' },
  { id: 'assess_property', label: 'Assess Property', category: 'Lending' },
  // ── AP / AR ───────────────────────────────────────────
  { id: 'extract_invoice', label: 'Extract Invoice', category: 'AP/AR' },
  { id: 'validate_invoice', label: 'Validate Invoice', category: 'AP/AR' },
  { id: 'match_invoice_po', label: 'Match Invoice Po', category: 'AP/AR' },
  { id: 'detect_duplicate_invoice', label: 'Detect Duplicate Invoice', category: 'AP/AR' },
  { id: 'approve_invoice', label: 'Approve Invoice', category: 'AP/AR' },
  { id: 'reject_invoice', label: 'Reject Invoice', category: 'AP/AR' },
  { id: 'flag_invoice_anomaly', label: 'Flag Invoice Anomaly', category: 'AP/AR' },
  { id: 'auto_code_invoice', label: 'Auto Code Invoice', category: 'AP/AR' },
  { id: 'validate_tax_invoice', label: 'Validate Tax Invoice', category: 'AP/AR' },
  { id: 'schedule_payment', label: 'Schedule Payment', category: 'AP/AR' },
  { id: 'split_invoice', label: 'Split Invoice', category: 'AP/AR' },
  { id: 'process_credit_note', label: 'Process Credit Note', category: 'AP/AR' },
  { id: 'verify_invoice_compliance', label: 'Verify Invoice Compliance', category: 'AP/AR' },
  { id: 'audit_invoice', label: 'Audit Invoice', category: 'AP/AR' },
  { id: 'predict_payment_delay', label: 'Predict Payment Delay', category: 'AP/AR' },
  { id: 'generate_invoice', label: 'Gen Invoice', category: 'AP/AR' },
  { id: 'send_payment_reminder', label: 'Send Payment Reminder', category: 'AP/AR' },
  { id: 'prioritize_collection', label: 'Prioritize Collection', category: 'AP/AR' },
  { id: 'reconcile_receivable', label: 'Recone Receivable', category: 'AP/AR' },
  { id: 'apply_payment', label: 'Apply Payment', category: 'AP/AR' },
  { id: 'offer_discount', label: 'Offer Discount', category: 'AP/AR' },
  { id: 'detect_overdue_risk', label: 'Detect Overdue Risk', category: 'AP/AR' },
  { id: 'automate_dunning', label: 'Automate Dunning', category: 'AP/AR' },
  { id: 'resolve_dispute', label: 'Resolve Dispute', category: 'AP/AR' },
  { id: 'track_receivable_aging', label: 'Track Receivable Aging', category: 'AP/AR' },
  { id: 'forecast_receivable', label: 'Forecast Receivable', category: 'AP/AR' },
  { id: 'match_payment', label: 'Match Payment', category: 'AP/AR' },
  { id: 'identify_bad_debt', label: 'Identify Bad Debt', category: 'AP/AR' },
  { id: 'escalate_collection', label: 'Escalate Collection', category: 'AP/AR' },
  // ── Treasury ──────────────────────────────────────────
  { id: 'predict_cashflow', label: 'Predict Cashflow', category: 'Treasury' },
  { id: 'optimize_liquidity', label: 'Optimize Liquidity', category: 'Treasury' },
  { id: 'allocate_funds', label: 'Allocate Funds', category: 'Treasury' },
  { id: 'detect_cash_anomaly', label: 'Detect Cash Anomaly', category: 'Treasury' },
  { id: 'fx_conversion', label: 'Fx Conversion', category: 'Treasury' },
  { id: 'forecast_treasury', label: 'Forecast Treasury', category: 'Treasury' },
  { id: 'optimize_working_capital', label: 'Optimize Working Capital', category: 'Treasury' },
  { id: 'monitor_bank_balance', label: 'Monitor Bank Balance', category: 'Treasury' },
  { id: 'recommend_investment', label: 'Recommend Investment', category: 'Treasury' },
  { id: 'manage_borrowing', label: 'Manage Borrowing', category: 'Treasury' },
  { id: 'detect_cash_movement', label: 'Detect Cash Movement', category: 'Treasury' },
  { id: 'balance_accounts', label: 'Balance Accounts', category: 'Treasury' },
  { id: 'optimize_yield', label: 'Optimize Yield', category: 'Treasury' },
  { id: 'plan_capital', label: 'Plan Capital', category: 'Treasury' },
  { id: 'stress_liquidity', label: 'Stress Liquidity', category: 'Treasury' },
  { id: 'manage_hedging', label: 'Manage Hedging', category: 'Treasury' },
  { id: 'execute_sweep', label: 'Execute Sweep', category: 'Treasury' },
  { id: 'manage_netting', label: 'Manage Netting', category: 'Treasury' },
  { id: 'optimize_debt', label: 'Optimize Debt', category: 'Treasury' },
  { id: 'monitor_counterparty_risk', label: 'Monitor Counterparty Risk', category: 'Treasury' },
  // ── Fraud ─────────────────────────────────────────────
  { id: 'fraud_detection', label: 'Fraud Detection', category: 'Fraud' },
  { id: 'detect_aml', label: 'Detect Aml', category: 'Fraud' },
  { id: 'flag_high_risk_account', label: 'Flag High Risk Account', category: 'Fraud' },
  { id: 'monitor_behavior', label: 'Monitor Behavior', category: 'Fraud' },
  { id: 'detect_insider_fraud', label: 'Detect Insider Fraud', category: 'Fraud' },
  { id: 'score_customer_risk', label: 'Score Customer Risk', category: 'Fraud' },
  { id: 'analyze_pattern', label: 'Analyze Pattern', category: 'Fraud' },
  { id: 'detect_identity_theft', label: 'Detect Identity Theft', category: 'Fraud' },
  { id: 'flag_login_risk', label: 'Flag Login Risk', category: 'Fraud' },
  { id: 'assess_geo_risk', label: 'Assess Geo Risk', category: 'Fraud' },
  { id: 'evaluate_merchant_risk', label: 'Evaluate Merchant Risk', category: 'Fraud' },
  { id: 'monitor_velocity_fraud', label: 'Monitor Velocity Fraud', category: 'Fraud' },
  { id: 'detect_card_skimming', label: 'Detect Card Skimming', category: 'Fraud' },
  { id: 'identify_mule_account', label: 'Identify Mule Account', category: 'Fraud' },
  { id: 'track_fraud_trend', label: 'Track Fraud Trend', category: 'Fraud' },
  { id: 'trigger_fraud_alert', label: 'Trigger Fraud Alert', category: 'Fraud' },
  { id: 'detect_account_takeover', label: 'Detect Account Takeover', category: 'Fraud' },
  { id: 'detect_bot', label: 'Detect Bot', category: 'Fraud' },
  { id: 'verify_device', label: 'Verify Device', category: 'Fraud' },
  { id: 'score_transaction_risk', label: 'Score Txn Risk', category: 'Fraud' },
  { id: 'detect_phishing', label: 'Detect Phishing', category: 'Fraud' },
  { id: 'monitor_dark_web', label: 'Monitor Dark Web', category: 'Fraud' },
  // ── Compliance ────────────────────────────────────────
  { id: 'compliance_check', label: 'Compliance Check', category: 'Compliance' },
  { id: 'kyc_verification', label: 'Kyc Verify', category: 'Compliance' },
  { id: 'validate_document', label: 'Validate Document', category: 'Compliance' },
  { id: 'screen_sanctions', label: 'Screen Sanctions', category: 'Compliance' },
  { id: 'check_pep', label: 'Check Pep', category: 'Compliance' },
  { id: 'monitor_compliance', label: 'Monitor Compliance', category: 'Compliance' },
  { id: 'generate_compliance_report', label: 'Gen Compliance Report', category: 'Compliance' },
  { id: 'audit_trail', label: 'Audit Trail', category: 'Compliance' },
  { id: 'validate_regulation', label: 'Validate Regulation', category: 'Compliance' },
  { id: 'detect_gdpr_violation', label: 'Detect Gdpr Violation', category: 'Compliance' },
  { id: 'enforce_policy', label: 'Enforce Policy', category: 'Compliance' },
  { id: 'track_audit_log', label: 'Track Audit Log', category: 'Compliance' },
  { id: 'verify_onboarding', label: 'Verify Onboarding', category: 'Compliance' },
  { id: 'monitor_suspicious_activity', label: 'Monitor Suspicious Activity', category: 'Compliance' },
  { id: 'file_regulatory_report', label: 'File Reg Report', category: 'Compliance' },
  { id: 'check_legality', label: 'Check Legality', category: 'Compliance' },
  { id: 'verify_beneficial_owner', label: 'Verify Beneficial Owner', category: 'Compliance' },
  { id: 'conduct_edd', label: 'Conduct Edd', category: 'Compliance' },
  { id: 'assess_country_risk', label: 'Assess Country Risk', category: 'Compliance' },
  { id: 'check_fatf', label: 'Check Fatf', category: 'Compliance' },
  { id: 'monitor_transaction_reporting', label: 'Monitor Txn Reporting', category: 'Compliance' },
  { id: 'validate_aml_rules', label: 'Validate Aml Rules', category: 'Compliance' },
  { id: 'assess_tax_compliance', label: 'Assess Tax Compliance', category: 'Compliance' },
  // ── Procurement ───────────────────────────────────────
  { id: 'evaluate_vendor', label: 'Evaluate Vendor', category: 'Procurement' },
  { id: 'approve_vendor', label: 'Approve Vendor', category: 'Procurement' },
  { id: 'detect_vendor_fraud', label: 'Detect Vendor Fraud', category: 'Procurement' },
  { id: 'score_vendor', label: 'Score Vendor', category: 'Procurement' },
  { id: 'select_vendor', label: 'Select Vendor', category: 'Procurement' },
  { id: 'monitor_vendor', label: 'Monitor Vendor', category: 'Procurement' },
  { id: 'validate_contract', label: 'Validate Contract', category: 'Procurement' },
  { id: 'detect_supplier_anomaly', label: 'Detect Supplier Anomaly', category: 'Procurement' },
  { id: 'optimize_procurement', label: 'Optimize Procurement', category: 'Procurement' },
  { id: 'track_vendor_payment', label: 'Track Vendor Payment', category: 'Procurement' },
  { id: 'assess_supplier', label: 'Assess Supplier', category: 'Procurement' },
  { id: 'rank_vendor', label: 'Rank Vendor', category: 'Procurement' },
  { id: 'audit_vendor', label: 'Audit Vendor', category: 'Procurement' },
  { id: 'flag_supplier_risk', label: 'Flag Supplier Risk', category: 'Procurement' },
  { id: 'renew_contract', label: 'Renew Contract', category: 'Procurement' },
  { id: 'generate_purchase_order', label: 'Gen Purchase Order', category: 'Procurement' },
  { id: 'approve_purchase_order', label: 'Approve Purchase Order', category: 'Procurement' },
  { id: 'track_delivery', label: 'Track Delivery', category: 'Procurement' },
  { id: 'manage_spend', label: 'Manage Spend', category: 'Procurement' },
  // ── Investments ───────────────────────────────────────
  { id: 'recommend_portfolio', label: 'Recommend Portfolio', category: 'Investments' },
  { id: 'execute_trade', label: 'Execute Trade', category: 'Investments' },
  { id: 'detect_market_anomaly', label: 'Detect Market Anomaly', category: 'Investments' },
  { id: 'risk_adjusted_return', label: 'Risk Adjusted Return', category: 'Investments' },
  { id: 'trigger_stop_loss', label: 'Trigger Stop Loss', category: 'Investments' },
  { id: 'optimize_portfolio', label: 'Optimize Portfolio', category: 'Investments' },
  { id: 'predict_stock', label: 'Predict Stock', category: 'Investments' },
  { id: 'analyze_sentiment', label: 'Analyze Sentiment', category: 'Investments' },
  { id: 'balance_portfolio', label: 'Balance Portfolio', category: 'Investments' },
  { id: 'allocate_assets', label: 'Allocate Assets', category: 'Investments' },
  { id: 'detect_arbitrage', label: 'Detect Arbitrage', category: 'Investments' },
  { id: 'evaluate_fund', label: 'Evaluate Fund', category: 'Investments' },
  { id: 'track_volatility', label: 'Track Volatility', category: 'Investments' },
  { id: 'rebalance_portfolio', label: 'Rebalance Portfolio', category: 'Investments' },
  { id: 'manage_exposure', label: 'Manage Exposure', category: 'Investments' },
  { id: 'calculate_var', label: 'Calculate Var', category: 'Investments' },
  { id: 'assess_esg', label: 'Assess Esg', category: 'Investments' },
  { id: 'backtest_strategy', label: 'Backtest Strategy', category: 'Investments' },
  { id: 'monitor_market_risk', label: 'Monitor Market Risk', category: 'Investments' },
  { id: 'optimize_tax_loss', label: 'Optimize Tax Loss', category: 'Investments' },
  { id: 'generate_trade_report', label: 'Gen Trade Report', category: 'Investments' },
  // ── Customer Ops ──────────────────────────────────────
  { id: 'recommend_product', label: 'Recommend Product', category: 'Customer Ops' },
  { id: 'detect_churn', label: 'Detect Churn', category: 'Customer Ops' },
  { id: 'personalize_offer', label: 'Personalize Offer', category: 'Customer Ops' },
  { id: 'resolve_customer_dispute', label: 'Resolve Customer Dispute', category: 'Customer Ops' },
  { id: 'generate_support', label: 'Gen Support', category: 'Customer Ops' },
  { id: 'analyze_sentiment_customer', label: 'Analyze Sentiment Customer', category: 'Customer Ops' },
  { id: 'segment_customer', label: 'Segment Customer', category: 'Customer Ops' },
  { id: 'detect_upsell', label: 'Detect Upsell', category: 'Customer Ops' },
  { id: 'track_engagement', label: 'Track Engagement', category: 'Customer Ops' },
  { id: 'recommend_card', label: 'Recommend Card', category: 'Customer Ops' },
  { id: 'offer_upgrade', label: 'Offer Upgrade', category: 'Customer Ops' },
  { id: 'predict_clv', label: 'Predict Clv', category: 'Customer Ops' },
  { id: 'detect_dissatisfaction', label: 'Detect Dissatisfaction', category: 'Customer Ops' },
  { id: 'route_support', label: 'Route Support', category: 'Customer Ops' },
  { id: 'optimize_retention', label: 'Optimize Retention', category: 'Customer Ops' },
  { id: 'onboard_customer', label: 'Onboard Customer', category: 'Customer Ops' },
  { id: 'verify_identity', label: 'Verify Identity', category: 'Customer Ops' },
  { id: 'close_account', label: 'Close Account', category: 'Customer Ops' },
  { id: 'handle_complaint', label: 'Handle Complaint', category: 'Customer Ops' },
  { id: 'generate_statement', label: 'Gen Statement', category: 'Customer Ops' },
  { id: 'update_kyc', label: 'Update Kyc', category: 'Customer Ops' },
  // ── Reconciliation ────────────────────────────────────
  { id: 'reconcile_transaction', label: 'Recone Txn', category: 'Reconciliation' },
  { id: 'match_ledger', label: 'Match Ledger', category: 'Reconciliation' },
  { id: 'detect_recon_gap', label: 'Detect Recon Gap', category: 'Reconciliation' },
  { id: 'resolve_mismatch', label: 'Resolve Mismatch', category: 'Reconciliation' },
  { id: 'automate_settlement', label: 'Automate Settlement', category: 'Reconciliation' },
  { id: 'validate_entries', label: 'Validate Entries', category: 'Reconciliation' },
  { id: 'track_unmatched', label: 'Track Unmatched', category: 'Reconciliation' },
  { id: 'identify_breaks', label: 'Identify Breaks', category: 'Reconciliation' },
  { id: 'adjust_ledger', label: 'Adjust Ledger', category: 'Reconciliation' },
  { id: 'close_books', label: 'Close Books', category: 'Reconciliation' },
  { id: 'reconcile_bank', label: 'Recone Bank', category: 'Reconciliation' },
  { id: 'reconcile_intercompany', label: 'Recone Intercompany', category: 'Reconciliation' },
  { id: 'validate_nostro', label: 'Validate Nostro', category: 'Reconciliation' },
  { id: 'reconcile_tax', label: 'Recone Tax', category: 'Reconciliation' },
  { id: 'perform_period_close', label: 'Perform Period Close', category: 'Reconciliation' },
  // ── Billing ───────────────────────────────────────────
  { id: 'calculate_usage', label: 'Calculate Usage', category: 'Billing' },
  { id: 'generate_bill', label: 'Gen Bill', category: 'Billing' },
  { id: 'detect_revenue_leakage', label: 'Detect Revenue Leakage', category: 'Billing' },
  { id: 'optimize_pricing', label: 'Optimize Pricing', category: 'Billing' },
  { id: 'forecast_revenue', label: 'Forecast Revenue', category: 'Billing' },
  { id: 'apply_tax', label: 'Apply Tax', category: 'Billing' },
  { id: 'invoice_customer', label: 'Invoice Customer', category: 'Billing' },
  { id: 'track_subscription', label: 'Track Subscription', category: 'Billing' },
  { id: 'prorate_charges', label: 'Prorate Charges', category: 'Billing' },
  { id: 'audit_billing', label: 'Audit Billing', category: 'Billing' },
  { id: 'process_renewal', label: 'Process Renewal', category: 'Billing' },
  { id: 'upgrade_plan', label: 'Upgrade Plan', category: 'Billing' },
  { id: 'downgrade_plan', label: 'Downgrade Plan', category: 'Billing' },
  { id: 'issue_refund', label: 'Issue Refund', category: 'Billing' },
  { id: 'handle_payment_failure', label: 'Handle Payment Failure', category: 'Billing' },
  { id: 'apply_coupon', label: 'Apply Coupon', category: 'Billing' },
  { id: 'generate_receipt', label: 'Gen Receipt', category: 'Billing' },
  { id: 'validate_billing_info', label: 'Validate Billing Info', category: 'Billing' },
  // ── Insurance ─────────────────────────────────────────
  { id: 'assess_insurance_risk', label: 'Assess Insurance Risk', category: 'Insurance' },
  { id: 'process_claim', label: 'Process Claim', category: 'Insurance' },
  { id: 'detect_claim_fraud', label: 'Detect Claim Fraud', category: 'Insurance' },
  { id: 'calculate_premium', label: 'Calculate Premium', category: 'Insurance' },
  { id: 'underwrite_policy', label: 'Underwrite Policy', category: 'Insurance' },
  { id: 'renew_policy', label: 'Renew Policy', category: 'Insurance' },
  { id: 'validate_claim', label: 'Validate Claim', category: 'Insurance' },
  { id: 'approve_claim', label: 'Approve Claim', category: 'Insurance' },
  { id: 'reject_claim', label: 'Reject Claim', category: 'Insurance' },
  { id: 'monitor_policy', label: 'Monitor Policy', category: 'Insurance' },
  // ── Reporting ─────────────────────────────────────────
  { id: 'generate_financial_report', label: 'Gen Financial Report', category: 'Reporting' },
  { id: 'generate_regulatory_report', label: 'Gen Reg Report', category: 'Reporting' },
  { id: 'consolidate_accounts', label: 'Consolidate Accounts', category: 'Reporting' },
  { id: 'generate_tax_report', label: 'Gen Tax Report', category: 'Reporting' },
  { id: 'generate_management_report', label: 'Gen Mgmt Report', category: 'Reporting' },
  { id: 'validate_report', label: 'Validate Report', category: 'Reporting' },
  { id: 'distribute_report', label: 'Distribute Report', category: 'Reporting' },
  { id: 'archive_report', label: 'Archive Report', category: 'Reporting' },
  { id: 'generate_board_report', label: 'Gen Board Report', category: 'Reporting' },
  { id: 'track_kpi', label: 'Track Kpi', category: 'Reporting' },
  // ── Risk ──────────────────────────────────────────────
  { id: 'assess_operational_risk', label: 'Assess Operational Risk', category: 'Risk' },
  { id: 'assess_credit_risk', label: 'Assess Credit Risk', category: 'Risk' },
  { id: 'monitor_concentration_risk', label: 'Monitor Concentration Risk', category: 'Risk' },
  { id: 'stress_test', label: 'Stress Test', category: 'Risk' },
  { id: 'calculate_capital_adequacy', label: 'Calculate Capital Adequacy', category: 'Risk' },
  { id: 'monitor_limit_breach', label: 'Monitor Limit Breach', category: 'Risk' },
  { id: 'generate_risk_report', label: 'Gen Risk Report', category: 'Risk' },
  { id: 'assess_model_risk', label: 'Assess Model Risk', category: 'Risk' },
  { id: 'track_risk_appetite', label: 'Track Risk Appetite', category: 'Risk' },
  { id: 'escalate_risk', label: 'Escalate Risk', category: 'Risk' },
  // ── General ─────────────────────────────────────────────────────
  { id: 'custom', label: 'Custom', category: 'General' },
];

const INTENT_CATEGORIES = ['All', 'Payments', 'Lending', 'AP/AR', 'Treasury', 'Fraud', 'Compliance', 'Procurement', 'Investments', 'Customer Ops', 'Reconciliation', 'Billing', 'Insurance', 'Reporting', 'Risk', 'General'];



// ── Default payload — control plane focused ───────────────────────────────────
// Shows budget ceiling, policy rules, and constraints — the actual product.
const DEFAULT = JSON.stringify({
  intentType: 'fraud_detection',
  objective: {
    description: 'Analyse the transaction provided for fraud signals. Return ONLY valid JSON — no markdown, no code fences.\n\nReturn this schema:\n{\n  "riskScore": number,\n  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",\n  "riskFactors": [string],\n  "recommendation": "APPROVE" | "REVIEW" | "DECLINE",\n  "reasoning": string\n}',
    userMessage: 'Analyse this transaction for fraud risk: Amount $4,832 to CRYPTO-EXCHANGE at 2AM from new device in Kyrgyzstan. VPN detected. Account normally used in Hyderabad.',
  },
  constraints: {
    maxRetries:    3,
    timeoutSeconds: 30,
    maxLatencyMs:  10000,
  },
  budget: {
    ceilingUsd: 0.05,
    currency:   'USD',
  },
  policy: {
    allowedModels:      ['gpt-4o-mini', 'claude-haiku-3'],
    blockTopics:        [],
    requireHumanReview: false,
  },
}, null, 2);

// ── Example intents — SATISFIED and VIOLATED ─────────────────────────────────
// These two payloads populate every card on the IntentDetail page.
// SATISFIED: all constraints are achievable — intent completes cleanly.
// VIOLATED:  budget ceiling is set below realistic cost — will be exceeded.

const EXAMPLE_SATISFIED = {
  intentType: 'fraud_detection',
  objective: {
    description:     'Analyse this payment transaction for fraud signals and return a risk score with reasoning',
    userMessage:     'Transaction TXN-20260420-084521: $4,832 wire transfer to an overseas account, initiated at 02:14 AM, from a device not seen before. Analyse fraud risk.',
    fintechCategory: 'FRAUD',
    riskLevel:       'HIGH',
    sourceSystem:    'payment-gateway-v3',
    transactionRef:  'TXN-20260420-084521',
  },
  constraints: {
    maxRetries:          2,
    timeoutSeconds:      30,
    maxLatencyMs:        2000,
    maxDriftThreshold:   0.20,
  },
  budget: {
    ceilingUsd: 0.50,
    currency:   'USD',
  },
  policy: {
    allowedModels:      ['gpt-4o-mini', 'claude-haiku-3'],
    blockTopics:        ['personal_data_retention'],
    requireHumanReview: false,
    auditLevel:         'STANDARD',
    driftThreshold:     0.20,
    alertOnDrift:       true,
  },
};

const EXAMPLE_VIOLATED = {
  intentType: 'fraud_detection',
  objective: {
    description:     'Analyse this payment transaction for fraud signals and return a risk score with reasoning',
    fintechCategory: 'FRAUD',
    riskLevel:       'HIGH',
    sourceSystem:    'payment-gateway-v3',
    transactionRef:  'TXN-20260420-084521',
  },
  constraints: {
    maxRetries:          0,
    timeoutSeconds:      1,
    maxLatencyMs:        50,
    maxDriftThreshold:   0.01,
  },
  budget: {
    ceilingUsd: 0.00001,
    currency:   'USD',
  },
  policy: {
    allowedModels:      ['gpt-4o-mini'],
    blockTopics:        ['personal_data_retention', 'fraud', 'risk', 'transaction'],
    requireHumanReview: false,
    auditLevel:         'IMMUTABLE',
    driftThreshold:     0.01,
    alertOnDrift:       true,
  },
};

// ── Payload templates ─────────────────────────────────────────────────────────
const TEMPLATES = {
  budget_enforcement: {
    label: 'Budget enforcement',
    icon:  '💰',
    description: 'Hard ceiling — intent fails rather than overruns budget',
    payload: {
      intentType: 'chat',
      objective:  { description: 'Summarise the quarterly earnings report' },
      constraints:{ maxRetries: 2, timeoutSeconds: 15 },
      budget:     { ceilingUsd: 0.01, currency: 'USD' },
      policy:     { allowedModels: ['gpt-4o-mini', 'claude-haiku-3'] },
    },
  },
  policy_block: {
    label: 'Policy + topic block',
    icon:  '🛡️',
    description: 'Blocks response if blocked topic is detected in output',
    payload: {
      intentType: 'chat',
      objective:  { description: 'Help the user with their account query' },
      constraints:{ maxRetries: 3, timeoutSeconds: 30 },
      budget:     { ceilingUsd: 0.05, currency: 'USD' },
      policy: {
        allowedModels:      ['gpt-4o-mini'],
        blockTopics:        ['competitor_products', 'pricing_promises'],
        requireHumanReview: false,
        driftThreshold:     0.15,
      },
    },
  },
  fraud_signal: {
    label: 'Fraud detection',
    icon:  '🔍',
    description: 'High-stakes intent — routes to premium, flags for review',
    payload: {
      intentType: 'fraud_detection',
      objective: {
        description:     'Analyse transaction pattern for fraud signals',
        fintechCategory: 'FRAUD',
        riskLevel:       'HIGH',
      },
      constraints:{ maxRetries: 1, timeoutSeconds: 6, maxLatencyMs: 10000 },
      budget:     { ceilingUsd: 0.20, currency: 'USD' },
      policy: {
        requireHumanReview: true,
        auditLevel:         'IMMUTABLE',
        alertOnDrift:       true,
      },
    },
  },
  hitl_gate: {
    label: 'Human-in-the-loop',
    icon:  '👤',
    description: 'Pauses execution for human approval before completing',
    payload: {
      intentType: 'compliance_check',
      objective: {
        description:     'Review loan application for regulatory compliance',
        fintechCategory: 'COMPLIANCE',
      },
      constraints:{ maxRetries: 0, timeoutSeconds: 300 },
      budget:     { ceilingUsd: 0.50, currency: 'USD' },
      policy: {
        requireHumanReview: true,
        humanReviewTimeout: 3600,
        escalationEmail:    'compliance@yourcompany.com',
      },
    },
  },
  byok_routing: {
    label: 'BYOK routing',
    icon:  '🔑',
    description: 'Routes to your own API key — 1 credit orchestration only',
    payload: {
      intentType: 'chat',
      objective:  { description: 'Process using my Anthropic contract key' },
      constraints:{ maxRetries: 3, timeoutSeconds: 30 },
      budget:     { ceilingUsd: 0.10, currency: 'USD' },
      adapter: {
        type:     'byok',
        provider: 'anthropic',
        model:    'claude-haiku-3',
      },
    },
  },
  byom_routing: {
    label: 'BYOM routing',
    icon:  '⚙️',
    description: 'Routes to your self-hosted model — zero data egress',
    payload: {
      intentType: 'classification',
      objective:  { description: 'Classify document using on-prem model' },
      constraints:{ maxRetries: 2, timeoutSeconds: 15, maxLatencyMs: 10000 },
      budget:     { ceilingUsd: 0.01, currency: 'USD' },
      adapter: {
        type:         'byom',
        endpointName: 'my-layoutlmv3-endpoint',
      },
    },
  },
};

// ── Model tier selector ───────────────────────────────────────────────────────
function ModelTierSelector({ selected, onChange, navigate }) {
  const tiers = Object.entries(MODEL_TIERS);

  return (
    <Card>
      <CardHeader><CardTitle>Adapter tier</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
          {tiers.map(([key, tier]) => {
            const isByok = key === 'byok';
            const isByom = key === 'byom';
            const isSpecial = isByok || isByom;

            return (
              <button key={key} type="button" onClick={() => onChange(key)}
                className="text-left p-3 rounded-xl border-2 transition-all relative"
                style={{
                  borderColor:     selected === key ? tier.color : '#e2e8f0',
                  backgroundColor: selected === key ? tier.bg    : 'white',
                }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: tier.color }}>
                    {isSpecial && (isByok ? <Key size={9} className="inline mr-1" /> : <Cpu size={9} className="inline mr-1" />)}
                    {tier.label}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: tier.color }}>
                    {tier.credits} cr
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">{tier.models}</p>
                {isSpecial && (
                  <button
                    onClick={e => { e.stopPropagation(); navigate('/billing?tab=byok'); }}
                    className="mt-1.5 text-[10px] underline"
                    style={{ color: tier.color }}>
                    Configure →
                  </button>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-400">
          BYOK and BYOM charge 1 credit for orchestration only — your provider or model handles execution.
        </p>
      </CardContent>
    </Card>
  );
}

// ── Template browser ──────────────────────────────────────────────────────────
function TemplateBrowser({ onLoad }) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <button className="w-full" onClick={() => setOpen(o => !o)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-slate-500" />
              <CardTitle>Example intents</CardTitle>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                {Object.keys(TEMPLATES).length + 2} examples
              </span>
            </div>
            {open
              ? <ChevronUp size={14} className="text-slate-400" />
              : <ChevronDown size={14} className="text-slate-400" />}
          </div>
        </CardHeader>
      </button>

      {open && (
        <CardContent className="pt-0 space-y-4">

          {/* ── Featured: SATISFIED + VIOLATED ── */}
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
              See positive &amp; negative results
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

              {/* SATISFIED example */}
              <button type="button"
                onClick={() => { onLoad(EXAMPLE_SATISFIED); setOpen(false); }}
                className="text-left p-3 rounded-xl border-2 border-green-200 bg-green-50 hover:border-green-400 hover:bg-green-100 transition-all group">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">✓</span>
                  </span>
                  <span className="text-xs font-bold text-green-800">SATISFIED example</span>
                </div>
                <p className="text-[10px] text-green-700 leading-snug mb-2">
                  Fraud detection intent with realistic budget ($0.50), generous constraints, and achievable policy rules — completes successfully.
                </p>
                <div className="flex flex-wrap gap-1">
                  {['budget: $0.50', 'retries: 2', 'timeout: 30s', 'drift: 0.20'].map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-green-200 text-green-800 font-medium">{t}</span>
                  ))}
                </div>
              </button>

              {/* VIOLATED example */}
              <button type="button"
                onClick={() => { onLoad(EXAMPLE_VIOLATED); setOpen(false); }}
                className="text-left p-3 rounded-xl border-2 border-red-200 bg-red-50 hover:border-red-400 hover:bg-red-100 transition-all group">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">✕</span>
                  </span>
                  <span className="text-xs font-bold text-red-800">VIOLATED example</span>
                </div>
                <p className="text-[10px] text-red-700 leading-snug mb-2">
                  Same intent — budget set to $0.00001, timeout 1s, topic blocks cover the actual content. Will breach constraints and fail.
                </p>
                <div className="flex flex-wrap gap-1">
                  {['budget: $0.00001', 'retries: 0', 'timeout: 1s', 'drift: 0.01'].map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-red-200 text-red-800 font-medium">{t}</span>
                  ))}
                </div>
              </button>

            </div>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-slate-100" />

          {/* ── Other templates ── */}
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Feature templates
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(TEMPLATES).map(([key, tmpl]) => (
                <button key={key} type="button"
                  onClick={() => { onLoad(tmpl.payload); setOpen(false); }}
                  className="text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{tmpl.icon}</span>
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                      {tmpl.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">{tmpl.description}</p>
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center">
            For domain-specific intent templates →{' '}
            <button
              onClick={() => window.location.href = '/fintech-intents'}
              className="text-blue-500 underline">
              browse 264 fintech intents
            </button>
          </p>
        </CardContent>
      )}
    </Card>
  );
}

// ── Policy summary strip ──────────────────────────────────────────────────────
// Shows what governance rules are active in the current payload at a glance
function PolicyStrip({ json }) {
  let policy = null;
  let budget = null;
  let constraints = null;

  try {
    const parsed  = JSON.parse(json);
    policy        = parsed.policy;
    budget        = parsed.budget;
    constraints   = parsed.constraints;
  } catch { return null; }

  const rules = [];

  if (budget?.ceilingUsd)
    rules.push({ icon: '💰', label: `$${budget.ceilingUsd} ceiling`, color: '#16a34a' });

  if (constraints?.maxRetries !== undefined)
    rules.push({ icon: '🔁', label: `${constraints.maxRetries} retries`, color: '#2563eb' });

  if (constraints?.maxLatencyMs)
    rules.push({ icon: '⏱', label: `${constraints.maxLatencyMs}ms max`, color: '#0d9488' });

  if (policy?.requireHumanReview)
    rules.push({ icon: '👤', label: 'HITL gate', color: '#7c3aed' });

  if (policy?.blockTopics?.length)
    rules.push({ icon: '🚫', label: `${policy.blockTopics.length} blocked topics`, color: '#dc2626' });

  if (policy?.driftThreshold)
    rules.push({ icon: '📊', label: `Drift ≤ ${policy.driftThreshold}`, color: '#d97706' });

  if (!rules.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-1">
      {rules.map(r => (
        <span key={r.label}
          className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border"
          style={{ color: r.color, borderColor: r.color + '40', backgroundColor: r.color + '10' }}>
          {r.icon} {r.label}
        </span>
      ))}
    </div>
  );
}

// ── Intent type selector — free-form + suggestions ───────────────────────────
// intentType is a free-form string in the Quarkus backend (no enum).
// Chips are quick-select shortcuts only — user can type anything.
function IntentTypeSelector({ json, onSelect }) {
  const [customVal, setCustomVal] = useState('');

  const currentType = (() => {
    try { return JSON.parse(json)?.intentType ?? ''; }
    catch { return ''; }
  })();

  // Derive category from current intentType — default Fintech
  const matchedCategory = (() => {
    if (!currentType) return 'All';
    const match = INTENT_SUGGESTIONS.find(t => t.id === currentType);
    return match ? match.category : 'All';
  })();

  const [catFilter, setCatFilter] = useState(matchedCategory);

  // Sync category tab whenever intentType changes
  useEffect(() => {
    setCatFilter(matchedCategory);
  }, [matchedCategory]);

  const filtered = catFilter === 'All'
    ? INTENT_SUGGESTIONS
    : INTENT_SUGGESTIONS.filter(t => t.category === catFilter);

  function handleCustomSubmit(e) {
    e.preventDefault();
    const val = customVal.trim().toLowerCase().replace(/\s+/g, '_');
    if (val) { onSelect(val); setCustomVal(''); }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle>Intent type</CardTitle>
            <p className="text-[10px] text-slate-400 mt-0.5 font-normal">
              Free-form string — type anything or pick a suggestion
            </p>
          </div>
          <div className="flex gap-1">
            {INTENT_CATEGORIES.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                  catFilter === c
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Suggestion chips */}
        <div className="flex gap-1.5 flex-wrap">
          {filtered.map(t => {
            const sel = currentType === t.id;
            return (
              <button key={t.id} type="button" onClick={() => onSelect(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  sel
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                }`}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Free-form input */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="text"
            value={customVal}
            onChange={e => setCustomVal(e.target.value)}
            placeholder={currentType ? `Current: ${currentType}` : 'or type any intent type…'}
            className="flex-1 text-xs font-mono border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
          <button type="submit"
            disabled={!customVal.trim()}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
            Set
          </button>
        </form>

        <p className="text-[10px] text-slate-400 leading-relaxed">
          The backend accepts any string. For domain-specific types used in your 264 fintech intents,{' '}
          <button
            onClick={() => window.location.href = '/fintech-intents'}
            className="text-blue-500 underline">
            browse the intent library →
          </button>
        </p>
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Playground({ keycloak }) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [searchParams] = useSearchParams();
  const { balance, isEmpty, deductCredits, refundCredits, reload } = useCredits();

  // Pre-fill from Intent Library "Try in Playground" navigation state
  const initialJson = location.state?.intentPayload ?? DEFAULT;

  const [json,       setJson]       = useState(initialJson);
  const [jsonErr,    setJsonErr]    = useState(null);
  const [iKey,       setIKey]       = useState(uuidv4);
  const [tier,       setTier]       = useState('economy');
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState(null);
  const [copied,     setCopied]     = useState(false);
  const [creditCost, setCreditCost] = useState(null);
  const [showRaw,    setShowRaw]    = useState(false);
  const [execResult, setExecResult] = useState(null);   // execution record after completion
  const [intentData, setIntentData] = useState(null);   // intent detail after completion
  const pollRef = useRef(null);

  // When navigated from Intent Library via ?intent=name query param,
  // fetch the examplePayload from the API and pre-fill the editor
  useEffect(() => {
    const intentName = searchParams.get('intent');
    if (!intentName || location.state?.intentPayload) return; // skip if already have payload
    request(keycloak, `/intent-library/fintech/search?q=${intentName}`)
      .then(results => {
        const match = Array.isArray(results)
          ? results.find(r => r.name === intentName)
          : null;
        if (match?.examplePayload) {
          setJson(JSON.stringify(match.examplePayload, null, 2));
        }
      })
      .catch(() => {}); // silently fall back to DEFAULT
  }, [searchParams, keycloak]);

  // ── Helpers ─────────────────────────────────────────────────────────────

  function handleChange(e) {
    setJson(e.target.value);
    try   { JSON.parse(e.target.value); setJsonErr(null); }
    catch { setJsonErr('Invalid JSON'); }
  }

  function loadTemplate(payload) {
    // Detect best tier from adapter hint in template
    if (payload.adapter?.type === 'byok') setTier('byok');
    else if (payload.adapter?.type === 'byom') setTier('byom');
    else if (payload.policy?.requireHumanReview) setTier('premium');
    setJson(JSON.stringify(payload, null, 2));
    setJsonErr(null);
    setResult(null);
    setError(null);
  }

  function setIntentType(id) {
    try {
      const p = JSON.parse(json);
      p.intentType = id;
      setJson(JSON.stringify(p, null, 2));
      setJsonErr(null);
    } catch { /**/ }
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (isEmpty) { setError('No credits remaining. Top up to continue.'); return; }
    setError(null); setResult(null); setCreditCost(null);

    let body;
    try   { body = JSON.parse(json); }
    catch { setError('Fix the JSON before submitting'); return; }

    body._modelTier = tier;
    setLoading(true);

    // Optimistic deduct for immediate UI feedback.
    // The delayed reload() below re-syncs from the real DB balance
    // once the intent pipeline has completed and written the ledger.
    // An immediate reload() would race with the async pipeline and
    // fetch the old balance, reverting the optimistic deduction.
    deductCredits(tier);

    try {
      const id = await submitIntent(keycloak, body);
      const intentId = String(id);
      setResult(intentId);
      setCreditCost(MODEL_TIERS[tier].credits);
      setExecResult(null);
      setIntentData(null);

      // Poll for execution result every 2s until terminal
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts++;
        if (attempts > 30) { clearInterval(pollRef.current); return; } // 60s max
        try {
          const [intentDetail, execs] = await Promise.all([
            getIntent(keycloak, intentId),
            getExecutionsByIntent(keycloak, intentId),
          ]);
          if (intentDetail) setIntentData(intentDetail);
          const completed = (execs ?? []).find(e =>
            e.status === 'COMPLETED' || e.status === 'SUCCESS' || e.phase === 'COMPLETED'
          ) ?? execs?.[0];
          if (completed?.responseText) {
            setExecResult(completed);
            clearInterval(pollRef.current);
            reload();
          } else if (intentDetail?.terminal) {
            // Intent terminated — could be VIOLATED (SLA/budget breach)
            const sat = intentDetail.satisfactionState;
            if (sat === 'VIOLATED') {
              const reason = intentDetail.violationReason ?? intentDetail.violatedConstraint ?? 'Constraint violated';
              setError(`Intent violated: ${reason}. Check your maxLatencyMs and budget constraints.`);
              refundCredits(tier);
            }
            setExecResult(completed ?? null);
            clearInterval(pollRef.current);
            reload();
          } else if (
            intentDetail?.satisfactionState === 'UNKNOWN' &&
            intentDetail?.phase === 'COMPLETED'
          ) {
            // Intent completed but parked for human review (requireHumanReview:true)
            // terminal=false so normal terminal check doesn't fire
            setExecResult(completed ?? null);
            clearInterval(pollRef.current);
            reload();
          }
        } catch { /* ignore poll errors */ }
      }, 2000);
    } catch (e) {
      refundCredits(tier);
      // Parse SLA / constraint violation errors into friendly messages
      const msg = e.message ?? '';
      if (msg.includes('SLAException') || msg.includes('Latency constraint violated')) {
        const match = msg.match(/actual=(\d+)ms.*limit=(\d+)ms/);
        if (match) {
          setError(`Latency constraint violated — LLM took ${match[1]}ms but maxLatencyMs is ${match[2]}ms. Increase maxLatencyMs (e.g. 10000) to allow more time.`);
        } else {
          setError('Latency constraint violated — the LLM response exceeded your maxLatencyMs limit. Increase it to 10000ms or higher.');
        }
      } else if (msg.includes('BudgetExceeded') || msg.includes('budget')) {
        setError('Budget exceeded — increase ceilingUsd in the intent payload.');
      } else if (msg.includes('500') || msg.includes('Internal Server Error')) {
        setError('Intent submission failed — check your constraints (maxLatencyMs, budget ceiling). Try increasing maxLatencyMs to 10000.');
      } else {
        setError(msg || 'Intent submission failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(result ?? '');
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const tierData  = MODEL_TIERS[tier];
  const canSubmit = !jsonErr && !loading && !isEmpty && balance !== null;

  // Show floating bar once user has a valid intent type selected
  const hasIntent = (() => {
    try {
      const parsed = JSON.parse(json);
      return !!(parsed?.intentType && parsed.intentType !== '' && parsed?.objective?.userMessage);
    } catch { return false; }
  })();

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
    <Page
      title="Playground"
      subtitle="Test budget enforcement, policy rules and adapter routing in real time"
      action={result && (
        <Button variant="secondary" size="sm"
          onClick={() => { setResult(null); setCreditCost(null); setIKey(uuidv4()); }}>
          <RefreshCw size={13} /> New intent
        </Button>
      )}>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── Left column ── */}
        <div className="space-y-4">

          {/* Adapter tier */}
          <ModelTierSelector selected={tier} onChange={setTier} navigate={navigate} />

          {/* Intent type */}
          <IntentTypeSelector json={json} onSelect={setIntentType} />

          {/* Template browser */}
          <TemplateBrowser onLoad={loadTemplate} />

          {/* Payload editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Intent payload</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">JSON</span>
                  <button
                    onClick={() => setShowRaw(v => !v)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 border border-slate-200 rounded px-1.5 py-0.5">
                    {showRaw ? 'Collapse' : 'Expand'}
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <textarea
                value={json}
                onChange={handleChange}
                rows={showRaw ? 24 : 13}
                className="w-full font-mono text-xs p-4 resize-none focus:outline-none rounded-b-xl text-slate-700 bg-slate-50"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              />
              {jsonErr && <p className="px-4 pb-3 text-xs text-red-500">{jsonErr}</p>}
            </CardContent>
          </Card>

          {/* Active governance rules — live preview from payload */}
          <PolicyStrip json={json} />

          {/* Idempotency key */}
          <Card>
            <CardHeader><CardTitle>Request metadata</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-600">Idempotency key</label>
                <button onClick={() => setIKey(uuidv4())}
                  className="text-xs text-blue-600 flex items-center gap-1">
                  <RefreshCw size={11} /> Regenerate
                </button>
              </div>
              <input readOnly value={iKey}
                className="w-full text-xs font-mono border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-500"
                style={{ fontFamily: "'JetBrains Mono', monospace" }} />
            </CardContent>
          </Card>

          {/* Governance summary strip */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
              What DecisionMesh enforces on this intent
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
              {[
                { icon: <Shield size={10} />,      label: 'Budget ceiling',       color: '#16a34a' },
                { icon: <RotateCcw size={10} />,   label: 'Retry policy',         color: '#2563eb' },
                { icon: <Clock size={10} />,        label: 'Latency constraint',   color: '#0d9488' },
                { icon: <Shield size={10} />,       label: 'Policy rules',         color: '#7c3aed' },
                { icon: <AlertTriangle size={10} />,label: 'Drift detection',      color: '#d97706' },
                { icon: <BookOpen size={10} />,     label: 'Immutable audit log',  color: '#475569' },
              ].map(({ icon, label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span style={{ color }}>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Credit cost + submit — hidden when floating bar is visible */}
          <div className="space-y-2" style={{ display: hasIntent && !result ? 'none' : 'block' }}>
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-sm">
                <Zap size={13} style={{ color: tierData.color }} />
                <span className="text-slate-600">
                  Cost:{' '}
                  <strong style={{ color: tierData.color }}>
                    {tierData.credits} credit{tierData.credits !== 1 ? 's' : ''}
                  </strong>
                  <span className="text-xs text-slate-400 ml-1">({tierData.label})</span>
                </span>
              </div>
              {balance !== null && (
                <span className="text-xs text-slate-400">
                  Balance:{' '}
                  <strong style={{
                    color: balance <= 0 ? '#dc2626' : balance < 50 ? '#d97706' : '#16a34a',
                  }}>
                    {balance?.toLocaleString()}
                  </strong>
                </span>
              )}
            </div>

            <Button className="w-full" size="lg" loading={loading} disabled={!canSubmit} onClick={handleSubmit}>
              <Send size={14} />
              {isEmpty ? 'No credits — top up to submit' : 'Submit intent'}
            </Button>

            {isEmpty && (
              <button onClick={() => navigate('/billing')}
                className="w-full text-xs text-blue-600 underline text-center">
                Buy credits or upgrade plan →
              </button>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* ── Right column — execution result ── */}
        <div>
          {result ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Intent submitted</CardTitle>
                  {creditCost && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: tierData.bg, color: tierData.color }}>
                      -{creditCost} credit{creditCost !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={copy}>
                    <Copy size={12} />{copied ? 'Copied!' : 'Copy ID'}
                  </Button>
                  <Button variant="secondary" size="sm"
                    onClick={() => navigate(`/intents/${result}`)}>
                    <ExternalLink size={12} /> Detail
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-700 font-medium mb-1">Intent ID</p>
                    <p className="font-mono text-sm text-green-800 break-all"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {result}
                    </p>
                  </div>
                  {intentData && (
                    <div className="flex items-center gap-1.5 ml-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        intentData.satisfactionState === 'SATISFIED'
                          ? 'bg-green-100 text-green-700'
                          : intentData.satisfactionState === 'VIOLATED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {intentData.satisfactionState ?? intentData.phase ?? 'RUNNING'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Model response — shown as soon as available */}
                {execResult ? (
                  <div className="mb-4 space-y-3">
                    {/* Metrics row */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Quality', value: execResult.qualityScore != null ? (execResult.qualityScore * 100).toFixed(0) + '%' : '—', color: execResult.qualityScore >= 0.8 ? '#16a34a' : execResult.qualityScore >= 0.6 ? '#d97706' : '#94a3b8', bg: '#f8fafc' },
                        { label: 'Halluc. risk', value: execResult.hallucinationRisk != null ? (execResult.hallucinationRisk * 100).toFixed(0) + '%' : '—', color: execResult.hallucinationRisk <= 0.2 ? '#16a34a' : execResult.hallucinationRisk <= 0.5 ? '#d97706' : '#dc2626', bg: '#f8fafc' },
                        { label: 'Latency', value: execResult.latencyMs > 1 ? `${(execResult.latencyMs/1000).toFixed(2)}s` : execResult.latencyMs === 1 ? '< 1ms (cached)' : '—', color: '#2563eb', bg: '#eff6ff' },
                        { label: 'Cost', value: (() => { const c = execResult.costUsd ?? execResult.cost; if (c == null) return '—'; const n = Number(c); return n === 0 ? (execResult.latencyMs === 1 ? '$0 (cached)' : '$0.000000') : `$${n.toFixed(6)}`; })(), color: '#475569', bg: '#f8fafc' },
                      ].map(({ label, value, color, bg }) => (
                        <div key={label} className="rounded-lg p-2 text-center border border-slate-100" style={{ backgroundColor: bg }}>
                          <p className="text-[10px] text-slate-400 mb-0.5">{label}</p>
                          <p className="text-sm font-bold" style={{ color }}>{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Response — smart renderer */}
                    <SmartResponseRenderer
                      responseText={execResult.responseText}
                      intentType={(() => { try { return JSON.parse(json)?.intentType; } catch { return null; } })()}
                    />

                    {/* Model used */}
                    {(execResult.adapterId || execResult.adapterName) && (
                      <p className="text-[10px] text-slate-400 text-right">
                        Model: {execResult.adapterId ?? execResult.adapterName}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 flex items-center gap-2 text-xs text-blue-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Executing — response will appear here…
                  </div>
                )}

                <p className="text-sm font-medium text-slate-700 mb-3">Execution timeline</p>
                <ExecutionTimeline
                  keycloak={keycloak} intentId={result}
                  currentPhase={intentData?.phase ?? 'CREATED'}
                  terminal={intentData?.terminal ?? false}
                  satisfied={intentData?.satisfactionState === 'SATISFIED'}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Empty state */}
              <Card className="flex items-center justify-center min-h-64 border-dashed border-slate-200 bg-transparent shadow-none">
                <div className="text-center text-slate-400 p-8">
                  <Send size={28} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Submit an intent</p>
                  <p className="text-xs mt-1 text-slate-300">
                    The execution timeline appears here
                  </p>
                  <p className="text-xs mt-3 font-semibold" style={{ color: tierData.color }}>
                    {tierData.credits} credit{tierData.credits !== 1 ? 's' : ''} per execution · {tierData.label} tier
                  </p>
                </div>
              </Card>

              {/* What gets enforced — right panel explainer */}
              <Card>
                <CardHeader><CardTitle>What happens when you submit</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        phase: 'Planning',
                        color: '#2563eb',
                        detail: 'DecisionMesh selects the adapter, validates budget ceiling, and builds the execution plan.',
                      },
                      {
                        phase: 'Policy check',
                        color: '#7c3aed',
                        detail: 'Blocked topics, model allow-list, and HITL gate rules are evaluated before any LLM call.',
                      },
                      {
                        phase: 'Execution',
                        color: '#0d9488',
                        detail: 'The intent is dispatched to the adapter. Budget is tracked live. Retries fire on failure.',
                      },
                      {
                        phase: 'Quality scoring',
                        color: '#d97706',
                        detail: 'Output is scored for quality, drift from baseline, and policy compliance.',
                      },
                      {
                        phase: 'Audit log',
                        color: '#475569',
                        detail: 'Every attempt, credit cost, policy outcome and response is written to the immutable ledger.',
                      },
                    ].map(({ phase, color, detail }) => (
                      <div key={phase} className="flex gap-3">
                        <div className="w-1 rounded-full flex-shrink-0 self-stretch" style={{ backgroundColor: color }} />
                        <div>
                          <p className="text-xs font-semibold" style={{ color }}>{phase}</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2">
                    <Key size={12} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      <strong className="text-slate-700">Using BYOK or BYOM?</strong>{' '}
                      Your model or key handles execution — DecisionMesh enforces all of
                      the above governance on top of it for 1 credit.{' '}
                      <button onClick={() => navigate('/billing?tab=byok')}
                        className="text-blue-500 underline">
                        Configure keys →
                      </button>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick links */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Browse 264 intent templates', icon: <BookOpen size={13} />, path: '/fintech-intents', color: '#2563eb' },
                  { label: 'Configure BYOK / BYOM',       icon: <Key size={13} />,      path: '/billing?tab=byok', color: '#d97706' },
                  { label: 'View execution history',      icon: <Clock size={13} />,    path: '/intents',          color: '#0d9488' },
                  { label: 'Policy builder',              icon: <Shield size={13} />,   path: '/policies',         color: '#7c3aed' },
                ].map(({ label, icon, path, color }) => (
                  <button key={label}
                    onClick={() => navigate(path)}
                    className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-left transition-colors group">
                    <span className="p-1.5 rounded-lg flex-shrink-0"
                      style={{ background: color + '15', color }}>
                      {icon}
                    </span>
                    <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 leading-tight">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </Page>
      {/* Floating sticky submit bar — appears when intent is ready */}
      {hasIntent && !result && (
        <div
          className="fixed bottom-3 left-4 z-40 flex items-center justify-between gap-4 px-5 py-2.5 shadow-xl border rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(8px)',
            borderColor: '#e2e8f0',
            right: '120px',
          }}
        >
          {/* Left — intent info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 animate-pulse" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-700 truncate">
                {(() => { try { return JSON.parse(json)?.intentType?.replace(/_/g,' '); } catch { return 'Intent ready'; } })()}
              </span>
              <span className="text-[10px] text-slate-400 ml-2">
                {tierData.credits} cr · {balance} balance
              </span>
            </div>
          </div>

          {/* Right — errors + submit */}
          <div className="flex items-center gap-3 shrink-0">
            {jsonErr && <span className="text-xs text-red-500 font-medium">⚠ Fix JSON</span>}
            {isEmpty && <span className="text-xs text-red-500 font-medium">No credits</span>}
            {loading && <span className="text-xs text-blue-500 animate-pulse">Executing…</span>}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: canSubmit ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : '#94a3b8',
                boxShadow: canSubmit ? '0 2px 8px rgba(37,99,235,0.35)' : 'none',
              }}
            >
              <Send size={13} />
              {isEmpty ? 'No credits' : loading ? 'Submitting…' : 'Submit Intent'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
