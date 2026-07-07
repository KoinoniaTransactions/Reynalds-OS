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
