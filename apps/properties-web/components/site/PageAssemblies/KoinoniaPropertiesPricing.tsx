import { Footer, Hero, PropertiesInquiry, PropertiesNav, PropertiesSeoContent, UniversalCard } from "../index";

const managementPlans = [
  {
    title: "Managed for You — 10%",
    body: "Full-service rental management with Koinonia coordinating qualified vendors, routine maintenance scheduling, resident communication, and follow-through within the agreed management authority.",
    items: ["10% of rent actually collected", "Koinonia-coordinated maintenance", "Owner updates and reporting"]
  },
  {
    title: "Managed With You — 8%",
    body: "For owners who want meaningful involvement in eligible, nonurgent maintenance. Koinonia continues to handle intake, urgency triage, resident communication, and documented oversight.",
    items: ["8% of rent actually collected", "Owner-directed eligible maintenance", "Koinonia oversight and communication"]
  }
];

const additionalFees = [
  {
    area: "Tenant Placement",
    status: "50% of one month's rent",
    next: "Earned on successful placement under the agreed lease and move-in conditions; unsuccessful applications or early attempts do not trigger the fee."
  },
  {
    area: "Lease Renewal",
    status: "$199",
    next: "Charged only upon a completed renewal."
  },
  {
    area: "Visual Inspections",
    status: "$99",
    next: "Mid-lease inspection and additional owner-requested visits each priced at $99; initial assessment and standard move-in/move-out condition inspections are included as applicable."
  },
  {
    area: "Setup & Vacancy",
    status: "$0",
    next: "No new-owner setup fee or monthly vacancy management fee."
  }
];

const maintenanceRules = [
  "A 10% contractor markup applies to qualifying vendor work Koinonia coordinates and invoices under either management plan; it is itemized separately.",
  "No Koinonia contractor markup applies where an owner independently arranges and pays a contractor without Koinonia coordination.",
  "The owner-involved option does not change urgent maintenance triage or legal habitability responsibilities.",
  "Routine repair authority, owner participation, vendor qualifications, and exceptions are defined in the management agreement."
];

export function KoinoniaPropertiesPricing() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Pricing and Scope"
        title="Straightforward plans. Clear responsibilities."
        lead="Choose the level of maintenance involvement that fits you. Both options emphasize clear communication, thoughtful coordination, and transparency about costs."
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
            <h2 className="koinonia-heading">Two ways to manage your rental property.</h2>
          </div>
          <div className="koinonia-grid two">
            {managementPlans.map((plan) => (
              <UniversalCard key={plan.title} title={plan.title} body={plan.body} items={plan.items} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-split">
            <div>
              <div className="koinonia-eyebrow">Maintenance Transparency</div>
              <h2 className="koinonia-heading">Know who handles the work—and what it costs.</h2>
              <p>Management fees and contractor coordination charges are separate. We explain the responsibilities and approvals before work begins.</p>
            </div>
            <ul>
              {maintenanceRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Additional Fees</div>
            <h2 className="koinonia-heading">Know the charges beyond monthly management.</h2>
            <p className="koinonia-copy">
              These are the proposed fees selected for the management model. Final written terms, legal disclosures, and applicability are confirmed before any engagement.
            </p>
          </div>
          <div className="koinonia-readiness">
            {additionalFees.map((item) => (
              <article key={item.area}>
                <span>{item.status}</span>
                <strong>{item.area}</strong>
                <p>{item.next}</p>
              </article>
            ))}
          </div>
        </div>
      </section>


      <section className="koinonia-section">
        <div className="koinonia-container">
          <p className="koinonia-copy">
            Monthly percentages are based on rent actually collected, with the exact calculation defined
            by the management agreement. Any application screening charges are disclosed separately and
            depend on actual permissible costs and applicable law. Services, owner participation,
            contractor authority, and fees are subject to the final written management agreement.
          </p>
        </div>
      </section>

      <PropertiesInquiry kind="owner" />

      <Footer serviceLine="Koinonia Properties" supportLine="Pricing and scope" />
    </main>
  );
}
