import { useState } from 'react';
import {
  RotateCcw, ShieldCheck, ShieldX, CheckCircle2, XCircle,
  AlertTriangle, ChevronDown, ChevronUp, Lock, Hash,
  Clock, Layers, Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../shared';
import { formatDate, cn, shortId } from '../../lib/utils';

// ── API call ──────────────────────────────────────────────────────────────────

async function fetchReplay(keycloak, intentId) {
  const base = import.meta.env.VITE_API_BASE_URL ?? '/api';
  const token = keycloak?.token;
  const res = await fetch(`${base}/governance/replay/${intentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Replay failed: ${res.status}`);
  return res.json();
}

// ── Entry component ───────────────────────────────────────────────────────────

function ReplayEntry({ entry, index, isFirst }) {
  const [expanded, setExpanded] = useState(false);

  const isAllow  = entry.decision === 'ALLOW';
  const isDeny   = entry.decision === 'DENY';
  const isError  = entry.decision === 'ERROR' || entry.decision === 'NO_POLICY';

  const decisionColor = isAllow ? '#16a34a' : isDeny ? '#dc2626' : '#d97706';
  const decisionBg    = isAllow ? '#f0fdf4' : isDeny ? '#fef2f2' : '#fffbeb';
  const decisionBorder= isAllow ? '#bbf7d0' : isDeny ? '#fecaca' : '#fde68a';

  const DecisionIcon = isAllow ? CheckCircle2 : isDeny ? XCircle : AlertTriangle;

  return (
    <div className="relative">
      {/* Timeline connector */}
      {!isFirst && (
        <div className="absolute left-[19px] -top-4 w-0.5 h-4"
          style={{ background: entry.chainValid ? '#e2e8f0' : '#fecaca' }} />
      )}

      <div className="flex gap-3">
        {/* Timeline dot */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2"
            style={{
              background: decisionBg,
              borderColor: decisionBorder,
              color: decisionColor,
            }}>
            <DecisionIcon size={16} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {/* Header row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: decisionBg, color: decisionColor, border: `1px solid ${decisionBorder}` }}>
                  {entry.decision}
                </span>
                {entry.eventType && (
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {entry.eventType}
                  </span>
                )}
                {entry.enforcementMode && (
                  <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                    {entry.enforcementMode}
                  </span>
                )}
                {/* Chain validity */}
                <span className={cn(
                  'flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded',
                  entry.chainValid
                    ? 'bg-green-50 text-green-600 border border-green-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                )}>
                  <Lock size={9} />
                  {entry.chainValid ? 'Chain OK' : 'Chain BROKEN'}
                </span>
              </div>

              {/* Reason */}
              {entry.reason && (
                <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
                  {entry.reason}
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock size={10} />
                  {entry.timestamp ? formatDate(entry.timestamp) : '—'}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Layers size={10} />
                  v{entry.aggregateVersion}
                </span>
                {entry.plan && entry.plan !== 'UNKNOWN' && (
                  <span className="text-[11px] text-slate-400">
                    Plan: <span className="font-medium text-slate-600">{entry.plan}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Expand toggle */}
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Expanded hash details */}
          {expanded && (
            <div className="mt-3 p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Cryptographic Proof
              </p>
              {entry.currentHash && (
                <div className="flex items-start gap-2">
                  <Hash size={11} className="text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Current hash</p>
                    <p className="text-[11px] font-mono text-slate-600 break-all">{entry.currentHash}</p>
                  </div>
                </div>
              )}
              {entry.previousHash && (
                <div className="flex items-start gap-2">
                  <Hash size={11} className="text-slate-300 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400">Previous hash</p>
                    <p className="text-[11px] font-mono text-slate-500 break-all">{entry.previousHash}</p>
                  </div>
                </div>
              )}
              {entry.policyVersion && (
                <div>
                  <p className="text-[10px] text-slate-400">Policy version</p>
                  <p className="text-[11px] font-mono text-slate-600">{entry.policyVersion}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Summary bar ───────────────────────────────────────────────────────────────

function ReplaySummary({ data }) {
  const { chainValid, totalEvents, summary } = data;

  return (
    <div className="flex items-center gap-3 flex-wrap p-3 rounded-lg border mb-4"
      style={{
        background: chainValid ? '#f0fdf4' : '#fef2f2',
        borderColor: chainValid ? '#bbf7d0' : '#fecaca',
      }}>
      {chainValid
        ? <ShieldCheck size={16} className="text-green-600 shrink-0" />
        : <ShieldX size={16} className="text-red-600 shrink-0" />}

      <div className="flex-1">
        <p className="text-[13px] font-semibold" style={{ color: chainValid ? '#15803d' : '#b91c1c' }}>
          {chainValid ? 'Governance chain intact' : 'Chain integrity compromised'}
        </p>
        <p className="text-[11px]" style={{ color: chainValid ? '#16a34a' : '#dc2626' }}>
          {totalEvents} decision{totalEvents !== 1 ? 's' : ''} recorded
          {summary && ` · ${summary.allowed} allowed · ${summary.denied} denied`}
        </p>
      </div>

      <span className="text-[10px] font-mono px-2 py-1 rounded"
        style={{
          background: chainValid ? '#dcfce7' : '#fee2e2',
          color: chainValid ? '#15803d' : '#b91c1c',
        }}>
        {chainValid ? 'SHA-256 VERIFIED' : 'HASH MISMATCH'}
      </span>
    </div>
  );
}

// ── Main ReplayPanel ──────────────────────────────────────────────────────────

export default function ReplayPanel({ intentId, keycloak }) {
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [data, setData]   = useState(null);
  const [error, setError] = useState(null);

  async function runReplay() {
    setState('loading');
    setError(null);
    try {
      const result = await fetchReplay(keycloak, intentId);
      setData(result);
      setState('done');
    } catch (err) {
      setError(err.message);
      setState('error');
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw size={14} className="text-slate-500" />
            <CardTitle>Deterministic Replay</CardTitle>
            {data && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                {data.totalEvents} events
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant={state === 'done' ? 'secondary' : 'primary'}
            loading={state === 'loading'}
            onClick={runReplay}
          >
            {state === 'idle'  && <><RotateCcw size={12} /> Run Replay</>}
            {state === 'loading' && 'Replaying...'}
            {state === 'done'  && <><RotateCcw size={12} /> Re-run</>}
            {state === 'error' && <><RotateCcw size={12} /> Retry</>}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Idle state */}
        {state === 'idle' && (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: 'var(--brand-light)' }}>
              <RotateCcw size={20} style={{ color: 'var(--brand)' }} />
            </div>
            <p className="text-[13px] font-medium text-slate-700">Reconstruct this decision</p>
            <p className="text-[12px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Replay loads the immutable governance ledger for this intent
              and verifies the cryptographic hash chain.
            </p>
          </div>
        )}

        {/* Loading */}
        {state === 'loading' && (
          <div className="py-8 flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <p className="text-[13px] text-slate-500">Loading governance ledger...</p>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="py-6 text-center">
            <AlertTriangle size={20} className="text-amber-500 mx-auto mb-2" />
            <p className="text-[13px] font-medium text-slate-700">Replay failed</p>
            <p className="text-[12px] text-slate-400 mt-1">{error}</p>
          </div>
        )}

        {/* Results */}
        {state === 'done' && data && (
          <div>
            <ReplaySummary data={data} />

            {data.entries && data.entries.length > 0 ? (
              <div className="space-y-0">
                {data.entries.map((entry, i) => (
                  <ReplayEntry
                    key={entry.aggregateVersion ?? i}
                    entry={entry}
                    index={i}
                    isFirst={i === 0}
                  />
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-[13px] text-slate-500">
                  No governance decisions recorded for this intent.
                </p>
                <p className="text-[12px] text-slate-400 mt-1">
                  Ledger entries are written when governance policies evaluate an intent.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
