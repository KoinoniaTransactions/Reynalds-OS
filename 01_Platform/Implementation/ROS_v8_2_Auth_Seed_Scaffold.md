# ROS-0067 — Authentication Scaffold & Seed Data

## Purpose

Begin implementation of the production application by adding auth structure and database seed wiring.

## Added

- Auth package.
- Role permission model.
- Mock owner user.
- API permission guards.
- `/api/me` route.
- Object API permission checks.
- Prisma seed script.
- Koinonia workspace seed.
- Owner role/user seed.
- Initial ROS object seed.
- Initial timeline event seed.

## Implementation Rule

Development may use mock auth temporarily, but production must replace it with managed session-based authentication.
