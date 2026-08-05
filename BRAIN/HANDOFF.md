# Developer Handoff

<!-- PERSONAL FINANCE HANDOFF 2026-08-05 -->
## 2026-08-05 Personal Finance Handoff

The local Personal Finance reconciliation and matching foundations are committed and verified at `fa878ea` on `feature/app-shell-foundation`.

The next AI must continue from the documented scoring evidence, not redesign the system.

### Immediate assignment

Implement only the ambiguity-margin and evidence-clarity refinement after Jeremiah approves it:

- expose the first-versus-second target score gap;
- mark a result ambiguous below a 10-point gap;
- prevent automatic preselection for ambiguous results;
- show evidence labels and gap in the editor;
- preserve the 75% high-confidence threshold;
- do not increase amount weighting;
- keep all writes explicit.

### Evidence

The privacy-safe 40-transaction review found:

- zero high-confidence suggestions;
- seven medium;
- 17 low;
- 16 with no suggestion;
- 18 amount-only matches;
- only one description-signal row;
- 10 target ambiguities;
- median and average first-versus-second gap of 4%.

This makes ambiguity protection the first safe refinement. Merchant-history learning is a separate later decision because confirmed history remains sparse.

### Safety

No automatic classification, allocation, reconciliation, Reviewed change, or transfer-pair confirmation. Protect the real database, budget CSV, and existing port `3003`. Do not expose raw financial data. Do not push without explicit approval.
<!-- END PERSONAL FINANCE HANDOFF 2026-08-05 -->

---

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
