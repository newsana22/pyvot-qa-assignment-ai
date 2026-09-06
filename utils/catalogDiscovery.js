// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * Discovers real catalog data needed by tests, instead of hardcoding dynamic/
 * environment-specific product, category, or brand IDs (see
 * .github/instructions/playwright-best-practices.instructions.md — Dynamic Test Data).
 */

const { listProducts } = require('./apiHelpers');

/** Fetches every product across all pages (small catalog; safe to page through fully). */
async function fetchAllProducts(request) {
  const all = [];
  let page = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { body } = await listProducts(request, { page });
    all.push(...body.data);
    if (page >= body.last_page) break;
    page += 1;
  }
  return all;
}

/** Finds a category that contains products from at least two different brands (for BROWSE-011). */
async function findCategoryWithTwoBrands(request) {
  const products = await fetchAllProducts(request);
  const byCategory = new Map();
  for (const product of products) {
    const key = product.category.id;
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key).push(product);
  }
  for (const [categoryId, items] of byCategory) {
    const brandIds = new Set(items.map((item) => item.brand.id));
    if (brandIds.size >= 2) {
      const brandId = items[0].brand.id;
      const matching = items.filter((item) => item.brand.id === brandId);
      const nonMatching = items.filter((item) => item.brand.id !== brandId);
      return {
        categoryId,
        brandId,
        expectedMatchNames: matching.map((item) => item.name),
        expectedExcludedNames: nonMatching.map((item) => item.name),
      };
    }
  }
  throw new Error('No category with two distinct brands found in the catalog.');
}

/** Finds one confirmed rental product (is_rental = true). */
async function findRentalProduct(request) {
  const { body } = await listProducts(request, { is_rental: true });
  if (!body.data.length) throw new Error('No rental product found in the catalog.');
  return body.data[0];
}

/** Finds `count` non-rental products with a confirmed eco-friendly CO2 rating (A or B). */
async function findCo2FriendlyProducts(request, count = 1) {
  const products = await fetchAllProducts(request);
  const matches = products.filter((p) => !p.is_rental && ['A', 'B'].includes(p.co2_rating));
  if (matches.length < count) throw new Error('Not enough CO2 A/B products found in the catalog.');
  return matches.slice(0, count);
}

/** Finds one non-rental, non-CO2-A/B product (for building a "non-qualifying" cart mix). */
async function findNonEcoNonRentalProduct(request) {
  const products = await fetchAllProducts(request);
  const match = products.find((p) => !p.is_rental && !['A', 'B'].includes(p.co2_rating) && p.in_stock);
  if (!match) throw new Error('No non-eco, in-stock, non-rental product found.');
  return match;
}

/** Finds one in-stock, non-rental product (happy-path add-to-cart). */
async function findInStockProduct(request) {
  const products = await fetchAllProducts(request);
  const match = products.find((p) => p.in_stock && !p.is_rental);
  if (!match) throw new Error('No in-stock, non-rental product found.');
  return match;
}

/** Finds one out-of-stock, non-rental product (PROD-009 business rule). */
async function findOutOfStockProduct(request) {
  const products = await fetchAllProducts(request);
  const match = products.find((p) => !p.in_stock && !p.is_rental);
  if (!match) throw new Error('No out-of-stock, non-rental product found.');
  return match;
}

/** Finds one product flagged as a location offer (is_location_offer = true). */
async function findLocationOfferProduct(request) {
  const products = await fetchAllProducts(request);
  const match = products.find((p) => p.is_location_offer);
  if (!match) throw new Error('No location-offer product found in the catalog.');
  return match;
}

module.exports = {
  fetchAllProducts,
  findCategoryWithTwoBrands,
  findRentalProduct,
  findCo2FriendlyProducts,
  findNonEcoNonRentalProduct,
  findInStockProduct,
  findOutOfStockProduct,
  findLocationOfferProduct,
};
