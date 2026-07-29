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
- Protected employee portal preview routes:
  - `/employee/dashboard`
  - `/employee/access`
  - `/employee/documents`
  - `/employee/billing`
- Async session lookup in `apps/web/lib/auth.ts`.
- Clerk session lookup explicitly treats pending sessions as signed out.
- Route-level permission guards in `apps/web/lib/portal-auth.ts`.
- Role normalization and provider-user construction in `packages/auth`.
- Database seed creates all approved Koinonia role names for portal assignment.
- Portal identity fields on `User` for auth provider IDs, MFA requirement, access status, and login timing.
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
- `/api/portal/documents` for protected document upload intake and document queue listing.
- `/api/portal/access-requests` for protected external access request create/list workflows without storing credentials.
- `/employee/access` can read portal users and portal invitation records for staff access readiness, with safe preview fallback when storage is unavailable.
- `/employee/access` includes a protected invitation form for creating portal invitations through the existing API.
- `/employee/access` includes protected action controls for revoking unaccepted invitations and deactivating active portal users.
- Optional Clerk invitation email creation through `/api/portal/invitations` when `sendProviderInvitation` is true.
- First provider login can accept a matching Koinonia invitation, create the portal user, attach the approved role, and audit acceptance.
- Portal APIs return clean JSON auth errors for missing sessions or provider configuration problems.
- Permission tests for provider role mapping and typed denial behavior.
- `pnpm verify:portal` checks production auth env, upload storage env, mock-auth safety, database connectivity, workspace presence, and seeded portal roles.
- The verifier also checks for an active Owner portal user and requires active staff users to have MFA marked as required.

Most protected portal screens still use sample data only. `/employee/access` now has a database-backed access-readiness path, showing requests now have a protected object-backed workflow, documents now have a guarded upload-intake workflow, and external access requests now have a protected metadata-only workflow. Billing, broader dashboard work tracking, document download/version/replacement/scanning, and client workspaces still need real workflow storage before production use.

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
ROS_ALLOW_MOCK_AUTH=false
```

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
- Unknown role becomes Viewer and cannot see portal data.
- `/api/me` returns the real provider-backed user.
- Provider users without an email address fail closed.
- Portal APIs use real session identity, not mock identity.
- Audit logging exists for sensitive actions.
- Portal invitation records exist before client/staff access is granted.
- Staff can review active and inactive portal users through a protected API.
- Staff can review portal users, portal invitations, MFA readiness, and client access readiness in `/employee/access`.
- Staff can create portal invitation records from `/employee/access`.
- Staff can revoke unaccepted invitations and deactivate active portal users from `/employee/access`.
- Staff can review recent portal access audit history from `/employee/access`.
- Clients can create and review their own showing requests.
- Employee users with assigned-work access can review the showing request queue.
- Clients can upload allowed document files only after upload storage is configured.
- Client users can review only their own submitted document records.
- Employee users with document-workspace access can review the document upload intake queue.
- Document upload notes reject passwords and access-code language.
- Clients can create and review their own external access requests without submitting credentials.
- Employee users with client visibility can review the external access request queue.
- Access request notes reject passwords, usernames, access codes, recovery codes, and private login details.
- Invitation record creation writes an audit event.
- Provider invitation creation writes a sent or provider-error audit event.
- Invitation acceptance writes an audit event and creates the portal user from the approved invitation.
- Invitation revocation writes an audit event and blocks later first-login acceptance.
- Portal user deactivation writes an audit event and blocks future portal permissions.
- Portal API auth failures return clear JSON status responses, not generic crashes.
- No brokerage passwords, MLS passwords, raw usernames, access codes, raw card numbers, or CVV fields are accepted.
- `pnpm verify:portal` passes against the target production environment.
- The target environment has at least one active Owner portal user and no active staff users missing MFA requirement.
- The target environment has `PORTAL_DOCUMENT_UPLOAD_DIR` configured before live document uploads are enabled.

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

Do not mark login production-ready until Clerk production variables are configured, staff MFA is enabled, upload storage is configured, client/staff invitation flows exist, and the verification checklist passes with real provider users.

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
