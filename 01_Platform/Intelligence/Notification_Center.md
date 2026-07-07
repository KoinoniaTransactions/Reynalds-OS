# Notification Center

## Purpose

Create a single priority-based alert center for important events across ROS.

## Notification Levels

### Critical
Requires immediate attention.

Examples:
- Closing blocked
- Same-day showing unassigned
- Missed deadline
- High-risk exception opened

### Important
Needs action today.

Examples:
- Client update due
- Draft waiting on approval
- QA review due
- Invoice pending

### Informational
Useful but not urgent.

Examples:
- Payment received
- Review submitted
- Document uploaded
- Workflow completed

## Notification Fields

- Notification ID
- Level
- Source object
- Source module
- Message
- Recommended action
- Due time
- Owner
- Read/unread status
- Escalation status

## Rule

Notifications should reduce uncertainty, not create noise.
