# Authentication & Accounts — Test Scenarios

> Baseline: Clean Sprint 5 (`sprint5/UI`, `sprint5/API`) only. Derived from `docs/ai-knowledge/toolshop-domain.md`, `business-rules.md` §7, `user-flows.md` §8–15, `api-reference.md` (Users/Authentication, TOTP, Favorites), `ui-reference.md`. `sprint5-with-bugs/**` was not consulted.

## Scope

Login (standard, TOTP, lockout, disabled account), Registration, Forgot Password, Change Password, Profile update, Two-Factor Authentication setup, Favorites, and related authorization boundaries.

## Scenarios

#### AUTH-001 — Successful Login with Valid Credentials (Standard User)
- **Feature / Module:** Authentication & Accounts — Login
- **Objective:** Verify a registered, enabled, non-locked, non-TOTP user can log in with correct credentials.
- **Preconditions:** Registered account, `role=user`, `enabled=true`, `failed_login_attempts < 3`, TOTP not enabled.
- **Test Data / Inputs:** Valid `email` + matching `password`.
- **Test Steps:** 1) Navigate to `/auth/login`. 2) Enter valid email/password. 3) Submit.
- **Expected Result:** `POST /users/login` returns 200 with JWT; user redirected to `/account`; header nav switches to logged-in user menu (`nav-menu`).
- **Business Rule / Requirement Reference:** business-rules.md §7; user-flows.md §8.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), UI/E2E (smoke)
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-002 — Successful Login Redirects Admin to Admin Dashboard
- **Feature / Module:** Authentication & Accounts — Login
- **Objective:** Verify role-based post-login redirect for an admin account.
- **Preconditions:** Registered account with `role=admin`, `enabled=true`.
- **Test Data / Inputs:** Valid admin email + password.
- **Test Steps:** 1) Navigate to `/auth/login`. 2) Enter admin credentials. 3) Submit.
- **Expected Result:** Redirect to `/admin/dashboard`; admin nav menu items shown (`nav-admin-dashboard`, etc.).
- **Business Rule / Requirement Reference:** business-rules.md §7 (redirect-target rule sourced from docs/user-stories/v5.md AC2; role-based access confirmed via `AdminAuthGuard`/`UserAuthGuard`).
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** Redirect target is documented in requirements and corroborated by role-guard implementation; the exact code call site for the redirect action was not traced to a single line in this knowledge-base pass.

#### AUTH-003 — Login Rejected with Incorrect Password
- **Feature / Module:** Authentication & Accounts — Login
- **Objective:** Verify login fails for a valid email with an incorrect password.
- **Preconditions:** Registered account exists.
- **Test Data / Inputs:** Valid email, wrong password.
- **Test Steps:** 1) Submit login with valid email and incorrect password.
- **Expected Result:** `Needs Human Review` — clean sources conflict on the exact error text: docs/user-stories/v5.md specifies "Invalid email or password" while `sprint5/API/app/Services/UserService.php` returns `{'error': 'Unauthorized'}` (HTTP 401) for the same failure.
- **Business Rule / Requirement Reference:** business-rules.md §7 (login error message rule).
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), UI
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** Confirm the current literal error string with the team before automating an exact-text assertion; the 401 status code itself is not in dispute.

#### AUTH-004 — Login Rejected for Non-Existent Email
- **Feature / Module:** Authentication & Accounts — Login
- **Objective:** Verify login fails for an email not present in the system.
- **Preconditions:** None.
- **Test Data / Inputs:** Non-registered email + any password.
- **Test Steps:** 1) Submit login with unregistered email.
- **Expected Result:** 401 `{'error': 'Unauthorized'}`.
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-005 — Account Locked After 3 Consecutive Failed Attempts (Non-Admin)
- **Feature / Module:** Authentication & Accounts — Login / Account Locking
- **Objective:** Verify a non-admin account locks after 3 consecutive failed login attempts.
- **Preconditions:** Registered `role=user` account; `failed_login_attempts = 0`.
- **Test Data / Inputs:** Valid email + wrong password (×3), then a 4th attempt (any credentials).
- **Test Steps:** 1) Attempt login with wrong password 3 times. 2) Attempt a 4th login (even with correct credentials).
- **Expected Result:** After the 3rd failure, counter reaches 3; the 4th attempt returns HTTP 423 with "Account locked, too many failed attempts. Please contact the administrator." and is not processed further.
- **Business Rule / Requirement Reference:** business-rules.md §7; user-flows.md §8b.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** API (primary), UI
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-006 — Admin Account Exempt from Lockout
- **Feature / Module:** Authentication & Accounts — Login / Account Locking
- **Objective:** Verify `role=admin` accounts are never locked regardless of failed-attempt count.
- **Preconditions:** Registered `role=admin` account.
- **Test Data / Inputs:** Admin email + wrong password (×4 or more).
- **Test Steps:** 1) Attempt login with wrong password 4+ times. 2) Attempt login with correct credentials.
- **Expected Result:** No lockout occurs at any point; failed-attempt counter is never incremented for admin accounts; final correct-credential attempt succeeds.
- **Business Rule / Requirement Reference:** business-rules.md §7 (admin lockout exemption).
- **Test Design Technique:** Decision Table
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-007 — Successful Login Resets Failed-Attempt Counter
- **Feature / Module:** Authentication & Accounts — Login / Account Locking
- **Objective:** Verify a successful login resets `failed_login_attempts` to 0.
- **Preconditions:** Non-admin account with 1–2 prior failed attempts (below lockout threshold).
- **Test Data / Inputs:** Valid credentials after 1–2 failed attempts.
- **Test Steps:** 1) Fail login once or twice. 2) Log in successfully. 3) Fail login 2 more times (should not lock, since counter was reset).
- **Expected Result:** Counter resets to 0 on success; subsequent 2 failures alone do not trigger lockout (lockout only after 3 consecutive failures from a reset state).
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-008 — Login Blocked for Disabled Account with Correct Credentials
- **Feature / Module:** Authentication & Accounts — Login
- **Objective:** Verify a disabled account (`enabled=false`) cannot log in even with correct credentials.
- **Preconditions:** Registered account with `enabled=false`.
- **Test Data / Inputs:** Correct email + password for the disabled account.
- **Test Steps:** 1) Submit login with correct credentials for a disabled account.
- **Expected Result:** Credential check succeeds internally but login is rejected with "Account disabled" (implementation string, no trailing period) after successful credential verification.
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** Minor text discrepancy (period vs. no period) between requirement and implementation strings — not a substantive conflict.

#### AUTH-009 — Login with TOTP Enabled Requires Second-Step Verification
- **Feature / Module:** Authentication & Accounts — Login / TOTP
- **Objective:** Verify that when TOTP is enabled, a correct email/password returns a restricted token requiring a valid 6-digit code before full access.
- **Preconditions:** Account with `totp_enabled=true`.
- **Test Data / Inputs:** Valid email/password; valid current TOTP code.
- **Test Steps:** 1) Submit email/password. 2) Receive restricted temp token. 3) Enter valid 6-digit TOTP code (`data-test="totp-code"`) and submit.
- **Expected Result:** Step 1 returns a restricted token (`claims(['restricted' => true])`); step 3 with a valid code returns a full access token and completes login.
- **Business Rule / Requirement Reference:** business-rules.md §7; user-flows.md §8.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** API (primary), UI
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-010 — Login Rejected with Invalid TOTP Code
- **Feature / Module:** Authentication & Accounts — Login / TOTP
- **Objective:** Verify an incorrect TOTP code is rejected after a valid password step.
- **Preconditions:** Account with `totp_enabled=true`; restricted token obtained.
- **Test Data / Inputs:** Invalid/expired 6-digit code.
- **Test Steps:** 1) Complete password step. 2) Submit an incorrect TOTP code.
- **Expected Result:** "Invalid TOTP" error; no full access token issued.
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-011 — Successful Registration with Valid Data
- **Feature / Module:** Authentication & Accounts — Registration
- **Objective:** Verify a new user can register with fully valid data.
- **Preconditions:** Email not already registered.
- **Test Data / Inputs:** First/last name, DOB (age between 18–75), full address, phone, unique email (≤256 chars), password meeting complexity rules.
- **Test Steps:** 1) Navigate to `/auth/register`. 2) Fill all required fields. 3) Submit.
- **Expected Result:** `POST /users/register` returns 201; account created with `role=user`; redirect to `/auth/login`.
- **Business Rule / Requirement Reference:** business-rules.md §7; user-flows.md §9.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), UI/E2E (smoke)
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-012 — Registration DOB Boundary — Exactly 18 Years Old
- **Feature / Module:** Authentication & Accounts — Registration
- **Objective:** Verify the minimum age boundary (18) is accepted.
- **Preconditions:** None.
- **Test Data / Inputs:** DOB = exactly 18 years before current date.
- **Test Steps:** 1) Submit registration with DOB at the 18-year boundary.
- **Expected Result:** Registration accepted (DOB validator allows the 18-year boundary per `before`/`after` Carbon-computed bounds).
- **Business Rule / Requirement Reference:** business-rules.md §7; §14 validation summary.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** Exact inclusive/exclusive boundary edge (18 years and 0 days vs. 1 day under) should be confirmed against `StoreCustomer.php` if precise boundary assertion is required.

#### AUTH-013 — Registration DOB Boundary — Exactly 75 Years Old
- **Feature / Module:** Authentication & Accounts — Registration
- **Objective:** Verify the maximum age boundary (75) is accepted.
- **Preconditions:** None.
- **Test Data / Inputs:** DOB = exactly 75 years before current date.
- **Test Steps:** 1) Submit registration with DOB at the 75-year boundary.
- **Expected Result:** Registration accepted at the 75-year boundary.
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** Exact inclusive/exclusive boundary should be confirmed against `StoreCustomer.php`.

#### AUTH-014 — Registration Rejected — Under 18 Years Old
- **Feature / Module:** Authentication & Accounts — Registration
- **Objective:** Verify registration is rejected when the applicant is under 18.
- **Preconditions:** None.
- **Test Data / Inputs:** DOB = 17 years before current date.
- **Test Steps:** 1) Submit registration with an under-18 DOB.
- **Expected Result:** 422 validation error on `dob`.
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-015 — Registration Rejected — Over 75 Years Old
- **Feature / Module:** Authentication & Accounts — Registration
- **Objective:** Verify registration is rejected when the applicant is over 75.
- **Preconditions:** None.
- **Test Data / Inputs:** DOB = 76 years before current date.
- **Test Steps:** 1) Submit registration with an over-75 DOB.
- **Expected Result:** 422 validation error on `dob`.
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-016 — Registration Rejected for Duplicate Email
- **Feature / Module:** Authentication & Accounts — Registration
- **Objective:** Verify registration fails when the email is already registered.
- **Preconditions:** An account already exists with the target email.
- **Test Data / Inputs:** Already-registered email + otherwise valid data.
- **Test Steps:** 1) Submit registration reusing an existing email.
- **Expected Result:** `Needs Human Review` — clean sources conflict: docs/user-stories/v5.md states the message "Email is already in use." while `sprint5/API/app/Http/Requests/Customer/StoreCustomer.php` returns "A customer with this email address already exists."; the exact HTTP status code is also ambiguous — `api-reference.md`'s documented codes for `POST /users/register` (201, 400, 401, 403, 409) do not include 422, though Laravel Form Request validation conventionally returns 422.
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** Confirm both the exact message string and status code against the current implementation before automating a strict assertion.

#### AUTH-017 — Registration Rejected — Email Exceeds Max Length
- **Feature / Module:** Authentication & Accounts — Registration
- **Objective:** Verify email longer than 256 characters is rejected.
- **Preconditions:** None.
- **Test Data / Inputs:** Syntactically valid email exceeding 256 characters.
- **Test Steps:** 1) Submit registration with an over-length email.
- **Expected Result:** 422 validation error on `email` (`max:256`).
- **Business Rule / Requirement Reference:** business-rules.md §7; §14.
- **Test Design Technique:** Boundary Value Analysis
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-018 — Registration Rejected — Password Fails Complexity Rules
- **Feature / Module:** Authentication & Accounts — Registration
- **Objective:** Verify passwords missing required complexity criteria are rejected.
- **Preconditions:** None.
- **Test Data / Inputs:** Passwords each missing one criterion: no uppercase, no number, no symbol, under 8 characters (test as separate data rows).
- **Test Steps:** 1) Submit registration with each non-compliant password variant.
- **Expected Result:** 422 validation error for each variant (`Password::min(8)->mixedCase()->numbers()->symbols()`).
- **Business Rule / Requirement Reference:** business-rules.md §7; §14.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API / Unit (validator)
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** Data-driven test recommended (one scenario, multiple data rows).

#### AUTH-019 — Registration Rejected — Password Found in Compromised List
- **Feature / Module:** Authentication & Accounts — Registration
- **Objective:** Verify a password meeting complexity rules but present in known-compromised lists is rejected.
- **Preconditions:** None.
- **Test Data / Inputs:** A well-known compromised password meeting complexity rules (e.g., commonly leaked password with required character mix).
- **Test Steps:** 1) Submit registration with a compromised-but-complex password.
- **Expected Result:** 422 validation error (`uncompromised()` check fails).
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** Requires network access to the compromised-password check service in the test environment; may need to be skipped/mocked in isolated CI.

#### AUTH-020 — Password Strength Indicator Reflects Criteria Count
- **Feature / Module:** Authentication & Accounts — Registration (UI)
- **Objective:** Verify the password strength meter shows correct label/percentage for 0–4 met criteria.
- **Preconditions:** None.
- **Test Data / Inputs:** Passwords meeting 0, 1, 2, 3, and 4 of the 4 displayed criteria (length, mixed case, number, symbol).
- **Test Steps:** 1) Type each password variant into the password field on `/auth/register`. 2) Observe the strength indicator.
- **Expected Result:** 0→Invalid/0%, 1→Weak/20%, 2→Moderate/40%, 3→Strong/60%, 4→Very Strong/80% (5th "Excellent/100%" state per requirements text is UI-only).
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** Decision Table
- **Recommended Test Layer:** Component (UI)
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-021 — Forgot Password Resets to Fixed Value for Registered Email
- **Feature / Module:** Authentication & Accounts — Forgot Password
- **Objective:** Verify submitting a registered email resets the account password to the fixed literal value.
- **Preconditions:** Registered account exists.
- **Test Data / Inputs:** Registered account's email.
- **Test Steps:** 1) Navigate to `/auth/forgot-password`. 2) Submit the registered email.
- **Expected Result:** Password is reset to `welcome02` and emailed; confirmation message shown (fades after 3 seconds); subsequent login succeeds with `welcome02`.
- **Business Rule / Requirement Reference:** business-rules.md §7; user-flows.md §10.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), UI
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-022 — Forgot Password Rejected for Unregistered Email
- **Feature / Module:** Authentication & Accounts — Forgot Password
- **Objective:** Verify an error is shown for an email not associated with any account.
- **Preconditions:** None.
- **Test Data / Inputs:** Unregistered email.
- **Test Steps:** 1) Submit an unregistered email on `/auth/forgot-password`.
- **Expected Result:** 400 validation error (`'email' => 'exists:users,email'`, per the documented status codes for `POST /users/forgot-password`); no password reset occurs.
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-023 — Change Password Rejected — Incorrect Current Password
- **Feature / Module:** Authentication & Accounts — Change Password
- **Objective:** Verify changing password fails when the current password is incorrect.
- **Preconditions:** Logged in.
- **Test Data / Inputs:** Wrong current password, valid new password + confirmation.
- **Test Steps:** 1) Submit change-password form with an incorrect current password.
- **Expected Result:** Request rejected (current-password `Hash::check` fails); password unchanged.
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-024 — Change Password Rejected — New Password Same as Current
- **Feature / Module:** Authentication & Accounts — Change Password
- **Objective:** Verify the new password must differ from the current password.
- **Preconditions:** Logged in.
- **Test Data / Inputs:** New password identical to current password.
- **Test Steps:** 1) Submit change-password form reusing the current password as the new password.
- **Expected Result:** Request rejected with a same-password validation error.
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-025 — Change Password Rejected — Confirmation Mismatch
- **Feature / Module:** Authentication & Accounts — Change Password
- **Objective:** Verify new password and confirmation must match.
- **Preconditions:** Logged in.
- **Test Data / Inputs:** New password and a differing confirmation value.
- **Test Steps:** 1) Submit change-password form with mismatched confirmation.
- **Expected Result:** 422 validation error (`confirmed` rule / `PasswordValidators.passwordsMatch()`).
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API / Component
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-026 — Change Password Success Auto-Logs Out User
- **Feature / Module:** Authentication & Accounts — Change Password
- **Objective:** Verify a successful password change logs the user out automatically after 5 seconds.
- **Preconditions:** Logged in.
- **Test Data / Inputs:** Correct current password; new compliant password + matching confirmation.
- **Test Steps:** 1) Submit a valid change-password request. 2) Wait 5+ seconds. 3) Observe session state.
- **Expected Result:** Success message shown; user is logged out automatically after 5 seconds (client-side behavior).
- **Business Rule / Requirement Reference:** business-rules.md §7; user-flows.md §13.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** 5-second value sourced from docs/user-stories/v5.md; the exact client-side timer call site was not independently re-traced to a specific `setTimeout` invocation in this knowledge-base pass.

#### AUTH-027 — Profile Update Saves Editable Fields; Email Remains Read-Only
- **Feature / Module:** Authentication & Accounts — Profile
- **Objective:** Verify first/last name, phone, and address fields are editable and persist; email is not editable.
- **Preconditions:** Logged in.
- **Test Data / Inputs:** New valid values for name/phone/address fields.
- **Test Steps:** 1) Navigate to `/account/profile`. 2) Edit editable fields. 3) Attempt to edit the email field. 4) Save.
- **Expected Result:** Editable fields update successfully with a confirmation message (fades after 5s); email field is read-only and unchanged.
- **Business Rule / Requirement Reference:** user-flows.md §12; ui-reference.md (Account — Profile: email `readonly`).
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-028 — TOTP Setup and Verification Enables 2FA
- **Feature / Module:** Authentication & Accounts — Two-Factor Authentication
- **Objective:** Verify a user can enable TOTP via setup + verify flow.
- **Preconditions:** Logged in with a non-demo account.
- **Test Data / Inputs:** Valid 6-digit code generated from the returned TOTP secret.
- **Test Steps:** 1) Trigger `POST /totp/setup`. 2) Generate a code from the returned secret. 3) Submit via `POST /totp/verify`.
- **Expected Result:** "TOTP verified and enabled successfully." shown; `totp_enabled` becomes `true`; subsequent logins require TOTP.
- **Business Rule / Requirement Reference:** user-flows.md §14; business-rules.md §7.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** API (primary), UI
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-029 — TOTP Setup Denied for Shared Demo Accounts
- **Feature / Module:** Authentication & Accounts — Two-Factor Authentication
- **Objective:** Verify TOTP setup is denied for the two well-known demo accounts.
- **Preconditions:** Logged in as `customer@practicesoftwaretesting.com` or `admin@practicesoftwaretesting.com`.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Attempt to initiate TOTP setup on a demo account.
- **Expected Result:** `Not confirmed from clean Sprint 5 source` — docs/user-stories/v5.md AC6 documents this denial message, but the specific email-based guard was actively searched for and not located in `TOTPController.php`/`TOTPService.php` in the clean knowledge-base pass.
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** Low
- **Automation Candidate:** No
- **Notes / Risks:** Verify the guard exists in the current `TOTPController`/`TOTPService` implementation before automating a hard assertion on this message.

#### AUTH-030 — Add Product to Favorites (Logged In)
- **Feature / Module:** Authentication & Accounts — Favorites
- **Objective:** Verify a logged-in user can add a product to favorites.
- **Preconditions:** Logged in; product exists.
- **Test Data / Inputs:** Valid `product_id`.
- **Test Steps:** 1) On `/product/:id`, click "Add to Favorites".
- **Expected Result:** "Product added to your favorites list." shown; `POST /favorites` returns success; item appears in `/account/favorites`.
- **Business Rule / Requirement Reference:** business-rules.md §3; user-flows.md §15.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** UI / End-to-End (primary), API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-031 — Add Duplicate Favorite Shows Already-Added Message
- **Feature / Module:** Authentication & Accounts — Favorites
- **Objective:** Verify adding an already-favorited product shows a duplicate message rather than creating a second entry.
- **Preconditions:** Logged in; product already in favorites.
- **Test Data / Inputs:** Same `product_id` as an existing favorite.
- **Test Steps:** 1) Add the same product to favorites a second time.
- **Expected Result:** "Product already in your favorites list." shown (per docs/user-stories/v5.md AC12); no duplicate favorite created (`POST /favorites` conflict response, 409 per api-reference.md).
- **Business Rule / Requirement Reference:** business-rules.md §3.
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** Message text sourced from docs/user-stories/v5.md; not independently re-traced to `FavoriteService.php` in this knowledge-base pass.

#### AUTH-032 — Add to Favorites Blocked When Not Logged In
- **Feature / Module:** Authentication & Accounts — Favorites
- **Objective:** Verify an unauthenticated visitor cannot add a favorite.
- **Preconditions:** Not logged in.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) On `/product/:id` as a guest, click "Add to Favorites".
- **Expected Result:** "Unauthorized, can not add product to your favorite list." shown; `POST /favorites` returns 401 (`auth:users` middleware).
- **Business Rule / Requirement Reference:** business-rules.md §3; api-reference.md (Favorites — `auth:users` required).
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-033 — View and Remove a Favorite
- **Feature / Module:** Authentication & Accounts — Favorites
- **Objective:** Verify favorites list displays entries and delete removes them.
- **Preconditions:** Logged in; at least one favorite exists.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Navigate to `/account/favorites`. 2) Click delete on a favorite entry.
- **Expected Result:** List shows image/name/truncated (250-char) description per favorite; after delete, list refreshes and the item is removed; empty state shown once all favorites are removed.
- **Business Rule / Requirement Reference:** user-flows.md §15.
- **Test Design Technique:** Not Applicable
- **Recommended Test Layer:** UI / End-to-End
- **Priority:** Low
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-034 — Authorization Boundary — User Cannot Access Admin Routes
- **Feature / Module:** Authentication & Accounts — Authorization
- **Objective:** Verify a `role=user` account cannot access admin-guarded routes/endpoints.
- **Preconditions:** Logged in as `role=user`.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Attempt to navigate to `/admin/...` in the UI. 2) Attempt a direct call to an admin-only endpoint (e.g., `DELETE /brands/{id}`, `GET /users`).
- **Expected Result:** UI navigation to `/admin/...` is blocked by `AdminAuthGuard`. Direct API calls to `role:admin`-gated endpoints (e.g., `DELETE /brands/{id}`, `GET /users`) are rejected; the exact HTTP status code returned to an authenticated non-admin caller (401 vs. 403) is `Not confirmed from clean Sprint 5 source` for these specific endpoints — `api-reference.md`'s Users table documents only `200, 400, 401` (no 403) for its own `role:admin`-gated actions, but this was not independently confirmed for the Brands/Categories `destroy` endpoints.
- **Business Rule / Requirement Reference:** api-reference.md (Brands, Categories, Users — `role:admin` gated endpoints).
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API (primary), UI
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** Confirm the exact status code against current middleware before hard-coding it in automation; assert only "request rejected" generically if the code cannot be confirmed.

#### AUTH-035 — Authorization Boundary — User Cannot Update Another User's Account
- **Feature / Module:** Authentication & Accounts — Authorization
- **Objective:** Verify a non-admin user cannot update another user's profile via direct API call.
- **Preconditions:** Two distinct `role=user` accounts (A and B), logged in as A.
- **Test Data / Inputs:** User B's `id` in the update payload/path.
- **Test Steps:** 1) Authenticated as A, call `PUT /users/{B's id}` with modified data.
- **Expected Result:** Request rejected — `UserService::updateUser()` throws for non-owner/non-admin.
- **Business Rule / Requirement Reference:** api-reference.md (Users — Update/Patch — self or admin only).
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-036 — Logout Invalidates Current JWT
- **Feature / Module:** Authentication & Accounts — Session Management
- **Objective:** Verify logging out invalidates the current session token.
- **Preconditions:** Logged in with a valid JWT.
- **Test Data / Inputs:** N/A.
- **Test Steps:** 1) Call `GET /users/logout`. 2) Re-attempt an authenticated request using the same (now-invalidated) token.
- **Expected Result:** Logout returns 200; subsequent request with the invalidated token returns 401.
- **Business Rule / Requirement Reference:** api-reference.md (Users/Authentication — `GET /users/logout`).
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** API
- **Priority:** Medium
- **Automation Candidate:** Yes
- **Notes / Risks:** —

#### AUTH-037 — Injection/Script Payload in Login Fields Is Not Executed or Bypassed
- **Feature / Module:** Authentication & Accounts — Security
- **Objective:** Verify SQL-injection/XSS-style payloads in email/password fields neither bypass authentication nor execute as script/SQL.
- **Preconditions:** None.
- **Test Data / Inputs:** Payload strings (e.g., `' OR '1'='1`, `<script>alert(1)</script>`) in email/password fields.
- **Test Steps:** 1) Submit login with injection/script payloads in place of normal credentials.
- **Expected Result:** `Not confirmed from clean Sprint 5 source` — no clean-source test evidence for this exact payload class was reviewed. General expectation is that login fails as an ordinary invalid-credentials attempt with no authentication bypass and no script execution reflected in the response, which follows from Eloquent ORM's parameterized-query architecture (docs/architecture.md), but this specific behavior is not a documented, tested clean Sprint 5 contract.
- **Business Rule / Requirement Reference:** Not confirmed from clean Sprint 5 source (architecture-level parameterized-query fact only; no dedicated clean-source test evidence for this payload class).
- **Test Design Technique:** Equivalence Partitioning
- **Recommended Test Layer:** API
- **Priority:** High
- **Automation Candidate:** Yes
- **Notes / Risks:** Treat as a security regression check rather than a documented functional contract.

#### AUTH-038 — Repeated Rapid Login Attempts Do Not Bypass Lockout via Timing
- **Feature / Module:** Authentication & Accounts — Security / Account Locking
- **Objective:** Verify rapid/parallel failed-login submissions still correctly accumulate toward the 3-attempt lockout (no race-condition bypass).
- **Preconditions:** Non-admin account, `failed_login_attempts = 0`.
- **Test Data / Inputs:** 3+ concurrent/rapid invalid-password login requests.
- **Test Steps:** 1) Fire 3+ failed login requests in rapid succession for the same account.
- **Expected Result:** `Not confirmed from clean Sprint 5 source` — concurrency/race-condition handling of `incrementLoginAttempts()` under rapid parallel requests was not verified in clean Sprint 5 sources. The single-request-sequence lockout behavior itself (see AUTH-005) is Confirmed; this scenario targets only the unconfirmed concurrency edge case.
- **Business Rule / Requirement Reference:** business-rules.md §7.
- **Test Design Technique:** State Transition
- **Recommended Test Layer:** API
- **Priority:** Low
- **Automation Candidate:** No
- **Notes / Risks:** Flag as an exploratory/manual investigation item rather than a strict automated assertion.
