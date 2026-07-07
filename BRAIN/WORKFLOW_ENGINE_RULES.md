# Workflow Engine Rules

## Purpose

The Workflow Engine is the long-term automation heart of Reynalds OS.

## Definitions

A workflow definition explains the intended movement of work.

A workflow run records a specific execution of that workflow against an object.

## Workflow Definition Fields

- Name
- Status
- Trigger event
- Stages
- Steps
- Variables
- Conditions
- Version
- Related service/module
- Failure rules
- Completion rules

## Workflow Run Fields

- Workflow ID
- Object ID
- Status
- Current stage
- Started at
- Completed at
- Timeline history

## Current Status

As of v10.1:

- Workflow definitions can be stored.
- Starter workflows can be seeded.
- Workflows can be started against an object.
- Workflow runs can be created.
- Timeline events are created when workflows start.

## Next Workflow Work

1. Step execution engine.
2. Action registry.
3. Stage advancement.
4. Condition evaluation.
5. Workflow run detail UI.
6. Retry/error handling.
