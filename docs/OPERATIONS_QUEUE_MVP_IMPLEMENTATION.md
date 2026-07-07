# ROS v9.0 — Operations Queue MVP

## Added

- `/operations` page.
- Database-backed task queue.
- Task status and priority filters.
- Client-side search.
- Create standalone task.
- Complete task action.
- `PATCH /api/tasks/:id`.
- Timeline event on task completion when related object exists.
- Related object context for tasks.
- Queue metric cards.

## Current Limitations

- Due date editing is not implemented yet.
- Owner assignment is not implemented yet.
- Task detail page is not implemented yet.
- Standalone tasks do not create object timeline events because no related object exists.

## Next Recommended Work

- Add due date and owner assignment.
- Add task detail/editing panel.
- Build Finance MVP.
