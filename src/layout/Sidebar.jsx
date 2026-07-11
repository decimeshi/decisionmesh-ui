import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FlaskConical, ListOrdered, Cpu,
  Puzzle, ShieldCheck, BarChart3, TrendingUp,
  KeyRound, ScrollText, ChevronRight, ClipboardCheck,
  UserPlus, PanelLeftClose, FolderOpen,
  ChevronDown, Check, Plus, Palette, CreditCard, Receipt,
  Bug, Library, MessageSquarePlus, TestTube2,
  Users, Coins, Webhook, HeartPulse, Zap, BookOpen, ShieldAlert,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useProject } from '../context/ProjectContext';
import { useCredits } from '../context/CreditContext';
import { hasSysAdminRole } from '../components/SysAdminRoute';

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
    ],
  },
  {
    label: 'ORGANISATION',
    items: [
      { label: 'API Keys',      icon: KeyRound,        to: '/api-keys'       },
      { label: 'Audit Log',     icon: ScrollText,      to: '/audit'          },
      { label: 'Credits',       icon: Receipt,         to: '/credits'        },
      { label: 'Billing',       icon: CreditCard,      to: '/billing'        },
      { label: 'Invite Team',   icon: UserPlus,        to: '/invite'         },
      { label: 'Branding',      icon: Palette,         to: '/org/branding'   },
    ],
  },
  {
    label: 'RESOURCES',
    items: [
      { label: 'Docs',          icon: BookOpen,        to: '/docs'           },
    ],
  },
];

const ADMIN_ITEMS = [
  // First, deliberately. In an incident this is the item you are reaching for —
  // it does not belong buried under Token Debug.
  { label: 'Kill Switches',   icon: ShieldAlert,       to: '/admin/kill-switches' },
  { label: 'Users',           icon: Users,             to: '/admin/users'    },
  { label: 'Credits',         icon: Coins,             to: '/admin/credits'  },
  { label: 'Webhooks',        icon: Webhook,           to: '/admin/webhooks' },
  { label: 'Health',          icon: HeartPulse,        to: '/admin/health'   },
  { label: 'Feedback',        icon: MessageSquarePlus, to: '/admin/feedback' },
  { label: 'Payments',        icon: TestTube2,         to: '/admin/payments' },
  { label: 'Token Debug',     icon: Bug,               to: '/debug/token'    },
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
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--sidebar-label)' }}>
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
        <p className="text-[10px] font-medium" style={{ color: labelColor }}>
          {isEmpty        ? '⚠ No credits — top up now'
           : pct < 10    ? '⚠ Critical — top up now'
           : pct < 30    ? '⚠ Running low'
           :               ''}
        </p>
        <p className="text-[10px]" style={{ color: 'var(--sidebar-label)' }}>
          {Math.round(pct)}%
        </p>
      </div>
    </div>
  );
}

// ── Project switcher ─────────────────────────────────────────────────────────
const ENV_COLOR = { Production: '#22c55e', Staging: '#f59e0b', Dev: '#3b82f6' };

function ProjectSwitcher() {
  const navigate = useNavigate();
  const { org, projects, activeProject, switchProject, loading } = useProject();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width + 24,
        zIndex: 9999,
      });
    }
  }, [open]);

  if (loading) return <div className="h-14 border-b" style={{ borderColor: 'var(--sidebar-border)' }} />;

  return (
    <div className="relative px-3 pb-2 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all text-left group"
        style={{ ':hover': { background: 'var(--sidebar-hover)' } }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: 'var(--brand-gradient)' }}
        >
          {org.name?.[0]?.toUpperCase() ?? 'O'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold leading-none truncate" style={{ color: 'var(--sidebar-text)' }}>
            {org.name}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: ENV_COLOR[activeProject?.environment] ?? '#94a3b8' }} />
            <p className="text-[11px] font-medium leading-none truncate" style={{ color: 'var(--sidebar-text-active)' }}>
              {activeProject?.name ?? 'No project'}
            </p>
          </div>
        </div>
        <ChevronDown size={11} className="shrink-0 transition-transform duration-200"
          style={{ color: 'var(--sidebar-label)', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div className="rounded-xl border overflow-hidden animate-fadeIn"
            style={{ ...dropdownStyle, background: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <div className="px-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#38bdf8' }}>
                Projects
              </p>
            </div>
            <div className="max-h-48 overflow-y-auto py-1 scrollbar-thin">
              {projects.map(p => (
                <button key={p.id} onClick={() => { switchProject(p); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 transition-colors text-left"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: ENV_COLOR[p.environment] ?? '#94a3b8' }} />
                  <span className="flex-1 text-sm truncate" style={{ color: 'var(--sidebar-text)' }}>{p.name}</span>
                  {p.id === activeProject?.id && (
                    <Check size={12} style={{ color: 'var(--brand)' }} />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t py-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {[
                { label: 'Manage projects', icon: FolderOpen, action: () => navigate('/projects') },
                { label: 'New project',     icon: Plus,       action: () => navigate('/projects?new=1') },
              ].map(({ label, icon: Icon, action }) => (
                <button key={label} onClick={() => { setOpen(false); action(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 transition-colors text-left text-xs"
                  style={{ color: 'var(--sidebar-label)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#e2e8f0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                >
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
          </div>
        </>
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
            style={{ color: isActive ? 'var(--brand)' : 'inherit', opacity: isActive ? 1 : 0.8 }}
          />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

// ── Main sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar({ collapsed, onToggle, onHide, keycloak }) {
  const isAdmin = hasSysAdminRole(keycloak);

  return (
    <aside
      className="flex flex-col h-screen shrink-0 transition-all duration-200"
      style={{
        width: collapsed ? '52px' : '220px',
        background: '#0f172a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex items-center border-b shrink-0',
          collapsed ? 'justify-center px-0 py-[14px]' : 'px-3 py-[11px] gap-2.5'
        )}
        style={{ borderColor: 'rgba(255,255,255,0.06)', minHeight: '52px' }}
      >
        <img src="/decimeshi-icon.svg" alt="DecisionMesh" className="w-11 h-14 shrink-0" />

        {!collapsed && (
          <>
            <div className="flex-1 overflow-hidden">
              <p className="text-[14px] font-black leading-none tracking-tight whitespace-nowrap">
                <span style={{ color: '#F1F5F9' }}>Decision</span><span style={{ color: '#818CF8' }}>Mesh</span>
              </p>
              <p className="text-[8px] font-semibold tracking-[0.15em] uppercase mt-0.5 whitespace-nowrap leading-[1.35]"
                style={{ color: '#DBE4FF' }}>Govern · Secure<br />Optimize · Prove</p>
            </div>
            <button onClick={onHide} title="Hide sidebar"
              className="p-1.5 rounded-md transition-colors shrink-0"
              style={{ color: '#94a3b8', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#f1f5f9'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <PanelLeftClose size={13} />
            </button>
          </>
        )}
      </div>

      {/* ── Project switcher ──────────────────────────────────────────────── */}
      {!collapsed && <ProjectSwitcher />}

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin space-y-4">
        {NAV.map(section => (
          <div key={section.label}>
            {/* Section label */}
            {!collapsed && (
              <p className="px-4 mb-1 text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: '#38bdf8' }}>
                {section.label}
              </p>
            )}
            {collapsed && (
              <div className="mx-auto mb-1 mt-1" style={{ width: 24, height: 1, background: 'rgba(56,189,248,0.3)' }} />
            )}
            {/* Items */}
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavItem key={item.to} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}

        {/* Admin section */}
        {isAdmin && (
          <div>
            {!collapsed && (
              <p className="px-4 mb-1 text-[10px] font-semibold tracking-widest uppercase flex items-center gap-1.5"
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
          'flex items-center gap-2 py-3 border-t text-[11px] transition-colors shrink-0',
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
