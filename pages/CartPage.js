// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/** Checkout — cart-review step (`/checkout`). Confirmed selectors: ui-reference.md — Checkout — Cart Step. */
class CartPage {
  constructor(page) {
    this.page = page;
    this.proceedButton = page.getByTestId('proceed-1');
  }

  async goto() {
    await this.page.goto('/checkout');
  }

  async proceedToCheckout() {
    await this.proceedButton.click();
  }
}

module.exports = { CartPage };
