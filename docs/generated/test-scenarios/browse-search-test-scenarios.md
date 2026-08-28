# Browse / Search — Test Scenarios

> Baseline: Clean Sprint 5 (`sprint5/UI`, `sprint5/API`) only. Derived from `docs/ai-knowledge/business-rules.md` §1–2, `user-flows.md` §1–2, `api-reference.md` (Products, Brands, Categories), `ui-reference.md` (Product Overview/Category). `sprint5-with-bugs/**` was not consulted.

## Scope

Product overview/category browsing, pagination, text search, category/brand filters, eco-friendly filter, price-range slider, sorting, and the HTTP `QUERY` method contract.

## Scenarios

#### BROWSE-001 — Product Overview Loads Paginated Results (9 per Page)
- **Feature / Module:** Browse/Search — Product Overview
- **Objective:** Verify the overview page returns 9 products per page.
- **Preconditions:** More than 9 products exist in the catalog.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Navigate to `/`. 2) Observe number of product cards rendered.
- **Expected Result:** Exactly 9 products shown on page 1; pagination control (`app-pagination`) available for further pages.
- **Business Rule / Requirement Reference:** business-rules.md §1 (`paginate(9)`).
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** API (primary), UI
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### BROWSE-002 — Pagination Navigation (Next / Previous)
- **Feature / Module:** Browse/Search — Product Overview
- **Objective:** Verify pagination controls move between pages without losing active filters.
- **Preconditions:** Catalog has more than one page of results.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) On `/`, click `pagination-next`. 2) Click `pagination-prev`.
- **Expected Result:** Grid updates to show the next/previous page's 9 products; `current_page` reflected in the response/UI state.
- **Business Rule / Requirement Reference:** business-rules.md §2.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### BROWSE-003 — Search with Valid Query Length (3–40 Characters)
- **Feature / Module:** Browse/Search — Search
- **Objective:** Verify searching with a valid-length query returns matching products.
- **Preconditions:** At least one product name/description matches the query term.
- **Test Data / Inputs:** Query string of 3–40 characters matching a known product.
- **Test Steps:** 1) Enter query in `search-query` input. 2) Submit via `search-submit`.
- **Expected Result:** Grid updates to show only matching products; `resultState` flag transitions `search_started`→`search_completed`.
- **Business Rule / Requirement Reference:** business-rules.md §1; user-flows.md §1.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), UI
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### BROWSE-004 — Search Query Below Minimum Length (2 Characters) Rejected
- **Feature / Module:** Browse/Search — Search
- **Objective:** Verify a 2-character query is rejected client-side.
- **Preconditions:** None.
- **Test Data / Inputs:** 2-character search string.
- **Test Steps:** 1) Enter a 2-character query. 2) Attempt to submit.
- **Expected Result:** Client-side validation (`minLength(3)`) blocks submission; no search request is fired.
- **Business Rule / Requirement Reference:** business-rules.md §1.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** Component (UI)
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### BROWSE-005 — Search Query Boundary — Exactly 3 Characters
- **Feature / Module:** Browse/Search — Search
- **Objective:** Verify the minimum boundary (3 characters) is accepted.
- **Preconditions:** None.
- **Test Data / Inputs:** Exactly 3-character query.
- **Test Steps:** 1) Submit a 3-character search query.
- **Expected Result:** Search is accepted and executed.
- **Business Rule / Requirement Reference:** business-rules.md §1.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** Component / API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### BROWSE-006 — Search Query Boundary — Exactly 40 Characters
- **Feature / Module:** Browse/Search — Search
- **Objective:** Verify the maximum boundary (40 characters) is accepted.
- **Preconditions:** None.
- **Test Data / Inputs:** Exactly 40-character query.
- **Test Steps:** 1) Submit a 40-character search query.
- **Expected Result:** Search is accepted and executed.
- **Business Rule / Requirement Reference:** business-rules.md §1.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** Component / API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### BROWSE-007 — Search Query Exceeding 40 Characters Rejected
- **Feature / Module:** Browse/Search — Search
- **Objective:** Verify a 41+ character query is rejected client-side.
- **Preconditions:** None.
- **Test Data / Inputs:** 41-character query.
- **Test Steps:** 1) Attempt to enter/submit a 41-character query.
- **Expected Result:** Client-side validation (`maxLength(40)`) blocks submission.
- **Business Rule / Requirement Reference:** business-rules.md §1.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** Component (UI)
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### BROWSE-008 — New Search Resets Active Filters
- **Feature / Module:** Browse/Search — Search
- **Objective:** Verify submitting a new search clears previously applied category/brand/price/eco filters.
- **Preconditions:** At least one filter (e.g., category checkbox) already applied.
- **Test Data / Inputs:** Existing filter selection + new search query.
- **Test Steps:** 1) Apply a category filter. 2) Enter and submit a new search query.
- **Expected Result:** Previously applied filters are cleared; grid reflects only the new search query.
- **Business Rule / Requirement Reference:** business-rules.md §1 (sourced from docs/user-stories/v5.md AC4).
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** Sourced from docs/user-stories/v5.md AC4; not independently re-verified against `overview.component.ts` filter-reset code in this knowledge-base pass.

#### BROWSE-009 — Category Filter: Checking Parent Auto-Checks All Children
- **Feature / Module:** Browse/Search — Category Filter
- **Objective:** Verify checking a parent category automatically checks all its child categories.
- **Preconditions:** A category with child subcategories exists.
- **Test Data / Inputs:** Parent category checkbox.
- **Test Steps:** 1) Check the parent category's checkbox.
- **Expected Result:** All child category checkboxes become checked; grid filters to include all products under the parent + children.
- **Business Rule / Requirement Reference:** business-rules.md §1.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** Component (UI)
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### BROWSE-010 — Category Filter: Unchecking All Children Unchecks Parent
- **Feature / Module:** Browse/Search — Category Filter
- **Objective:** Verify unchecking all child categories automatically unchecks the parent.
- **Preconditions:** Parent + all children currently checked.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Uncheck each child category checkbox one by one.
- **Expected Result:** Once the last child is unchecked, the parent checkbox becomes unchecked as well.
- **Business Rule / Requirement Reference:** business-rules.md §1.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** Component (UI)
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### BROWSE-011 — Category and Brand Filters Combine with AND Semantics
- **Feature / Module:** Browse/Search — Filters
- **Objective:** Verify results match both the selected category AND selected brand simultaneously.
- **Preconditions:** Products exist that match category-only, brand-only, and both.
- **Test Data / Inputs:** One category checkbox + one brand checkbox.
- **Test Steps:** 1) Select a category filter. 2) Select a brand filter.
- **Expected Result:** Only products matching both the selected category and selected brand are returned (not a union of either).
- **Business Rule / Requirement Reference:** business-rules.md §1 (`scopeWithFilters()`).
- **Test Design Technique:** Decision Table
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### BROWSE-012 — Sort Options Apply Correctly (Name A–Z, Z–A, Price Low→High, High→Low)
- **Feature / Module:** Browse/Search — Sort
- **Objective:** Verify each sort option orders the product grid correctly.
- **Preconditions:** None.
- **Test Data / Inputs:** Sort values `name,asc` / `name,desc` / `price,asc` / `price,desc`.
- **Test Steps:** 1) Select each sort option from the `sort` dropdown in turn. 2) Observe the resulting order.
- **Expected Result:** Products are ordered per the selected sort criterion.
- **Business Rule / Requirement Reference:** business-rules.md §1.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), UI
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** A conditional CO2-rating sort also exists — include only if the eco/CO2 feature is enabled in the test environment.

#### BROWSE-013 — Price Range Slider Default and Absolute Bounds
- **Feature / Module:** Browse/Search — Price Filter
- **Objective:** Verify the price-range slider defaults to $1–$100 with an absolute floor/ceiling of $0/$200.
- **Preconditions:** None.
- **Test Data / Inputs:** N/A (default load state); boundary drag to $0 and $200.
- **Test Steps:** 1) Load `/` and observe default handle positions. 2) Drag handles to the absolute floor (0) and ceiling (200).
- **Expected Result:** Default handles at $1 and $100; absolute floor 0 and ceiling 200 are reachable and enforced.
- **Business Rule / Requirement Reference:** business-rules.md §1.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** Component (UI)
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### BROWSE-014 — Eco-Friendly Filter Shown Only When Feature Enabled
- **Feature / Module:** Browse/Search — Eco Filter
- **Objective:** Verify the eco-friendly checkbox and CO2 badges render only when the eco/CO2 feature toggle is enabled.
- **Preconditions:** None.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Observe presence/absence of `eco-friendly-filter` and `co2-rating-badge` elements under the test environment's feature-toggle state.
- **Expected Result:** Elements render only when `isEcoBadgeEnabled()`/`isCo2ScaleEnabled()` are true (this conditional-rendering behavior is Confirmed via implementation).
- **Business Rule / Requirement Reference:** business-rules.md §1 (implementation-only detail confirmed via `sprint5/UI/.../overview.component.ts`; the toggle-control mechanism itself is not described in docs/user-stories/v5.md or docs/features.md — this is an absence in requirements, not a conflict, since no clean source disputes the conditional-rendering behavior).
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Low
- **Automation Candidate:** No
- **Notes / Risks:** The conditional-rendering behavior is confirmed via implementation; how to toggle the feature flag in a given test environment should be confirmed with the team before test-data setup for this scenario is automated.

#### BROWSE-015 — Out-of-Stock Products Show "Out of Stock" Label (Non-Rental)
- **Feature / Module:** Browse/Search — Product Card
- **Objective:** Verify non-rental products with no stock display the out-of-stock label on the grid card.
- **Preconditions:** At least one non-rental product with zero stock.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Locate an out-of-stock, non-rental product card in the grid.
- **Expected Result:** `out-of-stock` label shown on the card.
- **Business Rule / Requirement Reference:** business-rules.md §1.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### BROWSE-016 — Rental Products Exempt from Out-of-Stock Card Logic
- **Feature / Module:** Browse/Search — Product Card
- **Objective:** Verify rental products do not display the standard out-of-stock label logic on the grid.
- **Preconditions:** A rental product with zero stock.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Locate a zero-stock rental product card.
- **Expected Result:** Rental item is not flagged with the same out-of-stock display logic applied to non-rental products.
- **Business Rule / Requirement Reference:** business-rules.md §1.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### BROWSE-017 — Browse by Category Page Shows Only Matching Products
- **Feature / Module:** Browse/Search — Category Page
- **Objective:** Verify `/category/:name` scopes results to the selected category and its subcategories.
- **Preconditions:** None.
- **Test Data / Inputs:** A known category slug.
- **Test Steps:** 1) Click a category name from header nav or a product card badge.
- **Expected Result:** Page title (`page-title`) shows the category name; grid shows only products in that category (and subcategories via `by_category_slug`).
- **Business Rule / Requirement Reference:** user-flows.md §2.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), UI
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### BROWSE-018 — Category Page Empty State
- **Feature / Module:** Browse/Search — Category Page
- **Objective:** Verify an appropriate empty state is shown when a category/filter combination yields no products.
- **Preconditions:** None.
- **Test Data / Inputs:** Filters combined to guarantee zero matches.
- **Test Steps:** 1) Apply a category + brand + price combination with no matching products.
- **Expected Result:** `category-empty` state element shown.
- **Business Rule / Requirement Reference:** ui-reference.md (Product Overview/Category — `category-empty`).
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### BROWSE-019 — HTTP QUERY Method Returns Same Payload as GET
- **Feature / Module:** Browse/Search — API Contract
- **Objective:** Verify `QUERY /products` with a JSON body returns an equivalent payload to `GET /products` with the same criteria.
- **Preconditions:** None.
- **Test Data / Inputs:** Identical filter/sort/page criteria sent as query params (GET) and as a JSON body (QUERY) with `Content-Type: application/json`.
- **Test Steps:** 1) Call `GET /products?...`. 2) Call `QUERY /products` with an equivalent JSON body.
- **Expected Result:** Both return 200 with matching product sets; QUERY response additionally includes an `Accept-Query: application/json` header.
- **Business Rule / Requirement Reference:** business-rules.md §1; api-reference.md (HTTP QUERY Method).
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### BROWSE-020 — QUERY Request Without JSON Content-Type Returns 415
- **Feature / Module:** Browse/Search — API Contract / Security
- **Objective:** Verify a `QUERY /products` request without `Content-Type: application/json` is rejected.
- **Preconditions:** None.
- **Test Data / Inputs:** QUERY request with `Content-Type: text/plain` (or omitted).
- **Test Steps:** 1) Send a `QUERY /products` request without the required content type.
- **Expected Result:** 415 Unsupported Media Type.
- **Business Rule / Requirement Reference:** api-reference.md (HTTP QUERY Method — Cross-Cutting Contract).
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —
