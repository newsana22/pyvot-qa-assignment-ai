# Toolshop – Test Summary

## 1. Executive Summary

This assessment validated the Toolshop web application and REST APIs using the CLEAN Sprint 5 environment as the behavioural oracle and the deliberately BUGGY environment as the regression target.

The work combined manual exploratory testing, risk-based test design, Playwright JavaScript automation, API/UI/hybrid testing, exact financial validation, AI-assisted multi-agent QA engineering, manual defect verification, Dockerized execution, and CI execution.

The final implemented Playwright regression suite contains **49 tests/subcases** covering the selected high-risk areas of the application.

### Final Regression Baseline

| Environment | Passed | Failed | Skipped | Total |
|---|---:|---:|---:|---:|
| CLEAN | 48 | 0 | 1 | 49 |
| BUGGY | 11 | 37 | 1 | 49 |

The BUGGY result of **37 failed tests does not represent 37 unique defects**. Failures were investigated and consolidated by root cause, and candidate defects were manually verified before being classified as confirmed findings.

---

## 2. Test Objective

The primary objectives were to:

-  understand expected Toolshop behaviour using the CLEAN environment; 
-  explore the deliberately BUGGY application and identify reproducible defects; 
-  protect important working behaviour with automated regression coverage; 
-  expose deliberate regressions without weakening expected assertions; 
-  validate API contracts, validation rules and authorization boundaries; 
-  verify financial calculations using independently derived exact values; 
-  automate selected critical user journeys; 
-  distinguish product defects from automation and infrastructure failures; 
-  provide reproducible evidence that supports efficient developer investigation. 

The guiding principle throughout the assessment was:

> **A failing test is evidence requiring investigation, not automatically a unique defect.**

---

## 3. Areas Covered

The implemented regression scope covers the following functional areas:

| Area | Coverage Focus |
|---|---|
| Authentication & Accounts | Registration, login, validation and account-related boundaries |
| Browse / Search | Product discovery and catalogue behaviour |
| Product | Product detail state, stock state and Add to Cart behaviour |
| Cart | Cart creation, lifecycle, quantities and boundary conditions |
| Checkout & Payment | Checkout progression and payment validation |
| Invoice | Invoice retrieval, authorization and invoice-related behaviour |
| Financial Calculations | Line totals, discounts, eco rules, stacking and exact monetary calculations |
| Critical UI Journeys | Browser-level proof of important customer workflows |
| REST APIs | Contracts, validation, boundaries, state and business rules |

The final executable scope is intentionally smaller than the broader generated scenario catalogue. Scenarios were prioritized using risk and test-pyramid principles rather than automating every generated scenario.

---

## 4. Test Design Techniques

The following black-box techniques were applied where appropriate:

**Equivalence Partitioning (EP)** was used to separate valid and invalid input classes.

**Boundary Value Analysis (BVA)** was used for important boundaries such as registration age, quantity limits and payment validation.

For cart quantity, explicit boundary coverage included:

```text
0     → invalid lower boundary
1     → minimum valid quantity
99    → maximum valid quantity
100   → invalid maximum + 1
```

**Decision Tables** were used where outcomes depended on combinations of conditions, particularly financial/discount and payment-related rules.

**State Transition Testing** was used for workflows where behaviour depends on application state, including cart, authentication, checkout and invoice journeys.

---

## 5. Test Pyramid and Automation Layers

A risk-based test pyramid was used rather than implementing every scenario through the browser.

```text
              UI / E2E
           Critical journeys
                 ▲
                 │
          API + UI Hybrid
       Efficient state/setup
                 ▲
                 │
                API
 Contracts / validation / calculations
```

API tests provide precise and efficient coverage for contracts, business rules, validation, authorization and calculations.

UI tests provide browser-level evidence for critical user-visible behaviour.

Hybrid tests may use API setup or discovery to efficiently establish test state while preserving required browser assertions.

---

## 6. CLEAN Regression Result

The final CLEAN regression baseline was:

```text
48 passed
0 failed
1 skipped
49 total
```

This baseline was reproduced through normal local execution and the dedicated Playwright Docker runner.

The CLEAN baseline demonstrates that the selected regression implementation is stable against the behavioural reference, apart from one explicitly documented known discrepancy.

---

## 7. Known CLEAN Discrepancy

One registration boundary scenario exposed a discrepancy in the CLEAN application.

### CLEAN-BUG-001 – Registration API accepts a customer older than the maximum allowed age

The documented registration rule defines a valid date of birth within the supported age range.

The maximum-age boundary test expected rejection beyond the permitted limit, but CLEAN accepted the request and created the customer.

The behaviour was reproduced manually and through automation.

The expected validation rule was **not changed to match the observed CLEAN defect**.

The automated scenario remains intentionally skipped in the standard regression baseline while the discrepancy is documented separately.

Therefore:

```text
CLEAN = 48 Passed + 1 Known Skip
```

rather than modifying the assertion simply to produce 49 green tests.

---

## 8. BUGGY Regression Result

The same regression suite was executed against the deliberately BUGGY environment.

Result:

```text
11 passed
37 failed
1 skipped
49 total
```

This mixed green/red result is intentional and useful.

Passing tests demonstrate functionality that remains operational in BUGGY.

Failing tests expose differences requiring investigation.

The expected results were not changed simply to make the BUGGY environment green.

---

## 9. Failure Triage

The initial BUGGY failures were investigated using root-cause analysis.

The triage process was:

```text
Automated Failure
       ↓
Identify Failure Point
       ↓
Check Whether Business Rule Was Reached
       ↓
Compare CLEAN / BUGGY Behaviour
       ↓
Identify Possible Root Cause
       ↓
Check for Cascading Failures
       ↓
Manual Reproduction
       ↓
Defect / Existing Defect / Observation
```

A separate tracker maps automation cases and scenarios to their failure points, root causes, mapped defects and evidence.

This prevents defect-count inflation.

For example, if a shared product API contract regression prevents several tests from discovering an eligible product, those failures are related symptoms rather than automatically separate defects.

---

## 10. Automation-Discovered BUGGY Defects

Failure triage and manual verification consolidated the automation-exposed behaviour into the following confirmed BUGGY defects:

| ID | Confirmed Finding |
|---|---|
| BUG-001 | Product GET API omits the expected `in_stock` property |
| BUG-002 | Eco-friendly product classification is incorrect/inverted |
| BUG-003 | Payment API accepts an expired credit-card expiration date |
| BUG-004 | Payment API accepts a malformed credit-card number |
| BUG-005 | Cart creation API is unavailable and the Cart section is missing from BUGGY Swagger |
| BUG-006 | Registration API rejects a valid nested address payload accepted by CLEAN |
| BUG-007 | Invoice API returns an existing invoice for a non-existent invoice ID |
| BUG-008 | Direct authentication SPA route `/auth/login` returns Apache 404 |
| BUG-009 | Direct product-detail URL returns Apache 404 for a valid product |

Additional observations were tracked separately where evidence did not justify treating them as confirmed product defects.

---

## 11. Manual Exploratory Testing

Manual exploratory testing was performed **before building the multi-agent automation workflow**.

The CLEAN application was first explored to understand expected Toolshop behaviour. The BUGGY application was then explored against that reference.

This produced a separate collection of manual exploratory defect reports, with **one evidence document per observed issue**.

These findings cover areas such as:

-  navigation and category behaviour; 
-  product filtering and sorting; 
-  product/cart interactions; 
-  quantity controls; 
-  cart presentation and state; 
-  checkout and billing behaviour; 
-  payment controls; 
-  login/user-facing behaviour; 
-  product comparison/specification behaviour; 
-  routing and navigation; 
-  other observable UI/application defects. 

These reports remain a **separate exploratory evidence stream** from automation-derived defect IDs.

Where an automated failure relates to behaviour already found during exploration, it can be cross-referenced rather than artificially reported as another independent defect.

---

## 12. Financial Validation

Financial testing was treated as a high-risk area.

Expected values were independently derived rather than simply comparing one application value with another application-generated value.

Coverage includes:

-  quantity × unit-price line calculations; 
-  applicable discounts; 
-  eco-related rules; 
-  discount combinations/stacking; 
-  cart/order totals; 
-  invoice-related calculations. 

Assertions use exact expected values rather than weak checks such as:

```text
value exists
value > 0
not null
approximately looks correct
```

This reduces false-green financial tests.

---

## 13. Automation Quality Controls

The automation implementation uses several controls to improve reliability:

-  dynamic test data where appropriate; 
-  API-driven product discovery rather than hard-coded product IDs; 
-  Page Objects for reusable UI interactions; 
-  reusable API helpers; 
-  scenario IDs for traceability; 
-  deterministic Playwright assertions; 
-  stable/confirmed locator preference; 
-  no arbitrary `waitForTimeout` synchronization; 
-  environment parameterization; 
-  retained failure screenshots/video/trace where configured; 
-  exact business assertions; 
-  separation between test setup and business validation. 

The implementation was also independently reviewed through the dedicated Review Tests agent to identify false-green and maintainability risks.

---

## 14. Execution Environments

The regression suite supports multiple execution paths.

### Local

CLEAN and BUGGY can be selected through environment-specific npm commands.

### Docker

A dedicated Playwright Docker runner provides portable test execution without containerizing the entire Toolshop application.

Confirmed Docker results:

| Environment | Result |
|---|---|
| CLEAN | 48 passed, 1 skipped, 0 failed |
| BUGGY | 11 passed, 37 failed, 1 skipped |

The Docker results reproduce the established regression baselines.

### GitHub Actions

Dedicated assignment workflows support CI execution independently of the original Toolshop application workflows.

Both GitHub-hosted and self-hosted execution were investigated.

---

## 15. Hosted CI Infrastructure Finding

GitHub-hosted UI execution encountered Cloudflare/security verification on the public Toolshop application.

The verification page was captured in execution evidence and prevented some browser journeys from reaching the application under test.

The behaviour was reproduced on hosted-runner attempts and therefore classified separately as an **infrastructure/security-layer constraint**.

Tests and selectors were not modified merely to bypass this external verification behaviour.

A manually triggered self-hosted Windows workflow provides an alternative execution path for the public application.

---

## 16. Docker and CI Portability

The framework uses Playwright-managed Chromium to reduce dependency on a locally installed browser.

The same suite can therefore be executed across:

```text
Developer Machine
      ↓
Playwright Docker Container
      ↓
GitHub Actions / Self-Hosted Runner
```

Environment URLs are parameterized so that the same tests can target either CLEAN or BUGGY without duplicating the framework.

---

## 17. AI-Augmented QA

AI was used as an engineering accelerator across:

-  structured scenario generation; 
-  risk-based strategy generation; 
-  Playwright implementation; 
-  automation review; 
-  failure investigation assistance; 
-  optional live-browser inspection through Playwright MCP; 
-  optional repository interaction through GitHub MCP. 

The repository contains specialized agents for scenario creation, test strategy, test generation and test review, together with shared Toolshop QA and Playwright engineering instructions.

AI output remained subject to human verification.

No candidate defect was considered confirmed solely because an AI agent or automated test reported it.

---

## 18. Defect Evidence Model

Three complementary evidence streams were maintained:

```text
1. Manual Exploratory Testing
   CLEAN understanding → BUGGY exploration
              │
              ▼
   Individual exploratory defect reports


2. Automated Regression
   CLEAN baseline → BUGGY execution
              │
              ▼
        Failure triage
              │
              ▼
     Root-cause consolidation


3. Manual Verification
   Automation-exposed behaviour
              │
              ▼
      Manual reproduction
              │
              ▼
       Confirmed defect
```

This approach provides stronger evidence than relying on automation output alone.

---

## 19. Residual Risks / Out of Scope

Due to the assessment timebox, the following areas were deliberately not treated as exhaustive coverage:

-  full browser/device compatibility matrix; 
-  formal performance/load testing; 
-  complete WCAG accessibility audit; 
-  deep penetration/security testing; 
-  destructive concurrency testing; 
-  exhaustive permutations of every feature; 
-  low-value cosmetic variations; 
-  full automation of the broader generated scenario catalogue. 

These remain candidates for subsequent test cycles.

---

## 20. Overall Quality Assessment

The BUGGY environment contains confirmed regressions affecting several high-risk areas, including:

**API contracts, cart creation, payment validation, registration validation, product classification, invoice behaviour and critical SPA routing.**

Several of these defects can affect multiple downstream workflows, which explains why the number of failed automated tests is substantially larger than the number of confirmed root-cause defects.

The application should therefore **not be considered release-ready based on the tested BUGGY build** until the high-impact defects are corrected and the regression suite is rerun.

The CLEAN baseline provides a stable reference for the implemented scope, with the single documented registration age-boundary discrepancy explicitly isolated rather than hidden.

---

## Final Assessment Snapshot

| Item | Result |
|---|---|
| Implemented Playwright tests/subcases | **49** |
| CLEAN | **48 Passed / 0 Failed / 1 Skipped** |
| BUGGY | **11 Passed / 37 Failed / 1 Skipped** |
| Confirmed automation-derived BUGGY defects | **9** |
| Known CLEAN discrepancy | **1** |
| Manual exploratory findings | **Maintained separately with individual evidence** |
| Local execution | **Implemented** |
| Docker execution | **Implemented and verified** |
| GitHub Actions | **Implemented** |
| Self-hosted execution | **Implemented and verified** |
| Playwright MCP | **Configured and smoke validated** |
| GitHub MCP | **Configured and read-only validated** |
| Defect manual verification | **Performed for automation-derived confirmed defects** |
| BUGGY release recommendation | **Not release-ready for tested scope** |
