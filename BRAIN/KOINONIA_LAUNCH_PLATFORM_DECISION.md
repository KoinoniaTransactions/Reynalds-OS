# Koinonia Launch Platform Decision

Status: Approved  
Decision Date: 2026-07-13  
Owner: Koinonia Transactions / Reynalds OS

---

## Decision

Koinonia should launch using the current custom Next.js site, not by rebuilding the site in Squarespace before launch.

The approved launch direction is:

- Keep the current Next.js website
- Deploy the current site using a platform such as Vercel
- Keep the public website at root paths
- Keep Reynalds OS preserved at `/dashboard`
- Add SEO launch essentials before going live
- Do not migrate to Squarespace unless a later business decision intentionally changes the platform strategy

---

## Reasoning

Koinonia is no longer only a simple brochure website.

The current site now includes:

- Custom Koinonia public pages
- Root public routes
- Service model alignment
- Pricing posture
- Monthly Operations Partnership structure
- Service boundary decisions
- Public scope notes
- Contact intake paths
- Reynalds OS continuity through `/dashboard`
- Brain documentation and launch decision records

Rebuilding in Squarespace would likely require recreating the approved structure manually and would separate the public website from the longer-term Reynalds OS vision.

---

## Approved Current Routing

Public Koinonia site:

- `/`
- `/services`
- `/about`
- `/contact`

Internal Reynalds OS:

- `/dashboard`

Backward-compatible Koinonia aliases:

- `/koinonia`
- `/koinonia/services`
- `/koinonia/about`
- `/koinonia/contact`

---

## SEO / Launch Direction

The launch path should focus on making the current Next.js site launch-ready, rather than migrating platforms.

Required SEO launch work should include:

- Per-page metadata for Home, Services, About, and Contact
- Sitemap
- Robots file
- Open Graph / social preview metadata
- Local/service SEO copy review
- Domain connection
- Deployment setup
- Google Search Console
- Google Analytics or equivalent analytics
- Google Business Profile review/optimization

---

## Future Rule

When launch planning resumes, do not reopen the Squarespace vs custom-site decision unless the user explicitly asks to reconsider platforms.

The recorded decision is:

> Launch the current Next.js Koinonia site. Do not rebuild in Squarespace before launch.

If the user says, "the platform decision has been recorded," continue from this decision and move into launch SEO, deployment, and domain readiness.

