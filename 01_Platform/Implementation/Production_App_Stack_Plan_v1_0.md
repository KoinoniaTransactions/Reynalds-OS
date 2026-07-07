# ROS-0063 — Production Application Stack Plan v1.0

## Mission

Define the recommended production software stack for building Reynalds OS as a real application.

## Core Principle

The prototype proves the product. The production stack delivers the product.

## Recommended Architecture

ROS should be implemented as a modern web application with:

- Frontend application
- Backend API
- Database
- Authentication
- Authorization / roles
- File storage
- Event bus
- Background jobs
- AI service layer
- Analytics layer
- Deployment pipeline
- Monitoring and logging

## Recommended Stack

### Frontend

Recommended:
- Next.js
- React
- TypeScript
- Tailwind CSS or design-token-based CSS
- Component library built from ROS Design System

Why:
- Strong application structure.
- Good routing.
- Works well for dashboards and SaaS.
- Can grow into production cleanly.

### Backend

Recommended:
- Node.js / TypeScript API
- REST API first, GraphQL later if needed
- Service layer organized by platform service:
  - Objects
  - Workflows
  - Timeline
  - Automations
  - Analytics
  - Copilot
  - Notifications
  - Users / Roles
  - Workspaces

### Database

Recommended:
- PostgreSQL

Why:
- Strong relational model.
- Excellent for object relationships.
- Good reporting foundation.
- Can support JSON fields where useful.

### ORM

Recommended:
- Prisma

Why:
- TypeScript-friendly.
- Clean schema management.
- Good for SaaS-style data models.

### Authentication

Recommended:
- Clerk, Auth0, or Supabase Auth

Decision rule:
Use managed authentication early unless there is a strong reason to build custom authentication.

### File Storage

Recommended:
- S3-compatible storage

Stores:
- Documents
- PDFs
- Uploaded files
- Generated reports
- Exports
- Repository artifacts

### Event Bus / Jobs

Recommended:
- Background job queue for:
  - Automation rules
  - Notifications
  - Report generation
  - AI summaries
  - Workflow triggers

Options:
- Inngest
- Trigger.dev
- BullMQ
- Cloud task queue

### AI Layer

Recommended:
- API service that receives structured context.
- Never let AI directly mutate data without a permissioned action layer.
- Copilot produces:
  - Explanation
  - Recommendation
  - Draft
  - Proposed action
  - Supporting object references

### Analytics

Recommended:
- Start with PostgreSQL-based computed metrics.
- Later add warehouse/BI only if needed.

### Deployment

Recommended:
- Vercel for frontend and API routes if using Next.js.
- Render, Railway, Fly.io, or AWS for backend services if separated.
- Managed Postgres.

## Repository Structure

Recommended production repo:

```text
reynalds-os/
  apps/
    web/
    api/
  packages/
    design-system/
    ui/
    database/
    core/
    ai/
    workflows/
    analytics/
  docs/
  repository/
  scripts/
```

## Module Mapping

### apps/web
User interface:
- Dashboard
- CRM
- Transactions
- Contracts
- Showings
- Operations
- Finance
- Customer Success
- Knowledge
- Reports
- Admin
- ROS

### packages/core
Shared business logic:
- Object Engine
- Relationship Graph
- Timeline
- Workflow Engine
- Automation Rules
- Permissions

### packages/database
Database schema and migrations.

### packages/ai
Copilot prompts, context builders, grounding rules, AI action review.

### packages/design-system
Tokens, typography, components, layout rules.

### packages/workflows
Workflow definitions and executable workflow logic.

### packages/analytics
Metric calculations and reporting models.

## Build Phases

### Phase 1 — Foundation
- Set up repo.
- Implement design system.
- Implement database schema.
- Implement authentication.
- Implement object model.
- Implement basic dashboard shell.

### Phase 2 — Core Modules
- CRM
- Transactions
- Operations
- Finance
- Knowledge

### Phase 3 — Platform Services
- Timeline
- Relationship Graph
- Workflow Engine
- Automation Rules
- Notifications

### Phase 4 — Intelligence
- Command Palette
- Copilot
- Analytics Engine
- Executive Briefings

### Phase 5 — Production Readiness
- Testing
- Monitoring
- Backups
- Permissions audit
- Security review
- Deployment process
- Documentation

## MVP Recommendation

The first real production MVP should include:

- Login
- Workspace
- CRM
- Transactions
- Tasks
- Timeline
- Basic Finance
- Object Explorer
- Dashboard
- Manual updates
- No destructive automations

Do not build AI automation first. Build trusted data first.

## Build Rule

The first production version should prioritize correctness, traceability, and trust over speed or automation.
