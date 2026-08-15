# Koinonia Public Website Release Readiness Checklist

## Status

Active checklist.

A public Koinonia page or material website change may not be marked production-released until the applicable gates pass.

For release architecture and branch governance, also follow:

- `03_Knowledge/Website/PRODUCTION_INDEX.md`
- `BRAIN/KOINONIA_DEPLOYMENT_READINESS.md`

## Gates

1. **Canonical-source check** — Business Objects, Brand, Website Knowledge, and applicable specifications reviewed before implementation.
2. **Content QA** — public copy matches approved service, pricing, referral, and professional-boundary rules.
3. **Component integrity** — canonical components reused or any new variant is documented.
4. **Visual consistency** — page follows the approved Koinonia art direction and shared hero/layout system.
5. **Responsive layout** — desktop and mobile presentation reviewed; purpose-built mobile hero assets used when appropriate.
6. **Accessibility basics** — heading structure, keyboard behavior, link clarity, alt text, and contrast reviewed.
7. **SEO** — title, description, canonical URL, heading hierarchy, and appropriate social metadata present.
8. **Focused technical verification** — relevant tests/type checks/build checks pass for the release scope.
9. **Release-scope audit** — changed files are reviewed to ensure unrelated Reynalds Brothers, Personal Finance, Koinonia Properties, portal-development, or other non-approved work is not unintentionally included.
10. **Live-feature preservation** — cumulative production features such as `/jeremiah`, `/referrals`, the five-service architecture, and approved public visual patterns remain present unless an explicit documented decision changes them.
11. **Documentation continuity** — `website_status.md` and other owning canonical documents are updated when the release changes a meaningful public-site rule or milestone.
12. **Production verification** — after promotion, verify the intended production deployment is READY and the affected live routes respond correctly.

## Evidence Rule

For a material release, preserve enough repository/deployment evidence to answer:

- what branch and commit were promoted,
- what files changed,
- what was intentionally excluded,
- what checks passed,
- what live routes were verified.

Do not require a new standalone continuity document when an existing canonical status, deployment, or Website Knowledge document already owns the information.

## Deprecated Rule

Squarespace/export compatibility is no longer a Koinonia release gate. The active public site is the custom Next.js/Vercel implementation.
