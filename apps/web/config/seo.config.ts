export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://koinoniatransactions.com";

export const seoConfig = {
  siteName: "Koinonia",
  businessName: "Koinonia Transactions",
  defaultTitle: "Koinonia | Real Estate Operations Support for Colorado Realtors",
  titleTemplate: "%s | Koinonia",
  defaultDescription:
    "White-glove real estate operations support for Colorado Realtors, including transaction management, listing support, licensed field coverage, marketing, CRM, and recurring business operations.",
  socialPreviewPath: "/assets/images/koinonia/social-preview.png",
  socialPreviewWidth: 1200,
  socialPreviewHeight: 630,
  siteUrl,
  locale: "en_US",
  publicRoutes: [
    {
      path: "/",
      title: "Koinonia | Real Estate Operations Support for Colorado Realtors",
      description:
        "Koinonia gives Colorado Realtors one support relationship for transaction management, listing operations, licensed field coverage, marketing, CRM, and recurring business operations."
    },
    {
      path: "/services",
      title: "Real Estate Services & Pricing",
      description:
        "Explore Koinonia pricing and what is included in Transaction Management, Hand Us the Listing, Licensed Field Coverage, Marketing Management, and Koinonia Partnership for Colorado Realtors."
    },
    {
      path: "/about",
      title: "About Koinonia",
      description:
        "Learn how Koinonia provides white-glove real estate operations support that helps Colorado Realtors hand off more of the work behind their clients."
    },
    {
      path: "/contact",
      title: "Contact Koinonia",
      description:
        "Tell Koinonia what you need handled — transactions, listings, field coverage, marketing, CRM, or recurring real estate business operations support in Colorado."
    }
  ]
} as const;

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}
