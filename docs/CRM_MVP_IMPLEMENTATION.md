# ROS v8.8 — CRM MVP

## Added

- `/crm` page.
- Database-backed CRM Relationship Center.
- Relationship list from `objectType=Relationship`.
- Relationship detail panel.
- Related object display.
- Timeline event display.
- Follow-up task creation.
- `GET /api/tasks`.
- `POST /api/tasks`.
- Timeline event created when follow-up task is added.

## Current Limitations

- CRM create flow uses Object Explorer instead of inline CRM form.
- Relationship segmentation is not implemented yet.
- Task completion UI is not implemented yet.

## Next Recommended Work

- Build Transactions MVP.
- Add CRM relationship type fields.
- Add task completion UI.
