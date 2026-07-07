# Repository Inventory — v11.0.0

## Purpose

This inventory records which uploaded artifacts were treated as canonical and how duplicates were handled during the repository-first reset.

## Uploaded Artifacts Reviewed

### `Reynalds_OS_Git_Project_v10_1.zip`

Status: Canonical base.

Reason: Contains the latest production Next.js/TypeScript scaffold, BRAIN documentation, database model, object registry, release notes, roadmap, and current state.

### `Reynalds_OS_Git_Project_v8_0.zip`

Status: Superseded historical package.

Reason: Older version than v10.1.0. Its purpose is preserved by release history. It was not merged into the active repository because v10.1.0 contains the later production scaffold.

### `ROS_Koinonia_Interactive_App_Shell_v7_2.html`

Status: Historical prototype preserved.

Action: Copied into `07_Application_Prototypes/ROS_Koinonia_Interactive_App_Shell_v7_2.html`.

Reason: Useful visual/prototype reference, but not the active production source.

## Canonical Active Areas

- Active app source: `apps/web/`
- Production packages: `packages/`
- Project brain: `BRAIN/`
- Koinonia service objects: `02_Companies/Koinonia/`
- Website knowledge: `03_Knowledge/Website/`
- Continuity package: root `START_HERE.md`, `CURRENT_STATE.md`, `PROJECT_MEMORY.md`, `NEXT_ACTION.md`, `AI_DEVELOPMENT_CHARTER.md`

## Important Note

This release documents approved strategy and methodology in real files. It does not claim that Koinonia public website pages are implemented unless actual source files exist in the repository and pass release readiness.
