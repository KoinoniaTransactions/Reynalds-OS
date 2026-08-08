# Product Vision

## Product Name

Reynalds OS

## First Operating Workspace

Koinonia ERP

## Mission

Create an intelligent operating system that helps run service businesses through shared objects, workflows, timelines, tasks, finance, notifications, knowledge, and AI-guided decision support.

## Koinonia ERP Mission

Provide a professional operating platform for Koinonia’s real estate transaction, contract, showing, business support, customer success, finance, and operations work.

## Core Product Thesis

Most small service businesses do not fail because they lack effort. They fail because the work is scattered across disconnected tools, memory, emails, spreadsheets, text messages, and undocumented processes.

Reynalds OS creates one operating layer where work is visible, connected, traceable, and actionable.

## Current Product Status

Reynalds OS is no longer only a static dashboard prototype.

As of v10.1, the repository contains:

- Production Next.js / TypeScript scaffold.
- Prisma database schema.
- Shared Object Engine.
- Object Explorer UI.
- CRM MVP.
- Transactions MVP.
- Operations Queue MVP.
- Finance MVP.
- Knowledge MVP.
- Read-only Copilot MVP.
- Notifications MVP.
- Automatic notification generation.
- Workflow Automation Engine MVP.
- Authoritative Brain documentation.

## Strategic Direction

From this point forward, work should prioritize:

1. Running the app locally.
2. Fixing compile/runtime issues.
3. Hardening data models.
4. Building one feature at a time.
5. Testing each feature before continuing.
6. Moving toward deployment.

---

## J&M Reynalds Finances Product Vision - 2026-08-07

### Product Identity

J&M Reynalds Finances is a private household financial application for the J&M household.

It is a separate product boundary from Koinonia, Reynalds Brothers OS, public company websites, and the central Reynalds OS Brain, even while sharing selected repository infrastructure.

### Household Mission

Provide one clear household system for understanding and managing bills, income, accounts, transactions, budgets, obligations, assets, liabilities, debt, reconciliation, and net worth.

The intended experience is summarized by the product tagline: **Our money, clearly organized.**

### Product Thesis

Manual control is the foundation.

Financial-institution synchronization should reduce repeated entry and improve visibility without removing household authority or making an external provider the source of domain truth.

### Approved Destination

A private, authenticated J&M household financial system, available securely anywhere, with manual control as the foundation and financial-institution synchronization layered on top.

Development remains local-first and synthetic until production security, household authorization, managed persistence, backup/recovery, and Clean-reset gates are satisfied.

### Architecture Direction

- separate authenticated household members;
- household-scoped authorization;
- SQLite development adapter;
- managed PostgreSQL preferred for hosted production, provider deferred;
- provider-neutral financial domain and provenance;
- Plaid as the preferred first provider candidate to evaluate, not a locked dependency;
- server-side provider secrets and synchronization;
- manual fallback for unsupported or disconnected financial data;
- explicit production security gate before real household onboarding.
