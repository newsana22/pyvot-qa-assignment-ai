# Toolshop – Automated Test Case Catalogue

## 1. Purpose

This document is the **implemented automation-suite catalogue** for the Pyvot Toolshop assignment. It lists only the test cases/subcases that exist in the Playwright automation files on the feature-branch repository snapshot used for this assessment.

For every automated subcase, the catalogue records:

- automation group ID;
- exact automation spec file;
- scenario/subcase ID;
- exact Playwright test name as implemented;
- concise description of what the automated test validates;
- how the test data/setup is created by the automation.

This is intentionally an **automation implementation view**, not the broader generated scenario catalogue. The implemented executable suite contains **49 tests/subcases: 43 API + 6 UI**.

---

## 2. Automation Coverage Summary

| Automation Group | Spec File | Automated Subcases |
|---|---|---:|
| **F-API-01** | `tests/api/f-api-01-login.spec.js` | 3 |
| **F-API-02** | `tests/api/f-api-02-registration.spec.js` | 10 |
| **F-API-03** | `tests/api/f-api-03-search-filter.spec.js` | 2 |
| **F-API-04** | `tests/api/f-api-04-cart-quantity-bva.spec.js` | 4 |
| **F-API-05** | `tests/api/f-api-05-cart-lifecycle.spec.js` | 5 |
| **F-API-06** | `tests/api/f-api-06-checkout-validation.spec.js` | 5 |
| **F-API-07** | `tests/api/f-api-07-creditcard-order-invoice.spec.js` | 1 |
| **F-API-08** | `tests/api/f-api-08-invoice-authorization.spec.js` | 3 |
| **F-API-09** | `tests/api/f-api-09-financial-line-totals.spec.js` | 4 |
| **F-API-10** | `tests/api/f-api-10-discount-stacking.spec.js` | 6 |
| **F-UI-01** | `tests/ui/f-ui-01-login.spec.js` | 2 |
| **F-UI-02** | `tests/ui/f-ui-02-add-to-cart.spec.js` | 2 |
| **F-UI-03** | `tests/ui/f-ui-03-checkout-purchase.spec.js` | 1 |
| **F-UI-04** | `tests/ui/f-ui-04-invoice-verification.spec.js` | 1 |
| **Total API** | `tests/api/*.spec.js` | **43** |
| **Total UI** | `tests/ui/*.spec.js` | **6** |
| **Grand Total** |  | **49** |

---

## 3. Test Data Strategy Used by the Implemented Suite

The suite deliberately avoids relying on one static data style for every scenario. Test data is created according to the business need:

- **Reusable authenticated accounts:** `DEMO_CUSTOMER` is stored in `data/testUsers.js`, with environment-variable overrides supported for CI.
- **Unique registration data:** `buildRegistrationPayload()` uses Faker plus a timestamp/random suffix to create new names, addresses, email addresses and complex passwords per execution.
- **Dynamic catalogue discovery:** helpers such as `findInStockProduct`, `findOutOfStockProduct`, `findRentalProduct`, `findCo2FriendlyProducts`, `findNonEcoNonRentalProduct`, `findLocationOfferProduct`, and `findCategoryWithTwoBrands` discover suitable current products instead of hard-coding catalogue IDs.
- **Fresh cart state:** cart scenarios call `createCart()` so tests do not share a previously mutated cart.
- **Boundary/partition data:** quantity, age, password and payment partitions are externalized under `data/*.js` where applicable.
- **Billing data:** API checkout helpers use the real postcode-lookup endpoint; the UI positive checkout case uses the externalized valid billing seed required by that flow.
- **Cross-layer UI setup:** UI tests may use the separate API request fixture for product discovery or invoice setup, while the business assertion remains in the browser.
- **Financial expectations:** expected calculations are independently derived in the tests with cents-safe conversion instead of merely trusting another application-displayed value.

---

## 4. Implemented Automated Test Cases

### F-API-01

**Automation file:** `tests/api/f-api-01-login.spec.js`  
**Implemented subcases:** 3

#### F-API-01.1 — AUTH-001

**Exact Playwright test name**

> `AUTH-001 | valid credentials return 200 with an access token`

**Description**  
Validates successful API login and verifies HTTP 200, non-empty access token, and bearer token type.

**Test data / setup creation**  
Uses `DEMO_CUSTOMER` from `data/testUsers.js`. Email/password can be overridden with environment variables; otherwise the validated public demo customer is used.

#### F-API-01.2 — AUTH-003

**Exact Playwright test name**

> `AUTH-003 | invalid password is rejected (401) — confirmed status only, message text is Needs Human Review`

**Description**  
Validates that a real registered customer with an invalid password is rejected with HTTP 401.

**Test data / setup creation**  
Uses the `DEMO_CUSTOMER` email and intentionally replaces only the password with fixed invalid value `a-definitely-wrong-password-123`.

#### F-API-01.3 — AUTH-004

**Exact Playwright test name**

> `AUTH-004 | non-existent email is rejected (401)`

**Description**  
Validates that login using an unregistered email is rejected with HTTP 401.

**Test data / setup creation**  
Calls `buildRegistrationPayload()` only to generate a unique email; the user is deliberately not registered. Login uses that generated email with `whatever-password-1`.

---

### F-API-02

**Automation file:** `tests/api/f-api-02-registration.spec.js`  
**Implemented subcases:** 10

#### F-API-02.1 — AUTH-011

**Exact Playwright test name**

> `AUTH-011 | valid registration succeeds (201)`

**Description**  
Validates successful customer registration and checks HTTP 201, returned email, and generated customer ID.

**Test data / setup creation**  
Creates a fresh payload with `buildRegistrationPayload()`: Faker-generated first/last name and address fields, timestamp + Faker unique email, randomized complex password, valid baseline DOB/phone/address.

#### F-API-02.2 — AUTH-012 (refined: 18y + 1 day)

**Exact Playwright test name**

> `F-API-02 | AUTH-012 (refined: 18y + 1 day) | expects 201`

**Description**  
Validates the accepted lower-age boundary refined from CLEAN behaviour.

**Test data / setup creation**  
DOB is calculated dynamically at runtime as current UTC date minus 18 years minus 1 day. Remaining registration fields come from a fresh `buildRegistrationPayload()` payload.

#### F-API-02.3 — AUTH-012 (exactly 18 years — confirmed rejected)

**Exact Playwright test name**

> `F-API-02 | AUTH-012 (exactly 18 years — confirmed rejected) | expects 422`

**Description**  
Validates the exact-18-years boundary as confirmed rejected by the CLEAN API.

**Test data / setup creation**  
DOB is calculated dynamically as exactly 18 years before the current UTC date; all other fields are freshly generated valid registration data.

#### F-API-02.4 — AUTH-013 (exactly 75 years)

**Exact Playwright test name**

> `F-API-02 | AUTH-013 (exactly 75 years) | expects 201`

**Description**  
Validates the documented maximum valid age boundary.

**Test data / setup creation**  
DOB is calculated dynamically as exactly 75 years before the current UTC date; other registration fields are generated by `buildRegistrationPayload()`.

#### F-API-02.5 — AUTH-014 (17 years — under minimum)

**Exact Playwright test name**

> `F-API-02 | AUTH-014 (17 years — under minimum) | expects 422`

**Description**  
Validates rejection below the minimum age.

**Test data / setup creation**  
DOB is calculated dynamically as 17 years before the current UTC date; the rest of the payload remains valid and uniquely generated.

#### F-API-02.6 — AUTH-015 (76 years — over documented maximum)

**Exact Playwright test name**

> `F-API-02 | AUTH-015 (76 years — over documented maximum) | expects 422`

**Description**  
Validates the over-maximum age boundary. The expected 422 is preserved; this scenario is skipped because of the documented CLEAN discrepancy.

**Test data / setup creation**  
DOB is calculated dynamically as 76 years before the current UTC date. Other data comes from a fresh valid registration payload. The case is marked `knownCleanDefect: true` in `registrationTestData.js`.

#### F-API-02.7 — AUTH-018 | no uppercase

**Exact Playwright test name**

> `F-API-02 | AUTH-018 | no uppercase | rejected (422)`

**Description**  
Validates one invalid password equivalence partition while keeping the remainder of the registration payload valid.

**Test data / setup creation**  
Starts with a new unique `buildRegistrationPayload()` and overrides only `password` with `lowercase123!zzq`. Expected status comes from `invalidPasswordPartitions` in `data/registrationTestData.js`.

#### F-API-02.8 — AUTH-018 | no number

**Exact Playwright test name**

> `F-API-02 | AUTH-018 | no number | rejected (422)`

**Description**  
Validates one invalid password equivalence partition while keeping the remainder of the registration payload valid.

**Test data / setup creation**  
Starts with a new unique `buildRegistrationPayload()` and overrides only `password` with `NoNumberHere!Zzq`. Expected status comes from `invalidPasswordPartitions` in `data/registrationTestData.js`.

#### F-API-02.9 — AUTH-018 | no symbol

**Exact Playwright test name**

> `F-API-02 | AUTH-018 | no symbol | rejected (422)`

**Description**  
Validates one invalid password equivalence partition while keeping the remainder of the registration payload valid.

**Test data / setup creation**  
Starts with a new unique `buildRegistrationPayload()` and overrides only `password` with `NoSymbolHere123Zzq`. Expected status comes from `invalidPasswordPartitions` in `data/registrationTestData.js`.

#### F-API-02.10 — AUTH-018 | under 8 characters

**Exact Playwright test name**

> `F-API-02 | AUTH-018 | under 8 characters | rejected (422)`

**Description**  
Validates one invalid password equivalence partition while keeping the remainder of the registration payload valid.

**Test data / setup creation**  
Starts with a new unique `buildRegistrationPayload()` and overrides only `password` with `Ab1!zq`. Expected status comes from `invalidPasswordPartitions` in `data/registrationTestData.js`.

---

### F-API-03

**Automation file:** `tests/api/f-api-03-search-filter.spec.js`  
**Implemented subcases:** 2

#### F-API-03.1 — BROWSE-003

**Exact Playwright test name**

> `BROWSE-003 | search returns only products matching the query`

**Description**  
Validates product search results all match the requested query.

**Test data / setup creation**  
Uses fixed search query `Pliers`; the returned product dataset is live API data, not a hard-coded product list.

#### F-API-03.2 — BROWSE-011

**Exact Playwright test name**

> `BROWSE-011 | combined category + brand filter follows confirmed AND semantics`

**Description**  
Validates that combined category + brand filtering returns products satisfying both conditions and excludes same-category products from another brand.

**Test data / setup creation**  
`findCategoryWithTwoBrands(request)` dynamically discovers a suitable current category/brand combination and derives expected matching and excluded product names from live catalogue data.

---

### F-API-04

**Automation file:** `tests/api/f-api-04-cart-quantity-bva.spec.js`  
**Implemented subcases:** 4

#### F-API-04.1 — CART-004

**Exact Playwright test name**

> `F-API-04 | CART-004 | quantity 0 -> 422`

**Description**  
Boundary Value Analysis for cart quantity `0` with expected HTTP 422.

**Test data / setup creation**  
Quantity/expected result is externalized in `data/cartTestData.js`. Each run dynamically discovers a current in-stock product, creates a fresh cart, waits until it is retrievable, then adds that product directly with quantity `0`.

#### F-API-04.2 — CART-005

**Exact Playwright test name**

> `F-API-04 | CART-005 | quantity 1 -> 200`

**Description**  
Boundary Value Analysis for cart quantity `1` with expected HTTP 200.

**Test data / setup creation**  
Quantity/expected result is externalized in `data/cartTestData.js`. Each run dynamically discovers a current in-stock product, creates a fresh cart, waits until it is retrievable, then adds that product directly with quantity `1`.

#### F-API-04.3 — CART-006

**Exact Playwright test name**

> `F-API-04 | CART-006 | quantity 99 -> 200`

**Description**  
Boundary Value Analysis for cart quantity `99` with expected HTTP 200.

**Test data / setup creation**  
Quantity/expected result is externalized in `data/cartTestData.js`. Each run dynamically discovers a current in-stock product, creates a fresh cart, waits until it is retrievable, then adds that product directly with quantity `99`.

#### F-API-04.4 — CART-007

**Exact Playwright test name**

> `F-API-04 | CART-007 | quantity 100 -> 422`

**Description**  
Boundary Value Analysis for cart quantity `100` with expected HTTP 422.

**Test data / setup creation**  
Quantity/expected result is externalized in `data/cartTestData.js`. Each run dynamically discovers a current in-stock product, creates a fresh cart, waits until it is retrievable, then adds that product directly with quantity `100`.

---

### F-API-05

**Automation file:** `tests/api/f-api-05-cart-lifecycle.spec.js`  
**Implemented subcases:** 5

#### F-API-05.1 — CART-002

**Exact Playwright test name**

> `CART-002 | valid product/quantity is added to the cart`

**Description**  
Validates adding a valid product with a valid quantity to a fresh cart.

**Test data / setup creation**  
Dynamically discovers an in-stock product, creates a fresh cart, adds quantity `2`, then reads the cart to verify the line.

#### F-API-05.2 — CART-008

**Exact Playwright test name**

> `CART-008 | adding the same product again increments the existing line (no duplicate)`

**Description**  
Validates repeated addition of the same product updates the existing line rather than creating a duplicate.

**Test data / setup creation**  
Dynamically discovers one in-stock product and creates a fresh cart; adds the same product first with quantity `2` and again with quantity `3` so the resulting line can be checked for accumulated quantity/no duplicate.

#### F-API-05.3 — CART-009

**Exact Playwright test name**

> `CART-009 | GET /carts/{id} returns items and discount fields`

**Description**  
Validates the cart retrieval contract including items and discount-related fields.

**Test data / setup creation**  
Dynamically discovers an in-stock product, creates a fresh cart, and adds quantity `1` before retrieving the cart.

#### F-API-05.4 — CART-011

**Exact Playwright test name**

> `CART-011 | updating quantity recalculates the cart-item state`

**Description**  
Validates quantity update behaviour and recalculated cart-item state.

**Test data / setup creation**  
Dynamically discovers an in-stock product, creates a fresh cart, adds quantity `1`, then updates that line to quantity `7`.

#### F-API-05.5 — CART-014

**Exact Playwright test name**

> `CART-014 | removing an item deletes the line from the cart`

**Description**  
Validates product removal from a cart.

**Test data / setup creation**  
Dynamically discovers an in-stock product, creates a fresh cart, adds quantity `1`, then removes that same product and re-reads cart state.

---

### F-API-06

**Automation file:** `tests/api/f-api-06-checkout-validation.spec.js`  
**Implemented subcases:** 5

#### F-API-06.1 — CKO-007

**Exact Playwright test name**

> `CKO-007 | omitting confirmed-required "billing_street" is rejected (422)`

**Description**  
Validates invoice/checkout rejection when required field `billing_street` is omitted.

**Test data / setup creation**  
Logs in with `DEMO_CUSTOMER`, dynamically discovers an in-stock product, creates a fresh cart, adds quantity `1`, builds a valid billing address through the real postcode lookup helper, then deletes exactly this one required field before invoice creation.

#### F-API-06.2 — CKO-007

**Exact Playwright test name**

> `CKO-007 | omitting confirmed-required "billing_city" is rejected (422)`

**Description**  
Validates invoice/checkout rejection when required field `billing_city` is omitted.

**Test data / setup creation**  
Logs in with `DEMO_CUSTOMER`, dynamically discovers an in-stock product, creates a fresh cart, adds quantity `1`, builds a valid billing address through the real postcode lookup helper, then deletes exactly this one required field before invoice creation.

#### F-API-06.3 — CKO-007

**Exact Playwright test name**

> `CKO-007 | omitting confirmed-required "billing_country" is rejected (422)`

**Description**  
Validates invoice/checkout rejection when required field `billing_country` is omitted.

**Test data / setup creation**  
Logs in with `DEMO_CUSTOMER`, dynamically discovers an in-stock product, creates a fresh cart, adds quantity `1`, builds a valid billing address through the real postcode lookup helper, then deletes exactly this one required field before invoice creation.

#### F-API-06.4 — CKO-017

**Exact Playwright test name**

> `CKO-017 | credit card with an expired date is rejected (422, confirmed error text)`

**Description**  
Validates payment validation rejects an expired credit-card date and returns the confirmed error text.

**Test data / setup creation**  
Uses `expiredCreditCardCase` from `data/checkoutTestData.js`: valid card number `4111-1111-1111-1111`, expired `12/2020`, CVV `123`, holder `Test User`; only the expiration field is intentionally invalid.

#### F-API-06.5 — CKO-018

**Exact Playwright test name**

> `CKO-018 | malformed credit-card number is rejected (422, confirmed error text)`

**Description**  
Validates payment validation rejects a malformed credit-card-number format and returns the confirmed error text.

**Test data / setup creation**  
Uses `malformedCreditCardCase`: card `4111111111111111` intentionally omits required hyphens; expiration `12/2030`, CVV `123`, and holder `Test User` remain valid.

---

### F-API-07

**Automation file:** `tests/api/f-api-07-creditcard-order-invoice.spec.js`  
**Implemented subcases:** 1

#### F-API-07.1 — CKO-016 + CKO-025 + CKO-026

**Exact Playwright test name**

> `CKO-016 + CKO-025 + CKO-026 | valid credit card creates an order with a well-formed invoice number`

**Description**  
Validates successful credit-card checkout/order creation and the generated invoice-number contract.

**Test data / setup creation**  
Logs in with `DEMO_CUSTOMER`; dynamically discovers an in-stock product; creates a fresh cart with quantity `1`; obtains billing data from the real postcode lookup; uses valid card `4111-1111-1111-1111`, expiration `12/2030`, CVV `123`, holder `Test User`.

---

### F-API-08

**Automation file:** `tests/api/f-api-08-invoice-authorization.spec.js`  
**Implemented subcases:** 3

#### F-API-08.1 — INV-007

**Exact Playwright test name**

> `INV-007 | a non-existent invoice id is not returned (404)`

**Description**  
Validates that an authenticated customer cannot retrieve a non-existent invoice.

**Test data / setup creation**  
Logs in with `DEMO_CUSTOMER` and requests fixed clearly non-existent ID `01NONEXISTENTINVOICEID0000`.

#### F-API-08.2 — INV-008

**Exact Playwright test name**

> `INV-008 | another authenticated non-admin user cannot view someone else's invoice`

**Description**  
Validates invoice ownership/IDOR protection for a second normal user.

**Test data / setup creation**  
`createInvoiceForFreshUser()` creates a brand-new owner using Faker-backed `buildRegistrationPayload()`, logs that user in, dynamically discovers a product, creates a cart with quantity `1`, obtains a valid billing address, and creates a cash-on-delivery invoice. A second independently generated user is then registered/logged in and attempts to access the owner's invoice.

#### F-API-08.3 — INV-009

**Exact Playwright test name**

> `INV-009 | an admin can view another user's invoice`

**Description**  
Validates admin authorization to retrieve another user's invoice.

**Test data / setup creation**  
Creates a fresh normal-user invoice with `createInvoiceForFreshUser()`, then logs in with the configured public admin credentials and retrieves that invoice.

---

### F-API-09

**Automation file:** `tests/api/f-api-09-financial-line-totals.spec.js`  
**Implemented subcases:** 4

#### F-API-09.1 — FIN-001

**Exact Playwright test name**

> `F-API-09 | FIN-001 | line total, quantity 3`

**Description**  
Validates exact line-total arithmetic for quantity `3` using the real product unit price.

**Test data / setup creation**  
Dynamically discovers an in-stock product, creates a fresh cart, adds quantity `3`, retrieves the cart, and independently calculates expected line total as `quantity × item.product.price` using cents-safe money conversion.

#### F-API-09.2 — FIN-017

**Exact Playwright test name**

> `F-API-09 | FIN-017 | quantity-boundary integrity at minimum quantity (1)`

**Description**  
Validates exact line-total arithmetic for quantity `1` using the real product unit price.

**Test data / setup creation**  
Dynamically discovers an in-stock product, creates a fresh cart, adds quantity `1`, retrieves the cart, and independently calculates expected line total as `quantity × item.product.price` using cents-safe money conversion.

#### F-API-09.3 — FIN-018

**Exact Playwright test name**

> `F-API-09 | FIN-018 | quantity-boundary integrity at maximum quantity (99)`

**Description**  
Validates exact line-total arithmetic for quantity `99` using the real product unit price.

**Test data / setup creation**  
Dynamically discovers an in-stock product, creates a fresh cart, adds quantity `99`, retrieves the cart, and independently calculates expected line total as `quantity × item.product.price` using cents-safe money conversion.

#### F-API-09.4 — FIN-002

**Exact Playwright test name**

> `FIN-002 | line total uses the discounted unit price when a per-item location discount applies`

**Description**  
Validates line total uses the discounted unit price when the location-based item discount is active.

**Test data / setup creation**  
Dynamically discovers a product eligible for the location offer, creates a fresh cart using the `MUMBAI` location, adds the same product twice (quantity 1 + quantity 1), retrieves the cart, and independently calculates the discounted-unit-price line total.

---

### F-API-10

**Automation file:** `tests/api/f-api-10-discount-stacking.spec.js`  
**Implemented subcases:** 6

#### F-API-10.1 — FIN-007

**Exact Playwright test name**

> `FIN-007 | rental + non-rental mix applies the exact 15% combination discount`

**Description**  
Validates the 15% combination discount for a rental + non-rental mix.

**Test data / setup creation**  
Dynamically discovers one rental and one non-eco non-rental product, creates a fresh cart, and adds quantity `1` of each.

#### F-API-10.2 — FIN-008

**Exact Playwright test name**

> `FIN-008 | a single-product-type cart has no combination discount`

**Description**  
Validates no combination discount is applied to a single product type.

**Test data / setup creation**  
Dynamically discovers one non-eco non-rental product, creates a fresh cart, and adds quantity `2` of that same product.

#### F-API-10.3 — FIN-009

**Exact Playwright test name**

> `FIN-009 | removing the rental item removes the combination discount`

**Description**  
Validates combination discount state changes when the rental item is removed.

**Test data / setup creation**  
Dynamically discovers a rental and non-rental product, creates a fresh cart, adds quantity `1` of each, confirms the mixed-cart state, removes the rental line, then re-reads the cart.

#### F-API-10.4 — FIN-010

**Exact Playwright test name**

> `FIN-010 | eco discount applies (5%) when more than 50% of quantity is CO2 A/B`

**Description**  
Validates the 5% eco discount when qualifying quantity is greater than 50%.

**Test data / setup creation**  
Dynamically discovers one eco-friendly product and one non-eco non-rental product; creates a fresh cart; adds `6` eco units and `4` non-eco units (60% qualifying). Checkout uses the reusable invoice helper.

#### F-API-10.5 — FIN-011

**Exact Playwright test name**

> `FIN-011 | eco discount does NOT apply at exactly 50% qualifying quantity`

**Description**  
Validates the eco discount does not apply at the exact 50% boundary.

**Test data / setup creation**  
Dynamically discovers one eco-friendly and one non-eco non-rental product; creates a fresh cart; adds `5` eco and `5` non-eco units (exactly 50%).

#### F-API-10.6 — FIN-012

**Exact Playwright test name**

> `FIN-012 | exact discount-stacking arithmetic: combination first, then eco discount`

**Description**  
Validates exact sequential stacking: combination discount first, then eco discount on the remaining amount.

**Test data / setup creation**  
Dynamically discovers one rental and one eco-friendly product, creates a fresh cart, adds rental quantity `1` and eco quantity `2` (eco ratio 2/3 > 50%), confirms the 15% combination discount, performs checkout, then independently verifies the sequential financial arithmetic.

---

### F-UI-01

**Automation file:** `tests/ui/f-ui-01-login.spec.js`  
**Implemented subcases:** 2

#### F-UI-01.1 — AUTH-001

**Exact Playwright test name**

> `AUTH-001 | standard user login navigates to the account area with authenticated nav state`

**Description**  
Validates the real browser login flow for a standard customer, account navigation, page title, and authenticated user-menu state.

**Test data / setup creation**  
Uses `DEMO_CUSTOMER` from `data/testUsers.js`; credentials may be environment-overridden, otherwise the validated public demo customer is used.

#### F-UI-01.2 — AUTH-002

**Exact Playwright test name**

> `AUTH-002 | admin login redirects to the admin dashboard`

**Description**  
Validates the real browser admin-login state transition to the admin dashboard.

**Test data / setup creation**  
Uses the public admin test credentials coded in the automation: `admin@practicesoftwaretesting.com` / `welcome01`.

---

### F-UI-02

**Automation file:** `tests/ui/f-ui-02-add-to-cart.spec.js`  
**Implemented subcases:** 2

#### F-UI-02.1 — PROD-008

**Exact Playwright test name**

> `PROD-008 | a valid in-stock product can be added to the cart with visible confirmation`

**Description**  
Validates product-detail Add to Cart for an eligible product, including customer-visible success confirmation and cart state.

**Test data / setup creation**  
Uses the separate API fixture to dynamically discover a current in-stock product, then opens that product through the UI. No product ID/name is hard-coded.

#### F-UI-02.2 — PROD-009

**Exact Playwright test name**

> `PROD-009 | an out-of-stock, non-rental product disables Add to Cart and shows the out-of-stock label`

**Description**  
Validates the browser state for an out-of-stock non-rental product.

**Test data / setup creation**  
Uses API-driven catalogue discovery to dynamically locate a current out-of-stock, non-rental product, then validates the corresponding product-detail UI.

---

### F-UI-03

**Automation file:** `tests/ui/f-ui-03-checkout-purchase.spec.js`  
**Implemented subcases:** 1

#### F-UI-03.1 — CKO-001 + CKO-027

**Exact Playwright test name**

> `CKO-001 + CKO-027 | authenticated user completes checkout and sees the order confirmation`

**Description**  
Validates the end-to-end browser checkout journey for an authenticated customer, including payment validation, invoice creation, order confirmation, and API-to-UI invoice-number consistency.

**Test data / setup creation**  
Dynamically discovers an in-stock product through the API fixture; logs in using `DEMO_CUSTOMER`; uses `validBillingAddress` (`Austria`, postcode `1010`, house `1`) and `validCreditCardCase` (`4111-1111-1111-1111`, `12/2030`, `123`, `Test User`) from `data/checkoutTestData.js`. The invoice number is generated by the application at runtime.

---

### F-UI-04

**Automation file:** `tests/ui/f-ui-04-invoice-verification.spec.js`  
**Implemented subcases:** 1

#### F-UI-04.1 — INV-003 + INV-005

**Exact Playwright test name**

> `INV-003 + INV-005 | invoice detail renders the exact confirmed discounted total`

**Description**  
Validates customer-visible invoice identity and exact financial total in the browser after creating a discount-bearing invoice through API setup.

**Test data / setup creation**  
API setup logs in with `DEMO_CUSTOMER`, dynamically discovers one rental and one eco-friendly product, creates a fresh cart with rental quantity `1` and eco quantity `2`, builds a valid billing address using the real postcode lookup, and creates a cash-on-delivery invoice. The invoice's generated ID/number/total become the expected UI data; total is compared with cents-safe conversion.

---

## 5. Full 49-Test Traceability Table

| # | Automation Group | Scenario / Subcase | Exact Test Name | Test Data Creation / Setup |
|---:|---|---|---|---|
| 1 | **F-API-01** | `AUTH-001` | AUTH-001 \| valid credentials return 200 with an access token | Uses `DEMO_CUSTOMER` from `data/testUsers.js`. Email/password can be overridden with environment variables; otherwise the validated public demo customer is used. |
| 2 | **F-API-01** | `AUTH-003` | AUTH-003 \| invalid password is rejected (401) — confirmed status only, message text is Needs Human Review | Uses the `DEMO_CUSTOMER` email and intentionally replaces only the password with fixed invalid value `a-definitely-wrong-password-123`. |
| 3 | **F-API-01** | `AUTH-004` | AUTH-004 \| non-existent email is rejected (401) | Calls `buildRegistrationPayload()` only to generate a unique email; the user is deliberately not registered. Login uses that generated email with `whatever-password-1`. |
| 4 | **F-API-02** | `AUTH-011` | AUTH-011 \| valid registration succeeds (201) | Creates a fresh payload with `buildRegistrationPayload()`: Faker-generated first/last name and address fields, timestamp + Faker unique email, randomized complex password, valid baseline DOB/phone/address. |
| 5 | **F-API-02** | `AUTH-012 (refined: 18y + 1 day)` | F-API-02 \| AUTH-012 (refined: 18y + 1 day) \| expects 201 | DOB is calculated dynamically at runtime as current UTC date minus 18 years minus 1 day. Remaining registration fields come from a fresh `buildRegistrationPayload()` payload. |
| 6 | **F-API-02** | `AUTH-012 (exactly 18 years — confirmed rejected)` | F-API-02 \| AUTH-012 (exactly 18 years — confirmed rejected) \| expects 422 | DOB is calculated dynamically as exactly 18 years before the current UTC date; all other fields are freshly generated valid registration data. |
| 7 | **F-API-02** | `AUTH-013 (exactly 75 years)` | F-API-02 \| AUTH-013 (exactly 75 years) \| expects 201 | DOB is calculated dynamically as exactly 75 years before the current UTC date; other registration fields are generated by `buildRegistrationPayload()`. |
| 8 | **F-API-02** | `AUTH-014 (17 years — under minimum)` | F-API-02 \| AUTH-014 (17 years — under minimum) \| expects 422 | DOB is calculated dynamically as 17 years before the current UTC date; the rest of the payload remains valid and uniquely generated. |
| 9 | **F-API-02** | `AUTH-015 (76 years — over documented maximum)` | F-API-02 \| AUTH-015 (76 years — over documented maximum) \| expects 422 | DOB is calculated dynamically as 76 years before the current UTC date. Other data comes from a fresh valid registration payload. The case is marked `knownCleanDefect: true` in `registrationTestData.js`. |
| 10 | **F-API-02** | `AUTH-018 \| no uppercase` | F-API-02 \| AUTH-018 \| no uppercase \| rejected (422) | Starts with a new unique `buildRegistrationPayload()` and overrides only `password` with `lowercase123!zzq`. Expected status comes from `invalidPasswordPartitions` in `data/registrationTestData.js`. |
| 11 | **F-API-02** | `AUTH-018 \| no number` | F-API-02 \| AUTH-018 \| no number \| rejected (422) | Starts with a new unique `buildRegistrationPayload()` and overrides only `password` with `NoNumberHere!Zzq`. Expected status comes from `invalidPasswordPartitions` in `data/registrationTestData.js`. |
| 12 | **F-API-02** | `AUTH-018 \| no symbol` | F-API-02 \| AUTH-018 \| no symbol \| rejected (422) | Starts with a new unique `buildRegistrationPayload()` and overrides only `password` with `NoSymbolHere123Zzq`. Expected status comes from `invalidPasswordPartitions` in `data/registrationTestData.js`. |
| 13 | **F-API-02** | `AUTH-018 \| under 8 characters` | F-API-02 \| AUTH-018 \| under 8 characters \| rejected (422) | Starts with a new unique `buildRegistrationPayload()` and overrides only `password` with `Ab1!zq`. Expected status comes from `invalidPasswordPartitions` in `data/registrationTestData.js`. |
| 14 | **F-API-03** | `BROWSE-003` | BROWSE-003 \| search returns only products matching the query | Uses fixed search query `Pliers`; the returned product dataset is live API data, not a hard-coded product list. |
| 15 | **F-API-03** | `BROWSE-011` | BROWSE-011 \| combined category + brand filter follows confirmed AND semantics | `findCategoryWithTwoBrands(request)` dynamically discovers a suitable current category/brand combination and derives expected matching and excluded product names from live catalogue data. |
| 16 | **F-API-04** | `CART-004` | F-API-04 \| CART-004 \| quantity 0 -> 422 | Quantity/expected result is externalized in `data/cartTestData.js`. Each run dynamically discovers a current in-stock product, creates a fresh cart, waits until it is retrievable, then adds that product directly with quantity `0`. |
| 17 | **F-API-04** | `CART-005` | F-API-04 \| CART-005 \| quantity 1 -> 200 | Quantity/expected result is externalized in `data/cartTestData.js`. Each run dynamically discovers a current in-stock product, creates a fresh cart, waits until it is retrievable, then adds that product directly with quantity `1`. |
| 18 | **F-API-04** | `CART-006` | F-API-04 \| CART-006 \| quantity 99 -> 200 | Quantity/expected result is externalized in `data/cartTestData.js`. Each run dynamically discovers a current in-stock product, creates a fresh cart, waits until it is retrievable, then adds that product directly with quantity `99`. |
| 19 | **F-API-04** | `CART-007` | F-API-04 \| CART-007 \| quantity 100 -> 422 | Quantity/expected result is externalized in `data/cartTestData.js`. Each run dynamically discovers a current in-stock product, creates a fresh cart, waits until it is retrievable, then adds that product directly with quantity `100`. |
| 20 | **F-API-05** | `CART-002` | CART-002 \| valid product/quantity is added to the cart | Dynamically discovers an in-stock product, creates a fresh cart, adds quantity `2`, then reads the cart to verify the line. |
| 21 | **F-API-05** | `CART-008` | CART-008 \| adding the same product again increments the existing line (no duplicate) | Dynamically discovers one in-stock product and creates a fresh cart; adds the same product first with quantity `2` and again with quantity `3` so the resulting line can be checked for accumulated quantity/no duplicate. |
| 22 | **F-API-05** | `CART-009` | CART-009 \| GET /carts/{id} returns items and discount fields | Dynamically discovers an in-stock product, creates a fresh cart, and adds quantity `1` before retrieving the cart. |
| 23 | **F-API-05** | `CART-011` | CART-011 \| updating quantity recalculates the cart-item state | Dynamically discovers an in-stock product, creates a fresh cart, adds quantity `1`, then updates that line to quantity `7`. |
| 24 | **F-API-05** | `CART-014` | CART-014 \| removing an item deletes the line from the cart | Dynamically discovers an in-stock product, creates a fresh cart, adds quantity `1`, then removes that same product and re-reads cart state. |
| 25 | **F-API-06** | `CKO-007` | CKO-007 \| omitting confirmed-required "billing_street" is rejected (422) | Logs in with `DEMO_CUSTOMER`, dynamically discovers an in-stock product, creates a fresh cart, adds quantity `1`, builds a valid billing address through the real postcode lookup helper, then deletes exactly this one required field before invoice creation. |
| 26 | **F-API-06** | `CKO-007` | CKO-007 \| omitting confirmed-required "billing_city" is rejected (422) | Logs in with `DEMO_CUSTOMER`, dynamically discovers an in-stock product, creates a fresh cart, adds quantity `1`, builds a valid billing address through the real postcode lookup helper, then deletes exactly this one required field before invoice creation. |
| 27 | **F-API-06** | `CKO-007` | CKO-007 \| omitting confirmed-required "billing_country" is rejected (422) | Logs in with `DEMO_CUSTOMER`, dynamically discovers an in-stock product, creates a fresh cart, adds quantity `1`, builds a valid billing address through the real postcode lookup helper, then deletes exactly this one required field before invoice creation. |
| 28 | **F-API-06** | `CKO-017` | CKO-017 \| credit card with an expired date is rejected (422, confirmed error text) | Uses `expiredCreditCardCase` from `data/checkoutTestData.js`: valid card number `4111-1111-1111-1111`, expired `12/2020`, CVV `123`, holder `Test User`; only the expiration field is intentionally invalid. |
| 29 | **F-API-06** | `CKO-018` | CKO-018 \| malformed credit-card number is rejected (422, confirmed error text) | Uses `malformedCreditCardCase`: card `4111111111111111` intentionally omits required hyphens; expiration `12/2030`, CVV `123`, and holder `Test User` remain valid. |
| 30 | **F-API-07** | `CKO-016 + CKO-025 + CKO-026` | CKO-016 + CKO-025 + CKO-026 \| valid credit card creates an order with a well-formed invoice number | Logs in with `DEMO_CUSTOMER`; dynamically discovers an in-stock product; creates a fresh cart with quantity `1`; obtains billing data from the real postcode lookup; uses valid card `4111-1111-1111-1111`, expiration `12/2030`, CVV `123`, holder `Test User`. |
| 31 | **F-API-08** | `INV-007` | INV-007 \| a non-existent invoice id is not returned (404) | Logs in with `DEMO_CUSTOMER` and requests fixed clearly non-existent ID `01NONEXISTENTINVOICEID0000`. |
| 32 | **F-API-08** | `INV-008` | INV-008 \| another authenticated non-admin user cannot view someone else's invoice | `createInvoiceForFreshUser()` creates a brand-new owner using Faker-backed `buildRegistrationPayload()`, logs that user in, dynamically discovers a product, creates a cart with quantity `1`, obtains a valid billing address, and creates a cash-on-delivery invoice. A second independently generated user is then registered/logged in and attempts to access the owner's invoice. |
| 33 | **F-API-08** | `INV-009` | INV-009 \| an admin can view another user's invoice | Creates a fresh normal-user invoice with `createInvoiceForFreshUser()`, then logs in with the configured public admin credentials and retrieves that invoice. |
| 34 | **F-API-09** | `FIN-001` | F-API-09 \| FIN-001 \| line total, quantity 3 | Dynamically discovers an in-stock product, creates a fresh cart, adds quantity `3`, retrieves the cart, and independently calculates expected line total as `quantity × item.product.price` using cents-safe money conversion. |
| 35 | **F-API-09** | `FIN-017` | F-API-09 \| FIN-017 \| quantity-boundary integrity at minimum quantity (1) | Dynamically discovers an in-stock product, creates a fresh cart, adds quantity `1`, retrieves the cart, and independently calculates expected line total as `quantity × item.product.price` using cents-safe money conversion. |
| 36 | **F-API-09** | `FIN-018` | F-API-09 \| FIN-018 \| quantity-boundary integrity at maximum quantity (99) | Dynamically discovers an in-stock product, creates a fresh cart, adds quantity `99`, retrieves the cart, and independently calculates expected line total as `quantity × item.product.price` using cents-safe money conversion. |
| 37 | **F-API-09** | `FIN-002` | FIN-002 \| line total uses the discounted unit price when a per-item location discount applies | Dynamically discovers a product eligible for the location offer, creates a fresh cart using the `MUMBAI` location, adds the same product twice (quantity 1 + quantity 1), retrieves the cart, and independently calculates the discounted-unit-price line total. |
| 38 | **F-API-10** | `FIN-007` | FIN-007 \| rental + non-rental mix applies the exact 15% combination discount | Dynamically discovers one rental and one non-eco non-rental product, creates a fresh cart, and adds quantity `1` of each. |
| 39 | **F-API-10** | `FIN-008` | FIN-008 \| a single-product-type cart has no combination discount | Dynamically discovers one non-eco non-rental product, creates a fresh cart, and adds quantity `2` of that same product. |
| 40 | **F-API-10** | `FIN-009` | FIN-009 \| removing the rental item removes the combination discount | Dynamically discovers a rental and non-rental product, creates a fresh cart, adds quantity `1` of each, confirms the mixed-cart state, removes the rental line, then re-reads the cart. |
| 41 | **F-API-10** | `FIN-010` | FIN-010 \| eco discount applies (5%) when more than 50% of quantity is CO2 A/B | Dynamically discovers one eco-friendly product and one non-eco non-rental product; creates a fresh cart; adds `6` eco units and `4` non-eco units (60% qualifying). Checkout uses the reusable invoice helper. |
| 42 | **F-API-10** | `FIN-011` | FIN-011 \| eco discount does NOT apply at exactly 50% qualifying quantity | Dynamically discovers one eco-friendly and one non-eco non-rental product; creates a fresh cart; adds `5` eco and `5` non-eco units (exactly 50%). |
| 43 | **F-API-10** | `FIN-012` | FIN-012 \| exact discount-stacking arithmetic: combination first, then eco discount | Dynamically discovers one rental and one eco-friendly product, creates a fresh cart, adds rental quantity `1` and eco quantity `2` (eco ratio 2/3 > 50%), confirms the 15% combination discount, performs checkout, then independently verifies the sequential financial arithmetic. |
| 44 | **F-UI-01** | `AUTH-001` | AUTH-001 \| standard user login navigates to the account area with authenticated nav state | Uses `DEMO_CUSTOMER` from `data/testUsers.js`; credentials may be environment-overridden, otherwise the validated public demo customer is used. |
| 45 | **F-UI-01** | `AUTH-002` | AUTH-002 \| admin login redirects to the admin dashboard | Uses the public admin test credentials coded in the automation: `admin@practicesoftwaretesting.com` / `welcome01`. |
| 46 | **F-UI-02** | `PROD-008` | PROD-008 \| a valid in-stock product can be added to the cart with visible confirmation | Uses the separate API fixture to dynamically discover a current in-stock product, then opens that product through the UI. No product ID/name is hard-coded. |
| 47 | **F-UI-02** | `PROD-009` | PROD-009 \| an out-of-stock, non-rental product disables Add to Cart and shows the out-of-stock label | Uses API-driven catalogue discovery to dynamically locate a current out-of-stock, non-rental product, then validates the corresponding product-detail UI. |
| 48 | **F-UI-03** | `CKO-001 + CKO-027` | CKO-001 + CKO-027 \| authenticated user completes checkout and sees the order confirmation | Dynamically discovers an in-stock product through the API fixture; logs in using `DEMO_CUSTOMER`; uses `validBillingAddress` (`Austria`, postcode `1010`, house `1`) and `validCreditCardCase` (`4111-1111-1111-1111`, `12/2030`, `123`, `Test User`) from `data/checkoutTestData.js`. The invoice number is generated by the application at runtime. |
| 49 | **F-UI-04** | `INV-003 + INV-005` | INV-003 + INV-005 \| invoice detail renders the exact confirmed discounted total | API setup logs in with `DEMO_CUSTOMER`, dynamically discovers one rental and one eco-friendly product, creates a fresh cart with rental quantity `1` and eco quantity `2`, builds a valid billing address using the real postcode lookup, and creates a cash-on-delivery invoice. The invoice's generated ID/number/total become the expected UI data; total is compared with cents-safe conversion. |

---

## 6. Final Implemented Automation Scope

| Layer | Count |
|---|---:|
| API automated subcases | **43** |
| UI automated subcases | **6** |
| **Total executable Playwright subcases** | **49** |

The **49 executable tests/subcases** above are the automation cases actually implemented in the feature-branch suite. This should not be confused with the larger generated scenario/strategy catalogue, which represents broader design candidates rather than completed executable automation.

The same implemented suite is used for CLEAN and BUGGY execution so expected behaviour is not changed simply because the deliberately defective environment fails.
