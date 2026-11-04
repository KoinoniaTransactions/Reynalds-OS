# Decision Log

## D-001 — Use Shared Object Engine

Decision: Use `RosObject` as the central registry for business records.

Reason: Prevents disconnected module data and supports cross-module intelligence.

## D-002 — Use Timeline Events

Decision: Meaningful changes create timeline events.

Reason: Supports auditability, troubleshooting, and AI grounding.

## D-003 — Use Read-Only Copilot First

Decision: Copilot starts read-only.

Reason: Builds trust before allowing AI actions.

## D-004 — Use Workflow Engine as Long-Term Automation Core

Decision: Future automation should flow through workflow definitions and workflow runs.

Reason: Prevents each module from creating separate automation logic.

## D-005 — Move Away From Incremental Static App Shells

Decision: v7.2 static app shell should be considered superseded by the production Next.js app.

Reason: The project now needs a real running software workflow, not separate static prototype files.

## D-006 — Keep Brain Inside Repository

Decision: Store core architecture and development rules in `BRAIN/`.

Reason: Future development should start from repository truth, not memory.


## D-007 — Repository-First Completion Standard

Decision: Do not claim implementation, lock, completion, or release unless actual repository files were inspected, modified, documented, versioned, and packaged.

Reason: Prevents conceptual work from being mistaken for production work.

## D-008 — Continuity Package Required

Decision: Every release must include a continuity package that enables future chats/developers to resume accurately.

Reason: Reynalds OS must preserve context across conversations without relying on memory.

## D-009 — Koinonia Website Built Component-First

Decision: Koinonia website pages should be assembled from canonical components wherever possible.

Reason: Improves consistency, reduces duplicate code, and accelerates launch.

## D-010 — Launch First

Decision: Website launch work takes priority over future Reynalds OS expansion unless an architectural improvement directly accelerates the website.

Reason: Prevents feature creep and keeps Koinonia moving toward publication.


## D-011 — Koinonia Properties Dual-Service Positioning and Local Discovery (2026-11-03)

Decision: **Koinonia Properties is a full-service real estate business equally committed to residential sales and property management; property management is the initial Google Maps/local Business Profile discovery priority.** Residential sales and management share one Properties public brand and should receive equally prominent website pathways and independently measured acquisition funnels. Koinonia Transactions remains separately marketed to Realtors and real estate teams. Two LLCs (existing Transactions LLC and proposed Properties LLC) are the preferred structural direction, not proof that Properties LLC has been formed or licensed.

Reason: Serve the distinct Realtor B2B and consumer/investor markets without diluting either; prioritize property-management local-service discovery while preserving full residential brokerage positioning.

Canonical detail: `02_Companies/Koinonia/04_Departments/Marketing/KOINONIA_PROPERTIES_POSITIONING_AND_LOCAL_DISCOVERY_2026-11-03.md`.

Limits: No legal filing, brokerage authority, Google profile/category alteration, website change, marketing activation, or deployment approved by this documentation decision. Two Google profiles at one hidden home-office address remain subject to independent eligibility and verification; no guarantee of approval.


## D-012 — Koinonia Properties Property Management Pricing and Maintenance Choices (2026-11-04)

Decision: Owner selected two rental management plans (10% fully managed maintenance; 8% owner-involved maintenance, with percentage basis provisionally rent collected), a **10% markup on Koinonia-coordinated contractor work under BOTH plans**, 50% of one month's rent for successful tenant placement, $199 completed lease renewal, intended $35 per-applicant screening charge subject to actual-cost/portable-report law, $99 midpoint visual inspection and $99 additional requested inspection, no owner setup or monthly vacancy fee. Routine repair threshold $250; owner nonurgent response expectation 24 hours; qualified owner-selected vendors/approved minor self-repair allowed; emergency and habitability authority preserved. No placement fee for unsuccessful rounds of marketing/showings; no complimentary replacement placement after tenant departure. Exact definitions, applicant fees and collection require compliance checks.

Additional planned features: instant third-party-data-backed rental valuation, and an authenticated Owner Maintenance Center with verified contractors, genuine preferred pricing, owner participation controls and repair history. Neither feature is live or approved for production implementation.

Reason: Offer owners transparent economics, meaningful choice over maintenance involvement, and immediate rental valuation while sustaining the work performed by Koinonia.

Canonical commercial detail: `02_Companies/Koinonia/03_Pricing/KOINONIA_PROPERTIES_MANAGEMENT_LEASING_FEES_2026-11-04.md`. Positioning relationship: D-011. No website, API, Google Profile, brokerage filings or public pricing changes are authorized by this record.
