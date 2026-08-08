# J&M Reynalds Finances — Production Architecture v1

Status: Approved Planning Specification
Date: 2026-08-07
Implementation Status: Not Yet Implemented

## Purpose

This document translates the canonical direction in
`BRAIN/PERSONAL_FINANCE_ARCHITECTURE.md`
into an implementation-oriented production plan.

It does not authorize immediate deployment, production database migration,
Plaid implementation, or real household data entry.

## Target Experience

Jeremiah and his wife should eventually be able to securely access J&M
Reynalds Finances from their phones or computers wherever they have internet
access.

The application should provide a shared household view of budgets, bills,
income, accounts, transactions, reconciliation, debts, assets, liabilities,
net worth, and connected institution data where useful.

Manual control remains foundational.

External provider data supplements the application.

## Current-to-Target Transition

Current development uses:

- Next.js under `apps/web`;
- the `/personal` route family;
- local SQLite persistence;
- localhost/private-network development access;
- synthetic Demo mode;
- Clean mode;
- legacy CSV compatibility.

The production target adds:

- secure HTTPS remote access;
- separate authenticated household members;
- MFA-capable managed authentication;
- server-side household authorization;
- managed relational persistence;
- provider-neutral institution connectivity;
- secure webhook processing;
- backup and tested recovery;
- development/test/production environment separation.

This transition should evolve the existing application rather than rewrite it.

## Household Model

### Household

The Household represents the J&M financial-data ownership and authorization
boundary.

Shared financial entities ultimately belong to this household.

### HouseholdMember

A HouseholdMember represents one authenticated person with access to the
household.

Jeremiah and his wife should authenticate independently.

Initial household permissions should remain simple rather than introducing
unnecessary enterprise tenancy or complex RBAC.

## Household Data Ownership

Production financial entities must have explicit or safely inherited household
ownership.

This includes appropriate records for accounts, transactions, budget periods,
bills, income, obligations, assets, liabilities, loan records, reconciliation,
rules, provider connections, and synchronization state.

Do not mechanically add `household_id` to every table without evaluating
whether ownership can safely inherit through a protected parent relationship.

The authorization path must always be unambiguous.



## Authentication

Managed authentication should provide:

- unique user identities;
- secure sign-in;
- MFA capability;
- session management;
- account recovery appropriate to the selected provider.

Existing Clerk infrastructure may be evaluated for reuse.

Its presence in the repository does not by itself make Personal Finance
production-ready.

## Household Authorization

Every protected server-side Personal Finance operation must resolve:

1. authenticated user;
2. active HouseholdMember;
3. household associated with the requested resource;
4. permission to perform the requested action.

Never rely only on:

- route visibility;
- a client-provided household ID;
- browser UI state;
- knowledge of a record ID;
- authentication without membership validation.

Protected reads require authorization just as protected writes do.

## Production Persistence Direction

SQLite remains appropriate for current development and focused testing.

Before production migration, reduce unnecessary direct coupling between domain
operations and SQLite-specific implementation details.

The preferred production persistence architecture is managed PostgreSQL.

The exact provider remains undecided.

Production persistence should provide:

- encrypted network transport;
- restricted production credentials;
- controlled migrations;
- appropriate connection management;
- automated backups;
- tested restore capability.

All migration work must first be proven with synthetic data.

## Money Handling

Financial values must remain deterministic.

Prefer integer cents at persistence and domain boundaries where practical.

Do not introduce floating-point money calculations during database migration,
provider synchronization, or reconciliation.

## Data Provenance

Material financial records should be capable of explaining where their data
came from.

Preferred source categories:

- `manual`;
- `demo`;
- `statement_import`;
- `provider`;
- `calculated`.

Provider-backed information should separately identify:

- provider name;
- safe external object reference where necessary;
- observation/import timestamp;
- last provider update when useful.

Provider identity is not a substitute for provenance category.

## ProviderConnection

A future ProviderConnection represents one consented external financial-data
connection.

Conceptual fields may include:

- internal ID;
- household ID;
- provider;
- safe provider connection reference;
- protected access credential or secure secret reference;
- connection status;
- consent/update state;
- member who created the connection;
- last attempted sync;
- last successful sync;
- institution-attention state;
- safe provider error state.

Provider access credentials must never be returned to client-side JavaScript.

## External Account Binding

A provider account should map to a canonical J&M Finances account.

Conceptually:

ProviderConnection
-> Provider Account
-> ExternalAccountBinding
-> Canonical J&M Account

The J&M account remains the domain object.

The provider account is an external source binding.

Do not make provider IDs the canonical primary keys of Personal Finance domain
records.

## Financial Provider Adapter

Provider SDK calls should not be scattered throughout pages or UI components.

Create a server-side provider boundary.

Illustrative responsibilities may include:

- create link session;
- exchange connection;
- sync accounts;
- sync transactions;
- sync liabilities;
- sync investments;
- refresh when supported;
- disconnect.

These are conceptual responsibilities, not a locked interface.

Plaid is the preferred first provider candidate to evaluate.

A future provider should be replaceable or supplementable without redesigning
the finance domain.

## Transaction Synchronization

Provider transaction data is factual source information.

It does not automatically determine household intent.

Provider synchronization must not silently change:

- Classification;
- Reviewed state;
- Reconciliation state;
- budget allocations;
- transfer confirmation;
- household rules.

Existing reconciliation safeguards remain important after provider integration.

Provider transaction identity must support deterministic:

- insert;
- update;
- removal;
- retry;
- duplicate-event handling.

Repeated synchronization must not create duplicate canonical transactions.

## Synchronization State

Provider synchronization should maintain durable state such as:

- provider connection;
- sync product or scope;
- cursor or equivalent incremental token;
- last attempted synchronization;
- last successful synchronization;
- safe failure state;
- last relevant webhook event;
- whether user attention is required.

Sync state must remain separate from transaction classification and
reconciliation state.

## Webhook Processing

Future provider webhooks must:

- be received only through HTTPS;
- verify authenticity using current provider requirements;
- tolerate duplicate delivery;
- tolerate retries;
- avoid trusting event order blindly;
- initiate safe idempotent synchronization;
- avoid exposing secrets in logs;
- return appropriate responses without leaking internal details.

Webhook delivery is a synchronization signal.

It must not bypass canonical Personal Finance services.

## Data Freshness

The application should eventually communicate financial-data freshness.

Possible states include:

- recently synchronized;
- synchronization in progress;
- institution attention required;
- stale connection;
- provider temporarily unavailable;
- last successful sync timestamp.

Do not imply continuous real-time banking data unless a provider actually
supports it.



## Balance and Liability Data

Do not collapse all financial balance concepts into one unexplained value.

The application may need to distinguish:

- provider-observed balance;
- manually entered balance;
- calculated ledger balance;
- period opening balance;
- reconciled or month-end balance.

Provider liability information may supplement supported obligations.

Manual debt setup remains first-class.

Stable obligation and liability IDs remain canonical relationship keys.

Do not route debts using display names.

## Sensitive Data Minimization

Do not collect sensitive information merely because it can be encrypted.

Never store:

- online banking passwords;
- financial-institution MFA codes;
- recovery codes.

Full bank account or routing values should only be retained when a separately
approved feature genuinely requires them.

Prefer:

- masked account identifiers;
- internal canonical IDs;
- provider-safe references.

## Production Secret Management

Production secrets must remain outside source control.

This includes:

- authentication secrets;
- database credentials;
- provider client secrets;
- provider access credentials;
- encryption keys;
- webhook-verification secrets or keys where applicable.

Server-only financial credentials must never appear in client-side environment
variables or browser code.

## Environment Separation

At minimum distinguish:

### Local Development

- synthetic Demo data;
- local persistence;
- provider sandbox only when required.

### Provider Sandbox or Test

- test provider credentials;
- synthetic institution connections;
- no production household secrets.

### Production

- real household records;
- production authentication;
- production database;
- production provider credentials;
- backup and monitoring;
- strict household authorization.

Production must never silently seed Demo or legacy CSV data.

Production should fail closed if required security configuration is absent.

## Logging and Auditability

Production logs must not contain:

- provider access tokens;
- authentication secrets;
- bank credentials;
- encryption keys;
- full sensitive financial identifiers.

Prefer safe metadata such as internal record IDs, operation types, sync status,
and provider-safe error codes.

Security-sensitive and material actions should eventually be auditable.

Examples include:

- provider connection created or removed;
- household member access changed;
- financial data reset initiated;
- debt linkage changed;
- manual reconciliation performed;
- sensitive configuration changed.

## Backup and Recovery

Production is not ready for household financial data until both backup and
restore are operational.

Requirements include:

- automated database backups;
- appropriate retention;
- documented restore procedure;
- actual restore testing;
- understanding provider reconnection behavior;
- recovery planning for database loss or corruption.

A backup that has never been restored is not sufficient proof of recovery.

## Rate Limiting and Abuse Protection

Publicly reachable production endpoints should receive protection appropriate
to their risk.

Pay particular attention to:

- authentication-sensitive endpoints;
- provider-link creation;
- synchronization or refresh requests;
- webhook endpoints;
- expensive finance queries;
- sensitive mutations.

Exact limits should be selected from real usage and provider requirements.

## Provider Disconnect and Revocation

The application needs an explicit provider-disconnect lifecycle.

Disconnecting should:

- revoke or remove provider credentials where supported;
- stop future synchronization;
- preserve legitimate household historical records according to policy;
- clearly show that the connection is inactive.

Provider identity must not be required to retain valid household history.

## Production Security Gate

Before real household data enters production, verify:

- managed authentication;
- MFA policy;
- server-side household authorization;
- production database security;
- migration process;
- secret management;
- provider credential protection;
- webhook verification;
- safe logging;
- rate limiting where appropriate;
- secure session behavior;
- HTTPS and domain configuration;
- backups;
- tested restore;
- monitoring;
- environment separation;
- provider disconnect behavior;
- Clean-reset procedure;
- blank first-run onboarding state.

Deployment success alone does not satisfy this gate.

## Real-Data Onboarding Gate

Real household onboarding begins only after:

1. core product behavior is ready;
2. household ownership is implemented;
3. production authentication is implemented;
4. household authorization is verified;
5. managed production persistence is ready;
6. provider integration is verified in sandbox/test if enabled;
7. backup and restore are verified;
8. production security review passes;
9. development data is Clean-reset;
10. blank first-run state is verified;
11. Jeremiah explicitly approves real-data onboarding.

## Development Roadmap

### Phase 1 — Core Product

Continue synthetic development.

Immediate milestone:

- Demo Home Mortgage linkage;
- synthetic financed setup;
- asset/liability creation;
- stable obligation-ID debt-ledger routing.

### Phase 2 — Ownership and Provenance

Implement household ownership and provider-neutral provenance.

### Phase 3 — Persistence Boundary

Reduce unnecessary SQLite-specific coupling and prepare managed relational
persistence.

### Phase 4 — Production Identity

Implement production authentication, MFA policy, HouseholdMember resolution,
and household authorization.

### Phase 5 — Provider Sandbox

Implement the provider adapter and evaluate Plaid using sandbox/test data.

### Phase 6 — Sync Reliability

Implement incremental synchronization, retries, idempotency, webhook handling,
connection attention, and freshness state.

### Phase 7 — Production Infrastructure

Complete hosting, database, secrets, monitoring, backups, recovery, rate
limiting, HTTPS, and production-security verification.

### Phase 8 — Clean Launch

Run Clean reset, verify blank state, complete the security gate, and begin real
household onboarding only after approval.

## Deferred Decisions

The following remain intentionally undecided:

- hosting provider;
- PostgreSQL provider;
- final authentication provider;
- production domain;
- exact Plaid products;
- whether another financial-data provider is needed;
- PWA versus native mobile strategy;
- user-triggered provider refresh behavior;
- long-term provider retention policy.

Future AI must not describe these deferred choices as implemented facts.
