import { Footer, Hero, PropertiesInquiry, PropertiesNav, PropertiesSeoContent, UniversalCard } from "../index";

const portals = [
  {
    title: "Tenant Access",
    body: "Residents receive secure account-access and payment instructions directly for the property they occupy.",
    items: ["Account access", "Payment instructions", "Property communication"],
    actionLabel: "Tenant Services",
    actionHref: "/tenants"
  },
  {
    title: "Owner Access",
    body: "Owners receive secure account-access instructions directly when online reporting or document access is available.",
    items: ["Property communication", "Documents", "Reporting guidance"],
    actionLabel: "Owner Services",
    actionHref: "/owners"
  },
  {
    title: "Vendor Information",
    body: "Vendors can use the public vendor page for onboarding information and the appropriate contact path.",
    items: ["Vendor inquiry", "Service information", "Contact guidance"],
    actionLabel: "Vendor Info",
    actionHref: "/vendors"
  }
];

const platformGates = [
  {
    area: "Account Access",
    status: "Provided Directly",
    next: "Use the secure access instructions provided for your property or account."
  },
  {
    area: "Payment Questions",
    status: "Property Specific",
    next: "Follow the payment instructions provided for the property you occupy."
  },
  {
    area: "Maintenance",
    status: "Support Available",
    next: "Use the Maintenance page for routine issue guidance and contact information."
  },
  {
    area: "Access Help",
    status: "Contact Koinonia",
    next: "Contact Koinonia Properties if you need help locating the correct access path."
  }
];

export function KoinoniaPropertiesPortals() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Portals"
        title="Everyone needs the right front door."
        lead="Secure account access is provided directly when applicable. This page helps owners and residents find the correct next step without routing through another Koinonia website."
        primaryLabel="Tenant Services"
        primaryHref="/tenants"
        secondaryLabel="Owner Services"
        secondaryHref="/owners"
      />

      <PropertiesSeoContent variant="portals" />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Secure Access</div>
            <h2 className="koinonia-heading">Public information stays here. Private account activity stays secure.</h2>
            <p className="koinonia-copy">
              Koinonia Properties does not ask visitors to enter private account information on the public website.
            </p>
          </div>
          <div className="koinonia-grid three">
            {portals.map((portal) => (
              <UniversalCard
                key={portal.title}
                title={portal.title}
                body={portal.body}
                items={portal.items}
                actionLabel={portal.actionLabel}
                actionHref={portal.actionHref}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Access Guidance</div>
            <h2 className="koinonia-heading">Use the access instructions provided for your property.</h2>
            <p className="koinonia-copy">
              For account access, payments, documents, or property-specific information, follow the secure instructions you received directly from Koinonia Properties.
            </p>
          </div>
          <div className="koinonia-readiness inverted">
            {platformGates.map((gate) => (
              <article key={gate.area}>
                <span>{gate.status}</span>
                <strong>{gate.area}</strong>
                <p>{gate.next}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PropertiesInquiry kind="tenant" />

      <Footer serviceLine="Koinonia Properties" supportLine="Portal access" />
    </main>
  );
}
