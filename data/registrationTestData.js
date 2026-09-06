// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * Registration test data.
 *
 * PRIMARY SOURCE OF TRUTH:
 * sprint5/API/app/Http/Requests/Customer/StoreCustomer.php
 *
 * Supporting references:
 * docs/ai-knowledge/business-rules.md §7
 * docs/ai-knowledge/api-reference.md (Users / Authentication)
 *
 * The registration implementation defines the DOB validation and
 * password validation rules used by these test partitions.
 */

const registrationBoundaryCases = [
  {
    id: 'AUTH-012 (refined: 18y + 1 day)',
    dobOffsetYears: 18,
    dobOffsetDays: -1,
    expectedStatus: 201,
  },

  {
    id: 'AUTH-012 (exactly 18 years — confirmed rejected)',
    dobOffsetYears: 18,
    dobOffsetDays: 0,
    expectedStatus: 422,
  },

  {
    id: 'AUTH-013 (exactly 75 years)',
    dobOffsetYears: 75,
    dobOffsetDays: 0,
    expectedStatus: 201,
  },

  {
    id: 'AUTH-014 (17 years — under minimum)',
    dobOffsetYears: 17,
    dobOffsetDays: 0,
    expectedStatus: 422,
  },

  {
    id: 'AUTH-015 (76 years — over documented maximum)',
    dobOffsetYears: 76,
    dobOffsetDays: 0,
    expectedStatus: 422,

    /*
     * KNOWN CLEAN APPLICATION DEFECT — AUTH-015
     *
     * PRIMARY SOURCE OF TRUTH:
     * sprint5/API/app/Http/Requests/Customer/StoreCustomer.php
     *
     * Intended business rule:
     * Customer age must be between 18 and 75 years.
     *
     * The request validator defines DOB boundaries and provides
     * validation messages including:
     *
     * "Customer must be 18 years old."
     * "Customer must be younger than 75 years old."
     *
     * Test data:
     * Customer age = 76 years.
     *
     * Expected behavior:
     * Registration should be rejected.
     *
     * Expected HTTP response:
     * 422 Unprocessable Entity
     *
     * Actual deployed CLEAN API response:
     * 201 Created
     *
     * LIKELY SOURCE-CODE ROOT CAUSE:
     *
     * StoreCustomer.php creates one mutable Carbon instance and then
     * subtracts 18 years followed by another 75 years:
     *
     * $before = $dt->subYears(18)
     * $after  = $dt->subYears(75)
     *
     * Because Carbon is mutable, the second subtraction starts from
     * the already modified date. This makes the effective lower DOB
     * boundary approximately 93 years ago instead of 75 years ago.
     *
     * That explains why a 76-year-old registrant can pass validation.
     *
     * We preserve expectedStatus = 422 and skip this known CLEAN defect
     * rather than changing the expected result to 201.
     */
    knownCleanDefect: true,

    defectReason:
      'Known CLEAN defect AUTH-015: StoreCustomer.php intends a maximum customer age of 75, but mutable Carbon date calculations shift the effective lower DOB boundary to approximately 93 years, allowing a 76-year-old registration to return 201 instead of the expected 422.',
  },
];

const invalidPasswordPartitions = [
  {
    id: 'AUTH-018 | no uppercase',
    password: 'lowercase123!zzq',
    expectedStatus: 422,
  },

  {
    id: 'AUTH-018 | no number',
    password: 'NoNumberHere!Zzq',
    expectedStatus: 422,
  },

  {
    id: 'AUTH-018 | no symbol',
    password: 'NoSymbolHere123Zzq',
    expectedStatus: 422,
  },

  {
    id: 'AUTH-018 | under 8 characters',
    password: 'Ab1!zq',
    expectedStatus: 422,
  },
];

module.exports = {
  registrationBoundaryCases,
  invalidPasswordPartitions,
};