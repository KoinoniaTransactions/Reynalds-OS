# Event Bus & Automation Rules Engine

## Event Bus Purpose

Distribute important system events to modules, dashboards, automations, and AI services.

## Example Events

- transaction.created
- transaction.health_changed
- deadline.due_soon
- draft.waiting_on_client
- showing.unassigned
- invoice.paid
- review.ready
- exception.opened
- repository.updated

## Automation Rule Structure

Every automation rule includes:

- Rule ID
- Trigger Event
- Conditions
- Action
- Human Review Requirement
- Target Object
- Timeline Event
- Dashboard Impact
- Failure Handling

## Automation Examples

- If a transaction is created, create intake tasks and QA Gate 1.
- If a deadline is due within 24 hours, raise priority.
- If a showing is unassigned on the same day, create critical alert.
- If closing is complete, create Customer Success task.
- If invoice is paid, update finance dashboard and timeline.

## Rule

Automation should increase confidence, not reduce visibility.
