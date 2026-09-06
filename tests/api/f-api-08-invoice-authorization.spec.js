// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * F-API-08 | Invoice authorization / IDOR protection
 * Source Scenarios: INV-007, INV-008, INV-009
 * Technique: Decision Table
 * Reference: docs/ai-knowledge/business-rules.md §12; api-reference.md (Invoices).
 */
const { test, expect } = require('@playwright/test');
const {
  login,
  register,
  createCart,
  addItemToCart,
  buildValidBillingAddress,
  createInvoice,
  getInvoice,
} = require('../../utils/apiHelpers');
const { findInStockProduct } = require('../../utils/catalogDiscovery');
const { DEMO_CUSTOMER, buildRegistrationPayload } = require('../../data/testUsers');

/** Registers a brand-new user, logs in, and creates one real invoice owned by that user. */
async function createInvoiceForFreshUser(request) {
  const registration = buildRegistrationPayload();
  await register(request, registration);
  const { body: loginBody } = await login(request, registration.email, registration.password);

  const product = await findInStockProduct(request);
  const cartId = await createCart(request);
  await addItemToCart(request, cartId, product.id, 1);
  const address = await buildValidBillingAddress(request);

  const { body: invoice } = await createInvoice(request, loginBody.access_token, {
    cart_id: cartId,
    ...address,
    payment_method: 'cash-on-delivery',
    payment_details: {},
  });
  return invoice;
}

test.describe('F-API-08 | Invoice authorization / IDOR protection', () => {
  test('INV-007 | a non-existent invoice id is not returned (404)', async ({ request }) => {
    const { body: loginBody } = await login(request, DEMO_CUSTOMER.email, DEMO_CUSTOMER.password);

    const { status } = await getInvoice(request, loginBody.access_token, '01NONEXISTENTINVOICEID0000');

    expect(status).toBe(404);
  });

  test('INV-008 | another authenticated non-admin user cannot view someone else\'s invoice', async ({ request }) => {
    const ownerInvoice = await createInvoiceForFreshUser(request);
    const otherUserRegistration = buildRegistrationPayload();
    await register(request, otherUserRegistration);
    const { body: otherLogin } = await login(request, otherUserRegistration.email, otherUserRegistration.password);

    const { status } = await getInvoice(request, otherLogin.access_token, ownerInvoice.id);

    expect(status).not.toBe(200);
  });

  test('INV-009 | an admin can view another user\'s invoice', async ({ request }) => {
    const ownerInvoice = await createInvoiceForFreshUser(request);
    const { body: adminLogin } = await login(request, 'admin@practicesoftwaretesting.com', 'welcome01');

    const { status, body } = await getInvoice(request, adminLogin.access_token, ownerInvoice.id);

    expect(status).toBe(200);
    expect(body.id).toBe(ownerInvoice.id);
  });
});
