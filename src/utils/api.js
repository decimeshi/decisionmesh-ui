import { v4 as uuidv4 } from 'uuid';


// Single source of truth for the API base URL — reads from the Vite env var
// set in .env.development / .env.production so the app works outside localhost.
// Typed error so callers can distinguish auth failures (401/403) from
// other errors and show appropriate UI without catching everything blindly.
export class ApiError extends Error {
  constructor(status, message, code = null) {
    super(message);
    this.name      = 'ApiError';
    this.status    = status;
    this.isAuth    = status === 401 || status === 403;
    this.code      = code;                          // machine-readable, e.g. KILL_SWITCH_ACTIVE
    this.retryable = code === 'KILL_SWITCH_ACTIVE'; // a halt is transient, not a user error
  }
}

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

async function refreshToken(keycloak) {
  if (!keycloak?.authenticated) return false;
  try {
    await keycloak.updateToken(30);
    return true;
  } catch {
    // updateToken failed (session expired server-side, network issue, etc).
    // Return false so the caller can decide — do NOT call keycloak.login() here.
    // Calling login() when the backend rejects for non-expiry reasons
    // (email_verified: false, missing role/scope) causes an infinite redirect loop.
    return false;
  }
}

// ── Project scope ─────────────────────────────────────────────────────────────
// The selected project travels as X-Project-Id on every call. The backend
// validates it against the caller's tenant and derives the owning team from
// projects.team_id, so one header populates both audit dimensions.
//
// Module-level rather than a React context so plain callers of request() get it
// too — an audit dimension that only some code paths set is worse than none,
// because the gaps are invisible in the resulting report.
let currentProjectId = null;

// Same key ProjectContext already uses — one stored fact, not two that can drift.
const PROJECT_KEY = 'dm_active_project';

// ProjectContext falls back to a placeholder project ('proj-default') when the
// API has not answered yet. Sending that as X-Project-Id would fail the backend's
// uuid parse and log a malformed-header warning on every request, so only real
// ids travel. Absent header = backend uses the tenant's default project.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Call from ProjectContext whenever the active project changes. */
export function setCurrentProject(projectId) {
  currentProjectId = UUID_RE.test(projectId ?? '') ? projectId : null;
  try {
    if (currentProjectId) localStorage.setItem(PROJECT_KEY, currentProjectId);
  } catch { /* private mode — in-memory only, scope resets on reload */ }
}

export function getCurrentProject() {
  if (currentProjectId) return currentProjectId;
  try {
    const saved = localStorage.getItem(PROJECT_KEY);
    if (UUID_RE.test(saved ?? '')) currentProjectId = saved;
  } catch { /* ignore */ }
  return currentProjectId;
}

// ── Tenant scope ───────────────────────────────────────────────────────────────
// A user can belong to more than one tenant (see InvitationService.
// acceptInvitation on the backend). The selected one travels as X-Tenant-Id on
// every call, same pattern as X-Project-Id above — module-level so plain
// callers of request() get it too, validated server-side against `membership`
// before TenantContextFilter honours it.
let currentTenantId = null;

const TENANT_KEY = 'dm_active_tenant';

/** Call from ChooseOrganization (or AcceptInvite, on landing directly in a new one). */
export function setActiveTenant(tenantId) {
  currentTenantId = UUID_RE.test(tenantId ?? '') ? tenantId : null;
  try {
    if (currentTenantId) localStorage.setItem(TENANT_KEY, currentTenantId);
  } catch { /* private mode — in-memory only, scope resets on reload */ }
}

export function getActiveTenant() {
  if (currentTenantId) return currentTenantId;
  try {
    const saved = localStorage.getItem(TENANT_KEY);
    if (UUID_RE.test(saved ?? '')) currentTenantId = saved;
  } catch { /* ignore */ }
  return currentTenantId;
}

/** Call on logout — a stale tenant id must not leak into the next login. */
export function clearActiveTenant() {
  currentTenantId = null;
  try { localStorage.removeItem(TENANT_KEY); } catch { /* ignore */ }
}

// Exported so contexts and pages can use it directly instead of
// duplicating their own fetch + auth logic.
export async function request(keycloak, path, options = {}) {
  await refreshToken(keycloak);

  // Guard on the token string itself, not just authenticated.
  // After a failed refresh keycloak.token can be undefined even when
  // authenticated is still true — sending "Bearer undefined" produces a 401.
  if (!keycloak?.authenticated || !keycloak?.token) return null;

  // Normalize caller-supplied headers to a plain object regardless of whether
  // they passed a Headers instance, a plain object, or nothing at all.
  // Then place Authorization LAST so it can never be overwritten by the caller.
  const callerHeaders = options.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : (options.headers ?? {});

  // Omitted entirely when no project is selected, rather than sent empty: the
  // backend logs a malformed-header warning on a blank value, and falls back to
  // the tenant's default project when the header is absent.
  const projectId = getCurrentProject();
  const tenantId  = getActiveTenant();
  const scopeHeaders = {
    ...(projectId ? { 'X-Project-Id': projectId } : {}),
    ...(tenantId  ? { 'X-Tenant-Id':  tenantId  } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...scopeHeaders,          // before callerHeaders — an explicit call can override
      ...callerHeaders,
      Authorization: `Bearer ${keycloak.token}`, // always last — never overridden
    },
  });
  if (res.status === 401) {
    throw new ApiError(401, `Unauthorized — ${path}. Check Token Debugger (/debug/token) for details.`);
  }
  // Kill switch — the platform is deliberately halted (not a crash, not a user error).
  // Surfaced as a typed error carrying a stable `code`, so callers branch on e.code
  // rather than sniffing message text. Handled here in request() so EVERY endpoint
  // gets it, not just submitIntent.
  if (res.status === 503) {
    const raw = await res.text();
    let body = {};
    try { body = JSON.parse(raw); } catch { /* not JSON — fall through */ }
    if (body.error === 'KILL_SWITCH_ACTIVE') {
      throw new ApiError(503, body.message ?? 'AI processing is paused.', 'KILL_SWITCH_ACTIVE');
    }
    throw new ApiError(503, raw);
  }
  if (res.status === 204) return null;
  if (!res.ok) throw new ApiError(res.status, await res.text());
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}
// ── Intents ───────────────────────────────────────────────────────────────────

export async function submitIntent(keycloak, intent) {
  return request(keycloak, '/intents', {
    method: 'POST',
    headers: { 'Idempotency-Key': uuidv4() },
    body: JSON.stringify(intent),
  });
}

export async function getIntent(keycloak, id) {
  return request(keycloak, `/intents/${id}`);
}

/**
 * Read-only "what would happen if I submitted this now" preview — backs the
 * Playground's Execution intelligence panel (adapter, estimated cost/latency,
 * expected output). Same request body as submitIntent, no Idempotency-Key
 * since nothing is created.
 */
export async function previewIntent(keycloak, intent) {
  return request(keycloak, '/intents/preview', {
    method: 'POST',
    body: JSON.stringify(intent),
  });
}

/**
 * POST /api/intents/attachments/extract (multipart) — turns an uploaded
 * document into plain text for objective.context. Deliberately NOT built on
 * request(): that helper always sends Content-Type: application/json and
 * JSON.stringifies the body, which is wrong for a multipart upload — the
 * browser must set its own Content-Type with the multipart boundary.
 *
 * Returns { filename, contentType, extractedText, truncated }.
 */
export async function extractAttachment(keycloak, file) {
  await refreshToken(keycloak);
  if (!keycloak?.authenticated || !keycloak?.token) return null;

  const projectId = getCurrentProject();
  const tenantId  = getActiveTenant();
  const scopeHeaders = {
    ...(projectId ? { 'X-Project-Id': projectId } : {}),
    ...(tenantId  ? { 'X-Tenant-Id':  tenantId  } : {}),
  };

  const form = new FormData();
  form.append('file', file, file.name);

  const res = await fetch(`${API_BASE}/intents/attachments/extract`, {
    method: 'POST',
    headers: {
      ...scopeHeaders,
      Authorization: `Bearer ${keycloak.token}`,
      // No Content-Type here — the browser sets multipart/form-data with the
      // boundary itself. Setting it manually breaks multipart parsing.
    },
    body: form,
  });
  if (res.status === 401) {
    throw new ApiError(401, `Unauthorized — /intents/attachments/extract. Check Token Debugger (/debug/token) for details.`);
  }
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}

export async function listIntents(keycloak, params = {}) {
  const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
  ).toString();
  return request(keycloak, `/intents${qs ? `?${qs}` : ''}`);
}

export async function getIntentEvents(keycloak, id) {
  return request(keycloak, `/intents/${id}/events`);
}

/**
 * "Can I submit right now?" — cheap enough to poll while the kill switch is on.
 *
 * Polling by re-submitting the intent would burn an idempotency key, a rate-limit
 * token and an audit row on every attempt — flooding the pipeline during exactly the
 * incident it was paused for. This reads the server's Redis-cached kill-switch state
 * instead.
 */
export async function getIntentAvailability(keycloak) {
  return request(keycloak, '/intents/availability');
}

/**
 * POST /api/onboard/ensure
 *
 * Zitadel does NOT put `email` or `name` in the ACCESS token — only in the ID token /
 * userinfo. Quarkus OIDC reads the access token, so server-side jwt.getClaim("email")
 * is null. That is why users.email was empty and users.name held a truncated Zitadel
 * sub ("36813433"): OnboardingService fell back to sub.substring(0,8).
 *
 * The backend's /ensure endpoint was built precisely to take these from the request
 * body instead — and was never called. The browser HAS them (loadUserInfo: true maps
 * userinfo onto tokenParsed), exactly as createCheckout already relies on for Stripe.
 *
 * MUST be called BEFORE getMe(): getMe → provisionUser creates the row, and once
 * `name` holds a non-blank junk value the isBlank() backfill guard in
 * enrichUserProfile can never repair it.
 */
export async function ensureUser(keycloak) {
  return request(keycloak, '/onboard/ensure', {
    method: 'POST',
    body: JSON.stringify({
      email: keycloak?.tokenParsed?.email ?? null,
      name:  keycloak?.tokenParsed?.name  ?? null,
    }),
  });
}

/**
 * GET /api/intents/auth/me
 *
 * Returns the  resolved by the server's IdentityAugmentor.
 * Useful for surfacing tenantId, userId, and roles in the UI without decoding
 * the JWT client-side.  Matches IntentResource.me().
 */
export async function getMe(keycloak) {
  return request(keycloak, '/onboard/me');
}

/**
 * GET /api/onboard/my-organizations
 *
 * Every tenant/organization the caller has a membership row in. A user with
 * exactly one is the common case; more than one means ChooseOrganization
 * should show before the main app shell mounts.
 */
export async function getMyOrganizations(keycloak) {
  return request(keycloak, '/onboard/my-organizations');
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardMetrics(keycloak) {
  return request(keycloak, '/dashboard/metrics');
}

// ── Organisation & projects ───────────────────────────────────────────────────

export async function getOrg(keycloak) {
  return request(keycloak, '/org');
}

export async function listProjects(keycloak) {
  return request(keycloak, '/projects');
}

export async function createProject(keycloak, { name, description, environment }) {
  return request(keycloak, '/projects', {
    method: 'POST',
    body: JSON.stringify({ name, description, environment }),
  });
}

// Named distinctly from ProjectContext's updateProject (which only patches
// local cached state) — this is the actual PATCH /api/projects/{id} call.
export async function updateProjectDetails(keycloak, id, updates) {
  return request(keycloak, `/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function getOrgBranding(keycloak) {
  return request(keycloak, '/org/branding');
}

// ── Members & invitations (tenant-wide — MemberResource/InvitationResource
// have no project scoping; see ProjectSettings.jsx's MembersTab comment) ───────

export async function listMembers(keycloak) {
  return request(keycloak, '/members');
}

// projectId, when set, scopes the invite to that project (RoleGrantEntity.forProject
// once accepted) rather than the whole tenant — see acceptInvitation below.
export async function inviteMember(keycloak, email, role, projectId = null) {
  return request(keycloak, '/invitations', {
    method: 'POST',
    body: JSON.stringify({ email, role, projectId }),
  });
}

// Unauthenticated on purpose — shown before the invitee has logged in, when
// they've just clicked the emailed link. Does not go through request()/keycloak.
export async function previewInvitation(token) {
  const res = await fetch(`${API_BASE}/invitations/preview/${token}`);
  const text = await res.text();
  let body = {};
  try { body = JSON.parse(text); } catch { /* not JSON */ }
  if (!res.ok) throw new ApiError(res.status, body.error ?? text);
  return body;
}

export async function acceptInvitation(keycloak, token) {
  return request(keycloak, `/invitations/accept/${token}`, { method: 'POST' });
}

export async function updateMemberRole(keycloak, userId, role) {
  return request(keycloak, `/members/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function removeMember(keycloak, userId) {
  return request(keycloak, `/members/${userId}`, { method: 'DELETE' });
}

// ── Credits ───────────────────────────────────────────────────────────────────

export async function getCreditBalance(keycloak) {
  return request(keycloak, '/credits/balance');
}

// ── Adapters ──────────────────────────────────────────────────────────────────

export async function listAdapters(keycloak) {
  return request(keycloak, '/adapters');
}

export async function createAdapter(keycloak, body) {
  return request(keycloak, '/adapters', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateAdapter(keycloak, id, body) {
  return request(keycloak, `/adapters/${id}`, { method: 'PUT', body: JSON.stringify(body) });
}

export async function toggleAdapter(keycloak, id, isActive) {
  return request(keycloak, `/adapters/${id}/status`, {
    method: 'PATCH', body: JSON.stringify({ isActive }),
  });
}

export async function getAdapterPerformance(keycloak, id) {
  return request(keycloak, `/adapters/${id}/performance`);
}

// ── Policies ──────────────────────────────────────────────────────────────────

export async function listPolicies(keycloak) {
  return request(keycloak, '/policies');
}

export async function savePolicy(keycloak, body) {
  const method = body.policyId ? 'PUT' : 'POST';
  const path   = body.policyId ? `/policies/${body.policyId}` : '/policies';
  return request(keycloak, path, { method, body: JSON.stringify(body) });
}

export async function deletePolicy(keycloak, id) {
  return request(keycloak, `/policies/${id}`, { method: 'DELETE' });
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getCostAnalytics(keycloak, params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(keycloak, `/analytics/cost${qs ? `?${qs}` : ''}`);
}

export async function getDriftData(keycloak) {
  return request(keycloak, '/analytics/drift');
}

// ── Executions ────────────────────────────────────────────────────────────────

export async function getExecutionsByIntent(keycloak, intentId) {
  return request(keycloak, `/intents/${intentId}/executions`);
}

export async function getPolicyEvaluations(keycloak, intentId) {
  return request(keycloak, `/intents/${intentId}/policy-evaluations`);
}

export async function listExecutions(keycloak, params = {}) {
  const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
  ).toString();
  return request(keycloak, `/executions${qs ? `?${qs}` : ''}`);
}

// ── API keys ──────────────────────────────────────────────────────────────────

export async function listApiKeys(keycloak) {
  return request(keycloak, '/api-keys');
}

export async function createApiKey(keycloak) {
  return request(keycloak, '/api-keys', { method: 'POST' });
}

export async function revokeApiKey(keycloak, id) {
  return request(keycloak, `/api-keys/${id}`, { method: 'DELETE' });
}

// ── Audit ─────────────────────────────────────────────────────────────────────

export async function listAudit(keycloak, params = {}) {
  // Built by append, not Object.fromEntries: the latter collapses an array into
  // "a,b" on a single key, whereas JAX-RS binds List<String> from a REPEATED key.
  // dataClass is multi-valued (?dataClass=X&dataClass=Y), so the collapsed form
  // would silently match nothing.
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === '') continue;
    if (Array.isArray(v)) v.forEach(x => x != null && x !== '' && sp.append(k, x));
    else sp.append(k, v);
  }
  const qs = sp.toString();
  return request(keycloak, `/audit${qs ? `?${qs}` : ''}`);
}

// ── Auth capabilities ─────────────────────────────────────────────────────────
// "Can I do X", computed server-side by AuthCapabilitiesResource from the same
// AccessControl/role checks the actual gated resources use — never decode the
// JWT client-side for this. tenant_admin in particular is NOT in the JWT by
// design (ZitadelRoleAugmentor resolves it from role_grant on every request),
// so there is no client-side substitute for asking the server.

export async function getCapabilities(keycloak) {
  return request(keycloak, '/auth/capabilities');
}

// ── Spend (CXO dashboard) ─────────────────────────────────────────────────────
// API_BASE ends in /api, SpendResource sits at @Path("/api/spend") with a
// /by-project sub-path — so the path here is '/spend/by-project'.

export async function getSpendByProject(keycloak, params = {}) {
  const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return request(keycloak, `/spend/by-project${qs ? `?${qs}` : ''}`);
}

// ── Kill switches (admin) ─────────────────────────────────────────────────────
// API_BASE already ends in /api, and KillSwitchResource sits at
// @Path("/api/admin/kill-switches") — so the path here is '/admin/kill-switches'.

export async function listKillSwitches(keycloak) {
  return request(keycloak, '/admin/kill-switches');
}

/** Active AND lifted. The lifted rows are the audit trail — who halted what and why. */
export async function listKillSwitchHistory(keycloak) {
  return request(keycloak, '/admin/kill-switches/history');
}

export async function engageKillSwitch(keycloak, body) {
  return request(keycloak, '/admin/kill-switches', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function liftKillSwitch(keycloak, id) {
  return request(keycloak, `/admin/kill-switches/${id}`, { method: 'DELETE' });
}

// ── Admin: users ──────────────────────────────────────────────────────────────
// Named helpers for AdminResource.java (@RolesAllowed("sys_admin"), /api/admin/*).
// Pages previously called request() directly with inline paths/query strings —
// consolidated here to match the rest of this file and give every admin
// endpoint one call site if its path or params ever change.

export async function getAdminUsers(keycloak, params = {}) {
  const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return request(keycloak, `/admin/users${qs ? `?${qs}` : ''}`);
}

export async function getAdminUser(keycloak, userId) {
  return request(keycloak, `/admin/users/${userId}`);
}

export async function suspendUser(keycloak, userId) {
  return request(keycloak, `/admin/users/${userId}/suspend`, { method: 'POST' });
}

export async function activateUser(keycloak, userId) {
  return request(keycloak, `/admin/users/${userId}/activate`, { method: 'POST' });
}

export async function adjustUserCredits(keycloak, userId, amount, note = '') {
  return request(keycloak, `/admin/users/${userId}/credits`, {
    method: 'POST',
    body: JSON.stringify({ amount, note }),
  });
}

// ── Admin: tenants ────────────────────────────────────────────────────────────
// AdminTenantResource.java (@RolesAllowed("sys_admin"), /api/admin/tenants,
// /api/admin/organizations) — platform-wide tenant/org/team/project directory.

export async function getAdminTenants(keycloak, params = {}) {
  const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return request(keycloak, `/admin/tenants${qs ? `?${qs}` : ''}`);
}

export async function getAdminTenant(keycloak, tenantId) {
  return request(keycloak, `/admin/tenants/${tenantId}`);
}

export async function getTenantOrganizations(keycloak, tenantId) {
  return request(keycloak, `/admin/tenants/${tenantId}/organizations`);
}

export async function getTenantTeams(keycloak, tenantId) {
  return request(keycloak, `/admin/tenants/${tenantId}/teams`);
}

export async function getTenantProjects(keycloak, tenantId) {
  return request(keycloak, `/admin/tenants/${tenantId}/projects`);
}

export async function suspendTenant(keycloak, tenantId) {
  return request(keycloak, `/admin/tenants/${tenantId}/suspend`, { method: 'POST' });
}

export async function activateTenant(keycloak, tenantId) {
  return request(keycloak, `/admin/tenants/${tenantId}/activate`, { method: 'POST' });
}

export async function suspendOrganization(keycloak, orgId) {
  return request(keycloak, `/admin/organizations/${orgId}/suspend`, { method: 'POST' });
}

export async function activateOrganization(keycloak, orgId) {
  return request(keycloak, `/admin/organizations/${orgId}/activate`, { method: 'POST' });
}

// ── Admin: credit ledger ─────────────────────────────────────────────────────

export async function getAdminCredits(keycloak, params = {}) {
  const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return request(keycloak, `/admin/credits${qs ? `?${qs}` : ''}`);
}

export async function getAdminCreditStats(keycloak) {
  return request(keycloak, '/admin/credits/stats');
}

// ── Admin: webhook event log ─────────────────────────────────────────────────

export async function getAdminWebhooks(keycloak, params = {}) {
  const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return request(keycloak, `/admin/webhooks${qs ? `?${qs}` : ''}`);
}

export async function replayWebhook(keycloak, eventId) {
  return request(keycloak, `/admin/webhooks/${eventId}/replay`, { method: 'POST' });
}

/**
 * Logs a synthetic webhook event for testing (AdminPaymentTesting.jsx).
 * Only writes a row to the webhook log for inspection/replay — it does NOT
 * invoke real billing side effects. See AdminResource.simulateWebhook's
 * javadoc for why that's a deliberate boundary, not a shortcut.
 */
export async function simulateWebhook(keycloak, eventType) {
  return request(keycloak, '/admin/webhooks/simulate', {
    method: 'POST',
    body: JSON.stringify({ eventType }),
  });
}

// ── Admin: system health ─────────────────────────────────────────────────────

export async function getAdminHealth(keycloak) {
  return request(keycloak, '/admin/health');
}

// ── Admin: feedback ───────────────────────────────────────────────────────────

export async function getAdminFeedback(keycloak, params = {}) {
  const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return request(keycloak, `/admin/feedback${qs ? `?${qs}` : ''}`);
}

// ── Admin: data retention ─────────────────────────────────────────────────────
// GET /api/admin/retention/dry-run returns a plain-text report (Response.ok(String)
// in AdminResource, not JSON) — request() falls back to raw text when JSON.parse
// fails, so this passes the string straight through.

export async function getRetentionDryRun(keycloak) {
  return request(keycloak, '/admin/retention/dry-run');
}

// ── Reports: platform-wide (sys_admin only, cross-tenant) ───────────────────
// ReportResource sits at @Path("/api/reports"); /platform is the cross-tenant
// rollup, distinct from /cost (tenant-scoped, used by CostAnalytics.jsx).

export async function getPlatformReport(keycloak, params = {}) {
  const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return request(keycloak, `/reports/platform${qs ? `?${qs}` : ''}`);
}

// ── Billing ───────────────────────────────────────────────────────────────────

export async function getBillingSubscription(keycloak) {
  return request(keycloak, '/billing/subscription');
}

export async function getBillingUsage(keycloak) {
  return request(keycloak, '/billing/usage');
}

export async function createCheckout(keycloak, body) {
  // email lives in the ID token profile (loadUserInfo: true in zitadel.js).
  // Zitadel does not include email in the access token by default, so we
  // read it from tokenParsed (the shim maps this to user.profile) and send
  // it in the request body for Stripe customer lookup / creation.
  const email = keycloak?.tokenParsed?.email ?? null;
  return request(keycloak, '/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ ...body, email }),
  });
}

export async function createRazorpayOrder(keycloak, body) {
  // Same email forwarding as createCheckout — Razorpay uses it for
  // customer identification on the order.
  const email = keycloak?.tokenParsed?.email ?? null;
  return request(keycloak, '/billing/razorpay/order', {
    method: 'POST',
    body: JSON.stringify({ ...body, email }),
  });
}

export async function verifyRazorpayPayment(keycloak, body) {
  return request(keycloak, '/billing/razorpay/verify', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getBillingPlans(keycloak) {
  return request(keycloak, '/billing/plans');
}

export async function getCreditPacks(keycloak) {
  return request(keycloak, '/billing/credit-packs');
}

// ── Document upload ───────────────────────────────────────────────────────────

/**
 * POST /api/documents/presign
 * Requests a short-lived S3 pre-signed PUT URL from the backend.
 * Returns { url, key, publicUrl } where:
 *   url       — pre-signed PUT URL (direct S3 upload, no auth header needed)
 *   key       — S3 object key  e.g. "dm-uploads/invoices/invoice.pdf"
 *   publicUrl — permanent reference stored in the intent payload
 */
export async function getUploadPresignedUrl(keycloak, fileName, contentType) {
  return request(keycloak, '/documents/presign', {
    method: 'POST',
    body:   JSON.stringify({ fileName, contentType }),
  });
}

// ── Onboarding ────────────────────────────────────────────────────────────────

/**
 * POST /api/onboard/setup-tenant
 * Called once after first login — sets accountType, creates Keycloak group if org.
 */
export async function setupTenant(keycloak, payload) {
  return request(keycloak, '/onboard/setup-tenant', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
// ── Review Queue ──────────────────────────────────────────────────────────────

export async function getReviewQueue(keycloak, params = {}) {
  const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
  ).toString();
  return request(keycloak, `/review-queue${qs ? `?${qs}` : ''}`);
}

export async function approveIntent(keycloak, intentId, note = '') {
  return request(keycloak, `/review-queue/${intentId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
}

export async function rejectIntent(keycloak, intentId, note = '') {
  return request(keycloak, `/review-queue/${intentId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
}
