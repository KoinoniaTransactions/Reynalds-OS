# Project Memory — Reynalds OS v11.2.1

## Current Priority

Launch the Koinonia public website.

## Development Standard

Repository-first execution. Do not claim work is complete unless actual repository files were changed and packaged.

## Current Website Status

- `/koinonia` — Home assembled.
- `/koinonia/services` — Services & Pricing assembled.
- `/koinonia/about` — About assembled.
- `/koinonia/contact` — Contact assembled and enhanced with centralized contact configuration.

## Important Decisions Preserved

- Reynalds OS is the source of truth.
- Pages are assemblies of canonical components.
- Reuse before refine, refine before replace, replace before create.
- Every approved sprint produces a new OS ZIP release.
- Contact information must be configuration-driven.
- Do not invent production phone, SMS, social, or legal values.

## Contact Configuration Status

The repository uses `apps/web/config/contact.config.ts` as the canonical contact source. Email is verified as `hello@koinoniatransactions.com`. Phone and SMS are placeholders until production values are supplied.

## Next Action

Run Site QA and Launch Readiness Review, with phone/SMS values marked as a launch blocker.
