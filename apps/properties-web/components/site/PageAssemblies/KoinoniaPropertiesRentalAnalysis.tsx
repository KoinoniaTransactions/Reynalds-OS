import { RentalEstimateTool } from "../RentalEstimateTool";
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
    body: "Explore how Managed for You and Managed With You differ in maintenance responsibilities and owner involvement.",
    items: ["Owner goals", "Service level", "Next operating step"]
  }
];

const intakeFields = [
  "Owner name and best contact information",
  "Property address and property type",
  "Current rent or target rent, if known",
  "Vacancy date or current lease status",
  "Known maintenance or inspection concerns",
  "Whether the owner prefers Managed for You or Managed With You"
];

export function KoinoniaPropertiesRentalAnalysis() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Rental Analysis"
        title="Start with a clearer view of the rental property."
        lead="Enter a property address for an instant rental market estimate, nearby comparisons, and an overview of Koinonia Properties management options."
        primaryLabel="Get Rental Estimate"
        primaryHref="#instant-rent-estimate"
        secondaryLabel="Owner Services"
        secondaryHref="/owners"
      />

      <PropertiesSeoContent variant="rental-analysis" />
      <section className="koinonia-section" id="instant-rent-estimate">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Instant Rental Estimate</div>
            <h2 className="koinonia-heading">What could your property rent for?</h2>
            <p className="koinonia-copy">Start with an address. View a data-backed market estimate before deciding whether to request personalized assistance.</p>
          </div>
          <RentalEstimateTool />
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Owner Intake</div>
            <h2 className="koinonia-heading">Start with the essentials. We'll take it from there.</h2>
            <p className="koinonia-copy">
              Share the property's current situation so our conversation can focus on what matters to you.
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
              <p>Have these details ready when you request a rental analysis.</p>
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
