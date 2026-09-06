// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * Account — Invoice Detail Page
 *
 * Route:
 * /account/invoices/:id
 *
 * Reference:
 * docs/ai-knowledge/ui-reference.md — Account — Invoices
 */
class InvoicePage {
  constructor(page) {
    this.page = page;

    this.invoiceNumber = page.getByTestId('invoice-number');

    /*
     * FINAL INVOICE TOTAL LOCATOR
     *
     * SOURCE OF TRUTH:
     * CLEAN Sprint 5 invoice-detail UI / observed CLEAN DOM.
     *
     * During F-UI-04 execution, Playwright reported that:
     *
     *   getByTestId('total')
     *
     * resolves to three different readonly input elements:
     *
     * 1. id="subtotal"
     *    data-test="total"
     *
     * 2. id="additional_discount_percentage"
     *    data-test="total"
     *
     * 3. id="total"
     *    data-test="total"
     *
     * Because Playwright locators are strict, getByTestId('total')
     * cannot safely identify the final invoice total and causes:
     *
     *   strict mode violation
     *
     * The actual FINAL TOTAL field is uniquely identified in the
     * CLEAN UI as:
     *
     *   id="total"
     *
     * Therefore we intentionally use:
     *
     *   page.locator('#total')
     *
     * instead of:
     *
     *   page.getByTestId('total')
     *
     * We also deliberately do NOT use first(), last(), or nth()
     * because positional selection would only hide the duplicated
     * data-test problem and make the automation fragile.
     *
     * This is an AUTOMATION LOCATOR CORRECTION.
     * The expected financial/business assertion in F-UI-04 remains
     * unchanged.
     */
    this.total = page.locator('#total');

    this.ecoDiscount = page.getByTestId('eco-discount');

    this.paymentMethod = page.getByTestId('payment-method');
  }

  /*
   * Opens the invoice-detail page for the supplied invoice ID.
   *
   * invoiceId:
   * The identifier of the invoice created or selected by the test.
   */
  async goto(invoiceId) {
    await this.page.goto(`/account/invoices/${invoiceId}`);
  }
}

module.exports = { InvoicePage };