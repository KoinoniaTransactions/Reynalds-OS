# Koinonia Paid Social Campaign 02 — Capacity / Beyond the File

Status: Production master approved for creative; service-claim gating applies before activation  
Owner: Koinonia Transactions  
Primary audience: Colorado Realtors  
Primary objective: Qualified lead / consultation request  
Primary CTA: See Your Coverage Options  
Paid destination: `/coverage`

## Locked Core Message

> Transaction management is only part of the job. When the work goes beyond the file, Koinonia gives you access to licensed support, so more of your business stays covered.

Approved proof-point sequence:

> Showings. Open houses. Contract support. Closing coverage. And support for the day-to-day work that keeps your business moving.

## Service-Claim Gate

The creative direction and "closing coverage" wording are approved by the owner for creative development, but the existing Campaign 01 service-claim spec states that physical closing attendance / standalone closing field coverage must be operationally approved before paid activation.

Therefore maintain two production masters:

1. `Koinonia_PRODUCTION_9x16_APPROVED_CLOSING_COVERAGE.mp4` — exact owner-approved creative wording. Do not activate in paid media until closing coverage is operationally verified.
2. `Koinonia_PRODUCTION_9x16_LAUNCH_SAFE.mp4` — launch-safe alternate using "Closing preparation."
3. Matching 4:5 feed versions for Facebook / Instagram feed and LinkedIn.

Do not imply Koinonia itself is a Realtor. The positioning is access to licensed support through the Koinonia support relationship.

## Production Format

### Reels / Stories / TikTok
- 9:16
- 1080 x 1920
- H.264 MP4
- 30 fps
- AAC audio, 48 kHz
- Burned-in captions
- Critical text and CTA held within shared vertical safe area
- Sound-on mix with VO dominant
- Logo held until end card

### Facebook / Instagram Feed + LinkedIn Sponsored Video
- 4:5
- 1080 x 1350
- H.264 MP4
- 30 fps
- AAC audio, 48 kHz
- Native 4:5 composition; do not simply crop the 9:16 master

## Creative Direction

- Realtor problem/value proposition before branding.
- Dark premium operational UI / evidence aesthetic.
- Warm off-white, charcoal / black, muted Koinonia gold.
- No stock-agent lifestyle imagery.
- No fake storefront or staged handshake visuals.
- Evidence-style details: transaction status, buyer request, coverage request, showing/open-house/contract/closing support cards, day-to-day operations.
- Captions must remain readable with sound off.
- End card should contain Koinonia, `REAL ESTATE OPERATIONS SUPPORT`, `FOR COLORADO REALTORS`, CTA, and domain.

## Locked VO — Exact Creative Version

> Transaction management is only part of the job. When the work goes beyond the file, Koinonia gives you access to licensed support, so more of your business stays covered. Showings. Open houses. Contract support. Closing coverage. And support for the day-to-day work that keeps your business moving.

## Launch-Safe VO

> Transaction management is only part of the job. When the work goes beyond the file, Koinonia gives you access to licensed support, so more of your business stays covered. Showings. Open houses. Contract support. Closing preparation. And support for the day-to-day work that keeps your business moving.

## Platform Assignment

### Instagram Reels
Asset: 9:16 master  
CTA: Learn More  
Primary copy: `Transaction management is only part of the job. Koinonia gives Colorado Realtors support for the work that happens beyond the file.`

### Facebook Reels
Asset: 9:16 master  
CTA: Learn More

### TikTok In-Feed
Asset: 9:16 master  
CTA: Learn More  
Use the launch-safe version unless all service claims in the exact creative have been operationally verified.

### Instagram / Facebook Feed
Asset: 4:5 master  
CTA: Learn More

### LinkedIn Sponsored Video
Asset: 4:5 master  
Headline: `Real Estate Operations Support for Colorado Realtors`  
CTA: Learn More

## Tracking Names

- `KT_C02_IG_CAPACITY_MASTER_A`
- `KT_C02_FB_CAPACITY_MASTER_A`
- `KT_C02_TT_CAPACITY_MASTER_A`
- `KT_C02_LI_CAPACITY_MASTER_A`

## Paid Destination + UTMs

Base destination: `https://koinoniatransactions.com/coverage`

- Instagram: `https://koinoniatransactions.com/coverage?utm_source=instagram&utm_medium=paid_social&utm_campaign=capacity_02&utm_content=master_a`
- Facebook: `https://koinoniatransactions.com/coverage?utm_source=facebook&utm_medium=paid_social&utm_campaign=capacity_02&utm_content=master_a`
- TikTok: `https://koinoniatransactions.com/coverage?utm_source=tiktok&utm_medium=paid_social&utm_campaign=capacity_02&utm_content=master_a`
- LinkedIn: `https://koinoniatransactions.com/coverage?utm_source=linkedin&utm_medium=paid_social&utm_campaign=capacity_02&utm_content=master_a`

Preserve `gclid`, `fbclid`, `ttclid`, and `li_fat_id` when supplied by the platform. The site stores first-party attribution for the current session and includes sanitized attribution with a successful consultation request.

## Measurement Configuration

Optional analytics/pixel scripts are consent-gated and must use confirmed production IDs only:

- `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`
- `NEXT_PUBLIC_TIKTOK_PIXEL_ID`
- `NEXT_PUBLIC_LINKEDIN_PARTNER_ID`
- `NEXT_PUBLIC_LINKEDIN_CONVERSION_ID`

A successful consultation submission is the conversion boundary. The client fires GA4 `generate_lead`, Meta `Lead`, TikTok `SubmitForm`, and the configured LinkedIn conversion only after the consultation API returns success. No PII is included in those client-side conversion events.

## Pre-Launch Checklist

- Verify closing-coverage operational authority before using exact creative version.
- Confirm `/coverage` accurately reflects promoted services.
- Confirm `GA4 generate_lead` fires on a successful production consultation submission after consent.
- Confirm Meta / TikTok / LinkedIn pixels and consent behavior after real production IDs are configured.
- Preserve click IDs and UTM parameters through form submission.
- Smoke-test the consultation email and confirm Marketing Attribution is present in the received lead.
- Upload 9:16 and 4:5 as placement-specific assets rather than relying on automatic cropping.
- Check each platform preview for UI collisions before publishing.
- Use commercial-cleared / original music only.
- Do not judge creative on likes; evaluate hold rate, video completion, link CTR, landing-page views, qualified leads, and consultation cost.
