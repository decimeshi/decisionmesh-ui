# E2E tests (Playwright)

Status: **Phase 1 — smoke test only, never actually run.** This was built by
reading the repo (routes, auth flow, existing compose files) and reasoning
through the stack, but nobody has run `docker compose up` on it yet. Expect
the first few attempts to surface real problems — that's normal, not a sign
the plan is wrong. Read this whole file before debugging a failure; most
first-run problems are one of the things called out below.

## Why this exists

Per `E2E_TESTING_BRIEF.md` (in the repo root, or wherever you keep it): UI
journey tests, driven through the real browser, running in CI on every push,
scoped to failures actually seen in production. The hard part isn't the
tests — it's a reproducible, seeded, auth-working stack in CI. That's what
this phase builds.

## Run it locally

1. **Add a hosts entry** (one-time, needed because the browser and the
   dockerized backend reach the mock OIDC server via different network
   paths — see the comment block at the top of `docker-compose.e2e.yml` for
   why):
   ```
   echo "127.0.0.1 mock-oidc" | sudo tee -a /etc/hosts        # macOS/Linux
   ```
   On Windows, add `127.0.0.1 mock-oidc` to
   `C:\Windows\System32\drivers\etc\hosts` as Administrator.

2. **Stop anything already using port 8080** — the stack's `app` container
   binds there to match `vite.config.js`'s hardcoded proxy target.

3. **Bring up the stack:**
   ```
   docker compose -f e2e/docker-compose.e2e.yml up -d --wait
   docker compose -f e2e/docker-compose.e2e.yml ps      # everything should say "healthy"
   ```
   If `app` never turns healthy, check its logs first:
   ```
   docker compose -f e2e/docker-compose.e2e.yml logs -f app
   ```

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

6. **Tear down:**
   ```
   docker compose -f e2e/docker-compose.e2e.yml down -v
   ```

## Run it in CI

`.github/workflows/e2e.yml` exists but is `workflow_dispatch`-only right
now — trigger it manually from the Actions tab. Switch the trigger to
`on: [push, pull_request]` only after a manual run has actually gone green.

## What's built vs. deferred

Built (Phase 1):
- `docker-compose.e2e.yml` — postgres, redis, vault (openbao dev-mode,
  root-token — can't be "sealed", which was one of the named incidents),
  a mock OIDC server (`mock-oauth2-server`) standing in for Zitadel Cloud,
  and the backend pulled pre-built from GHCR (`ghcr.io/decimeshi/decisionmesh:staging`
  — built by `decisionmesh`'s own `ci.yml`, not rebuilt from source here;
  UI-repo CI has no access to backend source, so this is the natural
  boundary for a cross-repo E2E setup).
- `application-e2e.properties` (in the `decisionmesh` backend repo, branch
  `feature/e2e-mock-oidc`) — points OIDC at the mock server, gives the
  datasource/redis direct values (Vault-sourced config gracefully falls
  back to these if a KV path 404s — see `VaultConfigSource.java`), and
  seeds dummy-but-non-empty LLM/payment keys.
- `e2e/mock-oidc/config.json` — issues tokens with the
  `urn:zitadel:iam:org:project:roles` claim the backend's
  `quarkus.oidc.roles.role-claim-path` expects. **Not verified against
  mock-oauth2-server's actual schema** — I wrote this from documented shape,
  not a working run. If tokens come back without the roles claim, this file
  is the first thing to check against the tool's own docs.
- One smoke spec (`journeys/00-smoke.spec.ts`): unauthenticated landing page
  reachable, and the backend's `/q/health/ready` reachable directly.

Deferred to later phases (don't build until the smoke test is actually
green — see brief's sequencing):
- `auth.setup.ts` + `storageState` reuse (journey 2 prerequisite).
- Journeys 2-4: onboarding, submit-intent, audit/spend.
- Kafka in the stack — not needed until submit-intent (journey 3) exercises
  the outbox publisher. Commented placeholder is in
  `docker-compose.e2e.yml` and `application-e2e.properties`.
- Switching CI from `workflow_dispatch` to `push`/`pull_request`.

## Incident -> test coverage map

Per `CLAUDE_CODE_E2E_PROMPT.md`'s list of confirmed production failures:

| Incident | Covered by | Status |
|---|---|---|
| Zitadel roles missing from token | journey 2 (auth) role assertion | not built yet |
| CORS that were actually 502s (gateway couldn't reach API) | smoke test's direct `/q/health/ready` check | built — this is exactly a "fail loudly if unreachable" check |
| setup-tenant 500 / chicken-and-egg on clean schema | journey 2 (onboarding) | not built yet |
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

I don't have Docker in the environment I built this in, so **nothing here
has actually been run**. The reasoning is careful (I read the real auth
flow, the real Vault config-loading fallback behavior, the real hardcoded
Vite proxy port), but a multi-container stack like this reliably needs a
few iterations to get healthchecks, timing, and networking exactly right
even for someone who *can* run it as they build. Budget real time for the
first attempt; don't expect green on try one.
