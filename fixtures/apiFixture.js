// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * UI tests run under the `ui` Playwright project, whose `baseURL` points at the UI origin
 * (see playwright.config.js). This fixture provides a separate APIRequestContext bound to
 * the REST API origin, for API-driven setup/discovery inside UI specs (see
 * .github/instructions/playwright-best-practices.instructions.md — API Automation and
 * API/UI Hybrid).
 */
const base = require('@playwright/test');

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.practicesoftwaretesting.com';

exports.test = base.test.extend({
  apiRequest: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({ baseURL: API_BASE_URL });
    await use(context);
    await context.dispose();
  },
});

exports.expect = base.expect;
