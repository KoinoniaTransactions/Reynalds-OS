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
- A secure catch-all login route at `/sign-in/[[...sign-in]]`.
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
- Optional Clerk invitation email creation through `/api/portal/invitations` when `sendProviderInvitation` is true.
- First provider login can accept a matching Koinonia invitation, create the portal user, attach the approved role, and audit acceptance.
- Portal APIs return clean JSON auth errors for missing sessions or provider configuration problems.
- Permission tests for provider role mapping and typed denial behavior.

The protected routes still use sample data only. They are guarded screens, not production data workflows.

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

---

## 7. Production Verification Checklist

Before the portal accepts real data:

- Client user can reach `/client/dashboard`.
- Client user cannot reach `/employee/dashboard`.
- Only Owner or Operations can reach `/employee/access`.
- Staff user can reach only role-appropriate employee tools.
- Staff user requires MFA.
- Pending Clerk sessions cannot access protected portal routes.
- Signed-out user is redirected to `/sign-in`.
- Unknown role becomes Viewer and cannot see portal data.
- `/api/me` returns the real provider-backed user.
- Provider users without an email address fail closed.
- Portal APIs use real session identity, not mock identity.
- Audit logging exists for sensitive actions.
- Portal invitation records exist before client/staff access is granted.
- Invitation record creation writes an audit event.
- Provider invitation creation writes a sent or provider-error audit event.
- Invitation acceptance writes an audit event and creates the portal user from the approved invitation.
- Portal API auth failures return clear JSON status responses, not generic crashes.
- No brokerage passwords, MLS passwords, raw card numbers, or CVV fields are accepted.

---

## 8. Current Blocker

The managed provider package is installed and wired. Production login is still blocked by deployment and account configuration, not by source scaffolding.

Do not mark login production-ready until Clerk production variables are configured, staff MFA is enabled, client/staff invitation flows exist, and the verification checklist passes with real provider users.

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
