# Koinonia DNS Exit Plan

Date created: 2026-07-27

## Purpose

This document protects the Koinonia public website, scheduler, and email delivery before discontinuing or migrating away from Squarespace.

Koinonia is live. Squarespace must not be canceled until DNS ownership, registrar location, Vercel records, Resend records, and email/security records are fully inventoried and safely recreated wherever DNS will live long-term.

## Current Live Production URLs

- Primary website: https://www.koinoniatransactions.com
- Apex/root redirect: https://koinoniatransactions.com
- Scheduler: https://www.koinoniatransactions.com/contact#schedule-consultation

## Current Hosting

- Website host: Vercel
- Vercel project: reynalds-os-web
- Production branch: main
- Launch documentation commit: 66e0a8b
- Launch code commit: ebb9fb8

## Current DNS Management Warning

Squarespace is still part of the active DNS management path.

Do not cancel, disconnect, or transfer away from Squarespace until the following are confirmed:

1. The domain registrar is identified.
2. The authoritative nameservers are identified.
3. Every current DNS record is inventoried.
4. Vercel website records are recreated in the future DNS host.
5. Resend email records are recreated in the future DNS host.
6. DMARC/security records are recreated in the future DNS host.
7. Website, redirects, scheduler, and email are tested after migration.

## Known Required Website Records

### Primary www domain

- Type: CNAME
- Name: www
- Value: d03de16d76cf3d3f.vercel-dns-017.com
- Purpose: Points www.koinoniatransactions.com to Vercel.

### Root/apex domain

- Type: A
- Name: @
- Value: 76.76.21.21
- Purpose: Allows koinoniatransactions.com to reach Vercel and redirect to www.

## Known Required Resend / Email Records

Preserve these records during any DNS migration:

- TXT resend._domainkey
- TXT send
- MX send
- TXT _dmarc
- Any root TXT/SPF/domain verification records currently present

Do not add Resend inbound receiving records unless the business intentionally enables Resend receiving later.

## Public DNS Snapshot

This snapshot was collected from public DNS using dig on 2026-07-27.

### NS records

~~~text
ns-cloud-d3.googledomains.com.
ns-cloud-d2.googledomains.com.
ns-cloud-d4.googledomains.com.
ns-cloud-d1.googledomains.com.
~~~

### Root A record

~~~text
76.76.21.21
~~~

### WWW CNAME record

~~~text
d03de16d76cf3d3f.vercel-dns-017.com.
~~~

### WWW A resolution

~~~text
d03de16d76cf3d3f.vercel-dns-017.com.
216.198.79.65
64.29.17.65
~~~

### Root MX records

~~~text
~~~

### Send subdomain MX records

~~~text
10 feedback-smtp.us-east-1.amazonses.com.
~~~

### Root TXT records

~~~text
~~~

### Send TXT records

~~~text
"v=spf1 include:amazonses.com ~all"
~~~

### DMARC TXT records

~~~text
~~~

### Resend DKIM TXT records

~~~text
"p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDWHm7Fnc8WHaWMWzeFR8S54LezRF+wDBI4KA3/LkyFpw6Zb33XGq3/ceeEpK13X/r0pkfDIaXPXooIwLCmkLQxe3qdLyVl7/jqiQhsTRn3Dn+5TnEAAPIpriKrel1I1y0rE6ehm9Cta7UJIZAI1V43CKotnjcvxg6IYb1eFoN5VQIDAQAB"
~~~

## Safe Squarespace Exit Order

1. Confirm where the domain is registered.
2. Confirm current authoritative nameservers.
3. Export or screenshot the full Squarespace DNS page.
4. Choose the long-term DNS host.
5. Recreate all required records in the new DNS host.
6. Lower TTLs if possible before migration.
7. Change nameservers only after the new DNS zone is fully prepared.
8. Wait for propagation.
9. Test the website, root redirect, scheduler, real email delivery, and Resend domain verification.
10. Only after all tests pass, discontinue unused Squarespace website services.

## Do Not Delete Without Review

Do not delete or change these categories without reviewing this document and the current DNS screen:

- Vercel website records
- Resend sending records
- DKIM records
- SPF records
- DMARC records
- MX records
- Domain verification records
- Nameserver settings

## Next Manual Step

Open Squarespace domain settings and identify whether Squarespace is only the DNS manager or also the registrar. Record the registrar, nameservers, renewal date, and whether domain lock or transfer lock is enabled.
