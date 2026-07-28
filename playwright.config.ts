import { defineConfig, devices } from '@playwright/test';

// Phase 2: seed + auth wired up. globalSetup seeds Postgres with an
// already-onboarded tenant/user matching the mock OIDC identity (see
// e2e/seed/seed.sql for why), then the 'setup' project logs in once via
// auth.setup.ts and saves storageState, which every 'chromium' test reuses
// — see E2E_TESTING_BRIEF.md's sequencing and e2e/README.md for the full
// local run order.

export default defineConfig({
  // Covers both e2e/journeys/*.spec.ts and e2e/auth.setup.ts. auth.setup.ts
  // doesn't match Playwright's default *.spec.ts/*.test.ts pattern, so it
  // only runs where explicitly opted in (the 'setup' project below) — no
  // exclusion needed to keep it out of the 'chromium' project's run.
  testDir: './e2e',
  fullyParallel: false, // each journey seeds/reads shared tenant state; keep serial until fixtures.ts exists
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

  // Runs once before any project. Idempotent (see seed.sql) — safe even if
  // the stack was already seeded by a previous run.
  globalSetup: './e2e/seed/run-seed.js',

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
    {
      // Independent on purpose -- no dependency on 'setup'. Its whole job
      // (per its own doc comment) is proving the stack works at all before
      // anything auth/seed-dependent runs on top of it; coupling it to
      // 'setup' would mean an unrelated auth/seed problem could fail THIS
      // test too, muddying exactly the signal it exists to give.
      name: 'smoke',
      testMatch: /00-smoke\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      testMatch: /journeys\/(?!00-smoke\.spec\.ts).+\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Reuses the session auth.setup.ts saved -- every test in this
        // project starts already logged in as the seeded e2e-test-user.
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
