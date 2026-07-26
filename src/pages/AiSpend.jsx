import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, Cell,
} from 'recharts';
import {
  TrendingUp, Download, ShieldOff, ShieldAlert, Flag, ExternalLink,
} from 'lucide-react';
import Page from '../components/shared/Page';
import { Card, EmptyState, Spinner, Button } from '../components/shared';
import { getSpendByProject } from '../utils/api';
import { formatDate, shortId } from '../lib/utils';
import { useCapabilities } from '../context/CapabilityContext';

/**
 * CXO AI Spend — decision support, not a kill switch.
 *
 * Aggregates the cost data the audit log already records (costUsd, tokens,
 * provider, model, projectId) into spend per project, ranked, plus a daily
 * burn trend and a per-model breakdown.
 *
 * TWO DISTINCT PATHS (CXO_DASHBOARD_BRIEF.md — read this before changing the
 * actions on this page):
 *
 *   1. Spend / ROI is a deliberate, collaborative budget decision — a CXO
 *      talks to the team over days, not an emergency. This view's only
 *      action is soft: "flag for review". There is NO kill button here.
 *
 *   2. Compliance / safety halt (a model misbehaving — prompt injection, PII
 *      leak, policy violation) is the real kill switch, gated on sys_admin /
 *      tenant_admin, danger-styled, and lives at /admin/kill-switches
 *      (KillSwitchAdmin.jsx). This page shows `killed` read-only and links
 *      there — it does not engage or lift anything itself.
 *
 * The starter draft this was reconciled from had an inline kill/resume modal
 * on this page. That was a deliberate product mistake to fix, not a missing
 * feature: an abrupt halt on ROI grounds breaks in-flight work for a
 * non-urgent reason, and putting a kill button next to a cost number makes a
 * budget frustration look like the same action as a security incident.
 *
 * Backend contract: GET /api/spend/by-project?from=&to= (SPEND_ENDPOINT_SPEC.md).
 */

const DEFAULT_DAYS = 30;
const BAR = '#3b6ea5';
const BAR_TOP = '#c0603a';
const TREND = '#3b6ea5';

/** Client-only, per-browser "flag for review" — there is no backend endpoint for
 *  this yet (see brief: the only actions here are soft). Keyed by tenant so
 *  switching tenants doesn't bleed flags across them. */
const FLAG_KEY = 'dm_spend_flagged';

function loadFlags(tenantId) {
  try {
    const all = JSON.parse(localStorage.getItem(FLAG_KEY) ?? '{}');
    return new Set(all[tenantId] ?? []);
  } catch { return new Set(); }
}
function saveFlags(tenantId, set) {
  try {
    const all = JSON.parse(localStorage.getItem(FLAG_KEY) ?? '{}');
    all[tenantId] = [...set];
    localStorage.setItem(FLAG_KEY, JSON.stringify(all));
  } catch { /* private mode — flags reset on reload, informational only anyway */ }
}

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
function usd(n, dp = 2) {
  if (n == null) return '—';
  return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
}
function compactNum(n) { return n == null ? '—' : Number(n).toLocaleString(); }
function roi(p) { return (p.roiValue == null || !p.costUsd) ? null : p.roiValue / p.costUsd; }

function csvCell(v) { const s = v == null ? '' : String(v); return `"${s.replace(/"/g, '""')}"`; }
function toCsv(projects, flagged) {
  const header = ['Project', 'Team', 'Cost USD', 'Tokens', 'Calls', 'Return USD', 'ROI x', 'Halted', 'Flagged for review'].join(',');
  const lines = projects.map(p => [
    p.projectName, p.teamName, p.costUsd, p.tokens, p.calls,
    p.roiValue, roi(p) != null ? roi(p).toFixed(2) : '',
    p.killed ? 'yes' : 'no', flagged.has(p.projectId) ? 'yes' : 'no',
  ].map(csvCell).join(','));
  return [header, ...lines].join('\n');
}
function download(csv) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'ai-spend-by-project.csv'; a.click();
  URL.revokeObjectURL(url);
}

function Stat({ label, value, sub }) {
  return (
    <div className="px-5 py-4">
      <div className="text-2xl font-semibold text-slate-800 tabular-nums">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

/** Read-only — this page never engages or lifts a kill switch. */
function HaltedBadge({ canManage, onManage }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded text-red-800 bg-red-100">
      <ShieldOff size={11} /> Halted
      {canManage && (
        <button onClick={e => { e.stopPropagation(); onManage(); }}
          className="ml-1 inline-flex items-center gap-0.5 underline decoration-dotted hover:text-red-900">
          Manage <ExternalLink size={9} />
        </button>
      )}
    </span>
  );
}

export default function AiSpend({ keycloak }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(isoDaysAgo(DEFAULT_DAYS));
  const [to, setTo] = useState('');
  const [selected, setSelected] = useState(null);
  const [flagged, setFlagged] = useState(() => new Set());

  // /admin/kill-switches is now gated on this same capability (see App.jsx), so
  // linking there is safe for tenant_admin too, not just sys_admin.
  const { canManageKillSwitches: canManageKill } = useCapabilities();

  useEffect(() => {
    let active = true;
    setLoading(true);
    getSpendByProject(keycloak, {
      from: from ? `${from}T00:00:00Z` : undefined,
      to: to ? `${to}T23:59:59Z` : undefined,
    })
      .then(d => {
        if (!active) return;
        setData(d);
        setFlagged(loadFlags(d?.projects?.[0]?.tenantId ?? 'default'));
      })
      .catch(err => {
        if (!active) return;
        console.error('spend load failed', err);
        setData({ projects: [], trend: [], totalCostUsd: 0, totalTokens: 0, totalCalls: 0 });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keycloak, from, to]);

  function toggleFlag(projectId) {
    const tenantId = data?.projects?.[0]?.tenantId ?? 'default';
    setFlagged(prev => {
      const next = new Set(prev);
      next.has(projectId) ? next.delete(projectId) : next.add(projectId);
      saveFlags(tenantId, next);
      return next;
    });
  }

  const projects = data?.projects ?? [];
  const ranked = useMemo(() => [...projects].sort((a, b) => (b.costUsd ?? 0) - (a.costUsd ?? 0)), [projects]);
  const barData = ranked.map(p => ({ name: p.projectName || shortId(p.projectId), projectId: p.projectId, cost: Number(p.costUsd ?? 0) }));
  const hasReturn = projects.some(p => p.roiValue != null);
  const haltedCount = projects.filter(p => p.killed).length;
  const flaggedCount = projects.filter(p => flagged.has(p.projectId)).length;
  const inputCls = 'px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

  function statusCell(p) {
    if (p.killed) return <HaltedBadge canManage={canManageKill} onManage={() => navigate('/admin/kill-switches')} />;
    return <span className="text-xs text-slate-400">Active</span>;
  }

  function actionCell(p) {
    const isFlagged = flagged.has(p.projectId);
    return (
      <button onClick={e => { e.stopPropagation(); toggleFlag(p.projectId); }}
        title="Flag for a budget review conversation — informational only, doesn't change anything in production"
        className={`inline-flex items-center gap-1 text-xs font-medium ${
          isFlagged ? 'text-amber-700 hover:text-amber-900' : 'text-slate-400 hover:text-slate-600'}`}>
        <Flag size={12} className={isFlagged ? 'fill-amber-500' : ''} />
        {isFlagged ? 'Flagged' : 'Flag for review'}
      </button>
    );
  }

  return (
    <Page title="AI Spend" subtitle="Cost per project, ranked — decision support for budget conversations"
      action={ranked.length > 0 && (
        <Button variant="secondary" size="sm" onClick={() => download(toCsv(ranked, flagged))}>
          <Download size={13} /> Export CSV
        </Button>
      )}>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className={inputCls} />
        <span className="text-slate-400 text-sm">to</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className={inputCls} />
        <span className="text-xs text-slate-400">{to || from ? '' : `last ${DEFAULT_DAYS} days`}</span>
      </div>

      <Card className="mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
          <Stat label="Total AI spend" value={usd(data?.totalCostUsd)} sub="in the selected window" />
          <Stat label="Tokens" value={compactNum(data?.totalTokens)} />
          <Stat label="Model calls" value={compactNum(data?.totalCalls)} />
          <Stat label="Flagged for review" value={flaggedCount}
            sub={haltedCount > 0 ? `${haltedCount} halted by compliance` : 'none flagged'} />
        </div>
      </Card>

      {loading && !data ? (
        <Card><div className="py-20 text-center"><Spinner className="mx-auto" /></div></Card>
      ) : ranked.length === 0 ? (
        <Card>
          <EmptyState icon={<TrendingUp size={22} />} title="No AI spend recorded"
            description="No model calls with cost were logged in this period. Widen the date range, or check that usage metering is enabled." />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Card>
              <div className="px-5 py-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700">Spend by project</h3>
                <p className="text-xs text-slate-400">Ranked highest first</p>
              </div>
              <div className="p-4" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <XAxis type="number" tickFormatter={v => usd(v, 0)} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={v => usd(v)} cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                      {barData.map((_, i) => <Cell key={i} fill={i === 0 ? BAR_TOP : BAR} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <div className="px-5 py-3 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700">Daily burn</h3>
                <p className="text-xs text-slate-400">Total AI spend per day</p>
              </div>
              <div className="p-4" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.trend ?? []} margin={{ left: 8, right: 16, top: 8 }}>
                    <defs>
                      <linearGradient id="burn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={TREND} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={TREND} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => (d ? d.slice(5) : '')} />
                    <YAxis tickFormatter={v => usd(v, 0)} tick={{ fontSize: 11 }} width={56} />
                    <Tooltip formatter={v => usd(v)} labelFormatter={d => formatDate(d)} />
                    <Area type="monotone" dataKey="costUsd" stroke={TREND} strokeWidth={2} fill="url(#burn)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card>
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Projects</h3>
              {!hasReturn && <span className="text-xs text-slate-400">ROI hidden — no return data yet</span>}
            </div>
            <div className="overflow-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr>
                    {['Project', 'Cost', 'Tokens', 'Calls', hasReturn ? 'Return' : null, hasReturn ? 'ROI' : null, 'Status', 'Review'].filter(Boolean).map(h => (
                      <th key={h || 'x'} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap bg-slate-50 border-b border-slate-200">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ranked.map(p => {
                    const r = roi(p);
                    const open = selected === p.projectId;
                    const isFlagged = flagged.has(p.projectId);
                    return (
                      <>
                        <tr key={p.projectId}
                          className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${p.killed ? 'bg-red-50/40' : isFlagged ? 'bg-amber-50/40' : ''}`}
                          onClick={() => setSelected(open ? null : p.projectId)}>
                          <td className="px-4 py-3">
                            <div className="text-slate-700 font-medium">{p.projectName || shortId(p.projectId)}</div>
                            {p.teamName && <div className="text-xs text-slate-400">{p.teamName}</div>}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-slate-700">{usd(p.costUsd)}</td>
                          <td className="px-4 py-3 tabular-nums text-slate-500">{compactNum(p.tokens)}</td>
                          <td className="px-4 py-3 tabular-nums text-slate-500">{compactNum(p.calls)}</td>
                          {hasReturn && <td className="px-4 py-3 tabular-nums text-slate-500">{usd(p.roiValue)}</td>}
                          {hasReturn && (
                            <td className="px-4 py-3 tabular-nums">
                              {r == null ? <span className="text-slate-300">—</span> : (
                                <span className={`font-medium ${r >= 1 ? 'text-emerald-700' : 'text-amber-700'}`}>{r.toFixed(1)}×</span>
                              )}
                            </td>
                          )}
                          <td className="px-4 py-3">{statusCell(p)}</td>
                          <td className="px-4 py-3 text-right">{actionCell(p)}</td>
                        </tr>
                        {open && (p.models ?? []).map(m => (
                          <tr key={p.projectId + m.model} className="bg-slate-50/60 border-b border-slate-100">
                            <td className="px-4 py-2 pl-8">
                              <div className="text-xs text-slate-600">{m.model}</div>
                              <div className="text-xs text-slate-400">{m.provider}</div>
                            </td>
                            <td className="px-4 py-2 tabular-nums text-xs text-slate-600">{usd(m.costUsd)}</td>
                            <td className="px-4 py-2 tabular-nums text-xs text-slate-500">{compactNum(m.tokens)}</td>
                            <td className="px-4 py-2 tabular-nums text-xs text-slate-500">{compactNum(m.calls)}</td>
                            {hasReturn && <td />}
                            {hasReturn && <td />}
                            <td className="px-4 py-2">
                              {m.killed && <span className="inline-flex items-center gap-1 text-xs text-red-800"><ShieldAlert size={10} /> killed</span>}
                            </td>
                            <td className="px-4 py-2" />
                          </tr>
                        ))}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </Page>
  );
}
