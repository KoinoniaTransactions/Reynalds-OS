# Koinonia Legacy `/appointments` Redirect — Production Record

Date completed: 2026-09-01

## Purpose

Preserve traffic and Google indexing value from the retired Squarespace `/appointments` URL while sending visitors to the current Koinonia consultation workflow.

## Production Behavior

- Legacy URL: `https://www.koinoniatransactions.com/appointments`
- Current destination: `https://www.koinoniatransactions.com/contact#schedule-consultation`
- Redirect type: permanent Next.js redirect (`permanent: true`)
- Implementation file: `apps/web/next.config.ts`
- Production branch: `koinonia-production`
- Production implementation commit: `6644802cce54c4e295df7d98895b1493fc79a337`
- Vercel deployment: `dpl_2b6TSqut4en7821pJHFFjoWsq9ii`
- Vercel project: `reynalds-os-web`
- Production state at verification: `READY`

## Verification

Vercel production verification on 2026-09-01 confirmed that a request for `/appointments` is served by the current contact route. The final response reported `x-matched-path: /contact`, used deployment `dpl_2b6TSqut4en7821pJHFFjoWsq9ii`, and contained the `schedule-consultation` section and current consultation scheduler content.

The production deployment is aliased to both `koinoniatransactions.com` and `www.koinoniatransactions.com`.

## SEO Rationale

The old `/appointments` page originated on the former Squarespace site and remained visible in Google search results after the website migration. Because a directly relevant replacement exists, the correct migration behavior is to retain a permanent redirect rather than return a 404/410 or recreate the obsolete page.

Do not add `/appointments` to the sitemap. Keep the redirect in place long-term so search engines and old external links continue to consolidate toward the current contact/consultation page.

## Google Follow-Up

After the production redirect is live:

1. Use Google Search Console URL Inspection for `https://www.koinoniatransactions.com/appointments`.
2. Inspect and request indexing for `https://www.koinoniatransactions.com/contact`.
3. Continue monitoring until Google replaces or removes the old Squarespace search result.

Search-result cleanup may lag behind the live redirect because Google's index and cached result text update on Google's recrawl schedule.
