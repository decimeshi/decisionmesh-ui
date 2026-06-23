import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck, CheckCircle, XCircle, Clock, AlertTriangle,
  ExternalLink, RefreshCw, ChevronDown, ChevronUp, ShieldAlert,
  Brain, Zap, DollarSign, FileText
} from 'lucide-react';
import Page from '../components/shared/Page';
import { Card, EmptyState, Spinner, Button } from '../components/shared';
import { getReviewQueue, approveIntent, rejectIntent, getExecutionsByIntent } from '../utils/api';
import { formatRelative, formatDate, shortId } from '../lib/utils';

// ── Risk badge ────────────────────────────────────────────────────────────────
function RiskBadge({ score }) {
  if (score == null) return null;
  const pct = Math.round(score * 100);
  const [bg, text, label] =
    pct >= 80 ? ['bg-red-100',    'text-red-700',    'CRITICAL'] :
    pct >= 60 ? ['bg-orange-100', 'text-orange-700', 'HIGH']     :
    pct >= 40 ? ['bg-yellow-100', 'text-yellow-700', 'MEDIUM']   :
                ['bg-green-100',  'text-green-700',  'LOW'];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${bg} ${text}`}>
      <ShieldAlert size={10}/> {pct}% {label}
    </span>
  );
}

// ── Recommendation badge ───────────────────────────────────────────────────────
function RecBadge({ rec }) {
  if (!rec) return null;
  const map = {
    APPROVE:  ['bg-green-100 text-green-700 border-green-300', '✓ APPROVE'],
    DECLINE:  ['bg-red-100 text-red-700 border-red-300',       '✕ DECLINE'],
    REVIEW:   ['bg-amber-100 text-amber-700 border-amber-300', '⚠ REVIEW'],
  };
  const [cls, label] = map[rec] ?? ['bg-slate-100 text-slate-700 border-slate-200', rec];
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded border ${cls}`}>
      AI: {label}
    </span>
  );
}

// ── Intent type badge ─────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const colors = {
    fraud_detection:  'bg-red-50 text-red-700 border-red-200',
    compliance_check: 'bg-purple-50 text-purple-700 border-purple-200',
    approve_loan:     'bg-blue-50 text-blue-700 border-blue-200',
    kyc_verification: 'bg-teal-50 text-teal-700 border-teal-200',
  };
  const cls = colors[type] ?? 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${cls}`}>
      {type}
    </span>
  );
}

// ── AI Output Panel ───────────────────────────────────────────────────────────
function AiOutputPanel({ execution }) {
  if (!execution) return (
    <div className="mt-3 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-400 italic">
      Loading AI analysis…
    </div>
  );

  let parsed = null;
  try {
    if (execution.responseText) parsed = JSON.parse(execution.responseText);
  } catch (_) {}

  const riskScore    = parsed?.riskScore    ?? parsed?.risk_score    ?? null;
  const riskLevel    = parsed?.riskLevel    ?? parsed?.risk_level    ?? null;
  const recommendation = parsed?.recommendation ?? null;
  const reasoning    = parsed?.reasoning    ?? null;
  const riskFactors  = parsed?.riskFactors  ?? parsed?.risk_factors  ?? [];
  const complianceFlags = parsed?.complianceFlags ?? [];
  const violatedFrameworks = parsed?.violatedFrameworks ?? [];
  const reportingObligations = parsed?.reportingObligations ?? [];

  const riskPct = riskScore != null ? Math.round(riskScore * 100) : null;

  return (
    <div className="mt-3 border border-slate-200 rounded-lg overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
        <Brain size={13} className="text-blue-500 shrink-0"/>
        <span className="text-xs font-semibold text-slate-700">AI Analysis</span>
        <div className="flex items-center gap-2 ml-auto">
          {recommendation && <RecBadge rec={recommendation}/>}
          {riskPct != null && <RiskBadge score={riskScore}/>}
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Risk score bar */}
        {riskPct != null && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Risk Score</span>
              <span className="font-bold text-slate-700">{riskPct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  riskPct >= 80 ? 'bg-red-500' :
                  riskPct >= 60 ? 'bg-orange-400' :
                  riskPct >= 40 ? 'bg-yellow-400' : 'bg-green-500'
                }`}
                style={{ width: `${riskPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Risk factors */}
        {riskFactors.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1.5">Risk Factors</p>
            <ul className="space-y-1">
              {riskFactors.map((f, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <span className="text-red-400 mt-0.5 shrink-0">▸</span> {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Compliance flags */}
        {complianceFlags.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1.5">Compliance Flags</p>
            <ul className="space-y-1">
              {complianceFlags.map((f, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-amber-700">
                  <span className="mt-0.5 shrink-0">⚠</span> {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Violated frameworks */}
        {violatedFrameworks.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {violatedFrameworks.map((f, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Reporting obligations */}
        {reportingObligations.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1.5">Reporting Obligations</p>
            <ul className="space-y-1">
              {reportingObligations.map((r, i) => (
                <li key={i} className="text-xs text-purple-700 flex items-start gap-1.5">
                  <FileText size={10} className="mt-0.5 shrink-0"/> {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reasoning */}
        {reasoning && (
          <div className="bg-blue-50 rounded-lg px-3 py-2">
            <p className="text-xs font-medium text-blue-700 mb-1">AI Reasoning</p>
            <p className="text-xs text-blue-800 leading-relaxed">{reasoning}</p>
          </div>
        )}

        {/* Raw output if not JSON */}
        {!parsed && execution.responseText && (
          <div className="bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-xs font-medium text-slate-600 mb-1">AI Output</p>
            <p className="text-xs text-slate-700 leading-relaxed line-clamp-6">
              {execution.responseText}
            </p>
          </div>
        )}

        {/* Execution meta */}
        <div className="flex items-center gap-4 pt-1 border-t border-slate-100">
          {execution.latencyMs != null && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Zap size={10}/> {execution.latencyMs}ms
            </span>
          )}
          {execution.costUsd != null && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <DollarSign size={10}/> ${Number(execution.costUsd).toFixed(4)}
            </span>
          )}
          {execution.qualityScore != null && (
            <span className="text-xs text-slate-400">
              Quality: {Math.round(execution.qualityScore * 100)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────
function ReviewCard({ item, execution, onApprove, onReject, onNavigate }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="px-5 py-4 hover:bg-slate-50/50 transition-colors">
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <TypeBadge type={item.intentType}/>
            <span className="text-xs text-slate-400" title={formatDate(item.createdAt)}>
              {formatRelative(item.createdAt)}
            </span>
            <button
              onClick={() => setExpanded(e => !e)}
              className="ml-auto text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              {expanded ? <><ChevronUp size={12}/> Hide details</> : <><ChevronDown size={12}/> Show AI analysis</>}
            </button>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Intent ID: <span className="text-slate-700">{item.intentId ?? item.id}</span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNavigate}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View full intent detail"
          >
            <ExternalLink size={14}/>
          </button>
          <button
            onClick={onReject}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
              bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
          >
            <XCircle size={13}/> Reject
          </button>
          <button
            onClick={onApprove}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
              bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            <CheckCircle size={13}/> Approve
          </button>
        </div>
      </div>

      {/* Expanded AI output */}
      {expanded && <AiOutputPanel execution={execution}/>}
    </div>
  );
}

// ── Approve / Reject modal ────────────────────────────────────────────────────
function ActionModal({ intent, action, onConfirm, onCancel, loading }) {
  const [note, setNote] = useState('');
  const isApprove = action === 'approve';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          {isApprove
            ? <CheckCircle size={22} className="text-green-600"/>
            : <XCircle    size={22} className="text-red-600"/>}
          <h3 className="text-base font-semibold text-slate-800">
            {isApprove ? 'Approve Decision' : 'Reject Decision'}
          </h3>
        </div>
        <p className="text-sm text-slate-600 mb-1">
          Intent: <span className="font-mono text-xs">{shortId(intent.intentId ?? intent.id)}</span>
        </p>
        <p className="text-sm text-slate-600 mb-4">
          Type: <strong>{intent.intentType}</strong>
        </p>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          {isApprove ? 'Approval note (optional)' : 'Rejection reason (required)'}
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          placeholder={isApprove
            ? 'e.g. Verified income documents, risk acceptable'
            : 'e.g. High-risk transaction — requires manual investigation'}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {!isApprove && !note.trim() && (
          <p className="text-xs text-red-500 mt-1">Rejection reason is required</p>
        )}
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <button
            onClick={() => onConfirm(note)}
            disabled={loading || (!isApprove && !note.trim())}
            className={`flex-1 text-sm font-medium px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50
              ${isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {loading
              ? <Spinner className="w-4 h-4 mx-auto"/>
              : isApprove ? '✓ Approve' : '✕ Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReviewQueue({ keycloak }) {
  const navigate   = useNavigate();
  const [items,    setItems]    = useState([]);
  const [execMap,  setExecMap]  = useState({});  // intentId → execution record
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [modal,    setModal]    = useState(null);
  const [acting,   setActing]   = useState(false);
  const [toast,    setToast]    = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getReviewQueue(keycloak)
      .then(async data => {
        const list = Array.isArray(data) ? data : (data?.content ?? []);
        setItems(list);
        setLoading(false);

        // Fetch execution records for each pending intent in parallel
        const pending = list.filter(i => i.reviewStatus === 'PENDING' || !i.reviewStatus);
        const results = await Promise.allSettled(
          pending.map(item =>
            getExecutionsByIntent(keycloak, item.intentId ?? item.id)
              .then(execs => {
                const arr = Array.isArray(execs) ? execs : (execs?.content ?? []);
                // Use latest execution record
                const latest = arr.sort((a,b) =>
                  new Date(b.executedAt ?? b.executed_at ?? 0) -
                  new Date(a.executedAt ?? a.executed_at ?? 0))[0];
                return { id: item.intentId ?? item.id, exec: latest };
              })
          )
        );
        const map = {};
        results.forEach(r => {
          if (r.status === 'fulfilled' && r.value?.exec) {
            map[r.value.id] = r.value.exec;
          }
        });
        setExecMap(map);
      })
      .catch(err => {
        setError(err.message ?? 'Failed to load review queue');
        setLoading(false);
      });
  }, [keycloak]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const showToast = (msg, ok=true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleConfirm = async (note) => {
    const { intent, action } = modal;
    setActing(true);
    try {
      if (action === 'approve') {
        await approveIntent(keycloak, intent.intentId ?? intent.id, note);
        showToast('Decision approved — audit trail updated');
      } else {
        await rejectIntent(keycloak, intent.intentId ?? intent.id, note);
        showToast(`Decision rejected — ${note}`);
      }
      setModal(null);
      load();
    } catch (err) {
      showToast(err.message ?? 'Action failed', false);
    } finally {
      setActing(false);
    }
  };

  const pending  = items.filter(i => i.reviewStatus === 'PENDING'  || !i.reviewStatus);
  const reviewed = items.filter(i => i.reviewStatus === 'APPROVED' || i.reviewStatus === 'REJECTED');

  return (
    <Page
      title="Human Review Queue"
      subtitle={`${pending.length} pending decision${pending.length !== 1 ? 's' : ''} awaiting review`}
      action={
        <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''}/> Refresh
        </Button>
      }
    >
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white
          ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ActionModal
          intent={modal.intent}
          action={modal.action}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
          loading={acting}
        />
      )}

      {/* RBI banner */}
      <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0"/>
        <div className="text-xs text-amber-800">
          <span className="font-semibold">Human oversight required.</span> These AI decisions are
          pending your review. The AI analysis is shown below each decision to help you decide.
          Your approval or rejection is recorded in the immutable audit trail — satisfying
          RBI's human-oversight mandate for regulated AI decisions.
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error} — <button className="underline" onClick={load}>retry</button>
        </div>
      )}

      {/* Pending queue */}
      <Card className="mb-6">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <Clock size={15} className="text-amber-500"/>
          <span className="text-sm font-semibold text-slate-700">Pending Review</span>
          {pending.length > 0 && (
            <span className="ml-auto text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </div>

        {loading && !items.length ? (
          <div className="py-16 text-center"><Spinner className="mx-auto"/></div>
        ) : pending.length === 0 ? (
          <EmptyState
            icon={<CheckCircle size={22} className="text-green-500"/>}
            title="No pending decisions"
            description="All AI decisions have been reviewed. The queue is clear."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {pending.map(item => {
              const id = item.intentId ?? item.id;
              return (
                <ReviewCard
                  key={id}
                  item={item}
                  execution={execMap[id]}
                  onApprove={() => setModal({ intent: item, action: 'approve' })}
                  onReject={()  => setModal({ intent: item, action: 'reject'  })}
                  onNavigate={() => navigate(`/intents/${id}`)}
                />
              );
            })}
          </div>
        )}
      </Card>

      {/* Recently reviewed */}
      {reviewed.length > 0 && (
        <Card>
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <ClipboardCheck size={15} className="text-slate-400"/>
            <span className="text-sm font-semibold text-slate-700">Recently Reviewed</span>
            <span className="ml-auto text-xs text-slate-400">{reviewed.length} decisions</span>
          </div>
          <div className="divide-y divide-slate-50">
            {reviewed.slice(0, 10).map(item => (
              <div key={item.id ?? item.intentId} className="px-5 py-3 flex items-center gap-3">
                {item.reviewStatus === 'APPROVED'
                  ? <CheckCircle size={14} className="text-green-500 shrink-0"/>
                  : <XCircle    size={14} className="text-red-500 shrink-0"/>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <TypeBadge type={item.intentType}/>
                    <span className="text-xs text-slate-400">
                      {formatRelative(item.reviewedAt ?? item.updatedAt)}
                    </span>
                  </div>
                  {item.reviewNote && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{item.reviewNote}</p>
                  )}
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                  ${item.reviewStatus === 'APPROVED'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'}`}>
                  {item.reviewStatus}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </Page>
  );
}
