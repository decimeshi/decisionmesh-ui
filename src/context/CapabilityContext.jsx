import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ShieldOff } from 'lucide-react';
import { getCapabilities } from '../utils/api';

window.__mark?.('CapabilityContext.jsx: top');

const CapabilityContext = createContext(null);

/**
 * "Can I do X" for gating nav items, routes, and buttons — never role names.
 *
 * See AuthCapabilitiesResource (backend) for why: tenant_admin structurally
 * does not exist in the Zitadel JWT (ZitadelRoleAugmentor resolves it from
 * role_grant per-request instead), so decoding the token client-side can
 * never recover it. This context asks the server what it already knows,
 * once per session, the same way CreditContext/ProjectContext do for their
 * own data.
 *
 * Defaults to all-false while loading and on failure — an unresolved
 * capability must never be treated as granted. A nav item or route flickering
 * into existence a moment after load is a far smaller cost than briefly
 * showing a control the user cannot actually use.
 */
const DEFAULT_CAPS = {
  canViewSpend:          false,
  canManageKillSwitches: false,
  canLiftKillSwitches:   false,
  isPlatformOperator:    false,
};

export function CapabilityProvider({ keycloak, children }) {
  const [caps,    setCaps]    = useState(DEFAULT_CAPS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!keycloak?.authenticated) { setCaps(DEFAULT_CAPS); setLoading(false); return; }
    try {
      const data = await getCapabilities(keycloak);
      setCaps(data ? { ...DEFAULT_CAPS, ...data } : DEFAULT_CAPS);
    } catch (err) {
      console.error('capabilities load failed — defaulting to none granted', err);
      setCaps(DEFAULT_CAPS);
    } finally {
      setLoading(false);
    }
  }, [keycloak?.authenticated, keycloak?.token]);

  useEffect(() => { load(); }, [load]);

  return (
    <CapabilityContext.Provider value={{ ...caps, loading, reload: load }}>
      {children}
    </CapabilityContext.Provider>
  );
}

export function useCapabilities() {
  const ctx = useContext(CapabilityContext);
  if (!ctx) throw new Error('useCapabilities must be used inside CapabilityProvider');
  return ctx;
}

/**
 * Route guard on a capability rather than a role list — the /spend and
 * /admin/kill-switches counterpart to SysAdminRoute, but checking what the
 * server actually resolved instead of decoding the JWT. Waits for the
 * capability fetch to settle before denying, so a real grant doesn't flash
 * "Access denied" during the initial load.
 *
 * `capability` may be a single key or an array — an array means "any of",
 * e.g. /admin/kill-switches is reachable to view if the caller can either
 * engage or lift a switch, even before we know which.
 */
export function RequireCapability({ capability, children }) {
  const caps = useCapabilities();

  if (caps.loading) return null;

  const keys = Array.isArray(capability) ? capability : [capability];
  const allowed = keys.some(k => caps[k]);

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
            <ShieldOff size={28} className="text-red-400" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 mb-2">Access denied</h1>
          <p className="text-sm text-slate-500 mb-6">
            You don&apos;t have permission to view this page. Contact your administrator
            if you believe this is a mistake.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
          >
            ← Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}
