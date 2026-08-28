---
description: "Use when designing, generating, reviewing, debugging, or maintaining Playwright UI or API/UI hybrid automation for Toolshop."
---

# Playwright Best Practices

## Locators

Prefer accessible, resilient locators, in this priority order:
1. `getByRole`
2. `getByLabel`
3. `getByPlaceholder`
4. `getByText` when stable and appropriate
5. Verified `data-test` selectors sourced from `docs/ai-knowledge/ui-reference.md`
6. CSS/XPath only as a last resort, when no better semantic locator exists

Never fabricate a selector — if it isn't confirmed in `ui-reference.md` or by direct inspection, don't invent it. Do not use `first()`/`nth()` merely to suppress strict-mode violations unless the intent genuinely requires selecting from a collection.

## Test Design

- Use `async`/`await` correctly throughout.
- Keep a readable arrange/action/assert structure.
- Every test must assert a meaningful business outcome — never write action-only tests without assertions.
- Use the Page Object Model where flow/page reuse or complexity justifies it; do not over-engineer POM for trivial one-off interactions.
- Externalize reusable test data and use fixtures where useful.
- Keep tests independently runnable; minimize unnecessary inter-test dependencies.

## Waits

- Rely on Playwright's auto-waiting first.
- Wait on observable application state, not time.
- Never use `page.waitForTimeout()` or arbitrary sleeps as a synchronization strategy.

## Assertions

- Assertions must be traceable to Toolshop business rules/user flows (`docs/ai-knowledge/business-rules.md`, `docs/ai-knowledge/user-flows.md`).
- Use exact financial assertions — no loose/approximate validation for subtotal, discounts, totals, quantities, or other financial values where the exact expected value is known.

## Failure Handling

- A generated test is not complete merely because the code was written — it must be executed.
- On failure, classify the cause before concluding anything:
  1. Test implementation defect
  2. Test data issue
  3. Environment issue
  4. Selector/synchronization issue
  5. Possible application defect

### Critical Rule

Never silently change the expected result just to make a failing test green.
- If the test contradicts confirmed clean Toolshop knowledge → fix the test.
- If the application contradicts confirmed clean Toolshop knowledge → preserve the expected assertion and report it as a potential application defect.

Do not adapt automation to broken application behavior simply to obtain a passing test.

## Page Object Model

- Store reusable locators in page objects where POM is justified by flow/page reuse or complexity.
- Page-object methods should represent meaningful user actions, not raw locator getters.
- Keep business assertions in test/spec files rather than hiding them inside page objects.
- Do not over-engineer POM for trivial one-off interactions.

## Locator Scoping and Filtering

- Prefer filtering collections by meaningful content (e.g. `filter({ hasText })`, role + accessible name) and scoping actions to the correct parent container over unscoped global locators.
- Do not use `first()`/`nth()` merely to silence strict-mode violations unless the intent genuinely requires selecting from a collection.
- Never use fragile, complex CSS chains when a resilient, semantic locator exists (see the locator priority order above).

## Test Structure

- Use descriptive test names that state the behavior/business outcome under test.
- Group related tests logically (e.g. `test.describe` per feature/flow).
- Keep arrange/action/assert readability throughout each test.
- Use concise step comments only when they improve readability — do not narrate obvious code.
- Every test must contain meaningful assertions tied to a business outcome; never write action-only tests.

## Dynamic Test Data

- Avoid hardcoded dynamic entity IDs (product IDs, cart IDs, invoice numbers, user IDs, etc.) when stable setup or generated data can be used instead.
- Generate isolated test data where practical so tests do not depend on a specific pre-existing data snapshot.
- Avoid shared state and order-dependent tests; each test should be able to run independently and in any order.

## API Automation and API/UI Hybrid

- Use Playwright's `APIRequestContext` for API-level scenarios when that is the appropriate layer for the behavior under test.
- API setup may be used to create test state (e.g. seeding a cart, account, or invoice) for UI tests when it reduces unnecessary UI setup steps.
- When the approved test strategy requires UI/E2E coverage, the user-visible behavior must still be validated in the browser — API setup is a means to reach the scenario faster, not a substitute for the required UI assertion.
- Do not mock core business behavior merely to make an E2E test easier.

## Mocking

- Route interception/mocking may be used only when intentionally testing isolated frontend states, such as empty states, conditional rendering, or controlled/edge data conditions that are impractical to produce through real backend state.
- Do not use mocks to replace real backend behavior in scenarios whose purpose is full-stack validation.

## Execution and Debugging

- Generated automation is not complete until it has been executed — see Failure Handling above.
- Run the smallest relevant scope first, such as a single spec or focused test file, before running the broader suite.
- Diagnose the root cause before editing a failing test (see the failure classification above).
- Re-run after every justified fix to confirm resolution.
- Do not blindly retry failures without changing anything.

## Traceability

- Generated tests should retain traceability to the approved Scenario ID and Test Strategy decision using concise naming, comments, or metadata (e.g. a test title or tag referencing the scenario ID).
- Do not duplicate large documentation blocks inside test code — reference the source, don't restate it.

## Secrets and Credentials

- Do not introduce passwords, access tokens, API keys, or other secrets directly into test code when configuration or environment variables can be used instead.
- Public demo credentials may be referenced only when they are intentionally supplied by the application and approved for testing.

## Anti-Patterns

Explicitly prohibit:
- `page.waitForTimeout()` as a synchronization strategy
- `test.only()` left in committed code
- Action-only tests with no assertion
- Fragile, complex CSS chains when a resilient locator exists
- Hardcoded dynamic IDs where stable/generated data could be used
- Shared or order-dependent test state
- Silently weakening assertions to make a test pass
- Testing implementation details instead of observable behavior
- Fabricating selectors, endpoints, payloads, status codes, or expected results
