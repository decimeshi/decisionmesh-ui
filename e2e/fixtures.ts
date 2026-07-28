import fs from 'node:fs';
import { test as base } from '@playwright/test';

const sessionStorageFile = 'e2e/.auth/sessionStorage.json';

// Journeys that run against the seeded, logged-in user (the 'chromium'
// project, storageState: 'e2e/.auth/user.json' in playwright.config.ts)
// need this instead of importing `test` directly from '@playwright/test'.
//
// storageState only restores cookies + localStorage; oidc-client-ts's
// session lives in sessionStorage (see auth.setup.ts's comment on the same
// gap), so without replaying it here every test would silently start
// unauthenticated despite reusing "authenticated" storage state.
export const test = base.extend({
  page: async ({ page }, use) => {
    const sessionStorageData = fs.readFileSync(sessionStorageFile, 'utf-8');
    await page.addInitScript((data) => {
      const entries = JSON.parse(data);
      for (const [key, value] of Object.entries(entries)) {
        window.sessionStorage.setItem(key, value as string);
      }
    }, sessionStorageData);
    await use(page);
  },
});

export { expect } from '@playwright/test';
