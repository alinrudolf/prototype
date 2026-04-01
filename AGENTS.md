# AGENTS.md

## Project Overview
This repository contains a Product Manager POC for Toluna.

The goal is to build a small, interactive web prototype that demonstrates:
- AI-powered survey search
- Survey reuse workflows
- Grounded, citation-based survey generation

This is NOT a production system.

---

## Source of Truth
- `PLAN.md` defines the product scope, constraints, and behavior
- All implementation decisions must follow PLAN.md

If there is any conflict:
→ PLAN.md takes priority

---

## Core Principles

### 1. Scope Discipline
This is a **prototype**, not a full product.

Do NOT:
- add backend services
- integrate real AI APIs
- introduce authentication
- add complex architecture
- over-optimize for scalability

Prefer:
- simple, local, deterministic logic
- readable code
- fast iteration

---

### 2. Local-Only Architecture
- Use `mock_data.json` as the only data source
- No database
- No API calls
- No server-side logic

All logic must run locally in the frontend.

---

### 3. Privacy First (Critical Rule)
Client filtering must be enforced BEFORE any results are shown.

Rules:
- No result should be visible outside the selected/permitted client
- AI draft generation must only use permitted surveys
- Do not simulate cross-client leakage

---

### 4. Grounded AI Only
AI functionality is simulated and must follow these rules:

- Output must be based only on retrieved survey data
- Every generated element must include citations
- Do not generate unsupported claims
- If evidence is weak, output must say so

Do NOT:
- hallucinate data
- invent surveys or insights
- fabricate citations

---

### 5. Hybrid Retrieval (Required)
Search must combine:
- keyword matching (precision)
- semantic-like matching via heuristics (recall)

Do NOT:
- use real embeddings
- use external ML libraries
- simulate complex ML pipelines

Keep retrieval logic simple and explainable.

---

### 6. Explainability (Required)
All results must include a `whyMatched` explanation.

Examples:
- matched on title
- matched on question text
- matched on answer insight
- same market
- cross-market similar
- same client

This is a core product feature, not optional.

---

### 7. Multimarket Awareness
The system should:
- support multiple markets and languages
- surface similar surveys across markets
- highlight differences where possible

This can be simulated through:
- filters
- labels
- grouping

---

### 8. Historical Data Awareness
The dataset simulates real-world issues:
- inconsistent schemas
- outdated terminology
- duplicates
- missing metadata

The system should:
- normalize lightly
- flag legacy data
- tolerate imperfect records

Do NOT:
- attempt full data cleaning pipelines
- overengineer normalization

---

## Implementation Guidelines

### Code Style
- Prefer simple, readable functions
- Avoid unnecessary abstraction
- Keep files small and focused
- Use TypeScript types where useful

---

### File Responsibilities

- `src/types.ts`
  - data models and interfaces

- `src/lib/filters.ts`
  - filtering logic (client-first)

- `src/lib/search.ts`
  - retrieval and scoring logic

- `src/lib/aiDraft.ts`
  - draft generation logic (mocked, grounded)

- `src/app/*`
  - main screens:
    - Search
    - Survey Detail
    - AI Draft Builder

- `src/components/*`
  - small reusable UI components

---

### State Management
- Keep state local and simple
- Do not introduce global state libraries unless absolutely necessary

---

### UI Guidelines
- Prioritize clarity over design polish
- Keep UI minimal but credible
- Focus on:
  - search results clarity
  - trust signals (client, citations, legacy)
  - explainability

---

## What NOT to Do

Do NOT:
- add real AI integrations
- install large or unnecessary libraries
- refactor the project structure without request
- introduce backend or API layers
- implement authentication
- overcomplicate routing
- create unused abstractions

---

## How to Work

When making changes:
1. Keep changes scoped to the requested task
2. Do not modify unrelated files
3. Explain what you changed and why
4. Keep logic aligned with PLAN.md
5. Prefer incremental improvements over large rewrites

---

## Success Criteria

The POC is successful if:
- search works across surveys, questions, and insights
- results are filtered by client correctly
- results include clear explanations
- survey detail enables reuse
- AI draft builder produces grounded, cited outputs
- multimarket and legacy aspects are visible
- the app is stable for a live demo

---

## Final Reminder

This project is evaluated on:
- product thinking
- system design clarity
- realism of constraints

NOT on:
- technical complexity
- production readiness
- advanced AI implementation

Keep it simple. Keep it credible.