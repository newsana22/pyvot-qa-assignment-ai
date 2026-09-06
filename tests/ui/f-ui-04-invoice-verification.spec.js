// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * F-UI-04 | Invoice detail + customer-visible financial verification
 * Source Scenarios: INV-003, INV-005
 * Technique: Equivalence Partitioning + Financial Verification
 * Reference: docs/ai-knowledge/business-rules.md §6, §12; user-flows.md §16; ui-reference.md.
 *
 * API setup is used to create the invoice (an optimization, not a substitute for browser
 * validation — see .github/instructions/playwright-best-practices.instructions.md); the actual
 * assertion is the customer-visible rendering of the exact confirmed total on the real page.
 */
const { test, expect } = require('../../fixtures/apiFixture');
const { LoginPage } = require('../../pages/LoginPage');
const { InvoicePage } = require('../../pages/InvoicePage');
const {
  login,
  createCart,
  addItemToCart,
  buildValidBillingAddress,
  createInvoice,
} = require('../../utils/apiHelpers');
const { findRentalProduct, findCo2FriendlyProducts } = require('../../utils/catalogDiscovery');
const { toCents } = require('../../utils/money');
const { DEMO_CUSTOMER } = require('../../data/testUsers');

test.describe('F-UI-04 | Invoice detail + financial verification', () => {
  test('INV-003 + INV-005 | invoice detail renders the exact confirmed discounted total', async ({
    page,
    apiRequest,
  }) => {
    // Arrange (API): build a rental + eco-friendly cart so both the combination and eco
    // discounts are exercised (same confirmed formula as F-API-10 / FIN-012), then check out.
    const { body: loginBody } = await login(apiRequest, DEMO_CUSTOMER.email, DEMO_CUSTOMER.password);
    const rental = await findRentalProduct(apiRequest);
    const [ecoProduct] = await findCo2FriendlyProducts(apiRequest, 1);
    const cartId = await createCart(apiRequest);
    await addItemToCart(apiRequest, cartId, rental.id, 1);
    await addItemToCart(apiRequest, cartId, ecoProduct.id, 2);
    const address = await buildValidBillingAddress(apiRequest);

    const { body: invoice } = await createInvoice(apiRequest, loginBody.access_token, {
      cart_id: cartId,
      ...address,
      payment_method: 'cash-on-delivery',
      payment_details: {},
    });
    const expectedTotal = toCents(invoice.total);

    // Act: sign in through the real UI and open the invoice detail page in the browser.
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(DEMO_CUSTOMER.email, DEMO_CUSTOMER.password);
    await expect(page).toHaveURL(/\/account/);

    const invoicePage = new InvoicePage(page);
    await invoicePage.goto(invoice.id);

    // Assert: the customer-visible page shows the same invoice and the exact confirmed total.
    // These fields are rendered as readonly <input> elements — their data lives in the value
    // attribute, not text content, so `toHaveValue`/`inputValue()` are the correct checks.
    await expect(invoicePage.invoiceNumber).toHaveValue(invoice.invoice_number);
    const displayedTotal = await invoicePage.total.inputValue();
    expect(parseCurrencyToCents(displayedTotal)).toBe(expectedTotal);

    if (invoice.eco_discount_percentage) {
      await expect(invoicePage.ecoDiscount).toBeVisible();
    }
  });
});

/** Parses a rendered currency string (e.g. "$129.89") into an exact numeric cents-precision value. */
function parseCurrencyToCents(text) {
  const numeric = Number(text.replace(/[^0-9.-]/g, ''));
  return Math.round((numeric + Number.EPSILON) * 100) / 100;
}
