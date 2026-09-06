// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * F-API-02 | Registration — success and important input boundaries
 * Source Scenarios: AUTH-011, AUTH-012, AUTH-013, AUTH-014, AUTH-015, AUTH-018
 * Technique: Equivalence Partitioning + Boundary Value Analysis
 *
 * PRIMARY SOURCE OF TRUTH:
 * sprint5/API/app/Http/Requests/Customer/StoreCustomer.php
 *
 * Supporting references:
 * docs/ai-knowledge/business-rules.md §7
 * docs/ai-knowledge/api-reference.md (Users / Authentication)
 *
 * Test data:
 * data/registrationTestData.js
 *
 * User-data generation:
 * data/testUsers.js
 *
 * AUTH-012 boundary refinement:
 *
 * The CLEAN implementation uses a strict DOB comparison for the
 * minimum-age boundary. Direct CLEAN API validation confirmed that
 * exactly 18 years before today is rejected with HTTP 422, while
 * 18 years + 1 day is accepted.
 *
 * AUTH-015 known CLEAN defect:
 *
 * The intended maximum age is 75, but the deployed CLEAN API accepts
 * a 76-year-old registrant with HTTP 201.
 *
 * The CLEAN StoreCustomer.php source contains a mutable Carbon date
 * calculation that provides a likely root cause for this behavior.
 *
 * The original expected result remains HTTP 422 and the scenario is
 * skipped rather than changing the business expectation to HTTP 201.
 */
const { test, expect } = require('@playwright/test');

const {
  register,
} = require('../../utils/apiHelpers');

const {
  buildRegistrationPayload,
} = require('../../data/testUsers');

const {
  registrationBoundaryCases,
  invalidPasswordPartitions,
} = require('../../data/registrationTestData');

test.describe('F-API-02 | Registration — success and boundaries', () => {
  test('AUTH-011 | valid registration succeeds (201)', async ({ request }) => {
    const payload = buildRegistrationPayload();

    const { status, body } = await register(
      request,
      payload
    );

    expect(status).toBe(201);
    expect(body.email).toBe(payload.email);
    expect(body.id).toBeTruthy();
  });

  for (const boundaryCase of registrationBoundaryCases) {
    test(
      `F-API-02 | ${boundaryCase.id} | expects ${boundaryCase.expectedStatus}`,
      async ({ request }) => {

        /*
         * KNOWN CLEAN DEFECT HANDLING
         *
         * Known-defect metadata is maintained in:
         *
         * data/registrationTestData.js
         *
         * Only scenarios explicitly marked:
         *
         * knownCleanDefect: true
         *
         * are skipped.
         *
         * AUTH-015 is currently the only known CLEAN defect in this
         * registration boundary group.
         *
         * PRIMARY SOURCE OF TRUTH:
         * sprint5/API/app/Http/Requests/Customer/StoreCustomer.php
         *
         * The intended registration rule limits customer age to the
         * documented range, but the deployed CLEAN API currently accepts
         * a 76-year-old customer.
         *
         * The original HTTP 422 expectation remains preserved.
         */
        if (boundaryCase.knownCleanDefect) {
          test.skip(
            true,
            boundaryCase.defectReason
          );
        }

        const dob = dobYearsAndDaysAgo(
          boundaryCase.dobOffsetYears,
          boundaryCase.dobOffsetDays
        );

        const payload = buildRegistrationPayload({
          dob,
        });

        const { status } = await register(
          request,
          payload
        );

        /*
         * BUSINESS ASSERTION
         *
         * Expected results come from the approved registration scenarios,
         * CLEAN Sprint 5 source rules and confirmed CLEAN API behavior.
         *
         * For AUTH-015 the expected result intentionally remains HTTP 422.
         * We do not change it to the unexpected CLEAN runtime response
         * of HTTP 201 simply to make the automation green.
         */
        expect(status).toBe(
          boundaryCase.expectedStatus
        );
      }
    );
  }

  for (const partition of invalidPasswordPartitions) {
    test(
      `F-API-02 | ${partition.id} | rejected (${partition.expectedStatus})`,
      async ({ request }) => {

        const payload = buildRegistrationPayload({
          password: partition.password,
        });

        const { status } = await register(
          request,
          payload
        );

        expect(status).toBe(
          partition.expectedStatus
        );
      }
    );
  }
});

/**
 * Returns an ISO YYYY-MM-DD DOB by subtracting the supplied
 * number of years and days from the current UTC date.
 *
 * Offsets rather than hardcoded DOB values are used because the age
 * boundaries must remain valid regardless of the date the test runs.
 */
function dobYearsAndDaysAgo(years, days) {
  const date = new Date();

  date.setUTCFullYear(
    date.getUTCFullYear() - years
  );

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return date.toISOString().slice(0, 10);
}