# ROS v9.2 — Database Dashboard Metrics

## Added

- `/api/analytics/dashboard`.
- Dashboard metric calculation from Prisma.
- Database-backed dashboard component.
- Refresh action.
- Fallback metrics if API call fails.
- Primary workflow launch table.

## Metrics Sources

- `rosObject`
- `task`
- `invoice`
- `timelineEvent`

## Current Metrics

- Total active objects.
- Critical objects.
- Active transactions.
- Open tasks.
- Paid revenue.
- Pending revenue.
- Timeline event count.
- Platform version.

## Next Recommended Work

- Add server-side search.
- Add Knowledge MVP.
- Add task due dates and owner assignment.
