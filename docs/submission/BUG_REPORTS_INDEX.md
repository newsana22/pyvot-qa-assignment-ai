# Toolshop – Bug Reports Index

## 1. Purpose

This document provides a reviewer-friendly index of defects and observations identified during the Toolshop assessment.

The findings are intentionally separated into distinct evidence streams:

1. **Automation-derived BUGGY defects** – exposed by the Playwright regression suite, triaged by root cause, and manually verified.
2. **CLEAN discrepancy** – a confirmed boundary-rule discrepancy observed in the CLEAN reference environment.
3. **Observations** – differences that were recorded but not promoted to confirmed defects because stronger requirement evidence would be needed.
4. **Manual exploratory findings** – defects discovered during manual CLEAN-to-BUGGY exploration before the structured multi-agent automation workflow was built.

This separation prevents duplicate reporting and avoids treating every automated failure as a unique product defect.

---

## 2. Defect Classification Model

The assessment used the following classification approach:

```text
Observed Behaviour / Automated Failure
                ↓
        Reproduce and Investigate
                ↓
        Compare with CLEAN / Contract
                ↓
          Identify Root Cause
                ↓
     ┌──────────┼───────────┐
     ▼          ▼           ▼
 Confirmed   Observation   Test /
  Defect                   Environment Issue
```

A failed test was treated as an **investigation point**, not automatically as a unique defect.

---

## 3. Automation-Derived BUGGY Defects

The final BUGGY regression result was:

```text
11 passed
37 failed
1 skipped
49 total
```

The **37 failed tests do not represent 37 unique defects**.

After failure triage, cascading-failure analysis, CLEAN/BUGGY comparison, and manual verification, the automation-exposed failures were consolidated into **9 confirmed BUGGY root defects**.

| ID | Defect | Severity / Priority | Primary Area | Status |
|---|---|---|---|---|
| BUG-001 | Product GET API omits the expected `in_stock` property | High / High | Product API / Contract | Confirmed |
| BUG-002 | Eco-friendly product classification is incorrect/inverted | High / High | Product / Financial Rules | Confirmed |
| BUG-003 | Payment API accepts an expired credit-card expiration date | High | Checkout / Payment API | Confirmed |
| BUG-004 | Payment API accepts a malformed credit-card number | High | Checkout / Payment API | Confirmed |
| BUG-005 | Cart creation API is unavailable and Cart section is missing from BUGGY Swagger | Critical / High | Cart API | Confirmed |
| BUG-006 | Registration API rejects a valid nested address payload accepted by CLEAN | High | Authentication / Registration API | Confirmed |
| BUG-007 | Invoice API returns an existing invoice for a non-existent invoice ID | — | Invoice API | Confirmed |
| BUG-008 | Direct authentication SPA route `/auth/login` returns Apache 404 | — | Authentication / Routing | Confirmed |
| BUG-009 | Direct product-detail URL returns Apache 404 for a valid product | — | Product / Routing | Confirmed |

Where severity/priority was not independently established in the defect evidence, it is intentionally left unspecified rather than inferred.

---

## 4. BUG-001 – Product GET API Contract Regression

**Finding:** Product GET API omits the expected `in_stock` property.

**Affected area:** Product API / catalogue discovery

The CLEAN product response exposes the expected `in_stock` property. The BUGGY response omits this property and exposes different stock information.

This defect is especially important because product-discovery helpers rely on the confirmed contract to identify eligible products.

### Cascading impact

```text
BUG-001
   ↓
Product discovery cannot identify expected in-stock products
   ↓
Multiple dependent scenarios fail before their intended rule
```

The automation helper was **not changed to normalize the BUGGY contract** because doing so would hide the regression.

Multiple downstream failures were therefore mapped back to this root cause instead of being reported as separate defects.

---

## 5. BUG-002 – Incorrect Eco-Friendly Classification

**Finding:** Eco-friendly product classification is incorrect/inverted.

**Affected area:** Product classification / financial rules

CLEAN and BUGGY return conflicting eco classifications for known products.

Observed examples include:

- a D-rated Sledgehammer classified as non-eco in CLEAN but eco in BUGGY;
- a B-rated Wood Saw classified as eco in CLEAN but non-eco in BUGGY.

Because eco classification participates in business and financial behaviour, the issue can affect downstream calculations and rule validation.

---

## 6. BUG-003 – Expired Credit Card Accepted

**Finding:** Payment API accepts an expired credit-card expiration date.

**Affected area:** Checkout / Payment API

The payment validation scenario expects invalid/expired card details to be rejected.

CLEAN rejects the invalid payment request with the expected validation behaviour, while BUGGY accepts the expired expiration date.

This was mapped to the checkout/payment validation coverage, including scenario **CKO-017**.

---

## 7. BUG-004 – Malformed Credit Card Number Accepted

**Finding:** Payment API accepts a malformed credit-card number.

**Affected area:** Checkout / Payment API

The malformed card-number scenario expects invalid card data to be rejected.

CLEAN rejects the malformed input, while BUGGY accepts it.

This was mapped to checkout/payment validation scenario **CKO-018**.

---

## 8. BUG-005 – Cart Creation API Unavailable

**Finding:** `POST /carts` is unavailable in BUGGY and the Cart section is missing from BUGGY Swagger.

**Affected area:** Cart API

BUGGY returns **404** for cart creation where the corresponding cart capability is available in the reference environment.

This is a high-impact root cause because several scenarios require a cart before their intended business rule can be tested.

Examples of affected downstream coverage include financial and hybrid scenarios such as:

- FIN-002;
- FIN-012;
- F-UI-04.

Those dependent failures should not automatically be reported as independent financial defects when the intended rule was never reached.

---

## 9. BUG-006 – Valid Registration Payload Rejected

**Finding:** Registration API rejects a valid nested address payload accepted by CLEAN.

**Affected area:** Authentication / Registration API

A valid registration request using the expected nested address structure succeeds in CLEAN but receives a **422** response in BUGGY.

The defect is mapped to registration scenario **AUTH-011**.

The CLEAN request/response behaviour was retained as the expected contract rather than modifying the test payload to accommodate BUGGY.

---

## 10. BUG-007 – Non-Existent Invoice ID Returns Existing Invoice

**Finding:** Invoice API returns an existing invoice when a non-existent invoice ID is requested.

**Affected area:** Invoice API

The requested resource does not exist, but BUGGY returns invoice data rather than the expected not-found behaviour.

This is treated as an independent confirmed BUGGY defect rather than a cascading symptom of another failure.

---

## 11. BUG-008 – Direct Authentication Route Returns Apache 404

**Finding:** Direct navigation to `/auth/login` returns Apache 404 in BUGGY.

**Affected area:** Authentication / SPA routing

Direct navigation works in CLEAN.

In BUGGY:

```text
/auth/login
→ Apache 404
```

while hash-based navigation:

```text
/#/auth/login
```

remains reachable.

The issue therefore represents a direct-route handling regression rather than simply an invalid login-page selector.

---

## 12. BUG-009 – Direct Product Detail Route Returns Apache 404

**Finding:** Direct product-detail URL returns Apache 404 for a valid product in BUGGY.

**Affected area:** Product / SPA routing

A valid direct product-detail route works in CLEAN but fails when accessed directly in BUGGY.

This was classified as an independent routing defect after confirming that the product itself is valid.

---

## 13. CLEAN Environment Discrepancy

The CLEAN application is the primary behavioural reference, but one independently confirmed boundary discrepancy was identified.

| ID | Finding | Severity | Priority | Area | Status |
|---|---|---|---|---|---|
| CLEAN-BUG-001 | Registration API accepts a customer older than the maximum allowed age | Medium | Medium | Authentication / Registration API | Confirmed CLEAN discrepancy |

### CLEAN-BUG-001 – Registration Maximum-Age Boundary

The documented registration rule defines a valid date-of-birth range corresponding to an age of **18–75 years**.

The maximum-age boundary scenario used:

```text
DOB: 1950-01-01
Expected: 422 / customer not created
Actual CLEAN: 201 / customer created
```

The discrepancy was reproduced through automation and manual verification.

The expected business rule was **not changed merely to make CLEAN green**.

The scenario remains explicitly isolated as the single known CLEAN skip in the final regression baseline.

---

## 14. Observations

Some differences were intentionally retained as observations rather than promoted to confirmed defects.

| ID | Observation | Reason for Separate Classification |
|---|---|---|
| OBS-001 | BUGGY Swagger does not document the `page` parameter although direct `?page=2` usage works | Documentation/API difference; runtime pagination still works |
| OBS-002 | CLEAN catalogue returned 50 products while BUGGY returned 26 during investigation | Difference observed, but stronger requirement evidence is needed before declaring the catalogue size itself defective |

This distinction supports evidence-based defect reporting and avoids turning every environment difference into a defect.

---

## 15. Manual Exploratory Findings

Manual exploratory testing was performed **before the structured multi-agent automation workflow was built**.

The sequence was:

```text
Understand CLEAN Toolshop
        ↓
Explore BUGGY manually using CLEAN as reference
        ↓
Reproduce observable differences
        ↓
Capture individual manual defect evidence
        ↓
Later build structured scenario / strategy / automation workflow
```

The manual exploratory findings are intentionally maintained as a **separate defect evidence stream** from BUG-001 through BUG-009.

Individual exploratory evidence documents cover observed behaviour across areas including:

- category/navigation behaviour;
- brand filtering;
- product sorting;
- quantity controls;
- Add to Cart behaviour and error messaging;
- cart totals and cart presentation;
- Continue Shopping behaviour;
- cart title/presentation;
- user-facing text issues;
- user/account behaviour;
- cart removal/update behaviour;
- billing fields and checkout controls;
- login UI behaviour;
- payment controls and conditional fields;
- product comparison/specification behaviour;
- routing/navigation behaviour;
- other reproducible UI/application findings captured during exploration.

The detailed exploratory reports remain the source evidence for those findings.

They are not automatically renumbered into the automation BUG defect sequence because doing so could create duplicates or incorrectly imply that automation discovered them first.

---

## 16. Relationship Between Manual and Automation Findings

The assessment maintains three complementary evidence streams:

```text
Manual Exploration
CLEAN → BUGGY
      │
      ▼
Exploratory Defect Reports


Automated Regression
CLEAN → BUGGY
      │
      ▼
Failure Triage
      │
      ▼
Root-Cause Mapping


Automation Finding
      │
      ▼
Manual Reproduction
      │
      ▼
Confirmed BUGGY Defect
```

Where manual exploration and automation expose the same underlying behaviour, the evidence can be cross-referenced rather than counted twice.

---

## 17. Defect Mapping and Traceability

Automation failures are tracked using a dedicated defect-mapping workbook.

The mapping captures:

```text
Main Automation Case
        ↓
Scenario / Subcase
        ↓
Initial Result
        ↓
Failure Point / Root Cause
        ↓
Mapped Defect
        ↓
Related Defect
        ↓
New Defect?
        ↓
Business Rule Reached?
        ↓
Environment / Evidence / Notes
```

This mapping is particularly useful when one root defect prevents multiple tests from reaching their intended business assertion.

---

## 18. Defect Reporting Principles

The following principles were applied consistently:

### Truth over volume

A smaller number of proven root-cause defects is more useful than inflating the defect count from every failed automated test.

### Reproducibility

A reported defect should be reproducible and supported by observable evidence.

### Correct expected results

Expected behaviour is not changed simply because the BUGGY application behaves differently.

### Root-cause consolidation

Multiple failures caused by the same underlying regression are mapped to the same defect where appropriate.

### Manual verification

Automation-derived candidate defects are manually reproduced before final confirmation.

### Observations remain observations

Differences without sufficient requirement evidence are not promoted to defects simply to increase finding volume.

### Separate evidence streams

Manual exploratory findings and automation-derived findings remain distinguishable so the chronology and discovery method stay clear.

---

## 19. Reviewer Navigation

The defect evidence should be reviewed together with the supporting assessment artifacts.

| Artifact | Purpose |
|---|---|
| `TEST_SUMMARY.md` | Overall quality and regression summary |
| `REGRESSION_EXECUTION_SUMMARY.md` | CLEAN/BUGGY execution and failure-triage details |
| `TEST_STRATEGY.md` | Risk-based scope, test design and automation approach |
| `AI_USAGE.md` | AI-assisted QA workflow, agents, governance and human controls |
| Automation defect-mapping workbook | Maps failed scenarios to root causes and defect IDs |
| Automation BUGGY defect/observation log | Detailed automation-derived defect evidence |
| Manual exploratory defect reports | Individual evidence for manually discovered BUGGY findings |
| Manual regression evidence | Execution/reproduction evidence for selected regression scenarios |

---

## 20. Final Defect Snapshot

| Classification | Count / Status |
|---|---|
| Final Playwright tests/subcases | **49** |
| CLEAN result | **48 Passed / 0 Failed / 1 Skipped** |
| BUGGY result | **11 Passed / 37 Failed / 1 Skipped** |
| Confirmed automation-derived BUGGY root defects | **9** |
| Known CLEAN discrepancy | **1** |
| Separate observations | **2** |
| Manual exploratory findings | **Maintained separately with individual evidence** |
| Automation-derived confirmed defects manually verified | **Yes** |
| Failed tests treated as unique defects | **No** |

---

## 21. Conclusion

The defect index is intentionally organized around **root cause, evidence, and traceability** rather than raw failure count.

The BUGGY regression produced 37 failing automated tests, but investigation demonstrated that several failures were cascading symptoms of shared defects or were blocked before reaching their intended business rule.

The final automation-derived defect set therefore contains **9 confirmed BUGGY root defects**, together with **1 separately documented CLEAN discrepancy** and **2 observations**.

Manual exploratory findings remain separately documented because they were discovered before the structured automation workflow and provide an additional independent source of evidence.

This approach keeps the submission transparent: the reviewer can distinguish what was manually discovered, what automation exposed, what was manually verified, and what was deliberately retained only as an observation.
