import { Footer, Hero, PropertiesInquiry, PropertiesNav, PropertiesSeoContent, UniversalCard } from "../index";

const requestTypes = [
  {
    title: "Routine Requests",
    body: "Non-urgent repairs should go through the tenant portal with photos, location details, and access notes.",
    items: ["Repair description", "Photos", "Permission to enter"]
  },
  {
    title: "Urgent Issues",
    body: "Urgent maintenance needs a separate routing path with clear definitions and response expectations.",
    items: ["Water intrusion", "No heat in required season", "Safety concerns"]
  },
  {
    title: "Owner Approvals",
    body: "Requests above the approved threshold should route to the owner with a recommendation, estimate, and decision deadline.",
    items: ["Vendor estimate", "Owner approval", "Work-order tracking"]
  }
];

const maintenanceRules = [
  "Define emergency versus routine maintenance before launch.",
  "Set owner approval thresholds in the management agreement.",
  "Require vendor insurance and invoice standards.",
  "Use portal intake for records instead of scattered text messages.",
  "State expected response times carefully and only after operations can support them."
];

export function KoinoniaPropertiesMaintenance() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Maintenance"
        title="Maintenance requests need clear routing from the first message."
        lead="Koinonia Properties provides a clear path for routine maintenance questions, issue details, access information, and follow-up."
        primaryLabel="Tenant Portal"
        primaryHref="/portals"
        secondaryLabel="Policies"
        secondaryHref="/policies"
      />

      <PropertiesSeoContent variant="maintenance" />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Maintenance Flow</div>
            <h2 className="koinonia-heading">Requests should become trackable work, not scattered messages.</h2>
          </div>
          <div className="koinonia-grid three">
            {requestTypes.map((type, index) => (
              <UniversalCard key={type.title} eyebrow={`0${index + 1}`} title={type.title} body={type.body} items={type.items} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-split">
            <div>
              <div className="koinonia-eyebrow">Operating Rules</div>
              <h2 className="koinonia-heading">Maintenance policy must match the management agreement.</h2>
              <p>Clear issue details, access information, and communication help maintenance requests move forward efficiently.</p>
            </div>
            <ul>
              {maintenanceRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <PropertiesInquiry kind="maintenance" />

      <Footer serviceLine="Koinonia Properties" supportLine="Maintenance requests" />
    </main>
  );
}
