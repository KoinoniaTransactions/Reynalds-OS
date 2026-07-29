# ROS-MVP-004 — Add managed authentication scaffold

## Epic

Authentication

## Priority

P0

## User Story

As an owner, I need secure login before any workspace data is visible.

## Acceptance Criteria

protected app routes; user identity available; unauthenticated users redirected; role seed supported

## Implementation Notes

- Keep workspace scoping in mind.
- Add tests for core behavior.
- Update related documentation when complete.
- Avoid AI or automation writes unless explicitly part of the ticket.

## Definition of Done

- Code implemented.
- Tests added or updated.
- Local build passes.
- Documentation updated.

## Progress

- Production auth boundary scaffolded for Koinonia portal routes.
- `/sign-in` secure login entry added.
- Client and employee preview routes now require portal permissions before rendering.
- `apps/web/lib/auth.ts` now supports local mock preview and Clerk-ready managed session lookup.
- Clerk provider package, middleware, and app provider wrapper are installed and wired.
- Real deployment configuration, staff MFA, invitation flow, and provider-user verification remain required before the ticket is complete.
