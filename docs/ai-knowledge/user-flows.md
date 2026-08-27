# User Flows (Clean Sprint 5)

Verified user journeys only — no test cases. Each flow lists Preconditions, Trigger, Main steps, Expected state transition, relevant UI route/page, relevant API interaction (where determinable), and source paths.

---

## 1. Browse → Filter/Search/Sort → Product Detail

**Preconditions:** None (public/guest accessible).
**Trigger:** Visitor navigates to `/` (home).
**Main steps:**
1. Product grid loads (paginated, 9/page) — route `/` → `ProductOverviewComponent`.
2. Visitor optionally: types a search query (3–40 chars) and submits; checks category/brand checkboxes; toggles eco-friendly filter; adjusts price-range slider ($1–$100 default, $0–$200 bounds); picks a sort order.
3. Visitor clicks a product card.
**Expected state transition:** Grid re-queries and re-renders on any filter/search/sort/pagination change (`resultState` flags `filter_started`→`filter_completed`, etc., drive UI feedback); clicking a card navigates to the detail route.
**UI route/page:** `/` (overview) → `/product/:id` (`ProductDetailComponent`).
**API interaction:** `GET /products` (or `QUERY /products` with JSON body) with `q`, `by_category`, `by_brand`, `eco_friendly`, `between` (price), `sort`, `page`; `GET /products/{id}`.
**Source paths:** docs/user-stories/v5.md — Product Overview, Product Detail; `sprint5/UI/src/app/products/products-routing.module.ts`; `sprint5/UI/src/app/products/overview/overview.component.ts`; `sprint5/API/app/Services/ProductService.php` — `getAllProducts()`.

## 2. Browse by Category

**Preconditions:** None.
**Trigger:** Visitor clicks a category name (header nav or product card category badge).
**Main steps:** Category page loads with the same filter/sort/pagination/price-range controls as the overview, scoped to the category (and its subcategories via `by_category_slug`).
**Expected state transition:** Page title shows the category name; grid shows only matching products.
**UI route/page:** `/category/:name` (`ProductCategoryComponent`).
**API interaction:** `GET /products` with `by_category_slug`, or `GET /categories/tree` for the sidebar tree.
**Source paths:** docs/user-stories/v5.md — Browse Products by Category; `sprint5/UI/src/app/products/products-routing.module.ts`; `sprint5/UI/src/app/products/category/category.component.ts`; `sprint5/API/app/Services/ProductService.php` — `getAllProducts()` (`by_category_slug` handling).

## 3. Product Comparison

**Preconditions:** Visitor has toggled "compare" on one or more product cards/detail pages.
**Trigger:** Visitor navigates to `/comparison`.
**Main steps:** Selected products render side-by-side (price, brand, category, stock, CO2 rating, eco-friendly flag, spec rows, description); "Show only differences" checkbox filters spec rows; "Clear all" empties the comparison.
**Expected state transition:** Empty state shown if no products selected (with a link back to `/`); table populates once products load.
**UI route/page:** `/comparison` (`ComparisonComponent`).
**API interaction:** Not confirmed from clean Sprint 5 source in this pass (docs/architecture.md states the comparison page uses GraphQL aliased queries — REST equivalent not verified; GraphQL is out of scope for this API-reference pass).
**Source paths:** docs/features.md — Product Comparison (v5-only); docs/architecture.md — "Where the front-end uses GraphQL"; `sprint5/UI/src/app/products/products-routing.module.ts`; `sprint5/UI/src/app/products/comparison/comparison.component.ts`.

## 4. Add Product to Cart

**Preconditions:** Product is in stock (or is a rental item).
**Trigger:** Visitor sets a quantity (default 1, +/- buttons or manual entry clamped 1–99) on the product detail page and clicks "Add to Cart".
**Main steps:**
1. If no cart exists yet, one is created (`POST /carts`).
2. Item is added/incremented (`POST /carts/{id}`) with `product_id` + `quantity`.
3. Success toast/message shown.
**Expected state transition:** Cart item count increments (header cart badge); repeat adds of the same product increment its quantity rather than duplicating a line (except the special-cased "Thor Hammer" product, capped at 1).
**UI route/page:** `/product/:id`.
**API interaction:** `POST /carts`, `POST /carts/{id}`.
**Source paths:** docs/user-stories/v5.md — Product Detail AC8; `sprint5/UI/src/app/products/detail/detail.component.ts`; `sprint5/API/app/Http/Controllers/CartController.php`; `sprint5/API/app/Services/CartService.php`.

## 5. Change Cart Item Quantity

**Preconditions:** At least one item in cart; checkout cart-review step reached.
**Trigger:** Visitor edits the quantity input for a cart line (`data-test="product-quantity"`).
**Main steps:** UI clamps to 1–99 (warns via toast if the typed value exceeds 99), then calls the update endpoint.
**Expected state transition:** Line total and cart total (incl. any combination/eco discount) recalculate; confirmation message shown.
**UI route/page:** `/checkout` (cart step).
**API interaction:** `PUT /carts/{id}/product/quantity`.
**Source paths:** docs/user-stories/v5.md — Checkout Cart Review AC2; `sprint5/UI/src/app/checkout/cart/cart.component.ts`; `sprint5/API/app/Http/Controllers/CartController.php` — `updateQuantity()`.

## 6. Remove Item from Cart

**Preconditions:** At least one item in cart.
**Trigger:** Visitor clicks the delete action on a cart line.
**Main steps:** Item removed; discounts recalculated (combination discount removed if the cart no longer mixes rental/non-rental items).
**Expected state transition:** Cart total updates; if the cart becomes empty, "Your shopping cart is empty" is shown.
**UI route/page:** `/checkout` (cart step).
**API interaction:** `DELETE /carts/{cartId}/product/{productId}`.
**Source paths:** docs/user-stories/v5.md — Checkout Cart Review AC3/AC4/AC8; `sprint5/API/app/Services/CartService.php` — `removeProductFromCart()`.

## 7. Continue Shopping (alternative flow)

**Preconditions:** On the checkout cart step.
**Trigger:** Visitor clicks "Continue Shopping" (`data-test="continue-shopping"`).
**Main steps:** Navigates back to the product overview without altering cart state.
**Expected state transition:** Route changes to `/`; cart contents unchanged.
**UI route/page:** `/checkout` → `/`.
**Source paths:** `sprint5/UI/src/app/checkout/cart/cart.component.ts` — `continueShopping()`.

## 8. Login (Standard)

**Preconditions:** Registered account exists.
**Trigger:** Visitor navigates to `/auth/login`, enters email + password, submits.
**Main steps:**
1. `POST /users/login` with `{email, password}`.
2. If account locked (3+ failed attempts, non-admin) → HTTP 423, error shown, no further attempt processed.
3. If account disabled → error "Account disabled" (no token issued).
4. If TOTP enabled → restricted temp token returned; user must enter 6-digit code (`data-test="totp-code"`) which is verified via a second call before a full token is issued.
5. On success → token stored; redirect based on role (`/account` for user, `/admin/dashboard` for admin).
**Expected state transition:** Unauthenticated → authenticated (JWT stored via `token-storage.service.ts`); header nav switches to the logged-in menu.
**UI route/page:** `/auth/login` (`LoginComponent`).
**API interaction:** `POST /users/login`; TOTP verification path (`access_token` + `totp` in the same `login` payload per `UserService::login()`).
**Source paths:** docs/user-stories/v5.md — User Login; `sprint5/UI/src/app/auth/login/login.component.ts`; `sprint5/API/app/Http/Controllers/UserController.php` — `login()`; `sprint5/API/app/Services/UserService.php` — `login()`.

## 8b. Negative Flow — Account Locked

**Preconditions:** 3 consecutive failed login attempts on a non-admin account.
**Trigger:** A 4th login attempt (even with correct credentials).
**Expected state transition:** Login rejected; error "Account locked, too many failed attempts. Please contact the administrator."; HTTP 423 returned; counter is not reset until a *successful* login occurs (which is now blocked).
**Source paths:** docs/user-stories/v5.md — User Login AC4; `sprint5/API/app/Services/UserService.php` — `login()`, `incrementLoginAttempts()`.

## 9. Registration

**Preconditions:** Visitor has no account, or is using a new email.
**Trigger:** Visitor navigates to `/auth/register`, fills in personal + address + password fields, submits.
**Main steps:**
1. As country/postal code/house number are filled, a debounced (300ms) postcode lookup (`GET /postcode-lookup`) autofills street/city/state.
2. Password strength indicator updates live against 4 criteria.
3. On submit: `POST /users/register`.
4. Duplicate email → validation error (server-side `email.unique`); success → confirmation email queued, redirect to login.
**Expected state transition:** Account created (role `user`); visitor redirected to `/auth/login`.
**UI route/page:** `/auth/register` (`RegisterComponent`).
**API interaction:** `GET /postcode-lookup`, `POST /users/register`.
**Source paths:** docs/user-stories/v5.md — User Registration; `sprint5/UI/src/app/auth/register/register.component.ts`; `sprint5/API/app/Http/Controllers/UserController.php` — `store()`; `sprint5/API/app/Http/Requests/Customer/StoreCustomer.php`.

## 10. Forgot Password (alternative auth flow)

**Preconditions:** None.
**Trigger:** Visitor clicks "Forgot password" on the login page, enters email, submits.
**Main steps:** `POST /users/forgot-password`; if email is registered, password is reset to a fixed value and emailed; confirmation message fades after 3 seconds; unregistered email shows an error.
**UI route/page:** `/auth/forgot-password`.
**API interaction:** `POST /users/forgot-password`.
**Source paths:** docs/user-stories/v5.md — Forgot Password; `sprint5/UI/src/app/auth/forgot-password/forgot-password.component.ts`; `sprint5/API/app/Services/UserService.php` — `resetPassword()`.

## 11. Full Checkout — Cart → Sign-In → Billing Address → Payment → Completion

**Preconditions:** Cart contains at least one item.
**Trigger:** Visitor clicks "Proceed" from the cart step of `/checkout`.
**Main steps:**
1. **Cart step:** Review items/discounts; "Proceed" enabled once cart is non-empty.
2. **Sign-in step:** If not logged in, choose "Sign In" (email/password [+TOTP]) or "Guest" (email/first/last name); if already logged in, step is skipped with an inline message.
3. **Billing Address step:** Enter/edit street, city, state, country, postal code (pre-filled for logged-in users; postcode-lookup autofill available); "Proceed" disabled until the form is valid.
4. **Payment step:** Choose payment method (Bank Transfer / Cash on Delivery / Credit Card / Buy Now Pay Later / Gift Card); fill method-specific fields; click "Finish" (`data-test="finish"`, disabled until valid).
5. **Completion:** Order is created; invoice number shown in a confirmation message; checkout confirmation email queued.
**Expected state transition:** Cart → placed order (Invoice + Payment records created); cart presumed cleared (see business-rules.md §11 for confidence note).
**UI route/page:** `/checkout` (single route, multi-step `aw-wizard`).
**API interaction:** `POST /invoices` (authenticated) or `POST /invoices/guest` (guest); prior optional `POST /payment/check` pre-validation.
**Source paths:** docs/user-stories/v5.md — Checkout (Cart Review, Sign In, Billing Address, Payment (Advanced)); `sprint5/UI/src/app/checkout/checkout.component.ts`; `sprint5/API/app/Http/Controllers/InvoiceController.php` — `store()`/`storeGuest()`; `sprint5/API/app/Http/Requests/Invoice/StoreInvoice.php`.

## 11b. Negative Flow — Invalid Gift Card at Checkout

**Preconditions:** Payment method = Gift Card, cart/address steps completed.
**Trigger:** Visitor enters a gift card number/code that does not match the 16-alphanumeric / 4-alphanumeric format, and submits (bypassing or failing client-side validation).
**Expected state transition:** `POST /invoices` returns 422 with field errors on `payment_details.gift_card_number` / `payment_details.validation_code`; **no invoice or payment record is created**.
**Source paths:** docs/gift-card-validation.md; `sprint5/API/app/Http/Requests/Invoice/StoreInvoice.php` — `withValidator()`.

## 11c. Negative Flow — Empty Cart Checkout Attempt

**Preconditions:** Cart is empty.
**Trigger:** Visitor navigates to `/checkout`.
**Expected state transition:** "Your shopping cart is empty" message shown; "Proceed" is not actionable.
**Source paths:** docs/user-stories/v5.md — Checkout Cart Review AC4.

## 12. Account / Profile Update

**Preconditions:** Logged in (`role=user`).
**Trigger:** Visitor navigates to `/account/profile`, edits editable fields, saves.
**Main steps:** First/last name, phone, and address sub-fields (street/postal code/city/state/country) are editable; email is read-only.
**Expected state transition:** On success, confirmation shown and fades after 5 seconds.
**UI route/page:** `/account/profile` (guarded by `UserAuthGuard`).
**API interaction:** `PUT /users/{id}` (or equivalent update call via `customer-account.service.ts`).
**Source paths:** docs/user-stories/v5.md — Customer Profile; `sprint5/UI/src/app/account/profile/profile.component.ts`; `sprint5/UI/src/app/UserAuthGuard.ts`.

## 13. Change Password (from Profile)

**Preconditions:** Logged in.
**Trigger:** Visitor fills current/new/confirm password fields on the profile page and submits.
**Main steps:** Server validates current password match, rejects identical new password, validates confirmation match and complexity.
**Expected state transition:** Success message shown; user is logged out automatically after 5 seconds (client-side).
**UI route/page:** `/account/profile`.
**API interaction:** `POST /users/change-password`.
**Source paths:** docs/user-stories/v5.md — Change Password; `sprint5/API/app/Http/Controllers/UserController.php` — `changePassword()`.

## 14. Two-Factor Authentication Setup

**Preconditions:** Logged in with an account other than the two shared demo accounts.
**Trigger:** Visitor opens the "Setup two factor authentication" section on the profile page.
**Main steps:** QR code + manual secret shown (`POST /totp/setup`); visitor enters a 6-digit code from an authenticator app and clicks "Verify TOTP" (`POST /totp/verify`).
**Expected state transition:** On success, "TOTP verified and enabled successfully." shown and `totp_enabled` becomes true for the account, making TOTP mandatory on future logins.
**API interaction:** `POST /totp/setup`, `POST /totp/verify`.
**Source paths:** docs/user-stories/v5.md — Two-Factor Authentication Setup; `sprint5/API/app/Http/Controllers/TOTPController.php`.

## 15. Favorites — Add / View / Remove

**Add (from product detail):**
- **Preconditions:** Logged in.
- **Trigger:** Click "Add to Favorites" on `/product/:id`.
- **Expected state transition:** Success message; duplicate add shows an "already in favorites" message; unauthenticated click shows an unauthorized message.
- **API interaction:** `POST /favorites`.
- **Source paths:** docs/user-stories/v5.md — Product Detail AC11–13; `sprint5/API/app/Http/Controllers/FavoriteController.php` — `store()`.

**View / Remove (account page):**
- **Trigger:** Navigate to `/account/favorites`.
- **Main steps:** List shows image, name, truncated (250 char) description per favorite; delete button removes an item and refreshes the list; empty state message shown when none exist.
- **API interaction:** `GET /favorites`, `DELETE /favorites/{id}`.
- **Source paths:** docs/user-stories/v5.md — Favorites; `sprint5/UI/src/app/account/favorites/favorites.component.ts`; `sprint5/API/app/Http/Controllers/FavoriteController.php`.

## 16. Invoices — List → Detail → PDF Download

**Preconditions:** Logged in; at least one completed order.
**Trigger:** Navigate to `/account/invoices`, click a row's details link.
**Main steps:**
1. List (paginated): invoice number, billing street, invoice date, total, details link.
2. Detail page: full billing address, payment method + details, line items, discount breakdown, total.
3. Click "Download PDF" — disabled while generating; UI polls generation status every 20 seconds; once `COMPLETED`, button enables and download proceeds.
**Expected state transition:** PDF file downloaded to the browser once ready; a non-existent/foreign invoice ID instead shows a "not found" message.
**UI route/page:** `/account/invoices` → `/account/invoices/:id`.
**API interaction:** `GET /invoices`, `GET /invoices/{id}`, `GET /invoices/{id}/download-pdf-status`, `GET /invoices/{id}/download-pdf`.
**Source paths:** docs/user-stories/v5.md — Invoices; `sprint5/UI/src/app/account/invoices/details/details.component.ts`; `sprint5/API/app/Http/Controllers/InvoiceController.php`.

## 17. Contact Form Submission (Guest or Known User)

**Preconditions:** None (public) — behavior differs when logged in.
**Trigger:** Visitor navigates to `/contact`, fills subject + message (+ optional `.txt`, 0 KB attachment), submits.
**Main steps:** If logged in, name/email are auto-filled and hidden with a "Known user, [Full Name]" message; if not, name/email fields are required and shown. On submit, a confirmation email is sent and a confirmation message displayed.
**API interaction:** `POST /messages`, optionally `POST /messages/{id}/attach-file`.
**Source paths:** docs/user-stories/v5.md — Contact Form (Advanced); `sprint5/API/app/Http/Controllers/ContactController.php`.

## 18. Messages — View and Reply (Account)

**Preconditions:** Logged in; at least one contact message exists for the account.
**Trigger:** Navigate to `/account/messages`, click a message.
**Main steps:** Detail view shows sender/subject/status/body/timestamp plus chronological replies; visitor types a reply and submits.
**Expected state transition:** Reply appended; replies list updates.
**API interaction:** `GET /messages`, `GET /messages/{id}`, `POST /messages/{id}/reply`.
**Source paths:** docs/user-stories/v5.md — Messages; `sprint5/UI/src/app/account/messages/message-detail/message-detail.component.ts`; `sprint5/API/app/Http/Controllers/ContactController.php`.

## 19. Admin, Chat Widget, Multi-Language, Privacy — Requirements-Level Only

These modules exist per clean requirements/docs but their step-by-step flows were **not independently re-verified against implementation** in this pass (Confidence: Partially Confirmed — requirements only):
- **Admin Dashboard** (`/admin`, guarded by `AdminAuthGuard.ts`): product/category/brand/order/user/message management + reports. Source: docs/user-stories/v5.md — Admin Dashboard.
- **Chat Widget:** Find Product / Order Product / Checkout / Support flows from a floating widget. Source: docs/user-stories/v5.md — Chat Widget.
- **Multi-Language:** browser-language auto-detect with English fallback, manual selector (DE/EN/ES/FR/NL/TR — UI code additionally exposes an `el` (Greek) option not listed in v5.md, see ui-reference.md), localStorage persistence. Source: docs/user-stories/v5.md — Multi-Language Support; `sprint5/UI/src/app/header/header.component.html`.
- **Privacy Policy** (`/privacy`): static content page. Source: docs/user-stories/v5.md — Privacy Policy.
