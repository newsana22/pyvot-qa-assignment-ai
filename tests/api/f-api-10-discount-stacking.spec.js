// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * F-API-10 | Discount rules + stacking calculation
 *
 * Source Scenarios:
 * FIN-007, FIN-008, FIN-009, FIN-010, FIN-011, FIN-012
 *
 * Techniques used:
 * - Decision Table
 * - Boundary Value Analysis
 * - State Transition
 *
 * Purpose:
 * This file validates Toolshop discount business rules through API automation.
 * It checks:
 * 1. 15% combination discount for rental + non-rental products.
 * 2. No combination discount for only one product type.
 * 3. Discount removal when rental product is removed.
 * 4. 5% eco discount when eco-friendly quantity is more than 50%.
 * 5. No eco discount at exactly 50%.
 * 6. Correct stacking: 15% combination discount first, then 5% eco discount.
 */


// Import Playwright's test runner and assertion library.
// test   -> used to define test cases.
// expect -> used to compare actual result with expected result.
const { test, expect } = require('@playwright/test');


// Import reusable API helper methods from apiHelpers.js.
//
// login()                    -> logs in a user and returns login response/token.
// createCart()               -> creates a new cart and returns cart ID.
// addItemToCart()            -> adds a product and quantity into a cart.
// removeCartItem()           -> removes a specific product from a cart.
// getCart()                  -> retrieves latest cart details.
// buildValidBillingAddress() -> creates/gets a valid address for invoice checkout.
// createInvoice()            -> creates an invoice/order for the cart.
const {
  login,
  createCart,
  addItemToCart,
  removeCartItem,
  getCart,
  buildValidBillingAddress,
  createInvoice,
} = require('../../utils/apiHelpers');


// Import product-discovery utility methods.
//
// These methods dynamically find products from the real Toolshop catalogue.
// This avoids hardcoding fixed product IDs.
//
// findRentalProduct()
// -> finds a product where is_rental = true.
//
// findCo2FriendlyProducts()
// -> finds eco-friendly / qualifying CO2 products.
//
// findNonEcoNonRentalProduct()
// -> finds a normal product which is neither eco-friendly nor rental.
const {
  findRentalProduct,
  findCo2FriendlyProducts,
  findNonEcoNonRentalProduct,
} = require('../../utils/catalogDiscovery');


// Import money utility.
//
// toCents() normalizes monetary calculations to two decimal places.
// This helps avoid JavaScript floating-point issues.
//
// Example:
// 80.749999999 -> 80.75
const { toCents } = require('../../utils/money');


// Import the standard public Toolshop demo customer.
//
// DEMO_CUSTOMER contains values like:
// DEMO_CUSTOMER.email
// DEMO_CUSTOMER.password
//
// Keeping credentials in one file avoids repeating them in every test.
const { DEMO_CUSTOMER } = require('../../data/testUsers');


// test.describe() groups all F-API-10 tests together.
// The function inside contains all discount-related test cases.
test.describe('F-API-10 | Discount rules + stacking calculation', () => {


  /**
   * FIN-007
   *
   * Business rule:
   * If the cart contains:
   * - at least one rental product
   * AND
   * - at least one non-rental product
   *
   * Toolshop should apply exactly 15% combination discount.
   */
  test(
    'FIN-007 | rental + non-rental mix applies the exact 15% combination discount',

    // async means this test contains asynchronous operations such as API calls.
    // request is Playwright's APIRequestContext used to send HTTP requests.
    async ({ request }) => {

      // Find one real rental product dynamically.
      // await waits until product discovery is completed.
      const rental = await findRentalProduct(request);

      // Find one real normal/non-rental product dynamically.
      const nonRental = await findNonEcoNonRentalProduct(request);

      // Create a fresh cart for this test.
      // cartId stores the unique ID returned by Toolshop.
      const cartId = await createCart(request);

      // Add quantity 1 of the rental product into the cart.
      //
      // Parameters:
      // request   -> Playwright API request object.
      // cartId    -> target cart ID.
      // rental.id -> rental product ID.
      // 1         -> quantity.
      await addItemToCart(
        request,
        cartId,
        rental.id,
        1
      );

      // Add quantity 1 of the non-rental product.
      // Now the cart contains both rental and non-rental product types.
      await addItemToCart(
        request,
        cartId,
        nonRental.id,
        1
      );

      // Retrieve the latest cart data from Toolshop.
      //
      // getCart() returns an object similar to:
      // {
      //   status: 200,
      //   body: { ...cart details... }
      // }
      //
      // { body: cart } means:
      // take the "body" property and store it in a variable named "cart".
      const { body: cart } =
        await getCart(request, cartId);

      // Validate the business rule.
      //
      // Actual:
      // cart.additional_discount_percentage
      //
      // Expected:
      // 15
      //
      // Rental + non-rental should apply exactly 15%.
      expect(
        cart.additional_discount_percentage
      ).toBe(15);
    }
  );


  /**
   * FIN-008
   *
   * Negative business-rule test.
   *
   * If the cart contains only one product type,
   * the 15% combination discount must NOT be applied.
   */
  test(
    'FIN-008 | a single-product-type cart has no combination discount',
    async ({ request }) => {

      // Find a normal product that is not rental and not eco-friendly.
      const nonRental =
        await findNonEcoNonRentalProduct(request);

      // Create a fresh cart.
      const cartId =
        await createCart(request);

      // Add quantity 2 of the SAME non-rental product.
      //
      // Quantity 2 does not mean two product types.
      // The cart still contains only one type: non-rental.
      await addItemToCart(
        request,
        cartId,
        nonRental.id,
        2
      );

      // Retrieve the latest cart state.
      const { body: cart } =
        await getCart(request, cartId);

      // Verify combination discount is not present.
      //
      // toBeFalsy() accepts values such as:
      // null, undefined, false, or 0.
      expect(
        cart.additional_discount_percentage
      ).toBeFalsy();
    }
  );


  /**
   * FIN-009
   *
   * State Transition test.
   *
   * Initial state:
   * rental + non-rental -> 15% discount.
   *
   * Action:
   * remove rental product.
   *
   * Final state:
   * only non-rental remains -> discount should disappear.
   */
  test(
    'FIN-009 | removing the rental item removes the combination discount',
    async ({ request }) => {

      // Find one rental product.
      const rental =
        await findRentalProduct(request);

      // Find one non-rental product.
      const nonRental =
        await findNonEcoNonRentalProduct(request);

      // Create a new cart.
      const cartId =
        await createCart(request);

      // Add rental product.
      await addItemToCart(
        request,
        cartId,
        rental.id,
        1
      );

      // Add non-rental product.
      await addItemToCart(
        request,
        cartId,
        nonRental.id,
        1
      );

      // Retrieve cart before removing anything.
      const { body: mixedCart } =
        await getCart(request, cartId);

      // Verify initial state first.
      // Rental + non-rental must have 15% discount.
      expect(
        mixedCart.additional_discount_percentage
      ).toBe(15);

      // Remove the rental product from the cart.
      await removeCartItem(
        request,
        cartId,
        rental.id
      );

      // Retrieve cart again after removal.
      const { body: afterRemoval } =
        await getCart(request, cartId);

      // Verify the discount has disappeared.
      //
      // This proves the cart changed from:
      // discounted state -> non-discounted state.
      expect(
        afterRemoval.additional_discount_percentage
      ).toBeFalsy();
    }
  );


  /**
   * FIN-010
   *
   * Eco discount business rule:
   * If MORE THAN 50% of total cart quantity is CO2 A/B / eco-friendly,
   * Toolshop should apply 5% eco discount.
   *
   * Test data:
   * 6 eco + 4 non-eco = 10 total.
   * 6 / 10 = 60%.
   *
   * 60% > 50%, so expected eco discount = 5%.
   */
  test(
    'FIN-010 | eco discount applies (5%) when more than 50% of quantity is CO2 A/B',
    async ({ request }) => {

      // findCo2FriendlyProducts() returns an array.
      //
      // [ecoProduct] is JavaScript array destructuring.
      // It means:
      // take the first product from the returned array
      // and store it in the variable ecoProduct.
      const [ecoProduct] =
        await findCo2FriendlyProducts(request, 1);

      // Find a normal non-eco product.
      const nonEcoProduct =
        await findNonEcoNonRentalProduct(request);

      // Create new cart.
      const cartId =
        await createCart(request);

      // Add 6 eco-friendly units.
      await addItemToCart(
        request,
        cartId,
        ecoProduct.id,
        6
      );

      // Add 4 non-eco units.
      await addItemToCart(
        request,
        cartId,
        nonEcoProduct.id,
        4
      );

      // Cart calculation:
      //
      // eco quantity     = 6
      // non-eco quantity = 4
      // total quantity   = 10
      //
      // eco ratio = 6 / 10 = 60%
      //
      // Because 60% > 50%, 5% eco discount should apply.

      // Complete checkout using reusable helper.
      // The helper returns the real Toolshop invoice response.
      const invoice =
        await checkoutCashOnDelivery(
          request,
          cartId
        );

      // Verify Toolshop applied exactly 5% eco discount.
      expect(
        invoice.eco_discount_percentage
      ).toBe(5);
    }
  );


  /**
   * FIN-011
   *
   * Boundary Value Analysis.
   *
   * Business rule says:
   * eco percentage must be MORE THAN 50%.
   *
   * Therefore exactly 50% should NOT qualify.
   *
   * Test data:
   * 5 eco + 5 non-eco = 10 total.
   * 5 / 10 = exactly 50%.
   */
  test(
    'FIN-011 | eco discount does NOT apply at exactly 50% qualifying quantity',
    async ({ request }) => {

      // Find one eco-friendly product.
      const [ecoProduct] =
        await findCo2FriendlyProducts(request, 1);

      // Find one non-eco product.
      const nonEcoProduct =
        await findNonEcoNonRentalProduct(request);

      // Create new cart.
      const cartId =
        await createCart(request);

      // Add 5 eco units.
      await addItemToCart(
        request,
        cartId,
        ecoProduct.id,
        5
      );

      // Add 5 non-eco units.
      await addItemToCart(
        request,
        cartId,
        nonEcoProduct.id,
        5
      );

      // Calculation:
      //
      // eco = 5
      // total = 10
      //
      // 5 / 10 = 50%
      //
      // Rule is > 50%, not >= 50%.
      // Therefore eco discount must not apply.

      // Complete checkout and obtain Toolshop invoice.
      const invoice =
        await checkoutCashOnDelivery(
          request,
          cartId
        );

      // Verify eco discount is absent.
      expect(
        invoice.eco_discount_percentage
      ).toBeFalsy();
    }
  );


  /**
   * FIN-012
   *
   * Validates exact discount stacking.
   *
   * Business calculation order:
   *
   * Subtotal
   *    ↓
   * 15% combination discount
   *    ↓
   * Remaining amount
   *    ↓
   * 5% eco discount calculated on the REMAINING amount
   *    ↓
   * Final total
   *
   * Example:
   *
   * subtotal = 100
   * 15% of 100 = 15
   * 100 - 15 = 85
   *
   * 5% of 85 = 4.25
   * 85 - 4.25 = 80.75
   *
   * We do NOT simply combine 15% + 5% as one 20% discount.
   */
  test(
    'FIN-012 | exact discount-stacking arithmetic: combination first, then eco discount',
    async ({ request }) => {

      // Find rental product.
      // Rental is needed to trigger combination discount.
      const rental =
        await findRentalProduct(request);

      // Find one eco-friendly product.
      const [ecoProduct] =
        await findCo2FriendlyProducts(request, 1);

      // Create fresh cart.
      const cartId =
        await createCart(request);

      // Add quantity 1 rental product.
      await addItemToCart(
        request,
        cartId,
        rental.id,
        1
      );

      // Add quantity 2 eco products.
      //
      // Total quantity = 3.
      // Eco quantity = 2.
      //
      // 2 / 3 = approximately 66.67%.
      //
      // Therefore eco percentage is > 50%.
      await addItemToCart(
        request,
        cartId,
        ecoProduct.id,
        2
      );

      // Retrieve cart before checkout.
      const { body: cart } =
        await getCart(request, cartId);

      // Confirm 15% combination discount is active.
      expect(
        cart.additional_discount_percentage
      ).toBe(15);

      // Checkout and obtain actual Toolshop invoice.
      const invoice =
        await checkoutCashOnDelivery(
          request,
          cartId
        );

      // invoice.subtotal comes from Toolshop.
      //
      // toCents() normalizes the monetary value to two decimal places.
      const subtotal =
        toCents(invoice.subtotal);

      // Independently calculate expected 15% combination discount.
      //
      // Example:
      // subtotal = 100
      // 100 * 0.15 = 15
      const expectedCombinationAmount =
        toCents(subtotal * 0.15);

      // Calculate remaining amount after the 15% discount.
      //
      // Example:
      // 100 - 15 = 85
      const remainderAfterCombination =
        toCents(
          subtotal - expectedCombinationAmount
        );

      // Calculate expected eco discount from the REMAINING amount.
      //
      // Example:
      // 85 * 0.05 = 4.25
      const expectedEcoAmount =
        toCents(
          remainderAfterCombination * 0.05
        );

      // Calculate final expected amount.
      //
      // Example:
      // 85 - 4.25 = 80.75
      const expectedTotal =
        toCents(
          remainderAfterCombination -
          expectedEcoAmount
        );

      // Verify Toolshop returned 15% combination discount.
      expect(
        invoice.additional_discount_percentage
      ).toBe(15);

      // Verify Toolshop's actual combination-discount amount
      // against our independently calculated expected amount.
      expect(
        toCents(invoice.additional_discount_amount)
      ).toBe(expectedCombinationAmount);

      // Verify Toolshop returned 5% eco discount.
      expect(
        invoice.eco_discount_percentage
      ).toBe(5);

      // Verify Toolshop's actual eco-discount amount
      // against our independently calculated expected amount.
      expect(
        toCents(invoice.eco_discount_amount)
      ).toBe(expectedEcoAmount);

      // Verify final Toolshop invoice total
      // against our independently calculated expected total.
      //
      // This is the final exact money validation.
      expect(
        toCents(invoice.total)
      ).toBe(expectedTotal);
    }
  );
});


/**
 * Reusable helper method:
 * checkoutCashOnDelivery()
 *
 * Purpose:
 * Completes checkout for a given cart and returns the Toolshop invoice.
 *
 * Why use a helper?
 * FIN-010, FIN-011 and FIN-012 all need:
 * - login
 * - valid billing address
 * - invoice creation
 *
 * Keeping this logic here avoids repeating the same code in every test.
 *
 * Parameters:
 *
 * request
 * -> Playwright APIRequestContext used to call REST APIs.
 *
 * cartId
 * -> ID of the cart that should be checked out.
 *
 * Return:
 * -> actual Toolshop InvoiceResponse object.
 */
async function checkoutCashOnDelivery(
  request,
  cartId
) {

  // Login using the standard public Toolshop customer.
  //
  // login() returns something like:
  //
  // {
  //   status: 200,
  //   body: {
  //     access_token: "..."
  //   }
  // }
  //
  // { body: loginBody } means:
  // take the "body" property and rename/store it as loginBody.
  const { body: loginBody } =
    await login(
      request,
      DEMO_CUSTOMER.email,
      DEMO_CUSTOMER.password
    );

  // Build/get a confirmed-valid billing address.
  //
  // The returned object contains billing fields required
  // by POST /invoices.
  const address =
    await buildValidBillingAddress(request);

  // Call Toolshop POST /invoices API.
  //
  // createInvoice() returns:
  //
  // {
  //   status: HTTP status,
  //   body: invoice response
  // }
  //
  // We keep status in variable "status".
  //
  // We rename body to "invoice"
  // because the response body represents the invoice.
  const {
    status,
    body: invoice,
  } = await createInvoice(

    // Playwright API request context.
    request,

    // Bearer token returned after login.
    loginBody.access_token,

    // Invoice request payload.
    {
      // Tell Toolshop which cart should be checked out.
      cart_id: cartId,

      // JavaScript spread operator.
      //
      // ...address copies all billing-address properties
      // into this request object.
      //
      // Example:
      // billing_street
      // billing_city
      // billing_state
      // billing_country
      // billing_postal_code
      ...address,

      // Use cash-on-delivery because these tests focus
      // on discount calculations, not card validation.
      payment_method: 'cash-on-delivery',

      // Cash-on-delivery does not require
      // credit-card/bank/payment details.
      payment_details: {},
    }
  );

  // Validate invoice creation did not return an unexpected status.
  //
  // !== means "not equal to".
  // && means logical AND.
  //
  // Therefore this condition means:
  //
  // IF status is NOT 201
  // AND status is NOT 200
  // THEN treat invoice creation as failed.
  if (status !== 201 && status !== 200) {

    // Stop the test with a meaningful error.
    //
    // ${status} inserts actual HTTP status.
    //
    // JSON.stringify(invoice) converts the invoice/error object
    // into readable JSON text for debugging.
    throw new Error(
      `Invoice creation failed: ${status} ${JSON.stringify(invoice)}`
    );
  }

  // Return actual Toolshop invoice response
  // back to the calling test.
  //
  // Example:
  //
  // const invoice =
  //   await checkoutCashOnDelivery(request, cartId);
  //
  // The caller can then use:
  //
  // invoice.subtotal
  // invoice.total
  // invoice.eco_discount_percentage
  // invoice.additional_discount_amount
  return invoice;
}