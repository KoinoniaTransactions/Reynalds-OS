# Koinonia Capability Recovery Ledger

Last reconciled: 2026-09-05
Owner: Koinonia / Jeremiah
Status: ACTIVE RECOVERY CONTROL DOCUMENT
Canonical reconciliation branch: `integration/koinonia-canonical-reconciliation-20260905`
Base checkpoint: `main` at `263053c9b72122ac9dd04d8fb9a008c81055022a`

## Purpose

This ledger exists because Koinonia development was intentionally split across multiple parallel AI/development branches. No single historical branch contains the complete current platform.

The goal is to recover the strongest surviving implementation of each capability into one controlled reconciliation branch without reviving stale commercial assumptions, overwriting newer September work, or merging old branches wholesale.

This file is the permanent capability-level source map for the reconciliation effort.

## Core rules

1. `main` is the governing source for the current September white-glove commercial model and unfinished public-site redesign.
2. `koinonia-production` is a separately controlled live-production lineage. Do not assume it is newer than `main` in commercial presentation.
3. `chatgpt/koinonia-transaction-intake-redesign` is the richest preserved portal/transaction operating lineage, but it is not a wholesale merge source.
4. `koinonia-marketing-readiness` and `koinonia-paid-social-launch-readiness` contain parallel marketing/measurement work that must be selectively ported.
5. Historical branch names are not reliable indicators of scope. Judge branches by actual commits/files/capabilities.
6. Never restore old pricing, legacy package assumptions, unsafe public claims, or stale website architecture merely because working code exists on an older branch.
7. Recover capability first; reconcile it against current business truth second; validate it third.
8. Production promotion remains owner-gated.
9. Do not put confidential personal/legal material into this public repository.

## Disposition legend

- `KEEP` — current canonical implementation or business truth; preserve.
- `RESTORE` — valuable implementation exists elsewhere and should be selectively recovered.
- `RECONCILE` — recover implementation but update it against current September commercial/technical truth.
- `REFERENCE` — useful history/source material, but not a direct merge source.
- `SUPERSEDED` — later implementation appears to replace it; retain only for archaeology unless a file-level diff reveals a lost capability.
- `GATED` — valid capability, but activation requires explicit verification/owner approval/external configuration.
- `DEFER` — not required for the current Koinonia reconciliation/launch path.

---

# 1. Current commercial and public-site truth

| Capability | Best source | Disposition | Recovery rule |
|---|---|---|---|
| September white-glove business model | `main` + Sept 3-5 canonical docs | KEEP | Governs all restored code and copy. |
| Current product/pricing model | `main` canonical commercial docs | KEEP | Do not restore legacy $389/$599 package assumptions or old standalone document pricing. |
| Homepage redesign | `main` | KEEP / unfinished | Preserve current light/airy approved direction; complete later after platform reconciliation foundation. |
| Services & Pricing redesign | `main` | KEEP / unfinished | Preserve current product/detail copy; fix information architecture later. |
| Listings / seller-support public capability | `main` | KEEP | Newer commercial capability not present in some older portal branches. |
| Current SEO/public-site architecture | `main` | KEEP / audit | Reconcile older landing/referral pages into current structure rather than reverting main. |

---

# 2. Portal, CRM, transaction and operations platform

Primary recovery source: `chatgpt/koinonia-transaction-intake-redesign`
Audited head during reconciliation: `3507bbe595a562f242fd5e981266b8697dea334d`
Open PR: #22

| Capability | Best source | Disposition | Recovery rule |
|---|---|---|---|
| Client portal shell | transaction-intake branch | RESTORE | Recover into current commercial baseline. |
| Employee/staff portal | transaction-intake branch | RESTORE | Preserve role/permission boundaries. |
| Portal authentication/sign-in/sign-out | transaction-intake branch | RESTORE | Reconcile current Clerk/environment behavior before release. |
| Portal access requests | transaction-intake branch | RESTORE | Keep workspace/permission controls. |
| Portal audit surfaces | transaction-intake branch | RESTORE | Preserve auditable mutation principle. |
| Buyer/Seller transaction-first intake | transaction-intake branch / PR #22 | RESTORE | Buyer/Seller are transaction roles, not permanent client types. |
| Transaction idempotency | transaction-intake branch / PR #22 | RESTORE | Preserve duplicate-file protection. |
| Relationship reuse/creation | transaction-intake branch / PR #22 | RESTORE | Reconcile with current CRM schema before migration. |
| RosObject transaction creation | transaction-intake branch / PR #22 | RESTORE | Preserve workspace scope and timeline/audit behavior. |
| Client dashboard `+ Start New File` model | transaction-intake branch / PR #22 | RESTORE | Validate against current portal UX before release. |
| Transaction search/filter/attention model | transaction-intake branch | RESTORE | Preserve Koinonia-managed workflow philosophy. |
| Referral application route | transaction-intake branch + later production lineage | RESTORE / RECONCILE | Reconcile with current white-glove positioning/economics. |
| Portal billing API surfaces | transaction-intake branch | RECONCILE | Recover logic/safety; do not restore stale prices. |
| Portal invoice/payment surfaces | transaction-intake branch | RECONCILE | Validate exact commercial triggers and Stripe assumptions. |
| Showing-request portal API | transaction-intake branch | RECONCILE | Align with current Licensed Field Coverage / Open House products. |

PR #22 explicitly remains a parallel lineage and is not approved for wholesale merge. It is a capability source.

---

# 3. Document intake, extraction and document workflow

| Capability | Best source | Disposition | Recovery rule |
|---|---|---|---|
| Protected document upload/storage | transaction-intake branch | RESTORE | Reuse existing protected document/R2 pipeline. |
| PDF/JPEG/PNG intake | transaction-intake branch / PR #22 | RESTORE | Avoid forcing duplicate manual entry. |
| Structured transaction extraction proposals | transaction-intake branch / PR #22 | RESTORE | Advisory only until human confirmation. |
| `Here's what we found` review | transaction-intake branch / PR #22 | RESTORE | Preserve confidence/review boundary. |
| `Confirm & Build File` human gate | transaction-intake branch / PR #22 | RESTORE | Required safety/data-quality boundary. |
| Temporary provider-file handling / cleanup | transaction-intake branch | RECONCILE | Revalidate current OpenAI adapter/model/config before activation. |
| Document status workflow | newer portal lineage | RESTORE | Older `recover/koinonia-document-send-package` work is reference unless diff reveals missing behavior. |
| Client document approvals | newer portal lineage | RESTORE | Preserve explicit response state. |
| Document version replacement | newer portal lineage | RESTORE | Preserve history/permissions. |
| Document send packages | transaction-intake branch API | RESTORE | Newer portal contains `document-send-packages`; old recovery branch is not primary. |

Automatic extraction remains GATED until the deployed environment contains a verified supported OpenAI configuration and the full intake -> extraction -> review -> confirm flow passes in preview.

---

# 4. Referral business

| Capability | Best source | Disposition | Recovery rule |
|---|---|---|---|
| Referral partner page/intake | advanced portal + production lineage | RESTORE / RECONCILE | Bring back as a first-class current business capability. |
| Referral hero/visual assets | later referral lineage | REFERENCE / RESTORE selectively | Preserve approved assets if still consistent with current visual system. |
| Referral economics | current canonical business docs / later portal state | KEEP / verify | Current owner-approved economics govern; do not infer from stale copy. |
| Referral relationship tracking | advanced portal/CRM lineage | RESTORE | Keep private agreement-level detail out of unnecessary public surfaces. |
| Referral SEO/discovery | production/portal lineage | RECONCILE | Integrate with September public-site architecture. |

Historical standalone referral branches are not direct merge sources unless a file-level diff identifies a capability absent from the newer lineage.

---

# 5. Billing, Stripe and pay-at-closing

Relevant sources include the advanced portal lineage plus separate billing/payment branches whose names do not fully describe their scope.

| Capability | Best source | Disposition | Recovery rule |
|---|---|---|---|
| Billing readiness evidence/rules | advanced portal + billing branches | RECONCILE | Preserve safety/readiness rules; align current products. |
| Billing setup requests | advanced portal | RESTORE / RECONCILE | Validate role and workflow. |
| Invoice surfaces | advanced portal | RESTORE / RECONCILE | Current product/pricing model controls invoice creation. |
| Payment surfaces | advanced portal + Stripe branches | RESTORE / RECONCILE | No live money movement until preview tests and owner gate. |
| Pay-at-closing logic | Stripe/payment lineage | RECONCILE | Preserve conditional business logic without restoring obsolete price values. |
| Exact-version/payment authorization safeguards | payment lineage | RESTORE | Retain audit/safety behavior where still applicable. |

No recovered billing code is considered launch-ready merely because an API route exists.

---

# 6. Production lineage deltas that occurred after portal synchronization

Primary source: `koinonia-production`
Audited later production checkpoint: `6644802cce54c4e295df7d98895b1493fc79a337`

| Capability | Best source | Disposition | Recovery rule |
|---|---|---|---|
| Stage 1 marketing reconciliation | production lineage | RESTORE selectively | Preserve first/latest/conversion attribution and CI prerequisites where not already present. |
| CI pnpm/version/test/Prisma fixes | production lineage | RESTORE if missing | Compare before applying; do not duplicate. |
| Retired `/appointments` redirect | production lineage | RESTORE | Required route/SEO compatibility item. |
| Later production-only hotfixes | production lineage | AUDIT | Compare file-by-file after portal foundation recovery. |

Do not merge `koinonia-production` wholesale into the reconciliation branch.

---

# 7. Marketing, analytics, retargeting and paid-social

## Marketing readiness

Primary source: `koinonia-marketing-readiness`
Previously audited head: `a3bc944e7eb950a4251416d6726266153d0c890e`

| Capability | Disposition | Recovery rule |
|---|---|---|
| Public-route GA4 loading | RECONCILE | Public marketing routes only. |
| Scheduler/service/contact intent events | RECONCILE | Diagnostic events are not primary leads. |
| Successful lead `generate_lead` | RECONCILE | Fire only after backend accepts the lead. |
| UTM persistence | RESTORE | Preserve first/latest/conversion touch. |
| `fbclid`, `ttclid`, `gclid`, `gbraid`, `wbraid`, `msclkid` | RESTORE | Persist safely through lead/CRM path. |
| Consent preferences | RESTORE / RECONCILE | Essential / Analytics / Analytics+advertising model. |
| Global Privacy Control behavior | RESTORE | GPC disables targeted advertising. |
| Meta/TikTok browser shells | GATED | Verified IDs + consent tests required. |
| Advertising tracking exclusion from authenticated routes | RESTORE | Non-negotiable privacy boundary. |

## Paid-social campaign readiness

Primary source: `koinonia-paid-social-launch-readiness`
Audited PR #25 head: `3f0405d08342403a9eac0a975196fae414e3d8df`

| Capability | Disposition | Recovery rule |
|---|---|---|
| `/coverage` paid-social landing page | RECONCILE | Update against current September white-glove products/claims. |
| Campaign attribution handoff | RESTORE | Reuse current first-party attribution rules. |
| Sanitized attribution in consultation lead notifications | RESTORE / audit | Keep private/safe and current. |
| Consent-aware GA4/Meta/TikTok/LinkedIn shells | RECONCILE / GATED | Real IDs + platform tests required. |
| Safe claim boundary around closing coverage | KEEP | Do not imply unapproved substitute representation or unsupported physical coverage. |

Do not merge either marketing branch wholesale.

---

# 8. Consultation system

Primary source: `chatgpt/koinonia-consultation-system`

Disposition: `RESTORE / RECONCILE`

Preserve and audit:

- consultation intake/interview flow;
- consultation relationship persistence;
- attribution handoff;
- staff execution/support tooling;
- current contact/scheduler integration;
- privacy disclosure behavior.

Do not allow older consultation copy or service taxonomy to override the September product model.

---

# 9. Marketing content / creative asset work

Primary source family: `feature/koinonia-stage2a-content-foundation` and later Stage 1/Stage 2 marketing commits.

Disposition: `REFERENCE / RESTORE ASSETS SELECTIVELY`

Preserve useful:

- faceless social creative concepts;
- approved graphics;
- animatics;
- campaign scripts/specifications;
- brand/visual decisions.

These assets are marketing-source material, not an application merge base.

---

# 10. Historical/reference-only branch families

The following categories are not assumed to be direct merge sources:

- older portal-live branches superseded by the transaction-intake lineage;
- old standalone referral branches where later lineage contains the functionality;
- `recover/koinonia-document-send-package` unless a file-level diff proves a lost capability;
- stale `develop` lineage;
- historical website polish checkpoints superseded by September `main`;
- historical commercial packages/pricing;
- personal-finance work;
- Koinonia Properties work;
- Reynalds Brothers work.

Separate business/application domains must not be mixed into Koinonia Transactions launch reconciliation without a specific requirement.

---

# 11. Reconciliation execution sequence

## Current executable checkpoint — 2026-09-05

- Canonical branch head: `30466485e74c7b66fdc7209b66d4e9a3f8fa399b`.
- Green preview: Vercel deployment `dpl_G1xJq7pn5a7yh9JXQxfzEgpjnhNS` (`reynalds-os-7al7k6vmo-koinonia3.vercel.app`) reached `READY`.
- Managed auth, client portal shell/dashboard, transaction search/filter, transaction-scoped document handoff, compact transaction workspace, and document-first `Start a File` are executable on the reconciliation branch.
- Advanced document extraction/review code is restored: upload -> extraction proposal -> Realtor review -> explicit confirm/mismatch decision -> transaction/client/document classification -> deadline-obligation reconciliation -> initial package completion.
- The Realtor is not asked to re-enter client/property/transaction facts the documents can provide; side/stage are requested only when document evidence cannot establish them.
- Automatic extraction remains runtime-gated until preview R2/OpenAI configuration is verified and an end-to-end authenticated preview test passes.
- Employee/staff document workspace, document approval/version/send-package workflow, full attention workflow, and inbound transaction email remain pending.
- `main` and `koinonia-production` remain untouched by this recovery checkpoint.

## R0 — Recovery control foundation

- [x] R0.1 — Repository-wide branch/capability audit completed.
- [x] R0.2 — Fresh canonical reconciliation branch created from current `main`.
- [x] R0.3 — Capability Recovery Ledger created.
- [ ] R0.4 — Update `START_HERE.md` and master launch checklist to make this reconciliation checkpoint mandatory. (`START_HERE.md` is updated; master checklist remains pending.)
- [ ] R0.5 — Record the reconciliation branch in current-state/handoff docs.

## R1 — Portal foundation

- [x] R1.1 — Inventory exact portal/auth/permission files on advanced branch vs current main.
- [x] R1.2 — Restore portal shell and route foundation in smallest stable slice.
- [x] R1.3 — Restore authentication/sign-in/sign-out dependencies required by portal shell.
- [x] R1.4 — Restore workspace/role/permission checks.
- [ ] R1.5 — Restore access-request/audit foundations. (Mutation audit foundations are present; access-request recovery remains pending.)
- [x] R1.6 — Build/test before advancing. (Multiple green Vercel previews; latest checkpoint above.)

## R2 — Transaction and client operations

- [x] R2.1 — Restore client portal dashboard foundation.
- [x] R2.2 — Restore Buyer/Seller transaction-role intake, reconciled to the newer document-first Realtor UX.
- [x] R2.3 — Restore relationship/RosObject/timeline integration.
- [x] R2.4 — Restore idempotency and transaction search/filter behavior.
- [ ] R2.5 — Restore attention/obligation workflow. (Extraction-backed deadline obligations are restored; full attention workflow remains pending.)
- [x] R2.6 — Build/test before advancing.

## R3 — Document workflow

- [x] R3.1 — Restore protected upload/storage path.
- [x] R3.2 — Restore extraction proposal model.
- [x] R3.3 — Restore human review / Confirm & Build File gate.
- [ ] R3.4 — Restore document status/approval/version replacement.
- [ ] R3.5 — Restore document send packages.
- [ ] R3.6 — Verify provider/config gating and cleanup behavior. (Code gating/cleanup restored; live preview configuration and end-to-end extraction verification remain pending.)
- [x] R3.7 — Build/test before advancing. (Compilation, type-check, static generation, and Vercel preview deployment pass; runtime extraction verification remains under R3.6.)

## R4 — Referral business

- [ ] R4.1 — Restore referral route/intake.
- [ ] R4.2 — Restore referral CRM/relationship integration.
- [ ] R4.3 — Reconcile economics/copy against current canonical business rules.
- [ ] R4.4 — Reconcile referral visual assets/SEO with September public site.
- [ ] R4.5 — Build/test before advancing.

## R5 — Billing and payments

- [ ] R5.1 — Inventory advanced portal vs separate billing/payment branches.
- [ ] R5.2 — Restore billing readiness and setup logic.
- [ ] R5.3 — Restore invoices/payments with current product model.
- [ ] R5.4 — Restore pay-at-closing/safety controls where applicable.
- [ ] R5.5 — Verify no stale public/commercial price survives.
- [ ] R5.6 — Keep live payment activation owner-gated.
- [ ] R5.7 — Build/test before advancing.

## R6 — Later production deltas

- [ ] R6.1 — Compare post-sync production changes against reconciliation branch.
- [ ] R6.2 — Restore Stage 1 attribution/CI deltas not already present.
- [ ] R6.3 — Restore `/appointments` redirect.
- [ ] R6.4 — Audit remaining production-only fixes.
- [ ] R6.5 — Build/test before advancing.

## R7 — Marketing and paid-social infrastructure

- [ ] R7.1 — Selectively port marketing-readiness attribution/consent foundation.
- [ ] R7.2 — Preserve public/private tracking boundary.
- [ ] R7.3 — Reconcile `/coverage` campaign landing page.
- [ ] R7.4 — Preserve backend-accepted-lead conversion semantics.
- [ ] R7.5 — Keep real platform IDs and server APIs gated until verified.
- [ ] R7.6 — Build/test before advancing.

## R8 — Consultation system

- [ ] R8.1 — Compare consultation branch against recovered portal/CRM/public-site state.
- [ ] R8.2 — Restore non-duplicative consultation workflow/tooling.
- [ ] R8.3 — Reconcile current product/service taxonomy.
- [ ] R8.4 — Build/test before advancing.

## R9 — Composite reconciliation verification

- [ ] R9.1 — Inventory public, client, employee, portal and API routes.
- [ ] R9.2 — Compare recovered capability inventory against this ledger.
- [ ] R9.3 — Full tests pass.
- [ ] R9.4 — Production build passes.
- [ ] R9.5 — Auth/private/public boundaries verified.
- [ ] R9.6 — Document workflow verified.
- [ ] R9.7 — Transaction intake verified.
- [ ] R9.8 — Referral flow verified.
- [ ] R9.9 — Billing/payment activation remains gated unless explicitly approved.
- [ ] R9.10 — Non-production preview generated and reviewed.

## R10 — Repository truth reconciliation

- [ ] R10.1 — Update current state/handoffs after executable recovery is proven.
- [ ] R10.2 — Classify source branches as absorbed, reference-only, superseded or still-parallel.
- [ ] R10.3 — Keep a clear canonical executable source named in `START_HERE.md`.

Only after R9/R10 are stable should the public-site W1-W9 and marketing M1-M10 launch sequence resume against the recovered platform baseline.

---

# Acceptance rule

A capability is not marked recovered because a historical branch contains it.

It is recovered only when:

1. the intended code/data behavior exists on the canonical reconciliation branch;
2. it is reconciled against current September commercial truth;
3. relevant tests/build checks pass;
4. privacy/permission/billing boundaries are preserved;
5. continuity documentation is updated.

Production remains separately owner-gated.