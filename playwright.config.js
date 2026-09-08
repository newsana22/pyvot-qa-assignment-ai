// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

const { defineConfig, devices } = require('@playwright/test');

// Environment-driven base URLs so the SAME suite/assertions can run against
// CLEAN or BUGGY simply by changing these values (see test-strategy.md §10.7).
const UI_BASE_URL =
  process.env.UI_BASE_URL || 'https://practicesoftwaretesting.com';

const API_BASE_URL =
  process.env.API_BASE_URL || 'https://api.practicesoftwaretesting.com';

module.exports = defineConfig({

  // Allows Playwright tests to run in parallel when the environment permits it.
  fullyParallel: true,

  // In CI, fail if test.only() was accidentally committed.
  forbidOnly: !!process.env.CI,

  // Retry a failed test once in CI.
  // Locally, no automatic retry is used.
  retries: process.env.CI ? 1 : 0,

  // Use one worker in CI for more stable execution.
  // Local execution can use Playwright's normal worker behavior.
  workers: process.env.CI ? 1 : undefined,

  // Generate both an HTML report and readable console output.
  reporter: [
    ['html', { open: 'never' }],
    ['line'],
  ],

  // Maximum execution time allowed for one test.
  timeout: 30_000,

  // Maximum time Playwright assertions wait for the expected condition.
  expect: {
    timeout: 10_000,
  },

  // Common settings applied to Playwright projects.
  use: {

    // Capture a trace on the first retry.
    trace: 'on-first-retry',

    // Capture screenshot only when a test fails.
    screenshot: 'only-on-failure',

    // Keep video evidence only for failed tests.
    video: 'retain-on-failure',
  },

  projects: [

    {
      // REST API automation (F-API-01 .. F-API-10)
      name: 'api',

      // API test files are stored in this directory.
      testDir: './tests/api',

      use: {

        // Base URL used by APIRequestContext.
        baseURL: API_BASE_URL,
      },
    },

    {
      // UI / End-to-End automation (F-UI-01 .. F-UI-04)
      name: 'ui',

      // UI test files are stored in this directory.
      testDir: './tests/ui',

      use: {

        // Use Playwright's standard Desktop Chrome browser/device settings.
        ...devices['Desktop Chrome'],

        /*
         * NEW CI BROWSER CHANGE
         * ---------------------
         * Previously Playwright used its bundled Chromium browser.
         *
         * We are now explicitly asking Playwright to launch the installed
         * Google Chrome browser.
         *
         * The purpose of this experiment is to check whether the Cloudflare
         * security verification seen on the GitHub-hosted runner behaves
         * differently when the test uses real Google Chrome instead of the
         * Playwright Chromium build.
         *
         * This does NOT bypass Cloudflare and does NOT change any test
         * assertion or expected application behaviour.
         *
         * If Cloudflare still challenges the GitHub-hosted runner, the tests
         * will continue to fail normally and preserve the true CI evidence.
         */
        channel: 'chrome',

        // Base URL used by UI tests.
        baseURL: UI_BASE_URL,

        // The Toolshop application uses:
        // data-test="..."
        // instead of Playwright's default data-testid attribute.
        testIdAttribute: 'data-test',
      },
    },
  ],
});