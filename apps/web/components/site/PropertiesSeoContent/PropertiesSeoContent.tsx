type SeoVariant =
  | "home"
  | "owners"
  | "tenants"
  | "rentals"
  | "rental-analysis"
  | "pricing"
  | "portals"
  | "maintenance"
  | "service-areas"
  | "apply";

type SeoContent = {
  eyebrow: string;
  title: string;
  body: string;
  cards: readonly {
    title: string;
    body: string;
  }[];
};

const content: Record<SeoVariant, SeoContent> = {
  home: {
    eyebrow: "Rental Property Management",
    title: "Colorado property management built around owner clarity and tenant support.",
    body: "Koinonia Properties is being built as the property management service line under Koinonia Admin for rental property owners, tenants, and investors who need organized leasing support, maintenance coordination, owner reporting, and clear resident communication.",
    cards: [
      {
        title: "For rental property owners",
        body: "Owner services focus on rental analysis, management planning, tenant placement, rent collection systems, maintenance coordination, owner statements, and a clear communication rhythm."
      },
      {
        title: "For tenants and applicants",
        body: "Tenant services focus on available rentals, rental applications, maintenance requests, portal access, rent payment direction, and practical resident support."
      }
    ]
  },
  owners: {
    eyebrow: "Owner Services",
    title: "Property management for owners who want a steadier rental operation.",
    body: "The owner path is written for landlords, investors, and rental property owners comparing property management companies, leasing support, rental analysis, maintenance coordination, owner portals, and monthly reporting.",
    cards: [
      {
        title: "Management clarity",
        body: "Koinonia Properties explains service scope before fees, including leasing-only support, full-service property management, portfolio management, approval thresholds, reserves, and owner communication standards."
      },
      {
        title: "Rental performance support",
        body: "Owner content connects rental readiness, tenant placement, maintenance tracking, property documentation, and reporting so owners can evaluate the management fit before committing."
      }
    ]
  },
  tenants: {
    eyebrow: "Tenant Services",
    title: "Tenant services for rentals, applications, maintenance, and portal access.",
    body: "The tenant path helps renters and residents find the right next step for available rentals, rental applications, rent payment access, maintenance requests, move-in expectations, policies, and property management support.",
    cards: [
      {
        title: "Before applying",
        body: "Applicants should be able to review active rental listings, application criteria, pet policy, availability, deposits, and next steps before submitting private information."
      },
      {
        title: "After move-in",
        body: "Residents should have a clear route for rent payment direction, maintenance requests, lease documents, support questions, and portal access once the management platform is live."
      }
    ]
  },
  rentals: {
    eyebrow: "Available Rentals",
    title: "A rental listing page built for current vacancies and upcoming availability.",
    body: "This page is the future inventory hub for Koinonia Properties rentals, including available homes, application criteria, rental details, showing paths, and tenant next steps.",
    cards: [
      {
        title: "Listing information",
        body: "Each rental listing should include rent, deposit, available date, bedrooms, bathrooms, parking, utilities, pet policy, lease terms, photos, and application direction."
      },
      {
        title: "Applicant confidence",
        body: "The rental page should help prospective tenants understand whether a property fits before they apply, schedule a showing, or contact Koinonia Properties."
      }
    ]
  },
  "rental-analysis": {
    eyebrow: "Rental Analysis",
    title: "Rental analysis for owners considering professional property management.",
    body: "The rental analysis path gives owners a practical starting point for understanding property condition, target rent, rental readiness, service level, maintenance concerns, and the right management plan.",
    cards: [
      {
        title: "Owner intake",
        body: "A strong rental analysis starts with property address, occupancy, current rent or target rent, known maintenance issues, owner goals, and timeline."
      },
      {
        title: "Management recommendation",
        body: "The analysis should help owners compare leasing-only support, full-service management, and portfolio management based on the property and owner goals."
      }
    ]
  },
  pricing: {
    eyebrow: "Property Management Pricing",
    title: "Property management pricing should be clear about scope before exact fees.",
    body: "Owners searching for property management pricing need to understand management fee structure, leasing fees, maintenance reserves, renewal terms, pass-through costs, owner statements, and approval thresholds.",
    cards: [
      {
        title: "Service levels",
        body: "Pricing content separates leasing-only, full-service management, and portfolio management so owners can understand which structure fits the property."
      },
      {
        title: "Fee boundaries",
        body: "Koinonia Properties will keep exact pricing consultation-based until broker review, accounting rules, management agreement language, and reserve policies are approved."
      }
    ]
  },
  portals: {
    eyebrow: "Owner and Tenant Portals",
    title: "Portal access should route owners, tenants, vendors, and applicants to the right system.",
    body: "Property management portals should support rent payments, maintenance requests, owner statements, documents, account status, work orders, invoices, and private communication through the approved platform.",
    cards: [
      {
        title: "Owner portal",
        body: "Owners should be able to access statements, documents, maintenance visibility, property notes, disbursement records, and management updates."
      },
      {
        title: "Tenant portal",
        body: "Tenants should be routed to rent payment access, maintenance request intake, lease documents, resident messages, and account visibility."
      }
    ]
  },
  maintenance: {
    eyebrow: "Maintenance Coordination",
    title: "Maintenance requests should be easy to submit and easy to track.",
    body: "A property management maintenance process should define routine requests, urgent issues, emergency routing, vendor dispatch, owner approvals, tenant updates, closeout records, and invoice documentation.",
    cards: [
      {
        title: "Resident clarity",
        body: "Residents need a simple path to describe the issue, property location, access notes, photos, urgency, and preferred follow-up."
      },
      {
        title: "Owner visibility",
        body: "Owners need to understand approval thresholds, emergency authority, vendor estimates, repair status, closeout notes, and maintenance costs."
      }
    ]
  },
  "service-areas": {
    eyebrow: "Property Management Service Areas",
    title: "Local property management pages should follow real coverage and local knowledge.",
    body: "Service-area content should be built around actual market coverage, vendor reach, leasing logistics, inspection capacity, local rental questions, and owner needs in each Colorado market Koinonia Properties can serve well.",
    cards: [
      {
        title: "Local owner questions",
        body: "Future city pages should answer rental property owner questions about leasing, rent readiness, maintenance support, tenant placement, and local management expectations."
      },
      {
        title: "Coverage before claims",
        body: "Koinonia Properties should publish a market only when licensing, vendor coverage, showing capacity, tenant support, and operating standards are ready."
      }
    ]
  },
  apply: {
    eyebrow: "Rental Application Process",
    title: "Rental application guidance for applicants before personal information is collected.",
    body: "The Koinonia Properties application path is being prepared for renters who need clear rental application criteria, available rental next steps, tenant screening expectations, showing direction, and communication before submitting sensitive information.",
    cards: [
      {
        title: "Application readiness",
        body: "Applicants should be able to confirm the property, availability, application requirements, screening disclosures, pet expectations, move-in timing, and fee guidance before they apply."
      },
      {
        title: "Listing-based applications",
        body: "Each future rental application should begin from an active listing so the applicant understands the home, rent, deposit, lease terms, and property-specific requirements."
      }
    ]
  }
};

export function PropertiesSeoContent({ variant }: { variant: SeoVariant }) {
  const page = content[variant];

  return (
    <section className="koinonia-section">
      <div className="koinonia-container">
        <div className="koinonia-section-header">
          <div className="koinonia-eyebrow">{page.eyebrow}</div>
          <h2 className="koinonia-heading">{page.title}</h2>
          <p className="koinonia-copy">{page.body}</p>
        </div>
        <div className="koinonia-grid two">
          {page.cards.map((card) => (
            <article className="koinonia-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
