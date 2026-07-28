BEGIN;

-- 1. Tenant
INSERT INTO tenants (id, external_id, name, account_type, status)
VALUES (
    'e2e00000-e2e0-e2e0-e2e0-e2e000000001',
    'e2e-seed-tenant',
    'E2E Test Workspace',
    'INDIVIDUAL',
    'ACTIVE'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Organization
INSERT INTO organizations (id, tenant_id, name, is_active)
VALUES (
    'e2e00000-e2e0-e2e0-e2e0-e2e000000002',
    'e2e00000-e2e0-e2e0-e2e0-e2e000000001',
    'E2E Test Workspace',
    true
)
ON CONFLICT (id) DO NOTHING;

-- 3. Team (must exist before projects — projects.team_id references it)
INSERT INTO team (id, tenant_id, name)
VALUES (
    'e2e00000-e2e0-e2e0-e2e0-e2e000000003',
    'e2e00000-e2e0-e2e0-e2e0-e2e000000001',
    'Default Team'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Project
INSERT INTO projects (id, tenant_id, team_id, name, environment, is_default)
VALUES (
    'e2e00000-e2e0-e2e0-e2e0-e2e000000004',
    'e2e00000-e2e0-e2e0-e2e0-e2e000000001',
    'e2e00000-e2e0-e2e0-e2e0-e2e000000003',
    'Default Project',
    'Production',
    true
)
ON CONFLICT (id) DO NOTHING;

-- 5. User — user_id MUST be the derived UUID for sub="e2e-test-user" (see
-- header). tenant_id is set here, which is the entire "onboarded" gate.
INSERT INTO users (user_id, tenant_id, email, name, is_active)
VALUES (
    '02e1f51d-9cc2-39bc-adc3-b0e70df9723f',
    'e2e00000-e2e0-e2e0-e2e0-e2e000000001',
    'e2e-test-user@decimeshi.com',
    'E2E Test User',
    true
)
ON CONFLICT (user_id) DO NOTHING;

-- 6. User <-> organization membership (belonging only — see V1's comment on
-- this table: authority lives in role_grant, not here)
INSERT INTO user_organizations (id, user_id, organization_id, tenant_id)
VALUES (
    'e2e00000-e2e0-e2e0-e2e0-e2e000000005',
    '02e1f51d-9cc2-39bc-adc3-b0e70df9723f',
    'e2e00000-e2e0-e2e0-e2e0-e2e000000002',
    'e2e00000-e2e0-e2e0-e2e0-e2e000000001'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Membership — tenant-wide (project_id NULL), mirrors
-- OnboardingService.buildWorkspace()'s own membership row exactly.
INSERT INTO membership (id, tenant_id, user_id, team_id, project_id)
VALUES (
    'e2e00000-e2e0-e2e0-e2e0-e2e000000006',
    'e2e00000-e2e0-e2e0-e2e0-e2e000000001',
    '02e1f51d-9cc2-39bc-adc3-b0e70df9723f',
    NULL,
    NULL
)
ON CONFLICT (id) DO NOTHING;

-- 8. Role grant — OWNER, TENANT scope. This, not the JWT roles claim, is
-- what actually makes the mock user tenant_admin in the app.
INSERT INTO role_grant (id, tenant_id, principal_type, principal_id, scope_type, scope_id, role, granted_by)
VALUES (
    'e2e00000-e2e0-e2e0-e2e0-e2e000000007',
    'e2e00000-e2e0-e2e0-e2e0-e2e000000001',
    'USER',
    '02e1f51d-9cc2-39bc-adc3-b0e70df9723f',
    'TENANT',
    NULL,
    'OWNER',
    '02e1f51d-9cc2-39bc-adc3-b0e70df9723f'
)
ON CONFLICT (id) DO NOTHING;

-- 9. Credits — 100, matching Plan.FREE.initialCredits() /
-- grantRegistrationGift's real value. Without this, Playground's Submit
-- button stays disabled (balance null/0).
INSERT INTO credit_ledger (id, org_id, amount, reason, reference_id)
VALUES (
    'e2e00000-e2e0-e2e0-e2e0-e2e000000008',
    'e2e00000-e2e0-e2e0-e2e0-e2e000000001',
    100,
    'REGISTRATION_GIFT',
    'e2e-seed'
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
