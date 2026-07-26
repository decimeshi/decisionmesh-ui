/**
 * RetentionDryRun.jsx — Data Retention Dry Run (sys_admin only)
 * Calls GET /api/admin/retention/dry-run from AdminResource.java.
 *
 * DataRetentionService.dryRun() returns row counts that WOULD be deleted by
 * the nightly retention job (DM-POL-003) without deleting anything — a
 * preview, not an action. The backend returns plain text (Response.ok(String),
 * not JSON); this page parses the "label: N rows" lines it emits into a table
 * and falls back to the raw text for anything it doesn't recognise, so a
 * format change on the backend degrades gracefully instead of breaking.
 */
import { useState, useEffect, useCallback } from 'react';
import { Trash2, RefreshCw, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import Page from '../components/shared/Page';
import { Card, Spinner } from '../components/shared';
import { getRetentionDryRun } from '../utils/api';

// Matches lines DataRetentionService.appendCount() emits:
//   "  intents > 2yr:                       12 rows"
const ROW_RE = /^\s*(.+?):\s+(\d+)\s+rows\s*$/;
const HEADER_RE = /^Data Retention Dry Run\s+—\s+(.+)$/;

function parseReport(text) {
  if (!text) return { timestamp: null, rows: [], raw: text };
  const lines = text.split('\n');
  let timestamp = null;
  const rows = [];
  for (const line of lines) {
    const header = line.match(HEADER_RE);
    if (header) { timestamp = header[1].trim(); continue; }
    const row = line.match(ROW_RE);
    if (row) rows.push({ label: row[1].trim(), count: parseInt(row[2], 10) });
  }
  return { timestamp, rows, raw: text };
}

export default function RetentionDryRun({ keycloak }) {
  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const text = await getRetentionDryRun(keycloak);
      setReport(parseReport(text));
    } catch (e) {
      setError(e.message ?? 'Failed to run retention dry-run');
    } finally {
      setLoading(false);
    }
  }, [keycloak]);

  useEffect(() => { load(); }, [load]);

  const totalRows = report?.rows.reduce((s, r) => s + r.count, 0) ?? 0;
  const parsedOk  = report?.rows.length > 0;

  return (
    <Page
      title="Data retention dry run"
      subtitle="Preview of rows the nightly retention job (DM-POL-003) would delete — no data is deleted by this page"
    >
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">
        <ShieldCheck size={15} className="text-blue-600 shrink-0" />
        <p className="text-xs font-medium text-blue-800">
          Read-only preview. Actual purging runs on its own nightly schedule
          (02:00 UTC) — this page never deletes anything, it only counts
          what that job would touch if it ran right now.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock size={12} />
          {report?.timestamp
            ? <span>Report generated: {new Date(report.timestamp).toLocaleString()}</span>
            : <span>Not yet run</span>}
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors">
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Run dry-run again
        </button>
      </div>

      {loading && !report ? (
        <div className="flex justify-center py-16"><Spinner className="w-7 h-7" /></div>
      ) : error ? (
        <Card className="p-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={16} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </Card>
      ) : parsedOk ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Total rows eligible
              </p>
              <p className={`text-2xl font-extrabold ${totalRows > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {totalRows.toLocaleString()}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Categories checked
              </p>
              <p className="text-2xl font-extrabold text-slate-900">{report.rows.length}</p>
            </Card>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Category</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Rows eligible</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.rows.map(r => (
                    <tr key={r.label} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                        <Trash2 size={11} className={r.count > 0 ? 'text-amber-500' : 'text-slate-300'} />
                        {r.label}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${r.count > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                        {r.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-5">
          <p className="text-xs text-slate-500 mb-3">
            Unrecognised report format — showing raw output:
          </p>
          <pre className="text-[11px] font-mono bg-slate-900 text-green-300 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
            {report?.raw ?? '—'}
          </pre>
        </Card>
      )}
    </Page>
  );
}
