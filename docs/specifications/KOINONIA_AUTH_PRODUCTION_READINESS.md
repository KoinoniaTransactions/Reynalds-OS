# Koinonia Auth Production Readiness

Status: Provider Wired / Pre-Live
Applies To: Client portal, employee portal, document workspace, billing workspace, and portal APIs

---

## 1. Current Decision

Koinonia portal login should use managed authentication. The app is scaffolded for Clerk as the first managed provider path, while local preview can still use mock users.

The portal must not accept real client documents, billing setup, staff assignments, internal notes, or access requests until managed authentication is configured and verified.

---

## 2. Current Implementation

The current web app includes:

- Clerk installed as the managed auth provider dependency.
- A Clerk-aware app provider wrapper in `apps/web/components/auth/AuthProvider.tsx`.
- Clerk middleware in `apps/web/middleware.ts`, enabled only when Clerk keys are configured.
- Clerk session task URL for `setup-mfa` points to `/session-tasks/setup-mfa`.
- A secure catch-all login route at `/sign-in/[[...sign-in]]`.
- A no-index MFA setup task route at `/session-tasks/setup-mfa`.
- Public client and employee entry pages at `/client` and `/employee`.
- Protected client portal preview routes:
  - `/client/dashboard`
  - `/client/documents`
  - `/client/billing`
  - `/client/work/[id]`
- Protected employee portal preview routes:
  - `/employee/dashboard`
  - `/employee/access`
  - `/employee/documents`
  - `/employee/billing`
  - `/employee/launch`
  - `/employee/readiness`
  - `/employee/review`
  - `/employee/work/[id]`
- Async session lookup in `apps/web/lib/auth.ts`.
- Clerk session lookup explicitly treats pending sessions as signed out.
- Route-level permission guards in `apps/web/lib/portal-auth.ts`.
- Role normalization and provider-user construction in `packages/auth`.
- Database seed creates all approved Koinonia role names and their shared permission lists for portal assignment.
- Portal identity fields on `User` for auth provider IDs, MFA requirement, access status, and login timing.
- Portal assignment fields on `RosObject` for client visibility, client account context, assigned staff owner, and backup staff owner.
- `PortalInvitation` for client and staff invitation status.
- `AuditEvent` for sensitive auth and portal access history.
- Provider users resolve through the Koinonia database when available; database role and access status control portal permissions.
- Provider users must expose a real email address before portal matching or invitation acceptance can run.
- `/api/portal/invitations` for internal invitation record creation and review.
- `/api/portal/invitations/:id/revoke` for revoking unaccepted invitation records with audit history.
- `/api/portal/users` for staff access-status review.
- `/api/portal/users/:id/deactivate` for deactivating accepted portal users with audit history.
- `/api/portal/audit` for protected portal access audit history review.
- `/api/portal/showing-requests` for protected showing request create/list workflows.
- `/api/portal/documents` for protected scanner-gated document upload intake and document queue listing.
- `/api/portal/documents/[id]/download` for protected document downloads through configured private storage.
- `/api/portal/documents/[id]/status` for staff document workflow status updates with audit and timeline history.
- `/api/portal/access-requests` for protected external access request create/list workflows without storing credentials.
- `/api/portal/billing-setup-requests` for protected billing setup request create/list workflows without storing card data.
- `/api/portal/launch-proof` for protected staff launch-proof create/list workflows without storing credentials, card data, or private login details.
- `/api/portal/work-items/[id]/assignment` for protected staff assignment updates with timeline and audit history.
- `/client/work/[id]` for scoped client work detail with status, next action, safe metadata, attached documents, and timeline summaries.
- `/employee/access` can read portal users and portal invitation records for staff access readiness, with safe preview fallback when storage is unavailable.
- `/employee/access` includes a protected invitation form for creating portal invitations through the existing API.
- `/employee/access` includes protected action controls for revoking unaccepted invitations and deactivating active portal users.
- `/employee/dashboard` can read live portal work items, show primary/backup assignment status, and let authorized staff update assignments when production storage is reachable.
- `/employee/work/[id]` for staff work detail with assignment controls, safe metadata, attached documents, and timeline summaries.
- `/employee/readiness` gives staff a live readiness view for login, database, portal workflow, document, oversight, social login, and AI gates.
- `/employee/launch` gives staff a protected launch checklist for production provider setup, database access, service workflow QA, document handling, billing/payment setup, optional social login, optional AI review, and final dry-run proof.
- `/employee/launch` uses the same current readiness report as `/employee/readiness` for technical launch gates, while service workflow QA and end-to-end dry-run checks remain manual proof items.
- `/employee/launch` includes a staff proof form for manual launch items. Completed proof marks the item ready; follow-up proof keeps the item in attention status.
- `/employee/review` gives staff a protected rules-based review queue for missing assignments, document gaps, billing setup gaps, access needs, showing authorization, and stale work.
- Optional Clerk invitation email creation through `/api/portal/invitations` when `sendProviderInvitation` is true.
- First provider login can accept a matching Koinonia invitation, create the portal user, attach the approved role, and audit acceptance.
- Portal APIs return clean JSON auth errors for missing sessions or provider configuration problems.
- Permission tests for provider role mapping and typed denial behavior.
- `pnpm verify:portal` checks production auth env, upload storage env, mock-auth safety, database connectivity, workspace presence, seeded portal roles, and stored role permission lists.
- The verifier also checks for an active Owner portal user and requires active staff users to have MFA marked as required.
- The verifier and `/employee/readiness` require at least one accepted client invitation and one accepted staff invitation before login can be treated as production-ready.

Most protected portal screens still use sample fallback data when production storage is unavailable. `/employee/access` now has a database-backed access-readiness path, `/employee/dashboard` can review and update live work assignments, `/employee/review` can review live work/document records for staff oversight, the client dashboard current-work list can read owned `RosObject` records, clients and staff can open scoped work detail pages, showing requests now have a protected object-backed workflow, documents now have scanner-gated upload-intake, authorized download, and staff status-update workflows, external access requests now have a protected metadata-only workflow, and billing setup requests now have a protected metadata-only workflow. Invoice/payment processing, payment processor integration, document version/replacement, in-browser document editing, e-signature routing, and final archive delivery still need production passes.

---

## 3. Provider Configuration

`AUTH_PROVIDER` supports:

- `mock` for local preview only.
- `managed` for environment-aware behavior.
- `clerk` for explicit Clerk-backed production login.

When `AUTH_PROVIDER=managed`, the app uses Clerk only when both Clerk environment variables are present. Otherwise it falls back to local mock auth. In production, mock auth is blocked for portal routes unless `ROS_ALLOW_MOCK_AUTH=true` is explicitly set. Do not enable `ROS_ALLOW_MOCK_AUTH` on any deployment that can receive real client or staff data.

Recommended production value:

```bash
AUTH_PROVIDER=clerk
```

---

## 4. Required Production Auth Setup

Before production portal login, add production environment variables in the deployment host:

```bash
AUTH_PROVIDER=clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_AUTH_SIGN_IN_URL=
NEXT_PUBLIC_AUTH_SIGN_OUT_URL=
ROS_DEFAULT_WORKSPACE_ID=
PORTAL_DOCUMENT_UPLOAD_DIR=
PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND=
KOINONIA_PAYMENT_PROCESSOR_PROVIDER=
KOINONIA_PAYMENT_SETUP_URL=
KOINONIA_PAYMENT_WEBHOOK_SECRET=
KOINONIA_SOCIAL_LOGIN_CONFIGURED=false
KOINONIA_SOCIAL_LOGIN_PROVIDERS=
KOINONIA_SOCIAL_LOGIN_INVITE_MATCHING_VERIFIED=false
KOINONIA_AI_REVIEW_ENABLED=false
KOINONIA_AI_REVIEW_PROMPTS_APPROVED=false
KOINONIA_AI_PRIVACY_RULES_APPROVED=false
KOINONIA_AI_CITATIONS_REQUIRED=false
KOINONIA_AI_AUDIT_LOGGING_ENABLED=false
KOINONIA_AI_HUMAN_APPROVAL_REQUIRED=false
ROS_ALLOW_MOCK_AUTH=false
```

Production Clerk values must be real production keys. Placeholder values, example values, and test-key prefixes should fail readiness checks.

`PORTAL_DOCUMENT_UPLOAD_DIR` must be an absolute private storage path outside public web assets.

`KOINONIA_PAYMENT_SETUP_URL` must be a public HTTPS processor-hosted setup destination. The portal should not render raw card entry fields.

Then configure Clerk user metadata for Koinonia:

```json
{
  "koinoniaRole": "Client",
  "koinoniaWorkspaceId": "wks_koinonia"
}
```

Valid `koinoniaRole` values come from `packages/auth`:

- Owner
- Operations
- Transaction Coordinator
- Contract Support
- Showing Provider
- Customer Success
- Finance
- Viewer
- Client

Unknown provider roles are downgraded to Viewer.

Provider metadata can identify the intended workspace and role during setup, but a matched database user record is the source of truth for production portal permissions. Unknown, inactive, or blocked users are downgraded to Viewer.

---

## 5. Staff MFA Requirement

Koinonia internal users should require multi-factor authentication before accessing:

- Employee dashboard
- Staff assignment views
- Document workspace
- Billing workspace
- Client files
- Internal notes
- Audit events

Client MFA can be evaluated later, but staff MFA is a production requirement.

The source now calls Clerk auth with pending sessions treated as signed out. In production, Clerk must still be configured to require the `setup-mfa` session task for staff users or an equivalent MFA policy before staff portal access is considered ready.

The app hosts Clerk's `TaskSetupMFA` component at `/session-tasks/setup-mfa` and points the Clerk provider's `setup-mfa` task URL there.

---

## 5A. Social Login Recommendation

Social login is appropriate for the portal because many Realtor clients and staff already rely on Google or Microsoft identities.

Production social login must be configured through Clerk, not custom password handling inside Reynalds OS. The first recommended provider set is:

- Google for Gmail / Google Workspace users.
- Microsoft for Outlook / Microsoft 365 users.

Social login must stay invitation-gated:

- A provider login cannot create broad portal access by itself.
- The signed-in email must match an approved Koinonia invitation or active database user.
- The database role remains the source of truth for permissions.
- Staff social login still requires MFA before internal client, document, assignment, billing, or audit views are considered production-ready.
- If social login is enabled, readiness requires `KOINONIA_SOCIAL_LOGIN_PROVIDERS` to list only approved providers (`google`, `microsoft`) and `KOINONIA_SOCIAL_LOGIN_INVITE_MATCHING_VERIFIED=true` after real invited client and staff social-login tests.

---

## 5B. AI Review Launch Controls

AI should help staff notice missing documents, deadline risk, billing gaps, showing-access blockers, unsigned approvals, and stale work. It should not approve client-facing action, billing, contract language, or access changes by itself.

AI review is optional for base portal launch. If `KOINONIA_AI_REVIEW_ENABLED=true`, readiness requires:

- An approved AI provider configuration.
- Checklist-specific prompts approved by Koinonia.
- Privacy rules approved for client, transaction, document, billing, and access-request data.
- Source citations on AI findings so staff can verify why something was flagged.
- Audit logging for AI review activity.
- Human approval before AI recommendations change client-facing or billing state.

---

## 6. Invitation Flow Requirement

Before accepting real clients, build an owner/admin invitation flow that records:

- Client name
- Client email
- Client company/team
- Assigned Koinonia staff owner
- Backup staff owner
- Workspace ID
- Role
- Active package or service relationship
- Portal access status

Invitations should assign `koinoniaRole=Client` and the correct workspace before the user signs in.

`/api/portal/invitations` now supports the internal record and provider invitation handoff:

- `sendProviderInvitation: false` or omitted creates the Koinonia invitation record only.
- `sendProviderInvitation: true` creates the Koinonia record, then asks Clerk to send the provider invitation email.
- Provider invitation metadata includes `koinoniaRole`, `koinoniaWorkspaceId`, optional client object ID, and service context.
- If the provider send fails after the Koinonia record is created, the invitation is marked `provider_error` for staff review.
- When an invited email signs in and no Koinonia user exists yet, the auth layer can accept the matching invitation, create the user, require staff MFA for non-client roles, and mark the invitation accepted.
- Already-accepted invitations do not create new users; they must match an existing active Koinonia user record.
- Pending, provider-pending, and provider-error invitations can be revoked before acceptance.
- Accepted portal users can be deactivated, but users cannot deactivate their own access.

---

## 7. Production Verification Checklist

Before the portal accepts real data:

- Client user can reach `/client/dashboard`.
- Client user cannot reach `/employee/dashboard`.
- Only Owner or Operations can reach `/employee/access`.
- Staff user can reach only role-appropriate employee tools.
- Staff user requires MFA.
- Pending Clerk sessions cannot access protected portal routes.
- Staff with a pending `setup-mfa` task can be directed to `/session-tasks/setup-mfa`.
- Signed-out user is redirected to `/sign-in`.
- Clerk server and publishable keys use production key prefixes and are not placeholders.
- Unknown role becomes Viewer and cannot see portal data.
- `/api/me` returns the real provider-backed user.
- Provider users without an email address fail closed.
- Portal APIs use real session identity, not mock identity.
- Audit logging exists for sensitive actions.
- Portal invitation records exist before client/staff access is granted.
- A real client invitation and a real staff invitation have both been accepted and recorded.
- Staff can review active and inactive portal users through a protected API.
- Staff can review `/employee/review` findings for assignment, document, billing, access, showing, and stale-work gaps.
- Staff can review portal users, portal invitations, MFA readiness, and client access readiness in `/employee/access`.
- Staff can create portal invitation records from `/employee/access`.
- Staff can revoke unaccepted invitations and deactivate active portal users from `/employee/access`.
- Staff can review recent portal access audit history from `/employee/access`.
- Staff can review current production readiness gates from `/employee/readiness`.
- Staff can review the production launch checklist from `/employee/launch` before accepting real client data.
- Staff can use `/employee/launch` to distinguish automated readiness status from manual proof items.
- Staff can record launch proof for manual checklist items from `/employee/launch`; proof records must remain metadata-only and safe for audit review.
- Authorized staff can assign or reassign live portal work items to primary and backup staff from `/employee/dashboard`.
- Work assignment updates write timeline and audit history, and assignment notes must remain free of credentials, card data, bank details, API keys, and private login details.
- Clients can open scoped work detail pages for their own work items from `/client/dashboard`.
- Employee users with assigned-work access can open work detail pages from `/employee/dashboard`, with broader workspace visibility limited to roles that can manage assignments or client work.
- Work detail pages display safe metadata labels, attached document links through the protected download endpoint, and timeline summaries without dumping raw JSON payloads.
- Clients can create and review their own showing requests.
- Employee users with assigned-work access can review the showing request queue.
- Client dashboard current-work cards can read `RosObject` work records owned by the signed-in client.
- Portal-created showing, access, and billing setup requests populate explicit client/staff assignment fields for future assignment workflows.
- Clients can upload allowed document files only after upload storage is configured.
- Client users can review only their own submitted document records.
- Employee users with document-workspace access can review the document upload intake queue.
- Clients can download only their own stored portal documents through the protected download route.
- Employee users with document-workspace access can download stored workspace documents through the protected download route.
- Employee users can update live document workflow status only when their role has the required document-workspace permission for that status.
- Document status updates record audit history and related work-item timeline history when the document is tied to a work item.
- Document downloads reject missing, absolute, traversal, or malformed storage keys.
- Document upload and status-update notes reject passwords, access-code, payment-card, and bank-account language.
- Clients can create and review their own external access requests without submitting credentials.
- Employee users with client visibility can review the external access request queue.
- Access request notes reject passwords, usernames, access codes, recovery codes, and private login details.
- Clients can create and review their own billing setup requests without submitting card data.
- Employee users with billing-workspace access can review the billing setup request queue.
- Billing setup notes reject card numbers, CVV/CVC, bank details, routing numbers, account numbers, payment passwords, processor secrets, and API keys.
- Payment readiness requires an approved provider name, a public HTTPS processor-hosted setup URL, and a webhook secret before payment status should be treated as production-ready.
- Invitation record creation writes an audit event.
- Provider invitation creation writes a sent or provider-error audit event.
- Invitation acceptance writes an audit event and creates the portal user from the approved invitation.
- Invitation revocation writes an audit event and blocks later first-login acceptance.
- Portal user deactivation writes an audit event and blocks future portal permissions.
- Portal API auth failures return clear JSON status responses, not generic crashes.
- No brokerage passwords, MLS passwords, raw usernames, access codes, raw card numbers, CVV fields, bank details, routing numbers, account numbers, payment passwords, processor secrets, or API keys are accepted.
- `pnpm verify:portal` passes against the target production environment.
- The target environment has at least one active Owner portal user and no active staff users missing MFA requirement.
- The target environment has `PORTAL_DOCUMENT_UPLOAD_DIR` configured as an absolute private storage path before live document uploads are enabled.
- The target environment has `PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND` configured to an absolute executable scanner path before live document uploads are enabled.
- If social login is enabled, it is configured through the managed auth provider and verified against invitation matching, database role source-of-truth checks, and staff MFA.
- AI review remains read-only until provider configuration, checklist prompts, privacy boundaries, source citations, audit events, and staff approval gates are verified.

Run this before accepting real portal data:

```bash
pnpm verify:portal
```

For source-only verification without a database, the script supports:

```bash
pnpm verify:portal -- --skip-database
```

CI runs the source-only verifier with placeholder Clerk values. Production acceptance still requires running the verifier without `--skip-database` against the real deployment environment.

---

## 8. Current Blocker

The managed provider package is installed and wired. Production login is still blocked by deployment and account configuration, not by source scaffolding.

Do not mark login production-ready until Clerk production variables are configured, staff MFA is enabled, upload storage is configured, client/staff invitation flows exist, one client invite and one staff invite have been accepted, any enabled social login has passed invite-matching verification, any enabled AI review has passed privacy/citation/audit/human-approval verification, and the verification checklist passes with real provider users.

---

## 9. Verification Completed Locally

Verified on 2026-07-29:

- Auth package tests passed.
- Web production build passed.
- Database package build passed after Prisma client generation.
- Portal invitation API route compiled in the web production build.
- Portal invitation API returns 503 when storage is unavailable.
- Production preview with `ROS_ALLOW_MOCK_AUTH=true` returned 200 for `/sign-in`, `/client/billing`, `/employee/dashboard`, and `/api/me`.
- Production preview with `ROS_ALLOW_MOCK_AUTH=false` kept public `/client` available, redirected protected `/client/billing` to `/sign-in`, and returned 503 from `/api/me`.
