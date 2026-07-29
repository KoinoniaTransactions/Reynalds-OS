# Reynalds Brothers

Reynalds Brothers is a separate company domain inside Reynalds OS.

It is not Koinonia. Koinonia business logic, client portal workflows, and real estate transaction-management tools remain under the Koinonia company domain. Reynalds Brothers has its own operating model, objects, workflows, documents, media, customers, and financial flow.

## Current Operating Model

Reynalds Brothers organizes around Work Items.

A Work Item is the central record for field-service work the company receives, plans, performs, verifies, invoices, learns from, and archives.

Current known service/work areas include:

- Walmart field work
- ACC and UCO tank work
- Lower bay pressure washing
- Plumbing service work
- Backflow work
- Grease interceptor service
- Zurn alarm or related project work
- Site surveys, warranty visits, and internal maintenance

## Software Direction

The Reynalds Brothers operations system should answer:

Is this work item ready, moving, completed, documented, and billable?

Because most work comes in through email and planning can last from one week to six months, the system must also answer:

Has every important email been filed under the right Work Item, and has the job next action been updated?

The first app slice lives at:

`/reynalds-brothers`

The first API slice lives at:

`/api/reynalds-brothers/work-items`

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
