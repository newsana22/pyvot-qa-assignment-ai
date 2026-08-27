# Toolshop Domain Overview (Sprint 5 — Clean Baseline)

> Concise orientation file. Detailed, cited rules live in the four companion documents. Keep this file short — do not duplicate detail here.

## Purpose & Scope

Practice Software Testing ("Toolshop") is a demo e-commerce application (tools/hardware store) used to teach and practice manual and automated testing. This knowledge base documents **only the clean Sprint 5 implementation** — the full-featured, production-representative version of the app — as the expected-behavior oracle for QA scenario generation, test-strategy design, API/UI automation, and code review.

## Clean Sprint 5 Role in This Assessment

Sprint 5 (`sprint5/UI`, `sprint5/API`) is the most feature-complete, non-buggy version of the application in this repository. It is treated as ground truth. A separate, intentionally defective copy (`sprint5-with-bugs/`) exists elsewhere in the repo for bug-hunting exercises and **must never** be used to derive expected behavior — see Exclusion Policy below.

## Technology Stack

Source: [docs/architecture.md](../architecture.md)

| Layer | Technology |
|---|---|
| Frontend | Angular 20, Bootstrap 5 |
| Backend | Laravel 12, PHP 8.3 |
| Database | MariaDB 10.6 (MySQL-compatible) |
| Cache | Redis (via Predis) |
| Auth | JWT, Google OAuth, GitHub OAuth |
| REST API | OpenAPI 3.2.0, documented via `darkaonline/l5-swagger` (generated spec: `sprint5/API/storage/api-docs/api-docs.json`) |
| GraphQL API | Lighthouse (`nuwave/lighthouse`) — exists per `docs/architecture.md`, but is **out of scope** for `api-reference.md` (REST-only per task scope). Used by the Angular comparison page only. |
| Mail | MailHog (local) / SMTP (production) |
| Infra | Docker, Nginx, PHP-FPM |

## High-Level Architecture

- **Frontend**: Angular SPA (`sprint5/UI/src/app`), lazy-loaded feature modules (`products`, `checkout`, `auth`, `account`, `admin`, `contact`, `privacy`), clean URL routing with scroll restoration, Transloco for i18n.
- **API**: Laravel controllers (`sprint5/API/app/Http/Controllers`) backed by service classes (`sprint5/API/app/Services`), Eloquent models with ULID primary keys (`sprint5/API/app/Models`), Form Request validators (`sprint5/API/app/Http/Requests`), custom validation rules (`sprint5/API/app/Rules`), and payment-method value objects (`sprint5/API/app/Payments`).
- Cart state is server-persisted (`carts` / `cart_items` tables), not purely client-side.
- Long-running work (checkout confirmation email, invoice PDF generation, product-inventory updates) is queued (Laravel Jobs).

## Major Functional Modules

Source: [docs/sprints/sprint5.md](../sprints/sprint5.md), [docs/user-stories/v5.md](../user-stories/v5.md)

- Product browsing: overview, category, detail, comparison, rentals
- Shopping cart (server-persisted)
- Checkout wizard: cart review → sign-in/guest → billing address → payment → confirmation
- Authentication: login, registration, forgot password, TOTP (2FA), Google/GitHub social login, account locking
- Customer account: profile, change password, favorites, invoices (+ PDF download), contact messages
- Contact form (guest/known-user, file attachment)
- Admin dashboard: product/category/brand/order/user/message management, reports
- Chat widget (find product, order product, checkout, support)
- Discounts: geo-location based, combined rental+non-rental (15%), eco-friendly (implementation-only, see business-rules.md)
- Multi-language (DE/EN/ES/FR/NL/TR), Privacy Policy page

## Key Business Entities

Source: `sprint5/API/app/Models/*`

- `Product` (price, stock, `is_rental`, `is_location_offer`, `co2_rating`, specs)
- `Category` (hierarchical, `parent_id`), `Brand`
- `Cart` / `CartItem` (server-persisted, `additional_discount_percentage`, per-item `discount_percentage`)
- `User` (role `user`/`admin`, `failed_login_attempts`, `totp_enabled`, `enabled`)
- `Invoice` / `Invoiceline` (subtotal, total, discount fields, status)
- `Payment` + method-specific detail models (`PaymentBankTransferDetails`, `PaymentCreditCardDetails`, `PaymentBnplDetails`, `PaymentGiftCardDetails`, `PaymentCashOnDeliveryDetails`)
- `Favorite`, `ContactRequests` / `ContactRequestReply`, `ProductSpec`, `Download` (PDF generation status)

## Companion Documents

- [business-rules.md](./business-rules.md) — cited, confidence-rated business rules
- [user-flows.md](./user-flows.md) — verified user journeys
- [api-reference.md](./api-reference.md) — REST endpoint reference
- [ui-reference.md](./ui-reference.md) — routes, components, selectors for Playwright locators

## Source Hierarchy & Exclusion Policy

**Authority order**: `docs/user-stories/v5.md` > `docs/sprints/sprint5.md` > `docs/features.md` (Sprint-5 columns only) > `docs/architecture.md` > `sprint5/UI/**` > `sprint5/API/**` (routes, controllers, requests, models, rules, generated OpenAPI spec).

**Hard exclusions** (never read/derived from): `sprint5-with-bugs/**`, `docs/sprints/sprint5-with-bugs.md`, any `testSessions/`/bug-report/defect-seed material, and all non-Sprint-5 sprints (`sprint1-4/**`, `sprint5-performance/**`, `sprint5-holtesting/**`, `docs/user-stories/v1-v4.md`, `docs/sprints/sprint1-4.md`). GraphQL implementation (`app/GraphQL`, `graphql/schema.graphql`, `config/lighthouse.php`) is acknowledged to exist but was not inspected in depth and is excluded from `api-reference.md` by task scope.

If a fact could not be verified against an approved clean source, it is written as **"Not confirmed from clean Sprint 5 source"** rather than guessed. Where clean requirements and clean implementation disagree, both sources are cited and the item is marked **Needs Human Review** in the relevant companion document.
