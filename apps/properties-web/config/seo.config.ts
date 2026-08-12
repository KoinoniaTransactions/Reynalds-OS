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
    "Koinonia Properties | Property Management",
  defaultDescription:
    "Property management support for rental property owners and residents, including rental analysis, leasing support, maintenance coordination, and clear communication.",
  publicRoutes: [
    {
      path: "/",
      title:
        "Koinonia Properties | Property Management",
      description:
        "Property management support for rental owners and residents, including rental analysis, leasing, maintenance coordination, and clear communication."
    },
    {
      path: "/owners",
      title:
        "Owner Services | Koinonia Properties",
      description:
        "Property management information for owners seeking rental analysis, leasing support, ongoing management, maintenance coordination, and organized communication."
    },
    {
      path: "/tenants",
      title:
        "Tenant Services | Koinonia Properties",
      description:
        "Resident information for rentals, applications, maintenance guidance, property communication, and secure account-access direction."
    },
    {
      path: "/rentals",
      title:
        "Available Rentals | Koinonia Properties",
      description:
        "Public rental availability and tenant next steps from Koinonia Properties."
    },
    {
      path: "/portals",
      title:
        "Account Access | Koinonia Properties",
      description:
        "Guidance for Koinonia Properties owner and resident account access, payment questions, maintenance direction, and secure-property information."
    },
    {
      path: "/rental-analysis",
      title:
        "Rental Analysis | Koinonia Properties",
      description:
        "Start a rental-property conversation with the address, property details, current rental status, owner goals, and target timing."
    },
    {
      path: "/pricing",
      title:
        "Pricing and Service Scope | Koinonia Properties",
      description:
        "Learn what shapes a Koinonia Properties management quote, including property details, service scope, occupancy, timing, and portfolio needs."
    },
    {
      path: "/service-areas",
      title:
        "Service Availability | Koinonia Properties",
      description:
        "Share a property address to confirm current Koinonia Properties service availability and the appropriate next step."
    },
    {
      path: "/contact",
      title:
        "Contact | Koinonia Properties",
      description:
        "Contact Koinonia Properties for owner, rental, resident, maintenance, vendor, and general property management questions."
    },
    {
      path: "/policies",
      title:
        "Property Policies | Koinonia Properties",
      description:
        "General policy guidance for rental applicants, residents, and property owners, with property-specific terms provided at the appropriate step."
    },
    {
      path: "/apply",
      title:
        "Rental Applications | Koinonia Properties",
      description:
        "Application guidance for active Koinonia Properties rental listings."
    },
    {
      path: "/maintenance",
      title:
        "Maintenance Guidance | Koinonia Properties",
      description:
        "Routine maintenance guidance and contact direction for Koinonia Properties residents and managed properties."
    },
    {
      path: "/vendors",
      title:
        "Vendor Information | Koinonia Properties",
      description:
        "Vendor inquiry and coordination information for property maintenance and service providers."
    },
    {
      path: "/standards",
      title:
        "Service Standards | Koinonia Properties",
      description:
        "Koinonia Properties service standards for owner communication, resident support, maintenance coordination, vendor communication, records, and privacy."
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
