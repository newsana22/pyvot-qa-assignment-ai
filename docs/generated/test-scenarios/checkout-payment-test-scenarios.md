# Checkout / Payment — Test Scenarios

> Baseline: Clean Sprint 5 (`sprint5/UI`, `sprint5/API`) only. Derived from `docs/ai-knowledge/business-rules.md` §8–11, `user-flows.md` §11/§11b/§11c, `api-reference.md` (Invoices, Payment, Postcode Lookup), `ui-reference.md` (Checkout — Login/Address/Payment Steps). `sprint5-with-bugs/**` was not consulted.

## Scope

Checkout wizard progression (sign-in/guest → billing address → payment → completion), address validation, payment-method-specific validation for all five methods, and purchase completion. Cart-review-step behavior is covered in [cart-test-scenarios.md](cart-test-scenarios.md); discount/total arithmetic in [financial-calculations-test-scenarios.md](financial-calculations-test-scenarios.md).

## Scenarios

#### CKO-001 — Full Checkout Happy Path (Logged-In User, Credit Card)
- **Feature / Module:** Checkout — End-to-End
- **Objective:** Verify a logged-in user can complete checkout from cart review through payment confirmation.
- **Preconditions:** Logged in; cart has at least one item.
- **Test Data / Inputs:** Valid billing address; valid credit card details.
- **Test Steps:** 1) From cart step, click `proceed-1`. 2) Sign-in step auto-skips (already logged in). 3) Fill/confirm billing address, click `proceed-3`. 4) Select Credit Card, fill valid fields, click `finish`.
- **Expected Result:** Order created (`POST /invoices` 201); invoice number shown in confirmation; checkout confirmation email queued.
- **Business Rule / Requirement Reference:** business-rules.md §8, §11; user-flows.md §11.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** UI / End-to-End (primary), API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-002 — Full Checkout Happy Path (Guest Checkout)
- **Feature / Module:** Checkout — Guest Flow
- **Objective:** Verify a guest can complete checkout by providing email/first/last name at the sign-in step.
- **Preconditions:** Not logged in; cart has at least one item.
- **Test Data / Inputs:** Guest email, first name, last name; valid billing address; valid payment details.
- **Test Steps:** 1) Proceed from cart. 2) At sign-in step, fill guest fields (`guest-email`, `guest-first-name`, `guest-last-name`). 3) Complete billing address. 4) Complete payment.
- **Expected Result:** `POST /invoices/guest` returns 201; invoice created without requiring an account.
- **Business Rule / Requirement Reference:** business-rules.md §8; user-flows.md §11.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** UI / End-to-End (primary), API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-003 — Already-Logged-In User Skips Sign-In Step
- **Feature / Module:** Checkout — Sign-In Step
- **Objective:** Verify a logged-in user sees an inline message and skips directly to billing address.
- **Preconditions:** Logged in; cart has items.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Proceed from cart step to the sign-in step.
- **Expected Result:** "You are already signed in as [First Name] [Last Name]" message shown (per docs/user-stories/v5.md AC5); user proceeds directly to billing address without re-entering credentials.
- **Business Rule / Requirement Reference:** business-rules.md §8.
- **Test Design Technique:** Decision Table
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** Message text sourced from docs/user-stories/v5.md; not independently re-verified against a translation key value in this knowledge-base pass.

#### CKO-004 — Sign-In Step Login with TOTP-Enabled Account
- **Feature / Module:** Checkout — Sign-In Step
- **Objective:** Verify the checkout sign-in step supports the TOTP second-factor flow.
- **Preconditions:** Not logged in; account has TOTP enabled; cart has items.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Enter email/password at the sign-in step. 2) Enter the resulting 6-digit TOTP code (`totp-code`).
- **Expected Result:** Login completes and checkout proceeds to billing address after valid TOTP verification.
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-005 — Empty Cart Blocks Checkout Entry
- **Feature / Module:** Checkout — Cart Review Step
- **Objective:** Verify navigating to checkout with an empty cart prevents proceeding.
- **Preconditions:** Cart is empty.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Navigate to `/checkout`.
- **Expected Result:** "Your shopping cart is empty" shown; "Proceed" not actionable.
- **Business Rule / Requirement Reference:** user-flows.md §11c.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** Cross-referenced with CART-015/CART-016 in cart-test-scenarios.md.

#### CKO-006 — Billing Address Pre-Filled for Logged-In Users
- **Feature / Module:** Checkout — Billing Address Step
- **Objective:** Verify the billing address form is pre-filled from the account's stored address for logged-in users.
- **Preconditions:** Logged in with a saved address.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Reach the billing address step as a logged-in user.
- **Expected Result:** Street, city, state, country, postal code fields are pre-populated from the account (per docs/user-stories/v5.md AC4).
- **Business Rule / Requirement Reference:** business-rules.md §9.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** Pre-fill behavior sourced from docs/user-stories/v5.md; the exact pre-fill call site was not independently traced to `address.component.ts` in this knowledge-base pass.

#### CKO-007 — Billing Address Rejected — Missing Required Fields (Street/City/Country)
- **Feature / Module:** Checkout — Billing Address Step
- **Objective:** Verify street, city, and country are enforced as required.
- **Preconditions:** Cart/address step reached.
- **Test Data / Inputs:** Address payload omitting `billing_street`, `billing_city`, or `billing_country` in turn.
- **Test Steps:** 1) Submit the billing address step (or `POST /invoices`) with each required field omitted.
- **Expected Result:** Validation error for the missing field(s); `proceed-3` remains disabled in the UI until the form is valid.
- **Business Rule / Requirement Reference:** business-rules.md §9.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), Component (UI)
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-008 — Billing Address State/Postal Code Omission — Documented vs. Implementation Conflict
- **Feature / Module:** Checkout — Billing Address Step
- **Objective:** Investigate whether omitting `billing_state`/`billing_postal_code` is accepted or rejected at the API layer.
- **Preconditions:** Cart/address step reached.
- **Test Data / Inputs:** Otherwise-valid address payload omitting `billing_state` and `billing_postal_code`.
- **Test Steps:** 1) Submit `POST /invoices` with `billing_state`/`billing_postal_code` omitted.
- **Expected Result:** `Needs Human Review` — docs/user-stories/v5.md lists State and Postal code as required, but `StoreInvoice.php` does not mark them `required` (only type/length validated). Confirm actual server response before asserting pass/fail.
- **Business Rule / Requirement Reference:** business-rules.md §9.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** No
- **Notes / Risks:** Do not automate a pass/fail assertion until the conflict is resolved with the team — use as an exploratory/manual investigation scenario.

#### CKO-009 — Billing Address Field Length Boundaries
- **Feature / Module:** Checkout — Billing Address Step / Boundary
- **Objective:** Verify max-length boundaries for street (70), city/state/country (40), postal code (10).
- **Preconditions:** Cart/address step reached.
- **Test Data / Inputs:** Values at exactly the max length, and max length + 1, for each field.
- **Test Steps:** 1) Submit the address form/API request with each field at its boundary and boundary+1.
- **Expected Result:** Max-length values accepted; boundary+1 values rejected with a validation error.
- **Business Rule / Requirement Reference:** business-rules.md §9; §14.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-010 — Billing Address Rejects Subscript/Superscript Characters
- **Feature / Module:** Checkout — Billing Address Step / Security-Validation
- **Objective:** Verify address text fields reject subscript/superscript Unicode characters.
- **Preconditions:** Cart/address step reached.
- **Test Data / Inputs:** A street/city value containing subscript/superscript Unicode characters (e.g., U+00B2).
- **Test Steps:** 1) Submit the address form with a subscript/superscript character in `billing_street`.
- **Expected Result:** Validation error raised (`SubscriptSuperscriptRule`).
- **Business Rule / Requirement Reference:** business-rules.md §9.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-011 — Postcode Lookup Autofills Address Fields
- **Feature / Module:** Checkout — Billing Address Step / Postcode Lookup
- **Objective:** Verify entering country + postal code + house number autofills street/city/state.
- **Preconditions:** Cart/address step reached.
- **Test Data / Inputs:** Valid country, postal code, and house number combination.
- **Test Steps:** 1) Fill `country`, `postal_code`, `house_number` fields (in any order, all three present).
- **Expected Result:** After a 300ms debounce, `GET /postcode-lookup` is called; `street`/`city`/`state` fields autofill from the response.
- **Business Rule / Requirement Reference:** business-rules.md §9.
- **Test Design Technique:** Decision Table
- **Recommended Test Layer:** UI / End-to-End (primary), API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-012 — Postcode Lookup Mismatch Returns Validation Error
- **Feature / Module:** Checkout — Billing Address Step / Postcode Lookup
- **Objective:** Verify a country/postcode combination with no valid match surfaces an error.
- **Preconditions:** Cart/address step reached.
- **Test Data / Inputs:** A postcode that doesn't match the given country's format.
- **Test Steps:** 1) Enter a mismatched country/postcode pair.
- **Expected Result:** `GET /postcode-lookup` returns 422; `postcode-lookup-error` hint shown in the UI.
- **Business Rule / Requirement Reference:** business-rules.md §9.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), UI
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-013 — Postcode Lookup Service Outage Fails Open
- **Feature / Module:** Checkout — Billing Address Step / Resilience
- **Objective:** Verify that if the postcode lookup upstream service is unavailable, address validation is skipped rather than blocking checkout.
- **Preconditions:** Cart/address step reached.
- **Test Data / Inputs:** Simulated upstream lookup failure (e.g., via `X-Postcode-Lookup-Url` in non-production).
- **Test Steps:** 1) Trigger a postcode lookup with the upstream service unavailable. 2) Submit the address step regardless.
- **Expected Result:** `AddressMatchesCountry` validation is skipped (fails open) rather than rejecting the address; checkout is not blocked. A direct upstream `http` driver failure returns 502 from `/postcode-lookup` itself.
- **Business Rule / Requirement Reference:** business-rules.md §9.
- **Test Design Technique:** Decision Table
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** No
- **Notes / Risks:** Requires controlled simulation of upstream outage; recommend manual/exploratory execution or a mocked integration test rather than full E2E automation.

#### CKO-014 — Bank Transfer Payment — Valid Fields Accepted
- **Feature / Module:** Checkout — Payment Step / Bank Transfer
- **Objective:** Verify valid bank transfer fields pass validation and complete checkout.
- **Preconditions:** Cart/address steps completed; payment step reached.
- **Test Data / Inputs:** `bank_name` (letters/spaces), `account_name` (alphanumeric + `.'-`/spaces), `account_number` (digits only).
- **Test Steps:** 1) Select Bank Transfer. 2) Fill all fields with valid values. 3) Click `finish`.
- **Expected Result:** Order completes successfully.
- **Business Rule / Requirement Reference:** business-rules.md §10.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), UI
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-015 — Bank Transfer Payment — Invalid Field Formats Rejected
- **Feature / Module:** Checkout — Payment Step / Bank Transfer
- **Objective:** Verify each bank transfer field's format is enforced.
- **Preconditions:** Cart/address steps completed; payment step reached.
- **Test Data / Inputs:** `bank_name` with digits; `account_name` with disallowed symbols; `account_number` with letters.
- **Test Steps:** 1) Submit each invalid field variant via `POST /payment/check` and `POST /invoices`.
- **Expected Result:** 422 on both endpoints for each invalid variant.
- **Business Rule / Requirement Reference:** business-rules.md §10.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** Data-driven test recommended.

#### CKO-016 — Credit Card Payment — Valid Fields Accepted
- **Feature / Module:** Checkout — Payment Step / Credit Card
- **Objective:** Verify a correctly formatted credit card payment completes checkout.
- **Preconditions:** Cart/address steps completed; payment step reached.
- **Test Data / Inputs:** `credit_card_number` in `XXXX-XXXX-XXXX-XXXX` format, future `expiration_date` (`MM/YYYY`), 3–4 digit `cvv`, letters-only `card_holder_name`.
- **Test Steps:** 1) Select Credit Card. 2) Fill valid fields. 3) Click `finish`.
- **Expected Result:** Order completes successfully.
- **Business Rule / Requirement Reference:** business-rules.md §10.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), UI
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-017 — Credit Card Payment — Expired Date Rejected
- **Feature / Module:** Checkout — Payment Step / Credit Card / Boundary
- **Objective:** Verify a past expiration date is rejected with the documented error.
- **Preconditions:** Cart/address steps completed; payment step reached.
- **Test Data / Inputs:** `expiration_date` in the past (e.g., last month).
- **Test Steps:** 1) Submit credit card payment with a past expiration date.
- **Expected Result:** "Expiration date must be in the future." error; 422 at `POST /payment/check` and `POST /invoices`.
- **Business Rule / Requirement Reference:** business-rules.md §10.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-018 — Credit Card Payment — Malformed Card Number/CVV/Holder Name Rejected
- **Feature / Module:** Checkout — Payment Step / Credit Card
- **Objective:** Verify malformed card number, invalid CVV length, and non-alphabetic holder name are each rejected.
- **Preconditions:** Cart/address steps completed; payment step reached.
- **Test Data / Inputs:** Card number without dashes; CVV of 2 or 5 digits; holder name with digits/symbols.
- **Test Steps:** 1) Submit each invalid variant.
- **Expected Result:** 422 for each invalid variant.
- **Business Rule / Requirement Reference:** business-rules.md §10.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** Data-driven test recommended.

#### CKO-019 — Buy Now Pay Later — Valid Installment Selection
- **Feature / Module:** Checkout — Payment Step / BNPL
- **Objective:** Verify a valid `monthly_installments` value (3/6/9/12) completes checkout.
- **Preconditions:** Cart/address steps completed; payment step reached.
- **Test Data / Inputs:** `monthly_installments = 6`.
- **Test Steps:** 1) Select Buy Now Pay Later. 2) Choose an installment option. 3) Click `finish`.
- **Expected Result:** Order completes successfully.
- **Business Rule / Requirement Reference:** business-rules.md §10.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), UI
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-020 — Gift Card — Valid Number and Code Accepted
- **Feature / Module:** Checkout — Payment Step / Gift Card
- **Objective:** Verify a correctly formatted 16-char gift card number and 4-char validation code complete checkout.
- **Preconditions:** Cart/address steps completed; payment step reached.
- **Test Data / Inputs:** `gift_card_number` — 16 alphanumeric chars; `validation_code` — 4 alphanumeric chars.
- **Test Steps:** 1) Select Gift Card. 2) Enter valid number/code. 3) Click `finish`.
- **Expected Result:** Order completes successfully.
- **Business Rule / Requirement Reference:** business-rules.md §10; docs/gift-card-validation.md.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), UI
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-021 — Gift Card — Malformed Number/Code Bypassing Client-Side Check Is Blocked at Order Time
- **Feature / Module:** Checkout — Payment Step / Gift Card / Security Boundary
- **Objective:** Verify that even if the `/payment/check` pre-check is bypassed, `POST /invoices` re-validates and rejects a malformed gift card.
- **Preconditions:** Cart/address steps completed.
- **Test Data / Inputs:** `gift_card_number` of incorrect length/characters; `validation_code` of incorrect length/characters.
- **Test Steps:** 1) Call `POST /invoices` (or `/invoices/guest`) directly with a malformed gift card number/code, bypassing `/payment/check`.
- **Expected Result:** 422; no invoice or payment record is created.
- **Business Rule / Requirement Reference:** business-rules.md §10; user-flows.md §11b.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** This is the authoritative security boundary for gift card format — prioritize automation here over the UI-level pre-check.

#### CKO-022 — Cash on Delivery Requires No Additional Fields
- **Feature / Module:** Checkout — Payment Step / Cash on Delivery
- **Objective:** Verify Cash on Delivery completes checkout without requiring any method-specific fields.
- **Preconditions:** Cart/address steps completed; payment step reached.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Select Cash on Delivery. 2) Click `finish` without entering additional data.
- **Expected Result:** Order completes successfully with no extra field validation applied.
- **Business Rule / Requirement Reference:** business-rules.md §10.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** API (primary), UI
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-023 — Switching Payment Method Resets Form and Shows Only Relevant Fields
- **Feature / Module:** Checkout — Payment Step / UI State
- **Objective:** Verify switching the payment method dropdown clears previously entered data and shows only the new method's fields.
- **Preconditions:** Cart/address steps completed; payment step reached.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Select Credit Card and enter data. 2) Switch to Gift Card.
- **Expected Result:** Credit card fields are hidden and cleared; only gift card fields are shown, initially empty.
- **Business Rule / Requirement Reference:** business-rules.md §10.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** Component (UI)
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-024 — Finish Button Disabled Until Payment Form Is Valid
- **Feature / Module:** Checkout — Payment Step / UI State
- **Objective:** Verify the `finish` button remains disabled until all required payment fields are valid.
- **Preconditions:** Cart/address steps completed; payment step reached.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Select a payment method. 2) Leave a required field empty or invalid. 3) Observe `finish` button state. 4) Correct the field.
- **Expected Result:** `finish` disabled while invalid; enabled once `cusPayment.valid`.
- **Business Rule / Requirement Reference:** ui-reference.md (Checkout — Payment Step).
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** Component (UI)
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-025 — Purchase Completion Creates Invoice, Payment, and Queues Confirmation Email
- **Feature / Module:** Checkout — Completion
- **Objective:** Verify a successful checkout creates the invoice + payment records, dispatches inventory updates, and queues a confirmation email.
- **Preconditions:** Valid cart, address, and payment.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Complete checkout successfully.
- **Expected Result:** `POST /invoices`/`/invoices/guest` returns 201 with a generated `invoice_number`; payment detail row created for the chosen method; `UpdateProductInventory` job dispatched per cart line; `SendCheckoutEmail` job queued.
- **Business Rule / Requirement Reference:** business-rules.md §11.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-026 — Invoice Number Format Validation
- **Feature / Module:** Checkout — Completion
- **Objective:** Verify the generated invoice number follows the `INV-{year}` + zero-padded sequence, 14 characters total.
- **Preconditions:** Valid cart, address, and payment.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Complete a checkout. 2) Inspect the returned `invoice_number`.
- **Expected Result:** Invoice number matches pattern `INV-{current year}` followed by digits, total length 14.
- **Business Rule / Requirement Reference:** business-rules.md §11.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### CKO-027 — Cart Cleared and Confirmation Shown After Order Placement
- **Feature / Module:** Checkout — Completion (UI)
- **Objective:** Verify the confirmation message with invoice number is displayed and the cart appears empty afterward.
- **Preconditions:** Valid cart, address, and payment.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Complete checkout successfully. 2) Observe the confirmation area (`order-confirmation`). 3) Navigate back to `/checkout`.
- **Expected Result:** `order-confirmation` shows the invoice number (Confirmed via `payment.component.ts` — `paid = true`, `invoice_number` interpolated). Whether the cart is subsequently cleared is `Not confirmed from clean Sprint 5 source` — the `DELETE /carts/{cartId}` endpoint exists per `routes/api.php`, but no call site invoking it from the checkout-completion flow was located in this knowledge-base pass.
- **Business Rule / Requirement Reference:** business-rules.md §11.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** Automate only the confirmation-display assertion; verify cart-clearing behavior against current implementation before adding that assertion.
