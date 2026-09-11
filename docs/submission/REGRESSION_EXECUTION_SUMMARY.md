# Toolshop – Regression Execution Summary

## 1. Purpose

This document summarizes execution of the final Playwright regression suite against the Toolshop CLEAN and deliberately BUGGY environments.

The same implemented regression scope was executed against both environments so that expected behaviour remained consistent. Assertions were not weakened or rewritten simply to make the BUGGY environment pass.

The final executable regression suite contains **49 tests/subcases**.

---

## 2. Environment Under Test

| Environment | UI | API | Purpose |
|---|---|---|---|
| CLEAN | `https://practicesoftwaretesting.com` | `https://api.practicesoftwaretesting.com` | Behavioural reference / regression baseline |
| BUGGY | `https://with-bugs.practicesoftwaretesting.com` | `https://api-with-bugs.practicesoftwaretesting.com` | Deliberately defective target under test |

The CLEAN environment was used as the primary behavioural oracle together with confirmed requirements and API contracts.

---

## 3. Final Execution Baseline

| Environment | Passed | Failed | Skipped | Total | Result |
|---|---:|---:|---:|---:|---|
| CLEAN | 48 | 0 | 1 | 49 | Stable baseline with one documented CLEAN discrepancy |
| BUGGY | 11 | 37 | 1 | 49 | Expected mixed green/red result requiring defect triage |

The **37 BUGGY failures do not represent 37 unique defects**. Multiple automated scenarios can fail because of the same underlying product defect.

---

## 4. CLEAN Regression Execution

Final CLEAN result:

```text
48 passed
0 failed
1 skipped
49 total
```

The CLEAN suite established the reference regression baseline for the implemented scope.

The single skipped scenario relates to the documented registration maximum-age discrepancy:

**CLEAN-BUG-001 – Registration API accepts a customer older than the maximum allowed age.**

The expected business rule was preserved rather than changing the test merely to obtain a completely green result.

---

## 5. BUGGY Regression Execution

The same regression suite was executed against the BUGGY environment.

Final BUGGY result:

```text
11 passed
37 failed
1 skipped
49 total
```

This mixed result is intentional for a deliberately defective application.

- Passing scenarios demonstrate behaviour that remains operational.
- Failing scenarios identify differences requiring investigation.
- The skipped scenario remains the known CLEAN age-boundary discrepancy and is not counted as a BUGGY defect.

---

## 6. Failure Triage Approach

Every red automated result was treated as an investigation point.

```text
Automated Failure
        ↓
Identify Exact Failure Point
        ↓
Determine Whether Business Rule Was Reached
        ↓
Compare CLEAN and BUGGY Behaviour
        ↓
Check API / UI Contract
        ↓
Identify Possible Root Cause
        ↓
Check for Cascading Failures
        ↓
Manual Reproduction
        ↓
Confirmed Defect / Existing Defect / Observation / Test Issue
```

This process prevented failed-test count from being incorrectly reported as defect count.

A separate defect-mapping tracker records the automation case, scenario/subcase, initial result, failure point/root cause, mapped defect, whether the issue is new, whether the intended business rule was reached, and supporting evidence.

---

## 7. Confirmed Automation-Derived BUGGY Defects

After root-cause triage and manual verification, the automation-exposed failures were consolidated into the following confirmed BUGGY defects.

| ID | Confirmed Finding | Impact |
|---|---|---|
| BUG-001 | Product GET API omits the expected `in_stock` property | Breaks the expected product contract and cascades into product-discovery-dependent tests |
| BUG-002 | Eco-friendly product classification is incorrect/inverted | Causes incorrect product classification and financial/business-rule behaviour |
| BUG-003 | Payment API accepts an expired credit-card expiration date | Invalid payment data is accepted |
| BUG-004 | Payment API accepts a malformed credit-card number | Invalid payment data is accepted |
| BUG-005 | Cart creation API is unavailable and Cart section is missing from BUGGY Swagger | Blocks cart-dependent API and hybrid workflows |
| BUG-006 | Registration API rejects a valid nested address payload accepted by CLEAN | Valid customer registration contract fails |
| BUG-007 | Invoice API returns an existing invoice for a non-existent invoice ID | Incorrect invoice retrieval behaviour |
| BUG-008 | Direct authentication SPA route `/auth/login` returns Apache 404 | Direct navigation to a valid application route fails |
| BUG-009 | Direct product-detail URL returns Apache 404 for a valid product | Direct navigation to valid product detail fails |

These are root-cause findings, not a one-to-one conversion of automated failures into defects.

---

## 8. Observations Kept Separate from Confirmed Defects

Not every difference was promoted to a product defect.

| ID | Observation | Classification |
|---|---|---|
| OBS-001 | BUGGY Swagger does not document the `page` parameter although direct `?page=2` usage works | Documentation/API observation |
| OBS-002 | CLEAN catalogue returned 50 products while BUGGY returned 26 during investigation | Observation requiring stronger requirement evidence before defect classification |

Keeping observations separate avoids overstating findings when evidence is insufficient.

---

## 9. Cascading Failure Example

One important triage example was the product contract difference.

The automation expected the confirmed product property:

```text
in_stock
```

The BUGGY Product GET API omitted that property and exposed different stock information.

Several tests relied on product discovery to locate an eligible in-stock/non-rental product. As a result, those tests could fail during setup/discovery before reaching their intended business assertion.

The helper was **not changed simply to normalize the BUGGY response** because doing so would hide the contract regression.

Instead:

```text
Contract regression
        ↓
BUG-001
        ↓
Multiple dependent test failures
        ↓
Mapped as cascading symptoms
```

This preserved the regression signal while avoiding duplicate defect reporting.

---

## 10. Business Rule Reachability

During triage, failures were also classified according to whether the intended business rule was actually reached.

For example:

- a payment assertion that executes and receives an incorrect status directly reaches the payment business rule;
- a financial scenario that cannot create a cart because `POST /carts` returns 404 does **not** reach the downstream financial rule;
- a product UI scenario that cannot discover a valid product because of a product API contract regression may be blocked before its intended UI assertion.

This distinction makes the execution report more accurate and helps developers identify primary versus downstream failures.

---

## 11. Local Execution

The suite supports environment-specific execution from the repository.

```powershell
npm.cmd run test:clean
npm.cmd run test:buggy
npm.cmd run test:buggy:api
npm.cmd run test:buggy:ui
```

On Windows, `npm.cmd` / `npx.cmd` can be used where PowerShell execution policy prevents direct execution of npm PowerShell wrappers.

The framework uses Playwright-managed Chromium rather than depending on a separately installed Google Chrome binary.

---

## 12. Docker Regression Execution

The Playwright test runner was also containerized.

The Toolshop application itself is **not** containerized by this assessment. Docker is used to provide a reproducible Playwright execution environment against the existing public CLEAN and BUGGY applications.

Commands:

```powershell
npm.cmd run docker:buildTest
npm.cmd run docker:cleanTest
npm.cmd run docker:buggyTest
```

Confirmed Docker results:

| Environment | Passed | Failed | Skipped | Total |
|---|---:|---:|---:|---:|
| CLEAN | 48 | 0 | 1 | 49 |
| BUGGY | 11 | 37 | 1 | 49 |

The Docker execution reproduced the established local regression baselines.

---

## 13. GitHub Actions Execution

Dedicated assignment workflows were implemented separately from the application's original workflows.

The assignment supports:

- GitHub-hosted Playwright execution;
- self-hosted Windows Playwright execution;
- CLEAN/BUGGY environment parameterization;
- API and UI regression execution.

The assignment workflows were kept isolated from the original Toolshop deployment/release automation to avoid unintended deployment side effects.

---

## 14. GitHub-Hosted Runner Limitation

GitHub-hosted UI execution encountered Cloudflare/security verification when accessing the public Toolshop application.

The verification layer prevented some browser tests from reaching the actual application.

The issue was reproduced on hosted-runner attempts and was therefore classified as an **infrastructure/security-layer constraint**, not automatically as:

- an application defect;
- a Playwright defect;
- a selector defect; or
- a reason to weaken the test.

Changing hosted runner operating system/browser configuration did not remove the external verification constraint.

The tests were therefore left semantically correct rather than modified to bypass the public site's security mechanism.

---

## 15. Self-Hosted Runner Execution

A manually triggered self-hosted Windows workflow was used as an alternative execution path.

The self-hosted execution successfully reproduced the expected regression behaviour:

- CLEAN reached the established green baseline;
- BUGGY executed with the expected deliberate red baseline.

This demonstrated that the framework and CI workflow are executable when the runner can reach the application without the hosted-runner security challenge.

---

## 16. Execution Evidence

The regression evidence includes:

- Playwright console results;
- HTML/line reporting;
- screenshots on failure where configured;
- retained video on failure where configured;
- Playwright trace on first retry where configured;
- manual verification evidence;
- defect mapping;
- individual manual exploratory defect reports;
- Docker execution results;
- GitHub Actions execution history.

Evidence is used to support reproduction and root-cause analysis rather than relying only on a pass/fail count.

---

## 17. Manual Verification of Automation Findings

Automation-derived candidate defects were manually verified before being treated as confirmed defects.

The verification approach was:

```text
Automation exposes difference
        ↓
Reproduce independently
        ↓
Compare with CLEAN / confirmed contract
        ↓
Capture observable evidence
        ↓
Confirm root cause classification
        ↓
Report or map to existing defect
```

This additional verification reduces false defect reporting caused by stale data, environment behaviour, test setup, selectors, or cascading failures.

---

## 18. Relationship to Manual Exploratory Testing

Manual exploratory testing and regression execution are intentionally maintained as separate evidence streams.

Manual exploration occurred first:

```text
Understand CLEAN
      ↓
Explore BUGGY manually
      ↓
Capture exploratory findings
```

Structured automation was then designed and executed:

```text
Curated knowledge
      ↓
Scenarios
      ↓
Strategy
      ↓
Automation
      ↓
CLEAN baseline
      ↓
BUGGY execution
      ↓
Triage and manual verification
```

If both streams expose the same underlying behaviour, the findings can be cross-referenced rather than counted twice.

---

## 19. Regression Decision

### CLEAN

**Regression status: PASS with one documented known discrepancy**

```text
48 passed / 0 failed / 1 skipped
```

The implemented regression scope is stable against CLEAN apart from the explicitly isolated registration age-boundary issue.

### BUGGY

**Regression status: FAIL**

```text
11 passed / 37 failed / 1 skipped
```

The BUGGY application contains confirmed high-impact regressions across API contracts, cart creation, payment validation, registration, product classification, invoice behaviour, and direct SPA routing.

The tested BUGGY build is therefore **not release-ready for the implemented regression scope**.

---

## 20. Final Execution Snapshot

| Item | Result |
|---|---|
| Executable Playwright tests/subcases | **49** |
| CLEAN regression | **48 Passed / 0 Failed / 1 Skipped** |
| BUGGY regression | **11 Passed / 37 Failed / 1 Skipped** |
| Docker CLEAN | **48 Passed / 0 Failed / 1 Skipped** |
| Docker BUGGY | **11 Passed / 37 Failed / 1 Skipped** |
| Confirmed automation-derived BUGGY defects | **9** |
| Separate BUGGY observations | **2** |
| Known CLEAN discrepancy | **1** |
| Manual verification of confirmed automation findings | **Performed** |
| Local execution | **Verified** |
| Docker execution | **Verified** |
| GitHub Actions | **Implemented** |
| Self-hosted execution | **Verified** |
| Hosted CI constraint | **Cloudflare/security verification** |
| BUGGY release decision | **FAIL / Not release-ready for tested scope** |

---

## 21. Conclusion

The regression execution achieved its intended purpose: establish a reliable CLEAN baseline, execute the same expectations against the deliberately BUGGY application, preserve meaningful red tests, and convert raw failures into evidence-backed root-cause findings.

The most important execution principle was:

> **Do not make the BUGGY suite green by adapting tests to defective behaviour. Investigate the failure, preserve the correct expectation, and report the proven root cause.**

This allows the suite to function as a genuine regression safety net rather than merely a collection of passing scripts.
