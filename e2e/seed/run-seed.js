// Runs seed.sql against the e2e Postgres — see that file's header for what
// it seeds and why. Wired in as Playwright's `globalSetup` (playwright.config.ts)
// so it runs once, automatically, before any test/setup project — but it's
// also safe to run by hand: `node e2e/seed/run-seed.js`.
//
// Defaults to localhost:5433 (docker-compose.e2e.yml's published postgres
// port) — works whether the backend runs from IntelliJ (host) or as the
// dockerized `app` service (docker-compose.e2e.yml), since either way this
// script itself always runs on the host and Postgres's host-published port
// doesn't change. Override via env vars if postgres lives somewhere else.
//
// Retries instead of failing on the first attempt: `app` has no working
// healthcheck (its base image has no wget/curl -- see docker-compose.e2e.yml's
// comment on the `app` service), so `docker compose up --wait` can't tell you
// when Flyway has actually finished creating the schema (~8-9s after the
// container starts). Rather than make the person running this guess at a
// sleep duration, this just retries the "tables don't exist yet" case for a
// while before giving up for real.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MAX_ATTEMPTS = 30;
const RETRY_DELAY_MS = 2000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function attemptSeed(sql) {
  const client = new pg.Client({
    host: process.env.E2E_SEED_DB_HOST ?? 'localhost',
    port: Number(process.env.E2E_SEED_DB_PORT ?? 5433),
    database: process.env.E2E_SEED_DB_NAME ?? 'decisionmesh',
    user: process.env.E2E_SEED_DB_USER ?? 'decisionmesh',
    password: process.env.E2E_SEED_DB_PASSWORD ?? 'decisionmesh',
    connectionTimeoutMillis: 5000,
  });

  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
}

async function seed() {
  const sql = readFileSync(join(__dirname, 'seed.sql'), 'utf-8');
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await attemptSeed(sql);
      console.log('[e2e seed] Seed applied (or already present — every insert is idempotent).');
      return;
    } catch (err) {
      lastError = err;
      const retryable = /relation .* does not exist/i.test(err.message)
          || err.code === 'ECONNREFUSED';
      if (!retryable) throw err;

      if (attempt === 1) {
        console.log(
            `[e2e seed] Waiting for the backend to finish creating the schema ` +
            `(Flyway runs during its own startup, ~8-9s) — retrying up to ` +
            `${(MAX_ATTEMPTS * RETRY_DELAY_MS) / 1000}s...`
        );
      }
      await sleep(RETRY_DELAY_MS);
    }
  }

  if (/relation .* does not exist/i.test(lastError.message)) {
    throw new Error(
        `[e2e seed] Gave up after ${MAX_ATTEMPTS} attempts — the schema still ` +
        `doesn't exist. Either the backend never actually finished starting ` +
        `(check its logs for an exception during boot), or it's pointed at a ` +
        `different Postgres than this script is (this script uses ` +
        `${process.env.E2E_SEED_DB_HOST ?? 'localhost'}:${process.env.E2E_SEED_DB_PORT ?? 5433}). ` +
        `Original error: ${lastError.message}`
    );
  }
  throw new Error(
      `[e2e seed] Could not connect to Postgres. Is the e2e docker-compose ` +
      `stack up? (docker compose -f e2e/docker-compose.e2e.yml up -d --wait ` +
      `postgres redis vault mock-oidc) Original error: ${lastError.message}`
  );
}

// Playwright globalSetup contract: default-exported function, called once
// before any test/project runs. Also runnable standalone for manual re-seeding.
export default seed;

if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}
