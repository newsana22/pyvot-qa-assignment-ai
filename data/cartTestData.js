// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * F-API-04 | Cart Quantity Boundary Value Analysis Test Data
 *
 * Source Scenarios:
 *
 * CART-004
 * CART-005
 * CART-006
 * CART-007
 *
 * Technique:
 *
 * Boundary Value Analysis
 *
 * ============================================================
 * CLEAN SOURCE RULE
 * ============================================================
 *
 * CLEAN Sprint 5 validates cart quantity using:
 *
 * 'quantity' => 'required|integer|min:1|max:99'
 *
 * Therefore:
 *
 * Minimum valid quantity = 1
 * Maximum valid quantity = 99
 *
 * Boundary values:
 *
 * 0   = minimum - 1 -> INVALID -> HTTP 422
 * 1   = minimum     -> VALID   -> HTTP 200
 * 99  = maximum     -> VALID   -> HTTP 200
 * 100 = maximum + 1 -> INVALID -> HTTP 422
 *
 * ============================================================
 * MANUAL VALIDATION
 * ============================================================
 *
 * Independent CLEAN Swagger testing confirmed:
 *
 * quantity 0   -> HTTP 422
 * quantity 100 -> HTTP 422
 *
 * The successful manual operation was:
 *
 * POST /carts
 *      ↓
 * POST /carts/{id}
 *
 * The boundary quantity was supplied directly when adding the
 * product to the fresh cart.
 *
 * ============================================================
 * LATEST AUTOMATION DECISION
 * ============================================================
 *
 * Earlier manual executions used specific product IDs such as
 * Bolt Cutters and Cordless Drill 24V.
 *
 * Those product IDs were valid during the manual executions.
 *
 * However, the latest automated run using those historical IDs
 * returned HTTP 404 for ALL four boundaries:
 *
 * 0   -> 404
 * 1   -> 404
 * 99  -> 404
 * 100 -> 404
 *
 * Because even valid quantities 1 and 99 returned 404, the
 * automated test was not reaching meaningful quantity behavior.
 *
 * Therefore:
 *
 * Product IDs are intentionally NOT stored in this test-data file.
 *
 * The automated test dynamically discovers a CURRENT in-stock
 * CLEAN product before executing each boundary test.
 *
 * This preserves:
 *
 * - the manually verified POST /carts/{id} operation;
 * - the correct BVA expectations;
 * - independence from potentially stale product IDs.
 */

const cartQuantityBoundaryCases = [

  /*
   * ============================================================
   * CART-004 — MINIMUM - 1
   * ============================================================
   *
   * Minimum valid quantity = 1
   *
   * Therefore:
   *
   * 0 = minimum - 1
   *
   * Expected:
   *
   * HTTP 422
   *
   * Manually confirmed CLEAN validation message:
   *
   * "The quantity field must be at least 1."
   */
  {
    id: 'CART-004',

    quantity: 0,

    expectedStatus: 422,

    expectedValidity: 'INVALID',

    expectedErrorText:
      'The quantity field must be at least 1.',
  },


  /*
   * ============================================================
   * CART-005 — MINIMUM
   * ============================================================
   *
   * Quantity 1 is the minimum supported quantity.
   *
   * Expected:
   *
   * HTTP 200
   */
  {
    id: 'CART-005',

    quantity: 1,

    expectedStatus: 200,

    expectedValidity: 'VALID',
  },


  /*
   * ============================================================
   * CART-006 — MAXIMUM
   * ============================================================
   *
   * Quantity 99 is the maximum supported quantity.
   *
   * Expected:
   *
   * HTTP 200
   */
  {
    id: 'CART-006',

    quantity: 99,

    expectedStatus: 200,

    expectedValidity: 'VALID',
  },


  /*
   * ============================================================
   * CART-007 — MAXIMUM + 1
   * ============================================================
   *
   * Maximum valid quantity = 99
   *
   * Therefore:
   *
   * 100 = maximum + 1
   *
   * Expected:
   *
   * HTTP 422
   *
   * Manually confirmed CLEAN validation message:
   *
   * "The quantity field must not be greater than 99."
   */
  {
    id: 'CART-007',

    quantity: 100,

    expectedStatus: 422,

    expectedValidity: 'INVALID',

    expectedErrorText:
      'The quantity field must not be greater than 99.',
  },
];


module.exports = {
  cartQuantityBoundaryCases,
};