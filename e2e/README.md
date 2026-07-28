# E2E tests (Playwright)

Status: **Phase 2 — smoke test verified green locally (real run, real
browser, real backend via IntelliJ). Auth setup, the Postgres seed, and the
submit-intent journey are new and NOT yet run** — built the same way Phase 1
was (reading the real schema, the real onboarding/authorization code paths,
the real Playground.jsx), but this environment still has no Docker/Postgres
to actually execute against. Expect the first attempt at these new pieces to
surface something — that's normal, not a sign the plan is wrong. Read this
whole file before debugging a failure; most first-run problems are one of
the things called out below.

## Why this exists

Per `E2E_TESTING_BRIEF.md` (in the repo root, or wherever you keep it): UI
journey tests, driven through the real browser, running in CI on every push,
scoped to failures actually seen in production. The hard part isn't the
tests — it's a reproducible, seeded, auth-working stack in CI. That's what
this phase builds.

## Run it locally

Mirrors your normal local dev workflow (Docker Desktop → docker compose →
run the backend from IntelliJ → run the UI) — just pointed at this stack's
seeded infra and mock IdP instead of your usual dev stack.

1. **Add a hosts entry** (one-time — both the browser and, in this
   workflow, your IntelliJ-run backend are host processes, so they both
   need "mock-oidc" to resolve to the mock OIDC container's published
   port; see the comment block at the top of `docker-compose.e2e.yml`):
   ```
   echo "127.0.0.1 mock-oidc" | sudo tee -a /etc/hosts        # macOS/Linux/WSL
   ```
   On native Windows, add `127.0.0.1 mock-oidc` to
   `C:\Windows\System32\drivers\etc\hosts` as Administrator.

2. **Bring up the infra services only** (NOT `app` — see the comment on
   that service in `docker-compose.e2e.yml` for why: it needs a GHCR image
   built from a branch that doesn't exist yet):
   ```
   docker compose -f e2e/docker-compose.e2e.yml up -d --wait postgres redis vault mock-oidc
   docker compose -f e2e/docker-compose.e2e.yml ps
   ```

3. **Run the backend from IntelliJ**, same as normal local dev, but:
   - Activate the `e2e` profile: set env var `QUARKUS_PROFILE=e2e` on the
     run configuration (or `-Dquarkus.profile=e2e` as a VM option).
   - Also set `VAULT_ADDR=http://localhost:8201` and
     `VAULT_TOKEN=e2e-root-token` on the same run configuration —
     `VaultConfigSource` reads these directly from the environment, not
     from `application-e2e.properties`, and its own built-in default
     (`localhost:8200`) doesn't match this stack's offset Vault port
     (`8201`, chosen so it can coexist with your regular dev Vault).
   - Everything else (datasource, redis) defaults to `localhost` + this
     stack's published ports automatically — no other config needed.
   - Stop your normal dev backend first if it's running — this one also
     listens on port 8080 (deliberately, to match Vite's hardcoded proxy
     target, same as your regular dev setup).

4. **Install Playwright once:**
   ```
   npm ci
   npx playwright install --with-deps chromium
   ```

5. **Run the tests:**
   ```
   npm run e2e          # headless
   npm run e2e:ui       # Playwright's UI mode, easier for debugging
   ```
   This does three things in order, automatically:
   - Runs `e2e/seed/run-seed.js` (Playwright's `globalSetup`) — inserts an
     already-onboarded tenant/user matching the mock OIDC identity directly
     into Postgres. Idempotent, safe to have already run. Requires the
     IntelliJ backend to have booted at least once already (Flyway has to
     have created the tables first) — if this step fails with "tables don't
     exist yet", that's why. See `e2e/seed/seed.sql`'s header for the full
     reasoning.
   - Runs the `setup` project (`auth.setup.ts`) — logs in once as the seeded
     user via the mock OIDC server, saves the session to `e2e/.auth/user.json`.
   - Runs the `smoke` project (independent, no login) and the `chromium`
     project (everything under `e2e/journeys/` except the smoke test,
     already logged in via the saved session) — this is where
     `01-submit-intent.spec.ts` runs.

   `vite --mode e2e` itself starts automatically too (`playwright.config.ts`'s
   `webServer` block) — no separate UI process needed, though
   `npm run dev -- --mode e2e` works if you want the browser open yourself
   while iterating.

   To re-seed by hand (e.g. after a `down -v` and fresh `up`, before running
   tests): `npm run e2e:seed`.

6. **Tear down:**
   ```
   docker compose -f e2e/docker-compose.e2e.yml down -v
   ```

### Running the full stack in Docker instead (no IntelliJ)

Don't need IntelliJ open, and doesn't touch your normal dev backend at all.
`app` builds from your local `../../decisionmesh` checkout rather than
pulling the stale GHCR `:staging` image (which doesn't have
`application-e2e.properties` — that only exists on an unmerged branch there).

1. Build the backend jar first — the Dockerfile only copies an
   already-built `target/quarkus-app/*`, it doesn't run Maven:
   ```
   cd ../decisionmesh   # or wherever your decisionmesh checkout is
   git checkout feature/e2e-mock-oidc   # or main/staging once merged
   mvn -pl decisionmesh-bootstrap -am package -DskipTests
   ```
2. Add the hosts entry (step 1 in "Run it locally" above) — still needed,
   same reasoning.
3. Build and bring up the whole stack, all 5 services:
   ```
   cd ../decisionmesh-ui
   docker compose -f e2e/docker-compose.e2e.yml build app
   docker compose -f e2e/docker-compose.e2e.yml up -d --wait
   docker compose -f e2e/docker-compose.e2e.yml ps
   ```
4. Continue from step 4 ("Install Playwright once") above.

Don't run both this AND an IntelliJ-run backend at the same time — they'll
fight over port 8080. Pick one per session.

This is also what CI's `e2e.yml` workflow uses, though CI checks out the
backend branch separately and builds from that checkout — see that
workflow file once it's updated to do so (not yet wired; it currently still
assumes a pulled image).

## Run it in CI

`.github/workflows/e2e.yml` exists but is `workflow_dispatch`-only right
now — trigger it manually from the Actions tab. Switch the trigger to
`on: [push, pull_request]` only after a manual run has actually gone green.

## What's built vs. deferred

Built and verified (real run, real browser, local, via IntelliJ + docker-compose infra):
- Full stack minus `app` in Docker: postgres, redis, vault (openbao dev-mode),
  mock OIDC server. `app` (the backend) runs from IntelliJ instead — see
  "Run it locally" above for why, and `docker-compose.e2e.yml`'s comment on
  the `app` service for the CI-only path.
- `journeys/00-smoke.spec.ts` — both tests pass.

Built, NOT yet run (same caveat as ever — no Docker/Postgres in this
environment):
- `e2e/seed/seed.sql` + `run-seed.js` — pre-creates an already-onboarded
  tenant/user/role_grant/credit_ledger row set matching the mock OIDC
  identity, traced against the real schema (`V1__decision_mesh.sql`) and the
  real provisioning code (`OnboardingService.buildWorkspace()`). Wired as
  Playwright's `globalSetup`. The derived `user_id` UUID (from the mock
  `sub` claim, via Java's `UUID.nameUUIDFromBytes`) was independently
  recomputed and verified, not just taken on faith.
- `auth.setup.ts` — logs in via the mock IdP, confirms the app lands past
  onboarding (proves the seed worked), saves `storageState`.
- `journeys/01-submit-intent.spec.ts` — submits Playground's pre-filled
  default intent payload, asserts it's accepted (a real intent ID comes
  back). Deliberately does NOT assert the LLM execution itself completes —
  `application-e2e.properties` seeds dummy, non-functional provider keys on
  purpose, so a real model call can't succeed here; see that spec's comment
  for the reasoning.
- `playwright.config.ts` now has three projects: `smoke` (independent, no
  login — unchanged from Phase 1), `setup` (`auth.setup.ts`), and `chromium`
  (everything else under `journeys/`, depends on `setup`, reuses its
  `storageState`).

Deferred to later phases (per brief's sequencing — don't build until what's
above is confirmed green):
- The onboarding journey itself — note the seed script *bypasses* onboarding
  rather than testing it; the "setup-tenant 500 / chicken-and-egg" incident
  still has no direct regression test.
- Remaining journeys: audit/spend.
- Kafka in the stack — not needed until a journey exercises the outbox
  publisher. Commented placeholder is in `docker-compose.e2e.yml` and
  `application-e2e.properties`.
- Switching CI from `workflow_dispatch` to `push`/`pull_request`.

## Incident -> test coverage map

Per `CLAUDE_CODE_E2E_PROMPT.md`'s list of confirmed production failures:

| Incident | Covered by | Status |
|---|---|---|
| Zitadel roles missing from token | Indirect: `submit-intent` only succeeds if `role_grant`-based authorization resolves correctly end to end, which needs a real, working role claim path through the app. Not a direct "assert the roles claim is present" test though. | partially built, not run |
| CORS that were actually 502s (gateway couldn't reach API) | smoke test's direct `/q/health/ready` check | built — this is exactly a "fail loudly if unreachable" check |
| setup-tenant 500 / chicken-and-egg on clean schema | Not covered — the seed script deliberately *bypasses* onboarding (pre-creates an already-onboarded user) rather than driving the setup-tenant flow itself. A real regression test for this incident still needs a dedicated onboarding journey that starts from a genuinely unonboarded mock identity. | not built |
| Vault sealed after restart | stack design: openbao dev-mode + root token can't be sealed | built (structural, not a test — this incident is prevented by construction, not asserted against) |
| Redis NOAUTH at the rate-limiter filter | stack design: redis has no auth configured | built (structural, same reasoning as Vault) |
| Flyway checksum mismatch on already-applied migrations | not covered — this needs a CI *guard* (fail if a migration file's checksum changed vs. what's already merged), which is a different mechanism than an E2E test. Flagged, not built. | not built |
| Empty/optional provider keys crash boot | `application-e2e.properties` seeds dummy non-empty values for every key named in `VaultConfigSource.java`'s incident note | built (structural) |

I did not find additional incidents in `decisionmesh`'s recent git history
beyond what's already in the prompt's list (searched commit messages for
vault/sealed/NOAUTH/502/CORS/checksum/setup-tenant/roles over the last 60
days) — the specific incidents named in the brief read as same-day
operational findings rather than things with a matching commit message, so
that search came up thin. Worth a second pass by whoever was actually
present for the migration if anything's missing here.

## Honest caveats

The smoke test is genuinely verified — it ran, green, in a real browser
against a real IntelliJ-run backend. Everything from the seed script onward
(seed, auth setup, submit-intent) is new and has NOT been run — I still have
no Docker/Postgres in the environment I built it in. The reasoning is
careful (I read the actual schema, the actual onboarding/authorization code
paths that decide `tenant_id` and `role_grant`, the actual Playground
component's submit logic and button states — not guessed at any of it), and
I independently recomputed the derived user UUID rather than trusting it
secondhand. But none of that substitutes for actually running it. Likely
first-failure points, in rough order of likelihood:
- The seed running before the backend has ever booted (tables don't exist
  yet) — `run-seed.js` tries to give a clear error for this specific case.
- `auth.setup.ts`'s redirect-chain timing — if `mock-oauth2-server`'s
  non-interactive `/authorize` behavior doesn't match what the README
  describes (in-repo, not independently confirmed by watching it happen),
  the wait for the callback to resolve may need adjusting.
- `01-submit-intent.spec.ts`'s selector for the submitted intent's ID
  (`p.font-mono` / `style*="JetBrains Mono"`) — read directly from
  `Playground.jsx`, but CSS-based selectors are the most likely thing here
  to need a small correction against the real rendered DOM.
