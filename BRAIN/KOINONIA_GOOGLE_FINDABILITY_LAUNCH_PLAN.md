# Koinonia Google Findability Launch Plan

Date created: 2026-07-28

## Purpose

This document protects the correct order for getting Koinonia discoverable on Google Search and Google Maps without destabilizing the live website, DNS, or scheduler.

The website is already live. Squarespace should remain untouched for now. Do not cancel Squarespace, change nameservers, transfer the domain, or delete DNS records while Google indexing and Maps setup are being started.

## Current Live Website

- Primary website: https://www.koinoniatransactions.com
- Apex redirect: https://koinoniatransactions.com
- Scheduler: https://www.koinoniatransactions.com/contact#schedule-consultation
- Website host: Vercel
- DNS currently stable and documented in BRAIN/KOINONIA_DNS_EXIT_PLAN.md

## Launch Order

1. Keep Squarespace and DNS stable.
2. Connect Google Search Console.
3. Submit sitemap.
4. Inspect key URLs.
5. Create or claim Google Business Profile.
6. Add or verify local business structured data on the website.
7. Add findable service/location content only after the core Google setup is stable.
8. Delay Squarespace cancellation or registrar/DNS migration until Google Search, Maps, scheduler, and email are confirmed working.

## Step 1 — Do Not Disturb DNS

Current rule: do not cancel Squarespace yet.

Do not change:

- Nameservers
- Vercel A record
- Vercel www CNAME
- Resend DKIM record
- Resend SPF record
- Resend send MX record
- Domain verification records

Reason: the live website and scheduler are working. Google discovery should begin from the stable production setup.

## Step 2 — Google Search Console

Goal: give Google a verified property for Koinonia and submit the live sitemap.

Recommended first property:

- URL-prefix property: https://www.koinoniatransactions.com/

Reason: it avoids immediate DNS changes and focuses on the primary canonical www website.

Optional later property:

- Domain property: koinoniatransactions.com

Reason: it covers the full domain, including subdomains and protocol variations, but usually requires a DNS TXT verification record. Do not add that DNS record without reviewing the exact Google-provided value first.

Search Console actions:

1. Add property for https://www.koinoniatransactions.com/
2. Verify ownership using the cleanest available method.
3. Submit sitemap: https://www.koinoniatransactions.com/sitemap.xml
4. Use URL Inspection on:
   - https://www.koinoniatransactions.com/
   - https://www.koinoniatransactions.com/services
   - https://www.koinoniatransactions.com/about
   - https://www.koinoniatransactions.com/contact
5. Request indexing for the above URLs after live inspection passes.

## Step 3 — Google Business Profile / Maps

Goal: make Koinonia eligible to appear in Google Maps and local business results.

Important business type decision:

- If clients can visit a real office location during stated hours, use a storefront or hybrid business setup.
- If Koinonia works remotely or travels to clients and does not serve clients at the home/private address, use a service-area business setup and hide the private address.

Do not create fake office locations, virtual offices, PO boxes, or keyword-stuffed business names.

Business Profile information to prepare:

- Business name: Koinonia Transactions
- Website: https://www.koinoniatransactions.com
- Phone: 719-745-8497
- Email/contact destination: jeremiah@koinoniaadmin.com
- Primary category: to be chosen carefully inside Google Business Profile
- Service area: Colorado-focused, exact cities/regions to be decided
- Services: transaction coordination, contract/document support, licensed showing coverage, real estate operations support
- Business hours: to be decided
- Business description: should be natural, clear, and not keyword-stuffed

## Step 4 — LocalBusiness Structured Data

Goal: make the website machine-readable for Google using structured data that matches the visible site and Business Profile.

Add only truthful data that is visible or supported by the website and business operations.

Structured data candidates:

- Organization or LocalBusiness identity
- Business name
- Website URL
- Phone number
- Service area
- Services offered
- SameAs social links once profiles are ready

Do not add fake reviews, fake ratings, fake addresses, or unsupported business hours.

## Step 5 — Findable Content Expansion

Do this after Search Console and Business Profile are underway.

Likely content improvements:

- Add a stronger service-area statement for Colorado Realtors.
- Add clearer service pages for transaction coordination, contract support, showing coverage, and monthly operations support.
- Add FAQ content based on real Realtor questions.
- Add local trust signals, license context, and process clarity.
- Add individual service pages only if they are useful and not thin/duplicate.

Do not rush into lots of low-quality location pages. Quality and accuracy matter more than volume.

## Step 6 — Measurement

Track:

- Search Console indexing status
- Sitemap submission status
- Queries and impressions
- Google Business Profile verification status
- Calls, texts, website clicks, and scheduler submissions
- Contact form delivery

## Current Technical URLs to Confirm

- https://www.koinoniatransactions.com/robots.txt
- https://www.koinoniatransactions.com/sitemap.xml
- https://www.koinoniatransactions.com/manifest.webmanifest

## Legacy `/appointments` Migration — Completed 2026-09-01

The former Squarespace URL `https://www.koinoniatransactions.com/appointments` remained visible in Google after the website migration. A permanent Next.js redirect was therefore deployed from `/appointments` to `/contact#schedule-consultation`.

Production implementation:

- Branch: `koinonia-production`
- Commit: `6644802cce54c4e295df7d98895b1493fc79a337`
- Vercel deployment: `dpl_2b6TSqut4en7821pJHFFjoWsq9ii`
- Deployment status: `READY`
- Live verification: `/appointments` resolves through the current `/contact` route and the destination page contains the `schedule-consultation` section.
- Detailed production record: `BRAIN/KOINONIA_APPOINTMENTS_REDIRECT_PRODUCTION_RECORD.md`

Do not add `/appointments` to the sitemap or recreate the old Squarespace page. Keep the permanent redirect in place long-term. Google may continue showing the old search-result title/snippet until it recrawls and updates its index.

Search Console follow-up for this migration:

1. Inspect `https://www.koinoniatransactions.com/appointments`.
2. Inspect and request indexing for `https://www.koinoniatransactions.com/contact`.
3. Monitor until the obsolete Squarespace result is replaced or removed.

## Next Manual Step

Create or open Google Search Console and add the URL-prefix property for https://www.koinoniatransactions.com/. After Google shows the verification options, stop and record the exact verification method before changing the website or DNS.
