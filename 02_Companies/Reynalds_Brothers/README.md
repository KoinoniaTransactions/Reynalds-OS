# Reynalds Brothers

Reynalds Brothers is a separate company domain inside Reynalds OS.

It is not Koinonia. Koinonia business logic, client portal workflows, and real estate transaction-management tools remain under the Koinonia company domain. Reynalds Brothers has its own operating model, objects, workflows, documents, media, customers, and financial flow.

## Current Operating Model

Reynalds Brothers organizes around Work Items.

A Work Item is the central record for field-service work the company receives, plans, performs, verifies, invoices, learns from, and archives.

The first division being built out is the Walmart ACC/UCO/Pressure Washing division.

Current job types for this division:

- ACC Level 1 Triage
- ACC Level 2 Triage
- ACC Tank Replacement
- DIY Only
- UCO Tank Replacement
- Pressure Washing

APG removals were tracked in the historical spreadsheet but are not an ongoing workflow for this division.

## Software Direction

The Reynalds Brothers operations system should answer:

Is this work item ready, moving, completed, documented, and billable?

Because most work comes in through email and planning can last from one week to six months, the system must also answer:

Has every important email been filed under the right Work Item, and has the job next action been updated?

The first app slice lives at:

`/reynalds-brothers`

The first API slice lives at:

`/api/reynalds-brothers/work-items`

The first email intake source is:

`WMTanks@ReynoldsBrothers.com`

This is the current operational mailbox for Walmart tank-related work. Reynalds Brothers remains the company name and Reynalds OS remains the platform name.

## Division Rules Captured

- AI may create jobs from email, but AI-created jobs start in Needs Approval and are not active until approved by a human.
- Needs Approval jobs appear on the main board.
- Access to approve jobs must be delegable. Jeremiah Reynalds is the first approval authority.
- Current office users are Jeremiah Reynalds, Joshua Reynalds, Shay Reynalds, John Nestor, and Darren Fielder.
- Required minimum job fields are store number, city, state, and job title.
- Walmart job titles should follow `WM-1590 Hialeah, Florida - ACC Tank Replacement`.
- Multiple active jobs may exist for one store.
- One email may create multiple jobs, but multi-store emails must be flagged for approval review.
- Lucernex replaced the older Enviance workflow.
- Reynalds OS should track Lucernex status, Lucernex record links, APO/PO numbers, permitting dates, and completion dates.
- Missing PO does not block scheduling, but it must raise a red flag and alert office staff after five business days.
- ACC and UCO jobs require coordinated oil removal with Walmart's vendor while Reynalds Brothers is onsite.
- ACC, UCO, and Pressure Washing completion require job-specific checklists.
- CompanyCam starts as a project link and should later sync photos directly.
- Verizon GPS/ELD is needed first for vehicle and crew visibility.
- QuickBooks is the revenue source of truth, while Walmart billing may still occur through IP2P.
- Billing pass-off starts with Shay, moves to Jeremiah, then Darren final approval, with Josh visibility.

## Needed Modules

- Work Item command center
- Customer and organization registry
- Location/site registry
- Crew, equipment, vehicle, and material readiness
- Media and documentation intake
- Customer communication timeline
- Email intake, classification, and filing
- Billing readiness and closeout
- Playbooks by service line
- AI review for missing evidence and next actions
- AI monitoring for stalled email threads and long planning cycles

## Boundary

Platform capabilities may support Reynalds Brothers, but Reynalds Brothers business rules belong under this company folder.

Reynalds Brothers data and rules must remain separate from Koinonia data and rules.
