/**
 * Playground.jsx — DecisionMesh Control Plane Test Bench
 *
 * Purpose: test budget enforcement, policy rules, adapter routing
 *          and execution governance — including document-extraction intents
 *          (extract_invoice, validate_invoice) now that a real extraction
 *          step exists server-side (POST /api/intents/attachments/extract).
 *
 * There is still no multimodal path to the LLM itself — extraction happens
 * once, up front, via PDFBox/plain-text passthrough, and the resulting text
 * rides in objective.context like any other attachment. The model never
 * sees raw file bytes.
 */
import { useState, useEffect, useRef } from 'react';
import {
  Send, RefreshCw, Copy, ExternalLink, Zap,
  Shield, AlertTriangle, Lock, Gauge, CheckCircle2, Paperclip, X,
} from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Page from '../components/shared/Page';
import { Card, CardHeader, CardTitle, CardContent, Button, KillSwitchNotice } from '../components/shared';
import ExecutionTimeline from '../components/timeline/ExecutionTimeline';
import ExecutionPipelineStepper from '../components/shared/ExecutionPipelineStepper';
import {
  submitIntent, getIntent, getExecutionsByIntent, request, listPolicies,
  previewIntent, getIntentAvailability, extractAttachment,
} from '../utils/api';
import { describeAdapterError, RISK_COLORS, ADAPTER_DOT_COLORS } from '../lib/utils';
import { useCredits, MODEL_TIERS } from '../context/CreditContext';
import { useProject } from '../context/ProjectContext';

// ── Attachments. There's no attachment field on the intent model and no
// multimodal path to the LLM, so extracted text always rides in
// objective.context (the only field that reaches the prompt). Text types are
// read client-side; PDFs go through POST /intents/attachments/extract
// (PDFBox server-side) since browsers can't parse a PDF's text layer
// themselves. Either way, what counts toward the byte caps below is the
// EXTRACTED TEXT size, not the original file size — that's what actually
// rides in the prompt and counts toward budget/latency.
const MAX_ATTACHMENT_BYTES       = 8 * 1024;   // per file, post-extraction
const MAX_ATTACHMENTS_TOTAL_BYTES = 24 * 1024; // combined, post-extraction
const ATTACHMENT_ACCEPT = '.txt,.md,.csv,.json,.log,.pdf';
const PDF_EXTENSIONS = /\.pdf$/i;

function formatBytes(n) {
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;
}

/** Serialises attachments into the delimited block appended to objective.context. */
function attachmentsToContextBlock(attachments) {
  if (!attachments.length) return null;
  return attachments
      .map(a => `--- Attachment: ${a.name} ---\n${a.content}`)
      .join('\n\n');
}

/**
 * Returns a copy of body with attachments merged into objective.context —
 * the shape actually sent to both /intents/preview and /intents, so the
 * preview never lies about what submit will do.
 */
function withAttachments(body, attachments) {
  const block = attachmentsToContextBlock(attachments);
  if (!block) return body;
  return {
    ...body,
    objective: {
      ...(body.objective ?? {}),
      context: [body.objective?.context, block].filter(Boolean).join('\n\n'),
    },
  };
}

function AttachmentsPanel({ attachments, setAttachments, disabled, keycloak }) {
  const [err, setErr] = useState(null);
  const [extracting, setExtracting] = useState([]); // filenames currently being extracted server-side
  const inputRef = useRef(null);
  const totalBytes = attachments.reduce((sum, a) => sum + a.size, 0);

  function byteLength(text) {
    return new TextEncoder().encode(text).length;
  }

  // Applies the same per-file/combined cap regardless of source, using the
  // final extracted-text size (not the original file's size — a PDF's byte
  // count has little to do with how much text it actually yields).
  function tryAdd(name, content, currentTotal) {
    const size = byteLength(content);
    if (size > MAX_ATTACHMENT_BYTES) {
      setErr(`"${name}" extracted to ${formatBytes(size)} of text — max is ${formatBytes(MAX_ATTACHMENT_BYTES)} per file.`);
      return currentTotal;
    }
    if (currentTotal + size > MAX_ATTACHMENTS_TOTAL_BYTES) {
      setErr(`Adding "${name}" would exceed the ${formatBytes(MAX_ATTACHMENTS_TOTAL_BYTES)} combined limit — attachments ride in the prompt itself, so they're kept small.`);
      return currentTotal;
    }
    setAttachments(prev => [...prev, { name, content, size }]);
    return currentTotal + size;
  }

  function readAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error(`Couldn't read "${file.name}" as text.`));
      reader.readAsText(file);
    });
  }

  // Sequential, not Promise.all — tryAdd's combined-cap check depends on
  // running total, which needs each file resolved before the next is judged.
  async function handleFiles(fileList) {
    setErr(null);
    const files = Array.from(fileList ?? []);
    let runningTotal = totalBytes;

    for (const file of files) {
      const isPdf = PDF_EXTENSIONS.test(file.name);
      try {
        if (isPdf) {
          setExtracting(prev => [...prev, file.name]);
          const result = await extractAttachment(keycloak, file);
          setExtracting(prev => prev.filter(n => n !== file.name));
          if (!result) {
            setErr(`Couldn't extract "${file.name}" — not authenticated.`);
            continue;
          }
          if (result.truncated) {
            setErr(`"${file.name}" extracted text was truncated by the server (document longer than the extraction cap).`);
          }
          runningTotal = tryAdd(file.name, result.extractedText ?? '', runningTotal);
        } else {
          const text = await readAsText(file);
          runningTotal = tryAdd(file.name, text, runningTotal);
        }
      } catch (e) {
        setExtracting(prev => prev.filter(n => n !== file.name));
        setErr(e?.message ?? `Couldn't process "${file.name}".`);
      }
    }
  }

  function removeAt(i) {
    setAttachments(prev => prev.filter((_, idx) => idx !== i));
  }

  return (
      <div className="border border-slate-200 rounded-xl p-3 flex flex-col gap-2"
           title="Text files are read as-is; PDFs are extracted server-side. Either way the extracted text is appended to the prompt's context field, so it counts toward the same budget/latency ceiling as everything else in the request">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Paperclip size={11} />Attachments
            {attachments.length > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400">
              {attachments.length} · {formatBytes(totalBytes)}
            </span>
            )}
          </p>
          {!disabled && (
              <button onClick={() => inputRef.current?.click()}
                      className="text-[10px] text-blue-500 underline shrink-0">
                Add file
              </button>
          )}
        </div>
        <input ref={inputRef} type="file" multiple accept={ATTACHMENT_ACCEPT} className="hidden"
               disabled={disabled}
               onChange={e => { handleFiles(e.target.files); e.target.value = ''; }} />

        {attachments.length === 0 && extracting.length === 0 ? (
            <p className="text-[11px] text-slate-400">
              {disabled ? 'None attached' : `Up to ${formatBytes(MAX_ATTACHMENT_BYTES)} of extracted text each (.txt, .md, .csv, .json, .log, .pdf)`}
            </p>
        ) : (
            <ul className="space-y-1">
              {attachments.map((a, i) => (
                  <li key={i} className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 rounded px-2 py-1">
                    <span className="truncate" title={a.name}>{a.name}</span>
                    <span className="flex items-center gap-1.5 shrink-0">
                  <span className="text-slate-400">{formatBytes(a.size)}</span>
                      {!disabled && (
                          <button onClick={() => removeAt(i)} className="text-slate-400 hover:text-red-500">
                            <X size={11} />
                          </button>
                      )}
                </span>
                  </li>
              ))}
              {extracting.map(name => (
                  <li key={name} className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 rounded px-2 py-1 italic">
                    <RefreshCw size={10} className="animate-spin shrink-0" />
                    <span className="truncate" title={name}>Extracting {name}…</span>
                  </li>
              ))}
            </ul>
        )}
        {err && <p className="text-[10px] text-red-500">{err}</p>}
      </div>
  );
}

// ── Shared SmartResponseRenderer helpers ──────────────────────────────────────
function tryParseJson(text) {
  if (!text) return null;
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  try { return JSON.parse(cleaned); } catch { return null; }
}

function RiskGauge({ score }) {
  // Normalise: if score > 1, assume it's already on 0-100 scale
  const normalised = score > 1 ? score / 100 : (score ?? 0);
  const pct = Math.round(normalised * 100);
  const color = normalised >= 0.8 ? '#dc2626'
      : normalised >= 0.6 ? '#d97706'
          : normalised >= 0.3 ? '#f59e0b'
              : '#16a34a';
  const label = normalised >= 0.8 ? 'CRITICAL'
      : normalised >= 0.6 ? 'HIGH'
          : normalised >= 0.3 ? 'MEDIUM'
              : 'LOW';
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
// ── Model tier selector ───────────────────────────────────────────────────────
// Compact dropdown — mirrors the mockup's "Override Adapter" style instead of
// a card grid, but still drives the real MODEL_TIERS selection and credit
// cost underneath (unlike the mockup's Execution Mode/Execution Profile
// fields, which have no backend concept behind them and aren't reproduced
// here).
function ModelTierSelector({ selected, onChange, navigate }) {
  const tiers = Object.entries(MODEL_TIERS);
  const tier  = MODEL_TIERS[selected];
  const isSpecial = selected === 'byok' || selected === 'byom';

  return (
      <Card>
        <CardHeader className="py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full badge-brand text-[11px] font-bold shrink-0">3</span>
            <CardTitle>Execution</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5 py-3">
          <label className="block">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Adapter tier</span>
            <select
                value={selected}
                onChange={e => onChange(e.target.value)}
                className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-blue-400">
              {tiers.map(([key, t]) => (
                  <option key={key} value={key}>{t.label} — {t.models} ({t.credits} cr)</option>
              ))}
            </select>
          </label>
          {isSpecial && (
              <p className="text-xs text-slate-400">
                {tier.credits} credit for orchestration only — your provider or model handles execution.{' '}
                <button onClick={() => navigate('/billing?tab=byok')} className="underline" style={{ color: tier.color }}>
                  Configure →
                </button>
              </p>
          )}
        </CardContent>
      </Card>
  );
}

// ── Effective policy stack — 4 columns matching the mockup. Tenant-wide and
// Project are real (PolicyEntity.scope supports TENANT/PROJECT, and the list
// endpoint exposes both). Intent-type and Execution-profile are greyed out:
// INTENT_TYPE is a real enforcement-time scope (PolicyQueryPort matches
// scopeRefId == intentTypeId), but the list/create API doesn't expose or
// accept it yet (PolicyResponse only surfaces projectId, and
// SavePolicyRequest rejects any scope other than TENANT/PROJECT) — so there's
// no way to see or create one today even though it would be enforced.
// Execution Profile has no backend concept anywhere.
// `color` renders the title as a GitHub-label-style pill (tinted background,
// solid text) instead of flat grey — Tenant/Project/Intent-type/Execution
// profile were previously indistinguishable at a glance in the 4-column grid.
function PolicyColumn({ title, color = '#64748b', locked, lockedReason, items, emptyLabel }) {
  return (
      <div className={locked ? 'opacity-40' : ''} title={locked ? lockedReason : undefined}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
            style={{ background: `${color}18`, color }}>
            {locked ? <Lock size={9} /> : <Shield size={9} />}
            {title}
          </span>
          {!locked && items.length > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-normal" style={{ background: `${color}18`, color }}>{items.length}</span>
          )}
        </div>
        {locked ? (
            <p className="text-xs text-slate-400">Unavailable</p>
        ) : items.length === 0 ? (
            <p className="text-xs text-slate-400">{emptyLabel}</p>
        ) : (
            <ul className="space-y-1">
              {items.map(p => (
                  <li key={p.policyId} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <CheckCircle2 size={11} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="truncate" title={p.name}>{p.name}</span>
                  </li>
              ))}
            </ul>
        )}
      </div>
  );
}

function ActivePoliciesCard({ keycloak, navigate }) {
  const { activeProject } = useProject();
  const [policies, setPolicies] = useState(null); // null = loading

  useEffect(() => {
    listPolicies(keycloak).then(setPolicies).catch(() => setPolicies([]));
  }, [keycloak]);

  const tenantPolicies  = (policies ?? []).filter(p => p.scope === 'TENANT');
  const projectPolicies = (policies ?? []).filter(p => p.scope === 'PROJECT' && p.projectId === activeProject?.id);
  const applicableCount = tenantPolicies.length + projectPolicies.length;

  return (
      <Card>
        <CardHeader className="py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full badge-brand text-[11px] font-bold shrink-0">4</span>
              <Shield size={14} className="text-slate-500" />
              <CardTitle>Effective policy stack</CardTitle>
            </div>
            <button onClick={() => navigate('/policies')} className="text-[10px] text-blue-500 underline shrink-0">
              View all policies →
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          {policies === null ? (
              <p className="text-xs text-slate-400">Loading…</p>
          ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <PolicyColumn title="Tenant-wide" color="#2563eb"
                    items={tenantPolicies} emptyLabel="None yet" />
                  <PolicyColumn title="Project" color="#7c3aed"
                    items={projectPolicies} emptyLabel="None yet" />
                  <PolicyColumn title="Intent-type" color="#16a34a" locked
                    lockedReason="INTENT_TYPE-scoped policies are enforced server-side but the policy list/create API doesn't expose or accept this scope yet" />
                  <PolicyColumn title="Execution profile" color="#ea580c" locked
                    lockedReason="Execution profiles are not a concept in the backend yet" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                  {applicableCount > 0
                      ? <>This submission will be governed by <strong className="text-slate-600">{applicableCount}</strong> active polic{applicableCount === 1 ? 'y' : 'ies'}.</>
                      : <>No policies apply yet — anything in the payload's own <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded">policy</code> block still runs for this submission.</>
                  }
                </p>
              </>
          )}
        </CardContent>
      </Card>
  );
}

// ── Intent selection — Domain → Category → Intent, real intent-library data ──
// Mirrors FintechIntents.jsx's vertical/category/intent model but as compact
// dropdowns instead of a card grid, so pick → configure → submit fits on one
// continuous page. Selecting an intent loads its real examplePayload/
// description/riskLevel — nothing here is invented.
const DOMAINS = [
  { key: 'FINTECH',    label: 'Fintech & Banking' },
  { key: 'HEALTHCARE', label: 'Healthcare' },
  { key: 'INSURANCE',  label: 'Insurance' },
  { key: 'LEGAL',      label: 'Legal Services' },
  { key: 'GOVERNMENT', label: 'Government' },
  { key: 'ENTERPRISE', label: 'Enterprise SaaS' },
  { key: 'RETAIL',     label: 'Retail & E-commerce' },
  { key: 'EDUCATION',  label: 'Education' },
];


function IntentSelection({ keycloak, domain, setDomain, category, setCategory, intentName, setIntentName, onPick, selectedMeta, readOnly = false }) {
  const [categories, setCategories] = useState([]);
  const [intents,    setIntents]    = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingIntents, setLoadingIntents] = useState(false);

  useEffect(() => {
    setLoadingCats(true);
    request(keycloak, `/intent-library/${domain.toLowerCase()}/meta/categories`)
        .then(cats => {
          const list = cats ?? [];
          setCategories(list);
          if (list.length > 0) setCategory(list[0].category);
        })
        .catch(() => setCategories([]))
        .finally(() => setLoadingCats(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  useEffect(() => {
    if (!category) return;
    setLoadingIntents(true);
    request(keycloak, `/intent-library/${domain.toLowerCase()}/by-category/${category}`)
        .then(list => {
          const items = list ?? [];
          setIntents(items);
          if (items.length > 0) onPick(items[0]);
        })
        .catch(() => setIntents([]))
        .finally(() => setLoadingIntents(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, domain]);

  const risk = selectedMeta ? (RISK_COLORS[selectedMeta.riskLevel] ?? RISK_COLORS.MEDIUM) : null;

  return (
      <Card>
        <CardHeader className="py-2.5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full badge-brand text-[11px] font-bold shrink-0">1</span>
            <CardTitle>Intent selection</CardTitle>
            {readOnly && (
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">As submitted</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2">
              <span className="text-[10px] font-bold badge-brand uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0">Domain</span>
              <select
                  value={domain}
                  onChange={e => { setDomain(e.target.value); setCategory(''); setIntentName(''); }}
                  disabled={readOnly}
                  className="flex-1 min-w-0 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400 disabled:opacity-50">
                {DOMAINS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-[10px] font-bold badge-brand uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0">Category</span>
              <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  disabled={readOnly || loadingCats || categories.length === 0}
                  className="flex-1 min-w-0 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400 disabled:opacity-50">
                {categories.map(c => (
                    <option key={c.category} value={c.category}>{(c.categoryLabel || c.category).replace(/_/g, ' ')}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-[10px] font-bold badge-brand uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0">Intent</span>
              <select
                  value={intentName}
                  onChange={e => {
                    const match = intents.find(i => i.name === e.target.value);
                    if (match) onPick(match);
                  }}
                  disabled={readOnly || loadingIntents || intents.length === 0}
                  className="flex-1 min-w-0 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:border-blue-400 disabled:opacity-50">
                {intents.map(i => (
                    <option key={i.id} value={i.name}>{i.name.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </label>
          </div>

          {risk && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full mt-1"
                    style={{ background: risk.bg, color: risk.text }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: risk.dot }} />
                {risk.label} risk
              </span>
          )}
        </CardContent>
      </Card>
  );
}

// ── Execution intelligence sidebar ────────────────────────────────────────────
// Mirrors the mockup's right-hand panel in full structure. Adapter, cost/
// latency estimate, expected output and kill-switch status are now backed by
// real endpoints: POST /intents/preview (IntentPreviewService — reuses the
// exact AdapterRegistry.loadCandidates + LlmModelSelector.select pipeline the
// real submission path runs, read-only) and GET /intents/availability
// (KillSwitchService.firstBlockingBroad). Both are snapshots, not guarantees —
// selection is live (EMA-driven), so the adapter actually used at submission
// may differ if candidate performance shifts between preview and submit.
function ExecutionIntelligence({ json, selectedMeta, loading, result, preview, previewLoading, previewError, availability }) {
  let intentType = null;
  try { intentType = JSON.parse(json)?.intentType; } catch { /* ignore */ }

  const risk   = selectedMeta ? (RISK_COLORS[selectedMeta.riskLevel] ?? RISK_COLORS.MEDIUM) : null;
  const status = result ? 'Submitted' : loading ? 'Submitting…' : 'Ready to submit';

  return (
      <Card>
        <CardHeader className="py-2.5"><CardTitle>Execution intelligence</CardTitle></CardHeader>
        <CardContent className="space-y-3 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-brand uppercase tracking-wide">Intent</p>
              <p className="text-sm font-mono font-semibold text-slate-800 break-all">{intentType || '—'}</p>
            </div>
            {risk && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold shrink-0 mt-3.5" style={{ color: risk.text }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: risk.dot }} />
                  {risk.label}
                </span>
            )}
          </div>

          <div>
            <p className="text-[10px] font-semibold text-brand uppercase tracking-wide">Status</p>
            <p className="text-sm font-semibold text-slate-800">{status}</p>
          </div>

          {/* Adapter — purple/"intelligence" tint per the palette spec */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[10px] font-semibold text-brand uppercase tracking-wide mb-1">Adapter</p>
            <div className="rounded-lg px-2.5 py-2" style={{ background: '#F5F3FF' }}>
              {previewLoading ? (
                  <p className="text-xs text-slate-400">Resolving…</p>
              ) : previewError ? (
                  <p className="text-xs text-slate-400" title={previewError}>Unavailable</p>
              ) : preview?.adapter ? (
                  <p className="text-sm text-slate-700" title={preview.adapter.selectionReason}>
                    Auto — currently{' '}
                    <span className="font-semibold" style={{ color: ADAPTER_DOT_COLORS[preview.adapter.provider?.toUpperCase()] ?? 'var(--brand-intelligence)' }}>
                      {preview.adapter.provider}/{preview.adapter.model}
                    </span>
                    <span className="block text-xs text-slate-400 mt-0.5">resolved again at execution</span>
                  </p>
              ) : preview && !preview.hasCandidates ? (
                  <p className="text-sm font-medium text-amber-600">No eligible adapters configured for this intent type</p>
              ) : (
                  <p className="text-sm text-slate-400">Auto (resolved at execution)</p>
              )}
            </div>
          </div>

          {/* Optimization — estimated cost/latency, green/blue tints per the palette spec */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[10px] font-semibold text-brand uppercase tracking-wide mb-1.5">Optimization</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg px-2.5 py-2" style={{ background: '#ECFDF5' }}>
                <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--stage-optimize)' }}><Gauge size={9} />Est. cost</span>
                <span className="block text-sm font-bold text-slate-800 mt-0.5">
                  {previewLoading ? '…' : preview?.estimatedCostUsd != null ? `$${preview.estimatedCostUsd.toFixed(4)}` : '—'}
                </span>
              </div>
              <div className="rounded-lg px-2.5 py-2" style={{ background: '#EFF6FF' }}>
                <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--stage-govern)' }}><Gauge size={9} />Est. latency</span>
                <span className="block text-sm font-bold text-slate-800 mt-0.5">
                  {previewLoading ? '…' : preview?.estimatedLatencyMs != null ? `${Math.round(preview.estimatedLatencyMs)}ms` : '—'}
                </span>
              </div>
            </div>
            {preview?.estimateFromColdStart && (
                <p className="text-[10px] text-slate-400 mt-1.5">No execution history yet — default estimate</p>
            )}
          </div>

          {/* Expected output */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[10px] font-semibold text-brand uppercase tracking-wide mb-1">Expected output</p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {previewLoading ? 'Checking…' : preview?.expectedOutput || '—'}
            </p>
          </div>

          {/* Kill switch — fixed red tint, never brand-customizable (see index.css --stage-kill) */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[10px] font-semibold text-brand uppercase tracking-wide mb-1">Kill switch</p>
            <div className="rounded-lg px-2.5 py-2" style={{ background: '#FEF2F2' }}>
              {availability === null ? (
                  <p className="text-sm text-slate-400">Checking…</p>
              ) : availability?.paused ? (
                  <p className="text-sm font-semibold" style={{ color: 'var(--stage-kill)' }} title={availability.reason ?? undefined}>
                    Active — submissions paused ({availability.scopeType ?? 'unknown scope'})
                  </p>
              ) : (
                  <p className="text-sm font-semibold" style={{ color: 'var(--stage-optimize)' }}>Clear</p>
              )}
            </div>
          </div>
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

  // Popup state for 409 errors
  const [popupMessage, setPopupMessage] = useState(null);

  const [json,       setJson]       = useState(initialJson);
  const [jsonErr,    setJsonErr]    = useState(null);
  const [iKey,       setIKey]       = useState(uuidv4);
  const [tier,       setTier]       = useState('economy');
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState(null);
  const [paused,     setPaused]     = useState(false);   // kill switch active (503)
  const [copied,     setCopied]     = useState(false);
  const [creditCost, setCreditCost] = useState(null);
  const [showRaw,    setShowRaw]    = useState(false);
  const [execResult, setExecResult] = useState(null);   // execution record after completion
  const [intentData, setIntentData] = useState(null);   // intent detail after completion
  const pollRef = useRef(null);

  // Attachments — small text files merged into objective.context on submit
  const [attachments, setAttachments] = useState([]);

  // Execution intelligence — preview (adapter/cost/latency/expected output)
  // and kill-switch availability, both real backend reads (see api.js).
  const [preview,        setPreview]        = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError,   setPreviewError]   = useState(null);
  const [availability,   setAvailability]   = useState(null);
  const previewDebounceRef = useRef(null);

  // Intent Selection state — Domain → Category → Intent (section 1)
  const [domain,       setDomain]       = useState('FINTECH');
  const [category,     setCategory]     = useState('');
  const [intentName,   setIntentName]   = useState('');
  const [selectedMeta, setSelectedMeta] = useState(null); // { description, riskLevel } for the picked intent

  // When navigated from Intent Library via ?intent=name query param,
  // fetch the examplePayload from the API and pre-fill the editor
  useEffect(() => {
    const q = searchParams.get('intent');
    if (!q || location.state?.intentPayload) return; // skip if already have payload
    request(keycloak, `/intent-library/fintech/search?q=${q}`)
        .then(results => {
          const match = Array.isArray(results)
              ? results.find(r => r.name === q)
              : null;
          if (match?.examplePayload) {
            setJson(JSON.stringify(match.examplePayload, null, 2));
            setIntentName(match.name);
            setSelectedMeta({ description: match.description, riskLevel: match.riskLevel });
          }
        })
        .catch(() => {}); // silently fall back to DEFAULT
  }, [searchParams, keycloak]);

  // Debounced preview — re-fetch adapter/cost/latency/expected-output
  // whenever the payload settles, so it stays honest as the user edits
  // rather than showing what was true for a previous draft.
  useEffect(() => {
    if (result || jsonErr) return; // nothing to preview once submitted, or while invalid
    clearTimeout(previewDebounceRef.current);
    previewDebounceRef.current = setTimeout(() => {
      let body;
      try { body = JSON.parse(json); } catch { return; }
      if (!body?.intentType || !body?.objective || !body?.constraints || !body?.budget) return;
      setPreviewLoading(true);
      setPreviewError(null);
      previewIntent(keycloak, withAttachments(body, attachments))
          .then(p => setPreview(p))
          .catch(e => { setPreview(null); setPreviewError(e?.message || 'Preview failed'); })
          .finally(() => setPreviewLoading(false));
    }, 600);
    return () => clearTimeout(previewDebounceRef.current);
  }, [json, jsonErr, result, keycloak, attachments]);

  // Kill-switch availability — checked once on load and re-checked every 20s
  // while the page is open, so "Clear" doesn't go stale during a long edit.
  useEffect(() => {
    let cancelled = false;
    function check() {
      getIntentAvailability(keycloak)
          .then(res => { if (!cancelled) setAvailability(res ?? { paused: false }); })
          .catch(() => { if (!cancelled) setAvailability(prev => prev ?? { paused: false }); });
    }
    check();
    const id = setInterval(check, 20000);
    return () => { cancelled = true; clearInterval(id); };
  }, [keycloak]);

  // ── Helpers ─────────────────────────────────────────────────────────────

  function handleChange(e) {
    setJson(e.target.value);
    try   { JSON.parse(e.target.value); setJsonErr(null); }
    catch { setJsonErr('Invalid JSON'); }
  }

  // Picked from the Intent Selection dropdowns (section 1) — loads the real
  // examplePayload/description/riskLevel from the intent library, same shape
  // FintechIntents.jsx's "Try in Playground" already uses.
  function handleIntentSelected(intent) {
    setIntentName(intent.name);
    setSelectedMeta({ description: intent.description, riskLevel: intent.riskLevel });
    const payload = intent.examplePayload
        ? JSON.stringify(intent.examplePayload, null, 2)
        : JSON.stringify({
            intentType: intent.name,
            objective: { description: intent.description ?? '', userMessage: '' },
            constraints: { maxRetries: 2, timeoutSeconds: 30, maxLatencyMs: 10000 },
            budget: { ceilingUsd: 0.10, currency: 'USD' },
          }, null, 2);
    setJson(payload);
    setJsonErr(null);
    setResult(null);
    setError(null);
    // Proactive default, not a hard rule — HIGH-risk intents (fraud, compliance,
    // anything with requireHumanReview in its example) get routed to a stronger
    // model by default so a first run isn't quietly under-powered for the
    // scenario it's demonstrating. Still just a starting point — Adapter tier
    // stays fully editable right below.
    let tierHint = 'economy';
    try {
      const p = JSON.parse(payload);
      if (intent.riskLevel === 'HIGH' || p?.constraints?.requireHumanReview) tierHint = 'standard';
    } catch { /* keep default */ }
    setTier(tierHint);
  }

  // Query field (section 2) mirrors objective.userMessage — the JSON textarea
  // stays the source of truth; editing Query re-serialises into it. Disabled
  // while the JSON itself is invalid since there's nothing safe to merge into.
  const queryValue = (() => {
    try { return JSON.parse(json)?.objective?.userMessage ?? ''; }
    catch { return ''; }
  })();

  function handleQueryChange(e) {
    try {
      const p = JSON.parse(json);
      p.objective = { ...(p.objective ?? {}), userMessage: e.target.value };
      setJson(JSON.stringify(p, null, 2));
    } catch { /* invalid JSON — Query stays disabled, nothing to merge into */ }
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (isEmpty) { setError('No credits remaining. Top up to continue.'); return; }
    setError(null); setPaused(false); setResult(null); setCreditCost(null); setPopupMessage(null);

    let body;
    try   { body = JSON.parse(json); }
    catch { setError('Fix the JSON before submitting'); return; }

    body = withAttachments(body, attachments);
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
          if (completed?.responseText || completed?.response_text) {
            setExecResult(completed);
            clearInterval(pollRef.current);
            reload();
          } else if (intentDetail?.terminal) {
            // Intent terminated — could be VIOLATED (SLA/budget breach)
            const sat = intentDetail.satisfactionState;
            if (sat === 'VIOLATED') {
              const reason = intentDetail.violationReason ?? intentDetail.violatedConstraint ?? 'Constraint violated';
              const adapterHint = describeAdapterError(reason);
              setError(adapterHint
                  ? `Intent violated: ${reason}\n\n${adapterHint}`
                  : `Intent violated: ${reason}. Check your maxLatencyMs and budget constraints.`);
              refundCredits(tier);
            }
            setExecResult(completed ?? null);
            clearInterval(pollRef.current);
            reload();
          } else if (
              intentDetail?.terminal ||
              (intentDetail?.satisfactionState === 'UNKNOWN' &&
                  intentDetail?.phase === 'COMPLETED')
          ) {
            // Intent is terminal OR parked for human review (UNKNOWN+COMPLETED).
            // terminal may be false for review-queue intents — catch both cases.
            setExecResult(completed ?? null);
            clearInterval(pollRef.current);
            reload();
          }
        } catch { /* ignore poll errors */ }
      }, 2000);
    } catch (e) {
      refundCredits(tier);

      if (e.code === 'KILL_SWITCH_ACTIVE') {
        setPaused(true);
        return;
      }

      let parsedError = null;
      let rawMsg = typeof e === 'string'
          ? e
          : e?.message || (typeof e === 'object' ? JSON.stringify(e) : '');

      // If the error message is a raw JSON string from backend response, parse it:
      try {
        const jsonStart = rawMsg.indexOf('{');
        if (jsonStart !== -1) {
          parsedError = JSON.parse(rawMsg.slice(jsonStart));
        } else if (typeof e === 'object' && e !== null) {
          parsedError = e.data || e.response?.data || e;
        }
      } catch {
        /* ignore JSON parse fallback */
      }

      const code = parsedError?.code || e?.code || '';

      // ── NO_ACTIVE_MODELS ────────────────────────────────────────────────────
      // Keyed off `code`, not a bare 409 status — PROJECT_BUDGET_EXCEEDED below
      // is also a 409, and the old `e?.status === 409` catch-all here would
      // have shown "No Active Models" for a budget error instead.
      if (code === 'NO_ACTIVE_MODELS' || rawMsg.includes('NO_ACTIVE_MODELS')) {
        setPopupMessage({
          title: 'No Active Models Available',
          description: parsedError?.message || 'No active AI models are configured for this tenant.',
          details: parsedError?.details || null,
          type: 'error',
        });
      }
      // ── PROJECT_BUDGET_EXCEEDED — project's monthly spend ceiling reached ──
      else if (code === 'PROJECT_BUDGET_EXCEEDED' || rawMsg.includes('PROJECT_BUDGET_EXCEEDED')) {
        setPopupMessage({
          title: 'Project Budget Exceeded',
          description: parsedError?.message || 'This project has reached its monthly budget ceiling. Raise the limit in Project Settings > Budget, or wait until next month.',
          details: null,
          type: 'error',
        });
      }
      // ── Other Errors ──────────────────────────────────────────────────────
      else if (rawMsg.includes('SLAException') || rawMsg.includes('Latency constraint violated')) {
        const match = rawMsg.match(/actual=(\d+)ms.*limit=(\d+)ms/);
        if (match) {
          setError(`Latency constraint violated — LLM took ${match[1]}ms but maxLatencyMs is ${match[2]}ms. Increase maxLatencyMs (e.g. 10000) to allow more time.`);
        } else {
          setError('Latency constraint violated — the LLM response exceeded your maxLatencyMs limit. Increase it to 10000ms or higher.');
        }
      } else if (rawMsg.includes('BudgetExceeded') || rawMsg.includes('budget')) {
        setError('Budget exceeded — increase ceilingUsd in the intent payload.');
      } else if (rawMsg.includes('500') || rawMsg.includes('Internal Server Error')) {
        setError('Intent submission failed — check your constraints (maxLatencyMs, budget ceiling). Try increasing maxLatencyMs to 10000.');
      } else if (e?.status === 409) {
        setError(parsedError?.message || 'Request conflict — please try again.');
      } else {
        setError(rawMsg || 'Intent submission failed. Please try again.');
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

  // ── Render ───────────────────────────────────────────────────────────────

  return (
      <>
        <Page
            className="space-y-3"
            title={<span className="text-brand">Workspace for testing DecisionMesh end-to-end</span>}
            subtitle="Select an intent, review its payload and the policies that govern it, then submit for execution"
            action={result && (
                <Button variant="secondary" size="sm"
                        onClick={() => { setResult(null); setCreditCost(null); setIKey(uuidv4()); }}>
                  <RefreshCw size={13} /> New intent
                </Button>
            )}>

          <ExecutionPipelineStepper
              phase={intentData?.phase ?? 'CREATED'}
              terminal={intentData?.terminal ?? false}
              satisfactionState={intentData?.satisfactionState}
          />

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">

            <div className="xl:col-span-3 space-y-2">

              {/* Result — shown above the (now read-only) submitted form once
                  an intent exists, rather than replacing it, so what was
                  actually submitted stays visible instead of disappearing. */}
              {result && (
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
              )}

              {/* 1 & 2 — always shown. Frozen (read-only) once a result
                  exists, so what was actually submitted stays visible
                  instead of being replaced or reset; "New intent" in the
                  page header clears result and re-enables editing. */}
              <IntentSelection
                  keycloak={keycloak}
                  domain={domain} setDomain={setDomain}
                  category={category} setCategory={setCategory}
                  intentName={intentName} setIntentName={setIntentName}
                  onPick={handleIntentSelected}
                  selectedMeta={selectedMeta}
                  readOnly={!!result}
              />

              {/* 2. Intent request — Query (objective.userMessage) + full JSON payload */}
              <Card>
                <CardHeader className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full badge-brand text-[11px] font-bold shrink-0">2</span>
                    <CardTitle>Intent request</CardTitle>
                    {!!result && (
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">As submitted</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5 py-3">
                  <label className="block">
                    <span className="text-[10px] font-bold badge-brand uppercase tracking-wide px-1.5 py-0.5 rounded">Query</span>
                    <input
                        type="text"
                        value={queryValue}
                        onChange={handleQueryChange}
                        disabled={!!jsonErr || !!result}
                        placeholder="What should the model do with this?"
                        className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-blue-400 disabled:opacity-50 disabled:bg-slate-50"
                    />
                  </label>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <div className="lg:col-span-2 border border-slate-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-200">
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Payload (JSON)</span>
                        <button
                            onClick={() => setShowRaw(v => !v)}
                            className="text-[10px] text-slate-400 hover:text-slate-600 border border-slate-200 rounded px-1.5 py-0.5 bg-white">
                          {showRaw ? 'Collapse' : 'Expand'}
                        </button>
                      </div>
                      <textarea
                          value={json}
                          onChange={handleChange}
                          readOnly={!!result}
                          rows={showRaw ? 18 : 7}
                          className="w-full font-mono text-xs p-3 resize-none focus:outline-none text-slate-700 bg-white read-only:bg-slate-50"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      />
                      {jsonErr && <p className="px-3 pb-2 text-xs text-red-500">{jsonErr}</p>}
                    </div>

                    {/* Attachments — small text files, merged into objective.context
                        on submit (see attachmentsToContextBlock / handleSubmit).
                        Size-capped so they can't blow the budget/latency ceiling. */}
                    <AttachmentsPanel attachments={attachments} setAttachments={setAttachments} disabled={!!result} keycloak={keycloak} />
                  </div>
                </CardContent>
              </Card>

              {/* 3 + 4 side by side — Execution narrower, policy stack wider,
                  matching the mockup's row layout. */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <ModelTierSelector selected={tier} onChange={setTier} navigate={navigate} />
                <div className="lg:col-span-2">
                  <ActivePoliciesCard keycloak={keycloak} navigate={navigate} />
                </div>
              </div>

              {/* Credit cost + submit — hidden once a result exists; use
                  "New intent" in the page header to reset and submit again. */}
              {!result && (
              <div className="space-y-2">
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
              )}

              {error && !result && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 whitespace-pre-line">
                    {error}
                  </div>
              )}
            </div>

            {/* ── Sidebar — Execution intelligence: real data only (intent
                type, risk from the library, submit status). Adapter
                candidates, cost/latency estimates and kill-switch status
                are follow-up work once their backend endpoints exist. ── */}
            <div className="space-y-4">
              <ExecutionIntelligence
                  json={json} selectedMeta={selectedMeta} loading={loading} result={result}
                  preview={preview} previewLoading={previewLoading} previewError={previewError}
                  availability={availability}
              />
            </div>

          </div>

        </Page>

        {/* Floating quick-submit — sits just left of the global Feedback
            widget (fixed bottom-6 right-6) so both are reachable without
            scrolling. Only shown pre-submission; once there's a result,
            "New intent" in the page header is the relevant action instead. */}
        {!result && (
            <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="fixed bottom-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                style={{
                  right: '150px',
                  // Was a hardcoded blue gradient — same bug as the shared
                  // Button component (see index.css's .btn-primary comment):
                  // couldn't respond to a saved /org/branding colour at all.
                  background: canSubmit ? 'var(--brand-gradient)' : '#94a3b8',
                }}
            >
              <Send size={14} />
              {isEmpty ? 'No credits' : loading ? 'Submitting…' : 'Submit intent'}
            </button>
        )}

        {/* Kill switch — pinned above the floating bar. */}
        {paused && (
            <div className="fixed bottom-20 left-4 z-50" style={{ right: '120px' }}>
              <KillSwitchNotice
                  keycloak={keycloak}
                  onResume={handleSubmit}
                  intentJson={json}
                  isAdmin={keycloak?.tokenParsed?.['urn:zitadel:iam:org:project:roles']?.sys_admin != null}
              />
            </div>
        )}

        {/* ── Error Popup Modal ────────────────────────────────────────── */}
        {popupMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 relative">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {popupMessage.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      {popupMessage.description}
                    </p>
                    {popupMessage.details && (
                        <p className="text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2.5 mt-3 text-slate-500 break-all leading-normal">
                          {popupMessage.details}
                        </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                      onClick={() => setPopupMessage(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                      onClick={() => {
                        setPopupMessage(null);
                        navigate('/adapters');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    Configure Adapters →
                  </button>
                </div>
              </div>
            </div>
        )}
      </>
  );
}