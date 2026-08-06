import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, DollarSign, Target, Hash,
  Cpu, Shield, MessageSquare, AlertTriangle, CheckCircle,
  XCircle, Copy, Zap,
  CheckCircle2, Loader2, Circle,
  Lock, Link2, GitBranch, Gauge,
} from 'lucide-react';
import Page from '../components/shared/Page';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, PhaseBadge, SatisfactionBadge, Spinner,
} from '../components/shared';
import { getIntent, getIntentEvents, getExecutionsByIntent, getPolicyEvaluations, listAdapters, listAudit } from '../utils/api';
import { formatCost, formatDate, formatTime, formatLatency, shortId, cn, PHASE_ORDER, describeAdapterError } from '../lib/utils';
import ReplayPanel from '../components/replay/ReplayPanel';

// ── helpers ───────────────────────────────────────────────────────────────────

// A retried intent can carry multiple execution_records rows for the same
// intent, all status=SUCCESS (a later attempt can be retried for reasons
// other than adapter failure — e.g. a quality-gate or SLA retry after a
// response was already produced). GET /intents/{id}/executions returns them
// ordered by attemptNumber ascending, so the row that actually determined
// the intent's terminal outcome — and the only one with quality scoring
// applied — is the LAST completed attempt, not the first.
function pickFinalExecution(executions) {
  const list = executions ?? [];
  if (list.length === 0) return undefined;
  const completed = list.filter(e => e.status === 'COMPLETED' || e.status === 'SUCCESS');
  const pool = completed.length > 0 ? completed : list;
  return pool.reduce((latest, e) => (e.attemptNumber ?? 0) >= (latest.attemptNumber ?? 0) ? e : latest);
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-start py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-500 w-36 shrink-0 pt-0.5">{label}</span>
      <span className={cn('text-sm text-slate-800 font-semibold flex-1 break-all',
        mono && 'font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs font-medium text-slate-600')}
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
function PolicyOutcomeCard({ policyEvals, events, satisfactionState, violationReason, constraints, bare = false }) {
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
    const adapterHint = describeAdapterError(violationReason);
    if (adapterHint) hints.push(adapterHint);
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

  const body = (
      <>
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
      </>
  );

  if (bare) return body;

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
      <CardContent>{body}</CardContent>
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
  // registered in DB, but adapterName is joined from the adapters table.
  // Uses the final attempt (pickFinalExecution), not the first — a retry can
  // fall back to a different adapter than the one the first attempt used.
  const execRecord = pickFinalExecution(executions);

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
        <div className="flex items-center justify-between">
          <SectionHeader
            icon={<Cpu size={13} className="text-slate-400" />}
            title="Adapter"
            badge={displayName ?? undefined}
          />
          {hasAnyInfo && (
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                displayActive
                  ? 'bg-green-50 text-green-700'
                  : 'bg-slate-100 text-slate-500'
              )}>
                {displayActive ? 'Active' : 'Inactive'}
              </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasAnyInfo ? (
          <>
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

// Shared column styling — used by every multi-column smart response view
// (Decision/Reason/Evidence, Fraud risk/recommendation/factors, etc.) so they
// all read as the same visual language instead of each view inventing its own.
const RESPONSE_COL_STYLE = { background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: 16 };
const RESPONSE_HEAD_STYLE = { fontSize: 10, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 };

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

// Only APPROVE/REVIEW/DECLINE (and close synonyms) get the compact colored
// badge treatment — that styling assumes a short label. A longer free-text
// recommendation (a full sentence, as some adapters return) is rendered as
// plain prose instead of being forced into the small pill, which previously
// produced an oversized, alarming-looking uppercase warning box for what was
// really just an instructional note.
const RECOMMENDATION_STYLES = {
  APPROVE:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', icon: '✓' },
  APPROVED: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', icon: '✓' },
  REVIEW:   { bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: '!' },
  DECLINE:  { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: '✗' },
  DECLINED: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: '✗' },
  REJECT:   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: '✗' },
};

function RecommendationBadge({ value }) {
  const s = RECOMMENDATION_STYLES[value?.toUpperCase()];
  if (!s) {
    // Not a recognised short label — show as plain text, not a forced badge.
    return <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{value}</p>;
  }
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: s.bg, border: `1.5px solid ${s.border}` }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.icon}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: s.color, letterSpacing: '0.5px' }}>{value?.toUpperCase()}</span>
    </div>
  );
}

// Same 3-column visual language as DecisionColumnsView — Risk / Recommendation
// & reasoning / Risk factors — so every smart response view reads consistently.
function FraudDetectionView({ data }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
      <div style={RESPONSE_COL_STYLE}>
        <p style={RESPONSE_HEAD_STYLE}>Risk</p>
        <RiskGauge score={data.riskScore} />
      </div>

      <div style={RESPONSE_COL_STYLE}>
        <p style={RESPONSE_HEAD_STYLE}>Recommendation</p>
        {data.recommendation ? <RecommendationBadge value={data.recommendation} /> : <p style={{ fontSize: 12, color: '#94a3b8' }}>—</p>}
        {data.reasoning && (
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginTop: 10 }}>{data.reasoning}</p>
        )}
      </div>

      <div style={RESPONSE_COL_STYLE}>
        <p style={RESPONSE_HEAD_STYLE}>Risk factors</p>
        {data.riskFactors?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.riskFactors.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>⚠</span>
                <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: '#94a3b8' }}>No risk factors flagged</p>
        )}
      </div>
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

// ── Decision / Reason / Evidence highlights — 3-column layout matching the
// reference mockup. Decision + confidence + risk are real top-level fields;
// Reason renders the real reasoning text/array; Evidence highlights lists
// whatever OTHER real fields the response actually carries (not a fabricated
// checklist — there's no separate "evidence" endpoint or field, so this
// column is exactly what's left of the real payload after Decision/Reason
// are pulled out).
function DecisionColumnsView({ data }) {
  const decision   = data.decision ?? data.verdict ?? (data.recommendation && data.decision === undefined ? data.recommendation : null);
  const confidence = data.confidence ?? data.confidenceScore ?? null;
  const riskLevel  = data.risk_level ?? data.riskLevel ?? null;
  const reasonText = data.reasoning ?? data.reason ?? null;
  const reasonsList = Array.isArray(data.reasons) ? data.reasons : null;

  const usedKeys = ['decision','verdict','recommendation','confidence','confidenceScore','risk_level','riskLevel','reasoning','reason','reasons'];
  const remaining = Object.entries(data).filter(([k]) => !usedKeys.includes(k));

  const DECISION_STYLE = {
    APPROVE: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', icon: '✓' },
    APPROVED: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', icon: '✓' },
    REVIEW: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: '!' },
    DECLINE: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: '✗' },
    REJECT: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: '✗' },
    REJECTED: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: '✗' },
  };
  const dStyle = DECISION_STYLE[String(decision ?? '').toUpperCase()] ?? { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', icon: '•' };
  const confPct = confidence != null ? (confidence <= 1 ? confidence * 100 : confidence) : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
      <div style={RESPONSE_COL_STYLE}>
        <p style={RESPONSE_HEAD_STYLE}>Decision</p>
        {decision && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: dStyle.bg, border: `1.5px solid ${dStyle.border}`, marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: dStyle.color }}>{dStyle.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: dStyle.color }}>{String(decision).toUpperCase()}</span>
          </div>
        )}
        {confPct != null && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>Confidence score</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>{confPct.toFixed(0)}%</p>
            <div style={{ height: 5, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginTop: 4 }}>
              <div style={{ height: '100%', width: `${confPct}%`, background: confPct >= 80 ? '#16a34a' : confPct >= 50 ? '#d97706' : '#dc2626', borderRadius: 4 }} />
            </div>
          </div>
        )}
        {riskLevel && (
          <div>
            <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>Risk level</p>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: '#f1f5f9', color: '#475569' }}>{String(riskLevel)}</span>
          </div>
        )}
        {!decision && confPct == null && !riskLevel && <p style={{ fontSize: 12, color: '#94a3b8' }}>—</p>}
      </div>

      <div style={RESPONSE_COL_STYLE}>
        <p style={RESPONSE_HEAD_STYLE}>Reason</p>
        {reasonText && <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: reasonsList ? 10 : 0 }}>{reasonText}</p>}
        {reasonsList && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {reasonsList.map((r, i) => (
              <span key={i} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                {String(r).replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
        {!reasonText && !reasonsList && <p style={{ fontSize: 12, color: '#94a3b8' }}>No reasoning provided</p>}
      </div>

      <div style={RESPONSE_COL_STYLE}>
        <p style={RESPONSE_HEAD_STYLE}>Evidence highlights</p>
        {remaining.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {remaining.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 12, color: '#374151' }}>
                  <span style={{ color: '#64748b' }}>{k.replace(/_/g, ' ')}:</span>{' '}
                  {Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : String(v)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: '#94a3b8' }}>No additional detail beyond decision and reason</p>
        )}
      </div>
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
  const isDecision   = !isFraud && (parsed?.decision !== undefined || parsed?.verdict !== undefined);
  const isSentiment  = !isDecision && (type.includes('sentiment') || (parsed?.sentiment !== undefined));
  const isClassify   = !isDecision && (type.includes('classif') || (parsed?.label !== undefined && parsed?.confidence !== undefined));
  const isCompliance = !isDecision && (type.includes('compliance') || type.includes('audit') || (parsed?.passed !== undefined || parsed?.compliant !== undefined));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {isJson ? (isFraud ? 'Fraud Risk Assessment' : isDecision ? 'Decision' : isSentiment ? 'Sentiment Analysis' : isClassify ? 'Classification Result' : isCompliance ? 'Compliance Check' : 'Structured Response') : 'Adapter Response'}
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
          {isDecision   && <DecisionColumnsView data={parsed} />}
          {isSentiment  && <SentimentView data={parsed} />}
          {isClassify   && <ClassificationView data={parsed} />}
          {isCompliance && <ComplianceView data={parsed} />}
          {!isFraud && !isDecision && !isSentiment && !isClassify && !isCompliance && <GenericJsonView data={parsed} />}
        </div>
      )}
    </div>
  );
}

function DecisionOutputCard({ executions, stepper }) {
  const [showRaw,    setShowRaw]    = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Use the most recent completed execution
  const exec = pickFinalExecution(executions);

  if (!exec) {
    return (
      <Card>
        <ExecutionStepper {...stepper} />
        <div className="px-5 pb-5">
          <p className="text-sm text-slate-400 text-center py-4">
            No execution record yet — output appears when execution completes.
          </p>
        </div>
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
      <ExecutionStepper {...stepper} />
      <CardContent className="space-y-4 pt-4">

        {hasResponse && (
            <div className="flex justify-end -mt-2 -mb-1">
              <button onClick={copyResponse}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                <Copy size={10} />{copiedText ? 'Copied!' : 'Copy response'}
              </button>
            </div>
        )}

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

// ── Execution stepper — real phases, real per-phase timestamps ───────────────
// Same PHASE_ORDER/status logic as the vertical ExecutionTimeline, laid out
// horizontally with a timestamp under each step where an event recorded one.
// "Received" is CREATED under a friendlier label — no invented phases (the
// backend has no separate Policy Evaluation/Adapter Selection/Prompt Assembly
// phases, so those aren't shown as distinct steps).
const STEP_META = [
  { phase: 'CREATED',    label: 'Received'  },
  { phase: 'PLANNING',   label: 'Planning'  },
  { phase: 'PLANNED',    label: 'Planned'   },
  { phase: 'EXECUTING',  label: 'Executing' },
  { phase: 'EVALUATING', label: 'Validation'},
  { phase: 'COMPLETED',  label: 'Completed' },
];

function stepStatus(phase, currentPhase, terminal, satisfied) {
  const cur = PHASE_ORDER.indexOf(currentPhase);
  const idx = PHASE_ORDER.indexOf(phase);
  if (terminal) {
    if (idx < PHASE_ORDER.length - 1) return 'done';
    return satisfied ? 'done' : 'failed';
  }
  if (idx < cur)   return 'done';
  if (idx === cur) return 'active';
  return 'pending';
}

function phaseTimestamp(events, phase, isFirst) {
  const found = (events ?? []).find(e => e.phaseTo === phase);
  if (found?.occurredAt) return found.occurredAt;
  if (isFirst && events?.[0]?.occurredAt) return events[0].occurredAt;
  return null;
}

// Real inline sub-detail per step, sourced from the execution record —
// no invented "Adapter Selection"/"Prompt Assembly" phases, just real facts
// (adapter used, token count, latency, quality) attached to the closest real
// phase that actually produced them.
function stepDetail(phase, exec, satisfied, terminal) {
  if (phase === 'EXECUTING') {
    const bits = [];
    if (exec?.adapterName) bits.push(exec.adapterName);
    if (exec?.latencyMs) bits.push(formatLatency(exec.latencyMs));
    return bits.join(' · ') || null;
  }
  if (phase === 'EVALUATING') {
    const bits = [];
    if (exec?.qualityScore != null) bits.push(`Quality ${(exec.qualityScore * 100).toFixed(0)}%`);
    if (exec?.totalTokens) bits.push(`${exec.totalTokens.toLocaleString()} tokens`);
    return bits.join(' · ') || null;
  }
  if (phase === 'COMPLETED' && terminal) {
    return satisfied ? 'Satisfied' : 'Violated';
  }
  return null;
}

function ExecutionStepper({ events, currentPhase, terminal, satisfied, exec }) {
  return (
    <div className="p-5 pb-4">
      <div className="flex items-stretch overflow-x-auto">
        {STEP_META.map(({ phase, label }, i) => {
          const status = stepStatus(phase, currentPhase, terminal, satisfied);
          const isLast = i === STEP_META.length - 1;
          const ts = phaseTimestamp(events, phase, i === 0);
          const detail = stepDetail(phase, exec, satisfied, terminal);
          const Icon = status === 'done' ? CheckCircle2
            : status === 'active' ? Loader2
            : status === 'failed' ? XCircle
            : Circle;
          return (
            <div key={phase} className="flex items-center flex-1 min-w-[110px]">
              <div className="flex flex-col items-center gap-1.5 px-1 text-center">
                <Icon size={18} className={cn(
                  status === 'done'   && 'text-green-500',
                  status === 'active' && 'text-blue-600 animate-spin',
                  status === 'failed' && 'text-red-500',
                  status === 'pending' && 'text-slate-300',
                )} />
                <span className={cn('text-xs font-medium', {
                  done: 'text-slate-700', active: 'text-blue-700',
                  pending: 'text-slate-400', failed: 'text-red-600',
                }[isLast && terminal && !satisfied ? 'failed' : status])}>
                  {label}
                </span>
                <span className="text-[10px] text-slate-400">{ts ? formatTime(ts) : '—'}</span>
                {detail && (
                    <span className={cn('text-[10px] font-medium',
                        isLast && terminal ? (satisfied ? 'text-green-600' : 'text-red-600') : 'text-blue-600')}>
                      {detail}
                    </span>
                )}
              </div>
              {!isLast && (
                <div className={cn('h-px flex-1 mx-1', status === 'done' ? 'bg-green-200' : 'bg-slate-100')} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Execution flow — same real phase/timestamp/detail data as the stepper
// above, rendered as the mockup's blue icon-row. Replaces the Adapter card
// here; adapter ID/provider/model/region/attempt-history data that card
// showed is no longer surfaced anywhere on this page.
function ExecutionFlowRow({ events, currentPhase, terminal, satisfied, exec }) {
  const ICONS = { CREATED: Hash, PLANNING: Target, PLANNED: Target, EXECUTING: Cpu, EVALUATING: Shield, COMPLETED: CheckCircle2 };
  return (
      <Card className="p-5">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Execution flow</p>
        <div className="flex items-center overflow-x-auto gap-1">
          {STEP_META.map(({ phase, label }, i) => {
            const status = stepStatus(phase, currentPhase, terminal, satisfied);
            const isLast = i === STEP_META.length - 1;
            const ts = phaseTimestamp(events, phase, i === 0);
            const detail = stepDetail(phase, exec, satisfied, terminal);
            const StepIcon = ICONS[phase] ?? Circle;
            return (
                <div key={phase} className="flex items-center flex-1 min-w-[110px]">
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center',
                        status === 'done' ? 'bg-green-50 text-green-600'
                        : status === 'active' ? 'bg-blue-50 text-blue-600'
                        : status === 'failed' ? 'bg-red-50 text-red-600'
                        : 'bg-slate-50 text-slate-300')}>
                      <StepIcon size={16} />
                    </div>
                    <span className="text-xs font-medium text-slate-700">{label}</span>
                    <span className={cn('text-[10px]', isLast && terminal ? (satisfied ? 'text-green-600 font-medium' : 'text-red-600 font-medium') : 'text-slate-400')}>
                      {detail || (ts ? formatTime(ts) : '—')}
                    </span>
                  </div>
                  {!isLast && <div className="h-px flex-1 bg-slate-100 mx-1" />}
                </div>
            );
          })}
        </div>
      </Card>
  );
}

// ── Execution trace tab — real event stream with distributed-trace IDs ───────
function ExecutionTraceTab({ events }) {
  if (!events?.length) {
    return <p className="text-sm text-slate-400 text-center py-6">No events recorded yet.</p>;
  }
  return (
    <div className="space-y-1.5 max-h-96 overflow-y-auto">
      {events.map((e, i) => (
        <div key={e.id ?? i} className="flex items-start justify-between gap-3 py-2 px-3 rounded-lg border border-slate-100 bg-slate-50 text-xs">
          <div className="min-w-0">
            <span className="font-medium text-slate-700">
              {e.eventType}
              {(e.phaseFrom || e.phaseTo) && (
                <span className="text-slate-400 font-normal ml-1.5">
                  {e.phaseFrom ?? '—'} → {e.phaseTo ?? '—'}
                </span>
              )}
            </span>
            {(e.traceId || e.spanId) && (
              <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                {e.traceId && `trace ${shortId(e.traceId)}`}{e.traceId && e.spanId && ' · '}{e.spanId && `span ${shortId(e.spanId)}`}
              </p>
            )}
          </div>
          <span className="text-slate-400 shrink-0">{formatTime(e.occurredAt)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Tabbed detail — Response/JSON/Policy Evaluation/Execution Trace only.
// Prompt/Audit Trail/Attachments were dropped entirely rather than shown
// locked — no backend to invoke for any of them (prompts aren't persisted,
// there's no per-intent audit-log filter, and there's no document/attachment
// model at all), so there's nothing to grow into later without new backend
// work first; removed rather than greyed out.
function DetailTabs({ executions, policyEvals, events, intent }) {
  const [tab, setTab] = useState('response');
  const exec = pickFinalExecution(executions);
  const parsed = exec?.responseText ? tryParseJson(exec.responseText) : null;

  const TABS = [
    { key: 'response', label: 'Response' },
    { key: 'json',     label: 'JSON' },
    { key: 'policy',   label: 'Policy Evaluation', count: policyEvals?.length || undefined },
    { key: 'trace',    label: 'Execution Trace' },
  ];

  return (
    <Card>
      <div className="flex items-center gap-1 px-3 pt-3 border-b border-slate-100 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            disabled={t.disabled}
            title={t.disabled ? t.reason : undefined}
            onClick={() => !t.disabled && setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap transition-colors',
              t.disabled
                ? 'text-slate-300 cursor-not-allowed'
                : tab === t.key
                  ? 'text-blue-700 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
            )}>
            {t.disabled && <Lock size={10} />}
            {t.label}
            {t.count != null && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400">{t.count}</span>
            )}
          </button>
        ))}
      </div>
      <CardContent>
        {tab === 'response' && <SmartResponseRenderer responseText={exec?.responseText} intentType={exec?.intentType ?? intent?.intentType} />}
        {tab === 'json' && (
          <div style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
            {parsed ? JSON.stringify(parsed, null, 2) : (exec?.responseText || 'No response yet')}
          </div>
        )}
        {tab === 'policy' && (
          <PolicyOutcomeCard
            policyEvals={policyEvals} events={events}
            satisfactionState={intent.satisfactionState}
            violationReason={intent.violationReason}
            constraints={intent.constraints}
            bare
          />
        )}
        {tab === 'trace' && <ExecutionTraceTab events={events} />}
      </CardContent>
    </Card>
  );
}

// ── Execution summary — real fields from the execution record; Model Version
// and Region are not tracked per-execution anywhere (adapters only carry a
// model name, no pinned version; region lives on the adapter, not joined
// into ExecutionRecordResponse) — shown greyed rather than invented.
function ExecutionSummaryCard({ exec }) {
  return (
    <Card>
      <CardHeader><CardTitle>Execution summary</CardTitle></CardHeader>
      <CardContent className="space-y-0">
        <Row label="Execution ID" value={exec ? shortId(exec.id) : '—'} mono />
        <Row label="Timestamp"    value={exec?.executedAt ? formatDate(exec.executedAt) : '—'} />
        <Row label="Duration"     value={exec ? formatLatency(exec.latencyMs) : '—'} />
        <Row label="Total tokens" value={exec?.totalTokens != null ? exec.totalTokens.toLocaleString() : '—'} />
        <Row label="Total cost"   value={exec?.costUsd != null ? formatCost(exec.costUsd) : '—'} />
        <Row label="Adapter used" value={exec?.adapterName ?? '—'} />
        <div className="flex items-start py-2 opacity-40" title="Not tracked — adapters store a model name, not a pinned version">
          <span className="text-sm text-slate-400 w-40 shrink-0 pt-0.5">Model version</span>
          <span className="text-sm text-slate-400 flex-1 flex items-center gap-1"><Lock size={10} /> Unavailable</span>
        </div>
        <div className="flex items-start py-2 opacity-40" title="Region is not recorded on the execution record">
          <span className="text-sm text-slate-400 w-40 shrink-0 pt-0.5">Region</span>
          <span className="text-sm text-slate-400 flex-1 flex items-center gap-1"><Lock size={10} /> Unavailable</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Governance status — Policy Compliant / No Policy Violations are derived
// from real policy_evaluations rows. Audit Enabled and PII Protection Applied
// are backed by audit_log rows fetched per-intent (GET /api/audit?entityId=).
// PiiMaskingGuardService.scanAndMask() runs unconditionally before every LLM
// call (decisionmesh-application/.../DecisionmeshOrchestrator.java), so any
// INTENT_EXECUTED audit row is proof the guard ran for this intent; decision
// === 'MASKED' additionally means it found and redacted real PII. Explainability
// Enabled was removed — no per-intent flag anywhere in the domain model, and
// this page shows real fields only rather than greying out placeholders.
function GovernanceStatusCard({ policyEvals, satisfactionState, auditRows }) {
  const blocked = (policyEvals ?? []).filter(e => e.result === 'BLOCKED');
  const executed = (auditRows ?? []).filter(a => a.action === 'INTENT_EXECUTED');
  const masked = executed.some(a => a.decision === 'MASKED');
  const items = [
    { label: 'Policy compliant',    real: true, ok: satisfactionState !== 'VIOLATED' },
    { label: 'No policy violations',real: true, ok: blocked.length === 0 },
    { label: 'Audit enabled',       real: executed.length > 0, ok: true },
    {
      label: 'PII protection applied',
      real: executed.length > 0,
      ok: true,
      detail: executed.length > 0 ? (masked ? 'PII detected & redacted' : 'no PII detected') : undefined,
    },
  ];
  return (
    <Card>
      <CardHeader><CardTitle>Governance status</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {items.map(it => (
          <div key={it.label} className={cn('flex items-center gap-2 text-sm', !it.real && 'opacity-40')}
            title={!it.real ? 'No per-intent field for this yet' : it.detail}>
            {it.real
              ? (it.ok ? <CheckCircle2 size={14} className="text-green-500 shrink-0" /> : <XCircle size={14} className="text-red-500 shrink-0" />)
              : <Lock size={12} className="text-slate-300 shrink-0" />}
            <span className={it.real ? 'text-slate-800 font-medium' : 'text-slate-400'}>
              {it.label}{it.real && it.detail ? ` — ${it.detail}` : ''}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Performance — Latency is the only figure the platform actually measures
// (execution record). Time to First Token and Throughput were removed — no
// adapter reports first-token timing or tokens/sec.
function PerformanceCard({ exec }) {
  return (
    <Card>
      <CardHeader><CardTitle>Performance</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 font-medium flex items-center gap-1.5"><Gauge size={12} />Latency</span>
          <span className="font-semibold text-slate-800">{exec ? formatLatency(exec.latencyMs) : '—'}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Next actions — Share Result and Create Follow-up Intent are genuinely
// wireable with existing backend (clipboard copy; Playground already accepts
// a pre-fill payload via navigation state). Download Report and Add to
// Library were removed — no report generator and no POST on the
// intent-library resource exist to back them.
function NextActionsCard({ intent, navigate }) {
  const [copied, setCopied] = useState(false);

  function shareResult() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function createFollowUp() {
    navigate('/playground', {
      state: {
        intentPayload: JSON.stringify({
          intentType:  intent.intentType,
          objective:   intent.objective,
          constraints: intent.constraints,
          budget:      intent.budget,
        }, null, 2),
      },
    });
  }

  return (
    <Card>
      <CardHeader><CardTitle>Next actions</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <button onClick={shareResult}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
          <Link2 size={13} />{copied ? 'Link copied!' : 'Share result'}
        </button>
        <button onClick={createFollowUp}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
          <GitBranch size={13} />Create follow-up intent
        </button>
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
  const [auditRows,    setAuditRows]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [fetching,     setFetching]     = useState(false);

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const [intentData, eventsData, execData, adaptersData, policyData, auditData] =
        await Promise.allSettled([
          getIntent(keycloak, intentId),
          getIntentEvents(keycloak, intentId),
          getExecutionsByIntent(keycloak, intentId),
          listAdapters(keycloak),
          getPolicyEvaluations(keycloak, intentId),
          // from=epoch disables the endpoint's 30-day default window — an
          // older intent's audit trail must not silently read as "no data".
          listAudit(keycloak, { entityType: 'INTENT', entityId: intentId, from: '1970-01-01T00:00:00Z', size: 50 }),
        ]);
      if (intentData.value)   setIntent(intentData.value);
      if (eventsData.value)   setEvents(eventsData.value ?? []);
      if (execData.value)     setExecutions(execData.value ?? []);
      if (adaptersData.value) setAdapters(adaptersData.value ?? []);
      if (policyData.value)   setPolicyEvals(policyData.value ?? []);
      if (auditData.value)    setAuditRows(auditData.value?.content ?? []);
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

  const exec = pickFinalExecution(executions);

  // Real outcome sentence — derived from satisfactionState/terminal, not
  // hardcoded — mirrors the mockup's "executed successfully" tone for
  // whatever the actual outcome is, good or bad.
  const outcome = intent.satisfactionState === 'SATISFIED' ? 'executed successfully'
    : intent.satisfactionState === 'VIOLATED' ? 'violated policy constraints'
    : intent.terminal ? 'completed'
    : 'is executing…';

  return (
    <Page
      title={
        <span className="inline-flex items-center gap-2">
          Intent Execution
          <PhaseBadge phase={intent.phase} />
          <SatisfactionBadge state={intent.satisfactionState} />
        </span>
      }
      subtitle={`${intent.intentType} ${outcome} · ${shortId(intent.id)} · Created ${formatDate(intent.createdAt)}`}
      action={
        <div className="flex items-center gap-2">
          {!intent.terminal && (
            <span className="flex items-center gap-1.5 text-xs text-blue-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />Live
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => navigate('/intents')}>
            <ArrowLeft size={13} /> View in history
          </Button>
          <Button variant="secondary" size="sm" loading={fetching} onClick={load}>
            <RefreshCw size={13} /> Refresh
          </Button>
          <Button size="sm" onClick={() => navigate('/playground')}>
            New execution
          </Button>
        </div>
      }
    >
      <div className="space-y-5">

        {/* Stepper + Decision output — merged into one card */}
        <DecisionOutputCard
            executions={executions}
            stepper={{
              events,
              currentPhase: intent.phase,
              terminal: intent.terminal,
              satisfied: intent.satisfactionState === 'SATISFIED',
              exec,
            }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <DetailTabs executions={executions} policyEvals={policyEvals} events={events} intent={intent} />
            <ReplayPanel intentId={intentId} keycloak={keycloak} satisfactionState={intent?.satisfactionState} />

            {/* ── Request — what was submitted, moved directly under Replay
                so it reads next to the governance/replay context above it. ── */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Request</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <Card>
                  <CardHeader>
                    <SectionHeader icon={<DollarSign size={13} className="text-slate-400" />} title="Budget" />
                  </CardHeader>
                  <CardContent>
                    {intent.budget ? (
                      <>
                        <Row label="Ceiling"  value={formatCost(intent.budget.ceilingUsd)} />
                        <Row label="Spent"    value={formatCost(intent.budget.spentUsd)} />
                        <Row label="Exceeded" value={intent.budget.exceeded
                          ? <span className="text-red-600 font-semibold">Yes</span>
                          : 'No'
                        } />
                      </>
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-3">No budget defined</p>
                    )}
                  </CardContent>
                </Card>

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
                      </>
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-3">No constraints defined</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <SectionHeader icon={<Hash size={13} className="text-slate-400" />} title="Objective" />
                  </CardHeader>
                  <CardContent>
                    {intent.objective ? (() => {
                      const obj = intent.objective;
                      const description = obj.description ?? obj.task ?? obj.goal ?? null;
                      return description ? (
                        <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">{description}</p>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No description provided</p>
                      );
                    })() : (
                      <p className="text-sm text-slate-400 text-center py-3">No objective defined</p>
                    )}
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>

          <div className="space-y-4">
            <ExecutionSummaryCard exec={exec} />
            <GovernanceStatusCard policyEvals={policyEvals} satisfactionState={intent.satisfactionState} auditRows={auditRows} />
            <PerformanceCard exec={exec} />
            <NextActionsCard intent={intent} navigate={navigate} />
          </div>
        </div>

      </div>
    </Page>
  );
}
