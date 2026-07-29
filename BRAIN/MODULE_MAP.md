# Module Map

## Current Production Routes

| Module | Route | Status |
|---|---|---|
| Dashboard | `/` | Database-backed metrics |
| Reynalds Brothers Operations Workspace | `/reynalds-brothers` | Dedicated company workspace for Reynalds Brothers Work Items, field readiness, documentation, billing readiness, and customer updates |
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
| Koinonia Client Dashboard Preview | `/client/dashboard` | Auth-guarded current-work list from owned RosObject records, live showing/access request paths, and sample fallback |
| Koinonia Client Document Center Preview | `/client/documents` | Auth-guarded document intake upload form with storage/database guard, live submitted-document list, and sample fallback |
| Koinonia Client Billing Center Preview | `/client/billing` | Auth-guarded billing setup request form with live metadata list and sample fallback; invoices/payment processing still preview only |
| Koinonia Employee Portal Entry | `/employee` | Internal entry shell, no real client data |
| Koinonia Employee Dashboard Preview | `/employee/dashboard` | Auth-guarded staff assignment preview with live showing request queue and sample fallback |
| Koinonia Employee Access Workspace | `/employee/access` | Auth-guarded portal user, invitation, MFA, client access readiness, and external access request workspace with safe preview fallback |
| Koinonia Employee Document Workspace Preview | `/employee/documents` | Auth-guarded upload intake queue with live document metadata and sample fallback; drafting/send/archive still preview only |
| Koinonia Employee Billing Workspace Preview | `/employee/billing` | Auth-guarded billing setup request queue with live metadata list and sample fallback; invoices/payment processing still preview only |
| Koinonia Employee Readiness View | `/employee/readiness` | Auth-guarded live portal production readiness view for login, database, documents, social login, AI review, and launch gates |

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
| `/api/reynalds-brothers/work-items` | Reynalds Brothers Work Item list and operational metrics scoped to the company workspace |
| `/api/reynalds-brothers/work-items/:id` | Reynalds Brothers Work Item operational update |
| `/api/reynalds-brothers/email-intake` | Reynalds Brothers email classification, Communication creation, Work Item filing, and new-job creation |
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
| `/api/portal/documents` | Portal document upload intake list/create |
| `/api/portal/documents/:id/download` | Authorized portal document download through configured private storage |
| `/api/portal/access-requests` | Portal external access request list/create without credential storage |
| `/api/portal/billing-setup-requests` | Portal billing setup request list/create without card storage |
