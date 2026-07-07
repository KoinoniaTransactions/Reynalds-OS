# ROS v8.9 — Transactions MVP

## Added

- `/transactions` page.
- Database-backed Transaction list.
- Transaction detail panel.
- Transaction status and health update form.
- Transaction task creation.
- Task list for selected transaction.
- Related object display.
- Timeline event display.
- Dashboard-style metrics for transaction count, critical count, open tasks, and related objects.

## Current Limitations

- Transaction-specific fields are still stored through generic object records.
- Deadlines are not modeled separately yet.
- Task completion UI is not implemented yet.
- Exceptions are represented through health/next-action rather than a separate exception table.

## Next Recommended Work

- Build Operations Queue MVP.
- Add task completion route and UI.
- Add deadline fields and deadline views.
