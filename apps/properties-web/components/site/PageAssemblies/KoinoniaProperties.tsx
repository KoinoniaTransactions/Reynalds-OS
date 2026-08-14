import { FAQ, Footer, Hero, PropertiesNav, UniversalCard } from "../index";
import { contactConfig } from "../../../config/contact.config";
import { absoluteUrl } from "../../../config/seo.config";

const audiencePaths = [
  {
    title: "Own a Rental Property",
    body:
      "Whether you own one rental property or are building an investment portfolio, start with the property itself. Explore management services, understand how Koinonia approaches the work, and request a rental analysis when you are ready to talk through the next step.",
    actionLabel: "Explore Owner Services",
    actionHref: "/owners"
  },
  {
    title: "Looking for a Home",
    body:
      "See available rental homes, understand the application process, and find the information you need before applying.",
    actionLabel: "View Available Homes",
    actionHref: "/rentals"
  },
  {
    title: "Already a Resident",
    body:
      "Find maintenance guidance, resident policies, account-access direction, and the right contact path when you need help with your home.",
    actionLabel: "Resident Services",
    actionHref: "/tenants"
  }
];

const approach = [
  {
    title: "Clear Communication",
    body:
      "Owners should understand what is happening with their property, what needs attention, and what comes next. Koinonia is built around communication that keeps important information visible instead of scattered or unclear."
  },
  {
    title: "Steady Systems",
    body:
      "Leasing, maintenance, resident communication, owner updates, and recurring property-management responsibilities work better when there is an organized process behind them. Koinonia brings structure and follow-through to the moving parts so the work does not depend on memory alone."
  },
  {
    title: "Responsible Care",
    body:
      "A rental property is both an investment and someone's home. Good management requires thoughtful decisions, clear responsibilities, professional communication, and care for the property and the people connected to it."
  }
];

const services = [
  {
    title: "Rental Analysis & Leasing",
    body:
      "Start with the property, its current rental status, condition, timing, and owner goals. When leasing support is part of the management scope, Koinonia can coordinate the approved work around rental preparation, marketing, applicant communication, and the path toward an executed lease.",
    items: ["Rental analysis", "Rental marketing", "Leasing coordination"]
  },
  {
    title: "Tenant Screening & Lease Administration",
    body:
      "Keep the applicant-to-resident process organized through clear communication, screening coordination, lease administration, and appropriate move-in preparation.",
    items: ["Applicant communication", "Screening coordination", "Lease administration"]
  },
  {
    title: "Rent Collection & Owner Communication",
    body:
      "Coordinate approved rent and payment processes while keeping owners informed through organized communication, updates, and reporting.",
    items: ["Rent collection workflows", "Owner updates", "Reporting"]
  },
  {
    title: "Maintenance & Property Care",
    body:
      "Coordinate maintenance needs, resident communication, vendor activity, and documented next steps around the property.",
    items: ["Maintenance coordination", "Vendor communication", "Move-in and move-out support"]
  }
];

const process = [
  {
    title: "Understand the Property",
    body:
      "Review the property, current rental status, occupancy, condition, known concerns, timing, and the owner's goals."
  },
  {
    title: "Clarify the Management Plan",
    body:
      "Define the approved management scope, responsibilities, communication expectations, and property-specific next steps."
  },
  {
    title: "Coordinate Leasing or Onboarding",
    body:
      "When applicable, organize the approved leasing, resident, property, and management-onboarding work needed to move forward."
  },
  {
    title: "Manage the Ongoing Work",
    body:
      "Coordinate the approved rent, maintenance, resident communication, vendor, and property-management workflows."
  },
  {
    title: "Keep the Owner Informed",
    body:
      "Provide organized communication, updates, reporting, and continued support as the management relationship moves forward."
  }
];

const propertyFaqs = [
  {
    q: "What does a property management company handle for a rental property owner?",
    a: "Property management can involve leasing, applicant and resident coordination, lease administration, rent and payment processes, maintenance, vendor communication, move-in and move-out coordination, owner updates, and other recurring responsibilities around the property. The exact scope depends on the property and management agreement."
  },
  {
    q: "What property management services does Koinonia Properties provide?",
    a: "Koinonia Properties may provide rental analysis, rental marketing and leasing support, tenant screening coordination, lease administration, rent collection and payment-process coordination, maintenance coordination, owner communication and reporting, move-in and move-out coordination, vendor coordination, and ongoing property-management support. The exact service scope is confirmed for each property."
  },
  {
    q: "Where should a rental property owner start?",
    a: "Start with a rental analysis. Share the property address, current rental status, occupancy and condition, known concerns, owner goals, and timing so Koinonia can understand the property and determine the appropriate next conversation."
  },
  {
    q: "How does Koinonia handle maintenance coordination?",
    a: "Maintenance coordination may include resident communication, documenting the issue, coordinating with appropriate vendors, communicating next steps, and keeping the owner informed according to the approved management process and property-specific responsibilities."
  },
  {
    q: "How does Koinonia keep rental property owners informed?",
    a: "Owner communication is part of the management approach. Koinonia emphasizes organized updates, clear next steps, and reporting through the approved management process so owners have better visibility into the work around their property."
  },
  {
    q: "Does Koinonia Properties work with real estate investors?",
    a: "Real estate investors are part of the owner journey. Koinonia can discuss property-management needs for individual rental properties as well as multi-property or portfolio considerations, with the actual management scope confirmed based on the properties and the owner's goals."
  }
];

const organizationUrl = absoluteUrl("/");
const organizationId = organizationUrl ? `${organizationUrl}#organization` : undefined;

const propertiesOrganizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": organizationId,
  name: contactConfig.businessName,
  url: organizationUrl ?? undefined,
  logo: absoluteUrl("/icon.svg") ?? undefined,
  email: contactConfig.email,
  telephone: contactConfig.phone.href.replace("tel:", "")
};

const propertiesServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Rental Property Management",
  url: organizationUrl ?? undefined,
  description:
    "Organized rental property management with rental analysis, leasing support, tenant screening coordination, lease administration, rent and payment-process coordination, maintenance coordination, owner communication, and responsible property care.",
  serviceType: "Rental property management",
  provider: organizationId
    ? {
        "@type": "Organization",
        "@id": organizationId,
        name: contactConfig.businessName
      }
    : {
        "@type": "Organization",
        name: contactConfig.businessName
      },
  audience: [
    {
      "@type": "Audience",
      audienceType: "Rental property owners and real estate investors"
    },
    {
      "@type": "Audience",
      audienceType: "Residents and rental applicants"
    }
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Koinonia Properties property management services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Rental analysis and leasing support"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Tenant screening coordination and lease administration"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Rent collection coordination and owner communication"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Maintenance and vendor coordination"
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertiesOrganizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertiesServiceJsonLd) }}
      />

      <PropertiesNav />

      <Hero
        visualVariant="properties"
        eyebrow="Rental Property Management"
        title="Property Management. Elevated."
        lead="Koinonia Properties brings clear communication, steady systems, and responsible care to rental property management—helping owners keep leasing, residents, maintenance, communication, and the day-to-day work around the property organized and moving forward."
        primaryLabel="Request Rental Analysis"
        primaryHref="/rental-analysis"
        secondaryLabel="View Available Homes"
        secondaryHref="/rentals"
        visualDesktopSrc="/assets/images/properties/heroes/home-hero.webp"
        visualAlt="Bright, well-cared-for residential interior with a property management workspace for Koinonia Properties"
      />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Start Here</div>
            <h2 className="koinonia-heading">
              Find the right next step for your property, your home, or your residency.
            </h2>
            <p className="koinonia-copy">
              Koinonia Properties serves different people at different stages of the rental experience. Start with the path that fits what you need today.
            </p>
          </div>
          <div className="koinonia-grid three">
            {audiencePaths.map((path) => (
              <UniversalCard
                key={path.title}
                title={path.title}
                body={path.body}
                actionLabel={path.actionLabel}
                actionHref={path.actionHref}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">The Koinonia Approach</div>
            <h2 className="koinonia-heading">
              Organized management. Clear communication. Responsible care.
            </h2>
            <p className="koinonia-copy">
              Property management involves more than collecting rent or responding when something breaks. It is ongoing coordination between the property, the owner, residents, vendors, leasing activity, maintenance needs, records, and next steps. Koinonia brings structure to that work so responsibilities stay clearer, communication stays more consistent, and the property receives thoughtful attention throughout the management relationship.
            </p>
          </div>
          <div className="koinonia-grid three">
            {approach.map((item, index) => (
              <UniversalCard
                key={item.title}
                eyebrow={`0${index + 1}`}
                title={item.title}
                body={item.body}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band" id="owner-services">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">Property Management Services</div>
            <h2 className="koinonia-heading">
              The essential work of managing a rental property, kept organized.
            </h2>
            <p className="koinonia-copy">
              Every property and owner relationship is different. Koinonia begins by understanding the property and the owner's goals, then clarifies the appropriate management scope, responsibilities, and next steps.
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
            <div className="koinonia-eyebrow">For Rental Property Owners</div>
            <h2 className="koinonia-heading">
              Know what is happening with your property—and what comes next.
            </h2>
            <p className="koinonia-copy">
              Owning rental property creates a steady stream of decisions, responsibilities, communication, and follow-through. Leasing activity has to move. Residents need clear communication. Maintenance needs must be coordinated. Vendors need direction. Property information has to stay organized. Owners need meaningful updates without having to chase every detail themselves.
            </p>
            <p className="koinonia-copy">
              Koinonia Properties is built to bring structure to that work. Whether the conversation involves one rental home or multiple investment properties, the goal is the same: understand the property, define the management responsibilities clearly, keep the work moving, and help the owner stay informed.
            </p>
            <div className="koinonia-actions">
              <a className="koinonia-button primary" href="/rental-analysis">
                Request Rental Analysis
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">How Property Management Begins</div>
            <h2 className="koinonia-heading">
              Start with the property. Build a clear management plan around what it needs.
            </h2>
            <p className="koinonia-copy">
              Koinonia's process begins with understanding before execution. The property, owner goals, current situation, responsibilities, and next steps should be clear before ongoing management begins.
            </p>
          </div>
          <div
            className="koinonia-grid"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}
          >
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

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-cta">
            <div className="koinonia-eyebrow">Start With a Rental Analysis</div>
            <h2 className="koinonia-heading">
              A better property-management conversation starts with understanding the property.
            </h2>
            <p className="koinonia-copy">
              Before deciding what management should look like, start with the property itself. Share the property address, property type, current condition and occupancy, rental status, known maintenance or turnover concerns, owner goals, and desired timing.
            </p>
            <p className="koinonia-copy">
              Koinonia can use that information to understand the situation, discuss the appropriate management scope, and determine the right next step. No sensitive financial, identity, payment, or private account information is needed to begin the conversation.
            </p>
            <div className="koinonia-actions" style={{ justifyContent: "center" }}>
              <a className="koinonia-button primary" href="/rental-analysis">
                Request Rental Analysis
              </a>
            </div>
          </div>
        </div>
      </section>

      <FAQ
        items={propertyFaqs}
        eyebrow="Property Management Questions"
        title="Helpful answers before you decide what comes next."
      />

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-cta">
            <div className="koinonia-eyebrow">Koinonia Properties</div>
            <h2 className="koinonia-heading">Let's start with the property.</h2>
            <p className="koinonia-copy">
              If you are considering professional property management, begin with a rental analysis and a clear conversation about the property, your goals, and what support would be most useful. Looking for a rental home instead? View current availability and rental information.
            </p>
            <div className="koinonia-actions" style={{ justifyContent: "center" }}>
              <a className="koinonia-button primary" href="/rental-analysis">
                Request Rental Analysis
              </a>
              <a className="koinonia-button secondary" href="/rentals">
                View Available Homes
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
