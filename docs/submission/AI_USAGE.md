# AI-Assisted QA Usage

## 1. Purpose

AI was used throughout this assessment as a **QA engineering accelerator**, not as a replacement for testing judgment or as the source of expected application behaviour.

The implementation combines:

-  manual exploration and defect investigation; 
-  a curated Toolshop knowledge layer; 
-  specialized GitHub Copilot QA agents; 
-  shared QA and Playwright engineering instructions; 
-  generated test scenarios and test strategy; 
-  Playwright JavaScript API, UI, and hybrid automation; 
-  an independent AI-assisted test-review stage; 
-  optional MCP integrations for browser and repository interaction; 
-  human verification of application behaviour, automation failures, and reported defects. 

The CLEAN Sprint 5 application and confirmed CLEAN requirements remained the behavioural oracle. AI-generated suggestions were accepted only when they could be supported by requirements, observable CLEAN behaviour, API contracts, or other approved project evidence.

---

## 2. AI-Assisted QA Lifecycle

The assessment followed a staged workflow rather than asking a single AI prompt to generate an automation framework.

```
Understand CLEAN Toolshop
        │
        ▼
Manual Exploration
CLEAN → BUGGY comparison
        │
        ▼
Manual Exploratory Findings
        │
        ▼
Curated Toolshop Knowledge
        │
        ▼
Create Scenarios Agent
        │
        ▼
Generated Test Scenario Catalogue
        │
        ▼
Test Strategy Agent
        │
        ▼
Risk-Based Test Strategy
        │
        ▼
Generate Tests Agent
        │
        ▼
Playwright API / UI / Hybrid Tests
        │
        ▼
Review Tests Agent
        │
        ▼
Human Review
        │
        ▼
CLEAN Regression
        │
        ▼
BUGGY Regression
        │
        ▼
Failure Triage
        │
        ▼
Manual Reproduction
        │
        ▼
Confirmed Defects / Observations
```

This separation was intentional. Scenario design, architecture, implementation, review, execution, and defect classification were treated as different QA responsibilities.

---

## 3. Manual Exploration Before AI-Driven Automation

Before building the multi-agent automation workflow, I first became familiar with Toolshop in the CLEAN environment and used it as the behavioural reference while exploring the deliberately BUGGY application.

This produced a separate set of **manual exploratory findings**, with an individual evidence document for each reported issue.

These exploratory defects were kept separate from defects later exposed by the automated BUGGY regression suite. This prevents an automated failure from being incorrectly counted as a new defect when it represents an already observed issue or a cascading symptom of another root cause.

The exploration stage also helped identify the important Toolshop business areas that needed to be represented in the later knowledge base and regression design.

---

## 4. Curated Toolshop Knowledge Layer

Instead of allowing agents to make assumptions about the application, project-specific knowledge was organized under:

```
docs/ai-knowledge/
├── api-reference.md
├── business-rules.md
├── toolshop-domain.md
├── ui-reference.md
└── user-flows.md
```

### `api-reference.md`

Captures confirmed API contracts, endpoints, request/response behaviour, status expectations, and API-specific information required by the automation.

### `business-rules.md`

Captures confirmed business rules used when designing assertions, boundaries, financial checks, and expected outcomes.

### `toolshop-domain.md`

Provides the agents with Toolshop-specific domain context and terminology.

### `ui-reference.md`

Maintains confirmed UI information such as stable controls and selectors so generated automation does not invent selectors unnecessarily.

### `user-flows.md`

Documents important application journeys and relationships between application states.

The purpose of this layer is to reduce hallucination and keep scenario generation and automation grounded in project-specific evidence.

---

## 5. Multi-Agent QA Architecture

Four specialized custom agents were implemented under:

```
.github/agents/
├── create-scenarios.agent.md
├── test-strategy.agent.md
├── generate-tests.agent.md
└── review-tests.agent.md
```

Each agent has a deliberately different responsibility.

The implemented workflow is:

```
Domain Knowledge
      ↓
Create Scenarios
      ↓
Test Strategy
      ↓
Generate Tests
      ↓
Review Tests
      ↓
Execute
      ↓
Human Triage
```

## 5.1 Create Scenarios Agent

File:

```
.github/agents/create-scenarios.agent.md
```

This agent acts as the **functional test-design layer**.

It converts confirmed Toolshop requirements and curated knowledge into structured scenarios while applying appropriate black-box test-design techniques, including:

-  Equivalence Partitioning; 
-  Boundary Value Analysis; 
-  Decision Tables; 
-  State Transition Testing; 
-  normal positive/negative scenario analysis where a formal technique is not appropriate. 

Generated scenarios are stored under:

```
docs/generated/test-scenarios/
├── authentication-accounts-test-scenarios.md
├── browse-search-test-scenarios.md
├── cart-test-scenarios.md
├── checkout-payment-test-scenarios.md
├── financial-calculations-test-scenarios.md
├── invoice-test-scenarios.md
└── product-test-scenarios.md
```

The scenario catalogue is broader than the final executable regression suite. Generation of a scenario does **not** automatically mean that it must become a Playwright test.

---

## 6. Test Strategy Agent

File:

```
.github/agents/test-strategy.agent.md
```

The Test Strategy Agent acts as the **QA architecture layer**.

It evaluates scenarios based on factors such as:

-  business risk; 
-  regression value; 
-  execution cost; 
-  appropriate test-pyramid layer; 
-  whether behaviour is better validated through API, UI, or hybrid testing; 
-  redundancy; 
-  maintainability; 
-  business criticality. 

Its generated strategy is stored at:

```
docs/generated/test-strategy/test-strategy.md
```

A key design principle was:

> **Do not automate everything through the UI simply because it can be automated through the UI.**

API coverage is preferred for precise validation, contracts, boundaries, authorization, and financial calculations where appropriate. UI/E2E automation is reserved for behaviour requiring user-visible or integration proof.

The generated strategy/scenario catalogue therefore represents the broader design space, while the final implemented suite is a deliberately selected regression slice.

---

## 7. Generate Tests Agent

File:

```
.github/agents/generate-tests.agent.md
```

This agent acts as the **SDET implementation layer**.

It consumes the approved test strategy and approved scenarios and converts the selected scope into executable Playwright JavaScript tests.

Its responsibilities include:

-  following the selected API/UI/hybrid test layer; 
-  using confirmed selectors and contracts; 
-  using Page Objects where appropriate; 
-  creating reusable API/data helpers; 
-  keeping tests independent; 
-  using dynamic test data where required; 
-  creating deterministic assertions; 
-  performing exact financial validation; 
-  maintaining scenario traceability. 

Importantly, the Generate Tests Agent is **not responsible for changing business requirements or weakening expected behaviour when a test fails**.

A red test against BUGGY is potentially valuable evidence and must be investigated rather than automatically "fixed."

---

## 8. Review Tests Agent

File:

```
.github/agents/review-tests.agent.md
```

The Review Tests Agent acts as an **independent automation quality gate**.

It evaluates implementation quality rather than simply generating more code.

Review areas include:

-  scenario traceability; 
-  assertion completeness; 
-  false-green risk; 
-  locator quality; 
-  API-contract correctness; 
-  alignment with the selected test layer; 
-  maintainability; 
-  deterministic behaviour; 
-  business-rule coverage. 

For example, during review of the product-detail automation, the review agent identified that checking only the cart badge after Add to Cart could allow a false green if the required visible success confirmation regressed.

It also identified that an out-of-stock scenario checked the label's visibility but did not fully validate the required presentation.

These findings demonstrate an important part of the workflow:

```
Generate → Review → Human decision
```

The reviewer agent does not automatically rewrite the implementation simply because it has produced a recommendation.

---

## 9. Shared QA Governance

Two common instruction files provide guardrails across the agent workflow:

```
.github/instructions/
├── toolshop-qa.instructions.md
└── playwright-best-practices.instructions.md
```

These are **shared governance files**, not additional workflow stages.

## `toolshop-qa.instructions.md`

Defines Toolshop-specific QA rules such as:

-  CLEAN Sprint 5 as the behavioural baseline; 
-  evidence-driven expected results; 
-  no unsupported requirement fabrication; 
-  scenario traceability; 
-  separation of documented contracts from observed behaviour; 
-  explicit human-review handling where evidence is insufficient; 
-  protection against using known BUGGY implementation details as the source of defect discovery. 

## `playwright-best-practices.instructions.md`

Defines automation engineering rules such as:

-  semantic/stable locator preference; 
-  deterministic assertions; 
-  no arbitrary sleeps; 
-  test independence; 
-  dynamic test data where appropriate; 
-  Page Object responsibilities; 
-  API/UI hybrid setup; 
-  exact financial assertions; 
-  failure classification; 
-  debugging discipline; 
-  preserving the correct expected result even when BUGGY fails. 

Together, these files help ensure that different agents operate under common QA principles.

---

## 10. Human-in-the-Loop Controls

AI output was never treated as automatically correct.

Human verification remained responsible for:

-  validating important behaviour against CLEAN; 
-  deciding whether a generated scenario was supported; 
-  reviewing automation before accepting it; 
-  manually reproducing candidate defects; 
-  distinguishing product failures from automation failures; 
-  distinguishing infrastructure failures from application failures; 
-  determining whether multiple failing tests represented one root cause; 
-  deciding whether an observation had enough evidence to become a defect; 
-  preserving correct expected results when BUGGY behaved incorrectly. 

The governing rule was:

> **A failing automated test is an investigation point, not automatically a unique defect.**

This became particularly important during BUGGY execution because one contract defect could cause several downstream scenarios to fail.

---

## 11. AI Corrections and Rejected Suggestions

AI-assisted work was reviewed rather than accepted blindly.

Examples include:

### Assertion completeness

The review process identified assertions that could technically pass without fully proving the business requirement. Where justified, stronger business-facing assertions were preferred.

### Cascading failures

The BUGGY regression initially produced many red tests. These were **not reported as an equivalent number of defects**.

Failures were triaged by root cause, manually reproduced, and consolidated.

### Expected-result protection

Automation was not changed merely to accommodate incorrect BUGGY behaviour.

For example, where a BUGGY response exposed a contract regression, the expected assertion was retained instead of modifying the helper or assertion to match the defective implementation.

### CLEAN discrepancy

One registration age-boundary scenario exposed a discrepancy in the CLEAN environment itself.

Rather than redefining the requirement to make the suite green, the expected rule was preserved and the scenario was explicitly handled as a known CLEAN discrepancy.

This demonstrates that the CLEAN environment was used as the primary oracle but was not assumed to be technically infallible when stronger requirement/contract evidence showed a discrepancy.

---

## 12. Final Automation Implementation

The final executable Playwright suite contains:

**49 tests/subcases**

CLEAN regression result:

```
48 passed
1 skipped
0 failed
```

The skipped scenario is the known CLEAN registration age-boundary discrepancy.

The same suite was then executed against BUGGY without weakening expected results.

Initial BUGGY regression:

```
11 passed
37 failed
1 skipped
```

The 37 failing automated tests were **not interpreted as 37 independent product defects**.

Failure triage identified shared root causes, cascading failures, independent defects, and observations. Automation-exposed defects were then manually verified before being treated as confirmed defects.

This provides deliberate green and red regression evidence, which is appropriate for a deliberately defective target application.

---

## 13. AI-Assisted Defect Triage

Automation failures were mapped using a separate defect/triage tracker containing information such as:

```
Automation Case
→ Scenario/Sub-case
→ Initial Result
→ Failure Point
→ Root Cause
→ Mapped Defect
→ New Defect?
→ Business Rule Reached?
→ Evidence / Notes
```

This helped prevent defect-count inflation.

For example, a product API contract regression can break product discovery in multiple downstream automated tests. Those failures should be mapped back to the same root cause rather than reported as several unrelated defects.

The final automation-derived BUGGY findings were therefore consolidated into confirmed defect IDs rather than equating test failures with defect count.

---

## 14. Playwright MCP

Playwright MCP was configured as an **optional AI/browser-assistance capability**.

It allows an AI agent to interact with a live browser through Playwright and inspect page structure/accessibility information.

A controlled CLEAN smoke check was performed through Playwright MCP to confirm that the integration could open the Toolshop application and inspect the live application without modifying repository files.

MCP is **not required for execution of the regression framework**.

The normal Playwright suite remains independently runnable through the repository commands.

This distinction keeps MCP as an enhancement rather than making the test framework dependent on an AI tool.

---

## 15. GitHub MCP

GitHub MCP was also configured and authenticated as an optional repository integration.

A controlled read-only validation was performed to confirm that the integration could identify the current repository and inspect repository information without creating, modifying, committing, pushing, or deleting content.

GitHub MCP can support AI-assisted repository and workflow interaction, but it is not required for normal test execution.

---

## 16. GitHub Copilot Agents Environment

The custom repository agents were also made available through the GitHub Agents experience.

This demonstrated that the repository-level agent definitions are reusable beyond a single local IDE conversation.

For example, the Review Tests agent was invoked against the product-detail Playwright test in the repository and independently produced review findings based on the repository's instructions, strategy, scenarios, knowledge files, and implementation.

This provides evidence that the agent architecture is encoded in the repository rather than existing only as temporary prompt history.

---

## 17. Local, Docker and CI Execution

AI-assisted generation is separated from normal test execution.

The Playwright regression suite supports execution:

```
Local machine
        │
        ├── CLEAN
        └── BUGGY

Dockerized Playwright runner
        │
        ├── CLEAN
        └── BUGGY

GitHub Actions
        │
        ├── GitHub-hosted runner
        └── Self-hosted Windows runner
```

The dedicated Playwright Docker image reproduced the expected baselines:

```
Docker CLEAN
48 passed
1 skipped
0 failed

Docker BUGGY
11 passed
37 failed
1 skipped
```

This provides additional evidence that the results are not dependent on one developer-machine configuration.

---

## 18. CI Infrastructure Finding

GitHub-hosted UI execution encountered the public application's Cloudflare/security verification page.

The same security-layer interception was observed across hosted-runner attempts and was classified as an **execution infrastructure/security-layer issue**, rather than incorrectly changing selectors or application expectations to make those CI tests pass.

Self-hosted execution was therefore retained as a practical CI execution option for the public application.

This distinction is important in AI-assisted debugging: not every red pipeline represents an application defect or an automation defect.

---

## 19. What AI Was Not Allowed to Do

AI was not allowed to:

-  use known BUGGY source/answer-key material to discover defects; 
-  redefine expected behaviour simply because BUGGY behaved differently; 
-  classify every failed test as a unique defect; 
-  invent unsupported business rules; 
-  silently replace confirmed project evidence with assumptions; 
-  weaken assertions to obtain a green run; 
-  treat generated test scenarios as automatically approved automation scope; 
-  make final defect decisions without reproducible evidence. 

The intentionally defective implementation was treated as the **target under test**, not as the source of truth.

---

## 20. Traceability

The implemented workflow provides traceability across the QA lifecycle:

```
CLEAN Requirements / Observations
            ↓
Curated Knowledge
            ↓
Scenario ID
            ↓
Test Technique
            ↓
Risk / Strategy Decision
            ↓
API / UI / Hybrid Layer
            ↓
Playwright Test
            ↓
CLEAN Result
            ↓
BUGGY Result
            ↓
Failure Triage
            ↓
Manual Reproduction
            ↓
Confirmed Defect / Observation
```

This traceability was intentionally preserved so that AI-generated artifacts remain auditable by a human reviewer.

---

## 21. Summary

AI contributed to this assessment across **test design, strategy, implementation, review, browser assistance, repository interaction, and failure analysis**, while human QA judgment remained the final control.

The resulting architecture can be summarized as:

```
Human Exploration
        +
Curated Application Knowledge
        +
Specialized QA Agents
        +
Shared Engineering Governance
        +
Playwright Automation
        +
Independent AI Review
        +
Human Verification
        =
AI-Augmented QA Workflow
```
