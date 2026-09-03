# Private Case Workspaces

## Purpose

Reynalds OS may be used to manage sensitive legal, family, medical, financial, or other private case work. The Reynalds-OS GitHub repository is public and MUST NOT contain private case facts, court records, communications, evidence, medical information, child information, legal strategy, or personally identifying case materials.

This document defines the safe architecture for private case work without making GitHub the data store.

## Canonical Rule

Private case data lives in the user's private Reynalds OS data workspace, not in this public repository.

The public repository may contain only:

- generic case-management architecture
- non-sensitive templates
- application code
- data schemas
- privacy and handling rules

The private workspace contains:

- court documents and orders
- pleadings and filings
- email, SMS, co-parenting-app, and attorney communications
- evidence and source records
- case chronology
- legal research and case-law notes
- strategy, theories, risks, and negotiation positions
- witnesses and exhibit planning
- hearing and trial preparation
- action items and deadlines

## Private Workspace Structure

Use this canonical structure for each case:

- `00_Case_Control/`
  - `CASE_MASTER.md`
  - `DOCUMENT_INDEX.md`
  - `TIMELINE.md`
  - `ACTION_PLAN.md`
- `01_Orders_and_Core_Agreements/`
- `02_Pleadings_and_Filings/`
- `03_Communications/`
- `04_Evidence/`
- `05_Strategy_and_Research/`
  - `ISSUES_AND_THEORIES.md`
  - `LEGAL_RESEARCH.md`
  - `RISK_REGISTER.md`
- `06_Witnesses_and_Exhibits/`
  - `WITNESS_LIST.md`
  - `EXHIBIT_REGISTER.md`
- `07_Hearing_Prep/`
  - `PTC_PREP.md`
  - `HEARING_OUTLINE.md`
- `99_Inbox/`

## Fact Classification

Every material fact should be classified before it is used in strategy or drafting:

- `VERIFIED_COURT_RECORD` — supported by a filed order, pleading, minute order, or official record.
- `VERIFIED_COMMUNICATION` — supported by an email, SMS, app message, letter, or other preserved communication.
- `VERIFIED_EXTERNAL_RECORD` — supported by an authenticated or reliable external record.
- `USER_REPORTED_UNVERIFIED` — reported by the user but not yet supported by a collected source.
- `OPPOSING_PARTY_ALLEGATION` — asserted by the opposing side but not independently established.
- `INFERENCE` — a reasoned interpretation, theory, or prediction; never restate as fact.
- `LEGAL_RESEARCH` — a legal rule, case, statute, or procedural point with source and date checked.

## AI Handling Rules

Any AI working on a private case must:

1. Read the case master, timeline, action plan, and current strategy before drafting.
2. Distinguish verified facts from allegations, user reports, and inference.
3. Identify the source for every important factual assertion.
4. Never silently convert a mediation discussion, unsigned draft, proposed order, or allegation into an enforceable order or established fact.
5. Keep child-centered objectives separate from litigation tactics.
6. Maintain a running list of deadlines and procedural defects.
7. Update the case master and timeline after material new documents, communications, filings, or decisions.
8. Preserve competing interpretations of ambiguous evidence instead of prematurely choosing one.
9. Avoid placing private case content into GitHub commits, issues, pull requests, logs, or public deployment artifacts.

## Source-of-Truth Principle

The private case workspace is the canonical factual source. Chat history and AI memory are convenience layers only and must not be treated as the authoritative record.

When a private case workspace exists, recover from it before relying on memory.
