import { Footer, Hero, PropertiesInquiry, PropertiesNav, PropertiesSeoContent, UniversalCard } from "../index";

const areaPlan = [
  {
    title: "Start With the Address",
    body: "Share the property address so Koinonia Properties can confirm whether the location fits current service coverage."
  },
  {
    title: "Review the Property",
    body: "Property type, condition, occupancy, and management needs help determine the right service path."
  },
  {
    title: "Confirm the Next Step",
    body: "If the property fits current coverage, the rental analysis can move into service-scope and timing discussions."
  }
];

const pageRequirements = [
  "Property address and property type",
  "Current occupancy or vacancy timing",
  "Known maintenance or turnover needs",
  "Owner goals and requested service level",
  "Best contact information for follow-up"
];

const coverageChecks = [
  {
    title: "Location",
    body: "Service availability begins with the property address and current operating coverage."
  },
  {
    title: "Property Needs",
    body: "Leasing, maintenance, condition, and timing all affect whether the property is a good fit."
  },
  {
    title: "Communication",
    body: "Owners receive a clear answer about next steps after the property and service needs are reviewed."
  },
  {
    title: "Rental Analysis",
    body: "A rental analysis is the best starting point for discussing a property that may fit current coverage."
  }
];

export function KoinoniaPropertiesServiceAreas() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Service Areas"
        title="Local pages should launch only where Koinonia can serve well."
        lead="Property management is local. Share the property address so Koinonia Properties can confirm current service availability and the right next step."
        primaryLabel="Request Rental Analysis"
        primaryHref="/rental-analysis"
        secondaryLabel="View Rentals"
        secondaryHref="/rentals"
      />

      <PropertiesSeoContent variant="service-areas" />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Service Availability</div>
            <h2 className="koinonia-heading">Start with the property address.</h2>
          </div>
          <div className="koinonia-grid three">
            {areaPlan.map((item, index) => (
              <UniversalCard key={item.title} eyebrow={`0${index + 1}`} title={item.title} body={item.body} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-split">
            <div>
              <div className="koinonia-eyebrow">What To Share</div>
              <h2 className="koinonia-heading">A few details help us confirm the right path.</h2>
              <p>Send the property address and a few basic details so Koinonia Properties can review current service availability.</p>
            </div>
            <ul>
              {pageRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Coverage Review</div>
            <h2 className="koinonia-heading">Service availability is confirmed property by property.</h2>
            <p className="koinonia-copy">
              Location, property needs, timing, and service scope are reviewed together before the next step is recommended.
            </p>
          </div>
          <div className="koinonia-grid four">
            {coverageChecks.map((check) => (
              <UniversalCard key={check.title} title={check.title} body={check.body} />
            ))}
          </div>
        </div>
      </section>

      <PropertiesInquiry kind="rental" />

      <Footer serviceLine="Koinonia Properties" supportLine="Service areas" />
    </main>
  );
}
