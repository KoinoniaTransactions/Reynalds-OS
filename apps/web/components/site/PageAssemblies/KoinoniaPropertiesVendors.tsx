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
  "Insurance and licensing requirements should be confirmed before vendors are dispatched.",
  "Emergency vendor rules should be separate from routine maintenance rules.",
  "Invoices should be submitted through one standard channel.",
  "Vendors should not receive tenant or owner information beyond what is needed for the job.",
  "Preferred-vendor status should be earned through reliability, documentation, and communication."
];

export function KoinoniaPropertiesVendors() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Vendors"
        title="Vendor coordination should be organized before the first work order."
        lead="Koinonia Properties needs clear vendor standards for maintenance quality, communication, insurance, invoices, and emergency response."
        primaryLabel="Maintenance Rules"
        primaryHref="/properties/maintenance"
        secondaryLabel="Contact Koinonia"
        secondaryHref="/koinonia/contact"
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
              <h2 className="koinonia-heading">The vendor page should reduce confusion, not create promises too early.</h2>
              <p>These standards keep vendor relationships organized while Koinonia Properties finalizes its management operations.</p>
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
