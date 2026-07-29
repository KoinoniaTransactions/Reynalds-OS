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
| Koinonia Staff MFA Setup Task | `/session-tasks/setup-mfa` | Clerk setup-mfa task route |
| Koinonia Client Dashboard Preview | `/client/dashboard` | Auth-guarded preview with live showing request path and sample fallback |
| Koinonia Client Document Center Preview | `/client/documents` | Auth-guarded sample-data document review and approval preview only |
| Koinonia Client Billing Center Preview | `/client/billing` | Auth-guarded sample-data billing setup, invoices, and pay-at-close preview only |
| Koinonia Employee Portal Entry | `/employee` | Internal entry shell, no real client data |
| Koinonia Employee Dashboard Preview | `/employee/dashboard` | Auth-guarded staff assignment preview with live showing request queue and sample fallback |
| Koinonia Employee Access Workspace | `/employee/access` | Auth-guarded portal user, invitation, MFA, and client access readiness workspace with safe preview fallback |
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
| `/api/portal/invitations` | Portal invitation record list/create |
| `/api/portal/invitations/:id/revoke` | Portal invitation revoke and audit |
| `/api/portal/users` | Portal user access status list |
| `/api/portal/users/:id/deactivate` | Portal user deactivation and audit |
| `/api/portal/audit` | Portal access audit history |
| `/api/portal/showing-requests` | Portal showing request list/create |
