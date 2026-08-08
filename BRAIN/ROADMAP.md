# Reynalds OS Roadmap

## Current Release

v10.1 — Professional Software Project Consolidation

## Current Priority

Move from generated ZIP versions into a real Git repository and local development workflow.

## Immediate Next Steps

1. Download v10.1.
2. Extract into a stable project folder.
3. Initialize GitHub repository.
4. Run local setup.
5. Fix compile/runtime issues.
6. Commit clean baseline.
7. Continue tickets one by one.

## Next Product Work

1. Workflow step execution engine.
2. Workflow action registry.
3. Task due dates and owner assignment.
4. Payment records.
5. Server-side search.
6. Managed authentication.
7. Deployment setup.

## Later Product Work

- Customer portal.
- Email integration.
- Calendar integration.
- Document generation.
- AI action approvals.
- Reporting suite.
- Mobile app.
- Multi-workspace administration.

<!-- PERSONAL FINANCE ROADMAP 2026-08-07 -->
## J&M Reynalds Finances Roadmap Checkpoint - 2026-08-07

### Current foundation

- standalone J&M Reynalds Finances identity;
- synthetic Demo and Clean data modes;
- bills, income, transactions, accounts, obligations, assets, liabilities, net worth, and reconciliation foundations;
- synthetic January 2030 development workspace;
- local SQLite development persistence;
- 12 focused Personal Finance test files / 63 tests passing at the latest verified checkpoint.

### Immediate product milestone

Verify the synthetic Demo Home Mortgage debt lifecycle:

- create and link the Mortgage obligation;
- complete financed setup with synthetic values;
- verify linked asset and liability creation;
- verify the bill transitions to debt-ledger behavior;
- route using stable obligation IDs rather than bill-name inference;
- do not record a payment merely to prove navigation.

### Approved architecture direction

Personal Finance is local-first during development, not permanently local-only.

The intended destination is a securely hosted private household financial application with separate authenticated household members, server-side household authorization, managed relational persistence, and provider-neutral financial-institution synchronization.

Plaid is the preferred first provider candidate to evaluate after the household, provenance, authorization, and provider-adapter foundations exist.

### Later architecture milestones

1. household ownership and provider-neutral provenance;
2. persistence boundary for SQLite development and managed relational production storage;
3. production authentication, MFA policy, and household authorization;
4. provider adapter and sandbox evaluation;
5. idempotent synchronization, webhook handling, retries, and freshness state;
6. hosting, monitoring, backup/restore, and production security gate;
7. Clean reset followed by explicitly approved real household onboarding.

### Guardrails

Manual finance workflows remain first-class. Development remains synthetic. Do not expose the current local server publicly. Do not enter real household data before the production security gate.

Canonical architecture: `BRAIN/PERSONAL_FINANCE_ARCHITECTURE.md`

Production plan: `docs/PERSONAL_FINANCE_PRODUCTION_ARCHITECTURE_V1.md`
<!-- END PERSONAL FINANCE ROADMAP 2026-08-07 -->
