// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

const { faker } = require('@faker-js/faker');


/**
 * ============================================================
 * PUBLIC DEMO CUSTOMER
 * ============================================================
 *
 * This account is used by authenticated UI/API scenarios.
 *
 * The application provides public demo customers for testing.
 *
 * IMPORTANT RUNTIME FINDING:
 *
 * The previously used account:
 *
 * customer@practicesoftwaretesting.com
 *
 * became locked after repeated failed-login attempts.
 *
 * Manual validation confirmed:
 *
 * POST /users/login
 *       ↓
 * HTTP 423 Locked
 *
 * UI message:
 *
 * "Account locked, too many failed attempts.
 *  Please contact the administrator."
 *
 * Therefore the framework now uses the second public demo
 * customer as the current default:
 *
 * customer2@practicesoftwaretesting.com
 *
 * Manual validation confirmed:
 *
 * POST /users/login
 *       ↓
 * HTTP 200 OK
 *       ↓
 * /account
 *       ↓
 * My account
 *
 * The credentials can still be overridden through environment
 * variables, which is preferred for CI/CD execution.
 *
 * Example:
 *
 * DEMO_CUSTOMER_EMAIL=<email>
 * DEMO_CUSTOMER_PASSWORD=<password>
 */
const DEMO_CUSTOMER = {

  /*
   * Use environment-supplied email when available.
   *
   * Otherwise use the currently validated public demo customer.
   */
  email:
    process.env.DEMO_CUSTOMER_EMAIL ||
    'customer2@practicesoftwaretesting.com',

  /*
   * Use environment-supplied password when available.
   *
   * Otherwise use the public demo password.
   */
  password:
    process.env.DEMO_CUSTOMER_PASSWORD ||
    'welcome01',
};


/**
 * ============================================================
 * BUILD UNIQUE REGISTRATION PAYLOAD
 * ============================================================
 *
 * Used by:
 *
 * AUTH-011
 * AUTH-012
 * AUTH-013
 * AUTH-018
 *
 * Each call generates a new unique email address.
 *
 * This prevents registration tests from colliding with users
 * created by earlier test executions.
 *
 * @param {object} overrides
 * Fields that should replace the generated defaults.
 *
 * Example:
 *
 * buildRegistrationPayload({
 *   dob: '1995-05-15'
 * });
 *
 * Nested address fields can also be overridden:
 *
 * buildRegistrationPayload({
 *   address: {
 *     city: 'Amsterdam'
 *   }
 * });
 *
 * @returns {object}
 * Complete customer registration request payload.
 */
function buildRegistrationPayload(overrides = {}) {

  /*
   * Date.now() provides a timestamp.
   *
   * faker.string.alphanumeric(8) adds another random component.
   *
   * Combining both makes collisions between generated email
   * addresses extremely unlikely.
   */
  const unique =
    `${Date.now()}.${faker.string.alphanumeric(8)}`;


  /*
   * Build a valid baseline registration payload.
   *
   * Individual tests should override only the field relevant
   * to the scenario being validated.
   */
  const payload = {

    /*
     * Random first name.
     */
    first_name:
      faker.person.firstName(),

    /*
     * Random last name.
     */
    last_name:
      faker.person.lastName(),

    /*
     * Valid baseline DOB.
     *
     * Boundary-specific registration tests override this value.
     */
    dob:
      '1995-06-15',

    /*
     * Valid baseline customer address.
     */
    address: {

      street:
        faker.location.streetAddress(),

      city:
        faker.location.city(),

      state:
        faker.location.state(),

      country:
        'Netherlands',

      postal_code:
        '1234AB',
    },

    /*
     * Valid baseline phone number.
     */
    phone:
      '0612345678',

    /*
     * Every test execution receives a unique email.
     */
    email:
      `qa.${unique}@example.com`,

    /*
     * Generate a sufficiently complex and randomized password.
     *
     * This reduces the chance that Laravel's uncompromised()
     * password validation rejects a common/leaked password.
     */
    password:
      `Zx9${faker.string.alphanumeric(10)}!Qw`,
  };


  /*
   * ==========================================================
   * APPLY TEST-SPECIFIC OVERRIDES
   * ==========================================================
   *
   * Spread the generated payload first.
   *
   * Then replace any fields supplied by the individual test.
   *
   * Address receives a separate nested merge so that overriding
   * one address property does not remove all other valid address
   * properties.
   */
  return {

    ...payload,

    ...overrides,

    address: {

      ...payload.address,

      ...(overrides.address || {}),
    },
  };
}


/**
 * ============================================================
 * EXPORT TEST DATA / BUILDERS
 * ============================================================
 */
module.exports = {

  /*
   * Reusable public authenticated customer.
   */
  DEMO_CUSTOMER,

  /*
   * Reusable dynamic registration-data builder.
   */
  buildRegistrationPayload,
};