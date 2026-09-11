# Pyvot AI-Augmented QA / SDET Take-Home — Toolshop

## 1. Overview

This repository contains a focused QA assessment of the Toolshop e-commerce application. The deliberately **BUGGY** build is the test target and the **CLEAN Sprint 5** environment is used as the behavioural oracle.

The submission combines:

- manual exploratory testing,
- black-box test design,
- API + UI automation with Playwright JavaScript,
- exact financial validation,
- a GitHub Copilot custom multi-agent QA workflow,
- manual defect verification and root-cause triage,
- Dockerized execution,
- GitHub Actions execution,
- and small supplementary MCP / GitHub Cloud Agent proof-of-concepts.

The guiding principle throughout the assessment is **truth over volume**. A failing automated test is treated as an investigation point, not automatically as a unique defect. Failures are consolidated by reproducible root cause before being reported.

---

## 2. Target environments

| Environment | UI | API |
|---|---|---|
| CLEAN oracle | https://practicesoftwaretesting.com | https://api.practicesoftwaretesting.com |
| BUGGY target | https://with-bugs.practicesoftwaretesting.com | https://api-with-bugs.practicesoftwaretesting.com |

Expected behaviour is derived from CLEAN Sprint 5 documentation/observable behaviour and direct CLEAN execution. Intentionally buggy source, known-bug lists, defect seeds and answer-key material were not used to discover defects or define expected results.

---

## 3. Assessment workflow

The work was intentionally completed in stages so that exploratory findings, automated regression evidence and AI-assisted engineering remained distinguishable.

```text
Understand CLEAN Toolshop behaviour
        |
        v
Manual exploratory testing of BUGGY
        |
        v
Document exploratory defects + evidence
        |
        v
Curate Toolshop domain / business-rule knowledge
        |
        v
Create Scenarios Agent
        |
        v
Test Strategy Agent
        |
        v
Generate Tests Agent
        |
        v
Review Tests Agent
        |
        v
Execute CLEAN baseline
        |
        v
Execute BUGGY regression
        |
        v
Root-cause triage + manual verification
        |
        v
Docker / CI validation
        |
        v
Supplementary MCP / GitHub Cloud Agent POCs
        |
        v
Final reporting
```

---

## 4. Manual exploratory testing before automation

Before building the automated regression suite, the CLEAN Toolshop application was explored to understand the expected user journeys, controls and observable behaviour. The BUGGY application was then explored manually using CLEAN as the behavioural reference.

Reproducible issues identified during this phase were documented individually with steps, expected behaviour, actual behaviour, screenshots and supporting evidence.

These exploratory findings are intentionally maintained **separately** from defects later exposed by the automated regression suite. This preserves provenance and avoids double counting when a manual finding and an automated failure represent the same underlying behaviour.

Primary exploratory evidence:

- `Manual Exploratory Toolshop Buggy_Consolidated_Bug_Report.xlsx`
- individual exploratory bug evidence documents supplied with the submission

---

## 5. Scope

The time-boxed scope prioritises the business-critical shopping journey:

**browse/search → product → cart → checkout/payment → invoice**

with additional coverage for authentication/accounts and financial integrity.

Coverage includes:

- authentication and customer registration,
- browse/search and product-state behaviour,
- cart lifecycle,
- quantity boundaries,
- checkout validation,
- payment validation,
- order and invoice access,
- authorization/data-isolation behaviour,
- exact financial calculations,
- discount rules and stacking,
- and critical browser journeys.

Black-box techniques used explicitly include:

- **Equivalence Partitioning**
- **Boundary Value Analysis**
- **Decision Tables**
- **State Transition Testing**

Financial assertions are exact and data-driven where applicable. Quantity boundaries include `0`, `1`, `99` and `100`.

---

## 6. Test architecture

The Playwright JavaScript framework deliberately uses both REST API and browser layers.

### API coverage

Used primarily for:

- contracts,
- validation,
- authorization,
- fast state setup,
- calculation-heavy checks,
- and boundary testing.

### UI / E2E coverage

Reserved for:

- critical user-visible journeys,
- routing,
- confirmations,
- integration proof,
- and browser-observable outcomes.

API setup may be used to reach a browser state efficiently, but it never replaces a required UI assertion.

Framework design includes:

- Playwright `APIRequestContext`,
- Page Object Model where reuse justifies it,
- reusable API helpers,
- dynamic catalog discovery,
- fixtures and externalized test data,
- money/calculation utilities,
- stable locator preference,
- deterministic assertions,
- and one-worker regression execution for repeatability.

Locator preference is:

`role → label → placeholder → stable text → verified data-test → CSS/XPath only when necessary`

Arbitrary sleeps are prohibited; Playwright auto-waiting and observable state are preferred.

---

## 7. AI-augmented multi-agent QA workflow

The repository contains a role-separated GitHub Copilot custom-agent workflow under `.github/agents/`.

```text
CLEAN Sprint 5 / curated Toolshop knowledge
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
Execute / Diagnose / Manually Verify
```

The custom agents are intentionally separated by responsibility:

- **Create Scenarios** — functional test design using QA lenses and black-box techniques.
- **Test Strategy** — risk-based layer selection, scope and test-pyramid decisions.
- **Generate Tests** — implements only approved scenarios and strategy in Playwright.
- **Review Tests** — independent quality gate for assertions, selectors, contracts, maintainability and false-green risk.

Shared governance under `.github/instructions/` enforces:

- CLEAN-only expected behaviour,
- no use of intentionally buggy source or answer-key material,
- no fabricated selectors/endpoints/status codes,
- resilient locator priority,
- meaningful business assertions,
- no arbitrary sleeps,
- exact financial validation,
- dynamic test data where practical,
- failure classification,
- and the rule that expected results must never be weakened merely to make BUGGY green.

The generated design catalogue is broader than the final implemented regression. The strategy/design stage produced a large scenario catalogue and automation candidates, while the final time-boxed executable implementation contains **49 Playwright tests**. This distinction is intentional: the generated strategy describes potential coverage; the repository contains the finished high-value slice actually implemented and executed.

See `AI_USAGE.md` for AI usage, corrections and human-verification details.

---

## 8. Regression suite and final execution baseline

The final executable regression contains **49 Playwright tests** across API and UI projects.

| Execution | Result | Interpretation |
|---|---:|---|
| CLEAN local | **48 passed, 1 skipped, 0 failed** | Stable oracle regression. The skip preserves one confirmed CLEAN boundary defect. |
| BUGGY local / self-hosted | **11 passed, 37 failed, 1 skipped** | Intentional green + red regression. Failures pin regressions but are consolidated by root cause. |
| Docker CLEAN | **48 passed, 1 skipped, 0 failed** | Reproduces the CLEAN baseline in the Playwright container. |
| Docker BUGGY | **11 passed, 37 failed, 1 skipped** | Reproduces the BUGGY baseline in the container. |

The **37 BUGGY failures do not mean 37 unique bugs**. Many are cascading failures caused by upstream contract or setup defects.

---

## 9. Known CLEAN discrepancy

### CLEAN-BUG-001 / AUTH-015 — Registration age boundary

Registration accepts a customer beyond the expected maximum age boundary. The expected validation behaviour is preserved; the demonstration test remains intentionally skipped rather than being rewritten to match the incorrect CLEAN runtime behaviour.

This CLEAN discrepancy is tracked separately from the BUGGY defect series.

---

## 10. Confirmed automation-discovered BUGGY root defects

Automation execution, CLEAN comparison and manual verification consolidated the red suite into the following confirmed root defects:

1. **BUG-001** — Product GET API omits `in_stock`.
2. **BUG-002** — Eco-friendly product classification is incorrect/inverted.
3. **BUG-003** — Payment API accepts an expired credit-card expiration date.
4. **BUG-004** — Payment API accepts a malformed credit-card number.
5. **BUG-005** — Cart creation `POST /carts` is unavailable; Cart section is missing from BUGGY Swagger.
6. **BUG-006** — Registration API rejects a valid nested address payload accepted by CLEAN.
7. **BUG-007** — Invoice API returns an existing invoice for a non-existent invoice ID.
8. **BUG-008** — Direct BUGGY login route `/auth/login` returns Apache 404 while CLEAN loads successfully.
9. **BUG-009** — Direct product-detail URL returns Apache 404 for a valid product in BUGGY.

Cascading automated failures are mapped back to these root causes instead of being inflated into separate bug counts.

Detailed evidence is provided in the Automation BUGGY Defect & Observation Log and automation defect-mapping spreadsheet.

---

## 11. Manual exploratory findings vs automation-discovered defects

The submission keeps the two evidence streams separate:

### A. Manual exploratory findings

Discovered during direct CLEAN → BUGGY exploration before the multi-agent automation workflow was built.

### B. Automation-discovered / automation-exposed defects

Discovered or exposed when the same Playwright assertions were executed against BUGGY, then manually reproduced and consolidated by root cause.

This separation is deliberate. It preserves how each issue was found and prevents duplicate defect counting.

---

## 12. Docker execution

The Docker setup containerizes the **Playwright automation runner only**, not the Toolshop application.

The image uses the Microsoft Playwright base image matching the project version and executes the same API + UI suite against environment URLs supplied at runtime.

Build:

```bash
npm run docker:buildTest
```

Run CLEAN:

```bash
npm run docker:cleanTest
```

Run BUGGY:

```bash
npm run docker:buggyTest
```

Docker reproduced the same final baselines as local/self-hosted execution, providing a portable reviewer path independent of the author's local Node installation.

---

## 13. Run locally

Prerequisites:

- Node.js 22+
- Playwright browser dependencies

Install:

```bash
npm ci
npx playwright install
```

Run CLEAN:

```bash
npm run test:clean
```

Run BUGGY:

```bash
npm run test:buggy
```

Focused commands:

```bash
npm run test:api
npm run test:ui
npm run test:buggy:api
npm run test:buggy:ui
```

On Windows PowerShell, `npm.cmd` / `npx.cmd` can be used if execution policy blocks PowerShell shims.

---

## 14. CI / GitHub Actions

Two assignment-specific execution approaches were implemented.

### GitHub-hosted workflow

The hosted regression workflow executes the assignment-owned Playwright suite on GitHub infrastructure.

During hosted UI execution, the public Toolshop site presented Cloudflare security verification / human verification to the hosted runner. The same interception occurred across hosted-runner experiments and is classified as an **external infrastructure/security-layer limitation**, not a Toolshop functional defect and not a Playwright assertion defect.

### Self-hosted Windows workflow

A manually triggered `[self-hosted, Windows, X64]` workflow supports CLEAN or BUGGY selection and executes the same repository tests with Playwright reports/results uploaded as artifacts.

Manual triggering is intentional because the repository is public and the runner is a personal machine.

### Reviewer recommendation

Docker is the preferred portable reviewer execution path because it does not require access to the author's self-hosted runner and avoids dependence on the GitHub-hosted network identity used by Cloudflare.

---

## 15. Supplementary MCP and GitHub Cloud Agent POCs

MCP is **not required to run the regression suite** and is not a dependency of the framework. It was evaluated as an additional AI-assisted capability after the core assignment implementation was complete.

### Playwright MCP POC

The Microsoft Playwright MCP server was installed in VS Code and used through Copilot Agent mode to open the live CLEAN Toolshop application and report the page title. The live browser interaction completed without modifying repository files.

Purpose: demonstrate browser/tool interaction through MCP against the real CLEAN application.

### GitHub MCP POC

The GitHub MCP server was installed and used in read-only mode to query the current GitHub repository and open pull-request state.

Purpose: demonstrate natural-language repository interaction without modifying code, commits or branches.

### GitHub Cloud Agent POC

The repository-defined **Review Tests** custom agent was invoked from GitHub's cloud Agents experience against the product-detail/add-to-cart UI test implementation. The cloud agent read the repository governance, Toolshop knowledge, strategy and framework files and produced structured review findings without modifying the repository.

Purpose: demonstrate that the repository's custom QA agents are reusable beyond the local VS Code session.

These POCs are supplementary evidence only. The Playwright regression remains independently executable without MCP or cloud-agent access.

---

## 16. Evidence and reports

Key submission artifacts include:

- `docs/ai-knowledge/` — curated Toolshop domain/business/API/UI knowledge.
- `docs/generated/test-scenarios/` — functional scenario design and technique traceability.
- `docs/generated/test-strategy/test-strategy.md` — detailed agent-produced strategy/layer decisions.
- `TEST_STRATEGY_CONCISE.md` — concise assessment strategy.
- `TEST_SUMMARY.md` — release-oriented test summary.
- `AI_USAGE.md` — AI usage, human verification and corrections.
- `REGRESSION_EXECUTION_SUMMARY.md` — CLEAN/BUGGY/Docker/CI execution interpretation.
- `BUG_REPORTS_INDEX.md` — defect-evidence map.
- `MANUAL_EXPLORATORY_FINDINGS.md` — pre-automation exploratory findings index.
- `Manual Exploratory Toolshop Buggy_Consolidated_Bug_Report.xlsx` — consolidated manual exploratory issue register.
- Automation BUGGY Defect & Observation Log — detailed automation-driven defect evidence.
- Automation defect-mapping spreadsheet — failed scenario → root cause → defect mapping.
- Playwright HTML reports / `test-results` artifacts where retained.

---

## 17. Key engineering decisions

- CLEAN Sprint 5 remains the behavioural oracle unless a CLEAN defect is independently proven.
- BUGGY behaviour never becomes expected behaviour merely to make a test pass.
- API setup reduces UI setup cost but never replaces required browser assertions.
- Dynamic IDs/test data are preferred over brittle fixed data.
- `APIRequestContext` is used for API and hybrid scenarios.
- POM is used where page/flow reuse justifies it; business assertions remain in specs.
- Playwright-managed Chromium is used across local, Docker and CI/self-hosted execution.
- One worker is used for the stable take-home regression to reduce false environment/load classifications.
- Exact money assertions are preferred over approximate or tautological checks.
- Cascading failures are consolidated by root cause.
- Expected assertions are never weakened simply to make BUGGY green.

---

## 18. Assumptions and limitations

- CLEAN Sprint 5 is the behavioural oracle unless a CLEAN defect is independently proven.
- Public environment availability and security controls are external dependencies.
- The assessment intentionally implements a focused, high-value regression slice rather than exhaustive Toolshop coverage.
- Broad cross-browser/device coverage, formal performance/load testing, full WCAG audit, deep penetration testing and destructive concurrency testing are outside the time-boxed scope.
- The self-hosted runner is demonstration evidence, not a reviewer dependency.
- MCP and GitHub Cloud Agents are supplementary POCs, not regression execution dependencies.

---

## 19. With another day

The next cycle would prioritise:

- broader cross-browser/device coverage,
- focused accessibility testing,
- controlled API/performance latency checks,
- expanded authorization/security misuse cases,
- automation of remaining high-value exploratory scenarios,
- and improved hosted-CI resilience where the public site's bot protection permits legitimate automation.

---

## 20. Submission note

The BUGGY regression is **expected to contain both green and red tests**. A completely green BUGGY run would defeat the purpose of this assessment because confirmed regressions must remain pinned by correct expected assertions until the product is fixed.
