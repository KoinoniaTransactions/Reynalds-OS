# OBJ-RB-000001 — Work Item

## Purpose

A Work Item is the central operational object for Reynalds Brothers.

It represents any unit of work the company receives, plans, executes, verifies, invoices, learns from, or archives.

A Work Item may originate from email, Lucernex, ServiceChannel, CompanyCam, Jotform, spreadsheets, phone calls, or manual entry.

---

## Core Principle

Reynalds Brothers does not organize around spreadsheets or external systems.

Reynalds Brothers organizes around Work Items.

External systems are sources of evidence. They do not define the internal operating model.

---

## Examples

- ACC Level 1 triage
- ACC Level 2 triage
- ACC tank replacement
- DIY-only tank replacement
- UCO tank replacement
- Lower bay pressure washing with vac truck and disposal facility
- Grease interceptor service
- Plumbing service call
- Backflow inspection
- Zurn alarm installation
- Warranty visit
- Site survey
- Internal maintenance

---

## Required Fields

- Work Item ID
- Source System
- Source Reference ID
- Customer
- Location
- Service Line
- Job Type
- Approval Status
- Store Number
- City
- State
- Work Type
- Current Status
- Current Phase
- Priority
- Assigned Owner
- Assigned Crew
- Lucernex Status
- Lucernex Link
- APO or PO Number
- PO Status
- Permit Status
- Tank Status
- Tank Serial Numbers when applicable
- Oil Removal Status when applicable
- CompanyCam Link
- Completed Checklist Item IDs
- Date Received
- Scheduled Date
- Completion Date
- Financial Status
- Documentation Status
- AI Summary

---

## Related Objects

A Work Item may relate to:

- Organization
- Location
- Communication
- Document
- Media
- Financial Transaction
- Purchase Order
- Invoice
- Equipment
- Vehicle
- Vendor
- Employee
- Decision
- Event
- Playbook
- Lesson Learned

---

## Lifecycle

1. Needs Approval
2. Triage when applicable
3. Permitting when applicable
4. Tanks ordered, assigned, received, and tested when applicable
5. Scheduling
6. Field Work
7. Completion Review
8. Billing Review
9. Paid
10. Complete

ACC work may move as one connected job through Level 1 triage, Level 2 triage, and ACC tank replacement.

Pressure washing is a standalone workflow.

Approved active Work Items may be grouped into route batches by region or state so office users can see which jobs should be scheduled together and which blockers must clear before a run can be built.

Tank inventory is tracked as a scheduling gate:

- ACC tank replacement requires two 400 gallon bulk oil tanks, one 700 gallon waste oil tank, one 105 gallon DIY tank, and one 25 gallon filter crusher tank.
- DIY-only work requires the 105 gallon DIY tank.
- UCO tank replacement requires one 160 or 315 gallon UCO tank.
- Required tank serial numbers must be assigned before the tank package is treated as ready for scheduling.

---

## Division Checklist Templates

The ACC/UCO/Pressure Washing division uses job-specific checklist templates.

Initial templates:

- ACC Level 1 Triage
- ACC Level 2 Triage
- ACC Tank Replacement
- DIY Only
- UCO Tank Replacement
- Pressure Washing

Checklist items include an item ID, label, phase, owner group, and required-before gate.

The system computes:

- Completed checklist count
- Total checklist count
- Checklist progress percent
- Open required checklist items
- Red flags for incomplete required work

Checklist completion may also update related status fields automatically:

- PO checklist items update PO Status to Received.
- Permit approval items update Permit Status to Approved.
- Tank received items update Tank Status.
- Coordinated oil-removal items update Oil Removal Status.
- Pressure washing vac-truck and disposal items clear their related red flags.
- Completion-proof items can move Invoice Status to Ready to Invoice and Billing Approval Status to Needs Shay Review.
- Checklist milestones may advance the current phase.

The job detail screen also exposes editable job controls for approval, Lucernex, PO, permits, tank status, coordinated oil removal, CompanyCam, pressure-washing vendors, completion date, billing approval, and next action.

ACC tank replacement is treated as one connected chain that may include Level 1 triage, Level 2 triage, and final replacement work.

Approved drafted jobs activate into the first working phase for their job type:

- ACC Level 1 Triage activates into Level 1 Triage.
- ACC Level 2 Triage activates into Level 2 Triage.
- ACC Tank Replacement and DIY Only activate into Permitting.
- UCO Tank Replacement activates into Planning.
- Pressure Washing activates into Planning.

---

## Evidence-Based Completion

A Work Item is not complete because a user manually marks it complete.

Completion should be supported by evidence such as:

- Required photos
- Completion report
- Customer acceptance
- Required documents
- Expense reconciliation
- Invoice status
- Payment status when applicable

The first field-proof summary checks:

- CompanyCam project link
- Job-specific proof checklist items
- Manager name and title
- Signature status
- Completion date
- Billing readiness

The billing handoff summary tracks the office pass-off:

- Shay starts the billing packet
- Jeremiah approval
- Darren final approval
- Josh visibility

The dashboard shows the current billing owner, completed approvals, pending approvals, and the next handoff action. Jobs that are not ready to invoice stay owned by Field / Office until field proof is complete.

---

## First Software Implementation

The first Work Item implementation is the Reynalds Brothers operations workspace:

`/reynalds-brothers`

The first dedicated API is:

`/api/reynalds-brothers/work-items`

Work Item updates are handled at:

`/api/reynalds-brothers/work-items/[id]`

Initial computed signals:

- Work item lane
- Active work count
- Needs approval count
- Red flag count
- Missing crew assignment
- Missing documentation
- Billing readiness
- Customer update status
- Lucernex status
- PO status
- Permit status
- Tank and oil-removal readiness

Initial mutation support:

- Create Work Item
- Update status
- Update health
- Update crew lead
- Update Lucernex status
- Update PO status
- Update invoice status
- Update customer update status
- Update next action
- Toggle checklist item completion
- Preview pasted spreadsheet trial data
- Create imported trial rows as Needs Approval Work Items

---

## AI Role

AI may assist by:

- Creating Needs Approval Work Items from incoming emails
- Linking emails and documents to existing Work Items
- Summarizing current status
- Detecting missing evidence
- Recommending next actions
- Surfacing similar past Work Items
- Capturing lessons learned

AI-created jobs are not active until approved by an authorized human.

AI may not overwrite verified facts.

---

## Governance

This object belongs to the Reynalds Brothers company domain under `02_Companies/Reynalds_Brothers`.

It must remain separate from Koinonia business objects and from platform-level Reynalds OS objects.
