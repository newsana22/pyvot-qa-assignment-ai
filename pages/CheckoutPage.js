// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

const { expect } = require('@playwright/test');

/**
 * Checkout — billing address + payment steps (same `/checkout` route, multi-step wizard).
 * Confirmed selectors: ui-reference.md — Checkout — Address Step / Payment Step.
 */
class CheckoutPage {
  constructor(page) {
    this.page = page;

    // Sign-in step (already-logged-in branch — no confirmed data-test for this button;
    // role + accessible name is the correct locator per the locator priority order).
    this.proceedFromSignInButton = page.getByRole('button', { name: 'Proceed to checkout' });

    // Address step
    this.country = page.getByTestId('country');
    this.postalCode = page.getByTestId('postal_code');
    this.houseNumber = page.getByTestId('house_number');
    this.street = page.getByTestId('street');
    this.city = page.getByTestId('city');
    this.state = page.getByTestId('state');
    this.proceedAddress = page.getByTestId('proceed-3');

    // Payment step
    this.paymentMethod = page.getByTestId('payment-method');
    this.creditCardNumber = page.getByTestId('credit_card_number');
    this.expirationDate = page.getByTestId('expiration_date');
    this.cvv = page.getByTestId('cvv');
    this.cardHolderName = page.getByTestId('card_holder_name');
    this.finishButton = page.getByTestId('finish');
    this.orderConfirmation = page.locator('#order-confirmation');
  }

  /** Already-logged-in users see an inline message on the sign-in step with its own proceed action. */
  async proceedFromSignIn() {
    await this.proceedFromSignInButton.click();
  }

  /**
   * The account pre-fills street/city/state (business-rules.md §9) but NOT country/postal
   * code/house number, which remain required for the form to become valid. Selecting the
   * account's own country (confirmed via the pre-filled city) and a postal code/house number
   * triggers the real postcode-lookup autofill (docs/postcode-lookup.md), which keeps the
   * final address internally self-consistent for the server-side AddressMatchesCountry check.
   */
  async completeBillingAddress({ country, postalCode, houseNumber }) {
    await this.country.selectOption({ label: country });
    const lookupResponse = this.page.waitForResponse(
      (response) => response.url().includes('/postcode-lookup') && response.request().method() === 'GET'
    );
    await this.postalCode.fill(postalCode);
    await this.houseNumber.fill(houseNumber);
    // Wait for the real postcode-lookup call to resolve (debounced) instead of racing on the
    // pre-filled (stale) street value, then wait for the resulting form-valid state.
    await lookupResponse;
    await expect(this.street).not.toHaveValue('');
    await expect(this.proceedAddress).toBeEnabled();
    await this.proceedAddress.click();
  }

  async chooseCreditCard() {
    await this.paymentMethod.selectOption({ value: 'credit-card' });
  }

  async enterCardDetails({ number, expiration, cvv, holderName }) {
    await this.creditCardNumber.fill(number);
    await this.expirationDate.fill(expiration);
    await this.cvv.fill(cvv);
    await this.cardHolderName.fill(holderName);
  }

  async finish() {
    await this.finishButton.click();
  }
}

module.exports = { CheckoutPage };
