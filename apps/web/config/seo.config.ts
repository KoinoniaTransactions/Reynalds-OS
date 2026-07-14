export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://koinoniatransactions.com";

export const seoConfig = {
  siteName: "Koinonia",
  businessName: "Koinonia Transactions",
  defaultTitle: "Koinonia | Real Estate Operations Support",
  titleTemplate: "%s | Koinonia",
  defaultDescription:
    "Real estate operations support for Colorado Realtors, including transaction coordination, contract and document support, licensed showing coverage, and monthly operations partnership.",
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
        "Koinonia gives Colorado Realtors a trusted operations partner for transaction coordination, contract support, showing coverage, and monthly real estate operations support."
    },
    {
      path: "/services",
      title: "Services & Pricing",
      description:
        "Explore Koinonia services for transaction coordination, contract and document support, licensed showing coverage, and monthly real estate operations partnership."
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
        "Contact Koinonia for Colorado real estate operations support, transaction coordination, contract support, showing coverage, or monthly business support."
    }
  ]
} as const;

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}
