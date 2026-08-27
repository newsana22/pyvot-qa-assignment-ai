# UI Reference (Clean Sprint 5)

Only selectors, labels, and routes that genuinely exist in `sprint5/UI/src/app/**` are listed. Locator guidance priority: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` (stable) > explicit `data-test` id > CSS (last resort). Most interactive elements in this app expose a `data-test` attribute, which is the most reliable stable selector observed — prefer `page.getByTestId('...')` (mapped from `data-test`) or role-based locators built from the labels listed below over raw CSS.

---

## Routes

| Path | Module/Component | Source |
|---|---|---|
| `/` | `ProductsModule` → `ProductOverviewComponent` | `app-routing.module.ts`, `products/products-routing.module.ts` |
| `/product/:id` | `ProductDetailComponent` | `products/products-routing.module.ts` |
| `/category/:name` | `ProductCategoryComponent` | `products/products-routing.module.ts` |
| `/rentals` | `RentalOverviewComponent` | `products/products-routing.module.ts` |
| `/comparison` | `ComparisonComponent` | `products/products-routing.module.ts` |
| `/privacy` | `PrivacyModule` | `app-routing.module.ts` |
| `/checkout` | `CheckoutModule` → `CheckoutComponent` (single route, multi-step wizard) | `app-routing.module.ts`, `checkout/checkout-routing.module.ts` |
| `/contact` | `ContactModule` | `app-routing.module.ts` |
| `/auth` (`/auth/login`, `/auth/register`, `/auth/forgot-password`) | `AuthModule` | `app-routing.module.ts` |
| `/account` (`/account/overview`, `/profile`, `/favorites`, `/invoices`, `/messages`) | `AccountModule` (guarded by `UserAuthGuard`) | `app-routing.module.ts`, `account/account.module.ts` |
| `/admin/...` | `AdminModule` (guarded by `AdminAuthGuard`) | `app-routing.module.ts` |

---

## Product Overview / Category (`products/overview`, `products/category`)

| Element | Selector | Notes |
|---|---|---|
| Sort dropdown | `data-test="sort"` | Options: `""`, `"name,asc"`, `"name,desc"`, `"price,desc"`, `"price,asc"`, (`co2_rating,asc/desc` conditional) |
| Search input | `formControlName="query"`, `id="search-query"`, `data-test="search-query"` | Validators: required, minLength 3, maxLength 40 |
| Search reset button | `data-test="search-reset"` | Label "X" |
| Search submit button | `data-test="search-submit"` | |
| Category checkbox | `attr.data-test="category-{{category.id}}"`, `name="category_id"` | Parent/child auto-check logic |
| Brand checkbox | `attr.data-test="brand-{{brand.id}}"`, `name="brand_id"` | |
| Eco-friendly filter | `data-test="eco-friendly-filter"`, `name="eco_friendly"` | Only rendered if `isCo2ScaleEnabled()` |
| Product card link | `attr.data-test="product-{{item.id}}"`, `routerLink="/product/{{item.id}}"` | |
| Compare toggle (on card) | `data-test="compare-btn"` | |
| Eco badge | `data-test="eco-badge"` | Shown if `item.is_eco_friendly` |
| CO2 rating badge | `data-test="co2-rating-badge"` | |
| Out-of-stock label | `data-test="out-of-stock"` | |
| Price / discount price | `data-test="product-price"` / `data-test="discount-price"` | |
| Filter/search/sort state flag | `attr.data-test="{{resultState}}"` | Values: `filter_started/completed`, `search_started/completed`, `sorting_started/completed` — useful wait-condition selector |
| Category page title | `data-test="page-title"` | |
| Category empty state | `data-test="category-empty"` | |
| Price range slider | `ngx-slider` component, `(userChangeEnd)="changePriceRange()"` | No `data-test`; slider bounds `floor:0, ceil:200`, defaults `minPrice=1, maxPrice=100` |
| Pagination | `<app-pagination>` — see Shared section | |

**Source:** `sprint5/UI/src/app/products/overview/overview.component.html`/`.ts`; `sprint5/UI/src/app/products/category/category.component.html`/`.ts`.

---

## Product Detail (`products/detail`)

| Element | Selector | Notes |
|---|---|---|
| Quantity input | `id="quantity-input"`, `data-test="quantity"`, `min="1"`, `[max]="MAX_QUANTITY"` | `MAX_QUANTITY = 99` (see business-rules.md conflict note) |
| Decrease quantity | `id="btn-decrease-quantity"`, `data-test="decrease-quantity"` | |
| Increase quantity | `id="btn-increase-quantity"`, `data-test="increase-quantity"` | |
| Add to Cart button | `id="btn-add-to-cart"`, `data-test="add-to-cart"` | Disabled when `!product.in_stock && !product.is_rental` |
| Add to Favorites button | `id="btn-add-to-favorites"`, `data-test="add-to-favorites"` | |
| Add to Compare button | `data-test="add-to-compare"` | |
| Specs table | `data-test="product-specs"`; rows `data-test="spec-row"`; cells `data-test="spec-name"` / `data-test="spec-value"` / `data-test="spec-unit"` | Row also carries `attr.data-test-spec="{{spec_name-slug}}"` |
| Unit price / offer price | `data-test="unit-price"` / `data-test="offer-price"` | |
| Out-of-stock badge | `data-test="out-of-stock"` | |
| Rental duration slider | `ngx-slider`, `floor:1, ceil:10`, label `<span id="duration">` | Replaces +/- buttons for rentals |

**Source:** `sprint5/UI/src/app/products/detail/detail.component.html`/`.ts`.

---

## Product Comparison (`products/comparison`)

| Element | Selector |
|---|---|
| Title | `data-test="comparison-title"` |
| Show-differences toggle | `data-test="show-differences"` |
| Clear all button | `data-test="clear-comparison"` |
| Empty state | `data-test="comparison-empty"` (contains `routerLink="/"`) |
| Table | `data-test="comparison-table"` |
| Remove product (per column) | `data-test="remove-product"` |
| Product name link | `data-test="product-name"` |
| Row: price / brand / category / stock / co2 / eco / spec / description | `data-test="compare-price"`, `compare-brand`, `compare-category`, `compare-stock`, `compare-co2`, `compare-eco`, `compare-spec`, `compare-description` |

**Source:** `sprint5/UI/src/app/products/comparison/comparison.component.html`/`.ts`.

---

## Rentals Overview (`products/rentals/overview`)

| Element | Selector |
|---|---|
| Page title | `data-test="page-title"` |
| Product card | `attr.data-test="product-{{result.id}}"`, `routerLink="/product/{{result.id}}"` |

**Source:** `sprint5/UI/src/app/products/rentals/overview/overview.component.html`.

---

## Checkout — Cart Step (`checkout/cart`)

| Element | Selector | Notes |
|---|---|---|
| Quantity input | `id="quantity-{{item.id}}"`, `data-test="product-quantity"`, `min="1"`, `[max]="MAX_QUANTITY"` (99) | `(change)="updateQuantity($event, item)"` |
| Product price / offer price / line price | `data-test="product-price"` / `data-test="offer-price"` / `data-test="line-price"` | |
| Cart subtotal / discount / eco-discount / total | `data-test="cart-subtotal"` / `data-test="cart-discount"` / `data-test="cart-eco-discount"` / `data-test="cart-total"` | Eco-discount row not in v5.md — see business-rules.md |
| Delete line button | `<a class="btn btn-danger">`, `(click)="delete(item.product_id)"` | No `data-test` found |
| Proceed button | `data-test="proceed-1"` | Enabled once `cart.cart_items.length > 0` |
| Continue Shopping | `data-test="continue-shopping"` | |

**Source:** `sprint5/UI/src/app/checkout/cart/cart.component.html`/`.ts`.

---

## Checkout — Login/Guest Step (`checkout/login`)

| Element | Selector | Notes |
|---|---|---|
| Email (sign-in) | `data-test="email"`, `formControlName="email"` | required, email format |
| Password (sign-in) | `data-test="password"`, `formControlName="password"` | required, minLength 6, maxLength 40 |
| TOTP code | `data-test="totp-code"` | Shown only if `showTotpInput` |
| Email error / password error | `id="email-error"`/`data-test="email-error"`, `id="password-error"`/`data-test="password-error"` | |
| Login error | `data-test="login-error"`, `aria-live="assertive"` | |
| Login submit | `data-test="login-submit"` | |
| Verify TOTP submit | `data-test="verify-totp"` | |
| Register link | `data-test="register-link"`, `routerLink="/auth/register"` | |
| Forgot password link | `data-test="forgot-password-link"`, `routerLink="/auth/forgot-password"` | |
| Guest email/first/last name | `data-test="guest-email"` / `data-test="guest-first-name"` / `data-test="guest-last-name"` | minLength 2 on names |

**Source:** `sprint5/UI/src/app/checkout/login/login.component.html`/`.ts`.

---

## Checkout — Address Step (`checkout/address`)

| Element | Selector | Notes |
|---|---|---|
| Country | `data-test="country"` (`<select>`) | required, maxLength 40 |
| Postal code | `data-test="postal_code"` | required, maxLength 10; triggers postcode lookup |
| House number | `data-test="house_number"` | required, maxLength 10; triggers postcode lookup |
| Street | `data-test="street"` | required, maxLength 70; auto-filled |
| City | `data-test="city"` | required, maxLength 40; auto-filled |
| State | `data-test="state"` | required, maxLength 40; auto-filled |
| Postcode lookup loading/error/hint | `data-test="postcode-lookup-loading"` / `data-test="postcode-lookup-error"` / `data-test="postcode-lookup-hint"` | |
| Proceed button | `data-test="proceed-3"` | `[disabled]="!cusAddress.valid"` |

**Source:** `sprint5/UI/src/app/checkout/address/address.component.html`/`.ts`.

---

## Checkout — Payment Step (`checkout/payment`)

| Element | Selector | Notes |
|---|---|---|
| Payment method select | `data-test="payment-method"` | Options: (empty), `bank-transfer`, `cash-on-delivery`, `credit-card`, `buy-now-pay-later`, `gift-card` |
| Bank: bank_name / account_name / account_number | `data-test="bank_name"` / `data-test="account_name"` / `data-test="account_number"` | Pattern-validated (see business-rules.md §10) |
| Credit card: number / expiration / cvv / holder name | `data-test="credit_card_number"` / `data-test="expiration_date"` / `data-test="cvv"` / `data-test="card_holder_name"` | |
| Gift card: number / validation code | `data-test="gift_card_number"` (maxlength 16) / `data-test="validation_code"` (maxlength 4) | |
| BNPL: monthly installments | `data-test="monthly_installments"` | Dropdown values `3`, `6`, `9`, `12` |
| Payment error / success message | `data-test="payment-error-message"` / `data-test="payment-success-message"` | |
| Finish button | `data-test="finish"` | `[disabled]="!cusPayment.valid"` |
| Order confirmation | `id="order-confirmation"` | Shown when `paid === true`; interpolates `invoice_number` |

**Source:** `sprint5/UI/src/app/checkout/payment/payment.component.html`/`.ts`.

---

## Auth — Login (`auth/login`)

| Element | Selector | Notes |
|---|---|---|
| Email | `formControlName="email"`, `data-test` per `fields.email` pattern | required, email |
| Password | `<app-password-input>`, `formControlName="password"` | required, minLength 3, maxLength 40 |
| Sign in with Google button | class `google-sign-in-button`, `aria-label="Sign in with Google"` | Production-only (`@if (environment.production)`) |
| TOTP code | `id="totp"`, `data-test="totp-code"`, `formControlName="totp"` | Shown when `showTotpInput` |
| Login error | `data-test="login-error"` | |
| Register link | `data-test="register-link"`, `routerLink="/auth/register"` | |
| Forgot password link | `data-test="forgot-password-link"`, class `ForgetPwd` | |

**Source:** `sprint5/UI/src/app/auth/login/login.component.html`/`.ts`.

---

## Auth — Register (`auth/register`)

| Element | Selector | Notes |
|---|---|---|
| First name / last name | `data-test="first-name"` / `data-test="last-name"` | required |
| DOB | `data-test="dob"`, placeholder `YYYY-MM-DD` | required, custom ISO-date validator |
| Country | `data-test="country"` (`<select>`, options from `assets/countries.json`) | required |
| Postal code / house number | `data-test="postal_code"` / `data-test="house_number"` | required; drive postcode lookup (300ms debounce) |
| Street / city / state | `data-test="street"` / `data-test="city"` / (state control exists in form, `data-test` not confirmed in HTML excerpt read) | required; auto-filled |
| Phone | `formControlName="phone"` | required, pattern `^[0-9]\d*$` |
| Email | `formControlName="email"` | required, pattern `^(?=.{1,256}$)[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{1,255}$` |
| Password | `<app-password-input>` | required + complexity validators |
| Postcode lookup hint/loading | `data-test="postcode-lookup-hint"` / `data-test="postcode-lookup-loading"` | |

**Source:** `sprint5/UI/src/app/auth/register/register.component.html`/`.ts`.

---

## Auth — Forgot Password (`auth/forgot-password`)

| Element | Selector |
|---|---|
| Email | `data-test="email"` |
| Submit | `data-test="forgot-password-submit"` |

**Source:** `sprint5/UI/src/app/auth/forgot-password/forgot-password.component.html`/`.ts`.

---

## Account — Profile (`account/profile`)

| Element | Selector | Notes |
|---|---|---|
| First name / last name | `data-test="first-name"` / `data-test="last-name"` | editable, required |
| Email | `data-test="email"` | **readonly** attribute present |
| Phone | `data-test="phone"` | pattern `/^\+?[0-9\s().-]{7,24}$/` |
| Address street/postal_code/city/state/country | `data-test="street"` / `data-test="postal_code"` / `data-test="city"` / `data-test="state"` / `data-test="country"` | all editable, required |
| Update profile submit | `data-test="update-profile-submit"` | |
| Current password | `data-test="current-password"` | required |
| New password / confirm | `data-test="new-password"` / `data-test="new-password-confirm"` (both `<app-password-input>`) | complexity + match validators |
| Change password submit | `data-test="change-password-submit"` | On success: auto-logout after 5s |

**Source:** `sprint5/UI/src/app/account/profile/profile.component.html`/`.ts`.

---

## Account — Invoices List & Detail

| Element | Selector | Notes |
|---|---|---|
| Invoices table | (no table-level `data-test` confirmed) columns: invoice_number, billing_street, invoice_date, total, details link | `sprint5/UI/src/app/account/invoices/invoices.component.html` |
| Invoice number / date / total | `data-test="invoice-number"` / `data-test="invoice-date"` / `data-test="total"` | detail page |
| Eco discount | `data-test="eco-discount"`, class `text-success` | |
| Billing street/postal_code/city/state/country | `data-test="street"` / `data-test="postal_code"` / `data-test="city"` / `data-test="state"` / `data-test="country"` | |
| Payment method | `data-test="payment-method"` | |
| Download PDF button | `data-test="download-invoice"` | `[disabled]="!isDownloadReady"`; polling every 20000ms |

**Source:** `sprint5/UI/src/app/account/invoices/invoices.component.html`; `sprint5/UI/src/app/account/invoices/details/details.component.html`/`.ts`.

---

## Account — Favorites, Messages, Overview

| Element | Selector | Notes |
|---|---|---|
| Favorite card | `data-test="favorite-{{favorite.id}}"`; name `data-test="product-name"`; description `data-test="product-description"` (truncated 250 chars); delete `data-test="delete"` | `account/favorites/favorites.component.html` |
| Messages: reply textarea / submit | `data-test="message"` / `data-test="reply-submit"` | `account/messages/message-detail/message-detail.component.html` |
| Message detail back link | `data-test="back"` | |
| Overview nav buttons | `data-test="nav-favorites"` / `data-test="nav-profile"` / `data-test="nav-invoices"` / `data-test="nav-messages"` | `account/overview/overview.component.html` |

---

## Header / Navigation

| Element | Selector | Notes |
|---|---|---|
| Home link | `data-test="nav-home"` | |
| Categories dropdown | `data-test="nav-categories"`; sub-items `nav-hand-tools`, `nav-power-tools`, `nav-other`, `nav-special-tools`, `nav-rentals` | |
| Contact link | `data-test="nav-contact"` | |
| Sign In link (logged out) | `data-test="nav-sign-in"`, `routerLink="/auth/login"` | |
| User menu (logged in, role=user) | `data-test="nav-menu"`; sub-items `nav-my-account`, `nav-my-favorites`, `nav-my-profile`, `nav-my-invoices`, `nav-my-messages`, `nav-sign-out` | |
| Admin menu (role=admin) | `data-test="nav-menu"`; sub-items `nav-admin-dashboard`, `nav-admin-brands`, `nav-admin-categories`, `nav-admin-products`, `nav-admin-orders`, `nav-admin-users`, `nav-admin-messages`, `nav-admin-statistics`, `nav-average-month-sales`, `nav-average-week-sales`, `nav-sign-out` | |
| Cart icon/badge | `data-test="nav-cart"` (link, `routerLink="/checkout"`, `aria-label="cart"`); badge `data-test="cart-quantity"`, `id="lblCartCount"` | Only rendered when `items !== 0` |
| Language selector | button `id="language"`, `data-test="language-select"`, `aria-label="Select language"` | Options seen in code: `lang-de`, `lang-el`, `lang-en`, `lang-es`, `lang-fr`, `lang-nl`, `lang-tr` — **note:** UI code includes `el` (Greek), which is not listed among the six languages (DE/EN/ES/FR/NL/TR) named in docs/user-stories/v5.md Multi-Language AC3 — flag as Needs Human Review in business context if exact language set matters for a test. |

**Source:** `sprint5/UI/src/app/header/header.component.html`/`.ts`.

---

## Footer

Plain content only — no interactive `data-test` targets found besides a `routerLink="privacy"` link and an external GitHub repo link.
**Source:** `sprint5/UI/src/app/footer/footer.component.html`.

---

## Shared / Reusable Components

| Component | Selector/Inputs | Notes |
|---|---|---|
| `<app-pagination>` | `[currentPage]`, `[lastPage]`, `(pageChange)`; buttons `data-test="pagination-prev"` / `data-test="pagination-next"` | Used on product overview/category, invoices, messages lists |
| `<app-password-input>` | `[id]`, `[placeholder]`, `[isInvalid]`, `[ariaDescribedBy]`, `[ariaInvalid]`; renders `[attr.data-test]="id"`; toggle button switches type `password`/`text` | Implements `ControlValueAccessor`; used in login, register, change-password |

**Source:** `sprint5/UI/src/app/pagination/pagination.component.html`/`.ts`; `sprint5/UI/src/app/shared/password-input/password-input.component.html`/`.ts`.

---

## Not Inspected in This Pass (exists per requirements/routes but selectors not verified)

- Admin module component internals (`admin/**`)
- Chat widget component internals (`chat-widget/**`)
- Live activity widget (`live-activity-widget/**`)
- Contact form component internals (`contact/**`) — only the API-side `StoreContact` rules were verified
- Social login trigger button on the checkout login step (only the standalone `/auth/login` Google button was verified)

These should not be assumed to have any specific selector until independently confirmed against their source files.
