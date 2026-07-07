# Unified Object Engine

## Purpose

Provide a shared object model so every module uses the same source of truth.

## Core Objects

- Relationship
- Client
- Agent
- Brokerage
- Property
- Transaction
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
- Review
- Referral
- SOP
- Template
- Decision Playbook
- Workflow

## Object Requirements

Every object must include:

- ID
- Type
- Name
- Status
- Owner
- Created Date
- Updated Date
- Related Objects
- Current State
- Next Action
- Source Module
- Archive Status

## Object Rule

If two modules need the same information, that information belongs to a shared object.
