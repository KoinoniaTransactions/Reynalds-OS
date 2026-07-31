import { Footer, Hero, PropertiesInquiry, PropertiesNav, PropertiesSeoContent, UniversalCard } from "../index";

const analysisSteps = [
  {
    title: "Property Snapshot",
    body: "Start with the property address, property type, current condition, occupancy status, and target timeline.",
    items: ["Address", "Property type", "Vacant or occupied"]
  },
  {
    title: "Rental Readiness",
    body: "Identify what needs to be confirmed before marketing, showing, leasing, or onboarding the property.",
    items: ["Photos and listing details", "Maintenance concerns", "Utility and pet policies"]
  },
  {
    title: "Management Fit",
    body: "Match the property to leasing-only, full-service management, or portfolio management support.",
    items: ["Owner goals", "Service level", "Next operating step"]
  }
];

const intakeFields = [
  "Owner name and best contact information",
  "Property address and property type",
  "Current rent or target rent, if known",
  "Vacancy date or current lease status",
  "Known maintenance or inspection concerns",
  "Whether the owner wants leasing-only or full-service management"
];

export function KoinoniaPropertiesRentalAnalysis() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Rental Analysis"
        title="Start with a clearer view of the rental property."
        lead="A rental analysis gives owners a practical first step before choosing a management plan."
        primaryLabel="Contact Koinonia"
        primaryHref="/koinonia/contact"
        secondaryLabel="Owner Services"
        secondaryHref="/properties/owners"
      />

      <PropertiesSeoContent variant="rental-analysis" />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Owner Intake</div>
            <h2 className="koinonia-heading">Keep the first form short, then collect details in follow-up.</h2>
            <p className="koinonia-copy">
              The first version should ask only for the information needed to understand the property and route the conversation.
            </p>
          </div>
          <div className="koinonia-grid three">
            {analysisSteps.map((step, index) => (
              <UniversalCard key={step.title} eyebrow={`0${index + 1}`} title={step.title} body={step.body} items={step.items} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-split">
            <div>
              <div className="koinonia-eyebrow">What To Prepare</div>
              <h2 className="koinonia-heading">A simple intake list for owner inquiries.</h2>
              <p>These fields become the future rental analysis form once the contact workflow is connected.</p>
            </div>
            <ul>
              {intakeFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <PropertiesInquiry kind="rental" />

      <Footer serviceLine="Koinonia Properties" supportLine="Rental analysis" />
    </main>
  );
}
