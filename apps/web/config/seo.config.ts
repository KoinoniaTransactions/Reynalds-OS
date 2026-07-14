export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://koinoniatransactions.com";

export const seoConfig = {
  siteName: "Koinonia",
  businessName: "Koinonia Transactions",
  defaultTitle: "Koinonia | Real Estate Operations Support",
  titleTemplate: "%s | Koinonia",
  defaultDescription:
    "Real estate operations support for Realtors, including transaction support, contract and document support, licensed showing coverage, and monthly operations partnership.",
  socialPreviewPath: "/assets/images/koinonia/social-preview.png",
  socialPreviewWidth: 1200,
  socialPreviewHeight: 630,
  siteUrl,
  locale: "en_US",
  publicRoutes: [
    {
      path: "/",
      title: "Koinonia | Real Estate Operations Support",
      description:
        "Koinonia gives Realtors a trusted operations partner for the work behind the client relationship."
    },
    {
      path: "/services",
      title: "Services & Pricing",
      description:
        "Explore Koinonia services for transaction support, contract and document support, licensed showing coverage, and monthly operations partnership."
    },
    {
      path: "/about",
      title: "About Koinonia",
      description:
        "Learn the purpose behind Koinonia and how it supports Realtors with clarity, consistency, and dependable real estate operations support."
    },
    {
      path: "/contact",
      title: "Contact Koinonia",
      description:
        "Contact Koinonia for real estate operations support, transaction support, contract support, showing coverage, or monthly business support."
    }
  ]
} as const;

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}
