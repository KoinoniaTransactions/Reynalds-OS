# Module Map

## Current Production Routes

| Module | Route | Status |
|---|---|---|
| Dashboard | `/` | Database-backed metrics |
| Object Explorer | `/objects` | Create/edit/archive/search/relate |
| CRM | `/crm` | Relationship MVP |
| Transactions | `/transactions` | Transaction MVP |
| Operations | `/operations` | Task queue MVP |
| Finance | `/finance` | Invoice MVP |
| Knowledge | `/knowledge` | Knowledge object MVP |
| Copilot | `/copilot` | Read-only MVP |
| Notifications | `/notifications` | Notification MVP |
| Workflows | `/workflows` | Workflow MVP |
| Koinonia Client Portal Entry | `/client` | Public entry shell, no sensitive forms |
| Koinonia Client Dashboard Preview | `/client/dashboard` | Sample-data preview only, not production auth |

## Primary APIs

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
| `/api/copilot` | Read-only Copilot |
| `/api/notifications` | Notification list/create |
| `/api/notifications/:id` | Notification update |
| `/api/notifications/generate` | Auto-generate alerts |
| `/api/workflows` | Workflow list/create |
| `/api/workflows/:id/start` | Start workflow |
| `/api/workflow-runs` | Workflow run list |
