import type { Metadata } from "next";

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
    },
    {
      path: "/properties",
      title: "Koinonia Properties | Property Management",
      description:
        "Koinonia Properties provides property management paths for owners, tenants, rentals, maintenance, portals, pricing, and operating standards."
    },
    {
      path: "/properties/owners",
      title: "Owner Services | Koinonia Properties",
      description:
        "Property management owner services for rental analysis, leasing support, maintenance coordination, owner reporting, and management planning."
    },
    {
      path: "/properties/tenants",
      title: "Tenant Services | Koinonia Properties",
      description:
        "Tenant services for available rentals, applications, maintenance requests, portal access, rent payment direction, and resident support."
    },
    {
      path: "/properties/rentals",
      title: "Available Rentals | Koinonia Properties",
      description:
        "Available rentals and upcoming rental inventory for Koinonia Properties, with listing readiness, application direction, and tenant next steps."
    },
    {
      path: "/properties/portals",
      title: "Owner and Tenant Portals | Koinonia Properties",
      description:
        "Portal access direction for Koinonia Properties owners, tenants, vendors, and applicants using the approved property management platform."
    },
    {
      path: "/properties/rental-analysis",
      title: "Rental Analysis | Koinonia Properties",
      description:
        "Request a rental analysis for property management fit, rental readiness, target rent, owner goals, and service-level planning."
    },
    {
      path: "/properties/pricing",
      title: "Pricing and Scope | Koinonia Properties",
      description:
        "Property management pricing and scope guidance for leasing-only support, full-service management, portfolio support, and owner expectations."
    },
    {
      path: "/properties/service-areas",
      title: "Service Areas | Koinonia Properties",
      description:
        "Property management service area guidance for markets where Koinonia Properties can support owners, tenants, vendors, and rental operations."
    },
    {
      path: "/properties/policies",
      title: "Policies | Koinonia Properties",
      description:
        "Property management policy readiness for applications, tenants, maintenance, vendors, owner agreements, privacy, and compliance."
    },
    {
      path: "/properties/apply",
      title: "Apply for a Rental | Koinonia Properties",
      description:
        "Rental application guidance for applicants before personal information is collected, including criteria, availability, and next steps."
    },
    {
      path: "/properties/maintenance",
      title: "Maintenance Requests | Koinonia Properties",
      description:
        "Maintenance request guidance for routine issues, urgent concerns, vendor coordination, owner approvals, and repair tracking."
    },
    {
      path: "/properties/vendors",
      title: "Vendor Coordination | Koinonia Properties",
      description:
        "Vendor coordination standards for property management work orders, insurance, service areas, invoices, and emergency routing."
    },
    {
      path: "/properties/standards",
      title: "Operating Standards | Koinonia Properties",
      description:
        "Operating standards for property management owner services, tenant services, maintenance, vendors, accounting, compliance, and launch readiness."
    }
  ]
} as const;

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

export function getPublicRouteSeo(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const route = seoConfig.publicRoutes.find((candidate) => candidate.path === normalizedPath);

  if (!route) {
    throw new Error(`Missing public SEO route for ${normalizedPath}`);
  }

  return route;
}

export function buildPublicRouteMetadata(path: string, keywords?: string[]): Metadata {
  const route = getPublicRouteSeo(path);
  const metadata: Metadata = {
    title: route.title,
    description: route.description,
    alternates: {
      canonical: absoluteUrl(route.path)
    },
    openGraph: {
      title: route.title,
      description: route.description,
      url: absoluteUrl(route.path),
      siteName: seoConfig.siteName,
      images: [
        {
          url: absoluteUrl(seoConfig.socialPreviewPath),
          width: seoConfig.socialPreviewWidth,
          height: seoConfig.socialPreviewHeight,
          alt: route.title
        }
      ],
      locale: seoConfig.locale,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: route.title,
      description: route.description,
      images: [absoluteUrl(seoConfig.socialPreviewPath)]
    }
  };

  if (keywords?.length) {
    metadata.keywords = keywords;
  }

  return metadata;
}
