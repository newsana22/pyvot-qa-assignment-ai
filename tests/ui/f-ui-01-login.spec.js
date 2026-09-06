// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * F-UI-01 | Login -> authenticated account
 * Source Scenarios: AUTH-001, AUTH-002
 * Technique: Equivalence Partitioning + State Transition
 * Reference: docs/ai-knowledge/business-rules.md §7; ui-reference.md — Auth / Header.
 */
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const { HeaderComponent } = require('../../pages/HeaderComponent');
const { DEMO_CUSTOMER } = require('../../data/testUsers');

test.describe('F-UI-01 | Login -> authenticated account', () => {
  test('AUTH-001 | standard user login navigates to the account area with authenticated nav state', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const header = new HeaderComponent(page);

    await loginPage.goto();
    await loginPage.login(DEMO_CUSTOMER.email, DEMO_CUSTOMER.password);

    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByTestId('page-title')).toContainText('My account');
    await expect(header.userMenu).toBeVisible();
  });

  test('AUTH-002 | admin login redirects to the admin dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('admin@practicesoftwaretesting.com', 'welcome01');

    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });
});
