import { Footer, Hero, PropertiesInquiry, PropertiesNav, PropertiesSeoContent, UniversalCard } from "../index";
import { mailto } from "../../../config/contact.config";

const listingRequirements = [
  {
    title: "Clear Listing Details",
    body: "Each rental should show price, availability, bedrooms, bathrooms, parking, utilities, pet policy, and lease terms."
  },
  {
    title: "Photo-Forward Layout",
    body: "Listings should lead with useful property photos and enough detail for a tenant to decide whether to apply or schedule a tour."
  },
  {
    title: "Direct Next Step",
    body: "Every available rental should include an apply or schedule-tour action without making the tenant hunt for it."
  }
];

const listingFields = [
  "Rent and deposit",
  "Available date",
  "Beds, baths, and parking",
  "Utilities and appliances",
  "Pet policy",
  "Application criteria"
];

const rentalActions = [
  {
    label: "Get Availability Updates",
    href: mailto("Koinonia Properties Rental Availability")
  },
  {
    label: "Application Criteria",
    href: "/properties/apply"
  },
  {
    label: "Tenant Services",
    href: "/properties/tenants"
  }
];

export function KoinoniaPropertiesRentals() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Available Rentals"
        title="Rental listings will appear here when available."
        lead="This page will become the tenant-facing rental inventory path for Koinonia Properties."
        primaryLabel="Tenant Services"
        primaryHref="/properties/tenants"
        secondaryLabel="Apply"
        secondaryHref="/properties/apply"
      />

      <PropertiesSeoContent variant="rentals" />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Current Availability</div>
            <h2 className="koinonia-heading">No current vacancies.</h2>
            <p className="koinonia-copy">Check back soon or contact Koinonia Properties about upcoming availability.</p>
          </div>
          <div className="koinonia-rentals-board">
            <div className="koinonia-rentals-empty">
              <span>0 Active Listings</span>
              <strong>Upcoming rentals will be posted here first.</strong>
              <p>Listings will include the details applicants need before they decide to apply or schedule a showing.</p>
              <div className="koinonia-actions">
                {rentalActions.map((action) => (
                  <a className="koinonia-button secondary" href={action.href} key={action.label}>{action.label}</a>
                ))}
              </div>
            </div>
            <div className="koinonia-listing-spec">
              <h3>Every listing should include</h3>
              <ul>
                {listingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Listing Standard</div>
            <h2 className="koinonia-heading">Rental listings should answer the next tenant question before it becomes a call.</h2>
          </div>
          <div className="koinonia-grid three">
            {listingRequirements.map((item, index) => (
              <UniversalCard key={item.title} eyebrow={`0${index + 1}`} title={item.title} body={item.body} />
            ))}
          </div>
        </div>
      </section>

      <PropertiesInquiry kind="tenant" />

      <Footer serviceLine="Koinonia Properties" supportLine="Available rentals" />
    </main>
  );
}
