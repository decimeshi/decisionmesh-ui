import { test, expect } from '@playwright/test';

/**
 * Smoke test — brief's step 1: "can it reach the app and load the login
 * page in CI?" Deliberately not testing auth yet. This exists to prove the
 * test-stack-in-CI works at all before anything else gets built on top of it.
 *
 * If this test fails, the problem is almost always the stack, not the app:
 *   - docker-compose.e2e.yml services unhealthy (check `docker compose ... ps`)
 *   - app container failed Flyway migration / boot (check `docker compose ... logs app`)
 *   - Vite dev server didn't start (check the "webServer" output in the
 *     Playwright HTML report)
 * Covers (per the brief's incident list): the app being unreachable at all
 * behind whatever's fronting it, and the base boot-with-e2e-config path
 * (Vault dummy fallback, dummy provider keys) not crash-looping.
 */
test('unauthenticated visitor reaches the landing page and sees a sign-in option', async ({ page }) => {
  await page.goto('/');

  // main.jsx: !auth.isAuthenticated -> <LandingPage />. No role/auth backend
  // call happens on this path, so a green result here proves the frontend
  // boots and renders — nothing about the backend/OIDC chain yet.
  await expect(page.getByRole('button', { name: 'Sign in' }).first()).toBeVisible();
});

test('backend is actually reachable through the same origin the frontend calls', async ({ page, request }) => {
  // Hits the Quarkus readiness endpoint directly through Vite's /api proxy
  // path space is NOT proxied for /q/*, so this goes straight to
  // http://localhost:8080/q/health/ready via the docker-compose port mapping,
  // not through Vite at all. That's deliberate: it isolates "is the backend
  // up" from "does Vite's dev server exist", so a failure here points
  // straight at docker-compose.e2e.yml rather than the frontend.
  const response = await request.get('http://localhost:8080/q/health/ready');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.status).toBe('UP');
});
