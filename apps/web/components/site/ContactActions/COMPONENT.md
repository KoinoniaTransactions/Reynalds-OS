# COMP-CONTACT-ACTIONS-001 — Contact Actions

Status: Active production implementation  
Owner: Koinonia Website System  
Version: 1.1

## Purpose

Provide one reusable presentation component for Koinonia phone, SMS, and email actions.

## Data Source

`apps/web/config/contact.config.ts`

## Production Contact Values

Email:

- `jeremiah@koinoniaadmin.com`

Phone:

- `(719) 745-8497`

Text:

- `(719) 745-8497`

## Notes

Phone and SMS are now production-ready contact actions.

The component still supports placeholder states through `contact.config.ts`, but the current production configuration does not use placeholders.

## Used By

- `/koinonia/contact`
- Footer
- Future CTA/contact surfaces
