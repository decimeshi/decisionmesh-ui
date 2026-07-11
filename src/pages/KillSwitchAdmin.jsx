import { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert, ShieldCheck, Power, PowerOff, Plus, X, AlertTriangle, Clock,
} from 'lucide-react';
import Page from '../components/shared/Page';
import { Card, EmptyState, Spinner, Button } from '../components/shared';
import {
  listKillSwitches, listKillSwitchHistory, engageKillSwitch, liftKillSwitch,
} from '../utils/api';
import { formatDate, formatRelative, shortId } from '../lib/utils';

/**
 * Kill switch console.
 *
 * Written for an incident, not for CRUD. The first thing an operator needs to know is
 * "is anything halted right now, and what" — so that is the whole top of the page, in
 * one glance. Everything else is secondary.
 *
 * Unlike the user-facing notice, the operator's `reason` IS shown here. That's who it
 * was written for.
 */

const SCOPES = [
  { value: 'PLATFORM',    label: 'Platform — halts every tenant', platformOnly: true },
  { value: 'TENANT',      label: 'Tenant — halts this tenant',    platformOnly: false },
  { value: 'INTENT_TYPE', label: 'Intent type',                   platformOnly: false },
  { value: 'PROVIDER',    label: 'Provider',                      platformOnly: false },
  { value: 'ADAPTER',     label: 'Adapter',                       platformOnly: false },
];

function ScopeBadge({ scopeType, scopeKey }) {
  const platform = scopeType === 'PLATFORM';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
      platform ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
    }`}>
      {scopeType}{scopeKey && scopeKey !== '*' ? `: ${scopeKey}` : ''}
    </span>
  );
}

export default function KillSwitchAdmin({ keycloak, isPlatformOperator = true }) {
  const [active,  setActive]  = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [busy,    setBusy]    = useState(null);   // id being lifted
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, h] = await Promise.all([
        listKillSwitches(keycloak),
        listKillSwitchHistory(keycloak),
      ]);
      setActive(a ?? []);
      // history returns active + lifted; show only the lifted ones below
      setHistory((h ?? []).filter(s => !s.active));
      setError(null);
    } catch (e) {
      setError(e.message ?? 'Could not load kill switches');
    } finally {
      setLoading(false);
    }
  }, [keycloak]);

  useEffect(() => { load(); }, [load]);

  async function onLift(sw) {
    // Confirm deliberately. Lifting by accident during an incident is worse than
    // lifting slowly — it silently restores traffic someone stopped on purpose.
    const label = `${sw.scopeType}${sw.scopeKey !== '*' ? `: ${sw.scopeKey}` : ''}`;
    if (!window.confirm(
      `Lift the ${label} kill switch?\n\nReason it was engaged:\n"${sw.reason}"\n\n` +
      `AI processing will resume immediately.`
    )) return;

    setBusy(sw.killSwitchId);
    try {
      await liftKillSwitch(keycloak, sw.killSwitchId);
      await load();
    } catch (e) {
      setError(e.message ?? 'Lift failed');
    } finally {
      setBusy(null);
    }
  }

  const halted = active.length > 0;

  return (
    <Page
      title="Kill switches"
      subtitle={halted ? `${active.length} active — processing is halted` : 'No active switches'}
      action={
        <Button variant={showForm ? 'secondary' : 'destructive'} size="sm"
          onClick={() => setShowForm(v => !v)}>
          {showForm ? <><X size={13}/> Cancel</> : <><Plus size={13}/> Engage kill switch</>}
        </Button>
      }
    >
      {/* ── Status: the one thing an operator needs at a glance ── */}
      <div className={`mb-5 flex items-start gap-3 p-4 rounded-xl border ${
        halted ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'
      }`}>
        {halted
          ? <ShieldAlert size={18} className="mt-0.5 shrink-0 text-red-600" />
          : <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" />}
        <div>
          <p className={`text-sm font-semibold ${halted ? 'text-red-900' : 'text-emerald-900'}`}>
            {halted ? 'AI processing is halted' : 'AI processing is running normally'}
          </p>
          <p className={`mt-0.5 text-xs ${halted ? 'text-red-800' : 'text-emerald-800'}`}>
            {halted
              ? 'Intents matching an active switch below are being rejected with 503 and recorded in the audit log.'
              : 'No kill switch is currently blocking traffic.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <EngageForm
          keycloak={keycloak}
          isPlatformOperator={isPlatformOperator}
          onDone={() => { setShowForm(false); load(); }}
          onError={setError}
        />
      )}

      {/* ── Active ── */}
      <Card className="mb-5">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
          <Power size={13} className="text-red-500" />
          <h3 className="text-[13px] font-semibold text-slate-800">Active</h3>
          {loading && <Spinner className="ml-auto w-4 h-4" />}
        </div>

        {loading && !active.length ? (
          <div className="py-12 text-center"><Spinner className="mx-auto" /></div>
        ) : active.length === 0 ? (
          <EmptyState icon={<ShieldCheck size={22} />} title="Nothing is halted"
            description="Engage a kill switch to stop AI processing immediately" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Scope', 'Reason', 'Engaged', 'By', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {active.map(sw => (
                  <tr key={sw.killSwitchId} className="border-b border-slate-50 bg-red-50/30">
                    <td className="px-5 py-3">
                      <ScopeBadge scopeType={sw.scopeType} scopeKey={sw.scopeKey} />
                      {sw.enforcementMode !== 'HARD_STOP' && (
                        <span className="ml-1.5 text-[10px] text-slate-400">{sw.enforcementMode}</span>
                      )}
                    </td>
                    {/* The operator's reason belongs here — this is who it was written for. */}
                    <td className="px-5 py-3 text-xs text-slate-700 max-w-md">{sw.reason}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="text-xs text-slate-700 flex items-center gap-1">
                        <Clock size={11} className="text-slate-400" />
                        {formatRelative(sw.createdAt)}
                      </div>
                      <div className="text-[11px] text-slate-400">{formatDate(sw.createdAt)}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-slate-500" title={sw.createdBy}>
                        {shortId(sw.createdBy)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="secondary" size="sm"
                        loading={busy === sw.killSwitchId}
                        onClick={() => onLift(sw)}>
                        <PowerOff size={12} /> Lift
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── History: the audit trail. Rows are never deleted. ── */}
      <Card>
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-[13px] font-semibold text-slate-800">Lifted</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Kill switches are never deleted — this is the record of what was halted, why, and when it was released.
          </p>
        </div>

        {history.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">No past kill switches</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Scope', 'Reason', 'Engaged', 'Lifted', 'Duration'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(sw => (
                  <tr key={sw.killSwitchId} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-5 py-3"><ScopeBadge scopeType={sw.scopeType} scopeKey={sw.scopeKey} /></td>
                    <td className="px-5 py-3 text-xs text-slate-600 max-w-md">{sw.reason}</td>
                    <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(sw.createdAt)}</td>
                    <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {sw.liftedAt ? formatDate(sw.liftedAt) : '—'}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {sw.liftedAt ? duration(sw.createdAt, sw.liftedAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Page>
  );
}

// ── Engage form ──────────────────────────────────────────────────────────────

function EngageForm({ keycloak, isPlatformOperator, onDone, onError }) {
  const [scopeType, setScopeType] = useState('TENANT');
  const [scopeKey,  setScopeKey]  = useState('*');
  const [reason,    setReason]    = useState('');
  const [saving,    setSaving]    = useState(false);

  const scopes = SCOPES.filter(s => !s.platformOnly || isPlatformOperator);
  const isPlatform = scopeType === 'PLATFORM';
  const wildcard   = scopeType === 'PLATFORM' || scopeType === 'TENANT';

  async function submit() {
    if (!reason.trim()) { onError('A reason is required — it is the audit record.'); return; }

    // A platform stop halts every tenant. Make that impossible to do absent-mindedly.
    if (isPlatform && !window.confirm(
      'Engage a PLATFORM kill switch?\n\nThis immediately halts AI processing for EVERY tenant.\n\n' +
      `Reason: "${reason}"`
    )) return;

    setSaving(true);
    try {
      await engageKillSwitch(keycloak, {
        scopeType,
        scopeKey: wildcard ? '*' : scopeKey.trim(),
        enforcementMode: 'HARD_STOP',
        reason: reason.trim(),
      });
      onDone();
    } catch (e) {
      onError(e.message ?? 'Could not engage kill switch');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-5 border-red-200">
      <div className="px-5 py-3 border-b border-red-100 bg-red-50/50 flex items-center gap-2">
        <AlertTriangle size={13} className="text-red-600" />
        <h3 className="text-[13px] font-semibold text-red-900">Engage kill switch</h3>
      </div>
      <div className="px-5 py-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Scope</label>
          <select value={scopeType} onChange={e => setScopeType(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            {scopes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {!wildcard && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {scopeType === 'INTENT_TYPE' ? 'Intent type' : scopeType === 'PROVIDER' ? 'Provider' : 'Adapter ID'}
            </label>
            <input value={scopeKey === '*' ? '' : scopeKey} onChange={e => setScopeKey(e.target.value)}
              placeholder={scopeType === 'INTENT_TYPE' ? 'fraud_detection' : 'openai'}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
            placeholder="Why is traffic being halted? This is the audit record."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="mt-1 text-[11px] text-slate-400">
            Shown to operators and kept permanently. Not shown to end users.
          </p>
        </div>

        <Button variant="destructive" size="md" loading={saving}
          disabled={!reason.trim()} onClick={submit}>
          <Power size={13} /> {isPlatform ? 'Halt all processing' : 'Engage'}
        </Button>
      </div>
    </Card>
  );
}

function duration(from, to) {
  const ms = new Date(to) - new Date(from);
  const m  = Math.round(ms / 60000);
  if (m < 1)  return '< 1 min';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}
