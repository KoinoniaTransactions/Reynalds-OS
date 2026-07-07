# ROS v8.3 — Object API Persistence

## Added

- Prisma-backed Object API.
- Object create/list/update/archive routes.
- Object detail route with events and relationships.
- Timeline event creation on object create/update/archive.
- Prisma-backed Timeline API.
- Relationship create API.
- Basic object validation helpers.
- Shared Prisma client helper.

## API Routes

### GET /api/objects

Query params:
- objectType
- health
- status

### POST /api/objects

Creates an object and writes an `object.created` timeline event.

### GET /api/objects/:id

Returns object detail, timeline events, and relationships.

### PATCH /api/objects/:id

Updates an object and writes an `object.updated` timeline event.

### DELETE /api/objects/:id

Soft-archives an object and writes an `object.archived` timeline event.

### GET /api/timeline

Returns workspace timeline events.

### POST /api/timeline

Creates a manual timeline event.

### POST /api/relationships

Creates an object relationship.

## Next Work

- Build database-backed Object Explorer UI.
- Add stronger validation with a schema library.
- Add integration tests.
- Add role-specific API tests.
