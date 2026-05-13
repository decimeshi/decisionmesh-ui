import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, LogOut, User, ChevronRight, PanelLeftOpen,
  Settings, UserPlus, ChevronDown, Palette, CreditCard,
  Zap, FileText, Download,
} from 'lucide-react';
import { shortId } from '../lib/utils';
import { useProject } from '../context/ProjectContext';
import { useCredits } from '../context/CreditContext';

const LABELS = {
  '/':                    'Dashboard',
  '/playground':          'Playground',
  '/intent-library':      'Intent Library',
  '/intents':             'Intents',
  '/executions':          'Execution Monitor',
  '/adapters':            'Adapters',
  '/policies':            'Policy Builder',
  '/analytics/cost':      'Cost Analytics',
  '/analytics/drift':     'Drift Dashboard',
  '/api-keys':            'API Keys',
  '/audit':               'Audit Log',
  '/invite':              'Team & Invitations',
  '/projects':            'Projects',
  '/profile':             'Account Settings',
  '/org/branding':        'Organisation Branding',
  '/billing':             'Billing & Plans',
  '/credits':             'Credit Ledger',
  '/debug/token':         'Token Debug',
  '/admin/users':         'Admin · Users',
  '/admin/credits':       'Admin · Credit Ledger',
  '/admin/webhooks':      'Admin · Webhooks',
  '/admin/health':        'Admin · System Health',
  '/admin/feedback':      'Admin · Feedback',
  '/admin/payments':      'Admin · Payment Testing',
};

function useBreadcrumbs() {
  const { pathname } = useLocation();
  if (LABELS[pathname]) return [{ label: LABELS[pathname] }];
  const parts = pathname.split('/').filter(Boolean);
  return parts.map((part, i) => {
    const path = '/' + parts.slice(0, i + 1).join('/');
    return { label: LABELS[path] ?? (part.length === 36 ? shortId(part) : part) };
  });
}

function CreditPill() {
  const navigate = useNavigate();
  const { balance, allocated, statusColor, isLow, isEmpty } = useCredits();
  if (balance === null) return null;
  const pct = allocated ? Math.min(100, (balance / allocated) * 100) : 100;

  return (
    <button
      onClick={() => navigate('/billing?tab=credits')}
      title={`${balance?.toLocaleString()} credits remaining`}
      className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all"
      style={{ background: '#f8fafc', border: `1px solid ${isEmpty || isLow ? statusColor + '40' : '#e2e8f0'}` }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = isEmpty || isLow ? statusColor + '40' : '#e2e8f0'}
    >
      <Zap size={11} style={{ color: statusColor }} />
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[11px] font-semibold leading-none tabular-nums" style={{ color: statusColor }}>
          {balance?.toLocaleString()}<span className="font-normal text-slate-400"> cr</span>
        </span>
        <div className="w-12 h-0.5 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: isLow || isEmpty ? statusColor : 'var(--brand)' }} />
        </div>
      </div>
    </button>
  );
}

function UserMenu({ keycloak }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const user = keycloak?.tokenParsed;

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const initials = [user?.given_name?.[0], user?.family_name?.[0]]
    .filter(Boolean).join('').toUpperCase() || user?.preferred_username?.[0]?.toUpperCase() || '?';

  const MENU = [
    {
      group: 'Account',
      items: [
        { icon: User,       label: 'Profile settings',      action: () => navigate('/profile') },
        { icon: Settings,   label: 'Security',              action: () => navigate('/profile?tab=security') },
      ],
    },
    {
      group: 'Organisation',
      items: [
        { icon: Palette,    label: 'Branding',              action: () => navigate('/org/branding') },
        { icon: CreditCard, label: 'Billing & Plans',       action: () => navigate('/billing') },
        { icon: Zap,        label: 'Credit ledger',         action: () => navigate('/credits') },
      ],
    },
    {
      group: 'Team',
      items: [
        { icon: UserPlus,   label: 'Invite users',          action: () => navigate('/invite') },
      ],
    },
    {
      group: 'Developer',
      items: [
        { icon: FileText,   label: 'API Reference',         action: () => window.open('/api-docs', '_blank') },
        {
          icon: Download,
          label: 'Download OpenAPI spec',
          action: () => {
            const a = document.createElement('a');
            a.href = '/openapi.yaml';
            a.download = 'decisionmesh-openapi.yaml';
            a.click();
          },
        },
      ],
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 border-l pl-2.5 ml-0.5 px-2 py-1.5 rounded-lg transition-colors"
        style={{ borderColor: '#e2e8f0' }}
        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: 'var(--brand-gradient)' }}>
          {initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-[12px] font-semibold text-slate-700 leading-none">{user?.preferred_username ?? user?.name ?? '—'}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[120px]">{user?.email ?? ''}</p>
        </div>
        <ChevronDown size={11} className={`text-slate-400 hidden sm:block transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 overflow-hidden z-50 animate-fadeIn"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-[12px] font-semibold text-slate-700 truncate">{user?.name ?? user?.preferred_username}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{user?.email}</p>
          </div>
          {MENU.map(({ group, items }) => (
            <div key={group} className="py-1 border-b border-slate-100 last:border-0">
              <p className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{group}</p>
              {items.map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={() => { action(); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-600 transition-colors text-left"
                  onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}
                >
                  <Icon size={13} className="text-slate-400 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          ))}
          <div className="py-1">
            <button onClick={() => keycloak?.logout()}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 transition-colors text-left"
              onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <LogOut size={13} className="shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TopBar({ keycloak, sidebarHidden, onToggleSidebar }) {
  const crumbs = useBreadcrumbs();
  const { activeProject, loading: projectLoading } = useProject();

  return (
    <header className="flex items-center justify-between shrink-0 px-4"
      style={{ height: 'var(--topbar-h)', background: 'var(--topbar-bg)', borderBottom: '1px solid var(--topbar-border)' }}>
      <div className="flex items-center gap-2 min-w-0">
        {sidebarHidden && (
          <button onClick={onToggleSidebar} title="Show sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0">
            <PanelLeftOpen size={14} />
          </button>
        )}
        <nav className="flex items-center gap-1 min-w-0">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight size={10} className="text-slate-300 shrink-0" />}
              <span className={`truncate text-[13px] ${i === crumbs.length - 1 ? 'font-semibold text-slate-900' : 'font-medium text-slate-400'}`}>
                {c.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <CreditPill />
        {!projectLoading && activeProject && (
          <span className="hidden lg:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium border"
            style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate max-w-[100px]">{activeProject.name}</span>
          </span>
        )}
        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <Bell size={14} />
        </button>
        <UserMenu keycloak={keycloak} />
      </div>
    </header>
  );
}
