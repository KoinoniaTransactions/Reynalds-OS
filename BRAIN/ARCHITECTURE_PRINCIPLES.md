# Architecture Principles

## 1. Object Engine First

All major records should be represented as shared ROS objects when possible.

Examples:

- Relationship
- Transaction
- Task
- Invoice
- Service
- Workflow
- Knowledge item
- Notification source
- Customer Success record

## 2. No Isolated Module Truth

Modules may present different views, but they should not own duplicate truth.

CRM, Transactions, Finance, Operations, Knowledge, and Workflow should all use shared platform records.

## 3. Timeline Everything That Matters

If an action matters later, it should create a timeline event.

Examples:

- Object created
- Object updated
- Task created
- Task completed
- Invoice created
- Invoice paid
- Notification created
- Workflow started

## 4. Workflow Over Hardcoding

Repeated work should become a workflow definition rather than being hardcoded separately into each module.

## 5. Copilot Recommends Before It Acts

AI can explain, prioritize, draft, and recommend. It should not mutate production data until an explicit reviewed action workflow exists.

## 6. Dashboard Metrics Must Be Calculated

Dashboard values should come from database queries, not hardcoded cards.

## 7. Permissions Must Wrap Writes

Every create/update/archive/execute action should pass through permission checks.

## 8. Build for Traceability

Every important change should answer:

- Who did it?
- What changed?
- Which object was affected?
- When did it happen?
- Why does it matter?
