# Database Conventions

## Primary Tables

- Workspace
- User
- Role
- RosObject
- ObjectRelationship
- TimelineEvent
- Workflow
- WorkflowRun
- Task
- AutomationRule
- Notification
- Document
- Invoice
- Payment

## Central Rule

`RosObject` is the central platform object registry.

Specialized tables can exist, but they must not silently duplicate core object truth.

## Workspace Scoping

Every business record should be scoped to a workspace when applicable.

## Soft Archive

Objects should be archived using `archivedAt`, not deleted.

## Timeline Events

A timeline event should be created when a meaningful mutation occurs.

## Decimal Handling

Prisma Decimal values should be serialized to strings or numbers before JSON responses.

## IDs

Use stable IDs where seed/reference data matters.

Examples:

- `wks_koinonia`
- `usr_owner`
- `role_owner`

For user-generated production records, generated cuid IDs are acceptable.

---

## J&M Reynalds Finances Database Conventions - 2026-08-07

The general Reynalds OS workspace conventions remain valid for platform and business records.

J&M Reynalds Finances uses a distinct household ownership boundary and must not be silently forced into `Workspace` or `RosObject` ownership merely because those patterns exist elsewhere in Reynalds OS.

### Household Ownership

Production Personal Finance records must have explicit or safely inherited household ownership.

The authorization path from a financial record to its Household must always be unambiguous.

Do not mechanically add `household_id` to every child table when ownership can safely inherit through a protected parent relationship.

### Persistence

Local SQLite remains approved for current Personal Finance development and focused tests.

SQLite is not the intended permanent hosted production database.

Managed PostgreSQL is the preferred production persistence pattern unless a later approved architectural decision changes it. The exact provider remains deferred.

All persistence migration work must be proven with synthetic data before real household onboarding.

### Money

Prefer deterministic integer-cent storage and calculations at financial persistence and domain boundaries where practical.

Do not introduce floating-point behavior that can change financial totals, reconciliation, or synchronization results.

### Provenance

Preferred Personal Finance provenance categories are:

- `manual`;
- `demo`;
- `statement_import`;
- `provider`;
- `calculated`.

Provider-backed records identify the external provider separately from provenance category.

Provider identity must not replace the canonical J&M Finances record identity.

### External Provider References

Provider account, transaction, liability, or investment identifiers are external references, not canonical Personal Finance primary keys.

Provider credentials and access tokens remain server-side and must never be exposed to browser code or normal logs.

### Synchronization State

Provider synchronization state should be durable, idempotent, and retry-safe.

Store the provider cursor or equivalent incremental state when required, together with appropriate attempted-sync, successful-sync, error, and attention metadata.

Synchronization state is separate from transaction Classification, Reviewed state, Reconciliation state, and budget allocation state.

### Stable Relationships

Use stable obligation, liability, account, transaction, asset, and related domain IDs for relationships and routing.

Do not use bill names, account display names, or other mutable labels as durable relationship identifiers.
