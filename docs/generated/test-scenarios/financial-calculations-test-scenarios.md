# Financial Calculations — Test Scenarios

> Baseline: Clean Sprint 5 (`sprint5/UI`, `sprint5/API`) only. Derived from `docs/ai-knowledge/business-rules.md` §6, `api-reference.md` (Cart, Invoices). `sprint5-with-bugs/**` was not consulted. These scenarios isolate calculation correctness (line totals, discounts, rounding, currency, invoice numbering); cart/checkout CRUD workflow is covered in [cart-test-scenarios.md](cart-test-scenarios.md) and [checkout-payment-test-scenarios.md](checkout-payment-test-scenarios.md).

## Scope

Per-item line totals, geo-location discount, rental+non-rental combination discount, eco-friendly discount, discount stacking order, rounding rules, currency display, absence of tax, and invoice numbering.

## Scenarios

#### FIN-001 — Line Total Equals Quantity × Unit Price (No Discount)
- **Feature / Module:** Financial Calculations — Line Total
- **Objective:** Verify a non-discounted line item's total equals quantity × unit price.
- **Preconditions:** Product with no active discount.
- **Test Data / Inputs:** Quantity = 3, unit price = $10.00.
- **Test Steps:** 1) Add 3 units of a $10.00 product to the cart. 2) Inspect the cart's line-price field.
- **Expected Result:** Line total = $30.00.
- **Business Rule / Requirement Reference:** business-rules.md §6.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** Unit (service-level, primary), API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### FIN-002 — Line Total Uses Discounted Unit Price When a Per-Item Discount Applies
- **Feature / Module:** Financial Calculations — Line Total
- **Objective:** Verify a discounted product's line total uses the discounted unit price, not the original.
- **Preconditions:** Product with a per-item discount (e.g., a location-offer discount already applied to the cart item).
- **Test Data / Inputs:** Quantity = 2, unit price = $20.00, item discount = 10%.
- **Test Steps:** 1) Add 2 units of the discounted product. 2) Inspect the cart's line-price/offer-price field.
- **Expected Result:** Discounted unit price = $18.00; line total = $36.00 (`quantity × discountedPrice`).
- **Business Rule / Requirement Reference:** business-rules.md §6.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** Unit (primary), API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### FIN-003 — Geo-Location Discount Applied for Matching City (New York, 5%)
- **Feature / Module:** Financial Calculations — Geo-Location Discount
- **Objective:** Verify a cart with New York coordinates and a location-offer product receives a 5% discount.
- **Preconditions:** Cart `lat`/`lng` set to New York's coordinates (or within ±2 degrees); product `is_location_offer = true`.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Create a cart with New York `lat`/`lng`. 2) Add a location-offer product.
- **Expected Result:** Cart item's discount percentage = 5%.
- **Business Rule / Requirement Reference:** business-rules.md §6.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** Unit (primary), API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### FIN-004 — Geo-Location Discount Applied for Each Supported City
- **Feature / Module:** Financial Calculations — Geo-Location Discount
- **Objective:** Verify the correct discount percentage is applied for each of the five supported cities.
- **Preconditions:** None.
- **Test Data / Inputs:** Coordinates for New York (5%), Mumbai (10%), Tokyo (15%), Amsterdam (20%), London (25%).
- **Test Steps:** 1) For each city, create a cart with matching coordinates and add a location-offer product.
- **Expected Result:** Discount percentage matches the city-specific value in each case.
- **Business Rule / Requirement Reference:** business-rules.md §6.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** Unit (primary), API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** Data-driven test recommended (one scenario, five data rows).

#### FIN-005 — Geo-Location Discount Not Applied Outside ±2-Degree Range
- **Feature / Module:** Financial Calculations — Geo-Location Discount / Boundary
- **Objective:** Verify no discount is applied when coordinates fall outside the ±2 degree match window for any supported city.
- **Preconditions:** None.
- **Test Data / Inputs:** Coordinates just beyond ±2 degrees from every supported city (e.g., New York lat/lng + 2.1 degrees).
- **Test Steps:** 1) Create a cart with out-of-range coordinates. 2) Add a location-offer product.
- **Expected Result:** Discount percentage = 0% (no match, no discount).
- **Business Rule / Requirement Reference:** business-rules.md §6.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** Unit (primary), API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### FIN-006 — Geo-Location Discount Boundary — Exactly ±2 Degrees
- **Feature / Module:** Financial Calculations — Geo-Location Discount / Boundary
- **Objective:** Verify the inclusive boundary condition (`abs(diff) <= 2`) at exactly 2 degrees still matches.
- **Preconditions:** None.
- **Test Data / Inputs:** Coordinates exactly 2.0 degrees from a supported city's lat/lng.
- **Test Steps:** 1) Create a cart with coordinates exactly 2 degrees off from a supported city. 2) Add a location-offer product.
- **Expected Result:** Discount is applied (boundary is inclusive: `<= 2`).
- **Business Rule / Requirement Reference:** business-rules.md §6.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** Unit
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### FIN-007 — Combination Discount Applied for Mixed Rental + Non-Rental Cart (15%)
- **Feature / Module:** Financial Calculations — Combination Discount
- **Objective:** Verify a cart containing at least one rental and one non-rental item receives an additional 15% discount on the subtotal.
- **Preconditions:** None.
- **Test Data / Inputs:** One rental product + one non-rental product in the same cart.
- **Test Steps:** 1) Add a rental product to the cart. 2) Add a non-rental product to the same cart.
- **Expected Result:** `additional_discount_percentage = 15`.
- **Business Rule / Requirement Reference:** business-rules.md §6.
- **Test Design Technique:** Decision Table
- **Recommended Test Layer:** Unit (primary), API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### FIN-008 — Combination Discount Not Applied for Rental-Only or Non-Rental-Only Cart
- **Feature / Module:** Financial Calculations — Combination Discount
- **Objective:** Verify the combination discount is absent when the cart contains only rental items or only non-rental items.
- **Preconditions:** None.
- **Test Data / Inputs:** Cart A: rental items only. Cart B: non-rental items only.
- **Test Steps:** 1) Build Cart A and Cart B as described. 2) Inspect `additional_discount_percentage` for each.
- **Expected Result:** `additional_discount_percentage = null` (no discount) for both carts.
- **Business Rule / Requirement Reference:** business-rules.md §6.
- **Test Design Technique:** Decision Table
- **Recommended Test Layer:** Unit (primary), API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### FIN-009 — Combination Discount Removed When Cart No Longer Mixes Item Types
- **Feature / Module:** Financial Calculations — Combination Discount / State Transition
- **Objective:** Verify removing the only rental (or only non-rental) item removes the 15% combination discount.
- **Preconditions:** Cart with the combination discount active (one rental + one non-rental item).
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Remove the rental item from the cart. 2) Inspect `additional_discount_percentage`.
- **Expected Result:** Discount reverts to `null` (removed) since the cart no longer has both types.
- **Business Rule / Requirement Reference:** business-rules.md §6; user-flows.md §6.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** Unit (primary), API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### FIN-010 — Eco-Friendly Discount Applied When >50% of Quantity Is CO2 Rating A/B
- **Feature / Module:** Financial Calculations — Eco-Friendly Discount
- **Objective:** Verify a 5% eco-friendly discount is applied at invoice creation when more than half of total product quantity has CO2 rating A or B.
- **Preconditions:** None.
- **Test Data / Inputs:** Cart with total quantity 10, of which 6 units are CO2 rating A/B products.
- **Test Steps:** 1) Build the cart as described. 2) Complete checkout to create the invoice. 3) Inspect the invoice's eco-discount field.
- **Expected Result:** 5% eco-friendly discount applied (6/10 = 60% > 50%).
- **Business Rule / Requirement Reference:** business-rules.md §6 (implementation-only rule confirmed via `sprint5/API/app/Services/InvoiceService.php`; not described in docs/user-stories/v5.md or docs/sprints/sprint5.md — an absence in requirements, not a conflict, since no clean source disputes the calculation).
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** Unit (primary), API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** The calculation itself is confirmed via implementation; recommend confirming with stakeholders that this undocumented rule is an intended feature before treating it as a formal release requirement.

#### FIN-011 — Eco-Friendly Discount Boundary — Exactly 50% Does Not Qualify
- **Feature / Module:** Financial Calculations — Eco-Friendly Discount / Boundary
- **Objective:** Verify the discount is NOT applied when exactly 50% (not more than 50%) of quantity is CO2 rating A/B.
- **Preconditions:** None.
- **Test Data / Inputs:** Cart with total quantity 10, of which exactly 5 units are CO2 rating A/B.
- **Test Steps:** 1) Build the cart as described. 2) Complete checkout. 3) Inspect the invoice's eco-discount field.
- **Expected Result:** No eco-friendly discount applied — rule requires strictly greater than 50% (`> 0.5`), and 5/10 = exactly 50%.
- **Business Rule / Requirement Reference:** business-rules.md §6 (implementation-only rule confirmed via `sprint5/API/app/Services/InvoiceService.php`; same undocumented-in-requirements status as FIN-010, not a conflict).
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** Unit
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### FIN-012 — Discount Stacking Order: Eco Discount Computed on Post-Combination-Discount Subtotal
- **Feature / Module:** Financial Calculations — Discount Stacking
- **Objective:** Verify the eco discount is calculated on the subtotal AFTER the combination discount is applied, not on the raw subtotal.
- **Preconditions:** None.
- **Test Data / Inputs:** Cart subtotal = $100.00; combination discount = 15%; eco-friendly discount qualifies (5%).
- **Test Steps:** 1) Build a cart meeting both the combination-discount and eco-discount conditions with a $100.00 subtotal. 2) Complete checkout. 3) Inspect the invoice's discount breakdown.
- **Expected Result:** `additional_discount_amount = 100.00 × 0.15 = $15.00`; `eco_discount_amount = (100.00 − 15.00) × 0.05 = $4.25`; `total = 100.00 − 15.00 − 4.25 = $80.75`.
- **Business Rule / Requirement Reference:** business-rules.md §6 (arithmetic sequencing confirmed via `InvoiceService.php`; the underlying eco-discount feature is implementation-only and not described in docs/user-stories/v5.md — see FIN-010/FIN-011 — but this is an absence in requirements, not a conflict).
- **Test Design Technique:** Decision Table
- **Recommended Test Layer:** Unit (primary), API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** This is the highest-value scenario for catching discount-order regressions — treat as a core financial regression test.

#### FIN-013 — Per-Item Discounted Price Rounded to 2 Decimal Places
- **Feature / Module:** Financial Calculations — Rounding
- **Objective:** Verify a per-item discounted price that would otherwise have more than 2 decimal digits is rounded to 2 places before use in totals.
- **Preconditions:** None.
- **Test Data / Inputs:** Unit price = $19.99, item discount = 33% (`19.99 × 0.67 = 13.3933`).
- **Test Steps:** 1) Apply a 33% discount to a $19.99 item. 2) Inspect the stored/displayed discounted unit price.
- **Expected Result:** Discounted price rounds to $13.39 (`round(19.99 * 0.67, 2)`).
- **Business Rule / Requirement Reference:** business-rules.md §6.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** Unit
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** Whether subtotal/total themselves are separately rounded (beyond native double precision) is Not confirmed from clean Sprint 5 source — do not assert rounding behavior on the aggregate subtotal/total fields without further investigation.

#### FIN-014 — Currency Display Uses `$` Prefix with 2 Decimal Places
- **Feature / Module:** Financial Calculations — Currency Display
- **Objective:** Verify all displayed prices (cart, invoice) use a literal `$` prefix with exactly 2 decimal places.
- **Preconditions:** None.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Inspect price displays on the cart step and invoice detail page for several values (whole numbers, values with 1 decimal, values with fractional cents).
- **Expected Result:** All amounts display as `$X.XX` (e.g., `$5.00`, not `$5` or `$5.0`).
- **Business Rule / Requirement Reference:** business-rules.md §6.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** Display formatting only (Angular `number:'1.2-2'` pipe) — not a stored-value rounding guarantee.

#### FIN-015 — No Tax Field or Tax Calculation Present
- **Feature / Module:** Financial Calculations — Tax
- **Objective:** Confirm no tax amount is calculated or displayed anywhere in the cart or invoice.
- **Preconditions:** None.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Inspect cart totals and invoice detail response/UI for any tax-related field.
- **Expected Result:** `Not confirmed from clean Sprint 5 source` — no tax field, tax rate, or tax calculation was located in `Cart`, `CartItem`, `Invoice`, or `Invoiceline` models, `InvoiceService.php`, or docs/user-stories/v5.md / docs/sprints/sprint5.md during this knowledge-base pass, but absence cannot be conclusively established as a guaranteed system-wide contract from this evidence alone.
- **Business Rule / Requirement Reference:** business-rules.md §6 (Not confirmed from clean Sprint 5 source — no tax field/rate/calculation found in `Cart`, `CartItem`, `Invoice`, `Invoiceline` models, `InvoiceService.php`, or docs/user-stories/v5.md/docs/sprints/sprint5.md).
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** API
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** Use as a regression/discovery guard (tax should not unexpectedly appear) rather than asserting a conclusively confirmed absence.

#### FIN-016 — Invoice Number Format: `INV-{year}` + Zero-Padded Sequence (14 Characters Total)
- **Feature / Module:** Financial Calculations — Invoice Numbering
- **Objective:** Verify generated invoice numbers follow the documented pattern and length.
- **Preconditions:** None.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Complete a checkout. 2) Inspect the returned `invoice_number`.
- **Expected Result:** Format `INV-{current year}` followed by a zero-padded sequence, total string length 14 characters.
- **Business Rule / Requirement Reference:** business-rules.md §11.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### FIN-017 — Financial Calculation Integrity at Minimum Quantity Boundary (1)
- **Feature / Module:** Financial Calculations — Boundary
- **Objective:** Verify line/cart totals compute correctly at the minimum valid quantity of 1.
- **Preconditions:** None.
- **Test Data / Inputs:** Quantity = 1, unit price = $7.25.
- **Test Steps:** 1) Add 1 unit of a $7.25 product. 2) Inspect line total and cart total.
- **Expected Result:** Line total = $7.25; cart total reflects this correctly with no off-by-one or divide-by-zero errors.
- **Business Rule / Requirement Reference:** business-rules.md §4; §6.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** Unit
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### FIN-018 — Financial Calculation Integrity at Maximum Quantity Boundary (99)
- **Feature / Module:** Financial Calculations — Boundary
- **Objective:** Verify line/cart totals compute correctly at the maximum valid quantity of 99.
- **Preconditions:** None.
- **Test Data / Inputs:** Quantity = 99, unit price = $4.49.
- **Test Steps:** 1) Add 99 units of a $4.49 product. 2) Inspect line total and cart total.
- **Expected Result:** Line total = 99 × $4.49 = $444.51, correctly computed and rounded.
- **Business Rule / Requirement Reference:** business-rules.md §4; §6.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** Unit
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### FIN-019 — Negative or Non-Numeric Price/Quantity Injection at API Boundary Is Rejected
- **Feature / Module:** Financial Calculations — Security / Input Validation
- **Objective:** Verify direct API calls cannot manipulate financial calculations via out-of-range or non-numeric quantity values, since price itself is server-derived from the product record (not client-supplied).
- **Preconditions:** Cart exists; product exists.
- **Test Data / Inputs:** `quantity = -1`, `quantity = "abc"`, `quantity = 0`.
- **Test Steps:** 1) Call `POST /carts/{id}` and `PUT /carts/{id}/product/quantity` with each invalid quantity value.
- **Expected Result:** 422 validation error for each (`integer|min:1|max:99`); no cart item is created/updated with an invalid quantity, and no negative/erroneous total is computed.
- **Business Rule / Requirement Reference:** business-rules.md §4; §5.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** Unit price itself is not client-supplied on add-to-cart, so direct price-tampering is out of scope for this endpoint; confirm no endpoint accepts a client-supplied unit price before assuming full coverage.
