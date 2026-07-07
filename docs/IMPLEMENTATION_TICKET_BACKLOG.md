# ROS v8.1 — Implementation-Ready Ticket Backlog

## Purpose

Convert the ROS v8 production scaffold into a developer-ready implementation backlog.

## Sequencing Rule

Build trusted data first, then workflow, then automation, then intelligence.

## Ticket Backlog

| Ticket | Epic | Title | Priority |
|---|---|---|---|
| ROS-MVP-001 | Project Foundation | Set up production monorepo tooling | P0 |
| ROS-MVP-002 | Design System | Port ROS design tokens into production UI package | P0 |
| ROS-MVP-003 | Database | Initialize Prisma and Postgres schema | P0 |
| ROS-MVP-004 | Authentication | Add managed authentication scaffold | P0 |
| ROS-MVP-005 | Workspace | Create Koinonia workspace seed | P0 |
| ROS-MVP-006 | Object Engine | Implement Object API with Prisma persistence | P0 |
| ROS-MVP-007 | Relationship Graph | Implement object relationship API | P1 |
| ROS-MVP-008 | Object Explorer | Build database-backed Object Explorer UI | P1 |
| ROS-MVP-009 | Timeline | Create timeline event service | P1 |
| ROS-MVP-010 | CRM | Build CRM relationship module MVP | P1 |
| ROS-MVP-011 | Transactions | Build transaction module MVP | P1 |
| ROS-MVP-012 | Operations | Build operations work queue MVP | P1 |
| ROS-MVP-013 | Finance | Build basic invoice and payment MVP | P2 |
| ROS-MVP-014 | Knowledge | Build repository metadata MVP | P2 |
| ROS-MVP-015 | Copilot | Add read-only Copilot context endpoint | P2 |
| ROS-MVP-016 | Analytics | Implement dashboard metric service | P2 |
| ROS-MVP-017 | Notifications | Build notification model and list UI | P3 |
| ROS-MVP-018 | Workflow Engine | Create workflow definition storage | P3 |
| ROS-MVP-019 | Automation | Add safe automation test runner | P3 |
| ROS-MVP-020 | Security | Add permissions checks to APIs | P0 |

## Detail Format

Each ticket should be implemented with:

- User story
- Acceptance criteria
- API impact
- Database impact
- UI impact
- Test requirement
- Documentation update

## MVP Definition of Done

The MVP is ready for internal use when:

- Auth works.
- Workspace scoping works.
- Object CRUD works.
- Timeline events are created.
- CRM and Transactions are usable.
- Operations queue is usable.
- Finance basic tracking works.
- Dashboard metrics are database-backed.
- Copilot is read-only and grounded.
