import { useState } from 'react';
import { RotateCcw, ShieldCheck, ShieldX, AlertTriangle, Lock, Loader2, ClipboardCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../shared';
import { formatDate, cn } from '../../lib/utils';

async function fetchReplay(keycloak, intentId) {
  const base = import.meta.env.VITE_API_BASE_URL ?? '/api';
  const res = await fetch(`${base}/governance/replay/${intentId}`, {
    headers: { Authorization: `Bearer ${keycloak?.token}` },
  });
  if (!res.ok) throw new Error(`Replay failed: ${res.status}`);
  return res.json();
}

export default function ReplayPanel({ intentId, keycloak, satisfactionState }) {
  const [state, setState] = useState('idle');
  const [data,  setData]  = useState(null);
  const [error, setError] = useState(null);

  const isPendingReview = satisfactionState === 'UNKNOWN';

  function runReplay() {
    if (isPendingReview) return;
    setState('loading');
    setError(null);
    fetchReplay(keycloak, intentId)
      .then(result => { setData(result); setState('done'); })
      .catch(err  => { setError(err.message); setState('error'); });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw size={14} className="text-slate-500" />
            <span className="font-semibold text-sm text-slate-700">Deterministic Replay</span>
          </div>
          <div className="flex items-center gap-2">
            {isPendingReview && (
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                Awaiting human review
              </span>
            )}
            <button
              onClick={runReplay}
              disabled={isPendingReview || state === 'loading'}
              title={isPendingReview ? 'Replay available after human review decision' : 'Run governance replay'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw size={11} className={state === 'loading' ? 'animate-spin' : ''} />
              {state === 'loading' ? 'Loading...' : state === 'done' ? 'Re-run' : state === 'error' ? 'Retry' : 'Run Replay'}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isPendingReview && (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-amber-50 border border-amber-200">
              <ClipboardCheck size={20} className="text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Replay not available yet</p>
            <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
              This intent is <strong>pending human review</strong>. The governance ledger will be
              available for replay after a decision is made in the Review Queue.
            </p>
            <a href="/review-queue"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors">
              <ClipboardCheck size={12} />
              Go to Review Queue
            </a>
          </div>
        )}
        {!isPendingReview && state === 'idle' && (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-blue-50">
              <RotateCcw size={20} className="text-blue-600" />
            </div>
            <p className="text-sm font-medium text-slate-700">Reconstruct this decision</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Replay loads the immutable governance ledger and verifies the cryptographic hash chain.
            </p>
          </div>
        )}
        {!isPendingReview && state === 'loading' && (
          <div className="py-8 flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <p className="text-sm text-slate-500">Loading governance ledger...</p>
          </div>
        )}
        {!isPendingReview && state === 'error' && (
          <div className="py-6 text-center">
            <AlertTriangle size={20} className="text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">Replay failed</p>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
          </div>
        )}
        {!isPendingReview && state === 'done' && data && (
          <div>
            <div className="flex items-center gap-3 p-3 rounded-lg border mb-4"
              style={{ background: data.chainValid ? '#f0fdf4' : '#fef2f2', borderColor: data.chainValid ? '#bbf7d0' : '#fecaca' }}>
              {data.chainValid ? <ShieldCheck size={16} className="text-green-600 shrink-0" /> : <ShieldX size={16} className="text-red-600 shrink-0" />}
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: data.chainValid ? '#15803d' : '#b91c1c' }}>
                  {data.chainValid ? 'Governance chain intact' : 'Chain integrity compromised'}
                </p>
                <p className="text-xs" style={{ color: data.chainValid ? '#16a34a' : '#dc2626' }}>
                  {data.totalEvents ?? 0} decisions recorded
                  {data.summary && ` · ${data.summary.allowed} allowed · ${data.summary.denied} denied`}
                </p>
              </div>
            </div>
            {data.entries?.length > 0 ? (
              <div className="space-y-3">
                {data.entries.map((entry, i) => (
                  <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('text-xs font-bold uppercase px-2 py-0.5 rounded-full',
                        entry.decision === 'ALLOW' ? 'bg-green-50 text-green-700 border border-green-200' :
                        entry.decision === 'DENY'  ? 'bg-red-50 text-red-700 border border-red-200' :
                                                     'bg-amber-50 text-amber-700 border border-amber-200'
                      )}>{entry.decision}</span>
                      {entry.eventType && <span className="text-xs font-mono text-slate-400">{entry.eventType}</span>}
                      <span className={cn('text-xs flex items-center gap-1', entry.chainValid ? 'text-green-600' : 'text-red-600')}>
                        <Lock size={9} />{entry.chainValid ? 'Chain OK' : 'BROKEN'}
                      </span>
                    </div>
                    {entry.reason && <p className="text-xs text-slate-600 mt-1.5">{entry.reason}</p>}
                    <p className="text-xs text-slate-400 mt-1">{entry.timestamp ? formatDate(entry.timestamp) : ''} · v{entry.aggregateVersion}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No governance decisions recorded.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
