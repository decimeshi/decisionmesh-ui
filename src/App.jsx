import { Component, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './layout/Sidebar';
import TopBar from './layout/TopBar';
import { Spinner } from './components/shared';
import LowCreditBanner from './components/shared/LowCreditBanner';
import FeedbackWidget from './components/FeedbackWidget';
import { RequireCapability } from './context/CapabilityContext';
import AIGovernanceInfrastructure from "./pages/blog/AIGovernanceInfrastructure.jsx";
import IntentBasedAIControlPlane from "./pages/blog/IntentBasedAIControlPlane.jsx";
import SecurityPage from "./pages/SecurityPage.jsx";
import BlogIndex from "./pages/blog/BlogIndex.jsx";
import AuditOpenAiCalls from "./pages/blog/AuditOpenAiCalls.jsx";
import ShadowAiRisk from "./pages/blog/ShadowAiRisk.jsx";
import LlmCostControl from "./pages/blog/LlmCostControl.jsx";
import Soc2AiCompliance from "./pages/blog/Soc2AiCompliance.jsx";
import PromptInjection from "./pages/blog/PromptInjection.jsx";
import CisoVendorChecklist from "./pages/blog/CisoVendorChecklist.jsx";
import EuActVsUsEo from "./pages/blog/EuActVsUsEo.jsx";
import DpdpaCompliance from "./pages/blog/DpdpaCompliance.jsx";
import AiGovernanceFintech from "./pages/blog/AiGovernanceFintech.jsx";
import RbacLlmApi from "./pages/blog/RbacLlmApi.jsx";


const Dashboard        = lazy(() => import('./pages/Dashboard'));
const Playground       = lazy(() => import('./pages/Playground'));
const IntentsTable     = lazy(() => import('./pages/IntentsTable'));
const IntentDetail     = lazy(() => import('./pages/IntentDetail'));
const ExecutionMonitor = lazy(() => import('./pages/ExecutionMonitor'));
const Adapters         = lazy(() => import('./pages/Adapters'));
const PolicyBuilder    = lazy(() => import('./pages/PolicyBuilder'));
const CostAnalytics    = lazy(() => import('./pages/CostAnalytics'));
const AiSpend           = lazy(() => import('./pages/AiSpend'));
const DriftDashboard   = lazy(() => import('./pages/DriftDashboard'));
const ApiKeys          = lazy(() => import('./pages/ApiKeys'));
const AuditLog         = lazy(() => import('./pages/AuditLog'));
const InviteUsers      = lazy(() => import('./pages/InviteUsers'));
const Projects         = lazy(() => import('./pages/Projects'));
const ProjectSettings  = lazy(() => import('./pages/ProjectSettings'));
const UserProfile      = lazy(() => import('./pages/UserProfile'));
const OrgBranding      = lazy(() => import('./pages/OrgBranding'));
const Billing          = lazy(() => import('./pages/Billing'));
const CreditLedger     = lazy(() => import('./pages/CreditLedger'));
const TokenDebugPage   = lazy(() => import('./pages/TokenDebugPage'));
const FintechIntents   = lazy(() => import('./pages/FintechIntents'));
const ReviewQueue      = lazy(() => import('./pages/ReviewQueue'));

// ── sys_admin only pages ──────────────────────────────────────────────────────
const AdminPaymentTesting = lazy(() => import('./pages/AdminPaymentTesting'));
const AdminFeedback       = lazy(() => import('./pages/AdminFeedback'));
const AdminUsers          = lazy(() => import('./pages/AdminUsers'));
const AdminTenants        = lazy(() => import('./pages/AdminTenants'));
const AdminCredits        = lazy(() => import('./pages/AdminCredits'));
const AdminWebhooks       = lazy(() => import('./pages/AdminWebhooks'));
const AdminHealth         = lazy(() => import('./pages/AdminHealth'));
const RetentionDryRun     = lazy(() => import('./pages/RetentionDryRun'));
const PlatformReport      = lazy(() => import('./pages/PlatformReport'));
const KillSwitchAdmin     = lazy(() => import('./pages/KillSwitchAdmin'));
const DocsPage            = lazy(() => import('./pages/DocsPage'));

// ── Error boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center px-6">
          <div className="p-3 rounded-full bg-red-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Something went wrong</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              {this.state.error?.message ?? 'An unexpected error occurred on this page.'}
            </p>
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            className="text-xs text-blue-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Page loading fallback ─────────────────────────────────────────────────────
function PageFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner className="w-8 h-8" />
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App({ keycloak }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hidden,    setHidden]    = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className={`transition-all duration-200 shrink-0 overflow-hidden ${hidden ? 'w-0' : ''}`}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} onHide={() => setHidden(true)} keycloak={keycloak} />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <TopBar keycloak={keycloak} sidebarHidden={hidden} onToggleSidebar={() => setHidden(h => !h)} />
        <LowCreditBanner />

        <main className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* ── App routes ─────────────────────────────────────────── */}
                <Route path="/"                       element={<Dashboard        keycloak={keycloak} />} />
                <Route path="/playground"             element={<Playground       keycloak={keycloak} />} />
                <Route path="/intents"                element={<IntentsTable     keycloak={keycloak} />} />
                <Route path="/intents/:id"            element={<IntentDetail     keycloak={keycloak} />} />
                <Route path="/executions"             element={<ExecutionMonitor keycloak={keycloak} />} />
                <Route path="/adapters"               element={<Adapters         keycloak={keycloak} />} />
                <Route path="/policies"               element={<PolicyBuilder    keycloak={keycloak} />} />
                <Route path="/analytics/cost"         element={<CostAnalytics    keycloak={keycloak} />} />
                {/* CXO AI spend — gated on canViewSpend, resolved server-side by
                    AuthCapabilitiesResource from the same checks SpendResource enforces
                    (@RolesAllowed(sys_admin,tenant_admin) + Permission.REPORT_READ). NOT a
                    JWT role decode — tenant_admin isn't in the token, see CapabilityContext.
                    Decision support (spend/ROI), not the compliance halt — see AiSpend.jsx
                    for why the kill switch lives at /admin/kill-switches. */}
                <Route path="/spend" element={
                  <RequireCapability capability="canViewSpend">
                    <AiSpend keycloak={keycloak} />
                  </RequireCapability>
                } />
                <Route path="/analytics/drift"        element={<DriftDashboard   keycloak={keycloak} />} />
                <Route path="/api-keys"               element={<ApiKeys          keycloak={keycloak} />} />
                <Route path="/audit"                  element={<AuditLog         keycloak={keycloak} />} />
                <Route path="/invite"                 element={<InviteUsers      keycloak={keycloak} />} />
                <Route path="/projects"               element={<Projects         keycloak={keycloak} />} />
                <Route path="/projects/:id/settings"  element={<ProjectSettings  keycloak={keycloak} />} />
                <Route path="/profile"                element={<UserProfile      keycloak={keycloak} />} />
                <Route path="/org/branding"           element={<OrgBranding      keycloak={keycloak} />} />
                <Route path="/billing"                element={<Billing          keycloak={keycloak} />} />
                <Route path="/credits"                element={<CreditLedger     keycloak={keycloak} />} />
                <Route path="/debug/token"            element={<TokenDebugPage   keycloak={keycloak} />} />
                <Route path="/intent-library"         element={<FintechIntents   keycloak={keycloak} />} />
                <Route path="/review-queue"           element={<ReviewQueue      keycloak={keycloak} />} />

                <Route path="/blog/intent-based-ai-control-plane" element={<IntentBasedAIControlPlane />}/>
                <Route path="/blog/ai-governance-enterprise-infrastructure" element={<AIGovernanceInfrastructure />}/>
                <Route path="/blog" element={<BlogIndex />}/>
                <Route path="/blog/soc2-ai-compliance-what-auditors-ask" element={<Soc2AiCompliance />}/>
                <Route path="/blog/shadow-ai-enterprise-risk-ciso-guide" element={<ShadowAiRisk />}/>
                <Route path="/blog/how-to-audit-openai-api-calls" element={<AuditOpenAiCalls />}/>
                <Route path="/blog/llm-cost-control-enterprise-budgets" element={<LlmCostControl />}/>
                <Route path="/blog/prompt-injection-detection-llm" element={<PromptInjection />}/>
                <Route path="/blog/ciso-ai-vendor-security-assessment-checklist" element={<CisoVendorChecklist />}/>
                <Route path="/blog/eu-ai-act-vs-us-ai-executive-order-comparison" element={<EuActVsUsEo />}/>
                <Route path="/blog/dpdpa-2023-ai-compliance-checklist"            element={<DpdpaCompliance />}/>
                <Route path="/blog/ai-governance-fintech-rbi-sebi-guidelines"     element={<AiGovernanceFintech />}/>
                <Route path="/blog/rbac-llm-api-access-control"                   element={<RbacLlmApi />}/>

                {/* ── sys_admin only routes ──────────────────────────────────
                    Gated on isPlatformOperator (RequireCapability), NOT the old
                    SysAdminRoute JWT decode. sys_admin can now come from either
                    the Zitadel claim OR the platform_admin bootstrap table (see
                    ZitadelRoleAugmentor / V2__platform_admin.sql) — a God account
                    seeded that second way carries sys_admin in the server-side
                    SecurityIdentity but NOT in the raw JWT the browser holds, so
                    a client-side decode would wrongly lock them out of every page
                    below even though every one of these backend endpoints would
                    accept them. isPlatformOperator is computed server-side by
                    AuthCapabilitiesResource from the same identity.hasRole() call
                    the backend resources use, so it can never disagree with them. */}
                <Route path="/admin/payments" element={
                  <RequireCapability capability="isPlatformOperator">
                    <AdminPaymentTesting keycloak={keycloak} />
                  </RequireCapability>
                } />
                <Route path="/admin/feedback" element={
                  <RequireCapability capability="isPlatformOperator">
                    <AdminFeedback keycloak={keycloak} />
                  </RequireCapability>
                } />
                <Route path="/admin/users" element={
                  <RequireCapability capability="isPlatformOperator">
                    <AdminUsers keycloak={keycloak} />
                  </RequireCapability>
                } />
                <Route path="/admin/tenants" element={
                  <RequireCapability capability="isPlatformOperator">
                    <AdminTenants keycloak={keycloak} />
                  </RequireCapability>
                } />
                <Route path="/admin/credits" element={
                  <RequireCapability capability="isPlatformOperator">
                    <AdminCredits keycloak={keycloak} />
                  </RequireCapability>
                } />
                <Route path="/admin/webhooks" element={
                  <RequireCapability capability="isPlatformOperator">
                    <AdminWebhooks keycloak={keycloak} />
                  </RequireCapability>
                } />
                <Route path="/admin/health" element={
                  <RequireCapability capability="isPlatformOperator">
                    <AdminHealth keycloak={keycloak} />
                  </RequireCapability>
                } />
                <Route path="/admin/retention" element={
                  <RequireCapability capability="isPlatformOperator">
                    <RetentionDryRun keycloak={keycloak} />
                  </RequireCapability>
                } />
                <Route path="/admin/reports/platform" element={
                  <RequireCapability capability="isPlatformOperator">
                    <PlatformReport keycloak={keycloak} />
                  </RequireCapability>
                } />

                {/* Kill switches — the emergency stop console.
                    Without this route, /admin/kill-switches fell through to the "*"
                    catch-all below and silently redirected to the dashboard, which is
                    why "Manage kill switches" appeared to do nothing.

                    Gated on canManageKillSwitches/canLiftKillSwitches rather than
                    SysAdminRoute (sys_admin only): KillSwitchResource itself authorises
                    both sys_admin AND tenant_admin (isPlatformOperator() OR isTenantAdmin()
                    in KillSwitchResource.assertScopeAllowed) — the old sys_admin-only gate
                    here was stricter than the backend and silently locked out tenant admins
                    the API would have accepted. isPlatformOperator is no longer a hardcoded
                    prop either; KillSwitchAdmin reads it from useCapabilities(). */}
                <Route path="/admin/kill-switches" element={
                  <RequireCapability capability={['canManageKillSwitches', 'canLiftKillSwitches']}>
                    <KillSwitchAdmin keycloak={keycloak} />
                  </RequireCapability>
                } />

                <Route path="/docs"     element={<DocsPage />} />
                <Route path="/security" element={<SecurityPage />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>

        {/*
          FeedbackWidget — global floating button, fixed bottom-right.
          Placed here (outside <main>) so it:
            - is not clipped by main's overflow-y-auto scroll container
            - stays fixed on screen regardless of page scroll
            - receives keycloak directly without threading through Page.jsx
        */}
        <FeedbackWidget keycloak={keycloak} />
      </div>
    </div>
  );
}
