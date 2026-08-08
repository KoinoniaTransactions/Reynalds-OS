# J&M Reynalds Finances — Canonical Architecture

Status: Approved Direction
Approved: 2026-08-07

## Purpose

This is the canonical product, data, security, and architecture direction for
J&M Reynalds Finances.

Future AI sessions must read this document before meaningful work involving
`/personal` or `personal-finance-*`.

This direction supersedes earlier descriptions of Personal Finance as a
permanently local-only application.

## Product Identity

J&M Reynalds Finances is a private household financial application.

It is separate from:

- Reynalds OS;
- Koinonia Transactions;
- Koinonia Properties;
- Reynalds Brothers OS;
- Koinonia business finance.

It currently shares the Reynalds OS monorepo, but shared code does not erase
the product boundary.

## Current Implementation

Current development is intentionally local-first.

Today the application uses:

- Next.js under `apps/web`;
- the `/personal` route family;
- local SQLite persistence;
- `.local/personal-finance/`;
- localhost/private-network development access;
- synthetic Demo mode;
- Clean mode;
- legacy CSV compatibility.

The current production-host restriction is a development safety boundary.

It is not the permanent product destination.

## Approved Production Destination

The approved destination is a private, authenticated household financial
application that Jeremiah and his wife can securely access remotely.

Production should eventually provide:

- HTTPS-only remote access;
- separate authenticated identities for both household members;
- MFA-capable managed authentication;
- server-side household authorization;
- managed relational persistence;
- protected secrets and financial-provider credentials;
- secure webhook handling;
- backup and tested recovery;
- appropriate rate limiting, logging, and monitoring;
- visible data freshness and connection state.

Exact hosting, authentication, database, and domain vendors are not yet locked.

## Household Ownership Boundary

Production architecture must introduce an explicit household model.

Conceptually:

- `Household` = J&M household;
- `HouseholdMember` = an authenticated household member;
- financial data belongs to the Household;
- authentication identity and data ownership remain separate concepts.

Jeremiah and his wife should authenticate separately.

Financial entities must eventually have explicit or safely inherited household
ownership.

This includes accounts, transactions, budget periods, bills, income,
obligations, assets, liabilities, loan records, reconciliation records, rules,
and provider connections.

An implicit single-user database must not be the production security boundary.

## Development and Production Storage

SQLite remains approved for current local development and focused tests.

SQLite is not the intended permanent hosted production database.

The preferred production architecture is managed PostgreSQL unless a later
approved decision changes that direction.

The managed provider has not yet been selected.

Migration must be tested with synthetic data before real household data is
considered.

## Authentication and Authorization

Managed authentication may reuse existing repository infrastructure.

Authentication alone is not sufficient.

Every protected production read or write must establish:

1. authenticated identity;
2. active household membership;
3. resource household;
4. permission for the requested operation.

Route visibility is not authorization.

Existing Clerk infrastructure is a possible reusable foundation, not proof that
Personal Finance authorization is production-ready.

## Manual Data Remains First-Class

Financial-provider connectivity supplements the application.

It does not replace manual records.

The canonical financial model belongs to J&M Finances.

External providers supply financial observations and institution data.

They do not own household budgeting or planning intent.

## Financial Provider Direction

Plaid is the preferred first financial-data provider candidate to evaluate.

Potential future uses include:

- financial institution linking;
- account information;
- balances;
- transaction synchronization;
- supported liability data;
- supported investment data.

Plaid is not implemented or permanently locked by this architecture decision.

Current official provider documentation, support, pricing, security, and
production requirements must be verified again before implementation.

## Provider-Neutral Architecture

Core Personal Finance objects must not be hard-wired to Plaid.

Financial providers belong behind server-side service or adapter boundaries.

Preferred provenance categories are:

- `manual`;
- `demo`;
- `statement_import`;
- `provider`;
- `calculated`.

Provider-backed records should separately identify the provider, such as
`plaid`, plus safe provider references when required.

## Synchronization Rules

Provider synchronization must be:

- server-side;
- incremental where supported;
- idempotent;
- retry-safe;
- resilient to duplicate events;
- explicit about additions, modifications, and removals;
- traceable to provider connection and sync state.

Provider observations remain separate from household review and reconciliation.

A provider transaction does not automatically mean:

- Expense;
- Income;
- Transfer;
- Reviewed;
- Reconciled;
- allocated to a budget target.

The UI should eventually show synchronization freshness and connection-attention
state.

## Sensitive Data Rules

Never collect or store:

- online banking usernames;
- online banking passwords;
- financial-institution MFA codes;
- recovery codes;
- provider secrets in browser code.

Provider credentials must remain server-side and use approved secret-management
or encryption controls.

Full routing/account numbers should not be collected merely because the current
application can encrypt sensitive fields.

Prefer masked identifiers and provider references unless a specifically
approved feature genuinely requires more.

Never log provider tokens, credentials, or financial secrets.

## Development Data Lifecycle

The approved lifecycle is:

1. Build and test using synthetic Demo data.
2. Complete core product behavior.
3. Complete production architecture and security gates.
4. Run Personal Finance Clean reset.
5. Verify a blank first-run state.
6. Begin real household onboarding.
7. Enable financial-institution connectivity only after provider/security
   readiness.

Real household financial values are not development fixtures.

Do not ask Jeremiah to enter real account, mortgage, property, income, budget,
or debt values for ordinary feature development.

## Production Security Gate

Real household financial data must not enter hosted production until these
categories have been explicitly verified:

- production managed authentication;
- household authorization;
- MFA policy;
- production database security;
- secret management;
- provider-token protection;
- webhook authenticity;
- sensitive logging review;
- rate limiting where appropriate;
- backups;
- tested restoration;
- HTTPS/domain configuration;
- development/production environment separation;
- final Clean reset and onboarding procedure.

Successful deployment alone is not production-security approval.

## Current Development Priority

Continue core finance development locally using synthetic data.

Current next feature milestone:

- test Demo Home Mortgage;
- create/link the Mortgage obligation;
- complete financed setup using synthetic values;
- verify linked asset and liability creation;
- verify debt-ledger routing;
- use stable obligation IDs instead of bill-name inference;
- do not record a payment merely to prove navigation.

## Planned Architecture Phases

### Phase A

Continue core finance behavior with synthetic data.

### Phase B

Introduce household ownership and provider-neutral provenance.

### Phase C

Establish a persistence boundary for current SQLite and future managed
relational storage.

### Phase D

Implement production authentication, MFA policy, and household authorization.

### Phase E

Implement a financial-provider adapter and evaluate Plaid using sandbox/test
data.

### Phase F

Implement reliable synchronization, webhook processing, retries, and freshness.

### Phase G

Complete hosting, database, monitoring, backup/recovery, and security gates.

### Phase H

Clean-reset development data and begin real household onboarding.

## AI Rules

Future AI must:

- read this document;
- verify repository path, branch, HEAD, and working tree;
- preserve synthetic-only development;
- preserve manual financial workflows;
- preserve provider-neutral architecture;
- use stable IDs for relationships;
- distinguish current implementation from future production direction;
- keep Koinonia-specific architecture out of Personal Finance unless shared
  infrastructure is genuinely required.

Future AI must not:

- describe Personal Finance as permanently local-only;
- expose the current local server publicly;
- treat authentication as sufficient authorization;
- store bank login credentials;
- place provider tokens in browser code;
- hard-wire the finance domain to one provider;
- request real household values during development;
- deploy real financial data before the production security gate.

## Canonical References

Production planning:

`docs/PERSONAL_FINANCE_PRODUCTION_ARCHITECTURE_V1.md`

Current implementation:

- `apps/web/app/personal/`
- `apps/web/components/personal-finance-*`
- `apps/web/lib/personal-finance-*`
