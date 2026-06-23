import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, CheckCircle, XCircle, Clock, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import Page from '../components/shared/Page';
import { Card, EmptyState, Spinner, Button } from '../components/shared';
import { getReviewQueue, approveIntent, rejectIntent } from '../utils/api';
import { formatRelative, formatDate, shortId } from '../lib/utils';

// ── Risk gauge ────────────────────────────────────────────────────────────────
function RiskBadge({ score }) {
  if (score == null) return null;
  const pct = Math.round(score * 100);
  const [bg, text] =
    pct >= 80 ? ['bg-red-100',    'text-red-700']    :
    pct >= 60 ? ['bg-orange-100', 'text-orange-700'] :
    pct >= 40 ? ['bg-yellow-100', 'text-yellow-700'] :
                ['bg-green-100',  'text-green-700'];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>
      {pct}% risk
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

// ── Approve / Reject modal ────────────────────────────────────────────────────
function ActionModal({ intent, action, onConfirm, onCancel, loading }) {
  const [note, setNote] = useState('');
  const isApprove = action === 'approve';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          {isApprove
            ? <CheckCircle size={22} className="text-green-600" />
            : <XCircle    size={22} className="text-red-600"   />}
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
              ${isApprove
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'}`}
          >
            {loading
              ? <Spinner className="w-4 h-4 mx-auto" />
              : isApprove ? '✓ Approve' : '✕ Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReviewQueue({ keycloak }) {
  const navigate = useNavigate();
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [modal,   setModal]   = useState(null);   // { intent, action }
  const [acting,  setActing]  = useState(false);
  const [toast,   setToast]   = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getReviewQueue(keycloak)
      .then(data => {
        setItems(Array.isArray(data) ? data : (data?.content ?? []));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message ?? 'Failed to load review queue');
        setLoading(false);
      });
  }, [keycloak]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 15s
  useEffect(() => {
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleConfirm = async (note) => {
    const { intent, action } = modal;
    setActing(true);
    try {
      if (action === 'approve') {
        await approveIntent(keycloak, intent.intentId ?? intent.id, note);
        showToast(`Decision approved — audit trail updated`);
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
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </Button>
      }
    >
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all
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

      {/* Info banner */}
      <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800">
          These AI decisions require human review before taking effect. Your approval or rejection
          is recorded in the immutable audit trail. This satisfies RBI's human-oversight mandate
          for regulated AI decisions.
        </p>
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
          <Clock size={15} className="text-amber-500" />
          <span className="text-sm font-semibold text-slate-700">Pending Review</span>
          {pending.length > 0 && (
            <span className="ml-auto text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </div>

        {loading && !items.length ? (
          <div className="py-16 text-center"><Spinner className="mx-auto" /></div>
        ) : pending.length === 0 ? (
          <EmptyState
            icon={<CheckCircle size={22} className="text-green-500" />}
            title="No pending decisions"
            description="All AI decisions have been reviewed. The queue is clear."
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {pending.map(item => (
              <div key={item.id ?? item.intentId} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <TypeBadge type={item.intentType} />
                      {item.riskScore != null && <RiskBadge score={item.riskScore} />}
                      <span className="text-xs text-slate-400" title={formatDate(item.createdAt)}>
                        {formatRelative(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-mono mb-1">
                      Intent: {shortId(item.intentId ?? item.id)}
                    </p>

                    {item.aiRecommendation && (
                      <p className="text-sm text-slate-700 mt-1">
                        <span className="font-medium">AI recommendation:</span>{' '}
                        <span className={`font-semibold
                          ${item.aiRecommendation === 'APPROVE' ? 'text-green-600' :
                            item.aiRecommendation === 'DECLINE' ? 'text-red-600' : 'text-amber-600'}`}>
                          {item.aiRecommendation}
                        </span>
                      </p>
                    )}

                    {item.reasoning && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.reasoning}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/intents/${item.intentId ?? item.id}`)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="View full intent detail"
                    >
                      <ExternalLink size={14} />
                    </button>
                    <button
                      onClick={() => setModal({ intent: item, action: 'reject' })}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                        bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                    <button
                      onClick={() => setModal({ intent: item, action: 'approve' })}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                        bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recently reviewed */}
      {reviewed.length > 0 && (
        <Card>
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <ClipboardCheck size={15} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Recently Reviewed</span>
            <span className="ml-auto text-xs text-slate-400">{reviewed.length} decisions</span>
          </div>
          <div className="divide-y divide-slate-50">
            {reviewed.slice(0, 10).map(item => (
              <div key={item.id ?? item.intentId} className="px-5 py-3 flex items-center gap-3">
                {item.reviewStatus === 'APPROVED'
                  ? <CheckCircle size={14} className="text-green-500 shrink-0" />
                  : <XCircle    size={14} className="text-red-500 shrink-0"   />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <TypeBadge type={item.intentType} />
                    <span className="text-xs text-slate-400">{formatRelative(item.reviewedAt ?? item.updatedAt)}</span>
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
