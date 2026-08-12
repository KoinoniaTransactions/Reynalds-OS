import { Footer, Hero, PropertiesInquiry, PropertiesNav, PropertiesSeoContent, UniversalCard } from "../index";

const pricingSignals = [
  {
    title: "Leasing-Only",
    body: "For owners who need help preparing, marketing, screening, and leasing a property, then plan to self-manage.",
    items: ["Listing setup", "Applicant coordination", "Lease setup support"]
  },
  {
    title: "Full-Service Management",
    body: "For owners who want ongoing support with rent collection, maintenance coordination, tenant communication, and owner reporting.",
    items: ["Monthly management", "Maintenance coordination", "Owner updates"]
  },
  {
    title: "Portfolio Management",
    body: "For investors or owners with multiple rentals who need repeatable systems and consolidated communication.",
    items: ["Portfolio workflow", "Recurring reporting", "Multi-property support"]
  }
];

const feeRules = [
  "Property type and condition",
  "Current occupancy and leasing needs",
  "Requested management service level",
  "Maintenance and communication needs",
  "Number of properties in the portfolio"
];

const pricingReadiness = [
  {
    area: "Property Details",
    status: "Property Review",
    next: "Start with the property type, condition, occupancy, and current rental status."
  },
  {
    area: "Service Scope",
    status: "Service Review",
    next: "Choose the level of leasing and ongoing management support that fits the property."
  },
  {
    area: "Timing",
    status: "Timeline Review",
    next: "Share vacancy timing, current lease status, and any immediate property needs."
  },
  {
    area: "Portfolio Needs",
    status: "Portfolio Review",
    next: "For multiple rentals, discuss communication, reporting, and property oversight together."
  }
];

export function KoinoniaPropertiesPricing() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Pricing and Scope"
        title="Management plans should be clear before fees get complicated."
        lead="Pricing is based on the property and the services requested. Start with a rental analysis to define the scope and next step."
        primaryLabel="Request Rental Analysis"
        primaryHref="/rental-analysis"
        secondaryLabel="Owner Services"
        secondaryHref="/owners"
      />

      <PropertiesSeoContent variant="pricing" />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Management Plans</div>
            <h2 className="koinonia-heading">Three clear starting points.</h2>
          </div>
          <div className="koinonia-grid three">
            {pricingSignals.map((plan) => (
              <UniversalCard key={plan.title} title={plan.title} body={plan.body} items={plan.items} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-split">
            <div>
              <div className="koinonia-eyebrow">Pricing Factors</div>
              <h2 className="koinonia-heading">Pricing starts with the property and service scope.</h2>
              <p>A rental analysis gives owners a clear starting point for discussing service scope and pricing.</p>
            </div>
            <ul>
              {feeRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">What Shapes Pricing</div>
            <h2 className="koinonia-heading">A clear quote starts with the right property details.</h2>
            <p className="koinonia-copy">
              Koinonia Properties reviews the property, requested services, and timing before discussing a management quote.
            </p>
          </div>
          <div className="koinonia-readiness">
            {pricingReadiness.map((item) => (
              <article key={item.area}>
                <span>{item.status}</span>
                <strong>{item.area}</strong>
                <p>{item.next}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PropertiesInquiry kind="owner" />

      <Footer serviceLine="Koinonia Properties" supportLine="Pricing and scope" />
    </main>
  );
}
