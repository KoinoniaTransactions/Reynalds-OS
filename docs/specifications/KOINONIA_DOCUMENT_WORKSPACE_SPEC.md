# Koinonia Document Workspace Specification

Status: Proposed MVP architecture  
Date: 2026-07-28  
Owner: Koinonia Transactions  
Applies To: Transaction document management, drafting support, review, approval, sending, signature tracking, and archive

---

## 1. Purpose

Koinonia needs a portal document workspace that supports the day-to-day work of a transaction management company.

The workspace should help Koinonia:

- Receive transaction documents from Realtor clients.
- Request missing documents.
- Track document readiness against each transaction file.
- Prepare document drafts from Realtor instructions.
- Track missing terms and required inputs.
- Manage versions and revisions.
- Send drafts to Realtors for review.
- Record Realtor approval before final sending or signature routing.
- Track signature package status.
- Archive final documents and delivery history.

This should be a transaction document operations system, not a generic file folder.

---

## 2. Service Boundary

Koinonia may prepare and organize real estate documents based on Realtor instructions.

Koinonia should not:

- Provide legal advice.
- Choose negotiation terms.
- Make client business decisions.
- Replace brokerage compliance review.
- Send final documents without Realtor approval unless a documented approved workflow exists.
- Store raw third-party login credentials for forms, MLS, brokerage, or e-signature platforms.

Portal language should reinforce:

Koinonia prepares documents from Realtor instructions. Realtors remain responsible for client advice, negotiation decisions, brokerage compliance, legal questions, final approval, and authorization to send.

---

## 3. Client-Facing Document Center

Route:

`/client/documents`

Purpose:

Give Realtor clients a calm place to see what Koinonia needs, review drafts, approve or request revisions, and see final documents.

Expected client sections:

- Documents Needed
- Upload Requests
- Drafts Ready for Review
- Approval Requests
- Sent / Signature Status
- Completed Documents
- Transaction File Archive

Client actions:

- Upload a requested document.
- View document request details.
- Review a prepared draft.
- Approve a draft.
- Request revisions.
- Add instructions or missing terms.
- Download approved/final files.
- View signature package status.

Client users should not see internal staff notes, staff assignment logic, template administration, or unrelated client files.

---

## 4. Employee-Facing Document Workspace

Route:

`/employee/documents`

Purpose:

Give Koinonia staff the operational tools needed to prepare, review, send, and archive documents across transaction files.

Expected employee sections:

- Draft Queue
- Missing Terms
- Template Library
- Version History
- Quality Review
- Approval Requests
- Send Queue
- Signature Tracking
- Final Archive
- Audit Trail

Employee tools:

- Create drafting request.
- Attach document to transaction file.
- Add required terms checklist.
- Flag missing terms.
- Select template or approved form source.
- Record draft preparation status.
- Store document versions.
- Compare version notes.
- Request Realtor approval.
- Mark approval received.
- Prepare send package.
- Record sent-to-recipient details.
- Track signature status.
- Archive final version.
- Record delivery and closeout notes.

---

## 5. Document Status Model

Recommended document statuses:

- Requested
- Uploaded
- Intake Review
- Missing Information
- Drafting
- Internal Review
- Ready for Realtor Review
- Revision Requested
- Approved by Realtor
- Ready to Send
- Sent
- Signature Pending
- Signed
- Archived
- Canceled

Recommended send package statuses:

- Not Ready
- Waiting on Realtor Approval
- Approved to Send
- Prepared
- Sent for Review
- Sent for Signature
- Partially Signed
- Fully Signed
- Delivered
- Archived
- Blocked

---

## 6. Tool Suite

### Intake Tools

- New transaction document checklist.
- Required document request generator.
- Missing terms checklist.
- Supporting document upload intake.
- Brokerage requirement notes.

### Drafting Tools

- Draft request workspace.
- Terms checklist.
- Template/source selector.
- Draft status tracker.
- Internal review checklist.
- Revision notes.

The MVP does not need a full browser-based word processor. It should begin with structured drafting metadata, document versions, approval state, and links to the actual stored file.

### Version Tools

- Version number.
- Current version flag.
- Superseded version flag.
- Revision reason.
- Created by.
- Created at.
- Approval state per version.
- Archive link.

### Review and Approval Tools

- Send to Realtor for review.
- Approval request message.
- Approve draft.
- Request revision.
- Approval timestamp.
- Approved by.
- Approval scope.

Approval rule:

No final send package should move to `Approved to Send` unless Realtor approval is recorded or an approved workflow exemption is documented.

### Sending Tools

- Send package builder.
- Recipient list.
- Send purpose: review, signature, delivery, archive copy, or follow-up.
- Required attachments.
- Approval gate.
- Sent by.
- Sent at.
- Delivery channel.
- Signature platform status.

The portal should integrate with approved email/e-signature systems later. Until then, the MVP should record sending state and approval state without storing third-party platform passwords.

### Archive Tools

- Final version.
- Signed version.
- Transaction file folder.
- Closeout status.
- Retention notes.
- Audit log.

---

## 7. Role-Based Access

Owner / Operations:

- Full document workspace access.
- Can manage send packages, templates, approvals, and archive status.

Transaction Coordinator:

- Can manage transaction document checklists, missing documents, signature status, and archive.
- Can request approval and prepare send packages for assigned files.

Contract Support:

- Can manage drafting requests, terms checklists, versions, review state, and approval requests.
- Can prepare send packages for approved drafts when assigned.

Client / Realtor:

- Can upload requested documents.
- Can review drafts sent to them.
- Can approve or request revisions.
- Can view final documents related to their account.

Finance:

- Can view documents only where needed for invoices, pay-at-closing support, or closeout verification.

Showing Provider:

- Should not access transaction document drafts or client file documents unless a showing-specific document is assigned.

---

## 8. Recommended Data Model Additions

These models should be refined before production implementation:

- `TransactionFile`
- `TransactionDeadline`
- `TransactionParty`
- `DocumentChecklistItem`
- `DocumentRequest`
- `DocumentDraft`
- `DocumentVersion`
- `MissingTerm`
- `ApprovalRequest`
- `SendPackage`
- `SignatureRequest`
- `DeliveryEvent`
- `DocumentComment`
- `DocumentAuditEvent`

These should connect to existing Reynalds OS concepts:

- `Workspace`
- `User`
- `Role`
- `RosObject`
- `Task`
- `Document`
- `TimelineEvent`
- `WorkflowRun`

The preferred implementation should extend the Object Engine, task ownership, document records, and timeline events instead of creating a disconnected document database.

---

## 9. MVP Build Order

Build the document workspace in safe slices:

1. Document workspace specification. — Complete
2. Document workspace permissions and tests.
3. Client document center preview using sample data only.
4. Employee document workspace preview using sample data only.
5. Work item detail document panel using sample data only.
6. Database schema for document checklist, draft, version, approval, and send package records.
7. Authenticated read-only document center connected to real transaction files.
8. Secure upload/download with allowlisted files, scanner-gated uploads, storage outside public webroot, and audit logs.
9. Approval request and revision workflow.
10. Send package status tracking.
11. E-signature/email integration through approved delegated access or service accounts.
12. Production security review before accepting or sending real client documents.

---

## 10. Launch Classification

Recommended classification:

Version 1.2 transaction document operations enhancement.

Reason:

The public Koinonia website can launch before this system is complete. The document workspace becomes essential before the portal handles live client transaction files, document preparation, approval, or sending workflows.
