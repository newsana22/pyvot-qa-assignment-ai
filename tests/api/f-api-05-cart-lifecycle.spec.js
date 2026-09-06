// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * F-API-05 | Cart lifecycle — add -> read/update -> remove
 * Source Scenarios: CART-002, CART-008, CART-009, CART-011, CART-014
 * Technique: Equivalence Partitioning + State Transition
 * Reference: docs/ai-knowledge/business-rules.md §4-6; api-reference.md (Cart).
 */
const { test, expect } = require('@playwright/test');
const {
  createCart,
  addItemToCart,
  getCart,
  updateCartItemQuantity,
  removeCartItem,
} = require('../../utils/apiHelpers');
const { findInStockProduct } = require('../../utils/catalogDiscovery');

test.describe('F-API-05 | Cart lifecycle', () => {
  test('CART-002 | valid product/quantity is added to the cart', async ({ request }) => {
    const product = await findInStockProduct(request);
    const cartId = await createCart(request);

    const { status } = await addItemToCart(request, cartId, product.id, 2);
    expect(status).toBe(200);

    const { body: cart } = await getCart(request, cartId);
    const item = cart.cart_items.find((cartItem) => cartItem.product_id === product.id);
    expect(item.quantity).toBe(2);
  });

  test('CART-008 | adding the same product again increments the existing line (no duplicate)', async ({
    request,
  }) => {
    const product = await findInStockProduct(request);
    const cartId = await createCart(request);

    await addItemToCart(request, cartId, product.id, 2);
    await addItemToCart(request, cartId, product.id, 3);

    const { body: cart } = await getCart(request, cartId);
    const matchingLines = cart.cart_items.filter((cartItem) => cartItem.product_id === product.id);

    expect(matchingLines).toHaveLength(1);
    expect(matchingLines[0].quantity).toBe(5);
  });

  test('CART-009 | GET /carts/{id} returns items and discount fields', async ({ request }) => {
    const product = await findInStockProduct(request);
    const cartId = await createCart(request);
    await addItemToCart(request, cartId, product.id, 1);

    const { status, body: cart } = await getCart(request, cartId);

    expect(status).toBe(200);
    expect(cart).toHaveProperty('additional_discount_percentage');
    expect(cart.cart_items.length).toBeGreaterThan(0);
  });

  test('CART-011 | updating quantity recalculates the cart-item state', async ({ request }) => {
    const product = await findInStockProduct(request);
    const cartId = await createCart(request);
    await addItemToCart(request, cartId, product.id, 1);

    const { status } = await updateCartItemQuantity(request, cartId, product.id, 7);
    expect(status).toBe(200);

    const { body: cart } = await getCart(request, cartId);
    const item = cart.cart_items.find((cartItem) => cartItem.product_id === product.id);
    expect(item.quantity).toBe(7);
  });

  test('CART-014 | removing an item deletes the line from the cart', async ({ request }) => {
    const product = await findInStockProduct(request);
    const cartId = await createCart(request);
    await addItemToCart(request, cartId, product.id, 1);

    const { status } = await removeCartItem(request, cartId, product.id);
    expect(status).toBe(204);

    const { body: cart } = await getCart(request, cartId);
    const item = cart.cart_items.find((cartItem) => cartItem.product_id === product.id);
    expect(item).toBeUndefined();
  });
});
