import { Footer, Hero, PropertiesInquiry, PropertiesNav, PropertiesSeoContent, UniversalCard } from "../index";

const areaPlan = [
  {
    title: "Primary Market",
    body: "Start with the exact city or county where licensing, travel, vendors, and local rental knowledge are strongest."
  },
  {
    title: "Nearby Expansion",
    body: "Add surrounding markets only when vendor coverage, showings, inspections, and tenant support can be handled responsibly."
  },
  {
    title: "Local SEO Pages",
    body: "Create a unique page for each service area with local rental context, owner questions, and available listings."
  }
];

const pageRequirements = [
  "Property management in the city or neighborhood",
  "Types of properties served in that market",
  "Local rental and leasing considerations",
  "Owner CTA for rental analysis",
  "Internal links to rentals, owners, pricing, and policies"
];

const coverageChecks = [
  {
    title: "Licensing Fit",
    body: "Confirm Koinonia can legally provide property management services in the market before marketing it as active coverage."
  },
  {
    title: "Vendor Coverage",
    body: "Confirm maintenance, inspection, emergency, cleaning, and turnover support can reach the area reliably."
  },
  {
    title: "Showing Capacity",
    body: "Confirm leasing logistics, access, travel time, and tenant communication can be handled without overpromising."
  },
  {
    title: "Local Content",
    body: "Build each city page around real rental questions, property types, owner concerns, and available inventory."
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
        lead="Property management is local. Koinonia Properties should build service-area pages around real coverage, vendor readiness, and market knowledge."
        primaryLabel="Request Rental Analysis"
        primaryHref="/properties/rental-analysis"
        secondaryLabel="View Rentals"
        secondaryHref="/properties/rentals"
      />

      <PropertiesSeoContent variant="service-areas" />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Market Strategy</div>
            <h2 className="koinonia-heading">Build local SEO around real operating capacity.</h2>
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
              <div className="koinonia-eyebrow">Future City Pages</div>
              <h2 className="koinonia-heading">Each market page should be specific, not duplicated.</h2>
              <p>Once the target markets are chosen, each page should include useful local context instead of thin city-name swaps.</p>
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
            <div className="koinonia-eyebrow">Coverage Gate</div>
            <h2 className="koinonia-heading">A market becomes public only when service can actually reach it.</h2>
            <p className="koinonia-copy">
              Property management service areas should follow operating capacity, not wishful SEO. Each new market needs coverage checks before a city page goes live.
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
