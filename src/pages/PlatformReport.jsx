/**
 * PlatformReport.jsx — Platform-wide cost report (sys_admin only)
 * Calls GET /api/reports/platform from ReportResource.java.
 *
 * Distinct from CostAnalytics.jsx (/api/analytics/cost, tenant-scoped) and
 * from AiSpend.jsx (/api/spend/by-project, tenant-scoped CXO dashboard) —
 * this is the one view that rolls spend up ACROSS every tenant, which is
 * why it's sys_admin-exclusive on the backend (@RolesAllowed("sys_admin"),
 * no tenant permission check — a platform admin acting across tenants has
 * no role_grant row to check against).
 */
import { useState, useEffect, useCallback } from 'react';
import { Globe2, RefreshCw, AlertCircle, Download, DollarSign, Hash, Layers } from 'lucide-react';
import Page from '../components/shared/Page';
import { Card, Spinner } from '../components/shared';
import { getPlatformReport } from '../utils/api';

const GROUP_BY_OPTIONS = [
  { id: 'TENANT',  label: 'By tenant'  },
  { id: 'TEAM',    label: 'By team'    },
  { id: 'PROJECT', label: 'By project' },
  { id: 'MODEL',   label: 'By model'   },
  { id: 'DAY',     label: 'By day'     },
];

function toDateInputValue(d) {
  return d.toISOString().slice(0, 10);
}

function downloadText(text, filename, mime) {
  const blob = new Blob([text], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function PlatformReport({ keycloak }) {
  const [groupBy,   setGroupBy]   = useState('TENANT');
  const [from,      setFrom]      = useState(() => toDateInputValue(new Date(Date.now() - 30 * 86400_000)));
  const [to,        setTo]        = useState(() => toDateInputValue(new Date()));
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlatformReport(keycloak, {
        groupBy,
        from: from ? `${from}T00:00:00Z` : null,
        to:   to   ? `${to}T23:59:59Z`   : null,
      });
      setResult(data);
    } catch (e) {
      setError(e.message ?? 'Failed to load platform report');
    } finally {
      setLoading(false);
    }
  }, [keycloak, groupBy, from, to]);

  useEffect(() => { load(); }, [load]);

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await getPlatformReport(keycloak, {
        groupBy,
        from: from ? `${from}T00:00:00Z` : null,
        to:   to   ? `${to}T23:59:59Z`   : null,
        format: 'csv',
      });
      downloadText(csv, `platform_cost_${groupBy.toLowerCase()}.csv`, 'text/csv');
    } catch (e) {
      setError(e.message ?? 'Export failed');
    } finally {
      setExporting(false);
    }
  }

  const rows   = result?.rows ?? [];
  const totals = result?.totals;

  return (
    <Page
      title="Platform cost report"
      subtitle="Cross-tenant spend rollup — the one view that crosses tenant boundaries"
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
          {GROUP_BY_OPTIONS.map(g => (
            <button key={g.id} onClick={() => setGroupBy(g.id)}
              className={`px-3 py-2 font-medium transition-colors ${
                groupBy === g.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}>
              {g.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>From</span>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 bg-white" />
          <span>to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 bg-white" />
        </div>

        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>

        <button onClick={handleExport} disabled={exporting || loading}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors">
          <Download size={11} className={exporting ? 'animate-pulse' : ''} /> Export CSV
        </button>
      </div>

      {error && (
        <Card className="p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={14} />
            <p className="text-xs font-medium">{error}</p>
          </div>
        </Card>
      )}

      {loading && !result ? (
        <div className="flex justify-center py-16"><Spinner className="w-7 h-7" /></div>
      ) : (
        <>
          {/* Totals */}
          {totals && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total spend</p>
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><DollarSign size={14} /></div>
                </div>
                <p className="text-2xl font-extrabold text-slate-900">
                  ${Number(totals.spendUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </Card>
              <Card className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total tokens</p>
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><Hash size={14} /></div>
                </div>
                <p className="text-2xl font-extrabold text-slate-900">{Number(totals.tokens ?? 0).toLocaleString()}</p>
              </Card>
              <Card className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Records</p>
                  <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600"><Layers size={14} /></div>
                </div>
                <p className="text-2xl font-extrabold text-slate-900">{Number(totals.records ?? 0).toLocaleString()}</p>
              </Card>
            </div>
          )}

          {/* Rows table */}
          {rows.length === 0 ? (
            <Card className="p-12 text-center">
              <Globe2 size={24} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No spend recorded for this window.</p>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">
                        {GROUP_BY_OPTIONS.find(g => g.id === groupBy)?.label.replace('By ', '') ?? 'Group'}
                      </th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600">Records</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600">Tokens</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600">Spend (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5">
                          {groupBy === 'DAY' ? (
                            <code className="text-slate-700 font-mono text-2xs">{r.group ?? '—'}</code>
                          ) : (
                            <span className="text-slate-700 font-medium">{r.group ?? 'Unassigned'}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-600">{Number(r.records ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600">{Number(r.tokens ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-800">
                          ${Number(r.spendUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </Page>
  );
}
