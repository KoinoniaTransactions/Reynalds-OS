# Website Production Workflow

## Status

Active website production workflow.

## Page Lifecycle

Each website page moves through these states:

1. Draft
2. Strategy Approved
3. Implementation In Progress
4. Implementation Complete
5. Release Readiness Verified
6. Production Released

## Required Gates

### Strategy Gate

- Page purpose defined.
- Visitor question identified.
- Primary CTA defined.
- Section order approved.

### Implementation Gate

- Actual repository files created or updated.
- Canonical component reuse verified.
- No duplicate page/component systems created.
- HTML/CSS/React implementation exists in the repository.

### Release Readiness Gate

- Content QA
- Component integrity QA
- Visual QA
- Responsive QA
- Squarespace/platform QA when relevant
- Accessibility QA
- SEO QA

### Production Release Gate

A page may be marked Production Released only after all gates pass in repository files.

## Current Koinonia Website Priority

Do not create new systems unless they directly accelerate launch.

Primary sequence:

1. Establish canonical public website implementation path.
2. Build Home.
3. Build Services & Pricing.
4. Build About.
5. Build Contact.
6. Run site-wide QA.
7. Launch.

## Component-First Rule

Pages should be assembled from certified components whenever possible.

Preferred order:

1. Reuse
2. Refine
3. Replace
4. Create new

## Squarespace Rule

If deploying through Squarespace, preserve known implementation knowledge:

- one HTML block per page where appropriate
- avoid unnecessary section nesting
- watch editor vs live rendering differences
- verify mobile and live published rendering
- document whitespace fixes in the OS
