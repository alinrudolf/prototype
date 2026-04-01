# Toluna POC Plan

## Project Goal
Build a small interactive web prototype for an AI-powered survey intelligence platform for internal researchers and analysts.

The prototype should demonstrate how researchers can:
- search historical surveys more effectively than with keyword-only search
- reuse past questions and survey structures
- understand relevant past answer insights
- generate a new survey draft grounded in retrieved historical surveys

This is a product POC, not a production system.

---

## Primary User
Internal researchers and analysts working with historical survey data.

---

## Problem Statement
Researchers have access to thousands of historical surveys collected over many years, but these are difficult to search and reuse efficiently.

Current pain points:
1. Historical surveys are hard to reuse
2. Keyword search is too limited
3. Data is fragmented across questions, answers, and metadata
4. Historical data quality is inconsistent
5. Cross-market reuse is difficult

---

## Solution Summary
An AI-powered survey intelligence platform that enables researchers to semantically search, reuse, and generate surveys from historical data with strict privacy and grounded, citation-based outputs.

---

## In Scope
This POC should include:

1. Search experience
- search across survey titles, questions, answer summaries, and metadata
- query input
- filters for client, market, language, category, and methodology
- mixed search results across surveys, questions, and insights
- result explanations such as "why this matched"

2. Survey detail / reuse experience
- survey metadata
- matched questions
- answer summaries / insights
- reusable question list
- reuse actions such as "add to draft"

3. AI-assisted draft builder
- input: a new survey objective
- output: a mocked draft survey structure
- recommended reusable questions based on retrieved surveys
- citations to source surveys
- confidence / grounding note

4. Product/system concepts shown in the prototype
- hybrid retrieval: keyword + semantic-like matching
- client privacy / access control
- multimarket support
- historical data normalization
- grounded AI output with citation-based responses
- hallucination mitigation through guardrails

---

## Out of Scope
Do NOT build:

- real authentication
- real backend services
- real vector database
- real LLM or API integration
- real embeddings
- production-grade multilingual translation
- advanced analytics instrumentation
- admin tools
- collaboration features
- pixel-perfect design system work

This prototype should use local mock data and mocked logic only.

---

## Mock Data
Use `mock_data.json` as the single local data source.

The dataset should simulate:
- multiple clients
- multiple markets and languages
- historical surveys
- overlapping concepts across surveys
- reusable questions
- answer summaries / insight snippets
- some legacy / lower-quality records

---

## Core Product Principles
1. Privacy first
- results must only be shown if they belong to the selected / permitted client
- client filtering must happen before any results are displayed
- AI draft generation must only use permitted retrieved surveys

2. Grounded AI only
- AI output must be based only on retrieved mock survey data
- every generated draft recommendation should cite source surveys
- no uncited AI claims
- if evidence is weak, output should be conservative

3. Explainability
- search results should include a short explanation for why they matched
- AI draft output should show which surveys informed the result

4. Scope discipline
- this is a narrow but credible slice of the product
- optimize for clarity and realism, not completeness

---

## Historical Data Challenges to Simulate
The prototype should reflect realistic historical data issues:

- inconsistent schemas across years
- outdated terminology and methodologies
- duplicate or near-duplicate surveys
- missing or low-quality metadata
- multilingual variation across markets

POC handling approach:
- basic normalization
- simple deduplication or duplicate flags
- legacy badges for older studies
- partial support for inconsistent records

---

## Multimarket Support
The prototype should demonstrate:

- retrieval of semantically similar surveys across different markets
- support for different languages in the dataset
- visibility into wording or insight differences across markets
- reuse with awareness of cultural / contextual differences

This can be simulated with filters, labels, and result grouping.

---

## Search and Retrieval Rules
Implement retrieval with simple, readable mock logic.

### Retrieval approach
Use hybrid retrieval:
- keyword matching for exact or near-exact matches
- semantic-like matching through heuristics and field weighting

### Searchable fields
Search should consider:
- survey title
- category
- methodology
- questions
- answer summaries
- markets
- language
- client

### Filtering rules
- apply client filter first
- then apply market / language / category / methodology filters
- only filtered results can be scored and displayed

### Result scoring
Simple weighted scoring is enough. Example priorities:
- title matches = high weight
- question matches = medium-high weight
- answer summary matches = medium weight
- category / methodology matches = medium weight
- market alignment = relevance boost
- legacy records can have a small penalty or badge

### Explainability
Each result should expose a short `whyMatched` explanation, for example:
- matched on title
- matched on question text
- matched on answer insight
- same client
- same market
- cross-market similar study

---

## AI Draft Builder Rules
The AI Draft Builder is mocked and deterministic or semi-deterministic.

### Input
A short survey objective, for example:
- "Create a concept test for skincare in RO and PL"

### Output
A generated response should include:
- suggested draft survey structure
- recommended reusable questions
- cited source surveys
- a confidence / grounding note

### Constraints
- only use retrieved surveys that pass client filtering
- prefer results matching category and market
- do not invent unsupported claims
- show citations clearly
- if relevant evidence is weak, say so

---

## Main Screens
The prototype should contain 3 main experiences.

### 1. Search Screen
Must include:
- search input
- filters
- results list
- result type labels
- why matched explanations
- client / market / legacy badges where relevant

### 2. Survey Detail Screen
Must include:
- survey metadata
- question list
- answer summary / insights
- reuse actions
- explanation of why it was retrieved
- clear indication that access is allowed because of client scope

### 3. AI Draft Builder Screen
Must include:
- objective input
- generated survey outline
- recommended reusable questions
- citations
- confidence / grounding note

---

## UX Priorities
Prioritize:
- clarity over visual polish
- obvious flow between search, detail, and reuse
- trust signals
- understandable labels
- lightweight but credible enterprise-style UX

---

## Suggested Technical Structure
Recommended local structure:

- `mock_data.json`
- `src/types.ts`
- `src/lib/search.ts`
- `src/lib/filters.ts`
- `src/lib/aiDraft.ts`
- `src/components/...`
- `src/app/...` or equivalent app structure

Keep code simple, readable, and local-first.

---

## Acceptance Criteria
The POC is successful if:

1. A user can search mock historical surveys
2. Results are filtered by client before display
3. Results include questions, surveys, or insights
4. Results explain why they matched
5. A user can open a survey detail and reuse a question
6. A user can generate a mocked survey draft from retrieved surveys
7. AI output includes citations
8. The prototype visibly reflects multimarket and historical-data concerns
9. The app is stable enough for a live demo

---

## Demo Scenarios to Support
The prototype should work well for at least these example scenarios:

1. Reuse scenario
- user searches for a skincare usage survey in Romania
- finds similar historical studies
- reuses relevant questions

2. Multimarket scenario
- user searches for a concept test across Romania and Poland
- sees similar studies across markets
- notices wording / insight differences

3. AI draft scenario
- user asks for a new survey draft
- system suggests a structure and reusable questions
- output cites source surveys only from the permitted client

---

## Non-Goals
This prototype does not need to prove:
- production scalability
- actual AI model performance
- real multilingual NLP quality
- enterprise security implementation depth

It only needs to prove:
- sound product thinking
- realistic workflow design
- credible system logic
- good judgment around privacy, grounding, and historical data

---

## Implementation Guidance for Coding Agents
When editing this project:

- keep changes small and scoped
- do not introduce backend or real AI integrations
- do not add unnecessary dependencies
- do not redesign architecture without request
- prefer readable utilities over clever abstractions
- preserve the product constraints in this file
- prioritize a working demo over technical completeness