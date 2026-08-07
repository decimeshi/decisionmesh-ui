import { createContext, useContext, useState, useEffect } from 'react';
import { getOrgBranding, API_BASE, getActiveTenant, getCurrentProject } from '../utils/api';



export const DEFAULT_BRANDING = {
  orgName:      'DecisionMesh',
  primaryColor: '#2563eb',
  logoUrl:      null,
  logoInitial:  'D',
  favicon:      null,
  // "Dark Trust + Neon Intelligence" palette (V9) — brand-identity colors,
  // tenant-customizable same as primaryColor. Defaults match the migration's
  // column defaults, so a tenant that's never saved branding still gets the
  // full intended palette, not a hole where four colors used to be.
  secondaryColor:     '#1E293B',
  aiAccentColor:      '#06B6D4',
  intelligenceColor:  '#7C3AED',
  governColor:        '#2563EB',
  secureColor:        '#4F46E5',
  optimizeColor:      '#10B981',
  proveColor:         '#F59E0B',
};

const BrandingContext = createContext(null);

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// Direct hex → CSS var, no HSL derivation — unlike primaryColor's single-hue
// system (which derives light/dark/muted/gradient variants from one value),
// these are each already a specific, distinct hex from the palette spec, so
// there's nothing to derive. Same validity guard as the primary-color path.
function applyHexVar(root, cssVar, hex, fallback) {
  const value = hex || fallback;
  if (!HEX_RE.test(value)) return;
  root.style.setProperty(cssVar, value);
}

function applyBrandingToDOM(branding) {
  const color = branding.primaryColor || DEFAULT_BRANDING.primaryColor;

  // Guard — only apply valid 6-digit hex colors
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return;

  const root = document.documentElement;

  applyHexVar(root, '--brand-secondary',    branding.secondaryColor,    DEFAULT_BRANDING.secondaryColor);
  applyHexVar(root, '--brand-ai-accent',    branding.aiAccentColor,     DEFAULT_BRANDING.aiAccentColor);
  applyHexVar(root, '--brand-intelligence', branding.intelligenceColor, DEFAULT_BRANDING.intelligenceColor);
  applyHexVar(root, '--stage-govern',       branding.governColor,       DEFAULT_BRANDING.governColor);
  applyHexVar(root, '--stage-secure',       branding.secureColor,       DEFAULT_BRANDING.secureColor);
  applyHexVar(root, '--stage-optimize',     branding.optimizeColor,     DEFAULT_BRANDING.optimizeColor);
  applyHexVar(root, '--stage-prove',        branding.proveColor,        DEFAULT_BRANDING.proveColor);
  const [h, s, l] = hexToHsl(color);

  // This used to only set --brand-primary/light/dark/text — but most of the
  // app (Sidebar's active-nav highlight, the shared Button's primary variant,
  // icons, spinners — see index.css's :root block) actually reads --brand,
  // --brand-hover, --brand-muted, and --brand-gradient. Saving a new colour
  // on /org/branding updated the four variables nothing consumes and left
  // the ones the UI actually uses locked to the default blue, so the change
  // never visibly took effect anywhere outside this page's own live-preview
  // mockup (which reads React state directly, not these CSS variables).
  const light  = `hsl(${h}, ${s}%, ${Math.min(l + 40, 95)}%)`;
  const muted  = `hsl(${h}, ${s}%, ${Math.min(l + 25, 90)}%)`;
  const dark   = `hsl(${h}, ${s}%, ${Math.max(l - 10, 10)}%)`;
  const text   = `hsl(${h}, ${Math.min(s + 10, 100)}%, ${Math.max(l - 20, 15)}%)`;
  const hue2   = (h + 40) % 360; // gradient's second stop — same tint family, shifted hue

  root.style.setProperty('--brand-h',       h);
  root.style.setProperty('--brand-s',       `${s}%`);
  root.style.setProperty('--brand-l',       `${l}%`);
  root.style.setProperty('--brand-primary', color);
  root.style.setProperty('--brand-light',   light);
  root.style.setProperty('--brand-dark',    dark);
  root.style.setProperty('--brand-text',    text);

  // The actually-consumed variable set (see comment above):
  root.style.setProperty('--brand',          color);
  root.style.setProperty('--brand-hover',    dark);
  root.style.setProperty('--brand-muted',    muted);
  root.style.setProperty('--brand-purple',   `hsl(${hue2}, ${s}%, ${l}%)`);
  root.style.setProperty('--brand-gradient', `linear-gradient(135deg, ${color}, hsl(${hue2}, ${s}%, ${l}%))`);

  if (branding.favicon) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = branding.favicon;
  }

  if (branding.orgName) {
    document.title = `${branding.orgName} — AI Control Plane`;
  }
}

export function BrandingProvider({ keycloak, children }) {
  const [branding, setBranding] = useState(DEFAULT_BRANDING);
  const [loading,  setLoading]  = useState(true);

  // BrandingContext.jsx — replace the useEffect
  useEffect(() => {
    applyBrandingToDOM(DEFAULT_BRANDING);

    if (!keycloak?.authenticated) {
      setLoading(false);
      return;
    }

    // ── Wait for token to be available ────────────────────────────────────
    // request() silently returns null if token is missing — no network call made.
    // We use a direct fetch here so we always know exactly what's happening.
    const loadBranding = async () => {
      try {
        // Ensure fresh token
        await keycloak.updateToken(30).catch(() => {});

        const token = keycloak.token;
        if (!token) {
          console.warn('[Branding] token still missing after refresh');
          setLoading(false);
          return;
        }

        console.log('[Branding] fetching branding with token:', token.substring(0, 20) + '...');

        // Scope headers by hand — this bypasses request() (see comment above)
        // so they don't come for free the way every other call gets them.
        // Missing X-Tenant-Id here meant this always resolved to the user's
        // default/primary tenant server-side, regardless of which tenant was
        // actually active — a multi-tenant user always saw their own
        // workspace's branding no matter which one they picked.
        const activeTenant  = getActiveTenant();
        const activeProject = getCurrentProject();
        const res = await fetch(`${API_BASE}/org/branding`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type':  'application/json',
            ...(activeTenant  ? { 'X-Tenant-Id':  activeTenant }  : {}),
            ...(activeProject ? { 'X-Project-Id': activeProject } : {}),
          }
        });

        console.log('[Branding] GET /api/org/branding status:', res.status);

        if (res.status === 403 || res.status === 401) {
          // ── Not onboarded yet or no tenant — use defaults silently ─────────
          // This happens on first login before setup-tenant completes.
          // BrandingProvider re-renders after reload so branding loads then.
          console.log('[Branding] No tenant yet (status:', res.status, ') — using defaults');
          return;
        }

        if (res.ok) {
          const data = await res.json();
          console.log('[Branding] raw response:', JSON.stringify(data));

          // Normalize — handles both camelCase and snake_case from backend
          const normalized = {
            primaryColor:      data.primaryColor      ?? data.primary_color      ?? DEFAULT_BRANDING.primaryColor,
            orgName:           data.orgName           ?? data.org_name           ?? DEFAULT_BRANDING.orgName,
            logoUrl:           data.logoUrl           ?? data.logo_url           ?? null,
            favicon:           data.favicon           ?? null,
            secondaryColor:    data.secondaryColor    ?? data.secondary_color    ?? DEFAULT_BRANDING.secondaryColor,
            aiAccentColor:     data.aiAccentColor     ?? data.ai_accent_color    ?? DEFAULT_BRANDING.aiAccentColor,
            intelligenceColor: data.intelligenceColor ?? data.intelligence_color ?? DEFAULT_BRANDING.intelligenceColor,
            governColor:       data.governColor       ?? data.govern_color      ?? DEFAULT_BRANDING.governColor,
            secureColor:       data.secureColor       ?? data.secure_color      ?? DEFAULT_BRANDING.secureColor,
            optimizeColor:     data.optimizeColor     ?? data.optimize_color    ?? DEFAULT_BRANDING.optimizeColor,
            proveColor:        data.proveColor        ?? data.prove_color       ?? DEFAULT_BRANDING.proveColor,
          };

          console.log('[Branding] applying primaryColor:', normalized.primaryColor);
          const merged = { ...DEFAULT_BRANDING, ...normalized };
          setBranding(merged);
          applyBrandingToDOM(merged);
        } else {
          console.warn('[Branding] GET failed:', res.status);
        }
      } catch (err) {
        console.error('[Branding] exception:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBranding();

  }, [keycloak?.authenticated]);

  function updateBranding(updates) {
    const merged = { ...branding, ...updates };
    setBranding(merged);
    applyBrandingToDOM(merged);
  }

  return (
      <BrandingContext.Provider value={{ branding, updateBranding, loading }}>
        {children}
      </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used inside BrandingProvider');
  return ctx;
}
