import { Footer, Hero, PropertiesInquiry, PropertiesNav, UniversalCard } from "../index";

const vendorFlow = [
  {
    title: "Vendor Approval",
    body: "Vendors should be approved before receiving work orders, with insurance, licensing, service area, and trade information on file.",
    items: ["Insurance", "Trade category", "Service area"]
  },
  {
    title: "Work Orders",
    body: "Maintenance work should move through a clear work-order process with scope, access notes, photos, and owner approval status.",
    items: ["Scope", "Access notes", "Status updates"]
  },
  {
    title: "Invoices",
    body: "Invoices should include the property, work-order reference, labor/material detail, and any required owner approval record.",
    items: ["Property reference", "Work completed", "Invoice detail"]
  }
];

const vendorStandards = [
  "Provide company name, trade category, service area, and best contact information.",
  "Share insurance or licensing information when it is relevant to the work requested.",
  "Use the property and work-order reference provided for the job.",
  "Keep tenant and owner information limited to what is needed for the work.",
  "Include clear labor, material, and completion details with invoices."
];

export function KoinoniaPropertiesVendors() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Vendors"
        title="Clear vendor coordination supports better property care."
        lead="Koinonia Properties works with vendors through clear service information, property access details, communication, documentation, and invoice expectations."
        primaryLabel="Maintenance Rules"
        primaryHref="/maintenance"
        secondaryLabel="Vendor Inquiry"
        secondaryHref="#vendor-inquiry"
      />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Vendor Workflow</div>
            <h2 className="koinonia-heading">A dependable vendor network starts with simple standards.</h2>
          </div>
          <div className="koinonia-grid three">
            {vendorFlow.map((item, index) => (
              <UniversalCard key={item.title} eyebrow={`0${index + 1}`} title={item.title} body={item.body} items={item.items} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-split">
            <div>
              <div className="koinonia-eyebrow">Vendor Standards</div>
              <h2 className="koinonia-heading">Simple standards make vendor communication easier.</h2>
              <p>These standards help keep property work, communication, and documentation organized.</p>
            </div>
            <ul>
              {vendorStandards.map((standard) => (
                <li key={standard}>{standard}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <PropertiesInquiry kind="vendor" />

      <Footer serviceLine="Koinonia Properties" supportLine="Vendor coordination" />
    </main>
  );
}
