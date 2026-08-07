# Decision Log

## D-001 — Use Shared Object Engine

Decision: Use `RosObject` as the central registry for business records.

Reason: Prevents disconnected module data and supports cross-module intelligence.

## D-002 — Use Timeline Events

Decision: Meaningful changes create timeline events.

Reason: Supports auditability, troubleshooting, and AI grounding.

## D-003 — Use Read-Only Copilot First

Decision: Copilot starts read-only.

Reason: Builds trust before allowing AI actions.

## D-004 — Use Workflow Engine as Long-Term Automation Core

Decision: Future automation should flow through workflow definitions and workflow runs.

Reason: Prevents each module from creating separate automation logic.

## D-005 — Move Away From Incremental Static App Shells

Decision: v7.2 static app shell should be considered superseded by the production Next.js app.

Reason: The project now needs a real running software workflow, not separate static prototype files.

## D-006 — Keep Brain Inside Repository

Decision: Store core architecture and development rules in `BRAIN/`.

Reason: Future development should start from repository truth, not memory.


## D-007 — Repository-First Completion Standard

Decision: Do not claim implementation, lock, completion, or release unless actual repository files were inspected, modified, documented, versioned, and packaged.

Reason: Prevents conceptual work from being mistaken for production work.

## D-008 — Continuity Package Required

Decision: Every release must include a continuity package that enables future chats/developers to resume accurately.

Reason: Reynalds OS must preserve context across conversations without relying on memory.

## D-009 — Koinonia Website Built Component-First

Decision: Koinonia website pages should be assembled from canonical components wherever possible.

Reason: Improves consistency, reduces duplicate code, and accelerates launch.

## D-010 — Launch First

Decision: Website launch work takes priority over future Reynalds OS expansion unless an architectural improvement directly accelerates the website.

Reason: Prevents feature creep and keeps Koinonia moving toward publication.

## D-011 — Client Portal Must Not Store Third-Party Login Credentials

Decision: The Koinonia client portal may track access needs, document uploads, work status, and authorization history, but it must not collect or store raw third-party usernames and passwords for brokerage, MLS, transaction-management, forms, e-signature, CRM, email, or related systems.

Reason: Client credentials are high-risk secrets. Koinonia should use delegated access, team or assistant accounts, transaction coordinator permissions, broker-approved workflows, or an approved external encrypted password manager/secrets platform instead of turning the website into an unreviewed credential vault.

Canonical specification: `docs/specifications/KOINONIA_CLIENT_PORTAL_SPEC.md`

## D-012 — Employee Portal Assigns Clients and Work by Role

Decision: The Koinonia employee portal should track staff assignment, client ownership, work ownership, capacity, handoffs, and escalation state using role-based visibility.

Reason: Koinonia cannot scale beyond owner-operated support unless every client and work item has a clear internal owner, backup path, and capacity-aware assignment history. Showing providers, contract support, transaction coordinators, finance, customer success, operations, and owner roles should only see the internal information needed for their responsibility.

Canonical specification: `docs/specifications/KOINONIA_EMPLOYEE_PORTAL_SPEC.md`

## D-013 — Document Workspace Requires Approval, Versioning, and Send Trail

Decision: Koinonia's portal should include a transaction document workspace for client uploads, missing document requests, drafting support, version history, Realtor approval, send package tracking, signature status, and final archive.

Reason: A transaction management company is judged by whether documents, deadlines, approvals, and communication stay organized. Document preparation and sending are high-trust workflows, so Koinonia needs clear version control, explicit Realtor approval, role-based access, and an audit trail before live client documents move through the portal.

Canonical specification: `docs/specifications/KOINONIA_DOCUMENT_WORKSPACE_SPEC.md`

## D-014 — Billing Profiles Use Processor References, Not Raw Card Storage

Decision: Koinonia customer files should include billing profiles, service billing models, invoice status, pay-at-closing triggers, and payment setup state, but the portal should not store raw credit card numbers or CVV/CVC codes.

Reason: Koinonia needs to bill prepaid, pay-at-closing, monthly, showing, and custom service work without turning the portal into a high-risk cardholder data vault. Payment details should be collected through an approved payment processor, and Koinonia should store only safe processor references, payment method metadata, consent history, invoice state, and audit events.

Canonical specification: `docs/specifications/KOINONIA_BILLING_PAYMENT_SPEC.md`

## D-015 — Portal Login Uses Managed Auth Before Real Data

Decision: Koinonia client and employee portal routes must use managed authentication before accepting real client documents, billing setup, internal notes, staff assignments, or access requests.

Reason: Portal users include Realtor clients, Koinonia staff, finance, operations, contract support, showing providers, and owner/admin users. These roles require unique identity, workspace scoping, role-based permissions, staff MFA, session expiration, secure invitation, and audit logging. Mock auth may remain only for local preview and must fail closed in production portal routes unless explicitly allowed for a non-data preview.

Canonical specification: `docs/specifications/KOINONIA_AUTH_PRODUCTION_READINESS.md`

## D-016 — Product Registry Fails Fast on Invalid Canonical Metadata

Decision: The executable product registry must validate itself when loaded and throw a structured `ProductRegistryValidationError` when canonical product identifiers, workspace routes, or workspace order values conflict.

Reason: Returning validation issues only in tests is not sufficient protection for a canonical runtime source. Failing fast prevents ambiguous product identity and navigation metadata from silently reaching the application interface.

Canonical sources: `BRAIN/APPLICATION_CATALOG.md` and `apps/web/lib/productRegistry.ts`

## D-017 — Workspace Navigation Order Is Verified Independently of Registry Position

Decision: Workspace query helpers must accept an explicit product registry for focused verification, and workspace navigation must be sorted by each entry's declared `order` rather than by product array position.

Reason: A single canonical workspace entry cannot prove ordering behavior. Parameterized queries allow deterministic multi-entry tests that verify public products are excluded, workspace products remain complete, and navigation placement follows metadata even when registry entries are deliberately out of order.

Canonical sources: `BRAIN/APPLICATION_CATALOG.md` and `apps/web/lib/productRegistry.ts`

## D-018 — Portal Documents Use R2 with Scan-Before-Persist

Decision: Live Koinonia portal documents must use private Cloudflare R2 storage and must pass the configured malware scanner before the file is persisted to R2.

Reason: Vercel/local filesystem paths are not durable production document storage, and Koinonia document workflows may contain sensitive transaction files. The portal should use private object storage, protected download routes, audit history, and scan-before-persist handling rather than relying on public assets or unverified local disk writes.

Canonical specification: `docs/specifications/KOINONIA_AUTH_PRODUCTION_READINESS.md`

## D-019 — Send Package Status Requires Delivery Confirmation

Decision: Koinonia document send packages cannot be marked `Sent`, `Signature Monitoring`, or `Completed` unless staff records a safe delivery/signature/archive confirmation.

Reason: Send-package status is operational evidence. Without a confirmation requirement, staff could accidentally mark a document package as delivered or complete without traceable delivery proof. The confirmation must still avoid passwords, access codes, payment details, API keys, and private login details.

Canonical specification: `docs/specifications/KOINONIA_DOCUMENT_WORKSPACE_SPEC.md`

## D-020 — Koinonia Uses a Dedicated Cumulative Production Release Line

Decision: Establish `koinonia-production` as the permanent Koinonia production/release branch. Public Koinonia releases must advance cumulatively from that branch rather than promoting `main`, `chatgpt/portal-access-status`, `feature/app-shell-foundation`, or another development branch directly.

Reason: The shared monorepo contains unrelated project changes and Koinonia portal development that must not be published merely because a public website feature is ready. A dedicated Koinonia production line protects the live site, keeps unrelated work isolated, and ensures later releases preserve previously approved public features such as `/jeremiah`.

Initial release plan: create `koinonia-production` from the currently live Koinonia commit `83d3dda31c500e36ac42f7258d5fdb79fef69c0e`, then add only the four approved digital-business-card files and verify an isolated preview before changing live Vercel routing.

Portal rule: when the client/employee portal is ready, integrate the approved portal feature set into the then-current Koinonia production baseline. Do not replace production with the portal development branch.

Isolation rule: Koinonia production work must not include or modify Personal Finance, Reynalds Brothers, or unrelated Reynalds OS work.

Status as of 2026-08-07: decision approved and documented; `koinonia-production` has not yet been created and no live domain change has been made.

Canonical deployment record: `BRAIN/KOINONIA_DEPLOYMENT_READINESS.md`.
