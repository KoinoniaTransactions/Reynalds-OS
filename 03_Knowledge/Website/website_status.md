# Koinonia Website Status

## Current Routes

| Page | Route | Status |
|---|---|---|
| Internal Reynalds OS Dashboard | `/` | Preserved |
| Home | `/koinonia` | Assembled |
| Services & Pricing | `/koinonia/services` | Assembled |
| About | `/koinonia/about` | Assembled |
| Contact | `/koinonia/contact` | Placeholder |

## Next Step

Contact Page Assembly.

## Build Rule

Pages are assemblies of canonical components.

## 2026-09-01 — Google Analytics 4 Integration Prepared

GA4 support is implemented for the public Koinonia website and remains inactive until
`NEXT_PUBLIC_GA_MEASUREMENT_ID` is configured in the production hosting environment.

- Analytics loads only through the shared public Koinonia Header.
- Reynalds OS and secure portal routes are not instrumented.
- Successful consultation submissions emit GA4's `generate_lead` event.
- The event includes only `method: consultation_form` and the selected service type.
- Names, email addresses, phone numbers, requested dates, notes, and other form details are
  never sent to GA4.
- Production build and public-site isolation checks pass with a test measurement ID.

Remaining production steps:

1. Create the Koinonia Transactions GA4 property and web stream.
2. Configure its `G-...` measurement ID as `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel
   Production only.
3. Deploy `koinonia-production` and verify page views plus `generate_lead` in GA4 Realtime.
