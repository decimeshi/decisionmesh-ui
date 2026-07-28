import fs from 'node:fs';
import { test as setup, expect } from '@playwright/test';

const authFile = 'e2e/.auth/user.json';
const sessionStorageFile = 'e2e/.auth/sessionStorage.json';

setup('authenticate as the seeded e2e-test-user', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign in' }).first().click();

  // Wait out the full authorize -> callback -> token-exchange chain.
  //
  // Two-step on purpose: we start on '/', which already satisfies
  // "pathname doesn't start with /auth/" -- a single waitForURL with that
  // predicate resolves immediately, before the redirect to the mock IdP
  // even begins, letting later steps race ahead of the real login. Waiting
  // to actually arrive at /auth/callback first makes the second wait
  // meaningful.
  await page.waitForURL(url => url.pathname.startsWith('/auth/'), { timeout: 15_000 });
  await page.waitForURL(url => !url.pathname.startsWith('/auth/'), { timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Sign in' })).toHaveCount(0);

  // Confirm we're not just "not signed out" but actually authenticated AND
  // past onboarding, by reaching a page that requires both. If the seed
  // didn't take (e.g. tests run against a stack whose Postgres was never
  // seeded), this is where it fails loudly instead of every later test
  // failing with a confusing, unrelated error.
  await page.goto('/playground');
  await expect(page.getByText('Intent payload')).toBeVisible({ timeout: 15_000 });

  await page.context().storageState({ path: authFile });

  // Playwright's storageState() only captures cookies + localStorage --
  // NOT sessionStorage. oidc-client-ts's user session lives in
  // sessionStorage (see zitadel.js's oidcConfig.userStore), so without this
  // the saved session silently drops the login the moment it's reused by a
  // fresh test file: the next test's page starts unauthenticated even
  // though user.json "looks" complete. Captured separately here and
  // replayed via fixtures.ts's addInitScript.
  const sessionStorageData = await page.evaluate(() => JSON.stringify(sessionStorage));
  fs.writeFileSync(sessionStorageFile, sessionStorageData);
});
