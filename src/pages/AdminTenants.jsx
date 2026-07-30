/**
 * AdminTenants.jsx — Tenant Directory (sys_admin only)
 * Calls GET/POST /api/admin/tenants/*, /api/admin/organizations/*
 * from AdminTenantResource.java
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Building2, Search, RefreshCw, Check, X, AlertCircle,
  ChevronLeft, ChevronRight, ShieldCheck, ShieldOff, Eye,
  X as Close, Users2, FolderKanban, Building,
} from 'lucide-react';
import Page from '../components/shared/Page';
import { Card, Spinner } from '../components/shared';
import {
  getAdminTenants, getAdminTenant, getTenantOrganizations,
  getTenantTeams, getTenantProjects,
  suspendTenant, activateTenant, suspendOrganization, activateOrganization,
} from '../utils/api';

function StatusBadge({ status }) {
  const active = status === 'ACTIVE';
  return active
    ? <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><Check size={9} /> Active</span>
    : <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200"><X size={9} /> {status ?? 'Suspended'}</span>;
}

const TABS = [
  { id: 'organizations', label: 'Organizations', icon: Building },
  { id: 'teams',         label: 'Teams',         icon: Users2 },
  { id: 'projects',      label: 'Projects',      icon: FolderKanban },
];

export default function AdminTenants({ keycloak }) {
  const [tenants,     setTenants]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [statusFilter,setStatusFilter]= useState('all'); // all | active | suspended
  const [page,        setPage]        = useState(0);
  const [acting,      setActing]      = useState(null);  // tenantId/orgId being acted on
  const [toast,       setToast]       = useState(null);
  const PAGE_SIZE = 20;

  // Detail drawer
  const [detailTenant,  setDetailTenant]  = useState(null); // {} while loading, null when closed
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab,     setActiveTab]     = useState('organizations');
  const [orgs,     setOrgs]     = useState([]);
  const [teams,    setTeams]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminTenants(keycloak, {
        page, size: PAGE_SIZE, search: search.trim() || null,
        status: statusFilter !== 'all' ? statusFilter.toUpperCase() : null,
      });
      setTenants(data ?? []);
    } catch (e) {
      showToast('error', e.message ?? 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  }, [keycloak, page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  }

  async function handleSuspend(tenant) {
    setActing(tenant.id);
    try {
      await suspendTenant(keycloak, tenant.id);
      showToast('success', `${tenant.name} suspended`);
      load();
      if (detailTenant?.id === tenant.id) handleViewTenant(tenant.id);
    } catch (e) { showToast('error', e.message); }
    finally { setActing(null); }
  }

  async function handleActivate(tenant) {
    setActing(tenant.id);
    try {
      await activateTenant(keycloak, tenant.id);
      showToast('success', `${tenant.name} activated`);
      load();
      if (detailTenant?.id === tenant.id) handleViewTenant(tenant.id);
    } catch (e) { showToast('error', e.message); }
    finally { setActing(null); }
  }

  async function handleToggleOrg(org) {
    setActing(org.id);
    try {
      if (org.isActive) {
        await suspendOrganization(keycloak, org.id);
        showToast('success', `${org.name} suspended`);
      } else {
        await activateOrganization(keycloak, org.id);
        showToast('success', `${org.name} activated`);
      }
      const updated = await getTenantOrganizations(keycloak, detailTenant.id);
      setOrgs(updated ?? []);
    } catch (e) { showToast('error', e.message); }
    finally { setActing(null); }
  }

  async function handleViewTenant(tenantId) {
    setDetailLoading(true);
    setActiveTab('organizations');
    setDetailTenant({}); // open drawer immediately with loading state
    try {
      const data = await getAdminTenant(keycloak, tenantId);
      setDetailTenant(data);
      loadTabData(tenantId);
    } catch (e) {
      showToast('error', e.message ?? 'Failed to load tenant detail');
      setDetailTenant(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function loadTabData(tenantId) {
    setTabLoading(true);
    try {
      const [o, t, p] = await Promise.all([
        getTenantOrganizations(keycloak, tenantId),
        getTenantTeams(keycloak, tenantId),
        getTenantProjects(keycloak, tenantId),
      ]);
      setOrgs(o ?? []);
      setTeams(t ?? []);
      setProjects(p ?? []);
    } catch (e) {
      showToast('error', e.message ?? 'Failed to load tenant sub-resources');
    } finally {
      setTabLoading(false);
    }
  }

  return (
    <Page title="Tenant directory" subtitle="Browse tenants, organizations, teams and projects across the platform">

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
          {toast.text}
          <button onClick={() => setToast(null)} className="ml-auto opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search by name or external ID..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-400"
          />
        </div>

        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
          {[
            { id: 'all',       label: 'All' },
            { id: 'active',    label: '✓ Active' },
            { id: 'suspended', label: '✗ Suspended' },
          ].map(f => (
            <button key={f.id} onClick={() => { setStatusFilter(f.id); setPage(0); }}
              className={`px-3 py-2 font-medium transition-colors ${
                statusFilter === f.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        <button onClick={() => load()}
          className="flex items-center gap-1.5 px-3 py-2 text-xs border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="w-7 h-7" /></div>
      ) : tenants.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 size={24} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No tenants found.</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Tenant</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Account type</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Region</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Created</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{t.name}</p>
                      <p className="text-slate-400 font-mono text-[10px]">{t.externalId}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-slate-600">{t.accountType ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{t.homeRegion ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleViewTenant(t.id)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                          title="View tenant detail"
                        >
                          <Eye size={10} /> View
                        </button>

                        {t.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleSuspend(t)}
                            disabled={acting === t.id}
                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors"
                            title="Suspend tenant"
                          >
                            {acting === t.id
                              ? <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              : <><ShieldOff size={10} /> Suspend</>
                            }
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(t)}
                            disabled={acting === t.id}
                            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 transition-colors"
                            title="Activate tenant"
                          >
                            {acting === t.id
                              ? <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                              : <><ShieldCheck size={10} /> Activate</>
                            }
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">Page {page + 1}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
                <ChevronLeft size={13} />
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={tenants.length < PAGE_SIZE}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Tenant detail drawer */}
      {detailTenant !== null && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setDetailTenant(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-lg z-50 bg-white shadow-2xl border-l border-slate-200 flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-900">Tenant detail</p>
              <button onClick={() => setDetailTenant(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <Close size={14} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Spinner className="w-6 h-6" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {/* Identity */}
                <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Identity</p>
                    <StatusBadge status={detailTenant.status} />
                  </div>
                  {[
                    { label: 'Name',            value: detailTenant.name           ?? '—' },
                    { label: 'External ID',     value: detailTenant.externalId     ?? '—' },
                    { label: 'Account type',    value: detailTenant.accountType    ?? '—' },
                    { label: 'Home region',     value: detailTenant.homeRegion     ?? '—' },
                    { label: 'Residency policy',value: detailTenant.residencyPolicy?? '—' },
                    { label: 'Created',         value: detailTenant.createdAt
                        ? new Date(detailTenant.createdAt).toLocaleString() : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4">
                      <span className="text-xs text-slate-500 shrink-0">{label}</span>
                      <span className="text-xs font-medium text-slate-800 text-right break-all">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Tenant ID */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] text-slate-400 mb-0.5">Tenant ID</p>
                  <code className="text-[10px] font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded block break-all">
                    {detailTenant.id}
                  </code>
                </div>

                {/* Quick action */}
                {detailTenant.status === 'ACTIVE' ? (
                  <button
                    onClick={() => handleSuspend(detailTenant)}
                    disabled={acting === detailTenant.id}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors"
                  >
                    <ShieldOff size={12} /> Suspend tenant
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(detailTenant)}
                    disabled={acting === detailTenant.id}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-emerald-200 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 transition-colors"
                  >
                    <ShieldCheck size={12} /> Activate tenant
                  </button>
                )}

                {/* Sub-resource tabs */}
                <div>
                  <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs mb-3">
                    {TABS.map(tab => {
                      const count = tab.id === 'organizations' ? orgs.length
                          : tab.id === 'teams' ? teams.length : projects.length;
                      return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 font-medium transition-colors ${
                            activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                          }`}>
                          <tab.icon size={11} /> {tab.label}
                          <span className={`text-[10px] ${activeTab === tab.id ? 'text-slate-300' : 'text-slate-400'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {tabLoading ? (
                    <div className="flex justify-center py-8"><Spinner className="w-5 h-5" /></div>
                  ) : (
                    <div className="space-y-2">
                      {activeTab === 'organizations' && (
                        orgs.length === 0
                          ? <p className="text-xs text-slate-400 text-center py-6">No organizations.</p>
                          : orgs.map(o => (
                            <div key={o.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-800 truncate">{o.name}</p>
                                <p className="text-[10px] text-slate-400">{o.companySize ?? 'size n/a'}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {o.isActive
                                  ? <span className="text-[10px] font-bold text-emerald-700">Active</span>
                                  : <span className="text-[10px] font-bold text-red-600">Suspended</span>}
                                <button
                                  onClick={() => handleToggleOrg(o)}
                                  disabled={acting === o.id}
                                  className="px-2 py-1 rounded-md text-[10px] font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                                >
                                  {acting === o.id
                                    ? '…'
                                    : (o.isActive ? 'Suspend' : 'Activate')}
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                      {activeTab === 'teams' && (
                        teams.length === 0
                          ? <p className="text-xs text-slate-400 text-center py-6">No teams.</p>
                          : teams.map(tm => (
                            <div key={tm.id} className="rounded-lg border border-slate-200 px-3 py-2.5">
                              <p className="text-xs font-semibold text-slate-800">{tm.name}</p>
                              <p className="text-[10px] text-slate-400">
                                {tm.createdAt ? new Date(tm.createdAt).toLocaleDateString() : '—'}
                              </p>
                            </div>
                          ))
                      )}
                      {activeTab === 'projects' && (
                        projects.length === 0
                          ? <p className="text-xs text-slate-400 text-center py-6">No projects.</p>
                          : projects.map(p => (
                            <div key={p.id} className="rounded-lg border border-slate-200 px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold text-slate-800">{p.name}</p>
                                {p.isDefault && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                    default
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400">{p.environment ?? '—'}</p>
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Page>
  );
}
