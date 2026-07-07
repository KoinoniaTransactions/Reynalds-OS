# ROS v9.4 — Read-Only Copilot MVP

## Added

- `/copilot` page.
- Database-grounded `/api/copilot`.
- Read-only priority answers.
- Suggested questions.
- Supporting references for objects, tasks, invoices, timeline events, and knowledge records.
- Human-review flag.
- No data mutation.

## Current Limitations

- No external LLM call is wired yet.
- Answers use deterministic logic.
- No action execution workflow yet.
- No streaming responses.

## Next Recommended Work

- Add server-side search.
- Add action proposal model.
- Add real LLM integration after grounding and permission workflow are stable.
