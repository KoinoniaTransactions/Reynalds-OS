import { FAQ, Footer, PropertiesNav, UniversalCard } from "../index";
import { absoluteUrl } from "../../../config/seo.config";

const quickAccess = [
  {
    title: "Owner Inquiry",
    body: "Start with the property, your goals, and the current rental status.",
    href: "/rental-analysis"
  },
  {
    title: "Available Rentals",
    body: "See current rental availability and listing details when properties are active.",
    href: "/rentals"
  },
  {
    title: "Resident Help",
    body: "Find application, maintenance, policy, and contact guidance in one place.",
    href: "/tenants"
  },
  {
    title: "Secure Access",
    body: "Find account-access instructions when secure online access is available for your property.",
    href: "/portals"
  }
];

const audiencePaths = [
  {
    title: "For Property Owners",
    body: "Understand the management approach, explore owner services, and start with a rental analysis tailored to the property.",
    items: ["Rental analysis", "Leasing support", "Maintenance coordination"],
    actionLabel: "Explore Owner Services",
    actionHref: "/owners"
  },
  {
    title: "For Residents & Applicants",
    body: "Find rentals, application guidance, maintenance direction, policies, and the right contact path for your question.",
    items: ["Available rentals", "Application guidance", "Resident support"],
    actionLabel: "Resident Information",
    actionHref: "/tenants"
  },
  {
    title: "For Real Estate Investors",
    body: "Discuss repeatable property-management support for leasing, maintenance, owner communication, and multi-property needs.",
    items: ["Rental readiness", "Ongoing management", "Portfolio-aware support"],
    actionLabel: "Explore Management",
    actionHref: "/owners"
  }
];

const services = [
  {
    title: "Rental Readiness & Leasing",
    body: "Prepare the property for the rental market and coordinate the approved steps from marketing through lease execution.",
    items: ["Rental analysis", "Marketing support", "Leasing coordination"]
  },
  {
    title: "Application & Lease Coordination",
    body: "Keep applicant communication, screening coordination, and lease administration organized through the approved process.",
    items: ["Applicant communication", "Screening coordination", "Lease administration"]
  },
  {
    title: "Ongoing Property Management",
    body: "Coordinate the recurring management work that keeps responsibilities clear and owners informed.",
    items: ["Owner communication", "Property oversight", "Move-in and move-out coordination"]
  },
  {
    title: "Maintenance & Vendor Coordination",
    body: "Coordinate maintenance needs, vendor communication, and documented next steps around the property.",
    items: ["Maintenance coordination", "Vendor communication", "Follow-through"]
  }
];

const process = [
  {
    title: "Review the Property",
    body: "Begin with the property, current rental status, condition, timing, and owner goals."
  },
  {
    title: "Confirm the Scope",
    body: "Clarify management responsibilities, communication, and property-specific next steps."
  },
  {
    title: "Coordinate Onboarding",
    body: "Organize leasing or management onboarding around the approved service scope."
  },
  {
    title: "Manage the Ongoing Work",
    body: "Keep approved leasing, maintenance, communication, and reporting workflows organized."
  }
];

const propertyFaqs = [
  {
    q: "What does Koinonia Properties help with?",
    a: "Property management services may include rental analysis, leasing support, applicant and lease coordination, ongoing property oversight, maintenance coordination, owner communication, and resident support. The exact scope is confirmed for each property."
  },
  {
    q: "Where should a property owner start?",
    a: "Start with a rental analysis and share the property address, current rental status, condition, goals, and timing."
  },
  {
    q: "How does pricing work?",
    a: "Pricing depends on the property and requested service scope. Property type, occupancy or leasing status, timing, condition, and portfolio complexity may all shape the final quote."
  },
  {
    q: "How do residents and applicants get help?",
    a: "Use the Rentals and Tenants pages for availability and resident guidance, the Maintenance page for maintenance direction, and the Portals page for secure-access instructions when online access is available for the property."
  }
];

const propertiesServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Koinonia Properties",
  url: absoluteUrl("/") ?? undefined,
  description:
    "Property management for rental property owners, residents, and real estate investors, including rental analysis, leasing support, maintenance coordination, and owner communication.",
  serviceType: "Property management",
  provider: {
    "@type": "Organization",
    name: "Koinonia Properties",
    url: absoluteUrl("/") ?? undefined
  },
  audience: [
    {
      "@type": "Audience",
      audienceType: "Rental property owners"
    },
    {
      "@type": "Audience",
      audienceType: "Residents and rental applicants"
    },
    {
      "@type": "Audience",
      audienceType: "Real estate investors"
    }
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Koinonia Properties service areas",
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
          name: "Maintenance coordination"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Owner communication and reporting"
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

      <section className="koinonia-section koinonia-hero properties">
        <div className="koinonia-container koinonia-hero-grid">
          <div className="koinonia-hero-copy">
            <div className="koinonia-eyebrow">Property Management</div>
            <h1 className="koinonia-title">Koinonia Properties</h1>
            <p className="koinonia-lead">
              Property management built on clear communication, steady systems, and responsible care for the property and the people connected to it.
            </p>
            <div className="koinonia-actions">
              <a className="koinonia-button primary" href="/rental-analysis">
                Request Rental Analysis
              </a>
              <a className="koinonia-button secondary" href="/rentals">
                View Rentals
              </a>
            </div>
          </div>

          <div
            className="koinonia-visual"
            aria-label="Koinonia Properties property management services"
          >
            <div className="koinonia-visual-panel" aria-hidden="true">
              <span>Property Management</span>
              <strong>Owners · Residents · Properties</strong>
              <ul>
                <li>
                  <b>Leasing</b>
                  <em>Support</em>
                </li>
                <li>
                  <b>Maintenance</b>
                  <em>Coordination</em>
                </li>
                <li>
                  <b>Owner Communication</b>
                  <em>Organized</em>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

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

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Start With What You Need</div>
            <h2 className="koinonia-heading">A clear next step for owners, residents, and investors.</h2>
            <p className="koinonia-copy">
              Understand the service, find the right path, and move to the next conversation without sorting through unrelated systems.
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

      <section className="koinonia-section koinonia-band" id="owner-services">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Property Management Services</div>
            <h2 className="koinonia-heading">Support around the work that keeps a rental property moving.</h2>
            <p className="koinonia-copy">
              Service scope is confirmed property by property, with responsibilities and next steps made clear before management begins.
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
          <div className="koinonia-actions" style={{ justifyContent: "center" }}>
            <a className="koinonia-button secondary" href="/owners">
              Explore Owner Services
            </a>
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">How Management Begins</div>
            <h2 className="koinonia-heading">Start with the property. Build the process around what it needs.</h2>
          </div>
          <div className="koinonia-grid four">
            {process.map((step, index) => (
              <UniversalCard
                key={step.title}
                eyebrow={`0${index + 1}`}
                title={step.title}
                body={step.body}
              />
            ))}
          </div>
        </div>
      </section>

      <FAQ
        items={propertyFaqs}
        eyebrow="Property Management Questions"
        title="Start with the information you need most."
      />

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-cta">
            <div className="koinonia-eyebrow">Koinonia Properties</div>
            <h2 className="koinonia-heading">Ready for the next step?</h2>
            <p className="koinonia-copy">
              Owners can start with a rental analysis. Residents and applicants can view rentals or use the resident information paths for guidance.
            </p>
            <div className="koinonia-actions" style={{ justifyContent: "center" }}>
              <a className="koinonia-button primary" href="/rental-analysis">
                Request Rental Analysis
              </a>
              <a className="koinonia-button secondary" href="/rentals">
                View Rentals
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer serviceLine="Koinonia Properties" supportLine="Property management support" />
    </main>
  );
}
