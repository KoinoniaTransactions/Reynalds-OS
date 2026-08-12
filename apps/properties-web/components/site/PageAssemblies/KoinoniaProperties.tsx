import { FAQ, Footer, Hero, PropertiesInquiry, PropertiesNav, PropertiesSeoContent, UniversalCard } from "../index";
import { absoluteUrl } from "../../../config/seo.config";

const quickAccess = [
  {
    title: "Owner Inquiry",
    body: "Start with property address, goals, and current rental status.",
    href: "/rental-analysis"
  },
  {
    title: "Available Rentals",
    body: "View current vacancies and upcoming availability.",
    href: "/rentals"
  },
  {
    title: "Tenant Portal",
    body: "Rent payments, maintenance requests, and resident support.",
    href: "/portals"
  },
  {
    title: "Owner Portal",
    body: "Statements, documents, maintenance visibility, and updates.",
    href: "/portals"
  }
];

const audiencePaths = [
  {
    title: "For Property Owners",
    body: "Get a clear path from property review to management plan, leasing, maintenance coordination, reporting, and owner communication.",
    items: ["Rental analysis", "Management plan setup", "Ongoing property oversight"],
    actionLabel: "Owner Services",
    actionHref: "/#owner-services"
  },
  {
    title: "For Tenants",
    body: "Find rentals, apply, request maintenance, and connect with management through a clear resident process.",
    items: ["Rental applications", "Maintenance requests", "Resident communication"],
    actionLabel: "Tenant Services",
    actionHref: "/#tenant-services"
  },
  {
    title: "For Investors",
    body: "Support your rental strategy with consistent systems for leasing, occupancy, maintenance, reporting, and portfolio care.",
    items: ["Rental readiness", "Portfolio support", "Performance-minded operations"],
    actionLabel: "Investor Support",
    actionHref: "/#management-plans"
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
    title: "Clear Service Scope",
    body: "Owners receive clear information about communication, maintenance coordination, leasing support, and the next step for the property."
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
    title: "Begin Management",
    body: "Leasing, onboarding, rent, maintenance, tenant communication, and reporting move into an organized rhythm."
  }
];

const residentActions = [
  {
    title: "Pay Rent",
    body: "Residents receive payment and account-access instructions directly for the property they occupy.",
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

const serviceCommitments = [
  "Clear owner communication and documented next steps.",
  "Resident support routed through the appropriate property process.",
  "Maintenance coordination with documented follow-through.",
  "Property-specific terms and instructions provided before service begins."
];

const propertyFaqs = [
  {
    q: "What services does Koinonia Properties provide?",
    a: "Services can include rental analysis, leasing support, ongoing property management, maintenance coordination, owner communication, and resident support."
  },
  {
    q: "How does pricing work?",
    a: "Pricing is based on the property and the services requested. Start with a rental analysis so the scope and next steps can be discussed clearly."
  },
  {
    q: "How do tenants get help?",
    a: "Tenants can use the Rentals, Apply, Maintenance, Policies, and Portals pages for direction, or contact Koinonia Properties with a question."
  },
  {
    q: "Where should a property owner start?",
    a: "Start with a rental analysis and share the property address, current rental status, goals, and timing."
  }
];

const propertiesServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Koinonia Properties",
  url: absoluteUrl("/") ?? undefined,
  description:
    "Property management services for rental property owners, tenants, and real estate investors, including rental analysis, leasing support, maintenance coordination, and owner communication.",
  serviceType: "Property management and rental property management",
  provider: {
    "@type": "Organization",
    name: "Koinonia Properties",
    url: absoluteUrl("/") ?? undefined
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
        eyebrow="Colorado Property Management"
        title="Koinonia Properties"
        lead="Property management built on clear communication, steady systems, and responsible care for owners, tenants, and investors."
        primaryLabel="Request Rental Analysis"
        primaryHref="/rental-analysis"
        secondaryLabel="View Rentals"
        secondaryHref="/rentals"
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
              Pricing is tailored to the property and service scope, with clear expectations discussed before management begins.
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
              Owners receive account-access instructions directly when secure online access is available for their managed property.
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
            <div className="koinonia-eyebrow">Service Commitments</div>
            <h2 className="koinonia-heading">The public promise must match the operating structure.</h2>
            <p className="koinonia-copy">
              Koinonia Properties keeps public information focused on clear service expectations, communication, and the next appropriate step for each property.
            </p>
          </div>
          <div className="koinonia-split">
            <div>
              <h3>What you can expect</h3>
              <p>These items stay visible in the build plan so the site grows with the business instead of outrunning it.</p>
            </div>
            <ul>
              {serviceCommitments.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <FAQ items={propertyFaqs} eyebrow="Property Management Questions" title="Helpful property management answers." />

      <PropertiesInquiry kind="rental" />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-cta">
            <div className="koinonia-eyebrow">Start Here</div>
            <h2 className="koinonia-heading">Ready to build a steadier rental operation?</h2>
            <p className="koinonia-copy">
              Start with a rental analysis so Koinonia Properties can understand the property, your goals, and the right next step.
            </p>
            <div className="koinonia-actions" style={{ justifyContent: "center" }}>
              <a className="koinonia-button primary" href="/rental-analysis">Request Rental Analysis</a>
              <a className="koinonia-button secondary" href="/">Back to Koinonia Properties</a>
            </div>
          </div>
        </div>
      </section>

      <Footer serviceLine="Koinonia Properties" supportLine="Property management support" />
    </main>
  );
}
