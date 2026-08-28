# Cart — Test Scenarios

> Baseline: Clean Sprint 5 (`sprint5/UI`, `sprint5/API`) only. Derived from `docs/ai-knowledge/business-rules.md` §4–6, `user-flows.md` §4–7/§11c, `api-reference.md` (Cart), `ui-reference.md` (Checkout — Cart Step). `sprint5-with-bugs/**` was not consulted. Discount/total arithmetic correctness itself is covered in [financial-calculations-test-scenarios.md](financial-calculations-test-scenarios.md); this file focuses on cart CRUD/state behavior.

## Scope

Server-persisted cart creation, add/update/remove item, quantity boundaries, empty-cart state, continue-shopping, and cart-level discount state transitions.

## Scenarios

#### CART-001 — Create a New Cart
- **Feature / Module:** Cart — Creation
- **Objective:** Verify a new cart is created when none exists yet.
- **Preconditions:** No existing cart/session cart id.
- **Test Data / Inputs:** Optional `lat`/`lng`.
- **Test Steps:** 1) Call `POST /carts`.
- **Expected Result:** 201 response with a new cart id.
- **Business Rule / Requirement Reference:** api-reference.md (Cart — `POST /carts`).
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CART-002 — Add Item to Cart with Valid Product and Quantity
- **Feature / Module:** Cart — Add Item
- **Objective:** Verify a valid product/quantity is added to the cart.
- **Preconditions:** Cart exists; product exists.
- **Test Data / Inputs:** Valid `product_id`, `quantity` between 1–99.
- **Test Steps:** 1) Call `POST /carts/{id}` with valid `product_id`/`quantity`.
- **Expected Result:** 200; cart item created/updated with the specified quantity.
- **Business Rule / Requirement Reference:** business-rules.md §4.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CART-003 — Add Item Rejected — Non-Existent Product ID
- **Feature / Module:** Cart — Add Item
- **Objective:** Verify adding a non-existent `product_id` is rejected.
- **Preconditions:** Cart exists.
- **Test Data / Inputs:** A syntactically valid but non-existent `product_id`.
- **Test Steps:** 1) Call `POST /carts/{id}` with a non-existent `product_id`.
- **Expected Result:** 422 validation error (`exists:products,id`).
- **Business Rule / Requirement Reference:** business-rules.md §4.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CART-004 — Add Item Rejected — Quantity Below Minimum (0)
- **Feature / Module:** Cart — Add Item / Boundary
- **Objective:** Verify a quantity of 0 is rejected.
- **Preconditions:** Cart exists; product exists.
- **Test Data / Inputs:** `quantity = 0`.
- **Test Steps:** 1) Call `POST /carts/{id}` with `quantity = 0`.
- **Expected Result:** 422 validation error (`min:1`).
- **Business Rule / Requirement Reference:** business-rules.md §4; §14.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CART-005 — Add Item Boundary — Quantity Exactly 1
- **Feature / Module:** Cart — Add Item / Boundary
- **Objective:** Verify the minimum valid quantity (1) is accepted.
- **Preconditions:** Cart exists; product exists.
- **Test Data / Inputs:** `quantity = 1`.
- **Test Steps:** 1) Call `POST /carts/{id}` with `quantity = 1`.
- **Expected Result:** 200; item added with quantity 1.
- **Business Rule / Requirement Reference:** business-rules.md §4.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CART-006 — Add Item Boundary — Quantity Exactly 99
- **Feature / Module:** Cart — Add Item / Boundary
- **Objective:** Verify the maximum valid quantity (99) is accepted.
- **Preconditions:** Cart exists; product exists.
- **Test Data / Inputs:** `quantity = 99`.
- **Test Steps:** 1) Call `POST /carts/{id}` with `quantity = 99`.
- **Expected Result:** 200; item added with quantity 99.
- **Business Rule / Requirement Reference:** business-rules.md §4.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CART-007 — Add Item Rejected — Quantity Exceeds Maximum (100)
- **Feature / Module:** Cart — Add Item / Boundary
- **Objective:** Verify a quantity of 100 is rejected server-side.
- **Preconditions:** Cart exists; product exists.
- **Test Data / Inputs:** `quantity = 100`.
- **Test Steps:** 1) Call `POST /carts/{id}` with `quantity = 100`.
- **Expected Result:** 422 validation error (`max:99`).
- **Business Rule / Requirement Reference:** business-rules.md §4; §14.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CART-008 — Adding Same Product Twice Increments Existing Line
- **Feature / Module:** Cart — Add Item
- **Objective:** Verify a repeated add of the same product increments the existing cart item instead of duplicating a line.
- **Preconditions:** Cart already contains the product with quantity N.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Call `POST /carts/{id}` again for the same `product_id` with an additional quantity M.
- **Expected Result:** Cart shows a single line for the product with quantity N+M.
- **Business Rule / Requirement Reference:** business-rules.md §4.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** Excludes the "Thor Hammer" special case — see PROD-014 in product-test-scenarios.md.

#### CART-009 — Get Cart Contents Returns Items and Discount Fields
- **Feature / Module:** Cart — Retrieval
- **Objective:** Verify `GET /carts/{id}` returns line items plus discount-related fields.
- **Preconditions:** Cart has at least one item.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Call `GET /carts/{id}`.
- **Expected Result:** 200; response includes cart items and `additional_discount_percentage` (and per-item `discount_percentage` where applicable).
- **Business Rule / Requirement Reference:** business-rules.md §6.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CART-010 — Get Cart Contents — Non-Existent Cart Returns 404
- **Feature / Module:** Cart — Retrieval
- **Objective:** Verify requesting a non-existent cart ID returns 404.
- **Preconditions:** None.
- **Test Data / Inputs:** Non-existent cart id.
- **Test Steps:** 1) Call `GET /carts/{id}` with an invalid/non-existent id.
- **Expected Result:** 404.
- **Business Rule / Requirement Reference:** api-reference.md (Cart — `GET /carts/{id}`).
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CART-011 — Update Cart Item Quantity (Valid Value)
- **Feature / Module:** Cart — Update Quantity
- **Objective:** Verify updating a cart item's quantity via the API recalculates line/cart totals.
- **Preconditions:** Cart item exists.
- **Test Data / Inputs:** New valid quantity (1–99).
- **Test Steps:** 1) Call `PUT /carts/{id}/product/quantity` with a new valid quantity.
- **Expected Result:** 200; line total and cart total recalculate; confirmation message "Product quantity updated." shown in UI (per docs/user-stories/v5.md — Checkout Cart Review AC2).
- **Business Rule / Requirement Reference:** business-rules.md §5; user-flows.md §5.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), UI
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** Confirmation message sourced from docs/user-stories/v5.md; exact toast wiring not independently re-verified in `cart.component.ts` in this knowledge-base pass.

#### CART-012 — Update Quantity via UI Clamps and Warns Beyond 99
- **Feature / Module:** Cart — Update Quantity (UI)
- **Objective:** Verify typing a quantity greater than 99 in the cart-step quantity input is clamped with a toast warning.
- **Preconditions:** On `/checkout` cart step with an existing item.
- **Test Data / Inputs:** Typed value of 150 into `product-quantity` input.
- **Test Steps:** 1) Type `150` into the quantity input for a cart line. 2) Trigger the change event.
- **Expected Result:** Value clamps to 99; toast "You can order at most 99 of this product." shown.
- **Business Rule / Requirement Reference:** business-rules.md §5.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** Component (UI)
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CART-013 — Update Quantity Rejected — Non-Existent Product in Cart
- **Feature / Module:** Cart — Update Quantity
- **Objective:** Verify updating quantity for a product not present in the cart is rejected.
- **Preconditions:** Cart exists without the target product.
- **Test Data / Inputs:** `product_id` not in the cart.
- **Test Steps:** 1) Call `PUT /carts/{id}/product/quantity` for a product not in the cart.
- **Expected Result:** `Not confirmed from clean Sprint 5 source` — `api-reference.md` documents both 404 and 422 as generic possible codes for this endpoint, but does not specify which applies to this specific condition (product absent from cart).
- **Business Rule / Requirement Reference:** business-rules.md §5.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** No
- **Notes / Risks:** Confirm the exact status code returned for this condition against current implementation before automating a strict assertion; assert only "request rejected, no update applied" generically until confirmed.

#### CART-014 — Remove Item from Cart Recalculates Totals
- **Feature / Module:** Cart — Remove Item
- **Objective:** Verify deleting a cart item removes it and recalculates cart/discount totals.
- **Preconditions:** Cart has 2+ items, including a combination-discount-eligible mix (rental + non-rental).
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Delete one cart item via `DELETE /carts/{cartId}/product/{productId}`.
- **Expected Result:** Item removed; `updateCartDiscounts()` recalculates totals; if the removed item was the only rental (or only non-rental) item, the combination discount is removed.
- **Business Rule / Requirement Reference:** business-rules.md §5; §6; user-flows.md §6.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CART-015 — Empty Cart Shows "Your Shopping Cart Is Empty"
- **Feature / Module:** Cart — Empty State
- **Objective:** Verify the empty-cart message is shown when no items remain.
- **Preconditions:** Cart has zero items (all removed, or never added).
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Navigate to `/checkout` with an empty cart.
- **Expected Result:** "Your shopping cart is empty." message shown.
- **Business Rule / Requirement Reference:** business-rules.md §5; user-flows.md §11c.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CART-016 — Proceed Button Disabled Until Cart Has an Item
- **Feature / Module:** Cart — Cart Review Step
- **Objective:** Verify "Proceed" is not actionable while the cart is empty and becomes actionable once an item is added.
- **Preconditions:** None.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) On `/checkout` with an empty cart, observe `proceed-1`. 2) Add an item. 3) Re-observe `proceed-1`.
- **Expected Result:** `proceed-1` disabled while cart is empty; enabled once `cart.cart_items.length > 0`.
- **Business Rule / Requirement Reference:** business-rules.md §5.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CART-017 — Continue Shopping Preserves Cart State
- **Feature / Module:** Cart — Navigation
- **Objective:** Verify clicking "Continue Shopping" returns to the overview without altering cart contents.
- **Preconditions:** Cart has at least one item.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) On the cart step, click `continue-shopping`. 2) Return to `/checkout`.
- **Expected Result:** Route changes to `/`; cart contents unchanged when revisiting checkout.
- **Business Rule / Requirement Reference:** user-flows.md §7.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CART-018 — Delete Cart Removes All Contents
- **Feature / Module:** Cart — Deletion
- **Objective:** Verify `DELETE /carts/{cartId}` removes the entire cart.
- **Preconditions:** Cart exists with items.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Call `DELETE /carts/{cartId}`. 2) Attempt `GET /carts/{cartId}`.
- **Expected Result:** 204 on delete; subsequent GET returns 404.
- **Business Rule / Requirement Reference:** api-reference.md (Cart — `DELETE /carts/{cartId}`).
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** Primarily a test-cleanup mechanism per API reference, but also validates the underlying deletion contract.

#### CART-019 — Location-Based Discount Percentage Stored on Cart Item
- **Feature / Module:** Cart — Add Item / Geo Discount
- **Objective:** Verify adding a location-offer product to a cart with `lat`/`lng` set stores a computed discount percentage.
- **Preconditions:** Cart created with `lat`/`lng` matching a supported city; product has `is_location_offer = true`.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Create a cart with matching `lat`/`lng`. 2) Add a location-offer product.
- **Expected Result:** Cart item's discount percentage is computed and stored per the city match table. Exact percentage values are covered in [financial-calculations-test-scenarios.md](financial-calculations-test-scenarios.md) (FIN-003–FIN-005).
- **Business Rule / Requirement Reference:** business-rules.md §4; §6.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —
