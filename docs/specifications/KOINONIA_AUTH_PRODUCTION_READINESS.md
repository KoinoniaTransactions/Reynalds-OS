# Koinonia Auth Production Readiness

Status: Scaffolded  
Applies To: Client portal, employee portal, document workspace, billing workspace, and portal APIs

---

## 1. Current Decision

Koinonia portal login should use managed authentication. The app is scaffolded for Clerk as the first managed provider path, while local preview can still use mock users.

The portal must not accept real client documents, billing setup, staff assignments, internal notes, or access requests until managed authentication is configured and verified.

---

## 2. Current Implementation

The current web app includes:

- A secure login entry route at `/sign-in`.
- Public client and employee entry pages at `/client` and `/employee`.
- Protected client portal preview routes:
  - `/client/dashboard`
  - `/client/documents`
  - `/client/billing`
- Protected employee portal preview routes:
  - `/employee/dashboard`
  - `/employee/documents`
  - `/employee/billing`
- Async session lookup in `apps/web/lib/auth.ts`.
- Route-level permission guards in `apps/web/lib/portal-auth.ts`.
- Role normalization and provider-user construction in `packages/auth`.
- Permission tests for provider role mapping and typed denial behavior.

The protected routes still use sample data only. They are guarded screens, not production data workflows.

---

## 3. Provider Configuration

`AUTH_PROVIDER` supports:

- `mock` for local preview only.
- `managed` for environment-aware behavior.
- `clerk` for explicit Clerk-backed production login.

When `AUTH_PROVIDER=managed`, the app uses Clerk only when Clerk environment variables are present. Otherwise it falls back to local mock auth. In production, mock auth is blocked for portal routes unless `ROS_ALLOW_MOCK_AUTH=true` is explicitly set. Do not enable `ROS_ALLOW_MOCK_AUTH` on any deployment that can receive real client or staff data.

Recommended production value:

```bash
AUTH_PROVIDER=clerk
```

---

## 4. Required Production Auth Setup

Before production portal login:

1. Install the managed auth package:

```bash
pnpm --filter @reynalds-os/web add @clerk/nextjs
```

2. Add production environment variables in the deployment host:

```bash
AUTH_PROVIDER=clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_AUTH_SIGN_IN_URL=
NEXT_PUBLIC_AUTH_SIGN_OUT_URL=
ROS_DEFAULT_WORKSPACE_ID=
```

3. Configure Clerk user metadata for Koinonia:

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

---

## 7. Production Verification Checklist

Before the portal accepts real data:

- Client user can reach `/client/dashboard`.
- Client user cannot reach `/employee/dashboard`.
- Staff user can reach only role-appropriate employee tools.
- Staff user requires MFA.
- Signed-out user is redirected to `/sign-in`.
- Unknown role becomes Viewer and cannot see portal data.
- `/api/me` returns the real provider-backed user.
- Portal APIs use real session identity, not mock identity.
- Audit logging exists for sensitive actions.
- No brokerage passwords, MLS passwords, raw card numbers, or CVV fields are accepted.

---

## 8. Current Blocker

The code is ready for the managed provider package, but the local package install was blocked by machine-level pnpm store permissions during this implementation session. The package still needs to be installed and committed with the lockfile before production auth can run.

Do not mark login production-ready until the package is installed, the deployment variables are configured, staff MFA is enabled, and the verification checklist passes.
