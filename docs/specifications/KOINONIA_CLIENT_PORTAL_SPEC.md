# Koinonia Client Portal Specification

Status: Proposed MVP architecture  
Date: 2026-07-28  
Owner: Koinonia Transactions  
Applies To: Realtor client login, file exchange, work tracking, and access coordination

---

## 1. Purpose

Koinonia needs a secure client portal where Realtor clients can:

- Log in.
- See active, pending, waiting, and completed work.
- Upload documents for transaction, contract, showing, or operations support.
- Review what Koinonia needs from them.
- Exchange files and notes without relying only on email or text.
- Track access requests needed for Koinonia to perform approved work.

This should be a client operations portal, not a generic marketing page.

The portal should support Koinonia's existing service boundary:

Koinonia provides operational support. Realtors remain responsible for client advice, negotiation decisions, brokerage compliance, legal questions, final approval, and authorization.

---

## 2. Critical Security Boundary

The portal must not collect or store raw third-party login usernames and passwords for brokerage, MLS, transaction-management, forms, e-signature, CRM, email, or lender/title systems.

Do not build a website form such as:

- Brokerage login username
- Brokerage login password
- CTM/eContracts password
- MLS password
- Email password
- DocuSign/Authentisign password

Reason:

Client credentials are high-risk secrets. If Koinonia stores them directly, the portal becomes a credential vault and must meet a much higher security, legal, insurance, audit, and breach-response burden than a normal client dashboard.

The safer portal model is:

1. Track what access is needed.
2. Tell the Realtor how to grant Koinonia access through approved delegated access, team access, transaction coordinator access, or broker-approved user permissions.
3. Record whether access is requested, granted, blocked, expired, or revoked.
4. If no delegated-access option exists, handle credential sharing outside the portal through an approved encrypted password manager or dedicated secrets platform until a formal credential-vault architecture is approved.

The portal may store access request metadata.

The portal must not store the secret itself.

The first production slice stores safe access request metadata as `AccessRequest` objects through `/api/portal/access-requests`. It tracks platform, access purpose, requested permission level, status, related work label, client label, and safe notes while rejecting passwords, usernames, passcodes, lockbox codes, gate codes, recovery codes, and private login details.

---

## 3. Contract-Writing Boundary

When Koinonia prepares contracts or documents:

- Work must be based on Realtor instructions.
- The Realtor remains responsible for final approval.
- The Realtor or brokerage-approved process must control final submission, signature, and compliance review.
- Koinonia should not impersonate a Realtor by using the Realtor's personal credentials as though Koinonia were that Realtor.
- Access should use delegated permissions, assistant/team accounts, transaction coordinator access, or broker-approved workflows whenever available.

The portal should include an authorization trail before contract/document work begins:

- Who requested the work.
- What document or contract is being prepared.
- What instructions were provided.
- What system access is needed.
- Whether brokerage or team access is required.
- Whether Realtor approval is still pending.
- Whether the work is ready for Realtor review.
- Whether final approval has been given.

---

## 4. Initial Portal Scope

### Public Entry

Route:

`/client`

Purpose:

Dedicated login entry for Realtor clients.

The public site may eventually link to this route as:

- Client Login
- Client Portal

Do not place file upload or sensitive access forms on the public unauthenticated page.

### Authenticated Dashboard

Route:

`/client/dashboard`

Purpose:

Show the logged-in Realtor what is happening with their work.

Expected dashboard sections:

- Active Work
- Waiting on You
- Pending Review
- Document Center
- Billing Center
- Showing Requests
- Completed Work
- Recently Uploaded Documents
- Access Needed
- Messages or Notes

### Work Item Detail

Route pattern:

`/client/work/[id]`

Purpose:

One page per transaction, contract/document request, showing request, or monthly operations item.

Expected sections:

- Work status
- Next action
- Key dates or deadlines
- Uploaded files
- Files requested from Realtor
- Notes and instructions
- Access requests
- Internal status history visible to Koinonia
- Client-facing status history visible to the Realtor

### Document Center

Route:

`/client/documents`

Purpose:

Give Realtor clients a focused place to upload requested files, review prepared drafts, approve or request revisions, track sent/signature status, and download final archived documents.

Expected sections:

- Documents needed
- Missing terms
- Drafts ready for review
- Approval requests
- Sent/signature status
- Recent uploads
- Completed document archive

Rules:

- Client users should see only documents tied to their own account, work item, or transaction file.
- Draft approvals must record who approved, when approval occurred, and what version was approved.
- Clients should not see internal staff notes, template administration, unrelated client files, or internal send-package controls.
- The first document intake slice stores upload metadata and file references through `/api/portal/documents` when both the production database and `PORTAL_DOCUMENT_UPLOAD_DIR` are configured.
- Client users can create and review their own submitted document records.
- Employee users with document-workspace access can review the workspace upload intake queue.
- Upload notes must not include passwords, lockbox codes, gate codes, MLS login details, e-signature login details, or other access secrets.

### Billing Center

Route:

`/client/billing`

Purpose:

Give Realtor clients a safe place to view selected services, service billing model, invoices, payment method setup status, pay-at-closing status, and payment history.

Expected sections:

- Billing profile
- Services selected
- Payment method setup
- Open invoices
- Pay-at-closing status
- Monthly/custom billing status
- Payment history

Rules:

- Client users should not enter raw card numbers or CVV/CVC into Koinonia portal fields.
- Payment setup should happen through an approved processor-hosted flow.
- The portal may show safe metadata such as brand, last four digits, expiration, payment setup status, and consent history.
- Each service activation should clearly show whether billing is prepaid, pay-at-closing, monthly, per showing, or custom.
- The first billing setup slice stores safe setup metadata as `BillingSetupRequest` objects through `/api/portal/billing-setup-requests`.
- Client users can create and review their own billing setup requests.
- Employee users with billing-workspace access can review the workspace billing setup request queue.
- Billing setup notes must not include raw card numbers, CVV/CVC, bank details, routing numbers, account numbers, payment passwords, processor secrets, or API keys.

### Showing Request Section

The portal should include a dedicated showing request section because showing coverage is time-sensitive and different from ordinary document exchange.

Client-facing labels may include:

- Request Showing Coverage
- Schedule Client Showing
- Showing Requests

Primary use cases:

- A Realtor asks Koinonia to cover one showing.
- A Realtor asks Koinonia to schedule a client for one or more showings.
- A Realtor asks Koinonia to coordinate showing details before a licensed provider is assigned.
- A Realtor reviews showing confirmation, completion notes, and feedback.

The showing request form should collect:

- Request type: coverage needed, scheduling help needed, or both.
- Realtor/client account.
- Buyer or client name.
- Buyer/client phone or email, if Koinonia is approved to coordinate directly.
- Property address.
- Preferred showing time or time window.
- Whether the Realtor has authorized Koinonia to contact the buyer/client for scheduling.

The first production slice stores showing requests as `ShowingRequest` objects through `/api/portal/showing-requests`. It captures property, timing, request type, buyer/client label, approved contact, authorization, and scheduling notes.

Access-sensitive details such as lockbox codes, gate codes, door codes, passwords, MLS login details, alarm codes, or other private access secrets must not be entered into the general showing request notes. Those require a separate approved secure sharing flow before production use.

The showing request should show these client-facing statuses:

- Intake Needed
- Waiting on Client
- Checking Availability
- Scheduling Requested
- Showing Scheduled
- Licensed Provider Assigned
- Showing Confirmed
- Showing Completed
- Feedback Sent
- Closed
- Unable to Cover

Rules:

- No showing should be marked confirmed until access instructions and licensed coverage are confirmed.
- Same-day requests should be flagged as rush and accepted only if capacity allows.
- If Koinonia is scheduling directly with a buyer/client, the Realtor's authorization should be recorded before contact occurs.
- Showing providers should only receive the assigned showing details, access instructions, safety notes, and feedback form needed for that showing.
- Client users can create and review their own showing requests.
- Employee users with assigned-work access can review the workspace showing request queue.

---

## 5. Work Status Model

Use clear status language that matches the client experience.

Recommended visible statuses:

- Pending Intake
- Waiting on Client
- Active
- Ready for Review
- Completed
- On Hold
- Canceled

Internal status details may be more granular, but the client-facing dashboard should stay calm and readable.

---

## 6. Service-Specific Intake Model

The portal should collect a shared intake core first, then service-specific details.

Shared intake:

- Requested service or package.
- Work item name.
- Priority.
- Desired deadline.
- Main point of contact.
- Files or instructions needed.
- Approval/authorization status.
- Notes.

Service-specific flows:

- Transaction Coordination Plus and Pay-at-Closing Coordination should collect contract-to-close dates, parties, deadlines, title/lender/broker contacts, documents, and payment model.
- Contract and Document Support should collect document type, Realtor instructions, transaction terms, property details, supporting files, access needs, and final approval status.
- Licensed Showing Coverage should use the showing request section described above.
- Monthly Operations Partnership should collect plan tier, recurring tasks, systems involved, monthly priorities, hours used, hours remaining, and check-in cadence.
- Realtor Support Plus should allow the Realtor to open transaction, contract, showing, and operations requests from the same account workspace.

---

## 7. File Exchange Requirements

Clients should be able to upload:

- PDF
- DOC
- DOCX
- JPG
- PNG
- XLS
- XLSX

Initial upload rules:

- Authenticated users only.
- Workspace-scoped access only.
- Work-item-scoped file ownership.
- File size limit: 25 MB for the first production slice.
- Allowlist file types.
- Generated storage filenames.
- Original filename stored only as metadata.
- Files stored outside the public webroot.
- Download through authorized application handlers or signed URLs.
- Upload, download, replacement, and deletion events logged.
- Virus/malware scanning added before production use with real client documents.

Do not allow executable, script, archive, or unknown file types in the MVP.

Current implementation note:

`/api/portal/documents` accepts PDF, Word, Excel, JPG, and PNG uploads only when `PORTAL_DOCUMENT_UPLOAD_DIR` and `PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND` are configured. It writes generated storage keys, runs the configured scanner command against the stored file before saving the document record, creates `Document` records with owner/upload metadata, records portal audit events, and keeps uploads out of public web paths. `/api/portal/documents/[id]/download` serves stored files only after portal permission, workspace, ownership, storage-key, and private-storage checks pass, and it records a download audit event. It does not yet provide replacement/version controls, approval records, or e-signature delivery.

---

## 8. Access Coordination Model

The portal should create an `AccessRequest`, not a password field.

Example access request fields:

- Work item
- Platform name
- Access purpose
- Requested permission level
- Instructions for granting access
- Status
- Requested by
- Requested at
- Granted at
- Expiration date
- Revoked at
- Notes

Recommended statuses:

- Not Needed
- Needed
- Requested
- Waiting on Client
- Client Says Granted
- Granted
- Blocked
- Expired
- Revoked

Example visible language:

Koinonia needs access to prepare this document. Please grant access through your brokerage-approved transaction platform or send an approved secure sharing link. Do not paste passwords into this portal.

Current implementation note:

`/api/portal/access-requests` lets client users create and review their own external access requests. Employee users with client visibility can review the workspace access request queue. The client dashboard includes a safe access update form and the employee access workspace includes an external access request queue. This is not a credential vault and does not store the secret itself.

---

## 9. Billing Setup Model

The portal should create a `BillingSetupRequest`, not a raw payment-method field.

Example billing setup request fields:

- Service name
- Billing model
- Amount label
- Trigger description
- Consent acknowledgement
- Status
- Requested by
- Requested at
- Processor setup status
- Safe processor reference after setup
- Notes

Recommended statuses:

- Setup Requested
- Consent Needed
- Processor Link Needed
- Payment Method Ready
- Pay at Close Watch
- Blocked

Example visible language:

Koinonia can send a secure payment setup link for this service. Do not enter card numbers, CVV codes, bank details, or payment credentials into this portal.

Current implementation note:

`/api/portal/billing-setup-requests` lets client users create and review their own billing setup requests. Employee users with billing-workspace access can review the workspace setup queue. The client billing center includes a setup request form and the employee billing workspace includes a setup request queue. This workflow stores billing intent, consent, status, service context, and safe notes only. It does not store payment card data or process charges.

---

## 10. Authentication Requirements

The current repository uses mock auth.

Before building the real client portal, replace mock auth with a managed authentication provider or an equivalent production-grade auth system.

Minimum requirements:

- Unique user identity.
- Role-based permissions.
- Workspace scoping.
- Realtor/client role.
- Koinonia internal role.
- Admin/owner role.
- Multi-factor authentication for Koinonia internal users.
- Session expiration.
- Secure password reset.
- Audit logs for sensitive actions.

The portal should not go live with mock auth.

---

## 11. Recommended Data Model Additions

These models should be refined before implementation:

- `ClientAccount`
- `ClientPortalMembership`
- `WorkItem`
- `ShowingRequest`
- `WorkItemParticipant`
- `ClientDocument`
- `DocumentRequest`
- `PortalMessage`
- `AccessRequest`
- `BillingSetupRequest`
- `AuditEvent` — Prisma model scaffolded for auth and portal access history.

These should connect to existing Reynalds OS concepts rather than bypass them:

- `Workspace`
- `User`
- `RosObject`
- `Task`
- `Document`
- `TimelineEvent`

The preferred implementation should extend the Object Engine instead of creating a disconnected portal database.

---

## 12. MVP Build Order

Build the portal in safe slices:

1. Client portal specification and security decision. — Complete
2. Public `/client` login entry page with no sensitive forms. — Complete
3. Real auth provider selection and implementation plan. — Clerk-ready scaffold documented in `docs/specifications/KOINONIA_AUTH_PRODUCTION_READINESS.md`
4. Portal roles and permissions. — Scaffolded in `packages/auth`
5. Client dashboard shell using mocked/sample data only. — Preview route added at `/client/dashboard`
6. Work item detail shell using mocked/sample data only.
7. Showing request section with protected create/list API, client request form, employee queue visibility, and safe preview fallback.
8. Client document center with protected upload intake API, client upload form, employee intake queue visibility, and safe preview fallback.
9. Client billing center with protected billing setup request API, client setup form, employee queue visibility, and safe preview fallback.
10. Database schema additions. — Portal identity fields, `PortalInvitation`, and `AuditEvent` scaffolded in Prisma.
11. Authenticated read-only dashboard connected to real work items. — Preview routes now require portal permissions but still use sample data only.
12. Secure file upload and document request flow. — Guarded upload intake, scanner-gated uploads, and authorized download route added; version/replacement still required.
13. Access request tracking without credential storage. — First protected access request create/list API, client update form, employee queue, and credential-note rejection added.
14. Portal messaging or notes.
15. Audit logs. — `AuditEvent` model scaffolded; invitation creation writes audit event.
16. Production security review before accepting real client documents or live payment methods.

Do not begin with file upload or credential fields.

The `/client/dashboard` preview is not a complete production dashboard. It has protected showing request support, while documents now have a scanner-gated upload-intake path and authorized download route, and billing now has a metadata-only setup request path. Do not accept full real client document exchange until storage, download, scanning, approval, and archive controls are configured and verified. Do not accept live payment methods until the approved processor-hosted setup flow and payment processor integration are configured and verified.

---

## 13. Launch Classification

This is not required for the public marketing website launch unless Jeremiah intentionally changes the launch scope.

Recommended classification:

Version 1.1 client operations enhancement.

Reason:

The public Koinonia site and consultation flow can launch without a full portal. The portal is strategically valuable, but it introduces authentication, document security, access control, and compliance questions that should not be rushed into the first public launch.

---

## 14. External Security References

Use these as implementation guardrails:

- OWASP File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- OWASP Secrets Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
- NIST SP 800-63B Digital Identity Guidelines: https://pages.nist.gov/800-63-4/sp800-63b.html
- Colorado Division of Real Estate, Employing Broker Supervision: https://dre.colorado.gov/division-programs/real-estate-broker/broker-practice-guidance/employing-broker-supervision
