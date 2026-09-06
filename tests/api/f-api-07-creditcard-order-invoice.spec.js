// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * F-API-07 | Credit-card payment + order creation + invoice contract
 * Source Scenarios: CKO-016, CKO-025, CKO-026
 * Technique: Equivalence Partitioning
 * Reference: docs/ai-knowledge/business-rules.md §10-11; api-reference.md (Invoices, Payment).
 */
const { test, expect } = require('@playwright/test');
const { login, createCart, addItemToCart, buildValidBillingAddress, createInvoice } = require('../../utils/apiHelpers');
const { findInStockProduct } = require('../../utils/catalogDiscovery');
const { DEMO_CUSTOMER } = require('../../data/testUsers');

test.describe('F-API-07 | Credit-card payment + order creation + invoice contract', () => {
  test('CKO-016 + CKO-025 + CKO-026 | valid credit card creates an order with a well-formed invoice number', async ({
    request,
  }) => {
    const { body: loginBody } = await login(request, DEMO_CUSTOMER.email, DEMO_CUSTOMER.password);
    const product = await findInStockProduct(request);
    const cartId = await createCart(request);
    await addItemToCart(request, cartId, product.id, 1);
    const address = await buildValidBillingAddress(request);

    const { status, body: invoice } = await createInvoice(request, loginBody.access_token, {
      cart_id: cartId,
      ...address,
      payment_method: 'credit-card',
      payment_details: {
        credit_card_number: '4111-1111-1111-1111',
        expiration_date: '12/2030',
        cvv: '123',
        card_holder_name: 'Test User',
      },
    });

    // CKO-016 + CKO-025: order/invoice created successfully for a valid credit-card payment.
    expect(status).toBe(201);
    expect(invoice.id).toBeTruthy();
    expect(invoice.total).toBeGreaterThan(0);

    // CKO-026: invoice number matches `INV-{year}` + zero-padded sequence, 14 characters total.
    expect(invoice.invoice_number).toMatch(/^INV-\d{10}$/);
    expect(invoice.invoice_number).toHaveLength(14);
    expect(invoice.invoice_number.startsWith(`INV-${new Date().getUTCFullYear()}`)).toBe(true);
  });
});
