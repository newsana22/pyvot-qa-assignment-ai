# Toolshop – Manual Exploratory Findings

## 1. Purpose

This document summarizes the **manual exploratory testing stream** completed against the Toolshop application.

The purpose of this work was to understand expected behaviour in the CLEAN environment, manually explore the deliberately BUGGY environment using CLEAN as the behavioural reference, reproduce observable differences, and capture evidence before building the structured multi-agent automation workflow.

The individual manual bug documents remain the detailed source evidence. This document provides a reviewer-friendly overview and explains how manual exploration fits into the overall assessment.

---

## 2. Exploration Chronology

Manual exploration was intentionally performed **before the AI-assisted scenario-generation and automation workflow**.

```text
Understand CLEAN Toolshop
        ↓
Explore important CLEAN user journeys
        ↓
Use CLEAN behaviour as reference
        ↓
Explore BUGGY manually
        ↓
Reproduce observable differences
        ↓
Capture individual defect evidence
        ↓
Consolidate exploratory findings
        ↓
Build curated QA knowledge
        ↓
Create Scenarios
        ↓
Test Strategy
        ↓
Generate Playwright Tests
        ↓
Review Tests
        ↓
Execute CLEAN and BUGGY Regression
```

This chronology is important because the exploratory defects were not simply generated from automated failures.

They represent a separate, human-led investigation stream.

---

## 3. Exploration Approach

The exploratory approach focused on observable application behaviour.

For important areas, the process was:

```text
Observe CLEAN behaviour
        ↓
Understand expected user flow
        ↓
Perform equivalent action in BUGGY
        ↓
Compare observable result
        ↓
Repeat to confirm reproducibility
        ↓
Capture evidence
        ↓
Document the finding
```

The deliberately BUGGY implementation itself was treated as the **target under test**, not as the source of expected behaviour.

Known BUGGY implementation details or answer-key material were not used as the basis for discovering defects.

---

## 4. Behavioural Oracle

The CLEAN Sprint 5 application was used as the primary behavioural reference together with confirmed requirements and observable contracts.

Manual comparison focused on differences that could be demonstrated through user-visible behaviour or API/application behaviour.

Where evidence was insufficient to prove that a difference violated a requirement, the finding was not automatically promoted to a confirmed defect.

---

## 5. Exploratory Coverage

Manual exploration covered important customer-facing areas including:

| Area | Exploratory Focus |
|---|---|
| Navigation / Categories | Category navigation and expected browsing behaviour |
| Product Catalogue | Product presentation, filtering and sorting |
| Product Detail | Product information, quantity controls and Add to Cart behaviour |
| Cart | Cart state, totals, item updates/removal and navigation |
| Authentication | Login and user-facing authentication behaviour |
| User / Account | User information and account-related behaviour |
| Checkout | Billing fields, controls and checkout progression |
| Payment | Payment methods, dropdowns and conditional fields |
| Product Comparison | Comparison/specification presentation |
| Routing / Navigation | Page navigation and redirect behaviour |
| UI Content | Labels, text, titles, messages and visible presentation |

The exploration was intentionally focused on the core shopping journey and high-value customer behaviour rather than attempting exhaustive testing of every possible UI permutation.

---

## 6. Manual Exploratory Evidence

The exploratory evidence is maintained as a collection of individual bug documents.

The evidence set contains approximately **22 individual Word bug reports**, with one bug represented by one bug document.

A consolidated exploratory bug-report workbook is also maintained to make the findings easier to review.

The individual reports remain the detailed evidence source for reproduction steps, expected behaviour, actual behaviour and captured screenshots or observations.

---

## 7. Findings by Functional Area

The following sections summarize the areas represented in the manual exploratory evidence.

These summaries do not replace the individual defect documents and do not introduce new defect IDs.

### 7.1 Category Navigation

Manual exploration identified unexpected behaviour associated with category navigation in the BUGGY application.

The detailed reproduction evidence is retained in the corresponding exploratory bug document.

---

### 7.2 Brand Filtering

Brand-filter behaviour was manually compared between CLEAN and BUGGY.

An observable difference was documented in the exploratory evidence.

---

### 7.3 Product Sorting

Product sorting behaviour was manually exercised and compared against the reference application.

The resulting difference was captured as an individual exploratory finding.

---

### 7.4 Product Quantity Controls

Quantity controls on product-related flows were manually exercised.

Unexpected quantity-control behaviour in BUGGY was documented with reproduction evidence.

---

### 7.5 Add to Cart Behaviour

The Add to Cart journey was manually explored.

The evidence set includes a finding associated with Add to Cart behaviour and an error-toast/message condition.

This manual evidence remains separate from later automation scenarios that also exercise product/cart behaviour.

---

### 7.6 Cart Total Presentation

A cart-total issue was observed where the displayed value included:

```text
$00.00
```

The behaviour was captured during manual exploration and documented separately.

---

### 7.7 Continue Shopping Behaviour

The cart experience was inspected for expected navigation controls.

A finding related to the expected **Continue Shopping** behaviour/control was captured in the exploratory evidence.

---

### 7.8 Cart Title / Presentation

The cart page presentation was manually reviewed.

An issue related to the cart title/presentation was documented.

---

### 7.9 User-Facing Text

Manual exploration identified a visible text issue involving:

```text
Contakt
```

The issue was recorded as a UI/content finding.

---

### 7.10 User Data Behaviour

A user-facing condition involving **user data not found** behaviour was captured during exploration.

The detailed context and reproduction steps remain in the corresponding bug document.

---

### 7.11 Cart Removal and Update Behaviour

Cart item update/removal behaviour was manually exercised.

Unexpected behaviour was captured in the exploratory evidence.

---

### 7.12 Billing Fields and Checkout Controls

Checkout/billing behaviour was explored manually.

The evidence includes findings related to billing fields and checkout button/control behaviour.

---

### 7.13 Login UI

Authentication was also examined from the user-interface perspective.

A separate exploratory finding documents the observed login UI behaviour.

---

### 7.14 Payment Method Controls

Payment behaviour was explored from the UI.

The evidence includes findings related to:

- payment method controls;
- dropdown behaviour;
- conditional payment fields.

These findings are distinct from the later API automation defects involving invalid credit-card validation.

---

### 7.15 Product Comparison / Specifications

Product comparison/specification behaviour was explored.

Missing or unexpected comparison/specification presentation was captured as exploratory evidence.

---

### 7.16 Sensitive Password Representation

The exploratory evidence includes a finding involving password-hash exposure/representation.

The individual report contains the exact observed behaviour and should be used as the detailed evidence source.

---

### 7.17 Home / Redirect Behaviour

Navigation back to or through the Home route was manually exercised.

A redirect/navigation issue was captured as an exploratory finding.

---

## 8. Why Manual Findings Remain Separate

The manual exploratory findings are intentionally not renumbered as `BUG-001` through `BUG-009`.

Those IDs belong to the **automation-derived BUGGY root-defect stream**.

The separation preserves discovery chronology:

```text
Manual Exploration
        ↓
Manual Exploratory Findings

          later

Automation Execution
        ↓
Failure Triage
        ↓
Automation-Derived BUG-001 ... BUG-009
```

Combining both streams into one numbering scheme could incorrectly imply that automation discovered defects that had already been found manually.

It could also cause the same root behaviour to be counted twice.

---

## 9. Relationship to Automation

After manual exploration, the assessment moved into structured scenario design and automation.

The automation workflow used:

```text
Curated Toolshop Knowledge
        ↓
Create Scenarios Agent
        ↓
Generated Scenario Catalogue
        ↓
Test Strategy Agent
        ↓
Risk-Based Strategy
        ↓
Generate Tests Agent
        ↓
Playwright API / UI / Hybrid Tests
        ↓
Review Tests Agent
        ↓
Human Review and Execution
```

The automated suite therefore complements the exploratory evidence rather than replacing it.

Some automated scenarios may exercise functionality that was also manually explored.

Where both streams identify the same underlying problem, the evidence should be cross-referenced rather than treated as two independent defects.

---

## 10. Manual Verification of Automation Findings

A second form of manual testing occurred **after automation execution**.

This should not be confused with the initial exploratory phase.

The chronology is:

```text
Phase A
Manual CLEAN → BUGGY exploration
        ↓
Exploratory bug reports

Phase B
Structured scenario design and automation
        ↓
CLEAN / BUGGY regression

Phase C
Manual verification of automation-exposed failures
        ↓
Confirmed automation-derived root defects
```

This distinction demonstrates that manual testing contributed both to **initial defect discovery** and to **later verification of automation findings**.

---

## 11. Evidence Streams

The final assessment therefore contains three complementary evidence streams.

| Evidence Stream | Purpose |
|---|---|
| Manual Exploratory Findings | Human-led CLEAN-to-BUGGY exploration performed before structured automation |
| Automated Regression & Defect Mapping | Detect differences systematically and map failures to root causes |
| Manual Verification of Automation Findings | Independently reproduce automation-exposed candidate defects before confirmation |

Together, these provide stronger evidence than relying on a single testing method.

---

## 12. Defect Reporting Principles Used During Exploration

### Reproducibility

A finding should be repeatable and understandable from the evidence.

### CLEAN Comparison

Expected behaviour was grounded in the CLEAN application and confirmed project information rather than inferred from the defective implementation.

### One Finding, Clear Evidence

Individual exploratory issues were captured in separate bug documents to make reproduction easier for a reviewer or developer.

### No Artificial Defect Inflation

Similar symptoms or later automation failures were not automatically counted as additional defects.

### Observable Behaviour

The focus remained on behaviour that could be demonstrated through the running application.

### Honest Scope

The exploration represents a focused assessment of important Toolshop journeys, not a claim of exhaustive application coverage.

---

## 13. Supporting Artifacts

The manual exploratory stream is supported by the following assessment artifacts:

| Artifact | Purpose |
|---|---|
| Individual manual exploratory bug documents | Detailed evidence for each manually observed issue |
| Consolidated manual exploratory bug-report workbook | Reviewer-friendly consolidated view of exploratory findings |
| `BUG_REPORTS_INDEX.md` | Overall index separating manual, automation-derived, CLEAN and observation streams |
| `TEST_SUMMARY.md` | Overall quality and regression summary |
| `REGRESSION_EXECUTION_SUMMARY.md` | Detailed CLEAN/BUGGY execution and root-cause triage |
| Automation defect-mapping workbook | Maps automated failures to confirmed root causes |
| Automation BUGGY defect/observation log | Detailed automation-derived findings |

---

## 14. Reviewer Guidance

For manual exploratory findings, the reviewer should use the **individual bug documents as the detailed source evidence**.

This summary is intended to answer four questions quickly:

1. **When were the findings discovered?**  
   During manual CLEAN-to-BUGGY exploration before the structured multi-agent automation workflow.

2. **How were they discovered?**  
   By manually exercising important Toolshop journeys and comparing observable BUGGY behaviour with CLEAN.

3. **Are these the same as BUG-001 through BUG-009?**  
   No. BUG-001 through BUG-009 are the separately consolidated automation-derived root defects.

4. **Can the two evidence streams overlap?**  
   Yes. If both expose the same underlying behaviour, they should be cross-referenced rather than counted twice.

---

## 15. Final Manual Exploration Snapshot

| Item | Status |
|---|---|
| CLEAN application explored before BUGGY | **Yes** |
| BUGGY manually explored using CLEAN as reference | **Yes** |
| Individual exploratory bug evidence created | **Yes** |
| Approximate individual manual bug reports | **~22** |
| Consolidated exploratory workbook available | **Yes** |
| Manual exploration performed before multi-agent automation workflow | **Yes** |
| Manual findings kept separate from automation BUG IDs | **Yes** |
| Automation findings later manually verified | **Yes** |
| Known BUGGY source/answer-key used for discovery | **No** |

---

## 16. Conclusion

Manual exploratory testing formed the **first defect-discovery stage** of this assessment.

The CLEAN application was understood first, the BUGGY application was then manually explored against that reference, and reproducible findings were captured as individual evidence documents.

Only after this exploratory phase was the structured multi-agent workflow used for scenario generation, risk-based strategy, Playwright implementation, independent review and regression execution.

Maintaining manual exploratory findings separately from automation-derived root defects preserves the chronology of the work, avoids duplicate defect counting, and gives the reviewer clear evidence of both human-led exploratory testing and systematic automated regression testing.
