import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FlaskConical, ListOrdered, Cpu,
  Puzzle, ShieldCheck, BarChart3, TrendingUp,
  KeyRound, ScrollText, ChevronRight, ClipboardCheck,
  UserPlus, PanelLeftClose, FolderOpen,
  Check, Palette, CreditCard, Receipt,
  Bug, Library, MessageSquarePlus, TestTube2,
  Users, Coins, Webhook, HeartPulse, Zap, BookOpen, ShieldAlert, DollarSign,
  Trash2, Globe2, Building2, Plug, Layers, Rocket,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useProject } from '../context/ProjectContext';
import { useCredits } from '../context/CreditContext';
import { useCapabilities } from '../context/CapabilityContext';
import { useBranding } from '../context/BrandingContext';

// BrandingContext's pre-fetch/no-override placeholder — see SidebarHeader
// below for why this needs to be distinguished from a real override.
const NO_BRANDING_ORG_NAME = 'DecisionMesh';

// "Dark Trust + Neon Intelligence" palette — every nav icon previously lit up
// the same flat --brand blue when active, giving no visual distinction
// between sections. Keyed by item.label (not route), falls back to --brand
// for any item not explicitly called out in the spec.
const NAV_ICON_COLORS = {
  'Dashboard':      '#2563eb', // blue
  'Intent Library': '#7c3aed', // purple
  'Policies':       '#ea580c', // orange
  'Cost':           '#16a34a', // green — "Analytics"
  'Drift':          '#16a34a', // green — "Analytics"
  'AI Spend':       '#16a34a', // green — "Analytics"
  'Adapters':       '#06b6d4', // cyan
};

// ── Nav structure ─────────────────────────────────────────────────────────────
const NAV = [
  {
    label: 'CORE',
    items: [
      { label: 'Dashboard',     icon: LayoutDashboard, to: '/',              end: true },
    ],
  },
  {
    label: 'PLAYGROUND',
    items: [
      { label: 'Playground',    icon: FlaskConical,    to: '/playground'     },
      { label: 'Intent Library',icon: Library,         to: '/intent-library' },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { label: 'Intents',       icon: ListOrdered,     to: '/intents'        },
      { label: 'Executions',    icon: Cpu,             to: '/executions'     },
      { label: 'Adapters',      icon: Puzzle,          to: '/adapters'       },
      { label: 'Policies',      icon: ShieldCheck,     to: '/policies'       },
      { label: 'Review Queue',  icon: ClipboardCheck,  to: '/review-queue'   },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { label: 'Cost',          icon: BarChart3,       to: '/analytics/cost' },
      { label: 'Drift',         icon: TrendingUp,      to: '/analytics/drift'},
      // CXO-only — filtered out below for callers without sys_admin/tenant_admin.
      { label: 'AI Spend',      icon: DollarSign,      to: '/spend', cxoOnly: true },
    ],
  },
  {
    label: 'ORGANISATION',
    items: [
      // API Keys/Billing/Invite/Branding: no partial-visibility case for a
      // regular tenant_user (MEMBER/VIEWER/AUDITOR) — tenantAdminOnly hides
      // them entirely rather than showing controls that would just 403.
      // Audit Log/Credits stay visible to everyone — MEMBER/VIEWER hold
      // read access to both (see Role.java), and Credits is informational
      // usage tracking, not a configuration surface.
      // Ungated, matching the old ProjectSwitcher dropdown's "Manage projects"/
      // "New project" links it replaces — those were reachable by anyone who
      // could open that dropdown, no tenantAdminOnly check. Removing them from
      // the consolidated header (see SidebarHeader) without adding this back
      // meant create/edit/delete became unreachable from the UI entirely.
      { label: 'Projects',      icon: FolderOpen,      to: '/projects'       },
      { label: 'API Keys',      icon: KeyRound,        to: '/api-keys',      tenantAdminOnly: true },
      // BYOK/BYOM config lives inside Billing (tab=byok) — a distinct
      // destination from "API Keys" above (DecisionMesh's own platform
      // keys, unrelated to bring-your-own-key/model). Previously only
      // reachable via a Playground quick-link card; now a real nav item.
      { label: 'BYOK / BYOM',   icon: Plug,            to: '/billing?tab=byok', tenantAdminOnly: true },
      { label: 'Audit Log',     icon: ScrollText,      to: '/audit'          },
      { label: 'Credits',       icon: Receipt,         to: '/credits'        },
      { label: 'Billing',       icon: CreditCard,      to: '/billing',       tenantAdminOnly: true },
      { label: 'Invite Team',   icon: UserPlus,        to: '/invite',        tenantAdminOnly: true },
      { label: 'Branding',      icon: Palette,         to: '/org/branding',  tenantAdminOnly: true },
    ],
  },
  {
    label: 'RESOURCES',
    items: [
      { label: 'Docs',          icon: BookOpen,        to: '/docs'           },
      { label: 'Architecture',  icon: Layers,          to: '/architecture'   },
      { label: 'Accelerators',  icon: Rocket,          to: '/accelerators'   },
    ],
  },
];

// ── MEMBER's restricted nav ─────────────────────────────────────────────────────
// Deliberately the same shape as dm-ui's own NAV (see D:\DM\dm-ui\src\layout\
// Sidebar.jsx) — a MEMBER-role tenant user logging into decisionmesh-ui gets
// the identical restricted, "API-key-integration" view dm-ui shows, complete
// with the tenant's own branding (SidebarHeader already reads useBranding()
// regardless of which nav array is active). OWNER/ADMIN/VIEWER/AUDITOR are
// unaffected — this only replaces the nav when AuthCapabilitiesResource's
// isMemberRole resolves true, computed server-side from the same tenant-wide
// role that already restricts IntentResource.list() to "my own intents" for
// a MEMBER, not derived or duplicated here.
const MEMBER_NAV = [
  {
    label: 'CORE',
    items: [
      { label: 'Dashboard',     icon: LayoutDashboard, to: '/',              end: true },
    ],
  },
  {
    label: 'PLAYGROUND',
    items: [
      { label: 'Playground',    icon: FlaskConical,    to: '/playground'     },
      { label: 'Intent Library',icon: Library,         to: '/intent-library' },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { label: 'Intents',       icon: ListOrdered,     to: '/intents'        },
    ],
  },
];

// Kill Switches used to live in ADMIN_ITEMS, gated on isAdmin (sys_admin only)
// along with everything else in that section. That was wrong once
// /admin/kill-switches itself was widened to accept tenant_admin too (see
// App.jsx) — a tenant_admin who could actually open the page would never see
// it in the nav, because the whole Admin section was invisible to them.
// Rendered separately below, gated on the same capability the route checks.
const ADMIN_ITEMS = [
  { label: 'Tenants',         icon: Building2,         to: '/admin/tenants'          },
  { label: 'Users',           icon: Users,             to: '/admin/users'            },
  { label: 'Credits',         icon: Coins,             to: '/admin/credits'          },
  { label: 'Webhooks',        icon: Webhook,           to: '/admin/webhooks'         },
  { label: 'Health',          icon: HeartPulse,        to: '/admin/health'           },
  { label: 'Feedback',        icon: MessageSquarePlus, to: '/admin/feedback'         },
  { label: 'Payments',        icon: TestTube2,         to: '/admin/payments'         },
  { label: 'Retention',       icon: Trash2,            to: '/admin/retention'        },
  { label: 'Platform report', icon: Globe2,            to: '/admin/reports/platform' },
  { label: 'Token Debug',     icon: Bug,               to: '/debug/token'            },
];

// ── Credit footer ─────────────────────────────────────────────────────────────
function CreditFooter() {
  const navigate = useNavigate();
  const { balance, allocated, isEmpty, isLow } = useCredits();
  if (balance === null) return null;

  const pct = allocated ? Math.min(100, (balance / allocated) * 100) : 100;

  // Tiered colour system — gives visual feedback as credits deplete
  // >60% green, 30-60% blue, 10-30% amber, <10% red
  const barColor  = isEmpty  ? '#dc2626'
                  : pct < 10 ? '#dc2626'   // red   — critical
                  : pct < 30 ? '#f59e0b'   // amber — low
                  : pct < 60 ? '#3b82f6'   // blue  — moderate
                  :            '#16a34a';  // green — healthy

  const labelColor = isEmpty  ? '#dc2626'
                   : pct < 10 ? '#dc2626'
                   : pct < 30 ? '#f59e0b'
                   :            '#16a34a';

  const bgColor     = isEmpty || pct < 10 ? 'rgba(239,68,68,0.08)'
                    : pct < 30            ? 'rgba(245,158,11,0.08)'
                    :                      'rgba(255,255,255,0.04)';

  const borderColor = isEmpty || pct < 10 ? 'rgba(239,68,68,0.2)'
                    : pct < 30            ? 'rgba(245,158,11,0.2)'
                    :                      'rgba(255,255,255,0.07)';

  const isWarning = isEmpty || isLow;

  return (
    <div
      onClick={() => navigate('/billing?tab=credits')}
      className="mx-3 mb-3 mt-1 cursor-pointer rounded-lg border transition-all"
      style={{ background: bgColor, borderColor, padding: '10px 12px' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Zap size={11} style={{ color: labelColor }} />
          <span className="text-2xs font-semibold uppercase tracking-widest" style={{ color: 'var(--sidebar-label)' }}>
            Credits
          </span>
        </div>
        <span className="text-xs font-bold tabular-nums" style={{ color: labelColor }}>
          {balance?.toLocaleString()}
        </span>
      </div>
      {/* Segmented progress bar — shows exact credit level at a glance */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <div className="flex justify-between mt-1.5">
        <p className="text-2xs font-medium" style={{ color: labelColor }}>
          {isEmpty        ? '⚠ No credits — top up now'
           : pct < 10    ? '⚠ Critical — top up now'
           : pct < 30    ? '⚠ Running low'
           :               ''}
        </p>
        <p className="text-2xs" style={{ color: 'var(--sidebar-label)' }}>
          {Math.round(pct)}%
        </p>
      </div>
    </div>
  );
}

// ── Sidebar header: org logo + name, and a flat list of every project ──────────
// Was previously two separate, redundant blocks: a hardcoded "DecisionMesh /
// Govern·Secure / Optimize·Prove" brand header stacked on top of a
// click-to-open ProjectSwitcher dropdown showing the REAL org name — two
// different identities on screen at once, and the real one hidden behind an
// extra click. Consolidated into one real, data-driven header: the org's own
// logo/name (editable on /org/branding — see BrandingContext), then every
// project listed directly. "Manage projects" / "New project" intentionally
// dropped from here — Projects.jsx (linked elsewhere in the nav) is still the
// real place for that; this header is deliberately just identity + a switcher.
const ENV_COLOR = { Production: '#22c55e', Staging: '#f59e0b', Dev: '#3b82f6' };

function SidebarHeader({ collapsed, onHide }) {
  const { org, projects, activeProject, switchProject, loading } = useProject();
  const { branding } = useBranding();

  // branding.orgName/logoUrl come from the tenant's own Organisation Branding
  // page (/org/branding) — a cosmetic override on top of the real org record.
  // NO_BRANDING_ORG_NAME is BrandingContext's pre-fetch placeholder,
  // indistinguishable from a 404 (no branding row saved yet); either way it
  // means "nothing to override with", so fall through to the real org name.
  const hasNameOverride = branding.orgName && branding.orgName !== NO_BRANDING_ORG_NAME;
  const displayName = hasNameOverride ? branding.orgName : (org?.name ?? 'Organisation');
  const logoSrc = branding.logoUrl || '/decimeshi-icon.svg';

  if (collapsed) {
    return (
      <div className="flex items-center justify-center border-b shrink-0 px-0 py-[14px]"
        style={{ borderColor: 'rgba(255,255,255,0.06)', minHeight: '52px' }}>
        <img src={logoSrc} alt={displayName} className="w-11 h-14 shrink-0" />
      </div>
    );
  }

  return (
    <div className="border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="flex items-center px-3 py-[11px] gap-2.5" style={{ minHeight: '52px' }}>
        <img src={logoSrc} alt={displayName} className="w-11 h-14 shrink-0 rounded-md object-cover" />
        <div className="flex-1 overflow-hidden">
          <p className="text-[14px] font-black leading-none tracking-tight truncate" style={{ color: '#F1F5F9' }}>
            {loading ? 'Loading…' : displayName}
          </p>
          <p className="text-2xs font-semibold tracking-wide uppercase mt-0.5 truncate" style={{ color: '#DBE4FF' }}>
            AI Control Plane
          </p>
        </div>
        <button onClick={onHide} title="Hide sidebar"
          className="p-1.5 rounded-md transition-colors shrink-0"
          style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#f1f5f9'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          <PanelLeftClose size={13} />
        </button>
      </div>

      {!loading && projects.length > 0 && (
        <div className="px-2 pb-2 space-y-0.5 max-h-40 overflow-y-auto scrollbar-thin">
          {projects.map(p => {
            const active = p.id === activeProject?.id;
            return (
              <button key={p.id} onClick={() => switchProject(p)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors"
                style={active ? { background: 'rgba(37,99,235,0.2)' } : {}}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: ENV_COLOR[p.environment] ?? '#94a3b8' }} />
                <span className="flex-1 text-xs truncate"
                  style={{ color: active ? '#93c5fd' : 'var(--sidebar-text)' }}>{p.name}</span>
                {active && <Check size={11} style={{ color: 'var(--brand)' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Nav item ─────────────────────────────────────────────────────────────────
function NavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) => cn(
        'flex items-center gap-2.5 rounded-md text-[13px] font-medium transition-all duration-150 relative',
        collapsed ? 'justify-center px-0 py-2 mx-1' : 'px-2.5 py-1.5 mx-2',
        'group'
      )}
      style={({ isActive }) => isActive
        ? {
            background: 'rgba(37,99,235,0.2)',
            color: '#93c5fd',
            borderLeft: collapsed ? 'none' : '2px solid #2563eb',
            paddingLeft: collapsed ? undefined : '10px',
          }
        : { color: '#94a3b8' }
      }
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.color = '#f1f5f9';
      }}
      onMouseLeave={e => {
        const isActive = e.currentTarget.getAttribute('aria-current');
        if (!isActive) {
          e.currentTarget.style.background = '';
          e.currentTarget.style.color = '#94a3b8';
        }
      }}
    >
      {({ isActive }) => (
        <>
          <item.icon
            size={14}
            className="shrink-0"
            style={{ color: isActive ? (NAV_ICON_COLORS[item.label] ?? 'var(--brand)') : 'inherit', opacity: isActive ? 1 : 0.8 }}
          />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

// ── Main sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar({ collapsed, onToggle, onHide, keycloak }) {
  // isAdmin used to be hasSysAdminRole(keycloak) — a client-side JWT decode.
  // That breaks for a sys_admin seeded via the platform_admin bootstrap table
  // (see ZitadelRoleAugmentor / V2__platform_admin.sql): the server grants
  // them sys_admin in the SecurityIdentity, but nothing adds that role to the
  // JWT the browser actually holds, so the decode would hide the entire Admin
  // section from exactly the God account it exists to bootstrap. isPlatformOperator
  // is resolved server-side by AuthCapabilitiesResource from the same
  // identity.hasRole() call every gated admin resource uses, so it can't drift
  // from what the backend will actually allow — same reasoning as canViewSpend
  // below for tenant_admin.
  const {
    canViewSpend: isCxo, canManageKillSwitches, canLiftKillSwitches,
    isPlatformOperator: isAdmin, isTenantAdmin, isMemberRole,
  } = useCapabilities();
  // isAdmin included so a sys_admin without an explicit KILLSWITCH_ENGAGE/LIFT
  // grant (platform authority bypasses the permission check server-side too,
  // see AccessControl.can) still sees the item.
  const canSeeKillSwitches = isAdmin || canManageKillSwitches || canLiftKillSwitches;
  // See MEMBER_NAV's own comment — a MEMBER gets the restricted,
  // dm-ui-equivalent nav instead of the full operator one.
  const activeNav = isMemberRole ? MEMBER_NAV : NAV;

  return (
    <aside
      className="flex flex-col h-screen shrink-0 transition-all duration-200"
      style={{
        width: collapsed ? '52px' : '220px',
        background: '#0f172a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* ── Header: org logo/name + full project list ───────────────────────── */}
      <SidebarHeader collapsed={collapsed} onHide={onHide} />

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin space-y-4">
        {activeNav.map(section => (
          <div key={section.label}>
            {/* Section label */}
            {!collapsed && (
              <p className="px-4 mb-1 text-2xs font-semibold tracking-widest uppercase"
                style={{ color: '#38bdf8' }}>
                {section.label}
              </p>
            )}
            {collapsed && (
              <div className="mx-auto mb-1 mt-1" style={{ width: 24, height: 1, background: 'rgba(56,189,248,0.3)' }} />
            )}
            {/* Items */}
            <div className="space-y-0.5">
              {section.items
                .filter(item => !item.cxoOnly || isCxo)
                .filter(item => !item.tenantAdminOnly || isTenantAdmin)
                .map(item => (
                  <NavItem key={item.to} item={item} collapsed={collapsed} />
                ))}
            </div>
          </div>
        ))}

        {/* Kill Switches — deliberately its own item, not nested in the sys_admin-only
            Admin section below. The route accepts tenant_admin too (KillSwitchResource
            authorises both), so gating the nav link on isAdmin alone would hide it from
            exactly the tenant_admin who can actually use it — an incident-response tool
            that's reachable by URL but invisible in the nav is worse than not having it. */}
        {canSeeKillSwitches && (
          <div>
            <div className={collapsed ? 'mx-auto mb-1 mt-1' : 'mx-4 mb-1 mt-1'}
              style={{ height: 1, background: 'rgba(59,130,246,0.3)', width: collapsed ? 24 : undefined }} />
            <div className="space-y-0.5">
              <NavItem item={{ label: 'Kill Switches', icon: ShieldAlert, to: '/admin/kill-switches' }} collapsed={collapsed} />
            </div>
          </div>
        )}

        {/* Admin section */}
        {isAdmin && (
          <div>
            {!collapsed && (
              <p className="px-4 mb-1 text-2xs font-semibold tracking-widest uppercase flex items-center gap-1.5"
                style={{ color: '#38bdf8' }}>
                <ShieldCheck size={9} /> Admin
              </p>
            )}
            {collapsed && (
              <div className="mx-auto mb-1 mt-1" style={{ width: 24, height: 1, background: 'rgba(59,130,246,0.3)' }} />
            )}
            <div className="space-y-0.5">
              {ADMIN_ITEMS.map(item => (
                <NavItem key={item.to} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── Credits ───────────────────────────────────────────────────────── */}
      {!collapsed && <CreditFooter />}

      {/* ── Collapse toggle ───────────────────────────────────────────────── */}
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-2 py-3 border-t text-2xs transition-colors shrink-0',
          collapsed ? 'justify-center px-0' : 'px-4'
        )}
        style={{
          borderColor: 'rgba(255,255,255,0.06)',
          color: '#475569',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--sidebar-text)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--sidebar-label)'; }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronRight size={12} className={cn('transition-transform duration-200', !collapsed && 'rotate-180')} />
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}
