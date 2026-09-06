// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/** Header/nav bar, present on every page. Confirmed selectors: ui-reference.md — Header / Navigation. */
class HeaderComponent {
  constructor(page) {
    this.page = page;
    this.cartLink = page.getByTestId('nav-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.userMenu = page.getByTestId('nav-menu');
    this.signInLink = page.getByTestId('nav-sign-in');
  }
}

module.exports = { HeaderComponent };
