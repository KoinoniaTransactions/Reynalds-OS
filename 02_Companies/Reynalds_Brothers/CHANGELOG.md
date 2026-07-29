# Reynalds Brothers Changelog

## 2026-07-29

- Promoted Reynalds Brothers from a simple shared operations queue into a dedicated company workspace route at `/reynalds-brothers`.
- Added the first Work Item engine helper for lanes, metrics, readiness checks, and fallback preview records.
- Added a dedicated Work Item API at `/api/reynalds-brothers/work-items` scoped to `wks_reynalds_brothers`.
- Added Work Item create and update API actions with timeline events.
- Added Work Item intake and operational update forms to the Reynalds Brothers workspace.
- Activated the Communication object for email/call/text evidence.
- Added the first email intake API and UI preview for analyzing, filing, or creating Work Items from email.
- Updated the active seed Work Items with customer update, media, permit, and billing-readiness fields.
- Preserved the separation between Koinonia and Reynalds Brothers as distinct company domains inside Reynalds OS.
- Specialized the first division build-out around Walmart ACC, UCO, and Pressure Washing work.
- Added approval-controlled intake rules: AI-created jobs start in Needs Approval and remain inactive until approved by an authorized office user.
- Added Lucernex, PO, permit, tank, oil-removal, CompanyCam, route region, and billing pass-off fields to Work Items.
- Replaced generic board lanes with division lanes: Needs Approval, Triage, Permits, Tanks, Scheduling, Field Work, Billing, and Complete.
- Added red-flag logic for missing PO, permit delays, tank assignment/receiving, coordinated oil removal, field proof, and billing approval.
- Updated email intake to use Walmart-style job naming, detect multi-store emails, and flag multi-store AI-created jobs for human review.
- Added job-specific checklist templates for ACC Level 1, ACC Level 2, ACC Tank Replacement, DIY Only, UCO Tank Replacement, and Pressure Washing.
- Added checklist progress, open required-item counts, and saveable checklist completion toggles to the Reynalds Brothers dashboard.
- Added smart checklist automation so completed checklist items can update PO, permit, tank, oil-removal, pressure-washing vendor, media, billing, and phase status fields.
- Expanded the Work Item update panel so office users can edit approval, Lucernex, PO, permit, tank, oil-removal, CompanyCam, pressure-washing vendor, completion, and billing approval fields directly.
- Added email intake action controls so classified emails can create Needs Approval jobs, file to matched job timelines, or remain visible in the unmatched review queue.
