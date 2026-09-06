// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * F-UI-02 | Browse / Product -> Add to Cart
 * Source Scenarios: PROD-008, PROD-009
 * Technique: Equivalence Partitioning
 * Reference: docs/ai-knowledge/business-rules.md §3; ui-reference.md — Product Detail.
 *
 * Product ids are discovered via the API (not hardcoded) so the same test remains valid
 * regardless of which environment (CLEAN/BUGGY) it points at.
 */
const { test, expect } = require('../../fixtures/apiFixture');
const { ProductPage } = require('../../pages/ProductPage');
const { HeaderComponent } = require('../../pages/HeaderComponent');
const { findInStockProduct, findOutOfStockProduct } = require('../../utils/catalogDiscovery');

test.describe('F-UI-02 | Browse/Product -> Add to Cart', () => {
  test('PROD-008 | a valid in-stock product can be added to the cart with visible confirmation', async ({
    page,
    apiRequest,
  }) => {
    const product = await findInStockProduct(apiRequest);
    const productPage = new ProductPage(page);
    const header = new HeaderComponent(page);

    await productPage.goto(product.id);
    await expect(productPage.addToCartButton).toBeEnabled();

    await productPage.addToCart();

    // Confirmed observable outcome: the header cart badge reflects the added item.
    await expect(header.cartQuantity).toBeVisible();
    await expect(header.cartQuantity).toHaveText('1');
  });

  test('PROD-009 | an out-of-stock, non-rental product disables Add to Cart and shows the out-of-stock label', async ({
    page,
    apiRequest,
  }) => {
    const product = await findOutOfStockProduct(apiRequest);
    const productPage = new ProductPage(page);

    await productPage.goto(product.id);

    await expect(productPage.outOfStockLabel).toBeVisible();
    await expect(productPage.addToCartButton).toBeDisabled();
  });
});
