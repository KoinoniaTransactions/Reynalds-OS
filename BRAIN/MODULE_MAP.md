# Module Map

## Purpose

This map identifies the current major application routes and APIs that future developers and AI sessions should inspect before creating duplicates.

---

# Public Koinonia Transactions Routes

| Page | Route | Status |
|---|---|---|
| Home | `/` | Active public route |
| Services | `/services` | Active public route |
| About | `/about` | Active public route |
| Contact | `/contact` | Active public route |

Backward-compatible Koinonia aliases may also exist under `/koinonia`. Inspect current route files before removing aliases.

---

# Internal / Operating Routes

| Module | Route | Status |
|---|---|---|
| Reynalds OS Dashboard | `/dashboard` | Active internal route |
| Reynalds Brothers Workspace | `/reynalds-brothers` | Active company workspace |
| Object Explorer | `/objects` | Object operations |
| CRM | `/crm` | Relationship operations |
| Transactions | `/transactions` | Transaction operations |
| Operations | `/operations` | Task/operations view |
| Finance | `/finance` | Invoice/finance view |
| Knowledge | `/knowledge` | Knowledge objects |
| Copilot | `/copilot` | AI/Copilot view |
| Notifications | `/notifications` | Notification operations |
| Workflows | `/workflows` | Workflow operations |

Do not assume the root route is the internal dashboard. The public Koinonia site uses root launch paths; the internal dashboard is preserved at `/dashboard`.

---

# Shared Platform APIs

| API | Purpose |
|---|---|
| `/api/objects` | Object list/create |
| `/api/objects/:id` | Object detail/update/archive |
| `/api/relationships` | Create relationships |
| `/api/tasks` | Task list/create |
| `/api/tasks/:id` | Task update/complete |
| `/api/invoices` | Invoice list/create |
| `/api/invoices/:id` | Invoice update/mark paid |
| `/api/analytics/dashboard` | Dashboard metrics |
| `/api/copilot` | Copilot support |
| `/api/notifications` | Notification list/create |
| `/api/notifications/:id` | Notification update |
| `/api/notifications/generate` | Auto-generate alerts |
| `/api/workflows` | Workflow list/create |
| `/api/workflows/:id/start` | Start workflow |
| `/api/workflow-runs` | Workflow run list |

---

# Reynalds Brothers Runtime Map

## Workspace

`apps/web/app/reynalds-brothers/page.tsx`

## API families

| API area | Repository location |
|---|---|
| Work Items | `apps/web/app/api/reynalds-brothers/work-items/` |
| Email Intake | `apps/web/app/api/reynalds-brothers/email-intake/` |
| Gmail Support | `apps/web/app/api/reynalds-brothers/gmail/` |
| Local Data Support | `apps/web/app/api/reynalds-brothers/local-data/` |

## Runtime logic and tests

- `apps/web/lib/reynalds-brothers-work-items.ts`
- `apps/web/lib/reynalds-brothers-work-items.test.ts`
- `apps/web/lib/reynalds-brothers-email-intake.ts`
- `apps/web/lib/reynalds-brothers-email-intake.test.ts`
- `apps/web/lib/reynalds-brothers-email-intake-live-import.ts`
- `apps/web/lib/reynalds-brothers-workspace-live-data.ts`
- `apps/web/lib/reynalds-brothers-workspace-live-data.test.ts`
- `apps/web/lib/walmart-tanks-gmail-backfill.ts`

Company semantics and data-map guidance live at:

`02_Companies/Reynalds_Brothers/06_Brain/README.md`

---

# Database

Canonical schema:

`packages/database/prisma/schema.prisma`

Current repository seed:

`packages/database/prisma/seed.ts`

Do not confuse current seed state with richer historical seed evidence on the preserved Reynalds Brothers recovery branch.

---

# CI

Workflow:

`.github/workflows/ci.yml`

Required current order:

1. frozen-lockfile install,
2. Prisma Client generation,
3. repository tests,
4. production build.
