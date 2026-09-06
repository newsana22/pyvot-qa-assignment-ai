// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * F-API-04 | Cart Quantity Boundary Value Analysis
 *
 * Source Scenarios:
 *
 * CART-004 -> quantity 0
 * CART-005 -> quantity 1
 * CART-006 -> quantity 99
 * CART-007 -> quantity 100
 *
 * Technique:
 *
 * Boundary Value Analysis (BVA)
 *
 * ============================================================
 * SOURCE OF TRUTH
 * ============================================================
 *
 * CLEAN Sprint 5:
 *
 * sprint5/API/app/Http/Controllers/CartController.php
 *
 * Quantity validation:
 *
 * 'quantity' => 'required|integer|min:1|max:99'
 *
 * Therefore:
 *
 * 0   -> INVALID -> expected HTTP 422
 * 1   -> VALID   -> expected HTTP 200
 * 99  -> VALID   -> expected HTTP 200
 * 100 -> INVALID -> expected HTTP 422
 *
 * ============================================================
 * MANUALLY VERIFIED CLEAN SWAGGER FLOW
 * ============================================================
 *
 * The manually executed CLEAN Swagger tests used:
 *
 * STEP 1
 *
 * POST /carts
 *
 * Expected:
 *
 * HTTP 201
 *
 * The newly generated cart ID was copied from the response.
 *
 * STEP 2
 *
 * POST /carts/{cartId}
 *
 * Request:
 *
 * {
 *   "product_id": "<valid in-stock product id>",
 *   "quantity": <boundary>
 * }
 *
 * Manual results:
 *
 * quantity 0   -> HTTP 422
 * quantity 100 -> HTTP 422
 *
 * Therefore, the automated test must preserve:
 *
 * POST /carts
 *      ↓
 * fresh cart ID
 *      ↓
 * POST /carts/{cartId}
 *
 * We must NOT replace this flow with:
 *
 * PUT /carts/{id}/product/quantity
 *
 * ============================================================
 * PREVIOUS AUTOMATION RESULT
 * ============================================================
 *
 * After correcting the HTTP operation and dynamically discovering
 * a current in-stock product, the automated execution produced:
 *
 * quantity 0   -> expected 422 -> actual 404
 * quantity 1   -> expected 200 -> actual 200
 * quantity 99  -> expected 200 -> actual 200
 * quantity 100 -> expected 422 -> actual 404
 *
 * This proved:
 *
 * - the current product exists;
 * - POST /carts/{id} works for valid boundaries;
 * - the fresh cart is being created;
 * - valid boundaries 1 and 99 work successfully.
 *
 * However, invalid boundaries 0 and 100 still returned:
 *
 * HTTP 404
 *
 * {
 *   "message": "Resource not found"
 * }
 *
 * instead of the manually confirmed HTTP 422 validation response.
 *
 * ============================================================
 * LATEST INVESTIGATION — CART READINESS
 * ============================================================
 *
 * Manual Swagger execution naturally introduces time between:
 *
 * POST /carts
 *
 * and:
 *
 * POST /carts/{cartId}
 *
 * because the tester copies the generated cart ID and manually
 * executes the second request.
 *
 * Automated execution performs the operations almost immediately.
 *
 * Therefore, this version investigates whether the newly created
 * cart requires a short period before it becomes retrievable.
 *
 * IMPORTANT:
 *
 * We do NOT use a blind fixed sleep.
 *
 * Instead:
 *
 * POST /carts
 *      ↓
 * obtain fresh cart ID
 *      ↓
 * GET /carts/{cartId}
 *      ↓
 * poll until HTTP 200
 *      ↓
 * POST /carts/{cartId}
 *      ↓
 * execute BVA quantity
 *
 * This is condition-based synchronization.
 *
 * Timing/resource readiness is currently only a HYPOTHESIS.
 *
 * We will determine whether it is the cause from the execution
 * evidence rather than assuming it is the root cause.
 */

const {
  test,
  expect,
} = require('@playwright/test');


/*
 * ============================================================
 * API HELPERS
 * ============================================================
 *
 * createCart()
 *
 * POST /carts
 *
 *
 * waitForCartReady()
 *
 * GET /carts/{cartId}
 *
 * Polls until the newly created cart can be retrieved.
 *
 *
 * addItemToCart()
 *
 * POST /carts/{cartId}
 *
 *
 * getCart()
 *
 * GET /carts/{cartId}
 */
const {
  createCart,
  waitForCartReady,
  addItemToCart,
  getCart,
} = require('../../utils/apiHelpers');


/*
 * ============================================================
 * PRODUCT DISCOVERY
 * ============================================================
 *
 * findInStockProduct() dynamically finds a CURRENT in-stock
 * product from the CLEAN environment.
 *
 * We do not hardcode the historical product IDs from the earlier
 * Swagger executions because the remote CLEAN product dataset
 * may change.
 */
const {
  findInStockProduct,
} = require('../../utils/catalogDiscovery');


/*
 * ============================================================
 * EXTERNAL TEST DATA
 * ============================================================
 *
 * data/cartTestData.js contains:
 *
 * scenario ID
 * quantity
 * expected status
 * expected validity
 * expected validation message
 */
const {
  cartQuantityBoundaryCases,
} = require('../../data/cartTestData');


test.describe(
  'F-API-04 | Cart quantity boundaries (0, 1, 99, 100)',
  () => {

    /*
     * Run the same automated workflow for each BVA value:
     *
     * CART-004 -> 0
     * CART-005 -> 1
     * CART-006 -> 99
     * CART-007 -> 100
     */
    for (const boundary of cartQuantityBoundaryCases) {

      test(
        `F-API-04 | ${boundary.id} | quantity ${boundary.quantity} -> ${boundary.expectedStatus}`,
        async ({ request }) => {

          /*
           * ============================================================
           * ARRANGE 1 — DISCOVER CURRENT IN-STOCK PRODUCT
           * ============================================================
           *
           * Dynamically discover a product from the current CLEAN
           * environment.
           */
          const product =
            await findInStockProduct(request);


          /*
           * Product discovery must return an object.
           */
          expect(
            product
          ).toBeDefined();


          /*
           * Product ID is required for:
           *
           * POST /carts/{cartId}
           */
          expect(
            product.id
          ).toBeTruthy();


          /*
           * Log the dynamically selected product.
           */
          console.log(
            `${boundary.id}` +
            ` | selectedProduct=${product.name || 'N/A'}` +
            ` | productId=${product.id}`
          );


          /*
           * ============================================================
           * ARRANGE 2 — CREATE FRESH CART
           * ============================================================
           *
           * This reproduces Step 1 of the successful manual Swagger
           * execution:
           *
           * POST /carts
           */
          const cartId =
            await createCart(request);


          /*
           * A cart ID must have been returned.
           */
          expect(
            cartId
          ).toBeTruthy();


          /*
           * Log the exact fresh cart ID.
           */
          console.log(
            `${boundary.id}` +
            ` | freshCartCreated=${cartId}`
          );


          /*
           * ============================================================
           * ARRANGE 3 — WAIT UNTIL CART IS RETRIEVABLE
           * ============================================================
           *
           * LATEST CHANGE.
           *
           * Before immediately executing:
           *
           * POST /carts/{cartId}
           *
           * confirm that the newly created cart can actually be
           * retrieved through:
           *
           * GET /carts/{cartId}
           *
           * waitForCartReady() polls the endpoint until HTTP 200.
           *
           * Default:
           *
           * maximum attempts = 5
           * interval = 1000 ms
           *
           * This gives us diagnostic evidence about whether the fresh
           * cart requires time before becoming available.
           */
          await waitForCartReady(
            request,
            cartId
          );


          /*
           * ============================================================
           * ACT — ADD PRODUCT USING BOUNDARY QUANTITY
           * ============================================================
           *
           * This reproduces Step 2 of the successful manual Swagger
           * execution:
           *
           * POST /carts/{cartId}
           *
           * Request:
           *
           * {
           *   product_id: product.id,
           *   quantity: boundary.quantity
           * }
           *
           * IMPORTANT:
           *
           * We deliberately do NOT:
           *
           * - pre-add quantity 1;
           * - use PUT /carts/{id}/product/quantity;
           * - hardcode an old product ID.
           */
          const result =
            await addItemToCart(
              request,
              cartId,
              product.id,
              boundary.quantity
            );


          /*
           * ============================================================
           * DIAGNOSTIC EVIDENCE
           * ============================================================
           *
           * Keep this output while investigating the 404 discrepancy.
           *
           * It shows:
           *
           * scenario
           * product
           * product ID
           * cart ID
           * quantity
           * expected status
           * actual status
           * response body
           */
          console.log(
            `${boundary.id}` +
            ` | product=${product.name || 'N/A'}` +
            ` | productId=${product.id}` +
            ` | cartId=${cartId}` +
            ` | quantity=${boundary.quantity}` +
            ` | expected=${boundary.expectedStatus}` +
            ` | actual=${result.status}` +
            ` | body=${JSON.stringify(result.body)}`
          );


          /*
           * ============================================================
           * ASSERT 1 — HTTP STATUS
           * ============================================================
           *
           * BVA expectations:
           *
           * 0   -> 422
           * 1   -> 200
           * 99  -> 200
           * 100 -> 422
           *
           * IMPORTANT:
           *
           * Do NOT change expected 422 to 404 simply to make the
           * automated tests green.
           *
           * CLEAN source and independent Swagger execution already
           * established the expected validation behavior.
           */
          expect(
            result.status
          ).toBe(
            boundary.expectedStatus
          );


          /*
           * ============================================================
           * ASSERT 2 — INVALID BOUNDARIES
           * ============================================================
           *
           * CART-004:
           *
           * quantity = 0
           *
           * CART-007:
           *
           * quantity = 100
           */
          if (
            boundary.expectedValidity === 'INVALID'
          ) {

            /*
             * Response body must exist.
             */
            expect(
              result.body
            ).toBeTruthy();


            /*
             * Validation response must contain a message.
             */
            expect(
              result.body.message
            ).toBeTruthy();


            /*
             * Validate the exact manually confirmed validation text.
             *
             * Quantity 0:
             *
             * "The quantity field must be at least 1."
             *
             * Quantity 100:
             *
             * "The quantity field must not be greater than 99."
             */
            expect(
              result.body.message
            ).toContain(
              boundary.expectedErrorText
            );


            /*
             * Laravel may additionally provide:
             *
             * errors.quantity[]
             *
             * When present, validate that structure as well.
             */
            if (
              result.body.errors &&
              result.body.errors.quantity
            ) {

              expect(
                result.body.errors.quantity
              ).toContain(
                boundary.expectedErrorText
              );
            }
          }


          /*
           * ============================================================
           * ASSERT 3 — VALID BOUNDARIES
           * ============================================================
           *
           * CART-005:
           *
           * quantity = 1
           *
           * CART-006:
           *
           * quantity = 99
           *
           * HTTP 200 alone is not enough.
           *
           * We retrieve the cart and verify that the exact requested
           * quantity was persisted.
           */
          if (
            boundary.expectedValidity === 'VALID'
          ) {

            /*
             * Retrieve the same cart.
             */
            const cartResponse =
              await getCart(
                request,
                cartId
              );


            /*
             * Cart retrieval must succeed.
             */
            expect(
              cartResponse.status
            ).toBe(200);


            /*
             * The response should contain cart_items.
             */
            expect(
              Array.isArray(
                cartResponse.body.cart_items
              )
            ).toBe(true);


            /*
             * Locate the exact product submitted in the POST request.
             */
            const persistedItem =
              cartResponse.body.cart_items.find(
                (cartItem) =>
                  cartItem.product_id === product.id
              );


            /*
             * Product must exist in the cart.
             */
            expect(
              persistedItem
            ).toBeDefined();


            /*
             * ==========================================================
             * CRITICAL BVA PERSISTENCE ASSERTION
             * ==========================================================
             *
             * Quantity must exactly match the accepted boundary:
             *
             * CART-005 -> 1
             * CART-006 -> 99
             */
            expect(
              persistedItem.quantity
            ).toBe(
              boundary.quantity
            );
          }
        }
      );
    }
  }
);