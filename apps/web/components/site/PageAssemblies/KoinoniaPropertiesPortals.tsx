import { Footer, Hero, PropertiesInquiry, PropertiesNav, PropertiesSeoContent, UniversalCard } from "../index";

const portals = [
  {
    title: "Tenant Portal",
    body: "Rent payments, maintenance requests, lease documents, messages, and account visibility should live behind this path.",
    items: ["Pay rent", "Request maintenance", "View documents"],
    actionLabel: "Maintenance",
    actionHref: "/properties/maintenance"
  },
  {
    title: "Owner Portal",
    body: "Owner statements, disbursements, property performance, maintenance updates, and documents should live behind this path.",
    items: ["Statements", "Property performance", "Maintenance visibility"]
  },
  {
    title: "Vendor Path",
    body: "Approved vendors should have clear instructions for work orders, invoice submission, and emergency communication.",
    items: ["Work orders", "Invoices", "Emergency routing"],
    actionLabel: "Vendor Info",
    actionHref: "/properties/vendors"
  }
];

const platformGates = [
  {
    area: "Tenant Payments",
    status: "Platform Required",
    next: "Use the selected management platform for payments, ledgers, account status, and private resident data."
  },
  {
    area: "Maintenance Requests",
    status: "Workflow Required",
    next: "Route requests through one system with photos, access notes, triage category, vendor updates, and closeout records."
  },
  {
    area: "Owner Reporting",
    status: "Accounting Required",
    next: "Connect statements, reserves, disbursements, invoices, and documents only after accounting rules are verified."
  },
  {
    area: "Vendor Work Orders",
    status: "Approval Required",
    next: "Dispatch only approved vendors with insurance, scope, access notes, invoice standards, and emergency routing rules."
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
        lead="The Koinonia Properties website should make portals easy to find while the selected property management platform handles secure account activity."
        primaryLabel="Tenant Services"
        primaryHref="/properties/tenants"
        secondaryLabel="Owner Services"
        secondaryHref="/properties/owners"
      />

      <PropertiesSeoContent variant="portals" />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Portal Strategy</div>
            <h2 className="koinonia-heading">The website routes people. The management platform handles private data.</h2>
            <p className="koinonia-copy">
              This keeps the public site simple, trustworthy, and easy to update while avoiding custom portal complexity before the operating system is selected.
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
            <div className="koinonia-eyebrow">Portal Launch Gates</div>
            <h2 className="koinonia-heading">Private account activity belongs in the approved platform.</h2>
            <p className="koinonia-copy">
              The public website should route people to the right doorway. Payments, applications, maintenance records, documents, and account history should live in a secure property management system.
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
