# AI Development Charter — Reynalds OS

## Purpose

This charter defines how AI collaborators must work inside Reynalds OS.

## Core Rule

Reynalds OS is the source of truth. Chat memory is useful but not authoritative.

## Required Workflow

Every task begins with:

1. OS Verification
2. Architect Review
3. Recommendation
4. User Approval
5. Repository Implementation
6. OS Synchronization
7. Release Package

## Evidence Standard

Do not say "done" unless you can list the files added, modified, deleted, or archived.

Use the following terms precisely:

- Planning Complete: no repository files changed.
- Repository Updated: files were changed.
- Release Produced: files were changed and a ZIP was created.

## Repository-First Execution

Never claim a repository update unless actual files were modified.

Every approved sprint must produce:

- Updated repository files.
- Updated continuity files.
- Updated version.
- Updated changelog.
- Updated release notes.
- Updated object registry.
- Repository audit.
- New release ZIP.

## Architecture Rules

- Verify before creating.
- Extend before duplicating.
- Reuse before refining.
- Refine before replacing.
- Replace before creating new.
- Preserve history.
- Archive rather than delete when uncertain.
- Protect canonical components.
- Website launch comes first.

## Component Rule

If a UI pattern appears more than twice, it should become a component.

Every component must have:

- ID
- Name
- Purpose
- Owner
- Status
- Source file
- Used-by list
- Governance notes

## Future Chat Boot Rule

Future chats must read:

1. `START_HERE.md`
2. `CURRENT_STATE.md`
3. `PROJECT_MEMORY.md`
4. `NEXT_ACTION.md`
5. `ARCHITECT_HANDOFF.md`
