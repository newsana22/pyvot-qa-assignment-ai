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
