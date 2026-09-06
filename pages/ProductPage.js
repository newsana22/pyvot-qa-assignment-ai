// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/** Product detail page (`/product/:id`). Confirmed selectors: ui-reference.md — Product Detail. */
class ProductPage {
  constructor(page) {
    this.page = page;
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.outOfStockLabel = page.getByTestId('out-of-stock');
  }

  async goto(productId) {
    await this.page.goto(`/product/${productId}`);
  }

  async addToCart() {
    await this.addToCartButton.click();
  }
}

module.exports = { ProductPage };
