// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * Round a monetary value to 2 decimal places for exact-cent comparison.
 * The API's raw `total`/discount fields can carry IEEE-754 floating-point noise
 * (e.g. 129.89445000000003) even though the underlying business rule is exact
 * to the cent. Rounding here is precision cleanup, not an approximate assertion.
 */
function toCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

module.exports = { toCents };
