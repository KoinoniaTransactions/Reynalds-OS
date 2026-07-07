# ROS-0039 — Koinonia ERP Unified Data Model

## Mission

Create one shared data language for Koinonia ERP so every module uses the same entities, relationships, lifecycle rules, and ownership standards.

Core rule: Data belongs to the platform, not to a department.

## Core Entities

- Relationship
- Client
- Agent
- Brokerage
- Transaction
- Property
- Contract Draft Request
- Showing Request
- Task
- Deadline
- Document
- Communication
- QA Review
- Exception
- Invoice
- Payment
- Package
- Service
- Review / Testimonial
- Referral

## Entity Relationship Map

Relationship → Client / Agent / Referral Partner → Package → Service Activation → Transaction / Draft Request / Showing Request / Business Support Request → Tasks + Deadlines + Documents + Communication + QA → Invoice + Payment → Customer Success → Review / Testimonial / Referral → New Relationship

## Ownership Rules

CRM owns relationship creation, contact profile, relationship status, and referral source.

Sales owns qualification, consultation, proposal, and package recommendation.

Operations owns transactions, draft requests, showing requests, task execution, and QA workflow.

Finance owns invoices, payments, and revenue status.

Customer Success owns reviews, testimonials, follow-up cadence, and referral opportunities.

Marketing owns campaign source, content attribution, public testimonials, and brand assets.

## Universal Fields

Every operational object should include:

- ID
- Name / Title
- Object type
- Module
- Owner
- Status
- Priority
- Related client
- Related service
- Related package
- Related transaction/property when applicable
- Created date
- Last updated
- Next action
- Waiting reason
- Archive status

## Lifecycle Standards

Relationship: New → Interested → Qualified → Consultation → Proposal → Client → Active → Past Client → Advocate → Referral Source

Transaction: Intake → Compliance Review → Earnest Money → Inspection → Resolution → Appraisal → Loan → Title → Closing Prep → Closing → Post Closing → Archived

Draft Request: Requested → Waiting on Info → Drafting → Review → Waiting on Client → Revised → Finalized → Archived

Showing Request: Requested → Waiting on Info → Assigned → Scheduled → Completed → Feedback Sent → Closed

Invoice: Draft → Sent → Pending → Due → Paid → Reconciled → Archived

Customer Success: Closing Complete → Thank You → Satisfaction Check → Review Request → Referral Opportunity → Relationship Nurture

## AI Grounding Rule

AI recommendations must cite the object fields they are using.
