# ROS v9.6 — Automatic Notification Generation

## Added

- `POST /api/notifications/generate`.
- Auto-generation from critical objects.
- Auto-generation from high-priority open tasks.
- Auto-generation from pending invoices.
- Duplicate prevention for unresolved matching notifications.
- Timeline event creation for related auto-generated notifications.
- Generate Alerts button on Notification Center.

## Current Sources

- `rosObject.health = Critical`
- `task.priority in High/Critical and status != Complete`
- `invoice.status != Paid`

## Current Limitations

- Generation is manual through a button/API call.
- No scheduled background job yet.
- No due-date-based notification generation yet.
- No user-specific routing rules beyond current user.

## Next Recommended Work

- Add Workflow MVP.
- Add scheduled/background job runner later.
- Add notification rules configuration.
