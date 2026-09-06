// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

const { defineConfig, devices } = require('@playwright/test');

// Environment-driven base URLs so the SAME suite/assertions can run against
// CLEAN or BUGGY simply by changing these values (see test-strategy.md §10.7).
const UI_BASE_URL = process.env.UI_BASE_URL || 'https://practicesoftwaretesting.com';
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.practicesoftwaretesting.com';

module.exports = defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['line']],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      // REST API automation (F-API-01 .. F-API-10)
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_BASE_URL,
      },
    },
    {
      // UI / End-to-End automation (F-UI-01 .. F-UI-04)
      name: 'ui',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: UI_BASE_URL,
        // The app renders `data-test="..."` attributes (not data-testid).
        testIdAttribute: 'data-test',
      },
    },
  ],
});
