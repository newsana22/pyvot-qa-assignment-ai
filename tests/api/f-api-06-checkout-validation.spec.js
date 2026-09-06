// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * F-API-06 | Checkout validation
 *
 * Source Scenarios:
 *
 * CKO-007
 * CKO-017
 * CKO-018
 *
 * Techniques:
 *
 * - Equivalence Partitioning
 * - Boundary / Negative Validation
 *
 * ============================================================
 * PRIMARY SOURCES OF TRUTH
 * ============================================================
 *
 * Payment validation:
 *
 * sprint5/API/app/Http/Controllers/PaymentController.php
 *
 * Invoice / checkout validation:
 *
 * CLEAN Sprint 5 invoice implementation and API contract
 *
 * Supporting references:
 *
 * docs/ai-knowledge/business-rules.md
 * docs/ai-knowledge/api-reference.md
 *
 * Test data:
 *
 * data/checkoutTestData.js
 *
 * ============================================================
 * IMPORTANT MANUAL VALIDATION RESULTS
 * ============================================================
 *
 * CKO-017 — Expired credit card
 *
 * Manual CLEAN Swagger:
 *
 * POST /payment/check
 *
 * payment_method = credit-card
 *
 * expiration_date = 12/2020
 *
 * Expected:
 * 422
 *
 * Manual Actual:
 * 422
 *
 *
 * CKO-018 — Malformed credit-card number
 *
 * Manual CLEAN Swagger:
 *
 * POST /payment/check
 *
 * credit_card_number = 4111111111111111
 *
 * Expected:
 * 422
 *
 * Manual Actual:
 * 422
 *
 *
 * Therefore:
 *
 * These are NOT confirmed CLEAN application defects.
 *
 * Previous Playwright HTTP 404 responses were automation/request
 * discrepancies.
 *
 * The expected assertion must remain 422.
 *
 * ============================================================
 * LATEST AUTOMATION FIX
 * ============================================================
 *
 * paymentCheck() now explicitly mirrors Swagger by sending:
 *
 * Accept: application/json
 * Content-Type: application/json
 *
 * along with the nested JSON body:
 *
 * {
 *   payment_method,
 *   payment_details
 * }
 *
 * The tests below are therefore active again and must NOT be skipped.
 */

const {
  test,
  expect,
} = require('@playwright/test');


/*
 * ============================================================
 * API HELPERS
 * ============================================================
 */
const {
  login,
  createCart,
  addItemToCart,
  buildValidBillingAddress,
  createInvoice,
  paymentCheck,
} = require('../../utils/apiHelpers');


/*
 * ============================================================
 * PRODUCT DISCOVERY
 * ============================================================
 */
const {
  findInStockProduct,
} = require('../../utils/catalogDiscovery');


/*
 * ============================================================
 * DEMO USER
 * ============================================================
 */
const {
  DEMO_CUSTOMER,
} = require('../../data/testUsers');


/*
 * ============================================================
 * EXTERNAL CHECKOUT TEST DATA
 * ============================================================
 */
const {
  requiredBillingFields,
  expiredCreditCardCase,
  malformedCreditCardCase,
} = require('../../data/checkoutTestData');


test.describe(
  'F-API-06 | Checkout validation',
  () => {

    /*
     * ============================================================
     * CKO-007
     * ============================================================
     *
     * Validate confirmed-required billing fields.
     */
    for (
      const field of requiredBillingFields
    ) {

      test(
        `CKO-007 | omitting confirmed-required "${field}" is rejected (422)`,
        async ({ request }) => {

          /*
           * Login to obtain an access token for invoice creation.
           */
          const {
            status: loginStatus,
            body: loginBody,
          } = await login(
            request,
            DEMO_CUSTOMER.email,
            DEMO_CUSTOMER.password
          );


          /*
           * Login must succeed before continuing.
           */
          expect(
            loginStatus
          ).toBe(200);


          /*
           * Access token must exist.
           */
          expect(
            loginBody.access_token
          ).toBeTruthy();


          /*
           * Discover a current valid in-stock product.
           */
          const product =
            await findInStockProduct(
              request
            );


          expect(
            product
          ).toBeDefined();


          expect(
            product.id
          ).toBeTruthy();


          /*
           * Create a fresh cart.
           */
          const cartId =
            await createCart(
              request
            );


          expect(
            cartId
          ).toBeTruthy();


          /*
           * Add one valid product to the cart.
           */
          const addResult =
            await addItemToCart(
              request,
              cartId,
              product.id,
              1
            );


          /*
           * Valid add-to-cart operation must succeed.
           */
          expect(
            addResult.status
          ).toBe(200);


          /*
           * Build a known-valid billing address.
           */
          const address =
            await buildValidBillingAddress(
              request
            );


          /*
           * Delete exactly one required field.
           *
           * This isolates the required-field validation.
           */
          delete address[field];


          /*
           * Execute invoice creation using an otherwise valid checkout.
           */
          const {
            status,
            body,
          } = await createInvoice(
            request,
            loginBody.access_token,
            {
              cart_id: cartId,
              ...address,
              payment_method: 'cash-on-delivery',
              payment_details: {},
            }
          );


          /*
           * Temporary diagnostic output.
           */
          console.log(
            `CKO-007` +
            ` | missingField=${field}` +
            ` | cartId=${cartId}` +
            ` | expected=422` +
            ` | actual=${status}` +
            ` | body=${JSON.stringify(body)}`
          );


          /*
           * ============================================================
           * BUSINESS ASSERTION
           * ============================================================
           *
           * Removing a confirmed-required field must produce:
           *
           * HTTP 422
           */
          expect(
            status
          ).toBe(422);
        }
      );
    }


    /*
     * ============================================================
     * CKO-017
     * ============================================================
     *
     * Expired credit-card validation.
     *
     * CLEAN source rule:
     *
     * expiration_date:
     *
     * required
     * date_format:m/Y
     * after:today
     *
     * Manual Swagger confirmed:
     *
     * 12/2020 -> HTTP 422
     */
    test(
      'CKO-017 | credit card with an expired date is rejected (422, confirmed error text)',
      async ({ request }) => {

        /*
         * Execute POST /payment/check.
         *
         * paymentCheck() now explicitly sends:
         *
         * Accept: application/json
         * Content-Type: application/json
         */
        const {
          status,
          body,
        } = await paymentCheck(
          request,
          expiredCreditCardCase.paymentMethod,
          expiredCreditCardCase.paymentDetails
        );


        /*
         * Diagnostic evidence.
         */
        console.log(
          `CKO-017` +
          ` | paymentMethod=${expiredCreditCardCase.paymentMethod}` +
          ` | paymentDetails=${JSON.stringify(expiredCreditCardCase.paymentDetails)}` +
          ` | expected=${expiredCreditCardCase.expectedStatus}` +
          ` | actual=${status}` +
          ` | body=${JSON.stringify(body)}`
        );


        /*
         * ============================================================
         * STATUS ASSERTION
         * ============================================================
         *
         * Manual Swagger proved:
         *
         * expired card -> 422
         */
        expect(
          status
        ).toBe(
          expiredCreditCardCase.expectedStatus
        );


        /*
         * Response body must exist.
         */
        expect(
          body
        ).toBeTruthy();


        /*
         * Validate exact expiration-specific error.
         */
        expect(
          body.message
        ).toContain(
          expiredCreditCardCase.expectedErrorText
        );


        /*
         * Validate Laravel field-level error when present.
         */
        if (
          body.errors &&
          body.errors['payment_details.expiration_date']
        ) {

          expect(
            body.errors[
              'payment_details.expiration_date'
            ]
          ).toContain(
            expiredCreditCardCase.expectedErrorText
          );
        }
      }
    );


    /*
     * ============================================================
     * CKO-018
     * ============================================================
     *
     * Malformed credit-card-number validation.
     *
     * IMPORTANT:
     *
     * Manual Swagger isolated ONLY the card-number format.
     *
     * Invalid:
     *
     * credit_card_number = 4111111111111111
     *
     * Valid:
     *
     * expiration_date = 12/2030
     * cvv = 123
     * card_holder_name = Test User
     *
     * Manual Swagger confirmed:
     *
     * malformed card number -> HTTP 422
     */
    test(
      'CKO-018 | malformed credit-card number is rejected (422, confirmed error text)',
      async ({ request }) => {

        /*
         * Execute POST /payment/check using the externally defined
         * malformed-card test data.
         */
        const {
          status,
          body,
        } = await paymentCheck(
          request,
          malformedCreditCardCase.paymentMethod,
          malformedCreditCardCase.paymentDetails
        );


        /*
         * Diagnostic evidence.
         */
        console.log(
          `CKO-018` +
          ` | paymentMethod=${malformedCreditCardCase.paymentMethod}` +
          ` | paymentDetails=${JSON.stringify(malformedCreditCardCase.paymentDetails)}` +
          ` | expected=${malformedCreditCardCase.expectedStatus}` +
          ` | actual=${status}` +
          ` | body=${JSON.stringify(body)}`
        );


        /*
         * ============================================================
         * STATUS ASSERTION
         * ============================================================
         */
        expect(
          status
        ).toBe(
          malformedCreditCardCase.expectedStatus
        );


        /*
         * Validation response must exist.
         */
        expect(
          body
        ).toBeTruthy();


        /*
         * Validate the specific manually confirmed card-number
         * format error.
         */
        expect(
          body.message
        ).toContain(
          malformedCreditCardCase.expectedErrorText
        );


        /*
         * Validate the field-level Laravel error when present.
         */
        if (
          body.errors &&
          body.errors['payment_details.credit_card_number']
        ) {

          expect(
            body.errors[
              'payment_details.credit_card_number'
            ]
          ).toContain(
            malformedCreditCardCase.expectedErrorText
          );
        }
      }
    );
  }
);