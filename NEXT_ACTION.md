# Next Action

Last reconciled: 2026-09-05

## Goal

Finish Koinonia marketing-launch instrumentation safely against the current September commercial/site architecture without disturbing production.

## Immediate Sequence

1. Read `BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md`.
2. Read `BRAIN/CURRENT_PRIORITIES.md` and the current Koinonia commercial/readiness sources on `main`.
3. Create a fresh marketing-integration branch from current `main`.
4. Do **not** merge `koinonia-marketing-readiness` wholesale; selectively port/reimplement:
   - public-route GA4 loading;
   - marketing funnel events;
   - UTM/click-ID attribution;
   - CRM first/latest/conversion-touch persistence;
   - privacy/consent + GPC handling;
   - consent-gated Meta/TikTok browser tracking;
   - paid-social landing-page concept reconciled to current products/claims.
5. Confirm the real GA4 Measurement ID and prove realtime page-view + `generate_lead` events.
6. Create/identify the real Meta Dataset/Pixel ID.
7. Create/identify the real TikTok Pixel ID.
8. Add IDs to preview only and verify test events.
9. Submit a tagged test consultation and prove:
   - UTM/click-ID capture;
   - CRM relationship attribution;
   - first/latest/conversion touch;
   - follow-up task;
   - GA4 lead event;
   - Meta/TikTok lead event.
10. Verify SPF, DKIM, DMARC, unsubscribe and suppression before the large email campaign.
11. Present preview/results to the owner.
12. Deploy to production only after explicit owner approval.

## Production Safety

- `main`, `koinonia-production`, and `koinonia-marketing-readiness` are not interchangeable.
- Never blindly merge branches.
- Never deploy experimental marketing tracking to production without owner authorization.
- Never guess analytics/pixel IDs.
- Never put advertising pixels on authenticated client/staff routes.

## Primary Handoff

`BRAIN/AI_HANDOFF_2026-09-05_KOINONIA_MARKETING_READINESS.md`
