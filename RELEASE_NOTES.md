## Parallel research preservation — 2026-11-17

Registered the owner's active PR #60 research workstream. Its 12 changed paths at `531ab10` did not overlap this cleanup; neither its branch nor its research/README files were modified. Keep Properties research/source names intact and review future findings separately from approved policy.

## Owner working-brand selection — 2026-11-17

Recorded the owner's explicit selection of Koinonia Dwellings in the existing positioning authority, section 13, and synchronized entry points. Earlier Realty/Properties naming remains history. No legal clearance, formation, domain/account transaction, code rebrand, deployment or social-engine change is implied.

## Documentation/data reconciliation follow-up — 2026-11-17

Selective recovery of Realty decision history into the existing positioning source, with the later naming reconsideration and subsequent owner choice explicit. Clarified preview implementation evidence, legacy pricing/collateral scope, customer-facing email source, platform recommendation limits and research geography. Working native tracker confirmed; eight Excel snapshots labeled and retained; one stale Playbook note corrected with its original preserved in a cell note. No prospect/contact/opt-out/campaign values changed. No social-engine, application, schema or production changes.

## Documentation reconciliation — 2026-11-17

Clarified session entry points, subject/branch authority, historical handoffs and commercial-object scope. Exposed unmerged November Realty decisions and later Properties/social work. Preserved original history and private-record boundaries. Added root AI orientation. Updated manifest navigation and recorded ROS-0088 in the change log. No application code, dependency, schema, software version, object ID, business decision or deployment changed. Software VERSION and object_registry.csv are intentionally unchanged because this is a documentation revision, not a product release or new business object.

Audit limitations: Drive discovery only; no separate vault established or required; no exhaustive content, legal or live-runtime certification. Review unresolved sources in BRAIN/CANONICAL_REGISTRY.md before further consolidation.

# Release Notes

## ROS v11.3.1 — Recovery Audit and Preservation Delta

Change ID: ROS-0086

### Added

- Recovery audit folder.
- Bible status file.
- Preservation map.
- v11.3.0 Services & Pricing source snapshot.
- Archived v11.3.0 Services & Pricing ZIP.

### Preserved

- v11.2.1 Contact Config baseline.
- Koinonia Home, Services, About, Contact routes.
- ContactActions component and shared contact config.

### Clarified

- This release is not yet the final Bible.
- The v10.1 root files alone are not sufficient to represent all later website/contact work.
- v11.3.0 Services & Pricing uses a different component structure and must be reconciled intentionally.

### Next Recommended Work

Run local validation, then reconcile the preserved Services & Pricing snapshot.

---

# Release Notes

## v11.2.1 — Koinonia Contact Configuration

- Added centralized contact configuration.
- Added reusable Contact Actions component.
- Updated Contact page, CTA, and Footer to use shared contact configuration.
- Preserved phone/SMS placeholders because verified production values were not found.
- Added release audit and release summary for v11.2.1.

## v11.2.0 — Koinonia Contact Page Assembly

- Completed the `/koinonia/contact` page assembly.
- Added `KoinoniaContact` page assembly using canonical site components.
- Extended FAQ component to support page-specific FAQ content while preserving default Services FAQ behavior.
- Updated Contact specification and component manifest.
- Documented final phone/SMS links as launch QA items because they were not found in the repository.
- Updated continuity files for Site QA and Launch Readiness Review.

## v11.1.0 — Repository Recovery + Koinonia Website Assembly

Date: 2026-07-03

### Summary

This release is the first corrected repository recovery release after the project adopted a strict repository-first execution standard.

### Added

- Canonical Koinonia public website component system.
- Public website routes:
  - `/koinonia`
  - `/koinonia/services`
  - `/koinonia/about`
  - `/koinonia/contact`
- Continuity Package:
  - `START_HERE.md`
  - `CURRENT_STATE.md`
  - `PROJECT_MEMORY.md`
  - `NEXT_ACTION.md`
  - `AI_DEVELOPMENT_CHARTER.md`
  - `ARCHITECT_HANDOFF.md`
- Repository audit and recovery documentation.
- Component metadata and manifest.
- Page specifications.

### Preserved

- `/` internal Reynalds OS dashboard.
- v10.1 and v8.0 original source ZIPs under archive.

### Next

Contact Page Assembly.

# Release Notes

## ROS v11.0.0 — Repository-First Continuity and Koinonia Website Production Standard

Change ID: ROS-0084

### Added
- `START_HERE.md` boot sequence for future chats.
- `CURRENT_STATE.md` concise project state.
- `PROJECT_MEMORY.md` authoritative project memory.
- `NEXT_ACTION.md` next sprint instructions.
- `AI_DEVELOPMENT_CHARTER.md` AI/developer behavior rules.
- `docs/REPOSITORY_INVENTORY_v11_0_0.md`.
- `BRAIN/REAL_REPOSITORY_EXECUTION_STANDARD.md`.
- `BRAIN/WEBSITE_PRODUCTION_WORKFLOW.md`.
- `03_Knowledge/Website/services_pricing_production_spec.md`.
- `03_Knowledge/Website/release_readiness_checklist.md`.
- `03_Knowledge/Website/component_catalog.md`.
- `03_Knowledge/Website/home_page_assembly_audit.md`.
- Historical `ROS_Koinonia_Interactive_App_Shell_v7_2.html` preserved in application prototypes.

### Clarified
- Reynalds OS is the source of truth, not chat memory.
- Conversation approvals are not implementation complete until real repository files are updated.
- The Koinonia public website must be built through repository-first development.
- The standalone HTML app shell is historical and not the active production application source.

### Current Status
- Koinonia website strategy is documented.
- Real implementation is pending repository verification.
- Next sprint should establish the canonical public website implementation path.

### Next Recommended Work
- Execute Repository Sprint 1 from `NEXT_ACTION.md`.

---


## ROS v10.1.0 — Professional Software Project Consolidation

Change ID: ROS-0083

### Added
- `BRAIN/` authoritative project brain.
- Product vision.
- Architecture principles.
- Development standards.
- Design system rules.
- Database conventions.
- Workflow Engine rules.
- AI Copilot rules.
- Module map.
- Decision log.
- Roadmap.
- Developer handoff.
- GitHub setup guide.
- App shell version guidance.
- Current state summary.

### Clarified
- The old standalone Dashboard/App Shell v7.2 is superseded.
- The primary application is now the production Next.js app under `apps/web`.
- Future development should happen through a real Git repository and local validation workflow.

### Current Status
Reynalds OS is now organized as a professional software project with an internal brain and handoff structure.

### Next Recommended Work
- Create GitHub repository.
- Run local setup.
- Fix compile/runtime issues.
- Commit a clean baseline.
