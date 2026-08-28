# Invoice — Test Scenarios

> Baseline: Clean Sprint 5 (`sprint5/UI`, `sprint5/API`) only. Derived from `docs/ai-knowledge/business-rules.md` §11–12, `user-flows.md` §16, `api-reference.md` (Invoices), `ui-reference.md` (Account — Invoices List & Detail). `sprint5-with-bugs/**` was not consulted. Discount/total arithmetic correctness is covered in [financial-calculations-test-scenarios.md](financial-calculations-test-scenarios.md); this file focuses on invoice retrieval, access control, and PDF lifecycle.

## Scope

Invoice list, invoice detail retrieval, ownership/authorization scoping, PDF generation status polling, and PDF download.

## Scenarios

#### INV-001 — Invoice List Shows Correct Columns
- **Feature / Module:** Invoice — List
- **Objective:** Verify the invoices list displays invoice number, billing street, invoice date, total, and a details link.
- **Preconditions:** Logged in; at least one completed order exists.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Navigate to `/account/invoices`.
- **Expected Result:** Each row shows invoice number, billing street, invoice date, total, and a working details link; list is paginated.
- **Business Rule / Requirement Reference:** business-rules.md §12.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** UI / End-to-End (primary), API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### INV-002 — Invoice List Pagination
- **Feature / Module:** Invoice — List
- **Objective:** Verify invoice list pagination controls function correctly.
- **Preconditions:** Logged in user with more invoices than one page.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Navigate to `/account/invoices`. 2) Use `pagination-next`/`pagination-prev`.
- **Expected Result:** Page navigation updates the invoice rows shown; standard Laravel paginator shape (`current_page`, `data`, `last_page`, etc.) returned by `GET /invoices`. `Not confirmed from clean Sprint 5 source`: the exact default per-page item count — do not assert a specific number.
- **Business Rule / Requirement Reference:** business-rules.md §2; §12.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** API
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** Default page size (15, Laravel framework default) is not confirmed as an explicit override for this endpoint.

#### INV-003 — Invoice Detail Displays Full Information
- **Feature / Module:** Invoice — Detail
- **Objective:** Verify the invoice detail page shows invoice number/date/total, full billing address, payment method + details, and line items.
- **Preconditions:** Logged in; invoice exists and belongs to the user.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Navigate to `/account/invoices/:id` for an owned invoice.
- **Expected Result:** All fields render: `invoice-number`, `invoice-date`, `total`, billing address fields, `payment-method`, and line items (quantity, name, price, line total).
- **Business Rule / Requirement Reference:** business-rules.md §12.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** UI / End-to-End (primary), API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### INV-004 — Discounted Line Items Show Original and Discounted Price
- **Feature / Module:** Invoice — Detail
- **Objective:** Verify discounted line items on the invoice detail show the original price struck through with the discounted price below.
- **Preconditions:** Invoice includes at least one discounted line item.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Open the detail page for an invoice with a discounted item.
- **Expected Result:** Original price shown struck through; discounted price shown below it.
- **Business Rule / Requirement Reference:** business-rules.md §12.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### INV-005 — Overall Discount Breakdown Shown (Subtotal, Discount %, Discount Amount, Total)
- **Feature / Module:** Invoice — Detail
- **Objective:** Verify the invoice detail shows the subtotal, applied discount percentage, discount amount, and final total.
- **Preconditions:** Invoice with a cart-level (combination) discount applied.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Open the detail page for a discounted invoice.
- **Expected Result:** Subtotal, discount %, discount amount, and total are all displayed and internally consistent.
- **Business Rule / Requirement Reference:** business-rules.md §6; §12.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** UI / End-to-End (primary); exact arithmetic in FIN-010/FIN-011 (financial-calculations-test-scenarios.md)
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### INV-006 — Eco-Friendly Discount Row Displayed on Invoice Detail
- **Feature / Module:** Invoice — Detail
- **Objective:** Verify the `eco-discount` row is shown on invoice detail when the eco-friendly discount was applied at invoice creation.
- **Preconditions:** Invoice where >50% of quantity had CO2 rating A/B at checkout.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Open the detail page for such an invoice.
- **Expected Result:** `eco-discount` row displayed with the 5% discount amount.
- **Business Rule / Requirement Reference:** business-rules.md §6 (implementation-only rule confirmed via `InvoiceService.php` and UI display in `details.component.ts`; not described in docs/user-stories/v5.md — an absence in requirements, not a conflict, since no clean source disputes the display behavior).
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** The display behavior itself is confirmed via implementation; recommend confirming with stakeholders that this undocumented-but-implemented feature is intended before treating it as a formal release requirement.

#### INV-007 — Invoice Detail Not Returned for Non-Existent Invoice ID
- **Feature / Module:** Invoice — Access Control
- **Objective:** Verify a non-existent invoice ID is not returned.
- **Preconditions:** Logged in.
- **Test Data / Inputs:** A syntactically valid but non-existent invoice ID.
- **Test Steps:** 1) Call `GET /invoices/{id}` with a non-existent ID.
- **Expected Result:** 404 (per `api-reference.md`'s documented codes for `GET /invoices/{id}`, this is the code semantically applicable to a not-found resource for an authenticated caller); UI shows a "not found" message.
- **Business Rule / Requirement Reference:** business-rules.md §12; user-flows.md §16.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), UI
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### INV-008 — Invoice Detail Not Returned for Another User's Invoice
- **Feature / Module:** Invoice — Access Control / Authorization
- **Objective:** Verify a non-admin user cannot retrieve another user's invoice by ID.
- **Preconditions:** Two accounts (A and B); B has at least one invoice; logged in as A.
- **Test Data / Inputs:** B's invoice ID.
- **Test Steps:** 1) As user A, call `GET /invoices/{B's invoice id}`.
- **Expected Result:** Not returned — `findOrFail` scoped to `forUser(Auth::id())` excludes non-owned invoices for non-admins.
- **Business Rule / Requirement Reference:** business-rules.md §12.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** Security-relevant IDOR boundary — high priority for regression coverage.

#### INV-009 — Admin Can View Any User's Invoice
- **Feature / Module:** Invoice — Access Control / Authorization
- **Objective:** Verify an admin account can retrieve any user's invoice by ID.
- **Preconditions:** Logged in as admin; a non-admin user's invoice exists.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) As admin, call `GET /invoices/{any user's invoice id}`.
- **Expected Result:** 200; invoice detail returned regardless of owner.
- **Business Rule / Requirement Reference:** business-rules.md §12.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### INV-010 — PDF Download Button Disabled While Generating
- **Feature / Module:** Invoice — PDF Download
- **Objective:** Verify the download button remains disabled while PDF generation status is not `COMPLETED`.
- **Preconditions:** Invoice with PDF generation still in progress (`status` not `COMPLETED`).
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Open invoice detail immediately after order placement. 2) Observe `download-invoice` button state.
- **Expected Result:** Button disabled (`[disabled]="!isDownloadReady"`); UI polls `GET /invoices/{id}/download-pdf-status` every 20 seconds.
- **Business Rule / Requirement Reference:** business-rules.md §12.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** UI / End-to-End (primary), API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** 20-second polling interval makes full E2E timing-sensitive; consider mocking the status endpoint for faster deterministic tests.

#### INV-011 — PDF Download Enabled Once Status Is COMPLETED
- **Feature / Module:** Invoice — PDF Download
- **Objective:** Verify the download button becomes enabled once generation status reaches `COMPLETED`.
- **Preconditions:** Invoice whose PDF has finished generating.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Poll/wait until `download-pdf-status` returns `COMPLETED`. 2) Observe button state.
- **Expected Result:** `download-invoice` becomes enabled; clicking it triggers `GET /invoices/{id}/download-pdf`.
- **Business Rule / Requirement Reference:** business-rules.md §12.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** API (primary), UI
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### INV-012 — PDF Download Status Defaults to NOT_INITIATED
- **Feature / Module:** Invoice — PDF Download
- **Objective:** Verify a fresh invoice with no `Download` record returns `NOT_INITIATED` status.
- **Preconditions:** Newly created invoice, no PDF generation triggered yet.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Call `GET /invoices/{id}/download-pdf-status` immediately after invoice creation.
- **Expected Result:** Status `NOT_INITIATED` (or 400 per documented status codes) returned.
- **Business Rule / Requirement Reference:** business-rules.md §12; api-reference.md (Invoices — `download-pdf-status`).
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** API
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### INV-013 — Download PDF Returns 404 When File Not Yet Created
- **Feature / Module:** Invoice — PDF Download
- **Objective:** Verify requesting the PDF file before it exists on disk returns a clear error.
- **Preconditions:** Invoice exists; PDF file not yet present in storage.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Call `GET /invoices/{id}/download-pdf` before generation completes.
- **Expected Result:** 404 with "Document not created. Try again later."
- **Business Rule / Requirement Reference:** business-rules.md §12.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### INV-014 — Download PDF Succeeds Once File Exists
- **Feature / Module:** Invoice — PDF Download
- **Objective:** Verify the PDF file downloads successfully once generation is complete.
- **Preconditions:** Invoice PDF generation completed (`storage/invoices/{invoiceNumber}.pdf` exists).
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Call `GET /invoices/{id}/download-pdf`.
- **Expected Result:** 200 with the PDF file content.
- **Business Rule / Requirement Reference:** business-rules.md §12.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### INV-015 — Admin Order Status Update (Invoice Status Workflow)
- **Feature / Module:** Invoice — Admin Status Update
- **Objective:** Verify an admin can update an order's status through the documented enum values.
- **Preconditions:** Logged in as admin; invoice exists.
- **Test Data / Inputs:** `status` = one of `AWAITING_FULFILLMENT`, `ON_HOLD`, `AWAITING_SHIPMENT`, `SHIPPED`, `COMPLETED`; `status_message` (5–50 chars, nullable).
- **Test Steps:** 1) Call `PUT /invoices/{id}/status` with a valid status transition.
- **Expected Result:** 200; invoice status updates accordingly.
- **Business Rule / Requirement Reference:** api-reference.md (Invoices — `PUT /invoices/{id}/status`); business-rules.md §14 (`status_message` 5–50 chars).
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### INV-016 — Non-Admin Cannot Update Invoice Status
- **Feature / Module:** Invoice — Admin Status Update / Authorization
- **Objective:** Verify a non-admin cannot call the invoice status-update endpoint on any invoice, including their own.
- **Preconditions:** Logged in as `role=user`.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Call `PUT /invoices/{ownInvoiceId}/status` as a non-admin.
- **Expected Result:** `Not confirmed from clean Sprint 5 source` — the confirmed middleware on `InvoiceController` (`$this->middleware('auth:users')->except(['storeGuest'])`) requires only that the caller be authenticated, with no `role:admin` restriction located specifically for the `status`-update action in this knowledge-base pass, despite docs/user-stories/v5.md (Admin AC5) framing this as an Admin Dashboard capability. Whether a non-admin's request to `PUT /invoices/{id}/status` is rejected at all, and if so with which status code, cannot be asserted as a definitive Expected Result from confirmed clean Sprint 5 evidence.
- **Business Rule / Requirement Reference:** api-reference.md (Invoices — `PUT /invoices/{id}/status`; confirmed middleware is `auth:users` only, no `role:admin` gate located); docs/user-stories/v5.md — Admin AC5 (frames this as admin-only at the requirements level, not corroborated at the controller/middleware level).
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** No
- **Notes / Risks:** This scenario tests an assumption (non-admin blocked) not confirmed from clean Sprint 5 sources; confirm with the team whether `PUT /invoices/{id}/status` is intended to be admin-gated — if the current implementation truly lacks a `role:admin` check, this may represent an authorization gap worth raising separately, rather than a testable negative assertion today.
