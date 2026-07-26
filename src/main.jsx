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
  // Flow:
  //   1. setupTenant() assigned the role in Zitadel
  //   2. We must get a NEW token — the current one has no role
  //   3. signinSilent() exchanges a fresh PKCE code via hidden
  //      iframe — Zitadel returns a token with the role included
  //   4. We mark onboarding done and let the useEffect above
  //      re-run with the new access_token to re-confirm via getMe
  //
  // FIX 2: was `await auth.signinSilent()` with return value ignored,
  // then `auth.user` read immediately. auth.user is React state that
  // hasn't re-rendered yet — it's still the OLD token. signinSilent()
  // returns the new user directly; capture and use that instead.
  //
  // FIX 3+4: was `createKeycloakShim(newUser, auth)` then `getMe(freshKeycloak)`.
  // The freshKeycloak was built from stale auth.user, so getMe was called
  // with the old no-role token and returned onboarded=false — causing the
  // screen to stay stuck on onboarding forever.
  //
  // Fix: don't call getMe again here. setupTenant succeeded — onboarding
  // is definitively complete. Set needsOnboard(false) directly.
  // The useEffect above will re-run automatically when auth.user?.access_token
  // changes after signinSilent, re-confirming via getMe in the background.
  const onOnboardingComplete = useCallback(async () => {
    try {
      setRefreshingToken(true);
      console.log('[Auth] Onboarding complete — fetching fresh token with role...');

      // Step 1: evict stale no-role token from sessionStorage
      await auth.removeUser();

      // Step 2: silently re-authenticate — Zitadel browser session is
      // still active so no login UI is shown. Returns new user directly.
      const newUser = await auth.signinSilent();

      if (newUser?.access_token) {
        debugToken(newUser.access_token);
      } else {
        // signinSilent returned null — likely silent_redirect_uri is not
        // registered in Zitadel Console or the page doesn't exist yet.
        // Fallback below will handle this via redirect.
        throw new Error('signinSilent returned no user — check silent_redirect_uri config');
      }

      // Onboarding is done — setupTenant succeeded and we have a fresh token.
      // Don't call getMe again here: it would use auth.user (React state)
      // which hasn't updated yet, returning the stale token and onboarded=false.
      // The useEffect will re-run once auth.user?.access_token updates and
      // will call getMe with the correct fresh token at that point.
      setNeedsOnboard(false);

    } catch (err) {
      console.error('[Auth] Token refresh failed:', err.message);

      // Fallback: full redirect login — Zitadel always issues a fresh
      // token with roles on a new redirect flow. prompt=login in
      // extraQueryParams forces a new session even if one exists.
      console.warn('[Auth] Falling back to redirect login...');
      sessionStorage.setItem(`dm_${import.meta.env.VITE_APP_ENV ?? 'dev'}_post_onboard_redirect`, 'true');
      await auth.signinRedirect({ extraQueryParams: { prompt: 'login' } });
    } finally {
      setRefreshingToken(false);
    }
  }, [auth]);

  // ── Handle post-onboard redirect fallback ──────────────────
  // If forceTokenRefresh fell back to a full redirect, the app
  // reloads after login. Restore the correct state here.
  useEffect(() => {
    if (!auth.isAuthenticated) return;
    const wasRedirected = sessionStorage.getItem(`dm_${import.meta.env.VITE_APP_ENV ?? 'dev'}_post_onboard_redirect`);
    if (wasRedirected) {
      sessionStorage.removeItem(`dm_${import.meta.env.VITE_APP_ENV ?? 'dev'}_post_onboard_redirect`);
      // getMe will run via the main useEffect above — no extra action needed
      console.log('[Auth] Returned from post-onboard redirect — getMe will re-check onboarded state');
    }
  }, [auth.isAuthenticated]);

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
