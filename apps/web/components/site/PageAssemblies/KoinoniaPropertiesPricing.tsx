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
  "Publish exact fees only after the management agreement and broker review are complete.",
  "Explain what is included before discussing add-on services.",
  "Disclose maintenance reserve expectations and approval thresholds.",
  "Separate leasing fees, monthly management fees, renewal fees, and pass-through expenses.",
  "Avoid promising guarantees until service-level rules are written and approved."
];

const pricingReadiness = [
  {
    area: "Management Fee",
    status: "Custom Quote",
    next: "Quote after property type, service level, occupancy, reserve, and management agreement details are reviewed."
  },
  {
    area: "Leasing Fee",
    status: "Pending Final Schedule",
    next: "Define listing prep, showing, screening coordination, lease setup, and tenant-placement scope."
  },
  {
    area: "Maintenance Reserve",
    status: "Owner Agreement Needed",
    next: "Set reserve requirement, approval threshold, emergency authority, and vendor payment workflow."
  },
  {
    area: "Pass-Through Costs",
    status: "Disclosure Needed",
    next: "Separate vendor invoices, inspection fees, advertising, repairs, utilities, HOA fees, and other owner expenses."
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
        lead="Koinonia Properties can start with service-level clarity while exact fees are finalized through licensing, broker, insurance, and accounting review."
        primaryLabel="Request Rental Analysis"
        primaryHref="/properties/rental-analysis"
        secondaryLabel="Owner Services"
        secondaryHref="/properties/owners"
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
              <div className="koinonia-eyebrow">Fee Rules</div>
              <h2 className="koinonia-heading">Transparent pricing starts with honest boundaries.</h2>
              <p>Owners should see that Koinonia Properties is organized and direct, even before exact numbers are published.</p>
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
            <div className="koinonia-eyebrow">Pricing Readiness</div>
            <h2 className="koinonia-heading">Use custom pricing until the fee schedule is approved.</h2>
            <p className="koinonia-copy">
              This lets owners understand the shape of the service while Koinonia Properties finalizes the legal, accounting, and broker-reviewed fee language.
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
