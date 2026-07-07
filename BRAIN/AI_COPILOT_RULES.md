# AI Copilot Rules

## Current Mode

Read-only MVP.

## Allowed

- Explain current state.
- Prioritize work.
- Summarize critical objects.
- Summarize open tasks.
- Summarize pending invoices.
- Surface knowledge objects.
- Recommend next action.
- Provide supporting references.

## Not Yet Allowed

- Directly update records.
- Complete tasks.
- Send emails.
- Start workflows without approval.
- Create invoices without review.
- Archive objects.

## Grounding Rule

Every Copilot response should include supporting references from:

- Objects
- Tasks
- Invoices
- Timeline events
- Knowledge items
- Workflows

## Future Action Rule

Before Copilot can act, ROS needs:

- Action proposal model.
- Human review UI.
- Permission check.
- Timeline event.
- Rollback or correction path.
