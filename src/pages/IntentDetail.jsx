import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, DollarSign, Target, Hash, Clock,
  Cpu, Shield, MessageSquare, AlertTriangle, CheckCircle,
  XCircle, ChevronDown, ChevronUp, Copy, Zap, BarChart2,
  Eye, EyeOff, RotateCcw,
} from 'lucide-react';
import Page from '../components/shared/Page';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, PhaseBadge, SatisfactionBadge, Spinner,
} from '../components/shared';
import ExecutionTimeline from '../components/timeline/ExecutionTimeline';
import { getIntent, getIntentEvents, getExecutionsByIntent, getPolicyEvaluations, listAdapters } from '../utils/api';
import { formatCost, formatDate, formatLatency, shortId, cn } from '../lib/utils';
import ReplayPanel from '../components/replay/ReplayPanel';

// ── helpers ───────────────────────────────────────────────────────────────────

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-start py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-400 w-40 shrink-0 pt-0.5">{label}</span>
      <span className={cn('text-sm text-slate-700 font-medium flex-1 break-all',
        mono && 'font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs')}
        style={mono ? { fontFamily: "'JetBrains Mono', monospace" } : {}}>
        {value}
      </span>
    </div>
  );
}

function SectionHeader({ icon, title, badge }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <CardTitle>{title}</CardTitle>
      {badge && (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
          {badge}
        </span>
      )}
    </div>
  );
}

// ── Policy outcome card ───────────────────────────────────────────────────────
function PolicyOutcomeCard({ policyEvals, events, satisfactionState, violationReason, constraints }) {
  const isViolated = satisfactionState === 'VIOLATED';
  const isSatisfied = satisfactionState === 'SATISFIED';

  // Real data from policy_evaluations table
  const hasEvals   = policyEvals && policyEvals.length > 0;
  const blocked    = (policyEvals ?? []).filter(e => e.result === 'BLOCKED');
  const warnings   = (policyEvals ?? []).filter(e => e.result === 'WARNING');
  const allowed    = (policyEvals ?? []).filter(e => e.result === 'ALLOWED');
  const wasBlocked = blocked.length > 0;

  // Phase groupings
  const preEvals  = (policyEvals ?? []).filter(e =>
    e.phase === 'PRE_SUBMISSION' || e.phase === 'PRE_EXECUTION');
  const postEvals = (policyEvals ?? []).filter(e => e.phase === 'POST_EXECUTION');

  // Derive specific hints from violation + constraints (fallback when no evals yet)
  function deriveViolationHint() {
    const r = (violationReason ?? '').toLowerCase();
    const hints = [];
    if (r.includes('retry') || r.includes('sla')) {
      const max = constraints?.maxRetries;
      hints.push(max === 0
        ? 'maxRetries is 0 — set constraints.maxRetries ≥ 1 to allow retries'
        : `maxRetries = ${max} — retries were exhausted`);
    }
    if (r.includes('budget') || r.includes('ceiling') || r.includes('cost'))
      hints.push('budget.ceilingUsd is too low — increase it to cover the model cost');
    if (r.includes('timeout')) {
      const t = constraints?.timeoutSeconds;
      hints.push(t ? `timeoutSeconds = ${t}s — LLM calls typically need 5–30s`
        : 'timeoutSeconds is too low — increase constraints.timeoutSeconds');
    }
    if (r.includes('latency'))
      hints.push('maxLatencyMs is too tight — most LLM adapters need ≥ 400ms');
    if (r.includes('topic') || r.includes('block'))
      hints.push('A blocked topic appeared in the response — review policy.blockTopics');
    if (r.includes('model') || r.includes('allowed'))
      hints.push('The adapter model is not in policy.allowedModels');
    if (r.includes('drift'))
      hints.push('Output drift exceeded driftThreshold — raise the threshold or improve adapter quality');
    if (r.includes('inject'))
      hints.push('Prompt injection was detected — review the intent objective');
    if (hints.length === 0 && isViolated && constraints) {
      if (constraints.maxRetries === 0) hints.push('maxRetries is 0 — no retries allowed');
      if (constraints.timeoutSeconds <= 2) hints.push(`timeoutSeconds is only ${constraints.timeoutSeconds}s — too short for LLM execution`);
      if (constraints.maxLatencyMs && constraints.maxLatencyMs <= 100) hints.push(`maxLatencyMs is only ${constraints.maxLatencyMs}ms — too tight`);
    }
    return hints;
  }
  const specificHints = deriveViolationHint();

  const RESULT_COLORS = {
    BLOCKED: 'bg-red-50 text-red-700 border-red-200',
    WARNING: 'bg-amber-50 text-amber-700 border-amber-200',
    ALLOWED: 'bg-green-50 text-green-700 border-green-200',
  };
  const RESULT_ICONS = {
    BLOCKED: <XCircle size={12} />,
    WARNING: <AlertTriangle size={12} />,
    ALLOWED: <CheckCircle size={12} />,
  };

  return (
    <Card>
      <CardHeader>
        <SectionHeader
          icon={<Shield size={13} className="text-slate-400" />}
          title="Policy outcome"
          badge={
            !hasEvals && !isViolated ? 'No evaluations' :
            wasBlocked ? `${blocked.length} blocked` :
            warnings.length > 0 ? `${warnings.length} warning${warnings.length !== 1 ? 's' : ''}` :
            isSatisfied ? 'All passed' : undefined
          }
        />
      </CardHeader>
      <CardContent>

        {/* Overall verdict banner */}
        <div className={cn(
          'flex items-start gap-2.5 p-3 rounded-lg mb-3 border',
          isViolated   ? 'bg-red-50 text-red-800 border-red-200'
          : isSatisfied ? 'bg-green-50 text-green-800 border-green-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
        )}>
          <div className="shrink-0 mt-0.5">
            {isViolated   ? <XCircle size={15} />
            : isSatisfied ? <CheckCircle size={15} />
                          : <Shield size={15} />}
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold leading-tight">
              {isViolated
                ? (violationReason ?? (wasBlocked && blocked[0]?.blockReason)
                    ?? 'Intent violated — constraints not met')
                : isSatisfied ? 'All policy constraints satisfied'
                : 'Awaiting evaluation'}
            </p>
          </div>
        </div>

        {/* Specific actionable hints */}
        {isViolated && specificHints.length > 0 && (
          <div className="mb-3 space-y-1.5">
            {specificHints.map((hint, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle size={11} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 leading-snug"><strong>Fix:</strong> {hint}</p>
              </div>
            ))}
          </div>
        )}

        {/* Real policy evaluation rows */}
        {hasEvals && (
          <div className="space-y-2 mb-3">
            {[
              { label: 'Pre-execution checks', evals: preEvals },
              { label: 'Post-execution checks', evals: postEvals },
            ].filter(g => g.evals.length > 0).map(group => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {group.label}
                </p>
                {group.evals.map((pe, i) => (
                  <div key={pe.id ?? i}
                    className={cn(
                      'flex items-start justify-between py-2 px-3 rounded-lg border mb-1.5 text-xs',
                      RESULT_COLORS[pe.result] ?? 'bg-slate-50 text-slate-600 border-slate-100'
                    )}>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">
                        {RESULT_ICONS[pe.result] ?? <Shield size={12} />}
                      </span>
                      <div>
                        <span className="font-medium">
                          {pe.result ?? 'UNKNOWN'}
                          {pe.enforcementMode && pe.enforcementMode !== 'ENFORCE' && (
                            <span className="ml-1.5 font-normal opacity-70">
                              ({pe.enforcementMode?.toLowerCase().replace(/_/g, ' ')})
                            </span>
                          )}
                        </span>
                        {pe.blockReason && (
                          <p className="mt-0.5 opacity-80 leading-snug">{pe.blockReason}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-xs opacity-60 shrink-0 ml-2 text-right">
                      {pe.attemptNumber != null && <div>attempt #{pe.attemptNumber}</div>}
                      {pe.evaluatedAt && (
                        <div>{formatDate(pe.evaluatedAt)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Constraints at-a-glance for violated intents */}
        {isViolated && constraints && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Submitted constraint values
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'maxRetries',     value: constraints.maxRetries,         warn: constraints.maxRetries === 0 },
                { label: 'timeoutSeconds', value: constraints.timeoutSeconds != null ? `${constraints.timeoutSeconds}s` : '—', warn: constraints.timeoutSeconds <= 2 },
                { label: 'maxLatencyMs',   value: constraints.maxLatencyMs != null ? `${constraints.maxLatencyMs}ms` : '—', warn: constraints.maxLatencyMs != null && constraints.maxLatencyMs <= 100 },
                { label: 'maxDrift',       value: constraints.maxDriftThreshold ?? '—', warn: constraints.maxDriftThreshold != null && constraints.maxDriftThreshold <= 0.01 },
              ].map(({ label, value, warn }) => (
                <div key={label}
                  className={cn(
                    'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs border',
                    warn ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-100 text-slate-600'
                  )}>
                  <span className="font-mono">{label}</span>
                  <span className="font-semibold">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasEvals && !isViolated && !isSatisfied && (
          <p className="text-sm text-slate-400 text-center py-3">
            Policy evaluations appear when the intent reaches EXECUTING phase.
          </p>
        )}

      </CardContent>
    </Card>
  );
}

// ── Adapter card ──────────────────────────────────────────────────────────────
function AdapterCard({ events, adapters, executions }) {
  // Try events first (adapterId from phase transition events)
  const execEvent = (events ?? []).find(e =>
    e.phaseTo === 'EXECUTING' || e.phaseFrom === 'EXECUTING' || e.adapterId
  );
  const eventAdapterId = execEvent?.adapterId;

  // Fall back to execution record — adapterId may be null if adapter wasn't
  // registered in DB, but adapterName is joined from the adapters table
  const execRecord = (executions ?? []).find(e =>
    e.status === 'SUCCESS' || e.status === 'COMPLETED'
  ) ?? executions?.[0];

  const adapterId   = eventAdapterId ?? execRecord?.adapterId;
  const adapterName = execRecord?.adapterName;

  // Look up full adapter from the adapters list.
  // Falls back to the only available adapter when the stored adapterId is stale
  // (e.g. intent ran before the real DB adapter was registered — execution engine
  // used a synthetic in-memory adapter whose UUID doesn't match any real row).
  // Only applies when exactly one adapter exists to avoid ambiguous matching.
  const adapter = adapters?.find(a => a.id === adapterId)
               ?? (adapters?.length === 1 ? adapters[0] : null);

  const allAttempts = (events ?? []).filter(e => e.attemptNumber != null);

  // Derive display info: prefer DB adapter record, fall back to execution record fields
  const displayName     = adapter?.name     ?? adapterName                                    ?? null;
  const displayProvider = adapter?.provider ?? execRecord?.provider ?? execRecord?.adapterProvider ?? null;
  const displayModel    = adapter?.modelId  ?? adapter?.modelName   ?? adapter?.model_id ?? adapter?.model ?? null;
  const displayRegion   = adapter?.region   ?? null;
  const displayActive   = adapter?.isActive ?? adapter?.is_active   ?? true;

  const hasAnyInfo = !!(displayName || adapterId || adapterName || execRecord);

  return (
    <Card>
      <CardHeader>
        <SectionHeader
          icon={<Cpu size={13} className="text-slate-400" />}
          title="Adapter"
        />
      </CardHeader>
      <CardContent>
        {hasAnyInfo ? (
          <>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-3 border border-slate-200">
              <div className="p-2 rounded-lg bg-blue-50">
                <Cpu size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {displayName ?? 'Adapter'}
                </p>
                {displayProvider && (
                  <p className="text-xs text-slate-500">
                    {displayProvider}{displayModel ? ` · ${displayModel}` : ''}
                  </p>
                )}
              </div>
              <span className={cn(
                'ml-auto text-xs font-medium px-2 py-0.5 rounded-full',
                displayActive
                  ? 'bg-green-50 text-green-700'
                  : 'bg-slate-100 text-slate-500'
              )}>
                {displayActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {adapterId && <Row label="Adapter ID" value={shortId(adapterId)} mono />}
            {displayProvider && <Row label="Provider" value={displayProvider} />}
            {displayModel    && <Row label="Model"    value={displayModel} />}
            {displayRegion   && <Row label="Region"   value={displayRegion} />}
            {!adapter && (
              <p className="text-xs text-slate-400 mt-2">
                Register this adapter at{' '}
                <a href="/adapters" className="text-blue-500 underline">Adapters →</a>{' '}
                to see full details.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-400">No adapter dispatched yet</p>
        )}

        {/* Attempt history */}
        {allAttempts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Attempt history
            </p>
            {allAttempts.map((e, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 text-xs border-b border-slate-50 last:border-0">
                <span className="text-slate-600">Attempt #{e.attemptNumber}</span>
                <div className="flex items-center gap-3 text-slate-400">
                  {e.costUsdSnapshot != null && (
                    <span className="flex items-center gap-1">
                      <DollarSign size={9} />{formatCost(e.costUsdSnapshot)}
                    </span>
                  )}
                  <span className="text-xs">{formatDate(e.occurredAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Decision output card ──────────────────────────────────────────────────────

// ── Smart Response Renderer ───────────────────────────────────────────────────
// Detects JSON in the adapter response and renders a human-readable view.
// Falls back to plain text for non-JSON responses.
//
// Supported intent types with rich rendering:
//   fraud_detection  — risk score gauge, risk factors, recommendation badge
//   chat             — plain formatted text
//   classification   — label + confidence
//   summarization    — formatted summary
//   compliance_check — pass/fail + findings
//   sentiment_analysis — sentiment + score
//   (all others)     — key-value pairs from JSON

function tryParseJson(text) {
  if (!text) return null;
  // Strip markdown code fences if present
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
      {/* Score + recommendation row */}
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

      {/* Risk factors */}
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

      {/* Reasoning */}
      {data.reasoning && (
        <div style={{ background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', padding: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>AI Reasoning</p>
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{data.reasoning}</p>
        </div>
      )}
    </div>
  );
}

function SentimentView({ data }) {
  const sentiment = data.sentiment ?? data.label ?? data.result ?? 'Unknown';
  const score = data.score ?? data.confidence ?? data.probability ?? null;
  const color = sentiment.toLowerCase().includes('pos') ? '#16a34a' : sentiment.toLowerCase().includes('neg') ? '#dc2626' : '#d97706';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          {sentiment.toLowerCase().includes('pos') ? '😊' : sentiment.toLowerCase().includes('neg') ? '😞' : '😐'}
        </div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color }}>{sentiment}</p>
          {score != null && <p style={{ fontSize: 12, color: '#94a3b8' }}>Confidence: {(score * 100).toFixed(1)}%</p>}
        </div>
      </div>
      {Object.entries(data).filter(([k]) => !['sentiment','label','result','score','confidence','probability'].includes(k)).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
          <span style={{ fontSize: 12, color: '#374151' }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
        </div>
      ))}
    </div>
  );
}

function ClassificationView({ data }) {
  const label = data.label ?? data.category ?? data.class ?? data.classification ?? null;
  const confidence = data.confidence ?? data.score ?? data.probability ?? null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {label && (
        <div style={{ padding: 16, background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe', textAlign: 'center' }}>
          <p style={{ fontSize: 10, color: '#3b82f6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>Classification</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#1d4ed8' }}>{label}</p>
          {confidence != null && <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Confidence: {(confidence * 100).toFixed(1)}%</p>}
        </div>
      )}
      {Object.entries(data).filter(([k]) => !['label','category','class','classification','confidence','score','probability'].includes(k)).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
          <span style={{ fontSize: 12, color: '#374151' }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
        </div>
      ))}
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
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, minWidth: 80, textTransform: 'capitalize' }}>{k2.replace(/_/g, ' ')}</span>
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

function ComplianceView({ data }) {
  const passed = data.passed ?? data.compliant ?? data.status === 'PASS' ?? null;
  const findings = data.findings ?? data.violations ?? data.issues ?? [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {passed !== null && (
        <div style={{ padding: 16, background: passed ? '#f0fdf4' : '#fef2f2', borderRadius: 10, border: `1px solid ${passed ? '#bbf7d0' : '#fecaca'}`, textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 800, color: passed ? '#16a34a' : '#dc2626' }}>
            {passed ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'}
          </p>
        </div>
      )}
      {findings.length > 0 && (
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Findings</p>
          {findings.map((f, i) => (
            <div key={i} style={{ padding: '6px 10px', background: '#fffbeb', borderRadius: 6, border: '1px solid #fde68a', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#374151' }}>{typeof f === 'object' ? JSON.stringify(f) : String(f)}</span>
            </div>
          ))}
        </div>
      )}
      {Object.entries(data).filter(([k]) => !['passed','compliant','status','findings','violations','issues'].includes(k)).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{k.replace(/_/g, ' ')}</span>
          <span style={{ fontSize: 12, color: '#374151' }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
        </div>
      ))}
    </div>
  );
}

function SmartResponseRenderer({ responseText, intentType, showRawOverride }) {
  const [showRaw, setShowRaw] = useState(false);

  if (!responseText) return (
    <div className="text-center py-3">
      <p className="text-sm text-slate-400">Response text not available — adapter may be a mock or response was not stored.</p>
    </div>
  );

  const parsed = tryParseJson(responseText);
  const isJson = parsed !== null && typeof parsed === 'object';

  // Determine intent category for smart rendering
  const type = (intentType ?? '').toLowerCase();
  const isFraud      = type.includes('fraud') || (parsed?.riskScore !== undefined && parsed?.recommendation !== undefined);
  const isSentiment  = type.includes('sentiment') || (parsed?.sentiment !== undefined);
  const isClassify   = type.includes('classif') || (parsed?.label !== undefined && parsed?.confidence !== undefined);
  const isCompliance = type.includes('compliance') || type.includes('audit') || (parsed?.passed !== undefined || parsed?.compliant !== undefined);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {isJson ? (isFraud ? 'Fraud Risk Assessment' : isSentiment ? 'Sentiment Analysis' : isClassify ? 'Classification Result' : isCompliance ? 'Compliance Check' : 'Structured Response') : 'Adapter Response'}
        </p>
        {isJson && (
          <span onClick={(e) => { e.stopPropagation(); setShowRaw(v => !v); }}
            style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', userSelect: 'none' }}>
            {showRaw ? '← Smart view' : 'Raw JSON →'}
          </span>
        )}
      </div>

      {showRaw || !isJson ? (
        <div style={{ fontFamily: isJson ? "'JetBrains Mono', monospace" : 'inherit', fontSize: 13, color: '#374151', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, lineHeight: 1.6, whiteSpace: isJson ? 'pre-wrap' : 'pre-line', wordBreak: 'break-word', maxHeight: 400, overflowY: 'auto' }}>
          {isJson ? JSON.stringify(parsed, null, 2) : responseText}
        </div>
      ) : (
        <div>
          {isFraud      && <FraudDetectionView data={parsed} />}
          {isSentiment  && !isFraud && <SentimentView data={parsed} />}
          {isClassify   && !isFraud && !isSentiment && <ClassificationView data={parsed} />}
          {isCompliance && !isFraud && !isSentiment && !isClassify && <ComplianceView data={parsed} />}
          {!isFraud && !isSentiment && !isClassify && !isCompliance && <GenericJsonView data={parsed} />}
        </div>
      )}
    </div>
  );
}

function DecisionOutputCard({ executions }) {
  const [showRaw,    setShowRaw]    = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Use the most recent completed execution
  const exec = (executions ?? []).find(e => e.status === 'COMPLETED' || e.status === 'SUCCESS')
            ?? executions?.[0];

  if (!exec) {
    return (
      <Card>
        <CardHeader>
          <SectionHeader
            icon={<MessageSquare size={13} className="text-slate-400" />}
            title="Decision output"
          />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 text-center py-4">
            No execution record yet — output appears when execution completes.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasResponse = !!exec.responseText;
  const qScore      = exec.qualityScore ?? null;
  const hRisk       = exec.hallucinationRisk ?? null;
  const hDetected   = exec.hallucinationDetected ?? false;
  const reasoning   = exec.qualityReasoning ?? null;

  function copyResponse() {
    navigator.clipboard.writeText(exec.responseText ?? '');
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <SectionHeader
            icon={<MessageSquare size={13} className="text-slate-400" />}
            title="Decision output"
            badge={exec.status}
          />
          {hasResponse && (
            <button onClick={copyResponse}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <Copy size={10} />{copiedText ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Quality metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label:  'Quality score',
              value:  qScore != null ? (qScore * 100).toFixed(0) + '%' : '—',
              color:  qScore >= 0.8 ? '#16a34a' : qScore >= 0.6 ? '#d97706' : '#dc2626',
              bg:     qScore >= 0.8 ? '#f0fdf4' : qScore >= 0.6 ? '#fffbeb' : '#fef2f2',
            },
            {
              label:  'Hallucination risk',
              value:  hRisk != null ? (hRisk * 100).toFixed(0) + '%' : '—',
              color:  hRisk <= 0.2 ? '#16a34a' : hRisk <= 0.5 ? '#d97706' : '#dc2626',
              bg:     hRisk <= 0.2 ? '#f0fdf4' : hRisk <= 0.5 ? '#fffbeb' : '#fef2f2',
            },
            {
              label:  'Latency',
              value:  formatLatency(exec.latencyMs),
              color:  '#2563eb',
              bg:     '#eff6ff',
            },
            {
              label:  'Cost',
              value:  exec.costUsd != null ? formatCost(exec.costUsd) : '—',
              color:  '#475569',
              bg:     '#f8fafc',
            },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="rounded-lg p-3 text-center border border-slate-100"
              style={{ backgroundColor: bg }}>
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="text-base font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Hallucination detected warning */}
        {hDetected && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle size={13} className="text-red-500 shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              <p className="font-semibold mb-0.5">Hallucination detected</p>
              <p>The quality scorer flagged potential hallucination in this response.
                Review the output carefully before using it.</p>
            </div>
          </div>
        )}

        {/* Quality reasoning */}
        {reasoning && (
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-lg">
            <p className="text-xs font-medium text-purple-700 mb-1.5 uppercase tracking-wide">
              Quality reasoning
            </p>
            <p className="text-sm text-purple-900 leading-relaxed">{reasoning}</p>
          </div>
        )}

        {/* AI response — smart renderer */}
        <SmartResponseRenderer
          responseText={exec.responseText}
          intentType={exec.intentType}
        />

        {/* Token counts if available */}
        {((exec.promptTokens > 0) || (exec.completionTokens > 0)) && (
          <div className="flex gap-4 pt-2 border-t border-slate-100 text-xs text-slate-400">
            {exec.promptTokens > 0 && (
              <span className="flex items-center gap-1">
                <Zap size={9} /> Prompt: {exec.promptTokens.toLocaleString()} tokens
              </span>
            )}
            {exec.completionTokens > 0 && (
              <span className="flex items-center gap-1">
                <Zap size={9} /> Completion: {exec.completionTokens.toLocaleString()} tokens
              </span>
            )}
            {exec.totalTokens > 0 && (
              <span className="flex items-center gap-1 font-medium text-slate-500">
                Total: {exec.totalTokens.toLocaleString()} tokens
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function IntentDetail({ keycloak }) {
  const { id: intentId } = useParams();
  const navigate   = useNavigate();

  const [intent,       setIntent]       = useState(null);
  const [events,       setEvents]       = useState([]);
  const [executions,   setExecutions]   = useState([]);
  const [adapters,     setAdapters]     = useState([]);
  const [policyEvals,  setPolicyEvals]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [fetching,     setFetching]     = useState(false);

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const [intentData, eventsData, execData, adaptersData, policyData] =
        await Promise.allSettled([
          getIntent(keycloak, intentId),
          getIntentEvents(keycloak, intentId),
          getExecutionsByIntent(keycloak, intentId),
          listAdapters(keycloak),
          getPolicyEvaluations(keycloak, intentId),
        ]);
      if (intentData.value)   setIntent(intentData.value);
      if (eventsData.value)   setEvents(eventsData.value ?? []);
      if (execData.value)     setExecutions(execData.value ?? []);
      if (adaptersData.value) setAdapters(adaptersData.value ?? []);
      if (policyData.value)   setPolicyEvals(policyData.value ?? []);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [intentId, keycloak]);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh while non-terminal
  // Stop polling when terminal=true — even if events don't show SATISFIED
  useEffect(() => {
    if (!intent || intent.terminal) return;
    // Extra safety — stop if SATISFIED or VIOLATED even if terminal flag missed
    const isDone = intent.satisfactionState === 'SATISFIED'
                || intent.satisfactionState === 'VIOLATED';
    if (isDone) return;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [intent?.terminal, intent?.satisfactionState, load]);

  if (loading) return (
    <Page title="Intent detail">
      <div className="flex justify-center py-24"><Spinner className="w-8 h-8" /></div>
    </Page>
  );

  if (!intent) return (
    <Page title="Intent detail">
      <Card className="p-12 text-center text-sm text-slate-500">Intent not found</Card>
    </Page>
  );

  const spentPct = (intent.budget?.ceilingUsd > 0)
    ? Math.min(100, (intent.budget.spentUsd / intent.budget.ceilingUsd) * 100)
    : 0;

  return (
    <Page
      title={`Intent ${shortId(intent.id)}`}
      subtitle={`Created ${formatDate(intent.createdAt)}`}
      action={
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/intents')}>
            <ArrowLeft size={13} /> Back
          </Button>
          <Button variant="secondary" size="sm" loading={fetching} onClick={load}>
            <RefreshCw size={13} /> Refresh
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left column ── */}
        <div className="space-y-4">

          {/* Status */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <PhaseBadge phase={intent.phase} />
              <SatisfactionBadge state={intent.satisfactionState} />
              {!intent.terminal && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-blue-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />Live
                </span>
              )}
            </div>
            <Row label="Intent ID" value={
              <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded break-all"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {intent.id}
              </span>
            } />
            <Row label="Type"     value={intent.intentType} />
            <Row label="Version"  value={`v${intent.version}`} />
            <Row label="Retries"  value={`${intent.retryCount ?? 0} / ${intent.maxRetries ?? 0}`} />
            <Row label="Terminal" value={intent.terminal ? 'Yes' : 'No'} />
            <Row label="Drift"    value={(intent.driftScore ?? 0).toFixed(4)} />
          </Card>

          {/* Budget — always shown */}
          <Card>
            <CardHeader>
              <SectionHeader icon={<DollarSign size={13} className="text-slate-400" />} title="Budget" />
            </CardHeader>
            <CardContent>
              {intent.budget ? (
                <>
                  <Row label="Ceiling"  value={formatCost(intent.budget.ceilingUsd)} />
                  <Row label="Spent"    value={formatCost(intent.budget.spentUsd)} />
                  <Row label="Currency" value={intent.budget.currency ?? 'USD'} />
                  <Row label="Exceeded" value={intent.budget.exceeded
                    ? <span className="text-red-600 font-semibold">Yes — ceiling hit</span>
                    : 'No'
                  } />
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Spent</span>
                      <span className={spentPct >= 90 ? 'text-red-500 font-medium' : ''}>
                        {intent.budget?.ceilingUsd > 0 ? `${spentPct.toFixed(1)}%` : '—'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{
                          width: `${spentPct}%`,
                          backgroundColor: spentPct >= 90 ? '#dc2626' : spentPct >= 70 ? '#d97706' : '#2563eb',
                        }} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-5 text-center">
                  <DollarSign size={20} className="text-slate-200 mb-2" />
                  <p className="text-sm text-slate-400">No budget defined</p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Add a <span className="font-mono">budget.ceilingUsd</span> to your payload to enforce spending limits
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Constraints — always shown */}
          <Card>
            <CardHeader>
              <SectionHeader icon={<Target size={13} className="text-slate-400" />} title="Constraints" />
            </CardHeader>
            <CardContent>
              {intent.constraints ? (
                <>
                  <Row label="Max latency ms" value={intent.constraints.maxLatencyMs
                    ? `${intent.constraints.maxLatencyMs}ms` : '—'} />
                  <Row label="Max retries"  value={intent.constraints.maxRetries ?? '—'} />
                  <Row label="Timeout"      value={intent.constraints.timeoutSeconds
                    ? `${intent.constraints.timeoutSeconds}s` : '—'} />
                  <Row label="Drift limit"  value={intent.constraints.maxDriftThreshold != null
                    ? intent.constraints.maxDriftThreshold.toFixed(2) : '—'} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-5 text-center">
                  <Target size={20} className="text-slate-200 mb-2" />
                  <p className="text-sm text-slate-400">No constraints defined</p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Add <span className="font-mono">constraints</span> to set retries, timeout, and latency limits
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Objective — always shown */}
          <Card>
            <CardHeader>
              <SectionHeader icon={<Hash size={13} className="text-slate-400" />} title="Objective" />
            </CardHeader>
            <CardContent>
              {intent.objective ? (() => {
                const obj = intent.objective;
                const description = obj.description ?? obj.task ?? obj.goal ?? null;
                const hasExtra = obj.objectiveType || obj.taskType || obj.successCriteria?.length > 0 || obj.targetThreshold > 0;
                return (
                  <div className="space-y-3">
                    {description ? (
                      <p className="text-sm text-slate-700 leading-relaxed">{description}</p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No description provided</p>
                    )}
                    {hasExtra && (
                      <div className="grid grid-cols-2 gap-2">
                        {obj.objectiveType && <Row label="Type"      value={obj.objectiveType} />}
                        {obj.taskType      && <Row label="Task type" value={obj.taskType} />}
                        {obj.targetThreshold > 0 && <Row label="Threshold" value={obj.targetThreshold} />}
                        {obj.tolerance     > 0    && <Row label="Tolerance" value={obj.tolerance} />}
                      </div>
                    )}
                    {obj.successCriteria?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                          Success criteria
                        </p>
                        <ul className="space-y-1">
                          {obj.successCriteria.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-sm text-slate-600">
                              <CheckCircle size={11} className="text-green-500 shrink-0 mt-0.5" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })() : (
                <div className="flex flex-col items-center justify-center py-5 text-center">
                  <Hash size={20} className="text-slate-200 mb-2" />
                  <p className="text-sm text-slate-400">No objective defined</p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Add an <span className="font-mono">objective</span> block to describe the intent goal
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Decision output — NEW */}
          <DecisionOutputCard executions={executions} />

          {/* Policy outcome */}
          <PolicyOutcomeCard
            policyEvals={policyEvals}
            events={events}
            satisfactionState={intent.satisfactionState}
            violationReason={intent.violationReason}
            constraints={intent.constraints}
          />
          <ReplayPanel intentId={intentId} keycloak={keycloak} satisfactionState={intent?.satisfactionState} />

          {/* Adapter detail */}
          <AdapterCard events={events} adapters={adapters} executions={executions} />

          {/* Execution timeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-slate-400" />
                <CardTitle>Execution timeline</CardTitle>
                {!intent.terminal && (
                  <span className="ml-auto flex items-center gap-1.5 text-xs text-blue-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />Live
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ExecutionTimeline
                keycloak={keycloak}
                intentId={intent.id}
                currentPhase={intent.phase}
                terminal={intent.terminal}
                satisfied={intent.satisfactionState === 'SATISFIED'}
              />
            </CardContent>
          </Card>

        </div>
      </div>
    </Page>
  );
}
