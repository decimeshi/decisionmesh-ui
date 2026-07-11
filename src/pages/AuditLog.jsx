import { useState, useEffect } from 'react';
import { Search, ScrollText, Download, ShieldAlert } from 'lucide-react';
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

/** RFC-4180: quote every field, double any inner quotes. `detail` contains commas. */
function csvCell(v) {
  const s = v == null ? '' : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

function exportCsv(rows) {
  const header = [
    'Time', 'User', 'Email', 'User ID', 'Action', 'Outcome',
    'Detail', 'Entity type', 'Entity ID', 'Resource type', 'Resource ID', 'Tenant',
  ].join(',');

  const lines = rows.map(e => [
    e.timestamp, e.actorName, e.actorEmail, e.userId, e.action, e.outcome,
    e.detail, e.entityType, e.entityId, e.resourceType, e.resourceId, e.tenantName,
  ].map(csvCell).join(','));

  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'audit-log.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function AuditLog({ keycloak }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(0);
  const [userId, setUserId]   = useState('');
  const [action, setAction]   = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    listAudit(keycloak, {
      page, size: 50,
      userId: userId || undefined,
      action: action || undefined,
    }).then(d => { if (active) { setData(d); setLoading(false); }});
    return () => { active = false; };
  }, [keycloak, page, userId, action]);

  const rows = data?.content ?? [];

  const COLS = ['Time', 'User', 'Action', 'Outcome', 'Detail', 'Entity', 'Tenant'];

  return (
    <Page title="Audit Log" subtitle={`${data?.totalElements ?? 0} events`}
      action={rows.length > 0 && (
        <Button variant="secondary" size="sm" onClick={() => exportCsv(rows)}>
          <Download size={13}/> Export CSV
        </Button>
      )}>
      <Card>
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input value={userId} onChange={e => { setUserId(e.target.value); setPage(0); }}
              placeholder="Filter by user…"
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"/>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input value={action} onChange={e => { setAction(e.target.value); setPage(0); }}
              placeholder="Filter by action…"
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"/>
          </div>
          {loading && <Spinner className="ml-auto w-4 h-4"/>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {COLS.map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && !data ? (
                <tr><td colSpan={COLS.length} className="py-16 text-center"><Spinner className="mx-auto"/></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={COLS.length}>
                  <EmptyState icon={<ScrollText size={22}/>} title="No audit events" description="Events are recorded as users take actions"/>
                </td></tr>
              ) : rows.map(e => {
                const critical = CRITICAL_ACTIONS.has(e.action);
                return (
                  <tr key={e.id}
                    className={`border-b border-slate-50 transition-colors ${critical ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-slate-50'}`}>

                    {/* Exact instant leads. An auditor asks "when exactly", never "roughly how long ago". */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="text-xs text-slate-700 tabular-nums">{formatDate(e.timestamp)}</div>
                      <div className="text-xs text-slate-400">{formatRelative(e.timestamp)}</div>
                    </td>

                    {/* Name leads; the uuid stays reachable on hover. */}
                    <td className="px-5 py-3">
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

                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${
                        critical ? 'text-red-800 bg-red-100' : 'text-slate-700 bg-slate-100'
                      }`}>
                        {critical && <ShieldAlert size={11}/>}
                        {e.action}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      {e.outcome && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          OUTCOME_STYLES[e.outcome] || 'text-slate-600 bg-slate-50'
                        }`}>
                          {e.outcome}
                        </span>
                      )}
                    </td>

                    {/* The column that was missing — this is where the granularity actually lives. */}
                    <td className="px-5 py-3 text-xs text-slate-600 max-w-md">
                      {e.detail || <span className="text-slate-300">—</span>}
                    </td>

                    <td className="px-5 py-3">
                      <div className="text-xs text-slate-600">{e.entityType}</div>
                      <span className="font-mono text-xs text-slate-400"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        title={e.entityId}>
                        {shortId(e.entityId)}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <span className="text-xs text-slate-600" title={e.tenantId}>
                        {e.tenantName || <span className="text-slate-400">Platform</span>}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(data?.totalPages ?? 0) > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-xs text-slate-500">Page {page + 1} of {data.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">
                Previous
              </button>
              <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </Page>
  );
}
