# ROS v10.0 — Workflow Automation Engine MVP

## Added

- `/workflows` page.
- Workflow API list/create.
- Workflow run API.
- Start workflow endpoint.
- Workflow run list endpoint.
- Starter workflow seed action.
- Workflow stages and steps display.
- Workflow definition JSON display.
- Timeline event when workflow starts.

## Current Capabilities

- Store workflow definitions.
- Seed starter workflows.
- View workflow stages and steps.
- Start a workflow against an object.
- Create workflow run records.
- Create timeline event on workflow start.

## Current Limitations

- Step execution is not implemented yet.
- Conditions are stored but not evaluated yet.
- Workflow versioning is not implemented yet.
- No visual drag-and-drop designer yet.
- No retry/error queue yet.

## Next Recommended Work

- Add step execution engine.
- Add workflow run stage advancement.
- Add workflow action registry.
