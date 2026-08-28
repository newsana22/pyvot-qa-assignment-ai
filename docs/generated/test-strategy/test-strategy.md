# Toolshop — Test Strategy (Full Suite)

> Prepared by the Test Strategy role. Baseline: Clean Sprint 5 (`sprint5/UI`, `sprint5/API`) only, via `docs/ai-knowledge/*`. `sprint5-with-bugs/**`, other sprints, bug reports, known-bug lists, defect seeds, and answer-key material were not consulted. This document does not generate automation code, does not modify approved scenarios, and does not modify application source.

## 1. Scope and Source Inputs

**Scope:** Full Suite — all approved functional scenarios under `docs/generated/test-scenarios/`:

| Source File | Module | Scenario Count |
|---|---|---|
| authentication-accounts-test-scenarios.md | Authentication & Accounts | 38 |
| browse-search-test-scenarios.md | Browse / Search | 20 |
| product-test-scenarios.md | Product | 20 |
| cart-test-scenarios.md | Cart | 19 |
| checkout-payment-test-scenarios.md | Checkout / Payment | 27 |
| invoice-test-scenarios.md | Invoice | 16 |
| financial-calculations-test-scenarios.md | Financial Calculations | 19 |
| **Total** | | **159** |

**Governance inputs:** `docs/ai-knowledge/toolshop-domain.md`, `business-rules.md`, `user-flows.md`, `api-reference.md`, `ui-reference.md`; `.github/instructions/toolshop-qa.instructions.md`; `.github/instructions/playwright-best-practices.instructions.md`.

**Testability constraint acknowledged:** This assignment's automation surface is a Playwright-based UI + REST API suite (`playwright.config.js`, `tests/**`). There is no in-scope mechanism to add PHPUnit/Jasmine-style Unit or Angular Component tests without editing `sprint5/API/**` or `sprint5/UI/**` (application source), which is out of bounds. Where a scenario's technically correct Final Test Layer is **Unit** (pure calculation logic) or **Component** (isolated frontend state), and clean evidence shows the same logic is observable through a persisted, black-box contract (cart/invoice API responses, or a single rendered page), that observable contract is used as the **assignment automation proxy**. This is called out explicitly per scenario — it is a documented, constraint-driven exception, not a left-shift violation, since the *correct* Final Test Layer is still recorded as Unit/Component.

---

## 2. Test Pyramid Distribution Summary

| Layer | Scenario Count (Final Layer) | Automation Count (Selected) | Primary Focus |
|---|---|---|---|
| Unit | 15 | 14 (via API proxy — see constraint above) | Financial calculation arithmetic (line totals, discounts, stacking order, rounding) |
| API / Integration | 89 | 88 | REST contracts, validation, business rules, authorization boundaries, financial persistence |
| Component | 18 | 6 (as narrow Playwright checks) | Client-side validation state, filter/quantity widget behavior |
| UI / End-to-End | 37 | 25 | Critical multi-step journeys (auth, checkout, cart, invoice) and user-visible confirmations |
| **Total** | **159** | **113** | |

Distribution is wide at the API layer (56% of scenarios), narrower at UI/E2E (23%), consistent with the left-shift principle — the suite is not an ice-cream cone. Automation selection (113/159 = ~71%) intentionally excludes low-value cosmetic checks, unresolved-governance scenarios, and scenarios fully covered elsewhere (see §4, §7).

---

## 3. Scenario-to-Layer Assignments

Columns: **Final Layer** (independently confirmed/overridden from the Create Scenarios agent's preliminary recommendation) · **Automate** (Yes/No, this assignment) · **Rationale**. Where Final Layer differs from the scenario document's preliminary recommendation, this is noted explicitly. DiD = Defense-in-Depth (intentional coverage at more than one layer).

### 3.1 Authentication & Accounts (38 scenarios)

| ID | Final Layer | Automate | Rationale |
|---|---|---|---|
| AUTH-001 | API (+ UI smoke, DiD) | Yes | Core login contract; UI smoke proves the journey end-to-end for the app's single most critical flow. |
| AUTH-002 | UI/E2E | Yes | Role-based redirect only observable via routing; cheap addition to the login smoke test. |
| AUTH-003 | API | Yes | 401 status confirmed; test only the confirmed part (status code), not the disputed message text (`Needs Human Review`). |
| AUTH-004 | API | Yes | Straightforward negative-credential contract. |
| AUTH-005 | API | Yes | Confirmed, security-critical lockout rule (state transition). |
| AUTH-006 | API | Yes | Confirmed admin-exemption decision-table rule; high regression value. |
| AUTH-007 | API | Yes | Confirmed counter-reset rule. |
| AUTH-008 | API | Yes | Confirmed disabled-account rule. |
| AUTH-009 | API (+ UI, DiD) | Yes | Core 2FA login branch; API is authoritative, UI proves it's wired end-to-end. |
| AUTH-010 | API | Yes | Confirmed negative TOTP path. |
| AUTH-011 | API (+ UI smoke, DiD) | Yes | Core registration contract; UI smoke for the second most critical flow. |
| AUTH-012 | API | Yes | BVA — age lower boundary, confirmed. |
| AUTH-013 | API | Yes | BVA — age upper boundary, confirmed. |
| AUTH-014 | API | Yes | BVA — under-18 rejection, confirmed. |
| AUTH-015 | API | Yes | BVA — over-75 rejection, confirmed. |
| AUTH-016 | API | No | Both the message text and status code are `Needs Human Review`; do not hard-code a disputed assertion. |
| AUTH-017 | API | Yes | Confirmed max-length boundary. |
| AUTH-018 | API | Yes | Confirmed password-complexity partitions; data-driven, high value. |
| AUTH-019 | API | No | Requires live network dependency on a compromised-password service; unsuitable for a deterministic CI suite. |
| AUTH-020 | Component | No | Cosmetic strength-meter display; low regression risk, narrow value. |
| AUTH-021 | API (+ UI, DiD) | Yes | Confirmed, critical account-recovery flow. |
| AUTH-022 | API | Yes | Confirmed negative path. |
| AUTH-023 | API | Yes | Confirmed validation rule. |
| AUTH-024 | API | Yes | Confirmed validation rule. |
| AUTH-025 | API | Yes | Confirmed validation rule. |
| AUTH-026 | UI/E2E | Yes | Session-termination-after-password-change is security-relevant and cheap to verify (short wait). |
| AUTH-027 | UI/E2E | Yes | Core account-management journey; read-only email field is a meaningful regression guard. |
| AUTH-028 | API (+ UI, DiD) | Yes | Confirmed, security-critical 2FA enrollment. |
| AUTH-029 | API | No | Guard existence `Not confirmed from clean Sprint 5 source`. |
| AUTH-030 | UI/E2E (+ API) | Yes | Core favorites happy path within assignment scope. |
| AUTH-031 | API | Yes | Confirmed 409-conflict duplicate-favorite contract. |
| AUTH-032 | API | Yes | Confirmed authorization boundary (401, `auth:users`). |
| AUTH-033 | UI/E2E | No | Secondary CRUD view; adequately covered in principle by AUTH-030/031/032; kept lean. |
| AUTH-034 | API (+ UI, DiD) | Yes | Confirmed admin-route UI guard; exact non-admin status code flagged `Not confirmed` but "request rejected" is testable. |
| AUTH-035 | API | Yes | Confirmed IDOR-style protection; high security value. |
| AUTH-036 | API | Yes | Confirmed session-invalidation contract. |
| AUTH-037 | API | Yes | Core assertion (no bypass) is testable regardless of the unconfirmed exact response format. |
| AUTH-038 | API | No | Concurrency behavior `Not confirmed from clean Sprint 5 source`; exploratory only. |

### 3.2 Browse / Search (20 scenarios)

| ID | Final Layer | Automate | Rationale |
|---|---|---|---|
| BROWSE-001 | API | Yes | Confirmed `paginate(9)` contract; cheap, high value. |
| BROWSE-002 | UI/E2E | Yes | Visible pagination journey. |
| BROWSE-003 | API | Yes | Confirmed core search contract. |
| BROWSE-004 | Component | Yes | Cheap BVA client-validation check via Playwright. |
| BROWSE-005 | Component | Yes | BVA lower boundary companion to BROWSE-004. |
| BROWSE-006 | Component | Yes | BVA upper boundary. |
| BROWSE-007 | Component | Yes | BVA upper-boundary rejection. |
| BROWSE-008 | UI/E2E | Yes | Confirmed filter-reset state transition; real regression value. |
| BROWSE-009 | Component | Yes | Confirmed parent/child cascade logic. |
| BROWSE-010 | Component | No | Same cascade mechanism as BROWSE-009 in reverse; marginal incremental value. |
| BROWSE-011 | API | Yes | Confirmed AND-semantics filter combination; high value, easy to get wrong. |
| BROWSE-012 | API | Yes | Confirmed sort contract; cheap data-driven coverage. |
| BROWSE-013 | Component | No | Cosmetic slider-bound check; low regression risk. |
| BROWSE-014 | UI/E2E | No | Toggle-control mechanism for the eco/CO2 feature flag is `Needs Human Review`/unconfirmed for test-environment setup. |
| BROWSE-015 | UI/E2E | Yes | Confirmed stock-display business rule. |
| BROWSE-016 | UI/E2E | No | Narrow rental-exemption edge case; low regression risk for this assignment's core scope. |
| BROWSE-017 | API (+ UI, DiD) | Yes | Confirmed category-scoping contract; core navigation. |
| BROWSE-018 | UI/E2E | No | Cosmetic empty-state; low risk. |
| BROWSE-019 | API | Yes | Distinctive HTTP QUERY-method contract-parity check unique to this app. |
| BROWSE-020 | API | Yes | Confirmed 415 content-type contract. |

### 3.3 Product (20 scenarios)

| ID | Final Layer | Automate | Rationale |
|---|---|---|---|
| PROD-001 | UI/E2E | No | Pure display assertion; incidentally exercised by PROD-008/009 flows. |
| PROD-002 | UI/E2E | No | Display-only; exact values are validated once, precisely, in Financial Calculations. |
| PROD-003 | API (+ UI) | No | Secondary feature, low regression risk. |
| PROD-004 | Component | No | Trivial default-state check. |
| PROD-005 | Component | Yes | Cheap BVA lower-boundary check (minus button floor). |
| PROD-006 | Component | No | Trivial increment logic, low value alone. |
| PROD-007 | Component (+ API) | No | Documented-vs-implementation boundary conflict is `Needs Human Review`; do not hard-code before resolution. |
| PROD-008 | UI/E2E (+ API) | Yes | Critical add-to-cart happy path. |
| PROD-009 | UI/E2E | Yes | Confirmed out-of-stock business rule; high value. |
| PROD-010 | UI/E2E | Yes | Distinct rental-pricing behavior, medium-high value. |
| PROD-011 | Component | No | Narrow slider-boundary cosmetic. |
| PROD-012 | Component | No | Narrow slider-boundary cosmetic. |
| PROD-013 | API (+ UI, DiD) | Yes | Core increment-not-duplicate rule; DiD with CART-008 (different entry point: product page vs. direct API). |
| PROD-014 | API | Yes | "Thor Hammer" rule now Confirmed via implementation (see §6); cheap, distinctive regression guard. |
| PROD-015 | UI/E2E | No | Cross-reference only to AUTH-030/031/032; avoid duplicate automation. |
| PROD-016 | API (+ UI) | No | Cosmetic specs-table display; low risk. |
| PROD-017 | UI/E2E | No | Niche comparison feature; low priority for this assignment's core scope. |
| PROD-018 | UI/E2E | No | Cosmetic empty-state. |
| PROD-019 | Component | No | Niche comparison toggle. |
| PROD-020 | API (+ UI) | Yes | Confirmed 404 negative-path contract. |

### 3.4 Cart (19 scenarios)

| ID | Final Layer | Automate | Rationale |
|---|---|---|---|
| CART-001 | API | Yes | Foundational cart-creation contract. |
| CART-002 | API | Yes | Core add-item contract. |
| CART-003 | API | Yes | Confirmed negative-path contract. |
| CART-004 | API | Yes | BVA — quantity lower-boundary rejection. |
| CART-005 | API | Yes | BVA — quantity minimum boundary. |
| CART-006 | API | Yes | BVA — quantity maximum boundary. |
| CART-007 | API | Yes | BVA — quantity upper-boundary rejection. |
| CART-008 | API | Yes | Core increment rule; DiD with PROD-013 (direct API vs. UI entry point — business-critical, justified). |
| CART-009 | API | Yes | Foundational read contract; needed to verify financial fields. |
| CART-010 | API | Yes | Confirmed negative-path contract. |
| CART-011 | API (+ UI, DiD) | Yes | Core quantity-update recalculation rule. |
| CART-012 | Component | No | Secondary UI toast; underlying 99-cap already confirmed at API in CART-007. |
| CART-013 | API | No | Exact status code `Not confirmed from clean Sprint 5 source`. |
| CART-014 | API | Yes | Core removal + discount-recalculation rule; high value. |
| CART-015 | UI/E2E | Yes | Confirmed empty-cart UX gate into checkout. |
| CART-016 | UI/E2E | Yes | Critical boundary gate (0 vs. 1 item) controlling checkout entry. |
| CART-017 | UI/E2E | No | Low-risk navigation check. |
| CART-018 | API | Yes | Standard, cheap deletion contract. |
| CART-019 | API | Yes | Confirms geo-discount mechanism is wired at cart level; exact values validated in Financial Calculations. |

### 3.5 Checkout / Payment (27 scenarios)

| ID | Final Layer | Automate | Rationale |
|---|---|---|---|
| CKO-001 | UI/E2E | Yes | **Critical journey** — full logged-in checkout, credit card. |
| CKO-002 | UI/E2E | Yes | **Critical journey** — full guest checkout. |
| CKO-003 | UI/E2E | No | Already implicitly exercised as a precondition of CKO-001 (logged-in skip-step behavior); avoid duplication. |
| CKO-004 | UI/E2E | Yes | Distinctive 2FA-at-checkout branch not covered elsewhere in the checkout journey. |
| CKO-005 | UI/E2E | No | Duplicate of CART-015/016's empty-cart gating; cross-referenced instead. |
| CKO-006 | UI/E2E | No | Secondary convenience feature (address prefill); low regression risk. |
| CKO-007 | API (+ Component) | Yes | Confirmed required-field validation; core. |
| CKO-008 | API | No | State/postal-code requiredness is `Needs Human Review` (documented-vs-implementation conflict). |
| CKO-009 | API | Yes | Confirmed field-length BVA boundaries; cheap data-driven. |
| CKO-010 | API | No | Narrow security-adjacent edge case; low likelihood of triggering in practice. |
| CKO-011 | UI/E2E (+ API) | Yes | Confirmed postcode-autofill decision-table feature. |
| CKO-012 | API (+ UI) | Yes | Confirmed negative path of the same feature. |
| CKO-013 | API | No | Requires simulating an upstream outage; recommended as manual/exploratory per the scenario's own notes. |
| CKO-014 | API (+ UI) | Yes | Core payment method (Bank Transfer), valid path. |
| CKO-015 | API | Yes | Confirmed bank-transfer field-format validation. |
| CKO-016 | API (+ UI, DiD) | Yes | Core payment method (Credit Card); also exercised end-to-end in CKO-001 — DiD (isolated validation + full-journey proof). |
| CKO-017 | API | Yes | BVA — expiration-date boundary, confirmed error text. |
| CKO-018 | API | Yes | Confirmed malformed-field validation, data-driven. |
| CKO-019 | API (+ UI) | Yes | Core payment method (BNPL). |
| CKO-020 | API (+ UI) | Yes | Core payment method (Gift Card), valid path. |
| CKO-021 | API | Yes | **Authoritative security boundary** for gift-card format at order time — highest-value payment scenario. |
| CKO-022 | API (+ UI) | Yes | Completes the payment-method matrix (Cash on Delivery). |
| CKO-023 | Component | No | Cosmetic form-reset behavior; low regression risk. |
| CKO-024 | Component | No | Generic form-validity gating; low incremental value beyond field-level validation tests. |
| CKO-025 | API | Yes | Core order-creation contract (invoice + payment + jobs) — high value. |
| CKO-026 | API | Yes | Cheap, valuable invoice-number format regression guard. |
| CKO-027 | UI/E2E | Yes | Automate only the Confirmed confirmation-display assertion; do not assert the `Not confirmed` cart-clearing claim. |

### 3.6 Invoice (16 scenarios)

| ID | Final Layer | Automate | Rationale |
|---|---|---|---|
| INV-001 | UI/E2E (+ API) | No | Cosmetic list display; incidentally covered via INV-003. |
| INV-002 | API | No | Generic Laravel paginator behavior; low distinct value; exact page size unconfirmed. |
| INV-003 | UI/E2E (+ API) | Yes | Core invoice-detail verification; high value. |
| INV-004 | UI/E2E | No | Secondary display; exact discount values validated once in Financial Calculations. |
| INV-005 | UI/E2E (+ API) | Yes | User-visible proof-point for FIN-012's exact stacking calculation — DiD. |
| INV-006 | UI/E2E | No | Secondary, undocumented-feature display; lower priority than INV-005. |
| INV-007 | API (+ UI) | Yes | Confirmed negative-path/authorization contract. |
| INV-008 | API | Yes | **Security-relevant IDOR boundary** — high value. |
| INV-009 | API | Yes | Completes the authorization matrix with INV-008. |
| INV-010 | UI/E2E (+ API) | No | Timing-sensitive (20s poll); higher automation cost/flakiness for marginal value. |
| INV-011 | API (+ UI) | No | Same timing-sensitivity concern as INV-010; contract covered via INV-012/013. |
| INV-012 | API | Yes | Cheap default-status contract check. |
| INV-013 | API | Yes | Confirmed negative-path contract. |
| INV-014 | API | No | Requires completing async PDF generation in test env; higher setup cost than its incremental value over INV-012/013. |
| INV-015 | API | Yes | Core admin status-workflow contract. |
| INV-016 | API | No | Authorization boundary `Not confirmed from clean Sprint 5 source`. |

### 3.7 Financial Calculations (19 scenarios)

> Final Layer = Unit for pure calculation logic (technically correct placement). Assignment automation for Unit-final scenarios is implemented **via the API layer** (cart/invoice endpoints), the practical in-scope proxy — see §1 constraint note.

| ID | Final Layer | Automate | Rationale |
|---|---|---|---|
| FIN-001 | Unit (via API) | Yes | Exact-value line-total assertion explicitly required by assignment scope. |
| FIN-002 | Unit (via API) | Yes | Exact-value discounted line-total assertion. |
| FIN-003 | Unit (via API) | Yes | Exact geo-discount value (New York, 5%); high priority. |
| FIN-004 | Unit (via API) | Yes | Data-driven, comprehensive coverage of the full city/discount table. |
| FIN-005 | Unit (via API) | Yes | Confirmed negative-boundary case (0% outside range). |
| FIN-006 | Unit (via API) | Yes | BVA — inclusive boundary at exactly ±2°. |
| FIN-007 | Unit (via API) | Yes | Core combination-discount rule (15%) — high value. |
| FIN-008 | Unit (via API) | Yes | Decision-table negative case (single-type carts). |
| FIN-009 | Unit (via API) | Yes | State-transition regression-critical (discount removal). |
| FIN-010 | Unit (via API) | Yes | Exact eco-discount value; boundary-adjacent. |
| FIN-011 | Unit (via API) | Yes | BVA companion to FIN-010 (exactly 50% does not qualify). |
| FIN-012 | Unit (via API) | Yes | **Highest-value financial scenario** — confirmed discount-stacking arithmetic, exact traceable values. |
| FIN-013 | Unit | No | No reliable black-box proxy beyond what FIN-001/002/012's exact-value assertions already imply. |
| FIN-014 | UI/E2E | No | Cosmetic currency-formatting check; low regression risk. |
| FIN-015 | API | No | Absence of tax `Not confirmed from clean Sprint 5 source`; not a solid basis for a hard assertion in the lean scope. |
| FIN-016 | API | Yes | Cheap, valuable invoice-number format guard (duplicate of CKO-026 — DiD via two entry points is unnecessary; kept once, see §7). |
| FIN-017 | Unit (via API) | Yes | BVA minimum-quantity boundary. |
| FIN-018 | Unit (via API) | Yes | BVA maximum-quantity boundary; DiD with CART-006 (financial-integrity vs. contract-validation angle). |
| FIN-019 | API | Yes | Input-type-confusion coverage (negative/non-numeric) distinct from CART-004/007's simple boundary — DiD. |

---

## 4. Selected Assignment Automation Scope

**113 of 159 scenarios (≈71%) selected.** Distribution of the selected set:

- **API / Integration automation: 88 scenarios** — authentication, registration, account/authorization boundaries, cart CRUD and boundaries, checkout/payment validation for all five payment methods, invoice access-control, and exact financial-calculation verification (line totals, geo/combination/eco discounts, stacking order, quantity-boundary integrity).
- **UI / End-to-End automation: 25 scenarios** — critical journeys (login, registration, full checkout ×2, add-to-cart, cart gating, invoice detail, account management) plus a small set of narrow UI-state checks (client-side search-length validation, category-checkbox cascade) folded into the UI suite since no separate component-test framework is in scope.

This satisfies the assignment's requirement for meaningful REST API coverage, meaningful UI/E2E coverage, critical shopping/authentication flows, and exact financial-validation coverage, while remaining lean (46 scenarios explicitly excluded with stated reasons — see §3 and §7).

---

## 5. Critical E2E Journeys Retained

A small, high-value set of full multi-step UI journeys anchors the top of the pyramid:

1. **Login (standard) + role-based redirect** — AUTH-001, AUTH-002.
2. **Registration** — AUTH-011.
3. **Forgot Password** — AUTH-021.
4. **2FA enrollment (TOTP setup/verify)** — AUTH-028.
5. **Add product to cart → cart gating → proceed** — PROD-008, PROD-009, CART-016.
6. **Full checkout — logged-in user, credit card** — CKO-001.
7. **Full checkout — guest user** — CKO-002.
8. **Checkout with TOTP-protected sign-in** — CKO-004.
9. **Order confirmation display** — CKO-027.
10. **Invoice detail view (post-purchase)** — INV-003, with INV-005 as the visible proof-point for the exact discount-stacking calculation confirmed in FIN-012.

These 10 journeys collectively exercise every checkout wizard step, both authentication paths (standard + TOTP), guest vs. logged-in flows, and the full purchase-to-invoice lifecycle — sufficient E2E proof without duplicating logic better verified at the API layer.

---

## 6. Contested / Needs Human Review Items

The following scenarios carry an Expected Result of `Needs Human Review` or `Not confirmed from clean Sprint 5 source`, per the approved scenario documents. They are excluded from strict automated assertions in this assignment (or automated only for their confirmed sub-portion) until resolved by the team:

**`Needs Human Review` (clean sources conflict):**
- **AUTH-003** — login error text: requirement string vs. implementation string disagree.
- **AUTH-016** — duplicate-email message text and status code both disagree between requirement and implementation.
- **CKO-008** — billing state/postal-code requiredness: requirement says required, `StoreInvoice.php` does not enforce it.
- **PROD-007** — quantity clamp upper bound: requirement states 999,999,999; UI and API implementation both independently cap at 99. (The 99 cap itself is automated per §3.3; the *documentation* discrepancy is the open item.)

**`Not confirmed from clean Sprint 5 source` (insufficient clean evidence):**
- **AUTH-029** — TOTP-setup denial guard for demo accounts not located in `TOTPController`/`TOTPService`.
- **AUTH-034** — exact status code (401 vs. 403) for non-admin access to `role:admin`-gated endpoints.
- **AUTH-037** — exact response format for injection/XSS payloads (general no-bypass expectation is testable; the specific format is not).
- **AUTH-038** — concurrency/race-condition behavior of the login-lockout counter.
- **CART-013** — exact status code (404 vs. 422) for updating quantity of a product absent from the cart.
- **CKO-027** — whether the cart is actually cleared after order placement (the confirmation-display portion is Confirmed and automated).
- **INV-002** — exact default per-page item count for invoice pagination.
- **INV-016** — whether `PUT /invoices/{id}/status` is admin-gated at all beyond generic authentication.
- **FIN-015** — whether the absence of tax logic is a guaranteed, conclusively-established system-wide contract.

No scenario in this list was silently resolved; all are flagged here for team follow-up, consistent with the governance rules already applied at the scenario-generation stage.

---

## 7. Anti-Patterns Identified

The approved scenario set was generated with disciplined left-shift already applied by the Create Scenarios agent (most financial/business-rule scenarios were pre-recommended at Unit/API rather than UI). Independent review found:

- **No instances** of REST status codes being validated only through UI E2E, pure calculations tested only through the UI, or input validation tested only through E2E where API/Component coverage would suffice — the approved scenarios already recommend the lower layer in these cases.
- **No ice-cream-cone distribution** — the analyzed distribution (Unit 15 / API 89 / Component 18 / UI-E2E 37) and the selected-automation distribution (API 88 / UI-E2E 25) are both bottom-heavy.
- **One documented, justified exception to strict left-shift:** Financial Calculations scenarios recommended at the Unit layer are automated one layer *higher*, via API, because true Unit tests would require adding test files inside `sprint5/API/**` (out of scope as application source in this assignment). This is a testability-tooling constraint, not a design flaw in the scenarios, and is called out per-scenario in §3.7.
- **Deliberate, justified Defense-in-Depth** (not duplication) was preserved in a small number of cases: PROD-013/CART-008 (product-page vs. direct-API entry points for the same increment rule), CKO-016 (isolated credit-card validation vs. the full CKO-001 journey), CART-006/FIN-018 (contract-validation vs. financial-integrity angles on the same qty=99 boundary), and INV-005 (UI-visible proof of FIN-012's exact stacking math).
- **One redundancy avoided:** FIN-016 and CKO-026 both assert the same invoice-number format; only one (FIN-016) is retained in the automated scope to avoid a duplicate test with no added regression value.
- No weak/tautological assertions were introduced — scenarios with unresolved governance status were excluded from strict automation rather than automated with a watered-down assertion.

---

## 8. Coverage and Risk Observations

- **Financial correctness** (the assignment's highest-risk area) has the deepest verification: every discount type (geo-location, rental+non-rental combination, eco-friendly), the discount-stacking order, and quantity-boundary integrity are automated with exact, traceable expected values sourced from confirmed clean implementation (`InvoiceService.php`, `CartService.php`), with one UI-visible proof-point (INV-005) as defense-in-depth.
- **Security-relevant boundaries** are prioritized for automation: account lockout, TOTP, admin-route/IDOR protections (AUTH-034/035, INV-008), and the gift-card format security boundary (CKO-021) — all flagged High priority and selected.
- **Checkout/payment** has full-matrix API coverage across all five payment methods plus two full E2E journeys, satisfying the assignment's UI+API dual-coverage requirement without over-automating cosmetic payment-form UI states (CKO-023/024 excluded).
- **Residual risk:** the 9 `Not confirmed`/4 `Needs Human Review` items in §6 represent real gaps in the clean-source evidence base, not gaps in test design; they should be resolved with the team before being either automated or closed out. The eco-friendly discount and "Thor Hammer" rules remain real, implementation-confirmed behaviors despite being undocumented in requirements (§3.3/§3.3/§3.7) — worth a product-intent confirmation but not a blocker to automating the observed behavior.
- **PDF-generation polling** (INV-010/011/014) was deliberately excluded from automation due to timing-sensitivity/flakiness risk relative to its regression value; the underlying status-endpoint contract is still covered via INV-012/013.

---

## 9. Pyvot Assignment — Final Automation Candidates

### 9.1 Selection Principles

Sections 1–8 define the **strategic automation opportunity**: 113 of 159 approved scenarios that are technically sound, evidence-backed candidates for automation across the full pyramid, appropriate for a mature, ongoing regression program.

Section 9 defines a materially smaller **Pyvot take-home automation candidate pool** — a risk-based subset of the broader strategic automation opportunity that is suitable for further human prioritization before implementation. The final human-approved implementation scope is defined separately in Section 10.

- Section 3–4's 113 "Automate = Yes" scenarios are **not** all carried forward here. Many are individually valid but represent marginal, secondary, or highly similar coverage that would dilute focus, add maintenance surface, and consume implementation time without materially increasing defect-detection confidence for this submission (e.g., secondary CRUD views, narrow slider/toast cosmetics, duplicate boundary angles already proven once).
- Section 9 instead selects the **smallest defensible slice** that: proves the full core shopping lifecycle (Browse → Product → Cart → Checkout → Payment → Invoice) end-to-end at least once in the browser; proves the supporting REST contracts, validation, and security boundaries beneath it; and proves financial correctness exactly, with traceable expected values, for every discount rule confirmed from clean Sprint 5 sources.
- Grouping is used aggressively: related Equivalence Partitioning/Boundary Value Analysis scenario IDs that share one endpoint or one journey are implemented as **one data-driven test**, not one test per scenario ID — keeping the implementation count realistic for the timebox while still tracing back to every represented scenario ID.
- No scenario carrying an unresolved `Needs Human Review` or `Not confirmed from clean Sprint 5 source` status on its essential assertion is selected here, except where explicitly noted as a confirmed sub-portion (see §9.7).

### 9.2 Final API Automation Candidates

| Automation Group | Scenario IDs | Coverage / Risk | Technique | Why Selected | Expected Assertion Type |
|---|---|---|---|---|---|
| API-G1 — Login success & failure | AUTH-001, AUTH-003, AUTH-004 | Core authentication contract; highest-traffic endpoint in the app | Equivalence Partitioning | Foundational to every other authenticated flow; AUTH-003 asserts only the confirmed 401 status, not the disputed message | Exact status code (200/401) + presence/absence of JWT |
| API-G2 — Lockout & admin exemption | AUTH-005, AUTH-006 | Security-critical brute-force protection | State Transition / Decision Table | High business/security risk; cheap to prove via 4 sequential requests | Exact status (200 → 423) and exact error string |
| API-G3 — Registration validation partitions | AUTH-012, AUTH-013, AUTH-014, AUTH-015, AUTH-017, AUTH-018 | DOB age boundary (18/75) + email length + password complexity | Boundary Value Analysis + Equivalence Partitioning | Classic multi-boundary data-driven case; one test, six data rows, all confirmed | Exact HTTP status (201 vs. 422) per data row |
| API-G4 — Registration success | AUTH-011 | Account creation contract | Equivalence Partitioning | Required as setup fixture for downstream authenticated tests, and a scenario in its own right | 201 + `role: "user"` in response |
| API-G5 — Authorization boundaries | AUTH-034, AUTH-035 | Admin-route and IDOR-style protection | Equivalence Partitioning | Security-relevant, high defect-detection value, cheap to assert generically ("request rejected") | Non-2xx status; no data leakage in body |
| API-G6 — Browse: pagination & search | BROWSE-001, BROWSE-003 | Product listing contract | Equivalence Partitioning | Foundational to the shopping lifecycle's entry point | Exact page size (9) + filtered result set |
| API-G7 — Browse: category+brand filter combination | BROWSE-011 | AND-semantics filter logic | Decision Table | Easy-to-regress combination rule (union vs. intersection) | Result set matches intersection, not union |
| API-G8 — Product: not-found contract | PROD-020 | 404 negative path | Equivalence Partitioning | Cheap, standard negative-path proof | 404 status |
| API-G9 — Cart: add-item quantity boundary | CART-004, CART-005, CART-006, CART-007 | Quantity validation (0, 1, 99, 100) | Boundary Value Analysis | Textbook BVA; one data-driven test, four data rows | Exact status (422 at 0/100, 200 at 1/99) |
| API-G10 — Cart: core CRUD & business rules | CART-002, CART-003, CART-008, CART-009, CART-011, CART-014 | Add/increment/update/remove + discount recalculation | Equivalence Partitioning / State Transition | Backbone of the shopping-lifecycle cart layer | Exact cart-item quantity/count after each operation |
| API-G11 — Checkout: address validation | CKO-007, CKO-009 | Required-field + length boundaries | Equivalence Partitioning + Boundary Value Analysis | Core to every checkout; cheap, high value | Exact 422 with field-level errors |
| API-G12 — Checkout: payment validation (negative) | CKO-015, CKO-017, CKO-018 | Bank transfer / credit card format & expiry validation | Equivalence Partitioning + Boundary Value Analysis | Represents the payment-validation risk class in one data-driven test | Exact 422 + confirmed error text (e.g., expiration date) |
| API-G13 — Checkout: payment method happy paths | CKO-014, CKO-016, CKO-019, CKO-020, CKO-022 | All 5 payment methods, valid data | Equivalence Partitioning | Completes the payment-method matrix required by the assignment | 201 order created per method |
| API-G14 — Checkout: gift card security boundary | CKO-021 | Authoritative format check at order time, bypassing pre-check | Equivalence Partitioning | Explicitly called out in business rules as the definitive security boundary | 422; no invoice/payment row created |
| API-G15 — Checkout: order creation contract | CKO-025, CKO-026 | Invoice + payment + inventory + email side effects; invoice number format | Equivalence Partitioning | Core order-completion contract underlying the whole purchase flow | 201 + exact `INV-{year}` pattern, length 14 |
| API-G16 — Invoice: access control | INV-007, INV-008, INV-009 | Not-found / IDOR / admin-override | Decision Table | Security-relevant ownership matrix (self / other-user / admin) | Exact 404/200 per ownership condition |
| API-G17 — Financial: line totals | FIN-001, FIN-002 | qty × price, with/without per-item discount | Equivalence Partitioning | Mandatory exact-value financial coverage | Exact numeric line total |
| API-G18 — Financial: geo-location discount | FIN-003, FIN-004, FIN-005, FIN-006 | 5-city discount table + out-of-range + inclusive boundary | Boundary Value Analysis | Mandatory; five data rows, one data-driven test | Exact discount percentage per city/coordinate |
| API-G19 — Financial: combination discount | FIN-007, FIN-008, FIN-009 | Rental+non-rental 15%, single-type carts, removal | Decision Table + State Transition | Mandatory; core discount rule with a state-transition edge | Exact `additional_discount_percentage` (15 or null) |
| API-G20 — Financial: eco discount & stacking order | FIN-010, FIN-011, FIN-012 | >50% CO2 A/B rule + exact sequential stacking math | Boundary Value Analysis + Decision Table | **Highest-value financial scenario** — confirmed exact stacking arithmetic | Exact discount amount and final total to the cent |
| API-G21 — Financial: quantity-boundary integrity | FIN-017, FIN-018 | Line/cart total correctness at qty=1 and qty=99 | Boundary Value Analysis | Confirms no rounding/overflow error at the financial boundaries | Exact total ($7.25 and $444.51) |

### 9.3 Final UI / E2E Automation Candidates

| Automation Journey / Check | Scenario IDs | Coverage / Risk | Why UI/E2E Is Required | Expected Assertion |
|---|---|---|---|---|
| UI-J1 — Login + role-based redirect | AUTH-001, AUTH-002 | Entry point to every authenticated journey | Redirect target and header-nav state are only observable in the browser | URL is `/account`; logged-in nav visible |
| UI-J2 — Registration | AUTH-011 | Second most critical account-creation journey | Client-side postcode/strength widgets + redirect to `/auth/login` are UI-only behaviors | Redirect to `/auth/login`; account usable afterward |
| UI-J3 — Browse → Product → Add to Cart | PROD-008, PROD-009 | Core lifecycle entry: product discovery to cart | Add-to-cart confirmation, disabled button state, and cart-badge increment are rendered UI state, not API-observable alone | Success toast shown; cart badge count increments; disabled button + red label for OOS product |
| UI-J4 — Cart gating | CART-015, CART-016 | Empty-cart message and the 0-vs-1-item Proceed gate | `Proceed` button enable/disable is a rendered DOM/form-state condition | Empty-cart message shown; `proceed-1` disabled at 0 items, enabled at 1+ |
| UI-J5 — Full checkout, logged-in, credit card | CKO-001 | **Critical journey** — proves the entire wizard (cart → address → payment → confirmation) | Multi-page wizard state transitions cannot be proven by isolated API calls | Order confirmation shown with invoice number |
| UI-J6 — Full checkout, guest | CKO-002 | **Critical journey** — guest path through the same wizard | Guest-detail capture and unauthenticated checkout completion are UI-driven | Order confirmation shown with invoice number |
| UI-J7 — Order confirmation | CKO-027 | Confirmed post-purchase confirmation display | User-visible proof that checkout genuinely completed | `order-confirmation` displays the invoice number |
| UI-J8 — Invoice verification with exact financial proof | INV-003, INV-005 | Invoice detail rendering + visible discount breakdown | Provides the one user-visible proof-point that the exact API-G20 stacking math (FIN-012) reaches the real customer-facing invoice | Displayed subtotal/discount/total match the API-computed exact values |

### 9.4 Mandatory Financial Automation

> These are the same underlying implementations as API-G17–API-G21 in §9.2, re-presented here financial-rule-first per the assignment's mandatory financial-validation requirement. They are **not** additional/separate implementations.

| Financial Check | Scenario IDs | Input / Formula | Exact Expected-Value Requirement | Automation Layer |
|---|---|---|---|---|
| Line total (no discount) | FIN-001 | `quantity × unit_price` | 3 × $10.00 = **$30.00** | API (API-G17) |
| Line total (per-item discount) | FIN-002 | `quantity × discounted_price` | 2 × $18.00 (10% off $20.00) = **$36.00** | API (API-G17) |
| Geo-location discount | FIN-003, FIN-004 | City-coordinate match, ±2° | New York 5%, Mumbai 10%, Tokyo 15%, Amsterdam 20%, London 25% | API (API-G18) |
| Geo-location boundary | FIN-005, FIN-006 | `abs(diff) <= 2` inclusive | 0% outside range; discount still applies at exactly 2.0° | API (API-G18) |
| Combination discount (rental + non-rental) | FIN-007, FIN-008, FIN-009 | Flat 15% when both types present | `additional_discount_percentage = 15`, else `null`; removed on type-mix change | API (API-G19) |
| Eco-friendly discount | FIN-010, FIN-011 | `> 50%` of quantity is CO2 A/B | 5% applied at 60% (6/10); **not** applied at exactly 50% (5/10) | API (API-G20) |
| Discount stacking order | FIN-012 | Combination discount first, eco discount on the remainder | Subtotal $100.00 → −$15.00 (15%) → −$4.25 (5% of $85.00) → **total $80.75** | API (API-G20) |
| Quantity-boundary integrity | FIN-017, FIN-018 | `quantity × unit_price` at qty=1 and qty=99 | 1 × $7.25 = **$7.25**; 99 × $4.49 = **$444.51** | API (API-G21) |

No tax, voucher, or rounding-beyond-2-decimals rule is included above: tax absence is `Not confirmed from clean Sprint 5 source` (FIN-015, excluded — see §9.7) and aggregate-level rounding beyond per-item price is likewise unconfirmed (FIN-013, excluded). No approximate assertions (`toBeDefined`, `not null`, `> 0`) are used anywhere in this scope — every financial check above has a specific numeric expected value traceable to confirmed clean Sprint 5 behavior.

### 9.5 Test Design Technique Coverage

| Technique | Selected Scenario IDs | How It Is Demonstrated |
|---|---|---|
| Equivalence Partitioning | AUTH-001/003/004, AUTH-011, AUTH-034/035, BROWSE-001/003, PROD-020, CART-002/003/008/009/011/014, CKO-007, CKO-014/016/019/020/022, CKO-021, CKO-025/026, FIN-001/002 | Valid vs. invalid credential/data/method partitions across auth, cart, and payment-method groups |
| Boundary Value Analysis | AUTH-012/013/014/015/017, CART-004/005/006/007, CKO-009, CKO-017, FIN-005/006, FIN-010/011, FIN-017/018 | Explicit min/min-1/max/max+1 style pairs for age, quantity, address length, expiry date, geo-coordinate, and eco-discount thresholds |
| Decision Table | AUTH-006, BROWSE-011, INV-007/008/009, FIN-007/008, FIN-012 | Multi-condition combinations (role × attempt-count; category × brand; owner × admin; rental × non-rental; combination × eco discount) producing distinct outcomes |
| State Transition | AUTH-005, CART-008/014, FIN-009, CKO-001/002/027 | Sequential-attempt lockout accumulation, cart quantity/discount recalculation after add/remove, and the multi-step checkout-wizard-to-confirmation transition |

### 9.6 Green / Red Regression Mapping

No known-bug lists, defect seeds, bug reports, or `sprint5-with-bugs/**` sources were consulted to produce this document (per the strict scope boundary). Consequently, **no scenario in this section can be safely marked "Verified Red Candidate"** from the evidence available here — doing so would require independently verified defect evidence that only the assignment author's own exploratory testing can supply.

| Scenario / Automation Group | Regression Status | Evidence Basis |
|---|---|---|
| All API groups (API-G1–API-G21) | Green Candidate | Expected behavior derived from confirmed clean Sprint 5 requirements/implementation; no defect evidence considered |
| All UI/E2E journeys (UI-J1–UI-J8) | Green Candidate | Expected behavior derived from confirmed clean Sprint 5 requirements/implementation; no defect evidence considered |
| Any group where the author's own independent exploratory testing has already surfaced a real defect matching one of the scenario IDs above | To be mapped from verified bug reports | Must be supplied by the assignment author; this document does not and must not guess |

If the assignment author has independently verified real defects during their own exploratory testing that correspond to any scenario ID above, the corresponding test should be re-flagged "Verified Red Candidate" and implemented to pin that defect against the *clean* Sprint 5 expected behavior already documented in the corresponding scenario file. The Generate Tests agent must not perform this re-mapping itself.

### 9.7 Explicitly Deferred From This Submission

- **Low business risk / cosmetic:** PROD-001/002/016, BROWSE-013/018, CKO-023/024, PROD-017/018/019 (comparison feature), FIN-014 (currency display formatting), AUTH-020 (password-strength meter).
- **Duplicate or near-duplicate coverage:** BROWSE-010 (vs. BROWSE-009's cascade logic), CKO-003/CKO-005 (already implicit in CKO-001 / CART-015-016), FIN-016 (same invoice-number format as API-G15/CKO-026).
- **Timing/flakiness risk relative to value:** INV-010, INV-011, INV-014 (20-second PDF-generation polling).
- **External dependency:** AUTH-019 (live compromised-password network check), CKO-013 (requires simulating an upstream postcode-lookup outage).
- **`Needs Human Review` (excluded pending team resolution):** AUTH-016, CKO-008, PROD-007 (its confirmed 99-cap sub-portion is *not* selected here either, pending the documentation conflict).
- **`Not confirmed from clean Sprint 5 source` (excluded pending confirmation):** AUTH-029, AUTH-037, AUTH-038, CART-013, INV-002, INV-016, FIN-015.
- **Representative but lower-priority than the selected core lifecycle (deferred for the 1–2 day timebox, not because they are invalid):** most remaining Authentication scenarios beyond §9.2/§9.3's selection (e.g., AUTH-007/008/009/010/021–028/030–033/036), most remaining Browse/Search scenarios (e.g., BROWSE-002/004–009/012/015/017/019/020), most remaining Product scenarios (e.g., PROD-003/005/010/013/014), remaining Cart UI/Component checks (CART-012/017/018/019), most remaining Checkout scenarios (e.g., CKO-004/006/010–012/019 duplicates), and remaining Invoice scenarios (INV-001/004/006/012/013/015).
- **Insufficient value for the timebox generally:** any scenario whose Automate=Yes decision in §3 was justified primarily as defense-in-depth or completeness for the *strategic* (not implementation) scope.

### 9.8 Generate Tests Agent Handoff

**Section 9 defines the AI-assisted automation candidate pool. It is NOT the final code-generation scope. The final human-approved implementation scope is defined in Section 10 and takes precedence over Section 9 for all automation generation decisions.**

Implementation handoff:

- **Final API automation groups (21):** API-G1–API-G21 as tabulated in §9.2, covering scenario IDs AUTH-001/003/004/005/006/011/012/013/014/015/017/018/034/035, BROWSE-001/003/011, PROD-020, CART-002/003/004/005/006/007/008/009/011/014, CKO-007/009/014/015/016/017/018/019/020/021/022/025/026, INV-007/008/009, FIN-001/002/003/004/005/006/007/008/009/010/011/012/017/018.
- **Final UI/E2E automation journeys (8):** UI-J1–UI-J8 as tabulated in §9.3, covering scenario IDs AUTH-001/002/011, PROD-008/009, CART-015/016, CKO-001/002/027, INV-003/005.
- **Mandatory financial checks (8, same implementations as the relevant API-G17–G21 rows):** exact values as tabulated in §9.4 — no approximate assertions permitted.
- **Green/Red status:** all groups above are Green Candidates per §9.6; none are marked Verified Red in this document; any Red re-mapping must come from the assignment author's own independently verified defect evidence, not from the Generate Tests agent.
- **Excluded `Needs Human Review` / `Not confirmed` scenarios:** AUTH-016, AUTH-029, AUTH-037, AUTH-038, CART-013, CKO-008, INV-002, INV-016, FIN-015, PROD-007 — do not generate strict assertions for these.
- **Expected exact assertions:** every financial check in §9.4 must assert a specific numeric value; every API group must assert exact HTTP status codes and, where confirmed, exact response text; every UI journey must assert exact, confirmed user-visible text/state (e.g., invoice number pattern, disabled/enabled control state).
- **Applicable test-design techniques:** Equivalence Partitioning, Boundary Value Analysis, Decision Table, and State Transition, each demonstrated by the specific groups listed in §9.5.

The Generate Tests agent must not expand this scope without explicit human approval.

---

**Section 9 Summary**

- API automation implementations/groups: **21**
- Scenario IDs represented by API groups: **58**
- UI/E2E automation implementations/journeys: **8**
- Scenario IDs represented by UI/E2E journeys: **12**
- Mandatory financial automation checks/groups: **8** (same underlying implementations as API-G17–G21; not additional)
- Total unique scenario IDs represented in Section 9 (API ∪ UI/E2E, de-duplicated): **68**
- Green candidates: **all 29 selected implementations (21 API + 8 UI/E2E), covering 68 scenario IDs**
- Verified red candidates: **0** (none can be safely determined without disallowed defect evidence)
- Candidates still requiring verified-bug mapping: **0 currently flagged; open to re-mapping by the assignment author if independently verified defects are found**
- Explicitly deferred scenario count: **91** (159 total − 68 selected; comprising the 46 scenarios marked Automate = No in §3 plus 45 scenarios marked Automate = Yes in §3 but deferred from this specific 1–2 day implementation scope per §9.1/§9.7)

---

## 10. Human-Approved Final Automation Scope

### 10.1 Purpose of the Human Review

Section 9 represents the AI-assisted, risk-based automation candidate analysis for the Pyvot assignment. It identified 29 candidate implementations (21 API groups and 8 UI/E2E journeys), representing 68 unique scenario IDs.

Before implementation, the candidate set was manually reviewed by the QA/SDET engineer against the actual constraints and expectations of the take-home assessment.

The assessment is explicitly time-boxed to approximately 1–2 focused days and values a focused, correct, reproducible, and defensible regression slice over broad but incomplete automation.

Therefore, the complete Section 9 candidate set is intentionally NOT being implemented.

The final automation scope defined in this section is a HUMAN-APPROVED implementation decision.

AI assisted with:

- understanding the application domain;
- generating candidate test scenarios;
- applying test-design techniques;
- recommending appropriate test layers;
- identifying automation candidates;
- identifying opportunities for data-driven grouping and removal of duplicate coverage.

The final decision about what will actually be automated was made manually based on:

- assignment requirements;
- business risk;
- defect-detection value;
- financial risk;
- implementation effort;
- duplication;
- maintainability;
- test reliability;
- and the available 1–2 day timebox.

This demonstrates the assignment principle of using AI to accelerate QA work while retaining human ownership of the final testing decisions.

---

### 10.2 Human Selection Criteria

The final automation cases were selected using the following criteria:

1. Direct alignment with the assignment's stated functional scope:
   - Authentication / Accounts
   - Browse / Search
   - Product
   - Cart
   - Checkout / Payment
   - Invoice
   - Financial calculations

2. Coverage of the complete core shopping lifecycle:

   Browse / Search  
   → Product  
   → Cart  
   → Checkout  
   → Payment  
   → Order Confirmation  
   → Invoice

3. Meaningful coverage at BOTH required automation layers:
   - REST API
   - UI / End-to-End

4. Highest business-risk functionality receives priority.

5. Financial calculations receive deeper coverage because the assignment explicitly requires exact validation of monetary values.

6. Positive, negative, and boundary behavior must all be represented.

7. The final scope must demonstrate the required black-box test-design techniques:
   - Equivalence Partitioning
   - Boundary Value Analysis
   - Decision Table Testing
   - State Transition Testing

8. Related scenarios should be grouped into data-driven tests where practical rather than creating one automation script for every scenario ID.

9. Duplicate or low-value defense-in-depth coverage is removed when the same risk is already sufficiently tested at a lower or more appropriate layer.

10. Scenarios with unresolved or unconfirmed expected behavior are not selected for strict automation assertions.

11. Every selected test must contain specific assertions capable of detecting an actual regression.

12. The implementation must remain realistic, maintainable, deterministic, and explainable within the approximately 1–2 day assignment timebox.

13. UI automation is reserved primarily for critical user journeys and browser-visible behavior. Business rules, validation combinations, and financial calculations are pushed toward the REST API layer where they can be tested faster and more deterministically.

---

### 10.3 Final REST API Automation — Human Selected

| Final ID | Automation | Source Scenario IDs | Technique | Key Assertions / Purpose |
|---|---|---|---|---|
| F-API-01 | Login — valid and invalid credentials | AUTH-001, AUTH-003, AUTH-004 | Equivalence Partitioning | Exact success/failure HTTP status; valid authentication response; invalid credentials rejected |
| F-API-02 | Registration — success and important input boundaries | AUTH-011, AUTH-012, AUTH-013, AUTH-014, AUTH-015, AUTH-018 | Equivalence Partitioning + Boundary Value Analysis | Exact 201/422 outcomes for valid and invalid partitions; lower/upper age boundaries and password-complexity partitions |
| F-API-03 | Product search + category/brand filtering | BROWSE-003, BROWSE-011 | Equivalence Partitioning + Decision Table | Search returns the expected matching products; combined category + brand filtering follows confirmed AND semantics |
| F-API-04 | Cart quantity boundaries — 0, 1, 99, 100 | CART-004, CART-005, CART-006, CART-007 | Boundary Value Analysis | qty=0 rejected; qty=1 accepted; qty=99 accepted; qty=100 rejected |
| F-API-05 | Cart lifecycle — add → read/update → remove | CART-002, CART-008, CART-009, CART-011, CART-014 | Equivalence Partitioning + State Transition | Exact item quantity/count and recalculated cart state after each transition |
| F-API-06 | Checkout validation — required data and invalid payment data | CKO-007, CKO-017, CKO-018 | Equivalence Partitioning + Boundary Value Analysis | Exact 422 responses and confirmed field-level validation behavior |
| F-API-07 | Credit-card payment + order creation + invoice contract | CKO-016, CKO-025, CKO-026 | Equivalence Partitioning | Valid credit-card payment; successful order creation; exact expected status; invoice created; confirmed invoice-number format |
| F-API-08 | Invoice authorization / IDOR protection | INV-007, INV-008, INV-009 | Decision Table | Exact expected behavior for missing invoice, owner/non-owner access, and authorized/admin access |
| F-API-09 | Financial line totals + quantity-boundary integrity | FIN-001, FIN-002, FIN-017, FIN-018 | Equivalence Partitioning + Boundary Value Analysis | Exact monetary assertions including $30.00, $36.00, $7.25, and $444.51 |
| F-API-10 | Discount rules + stacking calculation | FIN-007, FIN-008, FIN-009, FIN-010, FIN-011, FIN-012 | Decision Table + Boundary Value Analysis + State Transition | Exact 15% combination discount, eco threshold behavior, discount removal after cart-state change, and exact final stacked total of $80.75 |

**Final API implementation groups: 10**

Several groups intentionally contain multiple scenario IDs because those cases share the same endpoint, business rule, setup, or test flow.

Where appropriate, these cases should be implemented as data-driven Playwright API tests instead of creating a separate test file or duplicated setup for every scenario ID.

The number of represented scenario IDs therefore does NOT equal the number of automation implementations.

---

### 10.4 Final UI / End-to-End Automation — Human Selected

| Final ID | Automation Journey | Source Scenario IDs | Technique | Key Assertions / Purpose |
|---|---|---|---|---|
| F-UI-01 | Login → authenticated account | AUTH-001, AUTH-002 | Equivalence Partitioning + State Transition | Successful login; exact expected navigation to account area; authenticated UI state visible |
| F-UI-02 | Browse / Product → Add to Cart | PROD-008, PROD-009 | Equivalence Partitioning | Product can be selected and added; success state/cart badge is verified; confirmed out-of-stock behavior is asserted |
| F-UI-03 | Logged-in Cart → Checkout → Credit Card → Order Confirmation | CKO-001, CKO-027 | State Transition | Complete critical purchase journey; checkout steps transition correctly; successful order confirmation and invoice number are displayed |
| F-UI-04 | Invoice detail + customer-visible financial verification | INV-003, INV-005 | Equivalence Partitioning + Financial Verification | Invoice details are rendered and customer-visible subtotal/discount/final total match the exact expected financial calculation |

**Final UI/E2E implementation journeys: 4**

The UI suite is intentionally smaller than the API suite.

Business rules, validation boundaries, financial combinations, and authorization conditions are primarily tested through REST APIs.

UI automation is reserved for:

- authentication behavior visible to the user;
- product-to-cart interaction;
- the critical checkout journey;
- order confirmation;
- and customer-visible invoice/financial verification.

This keeps the suite aligned with the test pyramid and avoids an E2E-heavy "ice-cream cone" design.

---

### 10.5 Mandatory Exact Financial Assertions Retained

Financial correctness is intentionally NOT reduced simply to minimize the number of tests.

The assignment specifically requires exact validation of the money math. Therefore, the selected financial automation must preserve exact and deterministic assertions wherever the expected behavior has been confirmed from the clean reference.

At minimum, the implementation must demonstrate the following confirmed calculations:

| Financial Rule | Expected Calculation |
|---|---|
| Standard line total | 3 × $10.00 = **$30.00** |
| Discounted line total | 2 × $18.00 = **$36.00** |
| Minimum quantity financial integrity | 1 × $7.25 = **$7.25** |
| Maximum quantity financial integrity | 99 × $4.49 = **$444.51** |
| Combination discount | Rental + non-rental eligible cart = **15%** |
| Combination negative partition | Single product-type cart = no combination discount |
| Combination state transition | Discount is removed when the cart no longer contains the required product-type combination |
| Eco discount threshold | More than 50% qualifying quantity = **5%** |
| Eco boundary | Exactly 50% qualifying quantity = no eco discount |
| Discount stacking | $100.00 − $15.00 = $85.00; then 5% of $85.00 = $4.25; final total = **$80.75** |

No approximate financial assertions are permitted.

Assertions such as:

- `toBeDefined()`
- `toBeTruthy()`
- `not null`
- `> 0`
- or merely checking that a monetary field exists

are insufficient for these financial cases.

Where the expected monetary rule cannot be conclusively established from the approved clean reference, it must not be invented merely to increase coverage.

Tax, voucher behavior, or additional aggregate-rounding rules must therefore not be asserted unless their expected behavior has been independently confirmed from the approved oracle.

---

### 10.6 Coverage of Required Test-Design Techniques

The reduced implementation deliberately retains all four black-box test-design techniques requested by the assignment.

| Technique | Final Automation Examples | How It Is Demonstrated |
|---|---|---|
| Equivalence Partitioning | F-API-01, F-API-02, F-API-03, F-API-06 | Valid vs. invalid credentials/data and valid/invalid input partitions |
| Boundary Value Analysis | F-API-02, F-API-04, F-API-09, F-API-10 | Registration age boundaries, quantity 0/1/99/100, financial quantity boundaries, eco threshold |
| Decision Table | F-API-03, F-API-08, F-API-10 | Category × brand combinations, invoice ownership/authorization combinations, discount eligibility combinations |
| State Transition | F-API-05, F-API-10, F-UI-03 | Cart add/update/remove state, discount removal after cart change, checkout → payment → confirmation |

Therefore, reducing the implementation count does not remove the test-design reasoning required by the assessment.

The final suite demonstrates the techniques through a focused set of high-value cases rather than attempting to automate every possible scenario.

---

### 10.7 Clean-Oracle → Buggy-Target Execution Strategy

The automated tests will first be implemented and stabilized against the CLEAN reference applications:

- UI: `https://practicesoftwaretesting.com`
- REST API: `https://api.practicesoftwaretesting.com`

The clean application is treated as the behavioural oracle for expected results.

All selected assertions must first be validated against the clean application.

The initial objective is:

**Clean application + selected tests + exact assertions = stable GREEN baseline**

Once the clean regression baseline is stable, the SAME automation suite and SAME assertions will be executed against the deliberately buggy applications by changing only environment/configuration values:

- UI: `https://with-bugs.practicesoftwaretesting.com`
- REST API: `https://api-with-bugs.practicesoftwaretesting.com`

The framework must therefore use configurable base URLs rather than hard-coded environment URLs inside individual test files.

The intended execution model is:

CLEAN environment  
→ implement tests  
→ execute  
→ correct test/setup/selector issues  
→ establish green baseline  
→ switch environment configuration only  
→ BUGGY environment  
→ execute the same tests unchanged  
→ investigate failures  
→ identify reproducible behavioral regressions

No assertion should be weakened or changed merely to make the buggy application pass.

A failure against the buggy environment is treated initially as a **candidate regression**, not automatically as a confirmed product defect.

Each failure must be investigated to distinguish:

- genuine application defect;
- test implementation issue;
- test-data/setup issue;
- selector/locator issue;
- environmental/transient issue.

Only reproducible application defects should be reported as bugs.

The `sprint5-with-bugs/**` application source, known-bug lists, defect seeds, or answer-key material must NOT be inspected to discover expected defects.

Defects are discovered through observable application behavior and comparison with the approved clean behavioural oracle.

---

### 10.8 Relationship Between Manual and Automated Defect Discovery

Manual exploratory testing and automated regression execution are treated as complementary but independent defect-discovery activities.

The manually discovered bug reports remain evidence from the exploratory testing phase.

The automated suite is NOT seeded or artificially modified to reproduce the manually discovered bugs.

The automated suite is also NOT expected to reproduce the same number of defects found manually.

Instead:

1. expected behavior is established from the clean oracle;
2. tests are designed with meaningful, pinned assertions;
3. tests are stabilized against the clean application;
4. the same tests are executed unchanged against the buggy application;
5. automation failures are investigated;
6. reproducible behavioral differences are identified;
7. genuine product defects discovered through automation are recorded as regression findings.

The automated results may:

- reproduce a defect already discovered manually;
- expose a different manifestation of an existing defect;
- discover an additional defect;
- or continue to pass where the manually discovered defect is outside the selected automation scope.

No attempt is made to force a one-to-one mapping between manual bug reports and automated test failures.

A single product defect may cause multiple automated tests to fail.

Likewise, a single automated journey may expose more than one symptom.

Therefore:

**number of failed tests != number of unique product defects**

Failures must be analyzed by behavior and likely root cause before they are counted as separate defects.

This preserves the independence and integrity of both exploratory testing and automated regression testing.

---

### 10.9 Green and Red Regression Interpretation

The automation suite is authored from CLEAN expected behavior rather than from knowledge of the deliberately seeded defects.

Before execution against the buggy application, the selected tests are therefore considered clean-oracle regression tests rather than pre-labelled red tests.

After execution:

- **PASS on CLEAN + PASS on BUGGY**  
  → selected behavior appears to remain correct in the buggy build.

- **PASS on CLEAN + FAIL on BUGGY**  
  → candidate behavioral regression requiring investigation.

- **FAIL on CLEAN + FAIL on BUGGY**  
  → first investigate the automation, test data, environment, selector, or expected behavior before considering it a product defect.

- **FAIL on CLEAN + PASS on BUGGY**  
  → investigate the test/oracle assumption; do not automatically treat the buggy behavior as correct.

Only after a CLEAN-pass / BUGGY-fail difference is reproduced and verified as genuine application behavior should the failure be described as a confirmed red regression test pinning a real defect.

The test expectation itself should remain based on the clean oracle.

---

### 10.10 Final Human-Approved Implementation Summary

The final committed automation scope for this take-home assessment is:

- **10 REST API automation groups**
- **4 UI / End-to-End automation journeys**
- **14 total implementation-level automation groups/journeys**
- Exact financial validation retained
- Positive coverage retained
- Negative coverage retained
- Boundary coverage retained
- Security-relevant invoice authorization retained
- Complete shopping lifecycle represented
- Authentication represented
- Browse/Search represented
- Product represented
- Cart represented
- Checkout/Payment represented
- Invoice represented
- Financial calculations represented
- All four requested black-box test-design techniques represented
- UI + REST API requirement satisfied
- Same suite designed to run against both CLEAN and BUGGY environments

The remaining valid scenarios from Sections 1–9 are not rejected as incorrect or unnecessary tests.

They are intentionally deferred because their incremental regression value does not justify their implementation cost within this specific 1–2 day take-home exercise.

They would form part of the next regression-expansion backlog if additional implementation time were available.

The final scope therefore represents a conscious trade-off:

**depth, correctness, reproducibility, and meaningful assertions over automation volume.**

---

### 10.11 AI-Assisted Scope Decision

AI was used to accelerate:

- source analysis;
- domain-knowledge extraction;
- scenario generation;
- test-design technique application;
- test-layer recommendations;
- automation candidate identification;
- and initial scope analysis.

The AI-generated analysis produced a broader automation candidate set.

That recommendation was NOT accepted blindly.

During human review, the implementation scope was deliberately reduced based on:

- the assignment's 1–2 day constraint;
- core business flows;
- financial risk;
- security value;
- duplication;
- test-pyramid principles;
- implementation effort;
- and maintainability.

Examples of coverage intentionally reduced during human review include:

- multiple payment-method happy paths;
- duplicate UI/API coverage where one layer provides sufficient confidence;
- secondary authentication/account workflows;
- lower-value product and browse checks;
- guest checkout as an additional full E2E journey;
- and other regression candidates already documented in Sections 1–9.

Financial validation was deliberately retained at greater depth because the assignment explicitly identifies exact money-math verification as a core requirement.

This human review is part of the AI-verification process: AI accelerated the analysis, while the QA/SDET engineer remained responsible for the final scope and implementation decisions.

---

### 10.12 Final Generate Tests Agent Handoff

**Section 10 is the FINAL HUMAN-APPROVED implementation scope and takes precedence over the broader automation candidate lists in Section 9 for code generation.**

The Generate Tests agent must:

1. Generate ONLY:
   - F-API-01 through F-API-10
   - F-UI-01 through F-UI-04

2. Do NOT generate all API-G1–API-G21 or UI-J1–UI-J8 from Section 9.

3. Use the corresponding approved scenario documents and `docs/ai-knowledge/` files to obtain confirmed:
   - test data;
   - REST endpoints;
   - request/response contracts;
   - selectors;
   - business rules;
   - and expected behavior.

4. Use Playwright for both:
   - REST API automation;
   - UI automation.

5. Prefer data-driven implementation where multiple scenario IDs are grouped under one final automation ID.

6. Preserve specific, meaningful assertions.

7. Preserve the mandatory exact financial calculations defined in §10.5.

8. Keep UI and API automation logically separated.

9. Use reusable Page Objects for appropriate UI interactions.

10. Use reusable API helpers/fixtures where they meaningfully reduce duplication.

11. Use deterministic test data and isolate/reset test state where required.

12. Do not introduce arbitrary hard waits.

13. Use configurable UI and API base URLs so that the same tests can run against CLEAN and BUGGY environments without modifying the test assertions.

14. Default the initial implementation/execution to the CLEAN environment:
    - UI: `https://practicesoftwaretesting.com`
    - API: `https://api.practicesoftwaretesting.com`

15. Do NOT execute against the buggy environment during the initial test-generation/stabilization phase.

16. First establish a stable GREEN baseline against the CLEAN application.

17. Do NOT inspect:
    - `sprint5-with-bugs/**`
    - known-bug lists
    - defect seeds
    - answer-key material
    - manually discovered bug reports

    when generating the automation expectations.

18. Do NOT generate additional Section 9 candidates unless explicitly approved by the human QA/SDET engineer.

19. Do NOT weaken, remove, or generalize assertions merely to make a test pass.

20. If an expected behavior required by a selected test cannot be confirmed from the approved clean knowledge/source, report the conflict instead of inventing an expectation.

21. After the CLEAN suite has been stabilized, the exact same tests and assertions will subsequently be executed against:
    - UI: `https://with-bugs.practicesoftwaretesting.com`
    - API: `https://api-with-bugs.practicesoftwaretesting.com`

22. The environment switch must be configuration-driven; individual tests must not require code changes when switching CLEAN → BUGGY.

23. A buggy-environment failure must not automatically be labelled a product defect. It must first be reproduced and investigated.

24. The suite must be runnable through one documented command covering the selected UI + API regression scope.

This human-approved scope is the authoritative implementation boundary for the remainder of the automation phase.

---

