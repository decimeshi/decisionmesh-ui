import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs) { return twMerge(clsx(inputs)); }

export function formatDate(iso) {
  try { return format(new Date(iso), 'MMM d, yyyy HH:mm:ss'); } catch { return iso; }
}

export function formatTime(iso) {
  try { return format(new Date(iso), 'h:mm:ss a'); } catch { return iso; }
}

export function formatRelative(iso) {
  try { return formatDistanceToNow(new Date(iso), { addSuffix: true }); } catch { return iso; }
}

export function formatCost(usd) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 4, maximumFractionDigits: 6,
  }).format(usd ?? 0);
}

export function formatLatency(ms) {
  if (!ms) return '—';
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}

export function shortId(uuid) {
  return uuid ? uuid.split('-')[0] : '—';
}

/**
 * Turns a raw ADAPTER_ERROR violationReason (ViolationHandler prefixes it
 * "Adapter error — LLM provider returned an error response — " then appends
 * the provider's own HTTP status + response body verbatim) into a specific,
 * actionable message instead of surfacing that raw JSON to the user.
 *
 * Covers the three "why did my first submission fail" cases users actually
 * hit: no adapter configured (handled separately via NO_ACTIVE_MODELS, not
 * here), a configured model that's been retired/renamed by the provider
 * (404/not_found_error), and an expired or revoked API key/subscription
 * (401/403). Returns null when the reason isn't an adapter/provider error at
 * all, so callers can fall back to their own constraint-based hints.
 */
export function describeAdapterError(reason) {
  const r = (reason ?? '').toLowerCase();
  if (!r.includes('adapter error')) return null;

  if (r.includes('not_found_error') || r.includes('http 404'))
    return "The configured model no longer exists at the provider — it's likely been retired or renamed. Update the model ID for this adapter in Adapters settings.";
  if (r.includes('authentication_error') || r.includes('http 401') || r.includes('invalid x-api-key') || r.includes('invalid api key'))
    return "The provider rejected the API key for this adapter — it may be expired, revoked, or missing. Check the key in Adapters / BYOK settings.";
  if (r.includes('permission_error') || r.includes('http 403'))
    return "The provider account doesn't have access to this model — check the plan/subscription with the provider.";
  if (r.includes('overloaded') || r.includes('http 529'))
    return 'The provider is temporarily overloaded — this is transient, try again shortly.';
  if (r.includes('rate limit') || r.includes('http 429'))
    return "The provider's rate limit was hit — wait a moment before retrying, or reduce request volume.";
  return 'The AI provider returned an error for this request — check the adapter configuration in Adapters settings.';
}

// Fix: added FAILED, CANCELLED, REJECTED so terminal failure states render
// with explicit colours rather than falling back to the generic grey default.
export const PHASE_COLORS = {
  CREATED:         'bg-slate-100 text-slate-700',
  PLANNING:        'bg-blue-100 text-blue-700',
  PLANNED:         'bg-indigo-100 text-indigo-700',
  EXECUTING:       'bg-amber-100 text-amber-700',
  RETRY_SCHEDULED: 'bg-orange-100 text-orange-700',
  EVALUATING:      'bg-purple-100 text-purple-700',
  COMPLETED:       'bg-green-100 text-green-700',
  FAILED:          'bg-red-100 text-red-700',
  CANCELLED:       'bg-slate-100 text-slate-500',
  REJECTED:        'bg-red-50 text-red-600',
};

export const SATISFACTION_COLORS = {
  SATISFIED: 'bg-green-100 text-green-700',
  VIOLATED:  'bg-red-100 text-red-700',
  UNKNOWN:   'bg-gray-100 text-gray-600',
};

export const PHASE_ORDER = [
  'CREATED', 'PLANNING', 'PLANNED',
  'EXECUTING', 'EVALUATING', 'COMPLETED',
];
