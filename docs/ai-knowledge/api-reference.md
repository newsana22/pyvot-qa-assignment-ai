# API Reference (Clean Sprint 5 — REST only)

Scope: REST API only, as documented and implemented in clean Sprint 5 (`sprint5/API`). GraphQL (`app/GraphQL`, `graphql/schema.graphql`, `config/lighthouse.php`) exists per docs/architecture.md but is explicitly out of scope here and was not inspected in depth.

**Two contract layers, clearly distinguished per endpoint:**
- **Documented contract** — the generated OpenAPI 3.2.0 spec at `sprint5/API/storage/api-docs/api-docs.json` (produced from `@OA\*` annotations in the controllers via `darkaonline/l5-swagger`).
- **Implementation-observed contract** — what `sprint5/API/routes/api.php` + the controller/Form-Request code actually do. Used to fill gaps or flag discrepancies; no sample payloads are invented — only fields actually seen in code are listed.

All routes below are prefixed with the API base path (e.g. `http://localhost:8091` locally). Every parameterized route also answers `OPTIONS` with a computed `Allow` header (`sprint5/API/routes/api.php` — shared `$respondOptions` closure).

---

## Cart

| Method | Path | Purpose | Auth | Key params | Status codes | Business rule | QA usage |
|---|---|---|---|---|---|---|---|
| POST | `/carts` | Create a new cart | None required | body: `lat`, `lng` (optional) | 201 | — | Test-data setup (create cart before add-item tests) |
| POST | `/carts/{id}` | Add item to cart | None required | path `id` (cart id); body `product_id` (required, must exist), `quantity` (required, int, 1–99) | 200, 404 (cart not found), 422 | business-rules.md §4 | API/UI hybrid — seed cart contents before UI cart tests |
| GET | `/carts/{id}` | Get cart contents | None required | path `id` | 200, 404 | business-rules.md §6 (discount fields) | Direct API validation of cart totals/discounts |
| PUT | `/carts/{id}/product/quantity` | Update item quantity | None required | body `product_id`, `quantity` (1–99) | 200, 404, 422 | business-rules.md §5 | Boundary testing (0, 1, 99, 100) |
| DELETE | `/carts/{cartId}/product/{productId}` | Remove item from cart | None required | path `cartId`, `productId` | 204, 401, 404, 409, 422 | business-rules.md §5 | Direct API validation |
| DELETE | `/carts/{cartId}` | Delete cart | None required | path `cartId` | 204, 401, 404, 409, 422 | — | Test cleanup |

**Source:** `sprint5/API/routes/api.php` (`carts` group); `sprint5/API/app/Http/Controllers/CartController.php`; `sprint5/API/app/Services/CartService.php`. Note: `auth:users` middleware was **not** found applied to the `carts` route group in `CartController.php`'s constructor — carts appear usable anonymously (guest carts), consistent with guest checkout support. **Not confirmed from clean Sprint 5 source**: whether any other middleware layer (e.g. global) restricts this — only the controller-level middleware was inspected.

---

## Products

| Method | Path | Purpose | Auth | Key params | Status codes | Business rule | QA usage |
|---|---|---|---|---|---|---|---|
| GET / QUERY | `/products` | List/filter products | None (public; cached `public;max_age=120;etag`) | query/body: `q`, `page`, `sort`, `between` (price), `by_category`, `by_category_slug`, `by_brand`, `eco_friendly`, `is_rental`, `by_spec` | 200 | business-rules.md §1 | Test-data setup, direct API validation of filters/sort/pagination |
| GET / QUERY | `/products/search` | Search products by name | None (public, cached) | `q` | 200 | business-rules.md §1 | Search behavior validation |
| GET | `/products/{id}` | Get product detail | None (public, cached) | path `id` | 200, 404 | business-rules.md §3 | Product-detail data setup/validation |
| GET | `/products/{id}/related` | Get related products (same category) | None (public, cached) | path `id` | 200 | user-flows.md §1 | UI related-products validation |
| POST | `/products` | Create product | Not confirmed from clean Sprint 5 source in this pass (no `role:admin` middleware observed on `ProductController`'s constructor within the excerpt read) | body: `name`, `description`, `price`, `category_id`, `brand_id`, `product_image_id`, `is_location_offer`, `is_rental`, `co2_rating` | 201 (typical), 422 | — | Admin test-data setup |
| PUT / PATCH | `/products/{id}` | Update product | Not confirmed from clean Sprint 5 source in this pass | path `id` | 200, 422 | — | Test-data setup |
| DELETE | `/products/{id}` | Delete product | Not confirmed from clean Sprint 5 source in this pass | path `id` | 204 | — | Test cleanup |

**Source:** `sprint5/API/routes/api.php` (`products` group); `sprint5/API/app/Http/Controllers/ProductController.php` (route list confirmed; constructor/middleware not read in this pass — auth requirement for write endpoints is **Not confirmed from clean Sprint 5 source**); `sprint5/API/app/Services/ProductService.php`; `sprint5/API/app/Models/Product.php` (schema fields per `@OA\Schema(schema="ProductRequest"/"ProductResponse")`).

**Documented response fields (`ProductResponse` schema, `Product.php` doc-block):** `id`, `name`, `description`, `price`, `is_location_offer`, `is_rental`, `in_stock` (boolean for non-admin, numeric stock for admin per `getInStockAttribute()`), `co2_rating`, `is_eco_friendly` (derived), `brand`, `category`, `product_image`.

---

## Brands

| Method | Path | Purpose | Auth | Status codes | QA usage |
|---|---|---|---|---|---|
| GET | `/brands` | List all brands | None (public, cached) | 200 | Test-data lookup |
| GET / QUERY | `/brands/search` | Search brands | None (public, cached) | 200 | Filter validation |
| GET | `/brands/{id}` | Get brand | None (public, cached) | 200 | — |
| POST | `/brands` | Create brand | Not confirmed (no admin-only middleware observed for `store`) | 201, 422 | Admin test-data setup |
| PUT | `/brands/{id}` | Update brand | Not confirmed | 200, 422 | — |
| PATCH | `/brands/{id}` | Patch brand | Not confirmed | 200, 422 | — |
| DELETE | `/brands/{id}` | Delete brand | **admin only** (`role:admin` middleware confirmed) | 204 | Negative-auth test (non-admin delete attempt) |

**Source:** `sprint5/API/routes/api.php` (`brands` group); `sprint5/API/app/Http/Controllers/BrandController.php` — `__construct()`: `$this->middleware('role:admin', ['only' => ['destroy']]);` (only `destroy` confirmed admin-gated; other write verbs' auth is **Not confirmed from clean Sprint 5 source**).

---

## Categories

| Method | Path | Purpose | Auth | Key params | QA usage |
|---|---|---|---|---|---|
| GET / QUERY | `/categories/tree` | Category tree (with subcategories) | None (public, cached) | `by_category_slug` (optional) | Sidebar tree data setup |
| GET | `/categories` | List categories (flat) | None (public, cached) | — | — |
| GET / QUERY | `/categories/search` | Search categories | None (public, cached) | `q` | — |
| GET | `/categories/tree/{id}` | Get single category (tree form) | None (public, cached) | path `id` | — |
| POST | `/categories` | Create category | Not confirmed | — | Admin test-data setup |
| PATCH / PUT | `/categories/{id}` | Update category | Not confirmed | — | — |
| DELETE | `/categories/{id}` | Delete category | **admin only** (`role:admin` confirmed) | — | Negative-auth test |

**Source:** `sprint5/API/routes/api.php` (`categories` group); `sprint5/API/app/Http/Controllers/CategoryController.php` — `__construct()`: `$this->middleware('role:admin', ['only' => ['destroy']]);`.

---

## Favorites

| Method | Path | Purpose | Auth | Key params | Status codes | Business rule | QA usage |
|---|---|---|---|---|---|---|---|
| GET | `/favorites` | List current user's favorites | **required** (`auth:users`, all actions) | — | 200, 401, 404, 405 | user-flows.md §15 | Auth/setup validation |
| POST | `/favorites` | Add favorite | **required** | body `product_id` (required, must exist in `products`) | 200/201, 401, 404, 405, 409, 422 | business-rules.md §3 | Direct API + UI hybrid validation |
| GET | `/favorites/{id}` | Get one favorite | **required** | path `id` | 200, 401, 404, 405 | — | — |
| DELETE | `/favorites/{id}` | Remove favorite | **required** | path `id` | 204, 401, 404, 405, 409, 422 | user-flows.md §15 | Direct API validation |

**Source:** `sprint5/API/routes/api.php` (`favorites` group); `sprint5/API/app/Http/Controllers/FavoriteController.php` — `__construct()`: `$this->middleware('auth:users');` (applies to all actions, no exceptions); `sprint5/API/app/Http/Requests/Favorite/StoreFavorite.php`.

---

## Invoices

| Method | Path | Purpose | Auth | Key params | Status codes | Business rule | QA usage |
|---|---|---|---|---|---|---|---|
| GET | `/invoices` | List invoices (own, or all if admin) | **required** (`auth:users`, all except `storeGuest`) | query `page` | 200, 401, 404, 405 | business-rules.md §12 | Setup/validation |
| GET / QUERY | `/invoices/search` | Search invoices | **required** | `q`, `page` | 200 | — | Search validation |
| GET | `/invoices/{id}` | Get invoice detail | **required** (scoped to owner unless admin) | path `id` | 200, 401, 404, 405 | business-rules.md §12 | Direct API validation of totals/discounts |
| GET | `/invoices/{id}/download-pdf` | Download invoice PDF | **required** | path `id` (invoice number) | 200, 404 ("Document not created. Try again later.") | business-rules.md §12 | PDF-download flow validation |
| GET | `/invoices/{id}/download-pdf-status` | Check PDF generation status | **required** | path `id` | 200, 400 (`NOT_INITIATED`) | business-rules.md §12 | Polling-behavior validation |
| PUT | `/invoices/{id}/status` | Update order status (admin flow) | **required** | body `status` (enum: `AWAITING_FULFILLMENT`,`ON_HOLD`,`AWAITING_SHIPMENT`,`SHIPPED`,`COMPLETED`), `status_message` (5–50 chars, nullable) | 200, 401, 404, 405, 422 | docs/user-stories/v5.md — Admin AC5 | Admin workflow validation |
| POST | `/invoices` | Create invoice (checkout, authenticated) | **required** (`auth:users`) | body per `StoreInvoice` rules — see business-rules.md §9–§11 | 201, 401, 404, 405, 422 | business-rules.md §9–§11 | Core checkout API validation, test-data setup for invoice-dependent tests |
| POST | `/invoices/guest` | Create invoice (guest checkout) | **not required** (explicitly excluded from `auth:users`) | body: `StoreInvoice`-equivalent fields + `guest_email`, `guest_first_name`, `guest_last_name` | 201 (200 documented), 422 | business-rules.md §8 | Guest-checkout API validation |
| PUT | `/invoices/{id}` | Update invoice | **required** (scoped to owner) | path `id` | 200, 422 | — | — |
| PATCH | `/invoices/{id}` | Patch invoice | **required** (scoped to owner) | path `id` | 200, 422 | — | — |

**Source:** `sprint5/API/routes/api.php` (`invoices` group); `sprint5/API/app/Http/Controllers/InvoiceController.php` — `__construct()`: `$this->middleware('auth:users')->except(['storeGuest']);`; `sprint5/API/app/Services/InvoiceService.php`; `sprint5/API/app/Http/Requests/Invoice/StoreInvoice.php`.

---

## Payment

| Method | Path | Purpose | Auth | Key params | Status codes | Business rule | QA usage |
|---|---|---|---|---|---|---|---|
| POST | `/payment/check` | Pre-validate payment details before order submission | Not confirmed (no middleware observed in `PaymentController`) | body `payment_method` (enum), `payment_details.*` (method-specific — see business-rules.md §10) | 200 ("Payment was successful"), 422 | business-rules.md §10 | Payment-form validation without creating an order; ideal for negative-format testing (gift card, credit card, bank transfer, BNPL) |

**Source:** `sprint5/API/app/Http/Controllers/PaymentController.php`. Note: this endpoint is a **format pre-check only** — it never creates an invoice/payment row; the authoritative check happens at `POST /invoices`/`POST /invoices/guest` (see business-rules.md §10).

---

## Postcode Lookup

| Method | Path | Purpose | Auth | Key params | Status codes | Business rule | QA usage |
|---|---|---|---|---|---|---|---|
| GET | `/postcode-lookup` | Address autofill by country+postcode(+house number) | None required | query `country` (required, max 40), `postcode` (required, max 10), `house_number` (optional, max 10); optional `X-Postcode-Lookup-Url` header (non-production only) | 200, 422 (format mismatch), 502 (upstream failure) | business-rules.md §9 | Registration/checkout address autofill validation; mockable via `driver=http` per docs/postcode-lookup.md |

**Source:** docs/postcode-lookup.md; `sprint5/API/app/Http/Controllers/PostcodeController.php`.

---

## Users / Authentication

| Method | Path | Purpose | Auth | Key params | Status codes | Business rule | QA usage |
|---|---|---|---|---|---|---|---|
| POST | `/users/login` | Login | None required | body `email`, `password` (or `access_token` + `totp` for 2FA second step) | 200, 401, 423 (locked), 403/`Account disabled` | business-rules.md §7 | Core auth validation incl. lockout/TOTP/disabled-account negative tests |
| POST | `/users/register` | Register new customer | None required | body per `StoreCustomer` rules | 201, 400, 401, 403, 409 | business-rules.md §7 | Registration validation, test-user creation |
| POST | `/users/forgot-password` | Reset password (fixed value) | None required | body `email` (must exist) | 200, 400, 401, 403 | business-rules.md §7 | Password-reset flow validation |
| POST | `/users/change-password` | Change password | **required** (`auth:users`) | body `current_password`, `new_password`, `new_password_confirmation` | 200, 400, 401 | business-rules.md §7 | Change-password validation |
| GET | `/users/logout` | Invalidate current JWT | **required** | — | 200, 400, 401 | — | Session-cleanup between tests |
| GET / QUERY | `/users/search` | Search users | **admin only** (`role:admin` — index/destroy — search itself was not independently confirmed as admin-gated beyond the constructor's `only: ['index','destroy']` scope) | `q`, `page` | 200 | — | Admin test-data lookup |
| GET | `/users/refresh` | Refresh JWT | **required** | — | 200, 400, 401 | — | Token-refresh validation |
| GET | `/users/me` | Get current user | **required** | — | 200, 401 | — | Auth/session validation |
| PUT / PATCH | `{id}` (under `/users`) | Update / patch user | **required**; self or admin only (service-level check) | path `id` | 200, 401 | `UserService::updateUser()` — non-owner/non-admin throws | Authorization-boundary testing |
| GET | `/users` (`/users/`) | List all users | **admin only** (`role:admin` confirmed) | query `page` | 200, 400, 401 | — | Admin test-data setup |
| GET | `/users/{id}` | Get user | **required** | path `id` | 200, 401 | — | — |
| DELETE | `/users/{id}` | Delete user | **admin only** (`role:admin` confirmed) | path `id` | — | — | Admin cleanup/negative-auth test |

**Source:** `sprint5/API/routes/api.php` (`users` group); `sprint5/API/app/Http/Controllers/UserController.php` — `__construct()`: `$this->middleware('auth:users', ['except' => ['login', 'store', 'forgotPassword', 'refresh']]); $this->middleware('role:admin', ['only' => ['index', 'destroy']]);`; `sprint5/API/app/Services/UserService.php`.

---

## Social Auth

| Method | Path | Purpose | Auth | QA usage |
|---|---|---|---|---|
| GET | `/auth/social-login` | Initiate social login (get provider auth URL) | None required | Social-login smoke test setup |
| GET | `/auth/cb/google` | Google OAuth callback | None (OAuth flow) | Not confirmed from clean Sprint 5 source beyond route existence — controller body not inspected in this pass |
| GET | `/auth/cb/github` | GitHub OAuth callback | None (OAuth flow) | Same as above |

**Source:** `sprint5/API/routes/api.php` (`auth` group, `SocialConnectController`); docs/sprints/sprint5.md — "Social Authentication" endpoint table (confirms existence and purpose at requirements level; implementation body of `SocialConnectController.php` not read in this pass).

---

## TOTP (Two-Factor Auth)

| Method | Path | Purpose | Auth | Key params | Status codes | Business rule | QA usage |
|---|---|---|---|---|---|---|---|
| POST | `/totp/setup` | Generate TOTP secret + QR code URL | **required** (`auth:users`) | — | 200, 400 | business-rules.md §7 | 2FA setup validation |
| POST | `/totp/verify` | Verify 6-digit code, enable TOTP | **required** | body `totp` (required, `digits:6`) | 200, 400 | business-rules.md §7 | 2FA verification validation |
| POST | `/totp/login/totp` | Login with TOTP (documented per sprint5.md endpoint table) | Not confirmed — route exists in `sprint5.md`'s table and `routes/api.php`; handler body not independently inspected in this pass (login's TOTP branch is instead handled inline inside `UserController::login()`/`UserService::login()` per code read) | — | — | — | Needs Human Review — clarify relationship between `POST /totp/login/totp` route and the TOTP branch inside `POST /users/login` |

**Source:** `sprint5/API/routes/api.php` (`totp` group); `sprint5/API/app/Http/Controllers/TOTPController.php` (only `setup`/`verify` bodies read); docs/sprints/sprint5.md — "TOTP (Two-Factor Auth)" table (lists `POST /totp/login/totp` as a distinct endpoint).

---

## Contact / Messages

| Method | Path | Purpose | Auth | Key params | Status codes | Business rule | QA usage |
|---|---|---|---|---|---|---|---|
| POST | `/messages` | Send contact message | None required (`send`/`attachFile` excluded from `auth:users`) | body `subject` (required, max 120), `message` (required, max 250 — see business-rules.md §13 conflict), `name`/`email` (conditionally required for guests) | 200, 404, 405 | business-rules.md §13 | Contact-form validation |
| POST | `/messages/{id}/attach-file` | Attach `.txt` file to a message | None required | multipart `file` | 200, 400 (validation errors), 404, 405 | docs/user-stories/v5.md — Contact Form AC4–6 | File-upload validation (extension + 0 KB size) |
| GET | `/messages` | List messages (own, or all if admin) | **required** | query `page` | 200, 401, 404, 405 | — | Setup/validation |
| GET | `/messages/{id}` | Get message detail | **required** | path `id` | 200, 401, 404, 405 | — | — |
| POST | `/messages/{id}/reply` | Reply to a message | **required** | body `message` | 200/201, 401, 404, 405 | user-flows.md §18 | Reply-flow validation |
| PUT | `/messages/{id}/status` | Update message status | **required** | body `status` (validator: `NEW`\|`IN_PROGRESS`\|`RESOLVED`; doc-comment enum additionally lists `ON_HOLD` — see business-rules.md §13 conflict) | 200, 401, 404, 405 | business-rules.md §13 | Admin workflow validation |

**Source:** `sprint5/API/routes/api.php` (`messages` group); `sprint5/API/app/Http/Controllers/ContactController.php` — `__construct()`: `$this->middleware('auth:users', ['except' => ['send', 'attachFile']]);`; `sprint5/API/app/Http/Requests/Contact/StoreContact.php`.

---

## Reports (admin)

| Method | Path | Purpose | Auth | QA usage |
|---|---|---|---|---|
| GET | `/reports/total-sales-of-years` | Yearly sales totals | Not confirmed (rate-limited via `throttle:reports`; role requirement not independently verified in this pass) | Admin dashboard data validation |
| GET | `/reports/total-sales-per-country` | Sales by country | same | — |
| GET | `/reports/top10-purchased-products` | Top 10 purchased products | same | — |
| GET | `/reports/top10-best-selling-categories` | Top 10 categories | same | — |
| GET | `/reports/customers-by-country` | Customers by country | same | — |
| GET | `/reports/average-sales-per-month` | Average monthly sales | same | — |
| GET | `/reports/average-sales-per-week` | Average weekly sales | same | — |

**Source:** `sprint5/API/routes/api.php` — `Route::middleware(['throttle:reports'])->controller(ReportController::class)->prefix('reports')...`. Controller body not read in this pass; auth/role requirement is **Not confirmed from clean Sprint 5 source** beyond the confirmed rate-limiting middleware.

---

## Product Specs, Images, Misc.

| Method | Path | Purpose | Auth | QA usage |
|---|---|---|---|---|
| GET | `/products/{productId}/specs` | List specs for a product | None (public, cached) | Product-detail spec table validation |
| GET | `/products/{productId}/specs/{specId}` | Get one spec | None (public, cached) | — |
| GET | `/product-specs/names` | List distinct spec names | None (public, cached) | Comparison-page spec-name source |
| POST/PUT/DELETE | `/products/{productId}/specs...` | Manage specs | Not confirmed | Admin test-data setup |
| GET | `/images` | List images | None (public, cached) | — |
| GET | `/sales-stream` | Server-Sent Events live sales feed | None required (public per route comment: "Public, finite, seedable") | Real-time-feed smoke test |
| GET | `/status` | App version/environment info | None required | Environment/health check before test runs |
| POST | `/refresh` | Reset DB (migrate:fresh + seed) and flush cache | None required (dev/test utility) | **Primary test-data reset mechanism** — call before test suites needing a known DB state |

**Source:** `sprint5/API/routes/api.php`.

---

## HTTP QUERY Method — Cross-Cutting Contract

- Requests **must** send `Content-Type: application/json` or receive **415 Unsupported Media Type**.
- Successful QUERY responses return the same 200 payload as their GET equivalent, plus an `Accept-Query: application/json` response header.
- A direct (non-preflight) `OPTIONS` request to any QUERY-enabled endpoint returns **204** with an `Allow` header listing supported methods including `QUERY`.
- Endpoints supporting QUERY: `/products`, `/products/search`, `/brands/search`, `/categories/search`, `/categories/tree`, `/invoices/search` (auth required), `/users/search` (admin required).

**Source:** docs/http-query-method.md; docs/sprints/sprint5.md; `sprint5/API/routes/api.php` (`query.body` middleware, `Route::match(['QUERY'], ...)`).

---

## Notes on Auth Requirements Not Independently Confirmed

Several write endpoints (`Product` create/update/delete, `Brand`/`Category` create/update, `ProductSpec` writes, `Report` read access) were only verified for their **routes and validation rules**, not their full authorization middleware, in this pass. Where a specific `role:admin` or `auth:users` middleware call was located in a controller's constructor, it is stated as **confirmed**; otherwise the table marks it **Not confirmed from clean Sprint 5 source** rather than assuming an auth requirement. Confirm against `sprint5/API/app/Http/Controllers/ProductController.php` (constructor), `ReportController.php`, and `ProductSpecController.php` constructors before relying on these for authorization test design.
