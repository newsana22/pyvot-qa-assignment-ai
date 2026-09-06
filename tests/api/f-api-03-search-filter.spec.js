// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * F-API-03 | Product search + category/brand filtering
 * Source Scenarios: BROWSE-003, BROWSE-011
 * Technique: Equivalence Partitioning + Decision Table
 * Reference: docs/ai-knowledge/business-rules.md §1; api-reference.md (Products).
 */
const { test, expect } = require('@playwright/test');
const { searchProducts, listProducts } = require('../../utils/apiHelpers');
const { findCategoryWithTwoBrands } = require('../../utils/catalogDiscovery');

test.describe('F-API-03 | Product search + category/brand filtering', () => {
  test('BROWSE-003 | search returns only products matching the query', async ({ request }) => {
    const { status, body } = await searchProducts(request, 'Pliers');

    expect(status).toBe(200);
    expect(body.data.length).toBeGreaterThan(0);
    for (const product of body.data) {
      expect(product.name.toLowerCase()).toContain('pliers');
    }
  });

  test('BROWSE-011 | combined category + brand filter follows confirmed AND semantics', async ({ request }) => {
    const { categoryId, brandId, expectedMatchNames, expectedExcludedNames } =
      await findCategoryWithTwoBrands(request);

    const { status, body } = await listProducts(request, { by_category: categoryId, by_brand: brandId });

    expect(status).toBe(200);
    const returnedNames = body.data.map((product) => product.name);

    // Every result matches BOTH conditions (AND, not a union of either).
    for (const product of body.data) {
      expect(product.category.id).toBe(categoryId);
      expect(product.brand.id).toBe(brandId);
    }
    // The matching product(s) are present...
    for (const expectedName of expectedMatchNames) {
      expect(returnedNames).toContain(expectedName);
    }
    // ...and same-category/different-brand products are correctly excluded.
    for (const excludedName of expectedExcludedNames) {
      expect(returnedNames).not.toContain(excludedName);
    }
  });
});
