# Product — Test Scenarios

> Baseline: Clean Sprint 5 (`sprint5/UI`, `sprint5/API`) only. Derived from `docs/ai-knowledge/business-rules.md` §3, `user-flows.md` §1/§3, `api-reference.md` (Products, Product Specs), `ui-reference.md` (Product Detail, Comparison, Rentals). `sprint5-with-bugs/**` was not consulted.

## Scope

Product detail page: display, quantity controls, add-to-cart, rental duration, add-to-favorites (cross-referenced with Authentication & Accounts), related products, specs, and product comparison.

## Scenarios

#### PROD-001 — Product Detail Displays Core Information
- **Feature / Module:** Product — Detail Page
- **Objective:** Verify the product detail page renders image, name, description, price, category badge, and brand badge.
- **Preconditions:** A published product exists.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Navigate to `/product/:id` for a known product.
- **Expected Result:** Image, name, description, price, category badge, and brand badge are all displayed.
- **Business Rule / Requirement Reference:** business-rules.md §3.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### PROD-002 — Discounted Product Shows Original and Discounted Price
- **Feature / Module:** Product — Detail Page
- **Objective:** Verify a discounted product's detail page shows the original price struck through, discounted price, and percentage badge.
- **Preconditions:** A product with an active discount.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Navigate to a discounted product's detail page.
- **Expected Result:** `unit-price` shown struck through; `offer-price` shown alongside a discount-percentage badge.
- **Business Rule / Requirement Reference:** business-rules.md §3.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### PROD-003 — Related Products Displayed Below Detail
- **Feature / Module:** Product — Detail Page
- **Objective:** Verify related (same-category) products are listed on the detail page.
- **Preconditions:** Product's category has other products.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Navigate to a product's detail page. 2) Scroll to the related-products section.
- **Expected Result:** Related products from the same category are listed; backed by `GET /products/{id}/related`.
- **Business Rule / Requirement Reference:** business-rules.md §3; user-flows.md §1.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** API (primary), UI
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### PROD-004 — Default Quantity Is 1
- **Feature / Module:** Product — Detail Page / Quantity
- **Objective:** Verify the quantity field defaults to 1 on page load.
- **Preconditions:** None.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Navigate to a non-rental product's detail page. 2) Observe the `quantity` input value.
- **Expected Result:** Quantity input shows `1`.
- **Business Rule / Requirement Reference:** business-rules.md §3.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** Component (UI)
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### PROD-005 — Minus Button Never Decreases Quantity Below 1
- **Feature / Module:** Product — Detail Page / Quantity
- **Objective:** Verify the decrease-quantity button has no effect once quantity is at 1.
- **Preconditions:** None.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) With quantity at 1, click `decrease-quantity` repeatedly.
- **Expected Result:** Quantity remains 1; never goes to 0 or negative.
- **Business Rule / Requirement Reference:** business-rules.md §3.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** Component (UI)
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### PROD-006 — Plus Button Increases Quantity by 1
- **Feature / Module:** Product — Detail Page / Quantity
- **Objective:** Verify the increase-quantity button increments by exactly 1 per click.
- **Preconditions:** None.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Click `increase-quantity` three times from the default value of 1.
- **Expected Result:** Quantity shows 4.
- **Business Rule / Requirement Reference:** business-rules.md §3.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** Component (UI)
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### PROD-007 — Quantity Clamped at Effective Maximum (99)
- **Feature / Module:** Product — Detail Page / Quantity
- **Objective:** Verify quantity cannot exceed the effective system-wide cap of 99, and a warning toast is shown when exceeded.
- **Preconditions:** None.
- **Test Data / Inputs:** Manually typed quantity of 100+ or repeated `increase-quantity` clicks past 99.
- **Test Steps:** 1) Attempt to set quantity above 99 via typing or the plus button.
- **Expected Result:** `Needs Human Review` — clean sources conflict on the maximum quantity boundary: docs/user-stories/v5.md (Product Detail AC7) states the value is clamped between 1 and 999,999,999, while `sprint5/UI/src/app/products/detail/detail.component.ts` (`MAX_QUANTITY = 99`) and `sprint5/API/app/Http/Controllers/CartController.php` (`max:99`) both independently clamp/reject at 99. Until reconciled with the team, verify against the effective implementation cap (99) — value clamps to 99 with `warnMaxQuantity()` toast shown, and server-side `POST /carts/{id}`/`PUT .../quantity` reject quantity > 99 (422) — and separately log the documentation discrepancy.
- **Business Rule / Requirement Reference:** business-rules.md §3 (docs/user-stories/v5.md Product Detail AC7 vs. `sprint5/UI/.../detail.component.ts` `MAX_QUANTITY=99` and `sprint5/API/.../CartController.php` `max:99`).
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** Component (UI, primary), API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** Automate against the effective implementation cap (99); raise the documentation discrepancy (999,999,999 vs. 99) with the team as a separate documentation-accuracy issue.

#### PROD-008 — Add to Cart Shows Success Message
- **Feature / Module:** Product — Detail Page / Add to Cart
- **Objective:** Verify adding a product to the cart shows a success confirmation.
- **Preconditions:** Product is in stock (or is a rental item).
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Set a valid quantity. 2) Click `add-to-cart`.
- **Expected Result:** Success message shown ("Product added to shopping cart." per docs/user-stories/v5.md AC8); cart badge count increments.
- **Business Rule / Requirement Reference:** business-rules.md §3; user-flows.md §4.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** UI / End-to-End (primary), API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** Message text sourced from docs/user-stories/v5.md; not independently re-traced against a translation file in this knowledge-base pass.

#### PROD-009 — Add to Cart Disabled for Out-of-Stock Non-Rental Product
- **Feature / Module:** Product — Detail Page / Add to Cart
- **Objective:** Verify the Add to Cart button is disabled and "Out of stock" shown in red for a non-rental, zero-stock product.
- **Preconditions:** Non-rental product with zero stock.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Navigate to the out-of-stock product's detail page.
- **Expected Result:** `add-to-cart` button is disabled; `out-of-stock` badge shown in red.
- **Business Rule / Requirement Reference:** business-rules.md §3.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### PROD-010 — Rental Product Shows Duration Slider Instead of Quantity Controls
- **Feature / Module:** Product — Detail Page / Rentals
- **Objective:** Verify rental products present a 1–10 hour duration slider in place of quantity +/- controls.
- **Preconditions:** Product `is_rental = true`.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Navigate to a rental product's detail page.
- **Expected Result:** Duration slider shown (`floor:1, ceil:10`) instead of quantity controls; total price = hourly rate × selected duration.
- **Business Rule / Requirement Reference:** business-rules.md §3.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** Component (UI, primary), UI/E2E
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### PROD-011 — Rental Duration Boundary — Minimum (1 Hour)
- **Feature / Module:** Product — Detail Page / Rentals
- **Objective:** Verify the rental duration slider cannot go below 1 hour.
- **Preconditions:** None.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Attempt to drag the rental duration slider below 1.
- **Expected Result:** Slider clamps at 1 hour; total = hourly rate × 1.
- **Business Rule / Requirement Reference:** business-rules.md §3.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** Component (UI)
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### PROD-012 — Rental Duration Boundary — Maximum (10 Hours)
- **Feature / Module:** Product — Detail Page / Rentals
- **Objective:** Verify the rental duration slider cannot exceed 10 hours.
- **Preconditions:** None.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Attempt to drag the rental duration slider above 10.
- **Expected Result:** Slider clamps at 10 hours; total = hourly rate × 10.
- **Business Rule / Requirement Reference:** business-rules.md §3.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** Component (UI)
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### PROD-013 — Add to Cart of Same Product Twice Increments Quantity
- **Feature / Module:** Product — Detail Page / Add to Cart
- **Objective:** Verify adding the same product twice increments the existing cart line rather than creating a duplicate.
- **Preconditions:** Cart already contains 1 unit of a product.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Add 1 more unit of the same product from its detail page.
- **Expected Result:** Cart shows a single line for the product with quantity incremented (e.g., 1 → 2), not two separate lines.
- **Business Rule / Requirement Reference:** business-rules.md §4; user-flows.md §4.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** API (primary), UI
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### PROD-014 — "Thor Hammer" Special Case Limits Cart to a Single Unit
- **Feature / Module:** Product — Detail Page / Add to Cart (Special Case)
- **Objective:** Verify the product literally named "Thor Hammer" cannot exceed a quantity of 1 in the cart.
- **Preconditions:** A product named exactly "Thor Hammer" exists in the catalog.
- **Test Data / Inputs:** Attempt to add "Thor Hammer" with `quantity > 1`, or add it a second time after it's already in the cart.
- **Test Steps:** 1) Add "Thor Hammer" to the cart with quantity 1. 2) Attempt to add it again, or update its quantity to 2+.
- **Expected Result:** Error "You can only have one Thor Hammer in the cart." returned; quantity remains 1.
- **Business Rule / Requirement Reference:** business-rules.md §4 (implementation-only rule confirmed via `sprint5/API/app/Services/CartService.php` `addItemToCart()`/`updateCartItemQuantity()`; not present in docs/user-stories/v5.md or docs/sprints/sprint5.md — an absence in requirements, not a conflict, since no clean source disputes the enforced behavior).
- **Test Design Technique:** Decision Table
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** The enforced behavior itself is confirmed via implementation; recommend confirming with stakeholders whether this is an intentional product rule (e.g., a demo/easter-egg constraint) or incidental test-fixture code before treating it as a formal release requirement.

#### PROD-015 — Add to Favorites from Product Detail (Cross-Reference)
- **Feature / Module:** Product — Detail Page / Favorites
- **Objective:** Verify the Add to Favorites control on the product detail page behaves per Authentication & Accounts favorites rules.
- **Preconditions:** See AUTH-030–AUTH-032 in authentication-accounts-test-scenarios.md.
- **Test Data / Inputs:** See referenced scenarios.
- **Test Steps:** See referenced scenarios.
- **Expected Result:** See referenced scenarios.
- **Business Rule / Requirement Reference:** business-rules.md §3; see [authentication-accounts-test-scenarios.md](authentication-accounts-test-scenarios.md).
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** Avoid duplicating full favorites coverage here — cross-referenced to prevent redundant maintenance.

#### PROD-016 — Product Specs Table Displays Name/Value/Unit
- **Feature / Module:** Product — Detail Page / Specs
- **Objective:** Verify the specs table renders spec rows with name, value, and unit.
- **Preconditions:** Product has one or more specs defined.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Navigate to a product with specs. 2) Inspect the `product-specs` table.
- **Expected Result:** Each `spec-row` shows `spec-name`, `spec-value`, and `spec-unit`.
- **Business Rule / Requirement Reference:** api-reference.md (Product Specs, Images, Misc.); ui-reference.md (Product Detail).
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** API (primary), UI
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### PROD-017 — Product Comparison — Add and View Side-by-Side
- **Feature / Module:** Product — Comparison
- **Objective:** Verify products toggled for comparison render side-by-side on `/comparison`.
- **Preconditions:** Two or more products toggled via `compare-btn`/`add-to-compare`.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Toggle compare on 2+ products. 2) Navigate to `/comparison`.
- **Expected Result:** Selected products render in a comparison table (price, brand, category, stock, CO2 rating, eco flag, specs, description).
- **Business Rule / Requirement Reference:** user-flows.md §3.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** Backing data-fetch mechanism (REST vs. GraphQL) is Not confirmed from clean Sprint 5 source for this REST-scoped assessment — treat comparison as a UI-level scenario only.

#### PROD-018 — Product Comparison Empty State
- **Feature / Module:** Product — Comparison
- **Objective:** Verify the comparison page shows an empty state with a link back to the overview when nothing is selected.
- **Preconditions:** No products currently selected for comparison.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Navigate directly to `/comparison` with no items selected.
- **Expected Result:** `comparison-empty` state shown with a link back to `/`.
- **Business Rule / Requirement Reference:** user-flows.md §3.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### PROD-019 — Product Comparison "Show Only Differences" Toggle
- **Feature / Module:** Product — Comparison
- **Objective:** Verify toggling "Show only differences" filters spec rows to only those that differ between compared products.
- **Preconditions:** 2+ products with at least one differing and one identical spec value.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Enable `show-differences` toggle.
- **Expected Result:** Only differing spec rows remain visible.
- **Business Rule / Requirement Reference:** user-flows.md §3.
- **Test Design Technique:** Decision Table
- **Recommended Test Layer:** Component (UI)
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### PROD-020 — Non-Existent Product ID Returns Not Found
- **Feature / Module:** Product — Detail Page
- **Objective:** Verify navigating to a non-existent product ID is handled gracefully.
- **Preconditions:** None.
- **Test Data / Inputs:** A syntactically valid but non-existent product ID.
- **Test Steps:** 1) Navigate to `/product/:id` using a non-existent ID.
- **Expected Result:** `GET /products/{id}` returns 404; UI shows an appropriate not-found state.
- **Business Rule / Requirement Reference:** api-reference.md (Products — `GET /products/{id}`, 404).
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), UI
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** Specific UI not-found presentation not independently confirmed — verify against current `detail.component.ts` error handling.
