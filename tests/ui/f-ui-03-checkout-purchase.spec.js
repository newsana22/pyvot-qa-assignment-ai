// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * F-UI-03 | Logged-in Cart -> Checkout -> Credit Card -> Order Confirmation
 *
 * Source Scenarios:
 * CKO-001, CKO-027
 *
 * Technique:
 * State Transition
 *
 * PRIMARY SOURCES OF TRUTH:
 *
 * sprint5/UI/src/app/checkout/payment/payment.component.html
 * sprint5/UI/src/app/checkout/payment/payment.component.ts
 *
 * Supporting references:
 *
 * docs/ai-knowledge/business-rules.md §8-11
 * docs/ai-knowledge/user-flows.md §11
 * docs/ai-knowledge/ui-reference.md
 *
 * MANUALLY VERIFIED CLEAN FLOW:
 *
 * Logged-in customer
 *       ↓
 * Product added to cart
 *       ↓
 * Cart
 *       ↓
 * Checkout sign-in step
 *       ↓
 * Billing address
 *       ↓
 * Credit-card payment
 *       ↓
 * Confirm #1
 *       ↓
 * POST /payment/check
 *       ↓
 * HTTP 200
 *       ↓
 * Confirm #2
 *       ↓
 * POST /invoices
 *       ↓
 * HTTP 201
 *       ↓
 * Order confirmation displayed
 *       ↓
 * Generated invoice number displayed
 *
 * IMPORTANT MANUAL VALIDATION FINDING:
 *
 * The earlier automation clicked Finish only once and immediately
 * expected #order-confirmation.
 *
 * Manual CLEAN execution proved that two separate confirmation
 * transitions are required:
 *
 * Confirm #1 -> payment validation
 * Confirm #2 -> invoice creation
 *
 * Therefore the earlier automation failure was an automation workflow
 * issue and NOT a confirmed CLEAN application defect.
 *
 * CKO-027 also contains a cart-cleared-after-purchase expectation.
 * That specific behavior is not asserted here because it was not part
 * of the approved confirmed assertion scope.
 */

const { test, expect } = require('../../fixtures/apiFixture');

const { LoginPage } = require('../../pages/LoginPage');
const { ProductPage } = require('../../pages/ProductPage');
const { HeaderComponent } = require('../../pages/HeaderComponent');
const { CartPage } = require('../../pages/CartPage');
const { CheckoutPage } = require('../../pages/CheckoutPage');

const {
  findInStockProduct,
} = require('../../utils/catalogDiscovery');

const {
  DEMO_CUSTOMER,
} = require('../../data/testUsers');

/*
 * External checkout/payment test data.
 *
 * Test data is intentionally kept outside the spec so that:
 *
 * - the test contains business workflow rather than raw data;
 * - payment values can be reused;
 * - data changes do not require changing test logic.
 */
const {
  validCreditCardCase,
  validBillingAddress,
} = require('../../data/checkoutTestData');


test.describe(
  'F-UI-03 | Logged-in checkout -> credit card -> confirmation',
  () => {

    test(
      'CKO-001 + CKO-027 | authenticated user completes checkout and sees the order confirmation',
      async ({ page, apiRequest }) => {

        /*
         * ============================================================
         * ARRANGE — DISCOVER A REAL IN-STOCK PRODUCT
         * ============================================================
         *
         * Product data is discovered dynamically from the CLEAN API.
         *
         * We do not hardcode a product ID because catalog data may
         * change between executions.
         */
        const product = await findInStockProduct(apiRequest);


        /*
         * ============================================================
         * ARRANGE — LOGIN
         * ============================================================
         *
         * Authentication data is externalized in:
         *
         * data/testUsers.js
         */
        const loginPage = new LoginPage(page);

        await loginPage.goto();

        await loginPage.login(
          DEMO_CUSTOMER.email,
          DEMO_CUSTOMER.password
        );


        /*
         * BUSINESS ASSERTION — AUTHENTICATION
         *
         * A successful login should navigate the customer into the
         * authenticated account area.
         */
        await expect(page).toHaveURL(/\/account/);


        /*
         * ============================================================
         * ACT — OPEN THE DISCOVERED PRODUCT
         * ============================================================
         */
        const productPage = new ProductPage(page);
        const header = new HeaderComponent(page);

        await productPage.goto(product.id);


        /*
         * BUSINESS ASSERTION — PRODUCT IS AVAILABLE
         *
         * The dynamically selected product is expected to be in stock,
         * therefore Add to Cart must be enabled.
         */
        await expect(
          productPage.addToCartButton
        ).toBeEnabled();


        /*
         * ACT — ADD PRODUCT TO CART
         */
        await productPage.addToCart();


        /*
         * BUSINESS ASSERTION — CART UPDATED
         */
        await expect(
          header.cartQuantity
        ).toHaveText('1');


        /*
         * ============================================================
         * ACT — CART
         * ============================================================
         */
        const cartPage = new CartPage(page);

        await cartPage.goto();


        /*
         * BUSINESS ASSERTION — CHECKOUT AVAILABLE
         */
        await expect(
          cartPage.proceedButton
        ).toBeEnabled();


        /*
         * Move from Cart to Checkout.
         */
        await cartPage.proceedToCheckout();


        /*
         * ============================================================
         * ACT — CHECKOUT SIGN-IN STEP
         * ============================================================
         *
         * The customer is already logged in, therefore the checkout
         * wizard presents the authenticated Proceed to checkout action.
         */
        const checkoutPage = new CheckoutPage(page);

        await checkoutPage.proceedFromSignIn();


        /*
         * ============================================================
         * ACT — BILLING ADDRESS
         * ============================================================
         *
         * Billing data is externalized in:
         *
         * data/checkoutTestData.js
         *
         * CheckoutPage.completeBillingAddress() waits for the real
         * postcode-lookup request instead of using a hard wait.
         */
        await checkoutPage.completeBillingAddress({
          country: validBillingAddress.country,
          postalCode: validBillingAddress.postalCode,
          houseNumber: validBillingAddress.houseNumber,
        });


        /*
         * ============================================================
         * ACT — SELECT PAYMENT METHOD
         * ============================================================
         */
        await checkoutPage.chooseCreditCard();


        /*
         * ============================================================
         * ACT — ENTER VALID CREDIT-CARD DATA
         * ============================================================
         *
         * Card data is externalized in:
         *
         * data/checkoutTestData.js
         *
         * CLEAN payment validation requires:
         *
         * Card number:
         * XXXX-XXXX-XXXX-XXXX
         *
         * Expiration:
         * future MM/YYYY
         *
         * CVV:
         * 3 or 4 digits
         *
         * Card-holder name:
         * letters and spaces
         */
        await checkoutPage.enterCardDetails({
          number:
            validCreditCardCase.paymentDetails.credit_card_number,

          expiration:
            validCreditCardCase.paymentDetails.expiration_date,

          cvv:
            validCreditCardCase.paymentDetails.cvv,

          holderName:
            validCreditCardCase.paymentDetails.card_holder_name,
        });


        /*
         * ============================================================
         * ACT — CONFIRM #1
         * PAYMENT VALIDATION
         * ============================================================
         *
         * Manual CLEAN execution confirmed:
         *
         * First Confirm
         *       ↓
         * POST /payment/check
         *       ↓
         * HTTP 200
         *
         * Promise.all registers the network listener BEFORE the click.
         *
         * This prevents Playwright from missing a fast response.
         */
        const [paymentResponse] = await Promise.all([

          page.waitForResponse(
            (response) =>
              response.url().includes('/payment/check') &&
              response.request().method() === 'POST'
          ),

          checkoutPage.finish(),
        ]);


        /*
         * BUSINESS ASSERTION — PAYMENT SUCCESS
         */
        expect(
          paymentResponse.status()
        ).toBe(200);


        /*
         * ============================================================
         * ACT — CONFIRM #2
         * INVOICE / ORDER CREATION
         * ============================================================
         *
         * Manual CLEAN execution confirmed:
         *
         * Second Confirm
         *       ↓
         * POST /invoices
         *       ↓
         * HTTP 201 Created
         */
        const [invoiceResponse] = await Promise.all([

          page.waitForResponse(
            (response) =>
              response.url().endsWith('/invoices') &&
              response.request().method() === 'POST'
          ),

          checkoutPage.finish(),
        ]);


        /*
         * BUSINESS ASSERTION — INVOICE CREATED
         */
        expect(
          invoiceResponse.status()
        ).toBe(201);


        /*
         * Read the actual invoice response returned by the CLEAN API.
         */
        const invoiceBody = await invoiceResponse.json();


        /*
         * BUSINESS ASSERTION — API GENERATED INVOICE NUMBER
         *
         * Example:
         *
         * INV-2026000019
         *
         * The value itself is dynamic, so we validate the business
         * format rather than hardcoding an invoice number.
         */
        expect(
          invoiceBody.invoice_number
        ).toMatch(/^INV-\d+$/);


        /*
         * ============================================================
         * BUSINESS ASSERTION — ORDER CONFIRMATION
         * ============================================================
         *
         * Confirmed CLEAN locator:
         *
         * id="order-confirmation"
         *
         * The confirmation should be visible only after successful
         * invoice creation.
         */
        await expect(
          checkoutPage.orderConfirmation
        ).toBeVisible();


        /*
         * BUSINESS ASSERTION — INVOICE NUMBER FORMAT ON UI
         */
        await expect(
          checkoutPage.orderConfirmation
        ).toContainText(/INV-\d+/);


        /*
         * ============================================================
         * CROSS-LAYER ASSERTION — API -> UI
         * ============================================================
         *
         * Do not merely prove that some invoice number appears.
         *
         * Validate that the exact invoice number generated by:
         *
         * POST /invoices
         *
         * is the same invoice number displayed to the customer.
         *
         * This provides meaningful API-to-UI validation.
         */
        await expect(
          checkoutPage.orderConfirmation
        ).toContainText(
          invoiceBody.invoice_number
        );
      }
    );
  }
);