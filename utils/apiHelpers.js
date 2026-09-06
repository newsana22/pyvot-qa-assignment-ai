// Copyright (c) 2024-2026 Testsmith. All rights reserved.
// See LICENSE for details.

/**
 * Reusable REST API helpers for Toolshop.
 *
 * These helpers use Playwright's APIRequestContext.
 *
 * Confirmed endpoints/contracts:
 *
 * docs/ai-knowledge/api-reference.md
 * docs/ai-knowledge/business-rules.md
 * docs/postcode-lookup.md
 *
 * ============================================================
 * F-API-04 INVESTIGATION STATUS
 * ============================================================
 *
 * CLEAN source rule:
 *
 * quantity must be:
 *
 * min = 1
 * max = 99
 *
 * Therefore:
 *
 * quantity 0   -> expected HTTP 422
 * quantity 1   -> expected HTTP 200
 * quantity 99  -> expected HTTP 200
 * quantity 100 -> expected HTTP 422
 *
 * Current manual CLEAN Swagger verification:
 *
 * quantity 0   -> HTTP 422
 * quantity 100 -> HTTP 422
 *
 * Current Playwright automation:
 *
 * quantity 0   -> HTTP 404
 * quantity 1   -> HTTP 200
 * quantity 99  -> HTTP 200
 * quantity 100 -> HTTP 404
 *
 * ============================================================
 * CART READINESS INVESTIGATION
 * ============================================================
 *
 * A possible timing/resource-readiness issue was investigated.
 *
 * Automation now performs:
 *
 * POST /carts
 *      ↓
 * obtain fresh cart ID
 *      ↓
 * GET /carts/{id}
 *      ↓
 * confirm HTTP 200
 *      ↓
 * POST /carts/{id}
 *
 * During the latest execution every newly created cart returned
 * HTTP 200 on readiness attempt #1.
 *
 * Therefore, there is currently NO evidence that the 404 response
 * is caused by the automation calling the add-item endpoint before
 * the cart becomes available.
 *
 * waitForCartReady() is temporarily retained as diagnostic evidence
 * while the F-API-04 investigation is completed.
 *
 * ============================================================
 * CURRENT INVESTIGATION
 * ============================================================
 *
 * The next controlled comparison is the actual HTTP request sent
 * by Playwright versus the manually successful Swagger request.
 *
 * Swagger explicitly sends:
 *
 * Accept: application/json
 * Content-Type: application/json
 *
 * Therefore addItemToCart() now explicitly sends the same headers
 * and logs the final URL, request payload, response status and
 * response body.
 *
 * This does NOT assume that headers are the root cause.
 *
 * It is a controlled diagnostic comparison.
 */


/**
 * ============================================================
 * LOGIN
 * ============================================================
 *
 * POST /users/login
 */
async function login(
  request,
  email,
  password
) {

  const response = await request.post(
    '/users/login',
    {
      data: {
        email,
        password,
      },
    }
  );


  const body =
    await safeJson(response);


  return {
    status: response.status(),
    body,
  };
}


/**
 * ============================================================
 * REGISTER CUSTOMER
 * ============================================================
 *
 * POST /users/register
 */
async function register(
  request,
  payload
) {

  const response = await request.post(
    '/users/register',
    {
      data: payload,
    }
  );


  const body =
    await safeJson(response);


  return {
    status: response.status(),
    body,
  };
}


/**
 * ============================================================
 * CREATE CART
 * ============================================================
 *
 * POST /carts
 *
 * Manually verified Swagger sequence:
 *
 * POST /carts
 *      ↓
 * HTTP 201
 *      ↓
 * response.id
 */
async function createCart(
  request,
  extra = {}
) {

  /*
   * Execute the real CLEAN cart creation API.
   */
  const response = await request.post(
    '/carts',
    {
      data: extra,
    }
  );


  /*
   * Convert the response body to JSON.
   */
  const body =
    await safeJson(response);


  /*
   * Successful cart creation normally returns 201.
   *
   * Existing framework behavior also accepts 200.
   */
  if (
    response.status() !== 201 &&
    response.status() !== 200
  ) {

    throw new Error(
      `createCart failed: ` +
      `${response.status()} ` +
      `${JSON.stringify(body)}`
    );
  }


  /*
   * A valid cart ID is mandatory for subsequent cart APIs.
   */
  if (
    !body ||
    !body.id
  ) {

    throw new Error(
      `createCart succeeded with status ` +
      `${response.status()} but no cart ID was returned. ` +
      `Body=${JSON.stringify(body)}`
    );
  }


  /*
   * Diagnostic evidence showing the actual URL used by Playwright.
   */
  console.log(
    `createCart REQUEST` +
    ` | method=POST` +
    ` | url=${response.url()}` +
    ` | status=${response.status()}` +
    ` | cartId=${body.id}`
  );


  /*
   * Return the fresh server-generated cart ID.
   */
  return body.id;
}


/**
 * ============================================================
 * WAIT FOR CART TO BECOME RETRIEVABLE
 * ============================================================
 *
 * GET /carts/{id}
 *
 * This helper was introduced while investigating whether the
 * newly created cart required time before POST /carts/{id}.
 *
 * Latest evidence:
 *
 * Every cart returned HTTP 200 on attempt #1.
 *
 * Therefore timing has NOT been demonstrated as the cause of the
 * F-API-04 404 responses.
 *
 * The helper remains temporarily because it gives us explicit
 * evidence that the cart exists before the add-item request.
 */
async function waitForCartReady(
  request,
  cartId,
  maxAttempts = 5,
  delayMs = 1000
) {

  /*
   * Repeat the readiness check up to maxAttempts.
   */
  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {

    /*
     * Retrieve the exact newly created cart.
     */
    const response = await request.get(
      `/carts/${cartId}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );


    /*
     * Parse the response for diagnostic output.
     */
    const body =
      await safeJson(response);


    /*
     * Print the exact URL and readiness status.
     */
    console.log(
      `Cart readiness check` +
      ` | method=GET` +
      ` | url=${response.url()}` +
      ` | cartId=${cartId}` +
      ` | attempt=${attempt}/${maxAttempts}` +
      ` | status=${response.status()}` +
      ` | body=${JSON.stringify(body)}`
    );


    /*
     * HTTP 200 proves the cart exists and is retrievable.
     */
    if (
      response.status() === 200
    ) {

      return true;
    }


    /*
     * Do not sleep after the final attempt.
     */
    if (
      attempt === maxAttempts
    ) {

      break;
    }


    /*
     * Short polling interval.
     *
     * This is condition-based polling rather than one blind
     * hard-coded sleep.
     */
    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          delayMs
        )
    );
  }


  /*
   * Fail explicitly if the newly created cart never becomes
   * retrievable.
   */
  throw new Error(
    `Cart ${cartId} was not ready after ` +
    `${maxAttempts} attempts with ` +
    `${delayMs}ms polling interval.`
  );
}


/**
 * ============================================================
 * ADD PRODUCT TO CART
 * ============================================================
 *
 * POST /carts/{id}
 *
 * This method intentionally mirrors the manually verified
 * CLEAN Swagger request as closely as possible.
 *
 * Swagger request:
 *
 * POST /carts/{cartId}
 *
 * Headers:
 *
 * Accept: application/json
 * Content-Type: application/json
 *
 * Body:
 *
 * {
 *   "product_id": "<valid product ID>",
 *   "quantity": <quantity>
 * }
 *
 * IMPORTANT:
 *
 * This is NOT:
 *
 * PUT /carts/{id}/product/quantity
 *
 * F-API-04 specifically validates the ADD ITEM operation.
 */
async function addItemToCart(
  request,
  cartId,
  productId,
  quantity
) {

  /*
   * Build the request payload separately.
   *
   * This allows us to print and compare the exact payload against
   * the successful Swagger request.
   */
  const requestBody = {
    product_id: productId,
    quantity: quantity,
  };


  /*
   * Execute POST /carts/{cartId}.
   *
   * Explicitly provide the same headers visible in the successful
   * Swagger-generated curl request.
   */
  const response = await request.post(
    `/carts/${cartId}`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },

      data: requestBody,
    }
  );


  /*
   * Safely parse the API response.
   */
  const body =
    await safeJson(response);


  /*
   * ============================================================
   * TEMPORARY REQUEST/RESPONSE DIAGNOSTIC
   * ============================================================
   *
   * This proves:
   *
   * - HTTP method;
   * - actual final URL;
   * - cart ID;
   * - product ID;
   * - quantity;
   * - JSON request body;
   * - response status;
   * - response body.
   *
   * This logging can be removed after F-API-04 is fully diagnosed.
   */
  console.log(
    `addItemToCart REQUEST` +
    ` | method=POST` +
    ` | url=${response.url()}` +
    ` | cartId=${cartId}` +
    ` | productId=${productId}` +
    ` | quantity=${quantity}` +
    ` | requestBody=${JSON.stringify(requestBody)}` +
    ` | status=${response.status()}` +
    ` | responseBody=${JSON.stringify(body)}`
  );


  return {
    status: response.status(),
    body,
  };
}


/**
 * ============================================================
 * GET CART
 * ============================================================
 *
 * GET /carts/{id}
 */
async function getCart(
  request,
  cartId
) {

  const response = await request.get(
    `/carts/${cartId}`,
    {
      headers: {
        Accept: 'application/json',
      },
    }
  );


  const body =
    await safeJson(response);


  return {
    status: response.status(),
    body,
  };
}


/**
 * ============================================================
 * UPDATE CART ITEM QUANTITY
 * ============================================================
 *
 * PUT /carts/{id}/product/quantity
 *
 * This remains available for scenarios specifically validating
 * the UPDATE operation.
 *
 * It must NOT replace POST /carts/{id} in F-API-04.
 */
async function updateCartItemQuantity(
  request,
  cartId,
  productId,
  quantity
) {

  const response = await request.put(
    `/carts/${cartId}/product/quantity`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },

      data: {
        product_id: productId,
        quantity: quantity,
      },
    }
  );


  const body =
    await safeJson(response);


  return {
    status: response.status(),
    body,
  };
}


/**
 * ============================================================
 * REMOVE PRODUCT FROM CART
 * ============================================================
 *
 * DELETE /carts/{cartId}/product/{productId}
 */
async function removeCartItem(
  request,
  cartId,
  productId
) {

  const response = await request.delete(
    `/carts/${cartId}/product/${productId}`,
    {
      headers: {
        Accept: 'application/json',
      },
    }
  );


  return {
    status: response.status(),
  };
}


/**
 * ============================================================
 * SEARCH PRODUCTS
 * ============================================================
 *
 * GET /products/search?q=
 */
async function searchProducts(
  request,
  q
) {

  const response = await request.get(
    '/products/search',
    {
      headers: {
        Accept: 'application/json',
      },

      params: {
        q,
      },
    }
  );


  const body =
    await safeJson(response);


  return {
    status: response.status(),
    body,
  };
}


/**
 * ============================================================
 * LIST PRODUCTS
 * ============================================================
 *
 * GET /products
 */
async function listProducts(
  request,
  params = {}
) {

  const response = await request.get(
    '/products',
    {
      headers: {
        Accept: 'application/json',
      },

      params,
    }
  );


  const body =
    await safeJson(response);


  return {
    status: response.status(),
    body,
  };
}


/**
 * ============================================================
 * LIST CATEGORIES
 * ============================================================
 *
 * GET /categories
 */
async function listCategories(
  request
) {

  const response = await request.get(
    '/categories',
    {
      headers: {
        Accept: 'application/json',
      },
    }
  );


  return safeJson(response);
}


/**
 * ============================================================
 * POSTCODE LOOKUP
 * ============================================================
 *
 * GET /postcode-lookup
 */
async function lookupAddress(
  request,
  {
    country,
    postcode,
    houseNumber = '1',
  }
) {

  const response = await request.get(
    '/postcode-lookup',
    {
      headers: {
        Accept: 'application/json',
      },

      params: {
        country,
        postcode,
        house_number: houseNumber,
      },
    }
  );


  if (
    response.status() !== 200
  ) {

    throw new Error(
      `postcode-lookup failed: ${response.status()}`
    );
  }


  return response.json();
}


/**
 * ============================================================
 * PAYMENT CHECK
 * ============================================================
 *
 * POST /payment/check
 *
 * Payment validation only.
 *
 * This does NOT create an invoice.
 */
async function paymentCheck(
  request,
  payment_method,
  payment_details
) {

  const response = await request.post(
    '/payment/check',
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },

      data: {
        payment_method,
        payment_details,
      },
    }
  );


  const body =
    await safeJson(response);


  return {
    status: response.status(),
    body,
  };
}


/**
 * ============================================================
 * CREATE INVOICE
 * ============================================================
 *
 * POST /invoices
 *
 * Authenticated endpoint.
 */
async function createInvoice(
  request,
  token,
  payload
) {

  const response = await request.post(
    '/invoices',
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },

      data: payload,
    }
  );


  const body =
    await safeJson(response);


  return {
    status: response.status(),
    body,
  };
}


/**
 * ============================================================
 * GET INVOICE
 * ============================================================
 *
 * GET /invoices/{id}
 */
async function getInvoice(
  request,
  token,
  invoiceId
) {

  /*
   * Add Authorization only when a token was supplied.
   *
   * This allows negative tests to intentionally make an
   * unauthenticated request.
   */
  const headers = {
    Accept: 'application/json',

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };


  const response = await request.get(
    `/invoices/${invoiceId}`,
    {
      headers,
    }
  );


  const body =
    await safeJson(response);


  return {
    status: response.status(),
    body,
  };
}


/**
 * ============================================================
 * BUILD VALID BILLING ADDRESS
 * ============================================================
 *
 * Uses the real postcode lookup endpoint.
 */
async function buildValidBillingAddress(
  request,
  {
    country = 'US',
    postcode = '10001',
    houseNumber = '1',
  } = {}
) {

  const address =
    await lookupAddress(
      request,
      {
        country,
        postcode,
        houseNumber,
      }
    );


  return {
    billing_street: address.street,
    billing_city: address.city,
    billing_state: address.state,
    billing_country: address.country,
    billing_postal_code: address.postcode,
  };
}


/**
 * ============================================================
 * SAFE JSON PARSER
 * ============================================================
 *
 * Returns parsed JSON when possible.
 *
 * Returns null when the response does not contain valid JSON.
 */
async function safeJson(
  response
) {

  try {

    return await response.json();

  } catch {

    return null;
  }
}


/**
 * ============================================================
 * EXPORT REUSABLE API HELPERS
 * ============================================================
 */
module.exports = {

  login,
  register,

  createCart,
  waitForCartReady,
  addItemToCart,
  getCart,
  updateCartItemQuantity,
  removeCartItem,

  searchProducts,
  listProducts,
  listCategories,

  lookupAddress,

  paymentCheck,

  createInvoice,
  getInvoice,

  buildValidBillingAddress,
};