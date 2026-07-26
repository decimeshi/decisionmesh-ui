import { defineConfig, devices } from '@playwright/test';

// Phase 1 (current): smoke test only, no auth yet. Journey 2+ will add an
// "auth setup" project that logs in once via auth.setup.ts and saves
// storageState, with the "chromium" project depending on it and reusing
// that state — see E2E_TESTING_BRIEF.md's sequencing. Left commented below
// so the shape is visible without pretending it's wired up yet.

export default defineConfig({
  testDir: './e2e/journeys',
  fullyParallel: false, // each journey seeds/reads shared tenant state; keep serial until fixtures.ts exists
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Starts `vite --mode e2e` (reading .env.e2e) before tests, tears it down
  // after. Does NOT start the docker-compose stack — that's a separate step
  // (see e2e/README.md) because CI needs it up first for backend healthchecks
  // to matter, and because Playwright's webServer is meant for fast, disposable
  // processes, not multi-container stacks with their own healthchecks.
  webServer: {
    command: 'npx vite --mode e2e',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  projects: [
    // {
    //   name: 'setup',
    //   testMatch: /auth\.setup\.ts/,
    // },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // dependencies: ['setup'],
    },
  ],
});
