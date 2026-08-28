---
description: "Use for Toolshop QA work requiring Sprint 5 domain knowledge, business rules, user journeys, REST API behavior, UI reference, expected-result validation, or investigation of conflicting behavior."
---

# Toolshop QA Governance

## Baseline

- Clean Sprint 5 (`sprint5/UI`, `sprint5/API`, and the Sprint-5-specific docs it was derived from) is the **only** expected-behavior baseline.
- Never use `sprint5-with-bugs/**` as expected behavior, for comparison, or as a secondary source — it is intentionally defective and out of bounds.
- Never inspect known-bug lists, bug reports, defect seeds, or other answer-key material to derive expected behavior.

## Canonical Knowledge Source

`docs/ai-knowledge/` is the curated canonical knowledge layer for Toolshop. Do not duplicate its content inside this or any other instruction file — reference it, don't restate it. Do not re-derive the same knowledge from Sprint 5 source code when the knowledge base already answers the question.

## Progressive Knowledge-Loading Hierarchy

Load knowledge files on demand, only as needed for the task at hand — never load all five for every task:

1. **Always start with** `docs/ai-knowledge/toolshop-domain.md` — concise orientation (purpose, scope, stack, modules, entities, source hierarchy).
2. Load `docs/ai-knowledge/business-rules.md` only when the task involves business rules, validations, calculations, expected behavior, boundaries, checkout, payment, authentication, invoices, cart, or product rules.
3. Load `docs/ai-knowledge/user-flows.md` only when the task involves user journeys, end-to-end flows, alternative/negative flows, or navigation behavior.
4. Load `docs/ai-knowledge/api-reference.md` only when the task involves REST API contracts, test-data/setup APIs, authentication APIs, API/UI hybrid testing, request/response contracts, or documented-vs-implementation-observed behavior.
5. Load `docs/ai-knowledge/ui-reference.md` only when the task involves UI pages, routes, labels, roles, `data-test` selectors, form fields, or Playwright locator information.

## No Fabrication

Never fabricate business rules, selectors, endpoints, request/response payloads, validation rules, calculations, or expected results. If it isn't confirmed by a clean Sprint 5 source, don't invent it.

## Contract Distinction

Preserve the distinction between **Documented Contract** (the generated OpenAPI spec) and **Implementation-Observed Contract** (routes/controllers/requests actually read) as established in `api-reference.md`. Do not collapse the two into a single assumed contract.

## Conflicting Sources

When sources conflict, do not guess or silently pick one. Preserve and reuse the existing labels from the knowledge base:
- `Needs Human Review` — clean sources disagree.
- `Not confirmed from clean Sprint 5 source` — no clean source confirms the fact.

## Traceability

Maintain source traceability (file path, and section/route/component where possible) back to the knowledge documents in any output that relies on them.

## Application Code Boundaries

Do not modify application source code merely to make a test pass. A failing test is an investigation point, not automatic proof of an application defect — determine the cause before drawing conclusions.
