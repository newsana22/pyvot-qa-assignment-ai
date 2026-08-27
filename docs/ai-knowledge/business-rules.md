# Business Rules (Clean Sprint 5)

Every rule below is derived only from clean Sprint 5 sources. Format per rule: **Rule / Source / Evidence / Confidence**.
Confidence values: `Confirmed` (requirements + implementation agree), `Partially Confirmed` (only one clean source layer available), `Needs Human Review` (clean sources conflict or an implementation rule has no requirements backing).

---

## 1. Product Browse / Search / Filter / Sort

**Rule:** Product overview and category pages return paginated results, 9 products per page.
**Source:** `sprint5/API/app/Services/ProductService.php` — `getAllProducts()` (`$query->filter()->paginate(9)`), `searchProducts()` (`$builder->paginate(9)`).
**Evidence:** `paginate(9)` hardcoded in both methods.
**Confidence:** Confirmed (implementation). docs/user-stories/v5.md AC3 confirms pagination exists but does not state the page size — page size is implementation-only.

**Rule:** Search query must be 3–40 characters (client-side).
**Source:** docs/user-stories/v5.md — Product Overview AC4 ("valid search query (3–40 characters)"); `sprint5/UI/src/app/products/overview/overview.component.ts` — `query` form control `Validators.minLength(3)`, `Validators.maxLength(40)` (also in `category.component.ts`).
**Evidence:** Matching bounds in both requirement and UI validators.
**Confidence:** Confirmed.

**Rule:** Submitting a new search resets all active filters.
**Source:** docs/user-stories/v5.md — Product Overview AC4.
**Evidence:** Acceptance criterion text.
**Confidence:** Partially Confirmed (requirements only; not independently re-verified against `overview.component.ts` filter-reset code in this pass).

**Rule:** Category filter is hierarchical: checking a parent auto-checks all children; unchecking all children unchecks the parent.
**Source:** docs/user-stories/v5.md — Product Overview AC6; `sprint5/UI/src/app/products/category/category.component.ts` — `filterByCategory(event, categoryId, parentId)` (parent/child check-state logic).
**Confidence:** Confirmed.

**Rule:** Category and brand filters combine with AND semantics (both must match).
**Source:** docs/user-stories/v5.md — Product Overview AC8; `sprint5/API/app/Models/Product.php` — `scopeWithFilters()` chains `whereIn('category_id', ...)` and `whereIn('brand_id', ...)` via successive `when()` clauses.
**Confidence:** Confirmed.

**Rule:** Sort options: Name A–Z, Name Z–A, Price High→Low, Price Low→High (UI `sort` values seen: `name,asc` / `name,desc` / `price,desc` / `price,asc`; a CO2-rating sort also exists conditionally).
**Source:** docs/user-stories/v5.md — Product Overview AC9; `sprint5/UI/src/app/products/overview/overview.component.ts` sort `<select>` (`data-test="sort"`) options.
**Confidence:** Confirmed.

**Rule:** Price range slider default range is $1–$100, with an absolute maximum of $200.
**Source:** docs/user-stories/v5.md — Product Overview AC10; `sprint5/UI/src/app/products/overview/overview.component.ts` — slider `floor: 0, ceil: 200`; component defaults `minPrice = 1`, `maxPrice = 100`.
**Evidence:** UI slider ceiling is 200 (not 0–200 exactly matching "$1 to $100 default, max $200" — floor is coded as 0, requirement says default min $1). Minor floor discrepancy (slider floor=0 vs. stated default-min=$1) is a **default value** vs. **absolute floor**, not a contradiction — floor 0 is the absolute minimum, `minPrice=1` is the default handle position.
**Confidence:** Confirmed.

**Rule:** Eco-friendly filter checkbox and CO2-rating badges are shown only when the eco/CO2 feature is enabled (`isEcoBadgeEnabled()` / `isCo2ScaleEnabled()` UI guards).
**Source:** `sprint5/UI/src/app/products/overview/overview.component.ts` / `.html`.
**Evidence:** Conditional rendering guards found by code inspection.
**Confidence:** Partially Confirmed (implementation only — docs/user-stories/v5.md does not describe an enable/disable toggle for this feature; docs/features.md lists "Product Comparison" and CO2/eco-friendly as v5-only features but does not mention a runtime toggle). Needs Human Review if QA needs to know how the toggle is controlled.

**Rule:** Products with no stock show "Out of stock" on the product card; rental products are exempt from stock display logic in this way.
**Source:** docs/user-stories/v5.md — Product Overview AC13, Product Detail AC9; `sprint5/API/app/Models/Product.php` — `getInStockAttribute()` (boolean stock status for non-admins); UI `out-of-stock` `data-test`.
**Confidence:** Confirmed.

**Rule:** `GET /products` and text-search endpoints also accept the HTTP `QUERY` method with an identical JSON-body contract (RFC 10008); `Content-Type: application/json` is mandatory or the server returns 415.
**Source:** docs/http-query-method.md (sprint-5-specific doc); docs/sprints/sprint5.md — "HTTP QUERY Method" section; `sprint5/API/routes/api.php` — `Route::match(['QUERY'], ...)` twins alongside GET routes; middleware alias `query.body`.
**Confidence:** Confirmed.

---

## 2. Pagination

**Rule:** All paginated list endpoints (products, users, invoices, messages) use Laravel's standard paginator response shape (`current_page`, `data`, `from`, `last_page`, `per_page`, `to`, `total`).
**Source:** `sprint5/API/app/Http/Controllers/UserController.php` OpenAPI annotation for `getUsers` (`PaginatedUserResponse` schema); `sprint5/API/app/Services/ProductService.php`, `InvoiceService.php`, `UserService.php` all call `->paginate(...)`.
**Confidence:** Confirmed.

**Rule:** Default users/invoices pagination page size is Laravel's framework default (15) — no explicit override found for `User::paginate()` / `Invoice::paginate()` calls (unlike products' explicit `paginate(9)`).
**Source:** `sprint5/API/app/Services/UserService.php` — `User::where(...)->paginate()`; `sprint5/API/app/Services/InvoiceService.php` — `$query->paginate()`.
**Confidence:** Partially Confirmed — page size itself is a Laravel framework default, not asserted in any clean Sprint 5 doc; treat as **Not confirmed from clean Sprint 5 source** if an exact number is required for a test assertion.

---

## 3. Product-Detail Behavior

**Rule:** Product detail shows image, name, description, price, category badge, brand badge; discount shows original price struck through plus discounted price and percentage badge; related products are listed below.
**Source:** docs/user-stories/v5.md — Product Detail AC1, AC2, AC14.
**Confidence:** Partially Confirmed (requirements-level; related-products backing endpoint `GET /products/{id}/related` verified in `sprint5/API/app/Http/Controllers/ProductController.php` route and `ProductService::getRelatedProducts()`).

**Rule:** Default quantity is 1.
**Source:** docs/user-stories/v5.md — Product Detail AC3; `sprint5/UI/src/app/products/detail/detail.component.ts` (`quantity` initialized to 1).
**Confidence:** Confirmed.

**Rule:** Minus button never decreases quantity below 1; plus button increases by 1.
**Source:** docs/user-stories/v5.md — Product Detail AC5/AC6; `sprint5/UI/src/app/products/detail/detail.component.ts` — `minus()` (only decrements if `> 1`), `plus()`.
**Confidence:** Confirmed.

**Rule — CONFLICT — quantity clamp upper bound:**
- **Requirement text (docs/user-stories/v5.md — Product Detail AC7):** "the value is clamped between 1 and 999,999,999."
- **Clean implementation (`sprint5/UI/src/app/products/detail/detail.component.ts`):** `MAX_QUANTITY = 99`; `plus()` and `validateQuantity()` clamp to `MAX_QUANTITY` (99), triggering a `warnMaxQuantity()` toast when exceeded.
- **Clean implementation (`sprint5/API/app/Http/Controllers/CartController.php` — `addItem()`, `updateQuantity()`):** server-side validation `'quantity' => 'required|integer|min:1|max:99'`.
**Confidence:** **Needs Human Review** — the documented upper bound (999,999,999) does not match either the UI (`MAX_QUANTITY = 99`) or the API validator (`max:99`). Both `sprint5/UI/.../detail.component.ts` and `sprint5/API/.../CartController.php` independently cap at 99, so the *effective* system-wide cap is 99; the requirements document appears stale on this specific number.

**Rule:** Add to Cart shows success message "Product added to shopping cart."
**Source:** docs/user-stories/v5.md — Product Detail AC8.
**Confidence:** Partially Confirmed (requirements text only; exact message string not independently re-verified against a translation file in this pass).

**Rule:** Add to Cart button is disabled and "Out of stock" shown in red when a non-rental product has no stock.
**Source:** docs/user-stories/v5.md — Product Detail AC9; `sprint5/UI/src/app/products/detail/detail.component.ts` — Add-to-Cart disabled condition `!product.in_stock && !product.is_rental`.
**Confidence:** Confirmed.

**Rule:** Rental products show a duration slider (1–10 hours) instead of quantity +/-; total = hourly rate × duration.
**Source:** docs/user-stories/v5.md — Product Detail AC10, Rental Products AC3; `sprint5/UI/src/app/products/detail/detail.component.ts` — rental slider `floor: 1, ceil: 10`.
**Confidence:** Confirmed.

**Rule:** Add to Favorites: success = "Product added to your favorites list."; duplicate = "Product already in your favorites list."; not logged in = "Unauthorized, can not add product to your favorite list."
**Source:** docs/user-stories/v5.md — Product Detail AC11–AC13.
**Confidence:** Partially Confirmed (requirements text; `sprint5/API/app/Http/Requests/Favorite/StoreFavorite.php` confirms `product_id` required + must exist, but the duplicate-detection message and unauthenticated message were not independently located in `FavoriteService.php` in this pass).

---

## 4. Add-to-Cart Behavior

**Rule:** Adding an item requires `product_id` (must exist in `products` table) and `quantity` (integer, 1–99).
**Source:** `sprint5/API/app/Http/Controllers/CartController.php` — `addItem()` validation: `'product_id' => 'required|string|exists:products,id'`, `'quantity' => 'required|integer|min:1|max:99'`.
**Confidence:** Confirmed (implementation).

**Rule:** Adding the same product twice increments the existing cart-item quantity rather than creating a duplicate line (except "Thor Hammer" — see special rule below).
**Source:** `sprint5/API/app/Services/CartService.php` — `addItemToCart()`: `$cart->cartItems()->firstOrCreate(['product_id' => $productId]); $existingItem->increment('quantity', $quantity);`.
**Confidence:** Confirmed (implementation only — not stated in docs/user-stories/v5.md).

**Rule — implementation-only special case:** A product literally named "Thor Hammer" is limited to a single unit in the cart: adding it a second time, or adding it with `quantity > 1`, throws "You can only have one Thor Hammer in the cart." The same limit is enforced on quantity update.
**Source:** `sprint5/API/app/Services/CartService.php` — `addItemToCart()` and `updateCartItemQuantity()`, both checking `$product->name === 'Thor Hammer'`.
**Confidence:** **Needs Human Review** — this rule exists only in clean implementation; it is not mentioned anywhere in docs/user-stories/v5.md or docs/sprints/sprint5.md. Treat as a confirmed-by-code business rule, but flag for human confirmation that it is an intentional product rule (e.g. a demo/easter-egg constraint) rather than incidental test fixture code.

**Rule:** If a cart has geo-coordinates (`lat`/`lng`) set and the added product `is_location_offer`, a location-based discount percentage is computed and stored on the cart item.
**Source:** `sprint5/API/app/Services/CartService.php` — `addItemToCart()` calls `calculateDiscountPercentage($cart->lat, $cart->lng)` when `$cart->lat && $cart->lng && isset($existingItem->product->is_location_offer)`.
**Confidence:** Confirmed — see Geo-Location Discount rule in section 6.

---

## 5. Cart Update / Remove Behavior

**Rule:** Updating quantity via `PUT /carts/{id}/product/quantity` re-validates `product_id` (must exist) and `quantity` (1–99); the UI additionally clamps and shows a toast "You can order at most 99 of this product." if a typed value exceeds the max.
**Source:** `sprint5/API/app/Http/Controllers/CartController.php` — `updateQuantity()`; `sprint5/UI/src/app/checkout/cart/cart.component.ts` — `updateQuantity()` (`MAX_QUANTITY = 99`).
**Confidence:** Confirmed.

**Rule:** Changing a cart item's quantity shows the confirmation message "Product quantity updated."
**Source:** docs/user-stories/v5.md — Checkout Cart Review AC2.
**Confidence:** Partially Confirmed (requirements text only; exact toast wiring not independently re-verified in `cart.component.ts` in this pass).

**Rule:** Deleting a cart item removes it and recalculates cart/discount totals.
**Source:** docs/user-stories/v5.md — Checkout Cart Review AC3; `sprint5/API/app/Services/CartService.php` — `removeProductFromCart()` calls `updateCartDiscounts($cart)` after deletion.
**Confidence:** Confirmed.

**Rule:** An empty cart shows "Your shopping cart is empty."
**Source:** docs/user-stories/v5.md — Checkout Cart Review AC4.
**Confidence:** Partially Confirmed (requirements text only).

**Rule:** "Proceed" is only actionable once the cart has at least one item.
**Source:** docs/user-stories/v5.md — Checkout Cart Review AC5; `sprint5/UI/src/app/checkout/cart/cart.component.ts` — proceed button enabled when `cart.cart_items.length > 0`.
**Confidence:** Confirmed.

---

## 6. Line-Total and Cart-Total Calculations / Discounts

**Rule:** Per-item line total = `quantity × unit price` (or `quantity × discounted unit price` if a per-item discount applies).
**Source:** `sprint5/UI/src/app/checkout/cart/cart.component.ts` — line-price / offer-price bindings; `sprint5/API/app/Services/InvoiceService.php` — `createInvoice()` (`$subTotalPrice += $discountedPrice ? $quantity * $discountedPrice : $quantity * $unitPrice;`).
**Confidence:** Confirmed.

**Rule — Geo-Location Discount:** When a cart has `lat`/`lng` and a product is `is_location_offer`, a discount percentage is applied based on proximity (±2 degrees lat/lng) to a supported city: New York 5%, Mumbai 10%, Tokyo 15%, Amsterdam 20%, London 25%. No match → 0% (no discount).
**Source:** docs/user-stories/v5.md — Geo-Location Discount AC1; `sprint5/API/app/Services/CartService.php` — `calculateDiscountPercentage()` (hardcoded city/lat/lng/percentage table, `abs($lat - $data["lat"]) <= 2 && abs($lng - $data["lng"]) <= 2`).
**Confidence:** Confirmed.

**Rule — Combined (Rental + Non-Rental) Discount:** When a cart contains at least one rental item and at least one non-rental item, an additional 15% discount is applied to the cart subtotal. Removing all items of either type removes the discount.
**Source:** docs/user-stories/v5.md — Checkout Cart Review AC7/AC8, Combination Discount AC1–AC3; `sprint5/API/app/Services/CartService.php` — `updateCartDiscounts()` (`$cart->additional_discount_percentage = $hasProduct && $hasRental ? 15 : null;`).
**Confidence:** Confirmed.

**Rule — Eco-Friendly Discount (implementation-only, not in requirements):** At invoice creation, if more than 50% of the total product quantity in the cart has `co2_rating` A or B, an additional 5% discount is applied to the (already rental/non-rental-discounted) subtotal.
**Source:** `sprint5/API/app/Services/InvoiceService.php` — `createInvoice()`/`createGuestInvoice()`: `if ($totalProductCount > 0 && ($ecoFriendlyCount / $totalProductCount) > 0.5) { $ecoDiscountPercentage = 5; ... }`; UI display confirmed in `sprint5/UI/src/app/checkout/cart/cart.component.ts` (`cart-eco-discount` row, label "Eco-Friendly Discount (5%)") and `sprint5/UI/src/app/account/invoices/details/details.component.ts` (`eco-discount` field).
**Confidence:** **Needs Human Review** — this rule is fully implemented (API calculation + UI display in both cart and invoice detail) but is **not described anywhere** in docs/user-stories/v5.md or docs/sprints/sprint5.md. It is a real, working clean-implementation rule; flag to confirm it is an intended (if undocumented) feature before using it in scenario generation as an "official" requirement.

**Rule — Discount calculation order:** `additional_discount_amount = subtotal × (additional_discount_percentage / 100)`; `eco_discount_amount = (subtotal − additional_discount_amount) × 5%`; `total = subtotal − additional_discount_amount − eco_discount_amount`. Eco-discount is computed on the post-combination-discount amount, i.e. discounts stack sequentially, not simultaneously off the raw subtotal.
**Source:** `sprint5/API/app/Services/InvoiceService.php` — `createInvoice()` arithmetic.
**Confidence:** Confirmed (implementation only; sequencing/order is not described in requirements — Partially Confirmed against requirements, Confirmed against code).

**Rule — Rounding:** Per-item discounted price is rounded to 2 decimal places (`round(price * (1 - discount/100), 2)`). No explicit rounding call was found on `subTotalPrice`/`discountAmount`/`totalPrice` themselves in `InvoiceService.php` (only the per-item discounted price is rounded before summation).
**Source:** `sprint5/API/app/Services/CartService.php` — `getCartById()`; `sprint5/API/app/Services/InvoiceService.php` — `createInvoice()`.
**Confidence:** Confirmed for per-item rounding; **Not confirmed from clean Sprint 5 source** whether subtotal/total are rounded/truncated beyond PHP's native double precision — UI display uses Angular's `number: '1.2-2'` pipe for presentation only, which is a display concern, not a stored-value rounding rule.

**Rule — Currency:** All displayed prices use a literal `$` prefix; no currency-code field or multi-currency logic was found in `Product`, `Invoice`, or `Cart` models.
**Source:** `sprint5/UI/src/app/checkout/cart/cart.component.ts`, `sprint5/UI/src/app/account/invoices/details/details.component.ts` (literal `'$' + ...toFixed(2)` / `$` in templates); no currency field in `sprint5/API/app/Models/Product.php` / `Invoice.php`.
**Confidence:** Confirmed (single implicit currency, USD-style formatting; no explicit currency code confirmed from clean source).

**Rule — Tax:** **Not confirmed from clean Sprint 5 source.** No tax field, tax rate, or tax calculation was found in `Invoice`, `Invoiceline`, `Cart`, `CartItem` models, `InvoiceService.php`, or docs/user-stories/v5.md / docs/sprints/sprint5.md.
**Confidence:** Not confirmed from clean Sprint 5 source.

---

## 7. Authentication / Account Rules

**Rule:** Login requires `email` + `password`; invalid credentials return "Invalid email or password" (message text per requirements) / `{'error': 'Unauthorized'}` per implementation.
**Source:** docs/user-stories/v5.md — User Login AC3; `sprint5/API/app/Services/UserService.php` — `login()` (`return ['error' => 'Unauthorized'];` on failed `app('auth')->attempt($credentials)`).
**Confidence:** **Needs Human Review** — requirement text specifies the exact user-facing string "Invalid email or password", but the located clean implementation returns the string `"Unauthorized"` for the same failure case. Both are clean sources (requirements vs. `UserService.php`) and disagree on the literal error text.

**Rule:** Account locking — after 3 consecutive failed login attempts (for non-admin accounts), further attempts return "Account locked, too many failed attempts. Please contact the administrator." with HTTP 423 (Locked). Successful login resets the counter to 0.
**Source:** docs/user-stories/v5.md — User Login AC4; `sprint5/API/app/Http/Controllers/UserController.php` — `const MAX_LOGIN_ATTEMPTS = 3;` and `match` mapping this error string to `ResponseAlias::HTTP_LOCKED`; `sprint5/API/app/Services/UserService.php` — `incrementLoginAttempts()`, `resetLoginAttempts()`.
**Confidence:** Confirmed.

**Rule:** Admin accounts (`role === 'admin'`) are exempt from the failed-attempt lockout and counter increment entirely.
**Source:** docs/user-stories/v5.md — User Login AC5; `sprint5/API/app/Services/UserService.php` — `login()` checks `$user->role != "admin"` before both the lock check and `incrementLoginAttempts()`.
**Confidence:** Confirmed.

**Rule:** A disabled account (`enabled = false`) fails login with "Account disabled." even with correct credentials, and is checked only *after* successful credential verification.
**Source:** docs/user-stories/v5.md — User Login AC6; `sprint5/API/app/Services/UserService.php` — `if (!$user->enabled) { return ['error' => 'Account disabled']; }` (after `attempt()` succeeds).
**Confidence:** Confirmed (message text differs by one character: requirement "Account disabled." (with period) vs. code string `'Account disabled'` (no period) — treated as a documentation-vs-code formatting nuance rather than a substantive conflict).

**Rule:** If TOTP is enabled on the account, a successful email/password check returns a restricted temporary token and requires a 6-digit TOTP code via a second request (`access_token` + `totp`) before a full token is issued; invalid TOTP returns "Invalid TOTP".
**Source:** docs/user-stories/v5.md — User Login AC7–AC9, Checkout Sign-In AC3; `sprint5/API/app/Services/UserService.php` — `login()` TOTP branch (`claims(['restricted' => true])`), verified via `Google2FA::verifyKey()`.
**Confidence:** Confirmed.

**Rule:** Google social login opens a 500×400px popup; on success the user is logged in and redirected to `/account`.
**Source:** docs/user-stories/v5.md — User Login AC10.
**Confidence:** Partially Confirmed (requirements only — `SocialConnectController.php` OAuth callback flow exists per routes/api.php but the popup dimension and redirect target were not independently re-verified against the Angular social-login trigger code in this pass).

**Rule:** After login, redirect target is role-based: `/account` for `role=user`, `/admin/dashboard` for `role=admin`.
**Source:** docs/user-stories/v5.md — User Login AC2; `sprint5/UI/src/app/header/header.component.html` role-based menu (`role === 'user'` vs `role === 'admin'`) and `AdminAuthGuard.ts` / `UserAuthGuard.ts` (`this.auth.getRole() !== 'admin'|'user'` route guards) confirm role-based access control exists.
**Confidence:** Confirmed for guard behavior; Partially Confirmed for the specific post-login redirect call site (not independently traced to a single line in this pass).

**Rule:** Registration requires first/last name, DOB (`YYYY-MM-DD`, age between 18 and 75 years), address object (street/house_number/city/state/country/postal_code), phone, email (unique, max 256 chars), and a password meeting complexity rules.
**Source:** docs/user-stories/v5.md — User Registration AC1; `sprint5/API/app/Http/Requests/Customer/StoreCustomer.php` — `rules()` (`dob` `before`/`after` Carbon-computed 18/75-year bounds, `email` `unique:users,email` + `max:256`, address sub-fields with `SubscriptSuperscriptRule`).
**Confidence:** Confirmed.

**Rule:** Password policy: minimum 8 characters, mixed case, at least one number, at least one symbol, and checked against known-compromised password lists (`uncompromised()`).
**Source:** docs/user-stories/v5.md — User Registration AC2; `sprint5/API/app/Http/Requests/Customer/StoreCustomer.php` — `Password::min(8)->mixedCase()->numbers()->symbols()->uncompromised()`; same policy reused in `UserController::changePassword()`.
**Confidence:** Confirmed.

**Rule:** Password strength indicator has 5 levels based on how many of the 4 displayed criteria (8+ chars, mixed case, number, symbol) are met, each mapped to a percentage bar: Weak 20% (1), Moderate 40% (2), Strong 60% (3), Very Strong 80% (4), Excellent 100% (all — note the UI implementation scores against **5** discrete regex checks, see Evidence).
**Source:** docs/user-stories/v5.md — User Registration AC4; `sprint5/UI/src/app/auth/register/register.component.ts` — `passwordStrength()` (1 point→Weak/20%, 2→Moderate/40%, 3→Strong/60%, 4→Very Strong/80%, 5→Excellent/100%, 0→Invalid/0%).
**Confidence:** Confirmed — labels/percentages match exactly between requirements and implementation.

**Rule:** Duplicate email registration is rejected with "Email is already in use." (requirement text) — implementation uses Laravel's default unique-validation message keyed off `email.unique` with a custom message "A customer with this email address already exists."
**Source:** docs/user-stories/v5.md — User Registration AC5; `sprint5/API/app/Http/Requests/Customer/StoreCustomer.php` — `messages()` (`'email.unique' => 'A customer with this email address already exists.'`).
**Confidence:** **Needs Human Review** — requirement string and implementation string differ.

**Rule:** Forgot Password always resets the account's password to a fixed literal value (`welcome02`) and emails it; email must be a registered account or an error is shown.
**Source:** docs/user-stories/v5.md — Forgot Password AC3/AC4; `sprint5/API/app/Services/UserService.php` — `resetPassword()` (`$newPassword = 'welcome02';`); `UserController::forgotPassword()` validates `'email' => 'exists:users,email'`.
**Confidence:** Confirmed.

**Rule:** Change Password: requires correct current password; new password must differ from current; new password + confirmation must match; same complexity policy as registration; on success the user is logged out after 5 seconds (client-side behavior).
**Source:** docs/user-stories/v5.md — Change Password AC1–AC6; `sprint5/API/app/Http/Controllers/UserController.php` — `changePassword()` (current-password check via `Hash::check`, same-password rejection, `Password::min(8)->mixedCase()->numbers()->symbols()->uncompromised()` + `confirmed`); `sprint5/UI/src/app/account/profile/profile.component.ts` `PasswordValidators.passwordsMatch()`.
**Confidence:** Confirmed for server-side rules; Partially Confirmed for the 5-second auto-logout timing (UI behavior described in requirements, not independently re-traced to a `setTimeout` call in this pass).

**Rule:** TOTP setup is denied for the two well-known demo/test accounts (`customer@practicesoftwaretesting.com`, `admin@practicesoftwaretesting.com`) with "Access denied: If you want to configure TOTP, please create your own account."
**Source:** docs/user-stories/v5.md — Two-Factor Authentication Setup AC6.
**Confidence:** Partially Confirmed (requirements text only; the specific email-based denial check was not independently located inside `TOTPController.php`/`TOTPService.php` in this pass — the file read did not show this guard explicitly).

---

## 8. Checkout Stages

**Rule:** Checkout is a linear wizard: Cart review → Sign-in/Guest → Billing Address → Payment/Confirmation, implemented as an Angular wizard (`aw-wizard`) with steps gated by validity (e.g., `proceed-1`, `proceed-3` buttons disabled until the current step's form/cart state is valid).
**Source:** docs/user-stories/v5.md — Checkout section headers (Cart Review, Sign In, Billing Address, Payment); `sprint5/UI/src/app/checkout/checkout.component.html` (`aw-wizard` structure); `sprint5/UI/src/app/checkout/address/address.component.html` (`proceed-3` disabled unless `cusAddress.valid`).
**Confidence:** Confirmed.

**Rule:** If already logged in when reaching the sign-in step, the message "You are already signed in as [First Name] [Last Name]" is shown and the user proceeds directly to billing address.
**Source:** docs/user-stories/v5.md — Checkout Sign In AC5; `sprint5/UI/src/app/checkout/login/login.component.ts` (`isLoggedIn` gate hides the form).
**Confidence:** Confirmed for the skip-to-next-step behavior; Partially Confirmed for the exact message string (not independently re-verified against a translation key value in this pass).

**Rule:** Guests can check out without an account by providing email, first name, last name at the login step (`POST /invoices/guest` is the corresponding unauthenticated endpoint).
**Source:** docs/user-stories/v5.md — Chat Widget AC4 (guest details) implies guest support; `sprint5/UI/src/app/checkout/login/login.component.ts` guest form (`email`, `first_name`, `last_name`); `sprint5/API/app/Http/Controllers/InvoiceController.php` — `storeGuest()` validates `guest_email`, `guest_first_name`, `guest_last_name` and is excluded from the `auth:users` middleware.
**Confidence:** Confirmed (implementation); the standard checkout user story (Checkout – Sign In) does not explicitly describe the guest path in the same acceptance-criteria block, so cross-reference is Partially Confirmed against that specific section.

---

## 9. Billing/Address Validation

**Rule:** Required fields: Street (max 70), City (max 40), State (max 40, required only per implementation — see Evidence), Country (max 40), Postal code (max 10).
**Source:** docs/user-stories/v5.md — Checkout Billing Address AC1; `sprint5/API/app/Http/Requests/Invoice/StoreInvoice.php` — `rules()`.
**Evidence:** Implementation marks `billing_street`, `billing_city`, `billing_country` as `required`; `billing_state` and `billing_postal_code` are validated for type/length but **not** flagged `required` in `StoreInvoice.php`, while docs/user-stories/v5.md AC1 lists all five fields as "required."
**Confidence:** **Needs Human Review** — requirements list State and Postal code as required; the `StoreInvoice` rule set does not mark them `required` (only `string`/`max:*`).

**Rule:** Address text fields reject subscript/superscript Unicode characters (custom `SubscriptSuperscriptRule`).
**Source:** `sprint5/API/app/Rules/SubscriptSuperscriptRule.php`; applied to `billing_street`, `billing_city`, `billing_state`, `billing_country`, `billing_postal_code` in `StoreInvoice.php`, and to registration address/name fields in `StoreCustomer.php`.
**Confidence:** Confirmed (implementation only; not mentioned in docs/user-stories/v5.md).

**Rule:** Country/postcode/city/state must be internally consistent — `AddressMatchesCountry` rule looks up the expected locality for the given country+postcode (via the postcode lookup service) and rejects a mismatched city/state or a postcode whose format doesn't fit the country. Lookup-service outages fail open (validation is skipped, not rejected) to avoid blocking checkout.
**Source:** `sprint5/API/app/Rules/AddressMatchesCountry.php`; applied to `billing_country` in `StoreInvoice.php` and `storeGuest()`'s inline validation in `InvoiceController.php`; docs/postcode-lookup.md.
**Confidence:** Confirmed (implementation only; not explicitly described as a business rule in docs/user-stories/v5.md, though it directly supports Billing Address AC1's field list).

**Rule:** Address is pre-filled from the account for logged-in users.
**Source:** docs/user-stories/v5.md — Checkout Billing Address AC4.
**Confidence:** Partially Confirmed (requirements text only; not independently re-traced to a specific pre-fill call in `address.component.ts` in this pass).

**Rule:** Postcode lookup: `GET /postcode-lookup?country=&postcode=&house_number=` returns `{street, city, state, country, postcode}`; fires only once country + postcode + house number are all present, debounced 300ms; used on both Registration and Checkout Address forms; a country/postcode mismatch returns `422`; upstream (`http` driver) failures return `502`.
**Source:** docs/postcode-lookup.md (sprint-5-specific); `sprint5/API/app/Http/Controllers/PostcodeController.php`; `sprint5/UI/src/app/checkout/address/address.component.ts` and `sprint5/UI/src/app/auth/register/register.component.ts` (300ms debounce, triggers on `country`/`postal_code`/`house_number`).
**Confidence:** Confirmed.

---

## 10. Payment-Method-Specific Fields & Rules

All rules below are enforced in **three** layers per docs/gift-card-validation.md's documented pattern (illustrated for gift card, and independently verified to also apply to the other methods): (1) Angular reactive-form validators in `payment.component.ts`, (2) `POST /payment/check` pre-check in `PaymentController.php`, (3) authoritative validation in `StoreInvoice.php` at order-creation time (`POST /invoices`).

| Method | Field | Rule | Source |
|---|---|---|---|
| Bank Transfer | `bank_name` | required, letters + spaces only (`^[a-zA-Z ]+$`) | docs/user-stories/v5.md Payment AC2; `PaymentController::check()`; `payment.component.ts` |
| Bank Transfer | `account_name` | required, alphanumeric + spaces/periods/apostrophes/hyphens (`^[a-zA-Z0-9 .'-]+$`) | same |
| Bank Transfer | `account_number` | required, digits only (`^\d+$`) | same |
| Credit Card | `credit_card_number` | format `XXXX-XXXX-XXXX-XXXX` (`^\d{4}-\d{4}-\d{4}-\d{4}$`) | docs/user-stories/v5.md AC3; `PaymentController::check()`; `payment.component.ts` |
| Credit Card | `expiration_date` | format `MM/YYYY`, must be a future date; error "Expiration date must be in the future." | docs/user-stories/v5.md AC3/AC4; `PaymentController::check()` (`date_format:m/Y|after:today`); `payment.component.ts` custom `expirationDateValidator` |
| Credit Card | `cvv` | 3 or 4 digits (`^\d{3,4}$`) | docs/user-stories/v5.md AC3; `PaymentController::check()` |
| Credit Card | `card_holder_name` | letters + spaces only (`^[a-zA-Z ]+$`) | docs/user-stories/v5.md AC3; `PaymentController::check()` |
| Buy Now Pay Later | `monthly_installments` | required, numeric; UI dropdown limited to 3/6/9/12 | docs/user-stories/v5.md AC5; `PaymentController::check()` (`'required|numeric'`); `payment.component.ts` dropdown options |
| Gift Card | `gift_card_number` | required, exactly 16 alphanumeric chars (`^[A-Za-z0-9]{16}$`) | docs/gift-card-validation.md; `App\Payments\GiftCard::NUMBER_REGEX`; enforced in `PaymentController::check()` **and** `StoreInvoice::withValidator()` |
| Gift Card | `validation_code` | required, exactly 4 alphanumeric chars (`^[A-Za-z0-9]{4}$`) | docs/gift-card-validation.md; `App\Payments\GiftCard::CODE_REGEX`; same dual enforcement |
| Cash on Delivery | — | no additional fields | docs/user-stories/v5.md AC7; `PaymentController::check()` has an empty `if` branch for this method (no validation rules added) |

**Confidence (all rows):** Confirmed — cross-validated between requirements, `payment.component.ts`, and `PaymentController.php`/`StoreInvoice.php`.

**Rule:** Switching payment method resets the form and shows the new method's fields only.
**Source:** docs/user-stories/v5.md — Payment AC8; `sprint5/UI/src/app/checkout/payment/payment.component.ts` (`@if` conditional blocks keyed on `selectedPaymentMethod`/`payment_method` value).
**Confidence:** Confirmed.

**Rule:** Gift card format validation is the **authoritative security boundary** at order time: if `payment_method = gift-card` and the number/code are malformed, `POST /invoices` returns 422 and **no invoice or payment row is created** (the pre-check at `POST /payment/check` can be bypassed by calling `/invoices` directly, but `StoreInvoice::withValidator()` re-validates).
**Source:** docs/gift-card-validation.md; `sprint5/API/app/Http/Requests/Invoice/StoreInvoice.php` — `withValidator()` (`$validator->sometimes('payment_details.gift_card_number', GiftCard::numberRules(), $isGiftCard);`).
**Confidence:** Confirmed.

---

## 11. Purchase Completion

**Rule:** On valid payment + address + cart, `POST /invoices` (authenticated) or `POST /invoices/guest` (guest) creates the invoice, records the payment (method-specific detail row), dispatches inventory updates per cart line, queues a checkout confirmation email (`SendCheckoutEmail` job), and returns the created invoice (HTTP 201) including its generated `invoice_number`.
**Source:** docs/user-stories/v5.md — Payment AC9; `sprint5/API/app/Http/Controllers/InvoiceController.php` — `store()`/`storeGuest()` (`SendCheckoutEmail::dispatch(...)`); `sprint5/API/app/Services/InvoiceService.php` — `createInvoice()` (`UpdateProductInventory::dispatch(...)` per line).
**Confidence:** Confirmed.

**Rule:** Invoice numbers are generated with the pattern `INV-{year}` + a zero-padded sequence to a total length of 14 characters.
**Source:** `sprint5/API/app/Services/InvoiceService.php` — `createInvoice()` (`'prefix' => 'INV-' . now()->year, 'length' => 14`), delegated to `InvoiceNumberGenerator`.
**Confidence:** Confirmed (implementation only; format not explicitly specified in docs/user-stories/v5.md beyond "invoice number is shown").

**Rule:** After successful order placement, the cart is cleared and a confirmation with the invoice number is displayed.
**Source:** docs/user-stories/v5.md — Payment AC9; `sprint5/UI/src/app/checkout/payment/payment.component.ts` — `paid = true`, `invoice_number` interpolated into confirmation message.
**Confidence:** Confirmed for UI confirmation display; Partially Confirmed for "cart is cleared" (no explicit `deleteCart()` call site was independently traced from the payment component in this pass — `DELETE /carts/{cartId}` exists as an endpoint per routes/api.php, but its call from the checkout-completion flow was not directly verified).

---

## 12. Invoice Generation / Details / Download

**Rule:** Invoice list columns: invoice number, billing street, invoice date, total, details link; paginated.
**Source:** docs/user-stories/v5.md — Invoices AC1; `sprint5/UI/src/app/account/invoices/invoices.component.html`.
**Confidence:** Confirmed.

**Rule:** Invoice detail shows invoice number/date/total, full billing address, payment method + details, and line items (quantity, name, price, line total); discounted line items show original price struck through with discounted price below; overall discount shows subtotal, discount %, discount amount, and final total.
**Source:** docs/user-stories/v5.md — Invoices AC2, AC4, AC5; `sprint5/UI/src/app/account/invoices/details/details.component.ts`/`.html`; `sprint5/API/app/Services/InvoiceService.php` — `getInvoice()` eager-loads `invoicelines.product`, `payment.payment_details`.
**Confidence:** Confirmed. (Note: the UI also renders an `eco-discount` row not present in the v5.md acceptance criteria — see section 6 eco-discount rule.)

**Rule:** Non-existent invoice, or one that does not belong to the requesting user, is not returned (`findOrFail` scoped `forUser(Auth::id())` for non-admins).
**Source:** docs/user-stories/v5.md — Invoices AC3; `sprint5/API/app/Services/InvoiceService.php` — `getInvoice()` (`if (!$isAdmin) { $query->forUser(Auth::user()->id); }`).
**Confidence:** Confirmed.

**Rule:** PDF download button is disabled while the PDF is generating; the UI polls `GET /invoices/{id}/download-pdf-status` every 20 seconds until `status === 'COMPLETED'`, then enables `GET /invoices/{id}/download-pdf`.
**Source:** docs/user-stories/v5.md — Invoices AC7/AC8; `sprint5/UI/src/app/account/invoices/details/details.component.ts` — `interval(20000)` + `takeWhile(status !== 'COMPLETED', true)`; `sprint5/API/app/Http/Controllers/InvoiceController.php` — `downloadPDFStatus()`; `sprint5/API/app/Services/InvoiceService.php` — `getPDFStatus()` reads the `Download` model, defaulting to `NOT_INITIATED`.
**Confidence:** Confirmed.

**Rule:** `downloadPDF` returns the file if the on-disk PDF (`storage/invoices/{invoiceNumber}.pdf`) exists, otherwise 404 with "Document not created. Try again later."
**Source:** `sprint5/API/app/Http/Controllers/InvoiceController.php` — `downloadPDF()`; `sprint5/API/app/Services/InvoiceService.php` — `downloadPDF()` (`Storage::exists($filePath)`).
**Confidence:** Confirmed (implementation only).

---

## 13. Messages / Contact Form

**Rule — CONFLICT — message minimum length:**
- **Requirement (docs/user-stories/v5.md — Contact Form AC3):** "message field is shown (required, minimum 50 characters)."
- **Clean implementation (`sprint5/API/app/Http/Requests/Contact/StoreContact.php`):** `'message' => ['required', 'string', 'max:250', new SubscriptSuperscriptRule()]` — **no minimum-length rule present.**
**Confidence:** **Needs Human Review** — the 50-character minimum described in requirements has no corresponding server-side rule in the clean `StoreContact` request. (A client-side-only minimum may exist in the Angular contact form, but this was not independently verified in this pass; if present, it would still leave the server-side contract unenforced for direct API testing.)

**Rule:** Contact `subject` is required, max 120 characters; optional `.txt` file attachment is validated separately (see docs/user-stories/v5.md AC4–AC6 for exact error text: "File should have a txt extension." / "File should be empty." for non-zero-byte files) via `ContactController::attachFile()`.
**Source:** docs/user-stories/v5.md — Contact Form AC3, AC4–AC6; `sprint5/API/app/Http/Requests/Contact/StoreContact.php`.
**Confidence:** Confirmed for `subject`/`message` field rules (aside from the min-length conflict above); Partially Confirmed for the exact file-validation error strings (not independently traced into `ContactService::attachFile()` in this pass).

**Rule:** Message status values: `NEW`, `IN_PROGRESS`, `RESOLVED` (per requirements) — implementation's `updateStatus()` validator additionally allows `ON_HOLD` per its inline comment/enum list (`'status' => 'required|in:NEW,IN_PROGRESS,RESOLVED'` in the validator, but the endpoint's own OpenAPI doc-comment enum lists `{"NEW", "ON_HOLD", "IN_PROGRESS", "RESOLVED"}`).
**Source:** docs/user-stories/v5.md — Messages AC1; `sprint5/API/app/Http/Controllers/ContactController.php` — `updateStatus()` validation rule vs. its own `@OA` doc-comment enum.
**Confidence:** **Needs Human Review** — the enforced validator (`in:NEW,IN_PROGRESS,RESOLVED`) and the endpoint's own documented enum (adds `ON_HOLD`) disagree within the same clean source file.

---

## 14. Validation Boundaries Summary (quick reference)

| Field | Bound | Source |
|---|---|---|
| Product search query | 3–40 chars | docs/user-stories/v5.md AC4; UI validators |
| Cart item quantity (API) | 1–99 (integer) | `CartController.php` |
| Product-detail quantity (UI) | 1–99 (`MAX_QUANTITY`) — conflicts with v5.md's stated 1–999,999,999 | see section 3 conflict |
| Billing street | max 70 | `StoreInvoice.php`; v5.md |
| Billing city / state / country | max 40 | `StoreInvoice.php`; v5.md |
| Billing postal code | max 10 | `StoreInvoice.php`; v5.md |
| Gift card number | exactly 16 alphanumeric | `GiftCard.php` |
| Gift card validation code | exactly 4 alphanumeric | `GiftCard.php` |
| Credit card CVV | 3–4 digits | `PaymentController.php` |
| Registration DOB | age 18–75 | `StoreCustomer.php` |
| Registration email | max 256 chars, unique | `StoreCustomer.php`; v5.md |
| Password | min 8 chars, mixed case, number, symbol, not compromised | `StoreCustomer.php`; `UserController::changePassword()` |
| Contact subject | max 120 | `StoreContact.php` |
| Contact message | max 250 (no confirmed min — see conflict) | `StoreContact.php` |
| Invoice status_message | 5–50 chars | `InvoiceController::updateStatus()` |
