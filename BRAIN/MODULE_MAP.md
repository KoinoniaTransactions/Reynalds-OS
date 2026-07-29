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
| Koinonia Secure Login Entry | `/sign-in` | Managed-auth entry scaffold |
| Koinonia Client Dashboard Preview | `/client/dashboard` | Auth-guarded sample-data preview only |
| Koinonia Client Document Center Preview | `/client/documents` | Auth-guarded sample-data document review and approval preview only |
| Koinonia Client Billing Center Preview | `/client/billing` | Auth-guarded sample-data billing setup, invoices, and pay-at-close preview only |
| Koinonia Employee Portal Entry | `/employee` | Internal entry shell, no real client data |
| Koinonia Employee Dashboard Preview | `/employee/dashboard` | Auth-guarded sample-data staff assignment preview only |
| Koinonia Employee Document Workspace Preview | `/employee/documents` | Auth-guarded sample-data drafting, approval, send, and archive preview only |
| Koinonia Employee Billing Workspace Preview | `/employee/billing` | Auth-guarded sample-data billing profiles, payment setup, and pay-at-close preview only |

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
