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
- MLS number or listing link, if available.
- Requested showing date.
- Preferred showing time or time window.
- Alternate time windows.
- Access method and access instructions.
- Showing service or platform used, if applicable.
- Appointment confirmation status.
- Client instructions.
- Safety notes.
- Pets, occupancy, gate, parking, alarm, lockbox, or access constraints.
- Whether the Realtor has authorized Koinonia to contact the buyer/client for scheduling.
- Preferred feedback format.
- Follow-up requested after showing.
- Rush or same-day flag.
- Distance or custom-pricing flag.

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
- CSV
- XLSX

Initial upload rules:

- Authenticated users only.
- Workspace-scoped access only.
- Work-item-scoped file ownership.
- File size limit.
- Allowlist file types.
- Generated storage filenames.
- Original filename stored only as metadata.
- Files stored outside the public webroot.
- Download through authorized application handlers or signed URLs.
- Upload, download, replacement, and deletion events logged.
- Virus/malware scanning added before production use with real client documents.

Do not allow executable, script, archive, or unknown file types in the MVP.

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
- Granted
- Blocked
- Expired
- Revoked

Example visible language:

Koinonia needs access to prepare this document. Please grant access through your brokerage-approved transaction platform or send an approved secure sharing link. Do not paste passwords into this portal.

---

## 9. Authentication Requirements

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

## 10. Recommended Data Model Additions

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
- `AuditEvent`

These should connect to existing Reynalds OS concepts rather than bypass them:

- `Workspace`
- `User`
- `RosObject`
- `Task`
- `Document`
- `TimelineEvent`

The preferred implementation should extend the Object Engine instead of creating a disconnected portal database.

---

## 11. MVP Build Order

Build the portal in safe slices:

1. Client portal specification and security decision. — Complete
2. Public `/client` login entry page with no sensitive forms. — Complete
3. Real auth provider selection and implementation plan.
4. Portal roles and permissions. — Scaffolded in `packages/auth`
5. Client dashboard shell using mocked/sample data only. — Preview route added at `/client/dashboard`
6. Work item detail shell using mocked/sample data only.
7. Showing request section using mocked/sample data only.
8. Database schema additions.
9. Authenticated read-only dashboard connected to real work items.
10. Secure file upload and document request flow.
11. Access request tracking without credential storage.
12. Portal messaging or notes.
13. Audit logs.
14. Production security review before accepting real client documents.

Do not begin with file upload or credential fields.

The `/client/dashboard` preview is not a production dashboard. It uses sample data only and must not receive real client documents, passwords, or confidential transaction details.

---

## 12. Launch Classification

This is not required for the public marketing website launch unless Jeremiah intentionally changes the launch scope.

Recommended classification:

Version 1.1 client operations enhancement.

Reason:

The public Koinonia site and consultation flow can launch without a full portal. The portal is strategically valuable, but it introduces authentication, document security, access control, and compliance questions that should not be rushed into the first public launch.

---

## 13. External Security References

Use these as implementation guardrails:

- OWASP File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- OWASP Secrets Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
- NIST SP 800-63B Digital Identity Guidelines: https://pages.nist.gov/800-63-4/sp800-63b.html
- Colorado Division of Real Estate, Employing Broker Supervision: https://dre.colorado.gov/division-programs/real-estate-broker/broker-practice-guidance/employing-broker-supervision
