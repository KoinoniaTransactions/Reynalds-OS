export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://koinoniatransactions.com";

export const seoConfig = {
  siteName: "Koinonia",
  businessName: "Koinonia Transactions",
  defaultTitle: "Koinonia | Real Estate Operations Support",
  titleTemplate: "%s | Koinonia",
  defaultDescription:
    "Real estate operations support for Colorado Realtors, including transaction coordination, contract and document support, licensed showing coverage, professional open houses, and monthly operations partnership.",
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
        "Koinonia gives Colorado Realtors a trusted operations partner for transaction coordination, contract support, licensed showing and open house coverage, and monthly real estate operations support."
    },
    {
      path: "/services",
      title: "Services & Pricing",
      description:
        "Explore Koinonia services for transaction coordination, contract and document support, licensed showing coverage, professional open houses, and monthly real estate operations partnership."
    },
    {
      path: "/referrals",
      title: "40% Referral Partner Option",
      description:
        "Learn about the Koinonia 40% Referral Partner Option for licensed real estate professionals who would rather refer a buyer or seller opportunity than personally carry the client relationship."
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
        "Contact Koinonia for Colorado real estate operations support, transaction coordination, contract support, showing coverage, professional open houses, monthly business support, or the Referral Partner Option."
    }
  ]
} as const;

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}
