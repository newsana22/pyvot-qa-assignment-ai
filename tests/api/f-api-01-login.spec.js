// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * F-API-01 | Login — valid and invalid credentials
 * Source Scenarios: AUTH-001, AUTH-003, AUTH-004
 * Technique: Equivalence Partitioning
 * Reference: docs/ai-knowledge/business-rules.md §7; docs/ai-knowledge/api-reference.md (Users/Authentication).
 */
const { test, expect } = require('@playwright/test');
const { login, register } = require('../../utils/apiHelpers');
const { DEMO_CUSTOMER, buildRegistrationPayload } = require('../../data/testUsers');

test.describe('F-API-01 | Login — valid and invalid credentials', () => {
  test('AUTH-001 | valid credentials return 200 with an access token', async ({ request }) => {
    const { status, body } = await login(request, DEMO_CUSTOMER.email, DEMO_CUSTOMER.password);

    expect(status).toBe(200);
    expect(typeof body.access_token).toBe('string');
    expect(body.access_token.length).toBeGreaterThan(0);
    expect(body.token_type).toBe('bearer');
  });

  test('AUTH-003 | invalid password is rejected (401) — confirmed status only, message text is Needs Human Review', async ({
    request,
  }) => {
    // The exact error string is disputed between docs/user-stories/v5.md and UserService.php
    // (see docs/generated/test-scenarios/authentication-accounts-test-scenarios.md — AUTH-003).
    // Only the confirmed HTTP status is asserted here.
    const { status } = await login(request, DEMO_CUSTOMER.email, 'a-definitely-wrong-password-123');

    expect(status).toBe(401);
  });

  test('AUTH-004 | non-existent email is rejected (401)', async ({ request }) => {
    const unregistered = buildRegistrationPayload().email;

    const { status } = await login(request, unregistered, 'whatever-password-1');

    expect(status).toBe(401);
  });
});
