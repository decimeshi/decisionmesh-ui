import { test, expect } from '../fixtures';

/**
 * Journey 2 (per the brief's sequencing) — "one full real journey", chosen
 * as submit-intent since that's the actual product action, and covers real
 * production concerns: auth (storageState reuse — see auth.setup.ts),
 * tenant resolution, role_grant-based authorization, and credit-gated intent
 * submission all have to work for this to pass.
 *
 * Deliberately scoped to "the intent gets accepted", NOT "the LLM execution
 * completes". Playground.jsx polls for a completed execution after submit,
 * but that requires a real, working LLM provider call — this stack's
 * application-e2e.properties seeds dummy, non-functional provider keys on
 * purpose (see that file's comment), so an actual OpenAI/Anthropic/etc. call
 * cannot succeed here. Submission succeeding is the real regression target
 * anyway (the brief's incident list is about submission failing outright,
 * not about model output quality) — asserting past that into execution
 * would make this test depend on infrastructure it doesn't have.
 *
 * Uses Playground's own pre-filled DEFAULT payload (a complete, valid
 * fraud_detection intent) rather than typing one in — intentType is a
 * free-form string with no backend enum validation, and the default payload
 * already satisfies Playground's `hasIntent` check, so no editing is needed
 * to reach a submittable state.
 */
test('an authenticated, onboarded user can submit an intent and see it accepted', async ({ page }) => {
  await page.goto('/playground');
  await expect(page.getByText('Intent payload')).toBeVisible();

  // hasIntent is true immediately (DEFAULT payload already has intentType +
  // objective.userMessage set), so the floating sticky bar — not the inline
  // button — is the visible submit control. Its label is "Submit Intent"
  // (capital I) when enabled; "No credits" if the seed's credit_ledger
  // grant didn't take, "Submitting…" mid-flight.
  const submit = page.getByRole('button', { name: 'Submit Intent' });

  // canSubmit requires balance !== null -- i.e. CreditContext's async fetch
  // of the seeded 100-credit balance has to complete first. If this times
  // out, the credit_ledger seed row is the first thing to check.
  await expect(submit).toBeEnabled({ timeout: 15_000 });
  await submit.click();

  // Success: Playground sets `result` to the new intent's ID and swaps the
  // right column to an "Intent submitted" card showing that ID. This is the
  // actual assertion for this journey — the request reached POST /intents,
  // was authorized (role_grant), was tenant-resolved, and was accepted.
  await expect(page.getByText('Intent submitted')).toBeVisible({ timeout: 15_000 });

  // The ID is rendered as plain text in a font-mono <p> -- assert it looks
  // like a UUID rather than pinning exact markup, which is more likely to
  // shift than the fact that a real ID came back.
  const idText = await page.locator('p.font-mono, p[style*="JetBrains Mono"]').first().textContent();
  expect(idText?.trim()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
});
