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

- ACC tank installation
- UCO tank installation
- Lower bay pressure washing
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
- Work Type
- Current Status
- Priority
- Assigned Owner
- Assigned Crew
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

1. Opportunity
2. Intake
3. Planning
4. Preparation
5. Execution
6. Verification
7. Financial Closeout
8. Knowledge Capture
9. Performance Review
10. Archive

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
- Attention count
- Missing crew assignment
- Missing documentation
- Billing readiness
- Customer update status

Initial mutation support:

- Create Work Item
- Update status
- Update health
- Update crew lead
- Update invoice status
- Update customer update status
- Update next action

---

## AI Role

AI may assist by:

- Identifying new Work Items from incoming emails
- Linking emails and documents to existing Work Items
- Summarizing current status
- Detecting missing evidence
- Recommending next actions
- Surfacing similar past Work Items
- Capturing lessons learned

AI may not overwrite verified facts.

---

## Governance

This object belongs to the Reynalds Brothers company domain under `02_Companies/Reynalds_Brothers`.

It must remain separate from Koinonia business objects and from platform-level Reynalds OS objects.
