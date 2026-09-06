// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * ============================================================
 * CHECKOUT AND PAYMENT TEST DATA
 * ============================================================
 *
 * PRIMARY SOURCE OF TRUTH:
 *
 * sprint5/API/app/Http/Controllers/PaymentController.php
 *
 * Supporting references:
 *
 * docs/ai-knowledge/business-rules.md
 * docs/ai-knowledge/api-reference.md
 *
 * ============================================================
 * CONFIRMED CREDIT-CARD VALIDATION RULES
 * ============================================================
 *
 * Credit-card number:
 *
 * Must match:
 *
 * XXXX-XXXX-XXXX-XXXX
 *
 * Regex:
 *
 * ^\d{4}-\d{4}-\d{4}-\d{4}$
 *
 *
 * Expiration date:
 *
 * required
 * date_format:m/Y
 * after:today
 *
 *
 * CVV:
 *
 * 3 or 4 digits
 *
 *
 * Card-holder name:
 *
 * letters and spaces only
 *
 *
 * Invalid payment requests are expected to be rejected by the
 * request-validation layer with:
 *
 * HTTP 422 Unprocessable Entity
 *
 * ============================================================
 * HUMAN / MANUAL VALIDATION
 * ============================================================
 *
 * CKO-017 and CKO-018 were independently executed through the
 * CLEAN Swagger API.
 *
 * Both returned the expected HTTP 422 response.
 *
 * Therefore these scenarios are NOT known CLEAN application
 * defects.
 *
 * Earlier automated HTTP 404 responses were automation/request
 * discrepancies and must not be used as the expected result.
 */


/*
 * ============================================================
 * REQUIRED BILLING FIELDS
 * ============================================================
 *
 * These fields are confirmed-required during invoice /
 * checkout creation.
 */
const requiredBillingFields = [

  'billing_street',

  'billing_city',

  'billing_country',

];


/*
 * ============================================================
 * VALID BILLING ADDRESS
 * ============================================================
 *
 * Used by positive UI checkout scenarios such as F-UI-03.
 *
 * The postal code and house number are used by the real
 * postcode-lookup flow.
 */
const validBillingAddress = {

  country: 'Austria',

  postalCode: '1010',

  houseNumber: '1',

};


/*
 * ============================================================
 * VALID CREDIT-CARD CASE
 * ============================================================
 *
 * Used by positive checkout/payment scenarios.
 *
 * Every field satisfies the confirmed CLEAN Sprint 5
 * PaymentController validation rules.
 */
const validCreditCardCase = {

  id: 'CKO-001',

  paymentMethod: 'credit-card',

  paymentDetails: {

    /*
     * Correct required card-number format.
     */
    credit_card_number:
      '4111-1111-1111-1111',


    /*
     * Future date in MM/YYYY format.
     */
    expiration_date:
      '12/2030',


    /*
     * Valid three-digit CVV.
     */
    cvv:
      '123',


    /*
     * Letters and spaces only.
     */
    card_holder_name:
      'Test User',

  },

  expectedStatus: 200,

};


/*
 * ============================================================
 * CKO-017 — EXPIRED CREDIT CARD
 * ============================================================
 *
 * TEST DESIGN:
 *
 * Negative validation / boundary-related date validation.
 *
 *
 * MANUAL CLEAN SWAGGER REQUEST:
 *
 * POST /payment/check
 *
 * {
 *   "payment_method": "credit-card",
 *   "payment_details": {
 *     "credit_card_number": "4111-1111-1111-1111",
 *     "expiration_date": "12/2020",
 *     "cvv": "123",
 *     "card_holder_name": "Test User"
 *   }
 * }
 *
 *
 * IMPORTANT:
 *
 * Only expiration_date is intentionally invalid.
 *
 * All remaining fields are valid.
 *
 *
 * CLEAN VALIDATION RULE:
 *
 * expiration_date:
 *
 * required | date_format:m/Y | after:today
 *
 *
 * MANUALLY VERIFIED RESULT:
 *
 * Expected = 422
 * Actual   = 422
 * Result   = PASS
 *
 *
 * MANUALLY VERIFIED ERROR:
 *
 * The payment details.expiration date field must be a date
 * after today.
 */
const expiredCreditCardCase = {

  id: 'CKO-017',

  paymentMethod:
    'credit-card',

  paymentDetails: {

    /*
     * Valid card number.
     */
    credit_card_number:
      '4111-1111-1111-1111',


    /*
     * INTENTIONALLY INVALID.
     *
     * This is the exact expired date used during manual
     * CLEAN Swagger verification.
     */
    expiration_date:
      '12/2020',


    /*
     * Valid CVV.
     */
    cvv:
      '123',


    /*
     * Valid holder name.
     */
    card_holder_name:
      'Test User',

  },


  /*
   * Confirmed by CLEAN source and manual Swagger execution.
   */
  expectedStatus:
    422,


  /*
   * Exact manually observed CLEAN validation message.
   */
  expectedErrorText:
    'The payment details.expiration date field must be a date after today.',


  /*
   * Evidence metadata.
   *
   * This does NOT control test execution.
   */
  manuallyValidated:
    true,

  manualValidationResult:
    'PASS — CLEAN Swagger returned HTTP 422 for expiration_date 12/2020.',

  cleanApplicationDefect:
    false,

};


/*
 * ============================================================
 * CKO-018 — MALFORMED CREDIT-CARD NUMBER
 * ============================================================
 *
 * TEST DESIGN:
 *
 * Equivalence Partitioning / Negative Testing
 *
 *
 * VALID PARTITION:
 *
 * 4111-1111-1111-1111
 *
 *
 * INVALID PARTITION:
 *
 * 4111111111111111
 *
 *
 * The invalid value deliberately removes the required hyphens.
 *
 *
 * MANUAL CLEAN SWAGGER REQUEST:
 *
 * POST /payment/check
 *
 * {
 *   "payment_method": "credit-card",
 *   "payment_details": {
 *     "credit_card_number": "4111111111111111",
 *     "expiration_date": "12/2030",
 *     "cvv": "123",
 *     "card_holder_name": "Test User"
 *   }
 * }
 *
 *
 * IMPORTANT:
 *
 * ONLY credit_card_number is intentionally invalid.
 *
 * expiration_date = valid
 * cvv             = valid
 * card_holder_name = valid
 *
 * This isolates the credit-card-number equivalence partition.
 *
 *
 * MANUALLY VERIFIED RESULT:
 *
 * Expected = 422
 * Actual   = 422
 * Result   = PASS
 *
 *
 * MANUALLY VERIFIED ERROR:
 *
 * The payment details.credit card number field format is invalid.
 */
const malformedCreditCardCase = {

  id:
    'CKO-018',

  paymentMethod:
    'credit-card',

  paymentDetails: {

    /*
     * INTENTIONALLY INVALID.
     *
     * Missing the required hyphens.
     *
     * This is the exact value used during manual Swagger
     * verification.
     */
    credit_card_number:
      '4111111111111111',


    /*
     * Valid future expiration date.
     */
    expiration_date:
      '12/2030',


    /*
     * Valid three-digit CVV.
     */
    cvv:
      '123',


    /*
     * Valid holder name.
     */
    card_holder_name:
      'Test User',

  },


  /*
   * Confirmed by CLEAN source and manual Swagger execution.
   */
  expectedStatus:
    422,


  /*
   * Exact manually observed CLEAN validation message.
   */
  expectedErrorText:
    'The payment details.credit card number field format is invalid.',


  /*
   * Evidence metadata only.
   */
  manuallyValidated:
    true,

  manualValidationResult:
    'PASS — CLEAN Swagger returned HTTP 422 for malformed credit-card-number format.',

  cleanApplicationDefect:
    false,

};


/*
 * ============================================================
 * EXPORT TEST DATA
 * ============================================================
 */
module.exports = {

  requiredBillingFields,

  validBillingAddress,

  validCreditCardCase,

  expiredCreditCardCase,

  malformedCreditCardCase,

};