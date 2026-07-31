import { FAQ, Footer, Hero, PropertiesInquiry, PropertiesNav, PropertiesSeoContent, UniversalCard } from "../index";

const quickAccess = [
  {
    title: "Owner Inquiry",
    body: "Start with property address, goals, and current rental status.",
    href: "/properties/rental-analysis"
  },
  {
    title: "Available Rentals",
    body: "View current vacancies and upcoming availability.",
    href: "/properties/rentals"
  },
  {
    title: "Tenant Portal",
    body: "Rent payments, maintenance requests, and resident support.",
    href: "/properties/portals"
  },
  {
    title: "Owner Portal",
    body: "Statements, documents, maintenance visibility, and updates.",
    href: "/properties/portals"
  }
];

const audiencePaths = [
  {
    title: "For Property Owners",
    body: "Get a clear path from property review to management plan, leasing, maintenance coordination, reporting, and owner communication.",
    items: ["Rental analysis", "Management plan setup", "Ongoing property oversight"],
    actionLabel: "Owner Services",
    actionHref: "/properties#owner-services"
  },
  {
    title: "For Tenants",
    body: "Find rentals, apply, request maintenance, and connect with management through a clear resident process.",
    items: ["Rental applications", "Maintenance requests", "Resident communication"],
    actionLabel: "Tenant Services",
    actionHref: "/properties#tenant-services"
  },
  {
    title: "For Investors",
    body: "Support your rental strategy with consistent systems for leasing, occupancy, maintenance, reporting, and portfolio care.",
    items: ["Rental readiness", "Portfolio support", "Performance-minded operations"],
    actionLabel: "Investor Support",
    actionHref: "/properties#management-plans"
  }
];

const services = [
  {
    title: "Leasing Support",
    body: "Prepare the property for the rental market and coordinate the steps from listing to signed lease.",
    items: ["Rental marketing", "Listing photos and details", "Showing coordination"]
  },
  {
    title: "Tenant Placement",
    body: "Keep the applicant process organized while supporting consistent screening and documentation standards.",
    items: ["Applicant communication", "Screening coordination", "Lease administration"]
  },
  {
    title: "Management Operations",
    body: "Administer the recurring management work that keeps owners informed and tenants supported.",
    items: ["Rent collection systems", "Owner updates", "Document organization"]
  },
  {
    title: "Maintenance Coordination",
    body: "Route maintenance requests, coordinate vendors, and keep owners and tenants aligned on next steps.",
    items: ["Request intake", "Vendor communication", "Follow-through tracking"]
  }
];

const ownerConfidence = [
  {
    title: "Rental Analysis",
    body: "A focused review of property type, location, rental readiness, and owner goals before recommending a management path."
  },
  {
    title: "Transparent Scope",
    body: "Owners should understand what is included, what requires approval, and how communication, reserves, and maintenance decisions work."
  },
  {
    title: "Local Readiness",
    body: "Service area, licensing, insurance, trust accounting, and fair housing language should be verified before public launch."
  }
];

const process = [
  {
    title: "Review the Property",
    body: "We start with the property, owner goals, current rental status, and management needs."
  },
  {
    title: "Prepare the Plan",
    body: "Koinonia Properties sets the management structure, communication process, and next operating steps."
  },
  {
    title: "Launch Management",
    body: "Leasing, onboarding, rent, maintenance, tenant communication, and reporting move into an organized rhythm."
  }
];

const residentActions = [
  {
    title: "Pay Rent",
    body: "A dedicated portal path will take residents directly to rent payment access once the management platform is selected.",
    items: ["Online payment access", "Autopay readiness", "Account visibility"]
  },
  {
    title: "Request Maintenance",
    body: "Maintenance requests should be easy to submit, easy to categorize, and clear about expected response time.",
    items: ["Routine requests", "Urgent issue routing", "Photo-ready intake"]
  },
  {
    title: "Apply for a Rental",
    body: "Each listing should lead to a short, mobile-friendly application path with clear next steps.",
    items: ["Apply from listing", "Screening criteria", "Lease next steps"]
  }
];

const managementPlans = [
  {
    title: "Leasing-Only",
    body: "For owners who need help preparing, marketing, and leasing a property, then plan to self-manage.",
    items: ["Listing preparation", "Application coordination", "Lease setup support"]
  },
  {
    title: "Full-Service Management",
    body: "For owners who want ongoing support after lease signing, including rent, maintenance, communication, and reporting.",
    items: ["Tenant communication", "Maintenance coordination", "Owner updates"]
  },
  {
    title: "Portfolio Management",
    body: "For investors and owners with multiple rental properties who need repeatable operating systems.",
    items: ["Portfolio organization", "Recurring reporting", "Multi-property workflows"]
  }
];

const listingStandards = [
  "Current availability and pricing",
  "Property photos and key features",
  "Bedrooms, bathrooms, parking, utilities, and pet policy",
  "Apply or schedule-tour path on every listing",
  "Fair housing and application criteria links"
];

const launchChecklist = [
  "Confirm property management licensing and broker supervision.",
  "Select portal/PMS path before accepting online rent or maintenance requests.",
  "Confirm trust accounting, security deposit, and owner distribution rules.",
  "Add local service-area pages once target markets are finalized."
];

const propertyFaqs = [
  {
    q: "Is Koinonia Properties separate from Koinonia Transactions?",
    a: "Yes. Koinonia Properties is the property management service line under Koinonia Admin. Koinonia Transactions remains focused on transaction coordination."
  },
  {
    q: "Will pricing be posted publicly?",
    a: "The first version can use custom pricing based on property type, service level, and portfolio size while the fee schedule is finalized."
  },
  {
    q: "Can tenants use the site too?",
    a: "Yes. The site should give tenants a direct path to rentals, applications, maintenance requests, rent payment access, and management contact."
  },
  {
    q: "What needs to be verified before launch?",
    a: "Licensing, broker supervision, trust accounting, security deposit handling, fair housing language, disclosures, and insurance coverage should be confirmed before public launch."
  }
];

const propertiesServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Koinonia Properties",
  url: "https://koinoniaadmin.com/properties",
  description:
    "Property management services for rental property owners, tenants, and real estate investors, including rental analysis, leasing support, maintenance coordination, and owner communication.",
  serviceType: "Property management and rental property management",
  provider: {
    "@type": "Organization",
    name: "Koinonia Admin",
    url: "https://koinoniaadmin.com"
  },
  areaServed: {
    "@type": "State",
    name: "Colorado"
  },
  audience: [
    {
      "@type": "Audience",
      audienceType: "Rental property owners"
    },
    {
      "@type": "Audience",
      audienceType: "Tenants and rental applicants"
    },
    {
      "@type": "Audience",
      audienceType: "Real estate investors"
    }
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Koinonia Properties service paths",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Rental analysis"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Leasing support"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Full-service property management"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Maintenance coordination"
        }
      }
    ]
  }
};

export function KoinoniaProperties() {
  return (
    <main className="koinonia-site">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertiesServiceJsonLd) }}
      />
      <PropertiesNav />

      <Hero
        visualVariant="properties"
        eyebrow="Koinonia Admin Service Line"
        title="Koinonia Properties"
        lead="Property management built on clear communication, steady systems, and responsible care for owners, tenants, and investors."
        primaryLabel="Request Rental Analysis"
        primaryHref="/properties/rental-analysis"
        secondaryLabel="View Rentals"
        secondaryHref="/properties/rentals"
      />

      <section className="koinonia-section koinonia-access-section" aria-label="Quick access">
        <div className="koinonia-container">
          <div className="koinonia-access-grid">
            {quickAccess.map((item) => (
              <a className="koinonia-access-link" href={item.href} key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <PropertiesSeoContent variant="home" />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Choose Your Path</div>
            <h2 className="koinonia-heading">Clear paths for owners, tenants, and investors.</h2>
            <p className="koinonia-copy">
              Owners need confidence. Tenants need clarity. Investors need consistency. Koinonia Properties is structured to route each person toward the answer or action they came for.
            </p>
          </div>
          <div className="koinonia-grid three">
            {audiencePaths.map((path) => (
              <UniversalCard
                key={path.title}
                title={path.title}
                body={path.body}
                items={path.items}
                actionLabel={path.actionLabel}
                actionHref={path.actionHref}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section" id="rental-analysis">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Owner Lead Path</div>
            <h2 className="koinonia-heading">Start with a rental analysis before asking an owner to commit.</h2>
            <p className="koinonia-copy">
              The owner path should exchange real value for the first conversation: property review, rental readiness, and a management recommendation.
            </p>
          </div>
          <div className="koinonia-grid three">
            {ownerConfidence.map((item, index) => (
              <UniversalCard key={item.title} eyebrow={`0${index + 1}`} title={item.title} body={item.body} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band" id="owner-services">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Owner Services</div>
            <h2 className="koinonia-heading">Property management that keeps the operation visible.</h2>
            <p className="koinonia-copy">
              Koinonia Properties helps owners move from scattered rental tasks to a documented management process with clear responsibilities and communication.
            </p>
          </div>
          <div className="koinonia-grid four">
            {services.map((service, index) => (
              <UniversalCard
                key={service.title}
                eyebrow={`0${index + 1}`}
                title={service.title}
                body={service.body}
                items={service.items}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section" id="tenant-services">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Tenant Services</div>
            <h2 className="koinonia-heading">Resident paths should be obvious without a phone call.</h2>
            <p className="koinonia-copy">
              The tenant side of the site reduces confusion with direct paths for available rentals, applications, maintenance requests, rent payments, and support.
            </p>
          </div>
          <div className="koinonia-grid three">
            {residentActions.map((action) => (
              <UniversalCard key={action.title} title={action.title} body={action.body} items={action.items} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">How Management Works</div>
            <h2 className="koinonia-heading">A steady process from onboarding to ongoing care.</h2>
          </div>
          <div className="koinonia-grid three">
            {process.map((step, index) => (
              <UniversalCard key={step.title} eyebrow={`0${index + 1}`} title={step.title} body={step.body} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section" id="management-plans">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Management Plans</div>
            <h2 className="koinonia-heading">Start with the service level that matches the property.</h2>
            <p className="koinonia-copy">
              Pricing can remain consultation-based while the final management fee schedule, reserve requirements, and agreement terms are verified.
            </p>
          </div>
          <div className="koinonia-grid three">
            {managementPlans.map((plan) => (
              <UniversalCard key={plan.title} title={plan.title} body={plan.body} items={plan.items} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band" id="rentals">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Available Rentals</div>
            <h2 className="koinonia-heading">Rental listings will appear here when available.</h2>
            <p className="koinonia-copy">
              No current vacancies. Check back soon or contact Koinonia Properties about upcoming availability.
            </p>
          </div>
          <div className="koinonia-split">
            <div>
              <h3>Listing standards</h3>
              <p>Every active listing should work as a complete tenant entry point, not only a placeholder card.</p>
            </div>
            <ul>
              {listingStandards.map((standard) => (
                <li key={standard}>{standard}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="koinonia-section" id="owner-portal">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Owner Portal</div>
            <h2 className="koinonia-heading">Owners should be able to see what is happening without chasing updates.</h2>
            <p className="koinonia-copy">
              Once the portal system is selected, this path should point owners toward statements, documents, maintenance visibility, and property performance.
            </p>
          </div>
          <div className="koinonia-grid three">
            <UniversalCard title="Statements" body="Monthly and year-end owner statements should be easy to access and download." />
            <UniversalCard title="Maintenance Visibility" body="Owners should know which maintenance items are open, approved, completed, or awaiting a decision." />
            <UniversalCard title="Documents" body="Leases, inspection notes, notices, and owner documents should live in one predictable place." />
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Launch Readiness</div>
            <h2 className="koinonia-heading">The public promise must match the operating structure.</h2>
            <p className="koinonia-copy">
              Koinonia Properties should not promise payments, maintenance workflows, applications, or owner reporting until the supporting platform, rules, and compliance path are confirmed.
            </p>
          </div>
          <div className="koinonia-split">
            <div>
              <h3>Before public launch</h3>
              <p>These items stay visible in the build plan so the site grows with the business instead of outrunning it.</p>
            </div>
            <ul>
              {launchChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <FAQ items={propertyFaqs} eyebrow="Property Management Questions" title="Clear answers before launch." />

      <PropertiesInquiry kind="rental" />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-cta">
            <div className="koinonia-eyebrow">Start Koinonia Properties</div>
            <h2 className="koinonia-heading">Ready to build a steadier rental operation?</h2>
            <p className="koinonia-copy">
              Start with a property management consultation, then Koinonia Properties can shape the right owner, tenant, and operating process around the property.
            </p>
            <div className="koinonia-actions" style={{ justifyContent: "center" }}>
              <a className="koinonia-button primary" href="/koinonia/contact">Request Rental Analysis</a>
              <a className="koinonia-button secondary" href="/koinonia">Back to Koinonia Admin</a>
            </div>
          </div>
        </div>
      </section>

      <Footer serviceLine="Koinonia Properties" supportLine="Property management support" />
    </main>
  );
}
