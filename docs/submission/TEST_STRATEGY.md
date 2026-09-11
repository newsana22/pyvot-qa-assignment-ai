# Toolshop - Concise Test Strategy

## 1. Purpose and quality objective

Validate the deliberately **BUGGY Toolshop web UI and REST API** against **CLEAN Sprint 5**, which is the behavioural oracle for this assessment. The objective is to identify and prove genuine regressions, protect critical working behaviour, verify money calculations exactly, and leave a maintainable automated regression suite that deliberately contains both passing tests and failing tests that pin confirmed defects.

A failed automated test is treated as an **investigation point**, not automatically as a unique defect. Expected results are never changed merely to make the BUGGY environment green.

## 2. Test basis and oracle

Expected behaviour is derived from:

- CLEAN Sprint 5 application behaviour and confirmed CLEAN contracts/rules;
- curated Toolshop domain knowledge under `docs/ai-knowledge/`;
- generated scenario and strategy artefacts that are traceable back to CLEAN evidence;
- direct manual comparison of CLEAN and BUGGY where defect confirmation is required.

The intentionally buggy source, known-bug lists, defect seeds and answer-key material are not used to discover defects or define expected results.

One independently confirmed CLEAN discrepancy is retained separately: **CLEAN-BUG-001 / AUTH-015**, where registration accepts a customer beyond the expected maximum age boundary. The original expected validation rule remains unchanged and the automation case is intentionally skipped rather than rewritten to match the defect.

## 3. Scope and risk priorities

### In scope

- Authentication, login, registration and account-access boundaries
- Browse/search contracts and product state
- Product-detail and add-to-cart behaviour
- Cart lifecycle, update/remove behaviour and quantity boundaries
- Checkout and payment validation
- Order creation and invoice retrieval
- Invoice authorization and customer-data isolation
- Exact line totals, discounts, discount removal and stacking
- Critical browser journeys from login/product/cart through checkout/invoice
- REST API contracts and negative validation
- CLEAN-vs-BUGGY regression comparison
- Manual verification of automation-discovered defects

### Highest risks

1. Incorrect prices, discounts, stacking order or invoice totals
2. Cart or checkout failures that block purchase
3. Authentication, authorization or invoice data-isolation failures
4. API contract regressions that cascade across UI and test consumers
5. Payment validation accepting invalid card data
6. Registration contract/validation regressions that block downstream authenticated flows
7. User-visible routing/state failures in critical SPA journeys

## 4. ISO/IEC 25010 quality characteristics emphasized

| Characteristic | Application to this assessment |
|---|---|
| Functional suitability | Core shopping rules, validation, contracts and exact financial calculations must be correct. |
| Reliability | Cart, checkout and invoice flows must behave consistently and preserve state correctly. |
| Security | Authentication, authorization, payment validation and invoice/customer isolation are high risk. |
| Usability | Critical controls, validation feedback, routing and confirmations must be visible and understandable. |
| Compatibility | API contracts must remain stable for UI/test consumers; browser execution must remain portable. |
| Maintainability / testability | Stable locators, dynamic data, reusable helpers/POM and deterministic assertions reduce false failures. |

## 5. Test design approach

A **risk-based test pyramid** is used. API coverage carries most contract, validation, authorization and calculation checks because it is faster and more precise. UI/E2E coverage is intentionally narrower and focuses on critical user-visible journeys and browser integration proof. API/UI hybrid setup is permitted to reach browser states efficiently, but API setup never replaces a required browser assertion.

The scenario catalogue was broader than the final implementation: the generated strategy considered **159 functional scenarios** and initially selected **113** as automation candidates across the pyramid. The final time-boxed implementation is intentionally smaller and complete: **49 executable Playwright tests/sub-cases** covering the highest-value regression slice. The 113 figure therefore represents strategy-level candidate selection, not implemented test count.

Black-box techniques are explicitly applied:

- **Equivalence Partitioning** — valid/invalid input and contract classes
- **Boundary Value Analysis** — age, quantity and validation boundaries
- **Decision Tables** — conditional payment/discount combinations
- **State Transition** — authentication, cart, checkout and invoice state changes

Financial validation uses independently derived **exact expected values** rather than approximate checks. Quantity boundaries include `0`, `1`, `99` and `100`.

## 6. Automation architecture and governance

The final automation uses **Playwright JavaScript** with separate API and UI projects. The framework includes reusable page objects, API helpers, fixtures, dynamic product/test-data discovery, externalized test data and financial utilities. Playwright-managed Chromium is used for portability across local, Docker and CI execution.

The repository also implements a role-separated **GitHub Copilot custom multi-agent QA workflow**:

```text
CLEAN Sprint 5 knowledge
        |
        v
Create Scenarios
        |
        v
Test Strategy
        |
        v
Generate Tests
        |
        v
Review Tests
        |
        v
Execute -> Diagnose -> Manually Verify
```

Custom agents are defined under `.github/agents/`, while shared QA and Playwright governance is held under `.github/instructions/`. The agents have deliberately separated responsibilities: scenario discovery, layer/scope decisions, implementation, and independent review.

Key guardrails include:

- CLEAN Sprint 5 remains the expected-behaviour baseline;
- no fabricated selectors, endpoints, status codes, calculations or business rules;
- semantic/stable locators preferred over brittle selectors;
- no arbitrary sleeps as a synchronization strategy;
- exact business assertions instead of tautological checks;
- dynamic data preferred over fixed IDs;
- expected results are never weakened solely to make BUGGY tests pass;
- cascading failures are classified by root cause rather than inflated into separate defects.

### Supplementary MCP / cloud-agent validation

As a small supplementary proof of concept, the current workflow was also validated with:

- **Playwright MCP** — successfully opened the live CLEAN Toolshop application through Copilot Agent mode and returned the live page title without modifying repository files;
- **GitHub MCP** — successfully performed read-only repository interaction and reported the current repository/open-PR state;
- **GitHub Cloud Agents** — the repository-defined `Review Tests` custom agent was discovered from `.github/agents/` and executed in GitHub's Agents experience to review the existing F-UI-02 product/add-to-cart automation against repository knowledge and review instructions.

These capabilities are **supplementary**. The regression suite does not depend on MCP or cloud-agent availability and remains independently runnable through Playwright commands and Docker.

## 7. Final executable regression baseline

| Execution | Final result | Interpretation |
|---|---:|---|
| Local CLEAN | **48 passed, 1 skipped, 0 failed** | Stable oracle regression; the skip preserves the known CLEAN age-boundary discrepancy. |
| Local BUGGY | **11 passed, 37 failed, 1 skipped** | Intentional green + red result. Failures are triaged by root cause; 37 failures do not equal 37 defects. |
| Docker CLEAN | **48 passed, 1 skipped** | Reproduces CLEAN baseline in the dedicated Playwright container. |
| Docker BUGGY | **11 passed, 37 failed, 1 skipped** | Reproduces BUGGY baseline in the same containerized runner. |

The BUGGY suite is deliberately **not** made fully green. Correct failing assertions are retained where they pin confirmed product regressions.

## 8. Environments and execution model

| Environment | UI | API | Role |
|---|---|---|---|
| CLEAN | `https://practicesoftwaretesting.com` | `https://api.practicesoftwaretesting.com` | Behavioural oracle |
| BUGGY | `https://with-bugs.practicesoftwaretesting.com` | `https://api-with-bugs.practicesoftwaretesting.com` | Regression target |

The same Playwright suite is parameterized using environment URLs and can be executed:

- locally with CLEAN/BUGGY npm scripts;
- in the dedicated `Dockerfile.playwright` image;
- through the assignment-specific GitHub-hosted Actions workflow;
- through the manually triggered self-hosted Windows Actions workflow.

GitHub-hosted browser runs were intercepted by the public site's **Cloudflare human-verification/security page**. This is classified separately as an external execution-environment limitation rather than a Toolshop application defect or Playwright assertion defect. Self-hosted Windows and Docker runs provide the reliable alternative evidence paths.

## 9. Defect and failure-classification strategy

A defect is formally reported only when the observed behaviour is reproducible and the expected result is supported by CLEAN/rule evidence. Automated failures are consolidated when they share the same root cause.

The automation-driven BUGGY investigation currently consolidates failures into **nine confirmed independent BUGGY defects (BUG-001 through BUG-009)**, including product API contract regression, eco-classification regression, payment-validation defects, cart-creation failure, registration contract regression, invoice lookup regression, and direct SPA routing defects. Downstream failures caused by these defects remain mapped to the originating root cause.

The known **CLEAN-BUG-001 / AUTH-015** age-boundary issue remains separate from BUGGY defect numbering and is intentionally skipped in both environment runs while preserving the expected rule.

Manual exploratory findings are maintained as a **separate evidence stream** from automation-discovered defects. They are not automatically merged or renumbered into the automation defect set unless a duplicate/root-cause relationship is explicitly established.

## 10. Entry and exit criteria

### Entry criteria

- CLEAN and BUGGY environments are reachable for the target layer.
- The scenario has a confirmed expected result or is explicitly marked for human review.
- Required test data can be created/discovered independently.
- The automation does not depend on known-bug/answer-key material.

### Exit criteria for this time-boxed assessment

- Core high-risk API and UI journeys are automated and executable with one regression command.
- CLEAN baseline is stable apart from the explicitly documented known CLEAN defect.
- BUGGY failures are triaged into confirmed defects, cascading failures, observations or infrastructure limitations.
- Automation-discovered defects are manually reproduced/verified before formal reporting.
- Financial assertions remain exact and traceable.
- Local and Docker execution are reproducible; CI limitations are documented rather than hidden.
- No expected assertion is weakened merely to make BUGGY green.

## 11. Deliberately out of scope / residual risk

The time box deliberately excludes exhaustive feature coverage, a broad device/browser matrix, formal performance/load testing, full WCAG accessibility audit, deep penetration testing, destructive concurrency testing, and low-value cosmetic permutations.

With an additional cycle, priority extensions would be cross-browser/device coverage, a focused accessibility pass, targeted API/performance checks, expanded security misuse/authorization coverage, automation of remaining high-value manual scenarios, and further CI-environment resilience where public-site bot protection permits legitimate automation.

## 12. Release-quality conclusion

The **CLEAN baseline is stable for the implemented regression slice**, with one separately documented/skipped age-boundary defect. The **BUGGY build is not release-ready**: confirmed high-impact regressions remain in API contracts, payment validation, cart creation, registration, invoice behaviour and direct routing. The intentionally red BUGGY regression is therefore useful evidence, not a suite-quality failure.
