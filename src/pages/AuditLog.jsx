import { useState, useEffect } from 'react';
import { Search, ScrollText, Download, ShieldAlert, X } from 'lucide-react';
import Page from '../components/shared/Page';
import { Card, EmptyState, Spinner, Button } from '../components/shared';
import { listAudit } from '../utils/api';
import { formatDate, formatRelative, shortId } from '../lib/utils';

/** Actions an incident reviewer scans for — surfaced, not buried. */
const CRITICAL_ACTIONS = new Set([
  'KILL_SWITCH_BLOCKED',
  'KILL_SWITCH_ENGAGED',
  'KILL_SWITCH_LIFTED',
]);

const OUTCOME_STYLES = {
  SUCCESS: 'text-emerald-700 bg-emerald-50',
  BLOCKED: 'text-red-700 bg-red-50',
  FAILURE: 'text-amber-700 bg-amber-50',
};

/** What governance did, as distinct from whether the call succeeded. */
const DECISION_STYLES = {
  ALLOWED: 'text-slate-600 bg-slate-100',
  MASKED:  'text-amber-800 bg-amber-100',
  BLOCKED: 'text-red-800 bg-red-100',
};

/**
 * Offered DLP classes.
 *
 * Deliberately a fixed list of what the detectors CAN find, not a distinct query
 * over what has been found. A dropdown built from observed values cannot offer
 * "PII:UK:HEALTH_ID" until a UK health id has already leaked — exactly when you
 * most needed to be able to ask.
 */
const DATA_CLASSES = [
  'PII:IN:NATIONAL_ID', 'PII:IN:TAX_ID', 'PII:IN:BANK_ROUTING', 'PII:IN:PHONE',
  'PII:UK:NATIONAL_ID', 'PII:UK:HEALTH_ID', 'PII:UK:TAX_ID', 'PII:UK:PHONE',
  'PII:US:NATIONAL_ID', 'PII:US:TAX_ID', 'PII:US:BANK_ROUTING', 'PII:US:PHONE',
  'PII:EU:TAX_ID',
  'PII:UNIVERSAL:EMAIL', 'PII:UNIVERSAL:PAYMENT_CARD',
  'PII:UNIVERSAL:BANK_ACCOUNT', 'PII:UNIVERSAL:IP_ADDRESS',
];

/** Server default is 30 days. Shown, not implied — an empty range is not "all time". */
const DEFAULT_DAYS = 30;

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/** RFC-4180: quote every field, double any inner quotes. `detail` contains commas. */
function csvCell(v) {
  const s = v == null ? '' : (Array.isArray(v) ? v.join(' ') : String(v));
  return `"${s.replace(/"/g, '""')}"`;
}

function toCsv(rows) {
  const header = [
    'Time', 'User', 'Email', 'User ID', 'Action', 'Outcome', 'Decision',
    'Detail', 'Entity type', 'Entity ID', 'Resource type', 'Resource ID',
    'Tenant', 'Team', 'Project', 'Model', 'Provider', 'Cost USD', 'Tokens',
    'Latency ms', 'Data classes',
  ].join(',');

  const lines = rows.map(e => [
    e.timestamp, e.actorName, e.actorEmail, e.userId, e.action, e.outcome, e.decision,
    e.detail, e.entityType, e.entityId, e.resourceType, e.resourceId,
    e.tenantName, e.teamName, e.projectName, e.model, e.provider, e.costUsd, e.tokens,
    e.latencyMs, e.dataClass,
  ].map(csvCell).join(','));

  return [header, ...lines].join('\n');
}

function download(csv) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'audit-log.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function AuditLog({ keycloak }) {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage]           = useState(0);

  const [userId, setUserId]       = useState('');
  const [action, setAction]       = useState('');
  const [model, setModel]         = useState('');
  const [dataClass, setDataClass] = useState([]);
  const [from, setFrom]           = useState(isoDaysAgo(DEFAULT_DAYS));
  const [to, setTo]               = useState('');

  /** One shape for the grid and the export, so they can never disagree. */
  function filters() {
    return {
      userId:    userId || undefined,
      action:    action || undefined,
      model:     model  || undefined,
      dataClass: dataClass.length ? dataClass : undefined,
      from:      from ? `${from}T00:00:00Z` : undefined,
      to:        to   ? `${to}T23:59:59Z`   : undefined,
    };
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    listAudit(keycloak, { page, size: 50, ...filters() })
        .then(d => { if (active) setData(d); })
        // Without a catch the spinner runs forever on a 500 and the page looks hung.
        // An empty table plus a console error is the honest failure mode.
        .catch(err => {
          if (!active) return;
          console.error('audit load failed', err);
          setData({ content: [], totalElements: 0, totalPages: 0 });
        })
        .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keycloak, page, userId, action, model, dataClass, from, to]);

  /**
   * Exports every matching row, not the visible page.
   *
   * The previous version wrote whatever happened to be on screen while the header
   * said "audit-log.csv". A 50-row file that silently omits the rest is worse than
   * no export: the recipient has no way to tell it is partial.
   */
  async function handleExport() {
    setExporting(true);
    try {
      const all  = await listAudit(keycloak, { page: 0, size: 200, ...filters() });
      const rows = all?.content ?? [];
      download(toCsv(rows));
      if ((all?.totalElements ?? 0) > rows.length) {
        alert(`Exported ${rows.length} of ${all.totalElements} matching events. `
            + `Narrow the date range or filters to export the remainder.`);
      }
    } finally {
      setExporting(false);
    }
  }

  function toggleClass(c) {
    setPage(0);
    setDataClass(cs => cs.includes(c) ? cs.filter(x => x !== c) : [...cs, c]);
  }

  function clearAll() {
    setPage(0);
    setUserId(''); setAction(''); setModel('');
    setDataClass([]); setFrom(isoDaysAgo(DEFAULT_DAYS)); setTo('');
  }

  const rows = data?.content ?? [];
  const activeCount = [userId, action, model, to].filter(Boolean).length
      + dataClass.length + (from !== isoDaysAgo(DEFAULT_DAYS) ? 1 : 0);

  const COLS = ['Time', 'User', 'Action', 'Outcome', 'Scope', 'Model', 'Cost',
    'DLP', 'Detail', 'Entity'];

  const inputCls = 'px-3 py-1.5 text-sm border border-slate-200 rounded-lg '
      + 'focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
      <Page title="Audit Log" subtitle={`${data?.totalElements ?? 0} events`}
            action={rows.length > 0 && (
                <Button variant="secondary" size="sm" onClick={handleExport} disabled={exporting}>
                  <Download size={13}/> {exporting ? 'Exporting…' : 'Export CSV'}
                </Button>
            )}>
        <Card>
          {/* ── Filters ────────────────────────────────────────────────────────── */}
          {/* Tinted panel against white rows. Three tones on this screen — slate-50
              controls, slate-100 header, white data — so the eye can tell which
              region it is in without reading anything. */}
          <div className="bg-slate-50 border-b-2 border-slate-200">
            <div className="px-5 py-3 flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input value={userId} onChange={e => { setUserId(e.target.value); setPage(0); }}
                       placeholder="Filter by user…" className={`${inputCls} pl-8 w-52 bg-white`}/>
              </div>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input value={action} onChange={e => { setAction(e.target.value); setPage(0); }}
                       placeholder="Filter by action…" className={`${inputCls} pl-8 w-44 bg-white`}/>
              </div>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input value={model} onChange={e => { setModel(e.target.value); setPage(0); }}
                       placeholder="Filter by model…" className={`${inputCls} pl-8 w-44 bg-white`}/>
              </div>

              {/* Range is never truly empty — the server applies 30 days when absent,
                  so the default is shown rather than left blank and misread as "all". */}
              <label className="flex items-center gap-1.5 text-xs text-slate-500">
                From
                <input type="date" value={from}
                       onChange={e => { setFrom(e.target.value); setPage(0); }}
                       className={`${inputCls} py-1 bg-white`}/>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-500">
                To
                <input type="date" value={to}
                       onChange={e => { setTo(e.target.value); setPage(0); }}
                       className={`${inputCls} py-1 bg-white`}/>
              </label>

              {activeCount > 0 && (
                  <button onClick={clearAll}
                          className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded border border-red-200 transition-colors">
                    <X size={12}/> Clear {activeCount}
                  </button>
              )}
              {loading && <Spinner className="ml-auto w-4 h-4"/>}
            </div>

            {/* Own row, own divider: "what kind of data" is a different question from
                "whose action". Multi-select is OR — did ANY of these reach a model. */}
            <div className="px-5 py-2.5 border-t border-slate-200 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500 mr-1">Data classes:</span>
              {DATA_CLASSES.map(c => {
                const on = dataClass.includes(c);
                return (
                    <button key={c} onClick={() => toggleClass(c)}
                            className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                                on ? 'bg-blue-50 border-blue-400 text-blue-800 font-medium'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                      {c.replace('PII:', '')}
                    </button>
                );
              })}
            </div>
          </div>

          {/* ── Table ──────────────────────────────────────────────────────────── */}
          {/* overflow-auto, not overflow-x-auto: both scrollbars. min-w forces the
              horizontal one rather than letting the last columns compress off-screen. */}
          <div className="overflow-auto max-h-[calc(100vh-340px)]">
            <table className="w-full text-sm min-w-[1400px]">
              <thead>
              <tr>
                {COLS.map(h => (
                    <th key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider whitespace-nowrap bg-slate-100 border-b border-slate-300">
                      {h}
                    </th>
                ))}
              </tr>
              </thead>
              <tbody>
              {loading && !data ? (
                  <tr><td colSpan={COLS.length} className="py-16 text-center"><Spinner className="mx-auto"/></td></tr>
              ) : rows.length === 0 ? (
                  <tr><td colSpan={COLS.length}>
                    <EmptyState icon={<ScrollText size={22}/>} title="No audit events"
                                description="No events match these filters in the selected period"/>
                  </td></tr>
              ) : rows.map(e => {
                const critical = CRITICAL_ACTIONS.has(e.action);
                return (
                    <tr key={e.id}
                        className={`border-b border-slate-100 transition-colors ${critical ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-slate-50'}`}>

                      {/* Exact instant leads. An auditor asks "when exactly", never "roughly how long ago". */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-slate-700 tabular-nums">{formatDate(e.timestamp)}</div>
                        <div className="text-xs text-slate-400">{formatRelative(e.timestamp)}</div>
                      </td>

                      {/* Name leads; the uuid stays reachable on hover. */}
                      <td className="px-4 py-3">
                        {e.actorName || e.actorEmail ? (
                            <div className="min-w-0" title={e.userId}>
                              <div className="text-xs text-slate-700 truncate">{e.actorName || e.actorEmail}</div>
                              {e.actorName && e.actorEmail && (
                                  <div className="text-xs text-slate-400 truncate">{e.actorEmail}</div>
                              )}
                            </div>
                        ) : (
                            <span className="font-mono text-xs text-slate-400"
                                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                  title={e.userId}>
                              {shortId(e.userId)}
                            </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${
                            critical ? 'text-red-800 bg-red-100' : 'text-slate-700 bg-slate-100'
                        }`}>
                          {critical && <ShieldAlert size={11}/>}
                          {e.action}
                        </span>
                      </td>

                      {/* outcome = did the call work. decision = what governance did.
                          Both shown: a row can be SUCCESS / MASKED. */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {e.outcome && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                OUTCOME_STYLES[e.outcome] || 'text-slate-600 bg-slate-50'
                            }`}>
                              {e.outcome}
                            </span>
                        )}
                        {e.decision && (
                            <span className={`ml-1 text-xs font-medium px-2 py-0.5 rounded ${
                                DECISION_STYLES[e.decision] || 'text-slate-600 bg-slate-50'
                            }`}>
                              {e.decision}
                            </span>
                        )}
                      </td>

                      {/* Null scope shows "—", never hides the row. An event whose scope
                          was not recorded is a fact about the record, not a reason to drop it. */}
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-600" title={e.projectId}>
                          {e.projectName || <span className="text-slate-300">—</span>}
                        </div>
                        <div className="text-xs text-slate-400" title={e.teamId}>
                          {e.teamName || ''}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {e.model ? (
                            <>
                              <div className="text-xs text-slate-600">{e.model}</div>
                              <div className="text-xs text-slate-400">{e.provider}</div>
                            </>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-xs tabular-nums text-slate-600">
                        {e.costUsd != null ? `$${Number(e.costUsd).toFixed(6)}` : <span className="text-slate-300">—</span>}
                        {e.latencyMs != null && (
                            <div className="text-slate-400">{e.latencyMs}ms</div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {e.dataClass?.length ? (
                            <div className="flex flex-wrap gap-0.5 max-w-[220px]">
                              {e.dataClass.map(c => (
                                  <span key={c} title={c}
                                        className="text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                    {c.replace('PII:', '')}
                                  </span>
                              ))}
                            </div>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate" title={e.detail}>
                        {e.detail || <span className="text-slate-300">—</span>}
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-600">{e.entityType}</div>
                        <span className="font-mono text-xs text-slate-400"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                              title={e.entityId}>
                          {shortId(e.entityId)}
                        </span>
                      </td>
                    </tr>
                );
              })}
              </tbody>
            </table>
          </div>

          {(data?.totalPages ?? 0) > 1 && (
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-sm">
                <span className="text-xs text-slate-500">Page {page + 1} of {data.totalPages}</span>
                <div className="flex gap-2">
                  <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                          className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">
                    Previous
                  </button>
                  <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)}
                          className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">
                    Next
                  </button>
                </div>
              </div>
          )}
        </Card>
      </Page>
  );
}
