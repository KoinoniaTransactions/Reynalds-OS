# Koinonia Employee Portal Specification

Status: Proposed MVP architecture  
Date: 2026-07-28  
Owner: Koinonia Transactions  
Applies To: Internal staff login, client assignment, work assignment, capacity, and handoff tracking

---

## 1. Purpose

Koinonia needs an internal employee portal where staff can:

- See the clients and work assigned to them.
- See unassigned clients and unassigned work that need an owner.
- Assign clients to a Koinonia account owner.
- Assign work items to the right staff member or role.
- Track staff capacity before accepting new work.
- Maintain clean handoffs across transaction coordination, contract support, showing coverage, and operations support.
- Keep client-facing work status aligned with internal staff responsibility.

This should be an internal operations portal, not a public client page.

---

## 2. Access Boundary

The employee portal should require authenticated Koinonia internal access.

Client users must not have access to employee routes, staff capacity, staff notes, internal assignments, or internal handoff notes.

The portal should support least-privilege internal roles:

- Owner / Executive
- Operations Manager
- Transaction Coordinator
- Contract Support
- Showing Provider
- Finance
- Customer Success
- Viewer

Access rule:

Each staff member should see the clients, work items, documents, access notes, and actions needed for their responsibility. The portal should not expose unrelated client files or private staff notes to roles that do not need them.

---

## 3. Routes

### Employee Entry

Route:

`/employee`

Purpose:

Internal entry point for Koinonia staff.

The page should stay out of public navigation and search indexing.

### Employee Dashboard

Route:

`/employee/dashboard`

Purpose:

Show Koinonia staff the assignment state of the business.

Expected dashboard sections:

- Assignment Overview
- Unassigned Clients
- Unassigned Work
- Document Workspace
- Billing Workspace
- Staff Workload
- Assigned Clients
- Active Work Queue
- Showing Coverage Queue
- Handoff Needed
- Escalations
- Capacity Watch

### Employee Document Workspace

Route:

`/employee/documents`

Purpose:

Give Koinonia staff the operational tools needed to manage drafting, document requests, missing terms, version history, Realtor approval, send packages, signature status, and final archive.

Expected sections:

- Draft queue
- Missing terms
- Template library
- Version history
- Quality review
- Approval requests
- Send queue
- Signature tracking
- Final archive
- Audit trail

Rules:

- Staff access should follow role and assignment.
- Contract support may draft and version assigned documents.
- Operations may prepare send packages and rebalance document workload.
- Final document sending requires recorded Realtor approval or a documented approved workflow.
- Showing providers should not see transaction document drafts unless a showing-specific document is assigned.
- The portal should not store third-party forms, brokerage, MLS, or e-signature passwords.

### Employee Billing Workspace

Route:

`/employee/billing`

Purpose:

Give Koinonia staff one place to see customer billing profiles, payment setup needs, prepaid invoice status, pay-at-closing triggers, monthly/custom billing terms, failed payment follow-up, and safe payment method metadata.

Expected sections:

- Customer billing profiles
- Payment setup needed
- Prepaid invoices due before work begins
- Pay-at-closing billing watch
- Monthly/custom billing
- Failed payment follow-up
- Refund/adjustment notes
- Revenue by service
- Billing audit trail

Rules:

- Staff should not see or store full card numbers or CVV/CVC.
- Payment setup should happen through an approved processor-hosted flow.
- Prepaid work should not start until paid or an exception is approved.
- Pay-at-closing billing should trigger only after successful closing.
- Recurring or future charges require clear consent and billing terms.

---

## 4. Assignment Model

Every client account should have:

- Account owner.
- Backup owner.
- Package or support plan.
- Primary service need.
- Current relationship status.
- Next client touch.
- Internal notes visible only to authorized staff.

Every work item should have:

- Client account.
- Service type.
- Package context.
- Primary assignee.
- Backup assignee, when useful.
- Priority.
- Due date or requested date.
- Client-facing status.
- Internal status.
- Next action.
- Blocker, if any.
- Escalation owner, if any.

Assignment events should create audit history:

- Assigned by.
- Assigned to.
- Previous assignee.
- Assignment reason.
- Assignment date.
- Capacity snapshot at assignment time.

---

## 5. Role-Based Responsibilities

### Owner / Executive

- See all clients and work.
- Assign or reassign any client or work item.
- Review escalations.
- Manage staff roles and capacity rules.

### Operations Manager

- See operational workload.
- Assign clients and work.
- Rebalance capacity.
- Review blocked work and handoffs.
- Coordinate across transaction, contract, showing, and operations support.

### Transaction Coordinator

- See assigned transaction clients and transaction work.
- Update assigned tasks, deadlines, notes, and client-facing status.
- Request documents or access through approved portal flows.

### Contract Support

- See assigned contract/document requests.
- Update drafting status, requested terms, review needs, and delivery notes.
- Work from Realtor instructions and keep final approval with the Realtor.

### Showing Provider

- See only assigned showing requests.
- See appointment details, access instructions, safety notes, and feedback form for assigned showings.
- Submit showing completion notes and feedback.
- Should not see unrelated client files or staff workload.

### Finance

- See client billing context, packages, invoices, and payment status.
- Should not modify operational assignment unless also granted operations permissions.

### Customer Success

- See assigned client relationship follow-up, onboarding, reviews, referrals, and service check-ins.
- Coordinate relationship next steps without exposing unnecessary transaction details.

---

## 6. Staff Capacity Model

Capacity should be visible before assignment decisions.

Recommended staff capacity fields:

- Staff member.
- Role.
- Availability status.
- Capacity percentage.
- Active clients.
- Active work items.
- Due today.
- Due this week.
- Rush work count.
- Upcoming time off.
- Current focus.
- Escalation load.

Capacity rule:

The portal should warn before assigning urgent or deadline-sensitive work to someone who is already overloaded or unavailable.

---

## 7. Service Assignment Rules

Transaction Coordination Plus:

- Assign to a transaction coordinator.
- Add operations manager as escalation owner for urgent or blocked files.
- Finance sees billing status but not unnecessary file detail.

Pay-at-Closing Coordination:

- Use the transaction coordination workflow.
- Finance should see pay-at-closing billing status and closing outcome.

Contract and Document Support:

- Assign to contract support or an operations-qualified staff member.
- Require Realtor instructions and Realtor final approval status.

Licensed Showing Coverage:

- Assign to a licensed showing provider.
- Do not mark showing confirmed until access instructions and provider assignment are confirmed.
- Showing providers should only see assigned showing details.

Monthly Operations Partnership:

- Assign an account owner.
- Track recurring work, monthly capacity, remaining hours, and priority requests.

Realtor Support Plus:

- Assign an account owner and service-level assignees for transaction, contract, showing, and operations work.

---

## 8. Recommended Data Model Additions

These models should be refined before implementation:

- `StaffProfile`
- `StaffAvailability`
- `ClientAssignment`
- `WorkAssignment`
- `AssignmentEvent`
- `CapacitySnapshot`
- `InternalHandoff`
- `Escalation`

These should connect to existing Reynalds OS concepts:

- `Workspace`
- `User`
- `Role`
- `RosObject`
- `Task`
- `TimelineEvent`
- `WorkflowRun`

The preferred implementation should extend the Object Engine and task ownership model instead of creating a disconnected staff database.

---

## 9. MVP Build Order

Build the employee portal in safe slices:

1. Employee portal specification and assignment model. — Complete
2. Employee auth permissions and limited staff roles. — Scaffolded in `packages/auth`
3. Publicly hidden `/employee` entry page with no real client data.
4. `/employee/dashboard` sample-data preview.
5. `/employee/access` access workspace connected to portal users and invitations, with a protected invitation form, revoke/deactivate controls, and safe sample-data fallback when storage is unavailable.
6. `/employee/documents` sample-data document workspace preview.
7. `/employee/billing` sample-data billing workspace preview.
8. Work item detail assignment panel using mocked/sample data.
9. Staff roster and capacity schema.
10. Assignment event audit trail.
11. Authenticated read-only employee dashboard connected to real objects.
12. Assignment update actions with permission checks.
13. Staff-specific views for assigned transaction, contract, showing, and operations work.
14. Production security review before exposing real client files, internal staff notes, or payment method setup.

---

## 10. Launch Classification

Recommended classification:

Version 1.1 internal operations enhancement.

Reason:

The public Koinonia website and client consultation flow can launch without the employee portal. The employee portal is strategically important because staff assignment, client ownership, and capacity tracking are required before Koinonia scales beyond owner-operated support.
