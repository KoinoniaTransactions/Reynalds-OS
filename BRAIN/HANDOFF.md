# Developer Handoff

## Project Status

Reynalds OS is in repository-first development.

Current version: v11.0.0

## Start Here

Read these first:

1. `START_HERE.md`
2. `CURRENT_STATE.md`
3. `PROJECT_MEMORY.md`
4. `AI_DEVELOPMENT_CHARTER.md`
5. `NEXT_ACTION.md`

## Do Not Start From

Do not start from the old standalone app shell as the main application.

The v7.2 shell is preserved historically under:

```text
07_Application_Prototypes/ROS_Koinonia_Interactive_App_Shell_v7_2.html
```

It is not the active production app source.

## Start From

Primary app:

```text
apps/web/
```

Primary database schema:

```text
packages/database/prisma/schema.prisma
```

Primary source-of-truth docs:

```text
BRAIN/
START_HERE.md
CURRENT_STATE.md
PROJECT_MEMORY.md
NEXT_ACTION.md
AI_DEVELOPMENT_CHARTER.md
```

Koinonia website knowledge:

```text
03_Knowledge/Website/
```

## First Local Commands

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm --filter @reynalds-os/database db:generate
pnpm --filter @reynalds-os/database db:migrate
pnpm --filter @reynalds-os/database db:seed
pnpm dev
```

## First Routes To Check

- `/`
- `/objects`
- `/crm`
- `/transactions`
- `/operations`
- `/finance`
- `/knowledge`
- `/copilot`
- `/notifications`
- `/workflows`

## Most Important Warning

Do not claim work is complete from conversation history alone. Complete means real repository files changed and the release package reflects those changes.
---

# Session Handoff – 2026-07-07

## Milestone Achieved
Completed the first major refactor of the Reynalds OS dashboard into a modular architecture.

### New dashboard component structure

apps/web/components/dashboard/

- Sidebar.tsx
- TopBar.tsx
- MissionCards.tsx
- WorkspaceRegistry.tsx
- BrainRuleCard.tsx
- MetricGrid.tsx
- index.ts

### New shared libraries

apps/web/lib/

- brain.ts
- workspace.ts
- objectEngine.ts

## Accomplishments

- Dashboard successfully split into reusable components.
- Shared Brain state introduced.
- Workspace Registry separated into its own component.
- Brain Rule card separated into its own component.
- Mission cards separated.
- Sidebar separated.
- TopBar separated.
- Dashboard now imports through dashboard/index.ts.
- Initial modular architecture is working.

## Git

Latest successful commit:

ca12547

Message:

v11.3.1 - Modular dashboard foundation

## Current Issue

Development server entered an inconsistent Next.js cache state.

Observed errors included:

- missing required error components
- ENOENT app/page.js
- localhost switching ports
- stale .next cache

This appears to be a Next.js development cache issue rather than an application architecture problem.

Before continuing development:

1. Remove apps/web/.next
2. Restart pnpm dev
3. Verify dashboard loads normally
4. Continue development from modular dashboard

## Next Priority

Begin building the Brain Engine.

Planned order:

1. Brain Service
2. Object Registry
3. Timeline Engine
4. Universal Search
5. AI Command Center

The modular dashboard is now the permanent foundation for Reynalds OS.

---

# Koinonia Production Continuity — 2026-08-07

## Read This Before Any Koinonia Deployment Change

Koinonia public production, Koinonia portal development, and the shared monorepo are currently different states. Do not assume GitHub `main` equals the live public Koinonia deployment.

### Verified State

- Live Koinonia production is pinned by a Vercel Instant Rollback to commit `83d3dda31c500e36ac42f7258d5fdb79fef69c0e` (`Add Koinonia meaning to About page`).
- Current GitHub `main` is `ab00ef5d0784de2c352a1fb7cfe2f96ee7be1f16` (`Add Koinonia digital business card`).
- The approved digital business card exists on current `main`, but direct promotion of `main` is unsafe because unrelated repository work also exists between the live rollback point and current `main`.
- Active Koinonia portal development is `chatgpt/portal-access-status` at `8263f9f72ff6dbb6dcbcfed97757be459df253b7` before these continuity-document commits. The portal is pre-live and must not be promoted directly to the public domain.
- The user's local Mac branch was verified clean and synchronized with the portal branch before these Brain updates. Remote Brain-document commits created during this continuity pass will make the local branch behind until it is fast-forwarded.

### Approved Permanent Release Model

Use a dedicated branch named `koinonia-production` as the permanent cumulative Koinonia release line.

Status: this branch is **approved but not yet created**.

Initial release plan:

1. Create `koinonia-production` exactly from live commit `83d3dda31c500e36ac42f7258d5fdb79fef69c0e`.
2. Add only the four approved digital-business-card files:
   - `apps/web/app/jeremiah/page.tsx`
   - `apps/web/app/jeremiah/digital-card.module.css`
   - `apps/web/public/jeremiah-reynalds.vcf`
   - `apps/web/public/assets/images/koinonia/jeremiah-digital-card-qr.svg`
3. Verify an isolated Vercel preview including the existing public website and `/jeremiah`.
4. Stop for explicit approval before changing custom-domain routing or undoing the rollback.
5. After approval, keep all future Koinonia production releases cumulative from `koinonia-production`.

### Portal Launch Rule

Never replace production with the portal-development branch.

When client/employee portal work is genuinely production ready, start from the then-current `koinonia-production` baseline and integrate the approved Koinonia portal feature set into that baseline through a controlled release/integration branch. The combined release must preserve the existing public website and all already-live public features, including `/jeremiah`.

### Isolation Boundary

For Koinonia work, do not touch, merge, deploy, modify, or reorganize Personal Finance, Reynalds Brothers, or unrelated Reynalds OS work. Their presence in the same monorepo does not make them part of a Koinonia release.

### Next Safe Action

The next safe action after this documentation pass is to create `koinonia-production` from the live commit, copy only the four approved card files, and validate the preview. No Vercel production-domain change has been approved or executed as part of this documentation pass.

Canonical records:

- `BRAIN/KOINONIA_DEPLOYMENT_READINESS.md`
- `BRAIN/CURRENT_PRIORITIES.md`
- `BRAIN/DECISION_LOG.md` — D-020
- `BRAIN/DEVELOPMENT_LOG.md`
