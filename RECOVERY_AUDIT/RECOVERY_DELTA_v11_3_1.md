# Recovery Delta v11.3.1 — Bible Precheck

Status: Recovery baseline, not final Bible  
Change ID: ROS-0086  
Date: 2026-07-04

## Purpose

Preserve work from the later Koinonia website/contact sessions before declaring any repository version as the authoritative Bible.

## Baseline Used

The safest working base is `Reynalds_OS_v11_2_1_Koinonia_Contact_Config`, because it contains:

- Public Koinonia routes: `/koinonia`, `/koinonia/services`, `/koinonia/about`, `/koinonia/contact`.
- Canonical site components: Hero, UniversalCard, TrustPillars, FAQ, CTA, Footer.
- Contact configuration file: `apps/web/config/contact.config.ts`.
- ContactActions component.
- Page assemblies for Home, Services, About, and Contact.

## Preserved Additional Work

The later `v11.3.0 Koinonia Services & Pricing Assembly` snapshot is preserved under:

```text
RECOVERY_AUDIT/source_snapshots/v11_3_0_services_pricing/
```

It includes the alternate Services & Pricing implementation and component-ID style site component structure.

## Key Finding

The uploaded v10.1 root files are not sufficient to call the current repository the Bible. They preserve the ROS platform foundation, but not all later Koinonia website/contact implementation work.

## Canonical Decision

Do not overwrite the v11.2.1 contact-config baseline with v11.3.0 until the v11.3.0 Services & Pricing code is reviewed and safely reconciled. The two versions use different site component structures.

## Data Preserved

- v11.2.1 working website/contact baseline retained.
- v11.3.0 Services & Pricing snapshot retained.
- Original v11.3.0 ZIP archived in `archives/source_repositories/`.
- Recovery status added to manifest, current state, roadmap, next action, release notes, and change log.

## Missing or Still Needs Verification

- Real phone/SMS values remain unresolved unless supplied separately.
- Local install/build/runtime validation has not yet been performed.
- v11.3.0 Services & Pricing implementation must be reviewed before integration.
- Final production website QA still pending.

## Definition of Bible

A version may only be called the Bible after:

1. All known session work is represented or intentionally archived.
2. Local setup has run successfully.
3. Build/test validation has completed.
4. Public Koinonia routes are verified.
5. Contact configuration values are reviewed.
6. The repository source of truth agrees with the actual code.
