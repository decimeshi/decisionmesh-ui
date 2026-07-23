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
  const scopeHeaders = projectId ? { 'X-Project-Id': projectId } : {};

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

export async function getOrgBranding(keycloak) {
  return request(keycloak, '/org/branding');
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