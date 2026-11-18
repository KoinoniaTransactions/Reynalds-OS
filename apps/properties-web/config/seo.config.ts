import type { Metadata } from "next";

function configuredSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_PROPERTIES_SITE_URL?.trim();

  if (!raw) {
    return null;
  }

  let parsed: URL;

  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      "NEXT_PUBLIC_PROPERTIES_SITE_URL must be a valid URL."
    );
  }

  if (
    parsed.protocol !== "http:" &&
    parsed.protocol !== "https:"
  ) {
    throw new Error(
      "NEXT_PUBLIC_PROPERTIES_SITE_URL must use http or https."
    );
  }

  return parsed.toString().replace(/\/$/, "");
}

export const siteUrl = configuredSiteUrl();

export const seoConfig = {
  siteName: "Koinonia Properties",
  businessName: "Koinonia Properties",
  locale: "en_US",
  defaultTitle:
    "Front Range Property Management | Koinonia Properties",
  defaultDescription:
    "Rental property management and residential real estate on Colorado's Front Range, with every fee published.",
  publicRoutes: [
    {
      path: "/",
      title:
        "Front Range Property Management | Castle Rock & Parker | Koinonia Properties",
      description:
        "Rental property management from Boulder to Fountain. 10% full service or 8% owner-involved, 12-month tenant guarantee, payouts on the 10th and a reply within one hour."
    },
    {
      path: "/real-estate",
      title:
        "Buy or Sell a Home | Koinonia Properties",
      description:
        "Residential home buying and selling with Koinonia Properties. Rent now, sell later, with the same team."
    },
    {
      path: "/owners",
      title:
        "Property Management Services for Owners | Koinonia Properties",
      description:
        "Leasing, tenant screening, rent collection, maintenance and monthly reporting for Front Range rental homes. Every fee published."
    },
    {
      path: "/tenants",
      title:
        "Resident Services | Koinonia Properties",
      description:
        "Find a rental, request maintenance and get help from Koinonia Properties. Emergencies get a call back within one hour, 24/7."
    },
    {
      path: "/rentals",
      title:
        "Homes for Rent | Koinonia Properties",
      description:
        "Available rental homes managed by Koinonia Properties on Colorado's Front Range."
    },
    {
      path: "/portals",
      title:
        "Owner and Resident Login | Koinonia Properties",
      description:
        "Login and account access for Koinonia Properties owners and residents."
    },
    {
      path: "/rental-analysis",
      title:
        "Free Rental Analysis | What Will My Home Rent For? | Koinonia Properties",
      description:
        "Get a free rent estimate for your Front Range home, then talk through price, timing and condition with Koinonia Properties."
    },
    {
      path: "/pricing",
      title:
        "Property Management Fees & Pricing | Koinonia Properties",
      description:
        "10% full service or 8% owner-involved. Placement 50% of one month's rent, $199 renewals, no setup, vacancy or termination fees. See every fee."
    },
    {
      path: "/service-areas",
      title:
        "Property Management Service Areas | Front Range Colorado | Koinonia Properties",
      description:
        "Property management from Boulder south to Fountain, east to Aurora and the west-side cities, starting with Castle Rock and Parker."
    },
    {
      path: "/contact",
      title:
        "Contact Koinonia Properties | Property Management",
      description:
        "Call, text or email Koinonia Properties. Next steps within one hour during business hours, Monday–Friday 8–5 Mountain."
    },
    {
      path: "/policies",
      title:
        "Rental Policies | Fair Housing & Applications | Koinonia Properties",
      description:
        "Fair housing, application fees, security deposits and after-hours emergency policies for Koinonia Properties rentals."
    },
    {
      path: "/apply",
      title:
        "Apply for a Rental Home | Koinonia Properties",
      description:
        "Apply for a Koinonia Properties rental. $35 application fee, limited to the actual cost of screening."
    },
    {
      path: "/maintenance",
      title:
        "Request Maintenance | 24/7 Emergencies | Koinonia Properties",
      description:
        "Request maintenance from Koinonia Properties. Emergencies get a call back within one hour, 24/7. Call 911 first for fire, gas or carbon monoxide."
    },
    {
      path: "/vendors",
      title:
        "Vendor Information | Koinonia Properties",
      description:
        "Information for qualified, insured maintenance vendors who want to work with Koinonia Properties."
    },
    {
      path: "/standards",
      title:
        "Service Standards | Koinonia Properties",
      description:
        "Koinonia Properties service standards for owner communication, resident support, maintenance, records and privacy."
    },
    {
      path: "/home-not-selling",
      title:
        "Home Not Selling? Rent It Instead | Koinonia Properties",
      description:
        "Listed home sitting on the market? See whether rent can cover your payment, how the IRS 2-of-5-year rule works and how we work with your listing agent."
    },
    {
      path: "/for-agents",
      title:
        "Agent Referral Program | Property Management Referrals | Koinonia Properties",
      description:
        "Refer an owner, keep your client. One month of management fee paid brokerage to brokerage, and we send your client back to you when it's time to sell."
    },
    {
      path: "/owner-faq",
      title:
        "Property Management FAQ for Owners | Koinonia Properties",
      description:
        "Straight answers on fees, guarantees, payouts, repair approvals and emergencies from Koinonia Properties."
    },
    {
      path: "/about",
      title:
        "About Koinonia Properties | Front Range Property Management",
      description:
        "Meet Koinonia Properties, a local Front Range property manager that publishes every fee and answers quickly."
    },
    {
      path: "/property-management/castle-rock",
      title:
        "Castle Rock Property Management | Koinonia Properties",
      description:
        "Property management in Castle Rock, CO. Published fees, 12-month tenant guarantee, payouts on the 10th and local market data."
    },
    {
      path: "/property-management/parker",
      title:
        "Parker Property Management | Koinonia Properties",
      description:
        "Property management in Parker, CO. Published fees, 12-month tenant guarantee, payouts on the 10th and local rent data."
    }
  ]
} as const;

export function absoluteUrl(path = "/") {
  if (!siteUrl) {
    return null;
  }

  const normalizedPath =
    path.startsWith("/") ? path : `/${path}`;

  return `${siteUrl}${normalizedPath}`;
}

export function getPublicRouteSeo(path: string) {
  const normalizedPath =
    path.startsWith("/") ? path : `/${path}`;

  const route = seoConfig.publicRoutes.find(
    (candidate) =>
      candidate.path === normalizedPath
  );

  if (!route) {
    throw new Error(
      `Missing public SEO route for ${normalizedPath}`
    );
  }

  return route;
}

export function buildPublicRouteMetadata(
  path: string,
  keywords?: string[]
): Metadata {
  const route = getPublicRouteSeo(path);
  const canonical = absoluteUrl(route.path);

  const metadata: Metadata = {
    title: route.title,
    description: route.description,
    ...(canonical
      ? {
          alternates: {
            canonical
          }
        }
      : {}),
    openGraph: {
      title: route.title,
      description: route.description,
      siteName: seoConfig.siteName,
      locale: seoConfig.locale,
      type: "website",
      ...(canonical ? { url: canonical } : {})
    },
    twitter: {
      card: "summary",
      title: route.title,
      description: route.description
    }
  };

  if (keywords?.length) {
    metadata.keywords = keywords;
  }

  return metadata;
}
