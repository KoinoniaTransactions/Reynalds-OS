# ROS-MVP-015 — Add read-only Copilot context endpoint

## Epic

Copilot

## Priority

P2

## User Story

As an owner, I need AI recommendations grounded in object context without direct writes.

## Acceptance Criteria

endpoint accepts question and object IDs; returns answer with references; no mutations performed

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
