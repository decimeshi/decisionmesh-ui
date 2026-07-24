import React, { useMemo, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from 'react-oidc-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import BlogIndex         from './pages/blog/BlogIndex.jsx';
import AuditOpenAiCalls  from './pages/blog/AuditOpenAiCalls.jsx';
import ShadowAiRisk      from './pages/blog/ShadowAiRisk.jsx';
import LlmCostControl    from './pages/blog/LlmCostControl.jsx';
import Soc2AiCompliance  from './pages/blog/Soc2AiCompliance.jsx';
import PromptInjection   from './pages/blog/PromptInjection.jsx';
import CisoVendorChecklist from './pages/blog/CisoVendorChecklist.jsx';
import EuActVsUsEo       from './pages/blog/EuActVsUsEo.jsx';
import AIGovernanceInfrastructure  from './pages/blog/AIGovernanceInfrastructure.jsx';
import IntentBasedAIControlPlane   from './pages/blog/IntentBasedAIControlPlane.jsx';
import EuAiActChecklist            from './pages/blog/EuAiActChecklist.jsx';
import DpdpaCompliance             from './pages/blog/DpdpaCompliance.jsx';
import AiGovernanceFintech         from './pages/blog/AiGovernanceFintech.jsx';
import RbacLlmApi                  from './pages/blog/RbacLlmApi.jsx';
import { ProjectProvider }  from './context/ProjectContext';
import { BrandingProvider } from './context/BrandingContext';
import { CreditProvider }   from './context/CreditContext';
import App          from './App';
import LandingPage  from './pages/LandingPage';
import DocsPage     from './pages/DocsPage';
import SecurityPage  from './pages/SecurityPage';
import DemoPage     from './pages/DemoPage';
import Onboarding   from './pages/Onboarding';
import { getMe, ensureUser } from './utils/api';
import { oidcConfig, createKeycloakShim, debugToken } from './auth/zitadel';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, err) => {
        const status = err?.response?.status;
        if (status >= 400 && status < 500) return false;
        return count < 2;
      },
    },
  },
});

function FullScreenSpinner() {
  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f8fafc',
    }}>
      <div style={{
        width: 32, height: 32,
        border: '2px solid rgba(37,99,235,0.3)',
        borderTopColor: '#2563eb',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function AppWrapper() {
  const auth = useAuth();

  const [provisioned,     setProvisioned]     = useState(false);
  const [needsOnboard,    setNeedsOnboard]    = useState(false);
  const [refreshingToken, setRefreshingToken] = useState(false);

  // FIX 1: was createKeycloakShim(auth.user, auth) — wrong 2-param signature.
  // Updated shim takes only `auth` and reads auth.user live via getter.
  //
  // FIX 5: was [auth.user, auth.isAuthenticated] — auth.user is an object
  // with a new reference on every render, causing the shim to rebuild
  // constantly. Keying on access_token string means it only rebuilds
  // when the actual token changes (login, refresh, logout).
  const keycloak = useMemo(
    () => createKeycloakShim(auth),
    [auth.user?.access_token, auth.isAuthenticated]
  );

  // ── Provision user on login ────────────────────────────────
  // Calls getMe to check if the user has completed onboarding.
  // Runs whenever the access token changes (covers initial login
  // and post-refresh re-checks).
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.user?.access_token) return;

    debugToken(auth.user.access_token);

    // ensureUser BEFORE getMe — the order is load-bearing.
    //
    // Zitadel omits `email`/`name` from the ACCESS token, so the backend cannot read
    // them (jwt.getClaim("email") is null). getMe → provisionUser would create the
    // user row with a null email and a name derived from the subject id ("36813433"),
    // and because that junk value is NOT blank, enrichUserProfile's isBlank() backfill
    // guard can never repair it afterwards. The row is poisoned permanently.
    //
    // /ensure exists to take the profile from the request body instead. The browser has
    // it (loadUserInfo: true → userinfo → tokenParsed), which is the same source
    // createCheckout already uses for Stripe. It was written and never called.
    //
    // Failure here is non-fatal: getMe still runs, the user still gets in — they just
    // land without a resolved profile, which is the status quo, not a regression.
    ensureUser(keycloak)
      .catch(err => console.warn('[Auth] ensureUser failed — profile may be incomplete:', err?.message))
      .then(() => getMe(keycloak))
      .then(meData => {
        const onboarded = meData?.onboarded === true;
        setNeedsOnboard(!onboarded);
        setProvisioned(true);
      })
      .catch(() => {
        // getMe failed — don't block the user, treat as not onboarded
        // so they can complete the onboarding flow
        setNeedsOnboard(true);
        setProvisioned(true);
      });

  }, [auth.isAuthenticated, auth.user?.access_token]);

  // ── Called by Onboarding after POST /setup-tenant succeeds ─
  //
  // setupTenant() has already written the tenant, project, team and an OWNER
  // grant in role_grant. Nothing further is required to make the user
  // authorised, so this simply marks onboarding done and renders the app.
  const onOnboardingComplete = useCallback(async () => {
    // No token refresh. The existing token is already sufficient.
    //
    // This used to do removeUser() → signinSilent() → fall back to a full
    // redirect login, because tenant roles lived in the JWT: onboarding assigned
    // tenant_user in Zitadel, and the role was invisible until a new token was
    // issued. That is why finishing signup bounced the user through an
    // authentication round trip.
    //
    // Roles now resolve from role_grant on every request (see
    // ZitadelRoleAugmentor), so the OWNER grant written during onboarding is live
    // the moment the transaction commits. The token carries identity; this system
    // decides authority. Nothing about the token needs to change.
    //
    // Removing this also removes a real failure mode: signinSilent depends on
    // silent_redirect_uri being registered in the Zitadel console, and when it was
    // not, the fallback threw the user into a fresh login immediately after they
    // had just signed up.
    setNeedsOnboard(false);
  }, []);

  // ── Clear the legacy post-onboard redirect marker ──────────
  // Onboarding no longer redirects, but a session that started before this change
  // may still carry the flag. Removed rather than acted on: leaving it would make
  // a future reader think the redirect path is still live.
  useEffect(() => {
    sessionStorage.removeItem(`dm_${import.meta.env.VITE_APP_ENV ?? 'dev'}_post_onboard_redirect`);
  }, []);

  // ── Render ─────────────────────────────────────────────────

  // Public routes — checked FIRST, before any auth state, so they work
  // regardless of whether the user is logged in or not.
  const { pathname } = useLocation();

  // Security — public route
  if (pathname === '/security') {
    return (
      <Routes>
        <Route path="/security" element={<SecurityPage />} />
      </Routes>
    );
  }

  // Demo — public route.
  // MUST be here, above the auth gate. This is the URL you paste into outreach
  // (decimeshi.com/demo). If it lived in App.jsx it would sit behind
  // `if (!auth.isAuthenticated) return <LandingPage />` — a CIO clicking your link
  // would hit a login wall, which is the fastest way to waste a warm click.
  if (pathname === '/demo') {
    return (
      <Routes>
        <Route path="/demo" element={<DemoPage />} />
      </Routes>
    );
  }

  // Docs — public route
  if (pathname === '/docs') {
    return (
      <Routes>
        <Route path="/docs" element={<DocsPage />} />
      </Routes>
    );
  }

  // Blog routes — public
  if (pathname === '/blog' || pathname.startsWith('/blog/')) {
    return (
      <Routes>
        <Route path="/blog"                                                element={<BlogIndex />} />
        <Route path="/blog/how-to-audit-openai-api-calls"                  element={<AuditOpenAiCalls />} />
        <Route path="/blog/shadow-ai-enterprise-risk-ciso-guide"           element={<ShadowAiRisk />} />
        <Route path="/blog/llm-cost-control-enterprise-budgets"            element={<LlmCostControl />} />
        <Route path="/blog/soc2-ai-compliance-what-auditors-ask"           element={<Soc2AiCompliance />} />
        <Route path="/blog/prompt-injection-detection-llm"                 element={<PromptInjection />} />
        <Route path="/blog/ciso-ai-vendor-security-assessment-checklist"   element={<CisoVendorChecklist />} />
        <Route path="/blog/eu-ai-act-vs-us-ai-executive-order-comparison"  element={<EuActVsUsEo />} />
        <Route path="/blog/ai-governance-enterprise-infrastructure"        element={<AIGovernanceInfrastructure />} />
        <Route path="/blog/intent-based-ai-control-plane"                  element={<IntentBasedAIControlPlane />} />
        <Route path="/blog/eu-ai-act-compliance-checklist-llm"             element={<EuAiActChecklist />} />
        <Route path="/blog/dpdpa-2023-ai-compliance-checklist"             element={<DpdpaCompliance />} />
        <Route path="/blog/ai-governance-fintech-rbi-sebi-guidelines"      element={<AiGovernanceFintech />} />
        <Route path="/blog/rbac-llm-api-access-control"                    element={<RbacLlmApi />} />
      </Routes>
    );
  }

  // ── Auth-gated routes below this line ──────────────────────
  if (auth.isLoading)        return <FullScreenSpinner />;
  if (auth.error)            return <LandingPage />;
  if (!auth.isAuthenticated) return <LandingPage />;
  if (!provisioned)          return <FullScreenSpinner />;
  if (refreshingToken)       return <FullScreenSpinner />;

  if (needsOnboard) return (
    <Onboarding
      keycloak={keycloak}
      onComplete={onOnboardingComplete}
    />
  );

  return (
    <BrandingProvider keycloak={keycloak}>
      <ProjectProvider keycloak={keycloak}>
        <CreditProvider keycloak={keycloak}>
          <App keycloak={keycloak} />
        </CreditProvider>
      </ProjectProvider>
    </BrandingProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider
    {...oidcConfig}
    onSigninCallback={() => {
      // react-oidc-context has already exchanged the PKCE code internally
      // before calling this. Just clean the URL — AppWrapper's useEffect
      // will handle getMe, role detection, and onboarding routing.
      // The old window.location.href = '/' was throwing away the token
      // by triggering a full page reload before it was stored.
      window.history.replaceState({}, '', '/');
    }}
    onRemoveUser={() => {
      console.warn('[OIDC] Session removed — user stays on current page');
    }}
  >
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </QueryClientProvider>
  </AuthProvider>
);
