import { Footer, Hero, PropertiesInquiry, PropertiesNav, UniversalCard } from "../index";

const standards = [
  {
    title: "Owner Standards",
    body: "Owner onboarding, reserve expectations, communication standards, approval thresholds, and reporting cadence should be documented before management begins.",
    items: ["Owner intake", "Approval rules", "Reporting cadence"]
  },
  {
    title: "Tenant Standards",
    body: "Applications, rent payment paths, resident communication, maintenance requests, and move-in expectations should be clear and consistently applied.",
    items: ["Application process", "Resident portal", "Move-in expectations"]
  },
  {
    title: "Maintenance Standards",
    body: "Requests should be categorized, routed, approved, tracked, and closed with enough documentation for owners, tenants, and accounting.",
    items: ["Triage", "Work orders", "Closeout"]
  },
  {
    title: "Vendor Standards",
    body: "Vendor approval, insurance, work-order communication, invoices, and emergency routing should follow one documented process.",
    items: ["Approval", "Insurance", "Invoices"]
  },
  {
    title: "Accounting Standards",
    body: "Rent, deposits, reserves, owner distributions, management fees, vendor payments, and statements require verified accounting rules.",
    items: ["Trust accounting", "Statements", "Distributions"]
  },
  {
    title: "Compliance Standards",
    body: "Fair housing, advertising, screening, privacy, accessibility, licensing, and broker supervision must be verified before public launch.",
    items: ["Fair housing", "Licensing", "Privacy"]
  }
];

const launchGates = [
  "Broker supervision and licensing path confirmed.",
  "Trust accounting and security deposit handling confirmed.",
  "Owner agreement, fee schedule, and reserve policy approved.",
  "Application criteria, privacy policy, and fair housing language approved.",
  "Maintenance emergency definitions and vendor dispatch rules approved.",
  "Portal or property management platform selected for private account activity."
];

export function KoinoniaPropertiesStandards() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Operating Standards"
        title="The website promise should match the management system behind it."
        lead="Koinonia Properties is being structured around clear operating rules before public property management promises go live."
        primaryLabel="Owner Services"
        primaryHref="/properties/owners"
        secondaryLabel="Policies"
        secondaryHref="/properties/policies"
      />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Draft Standards</div>
            <h2 className="koinonia-heading">A property management business needs rules before scale.</h2>
            <p className="koinonia-copy">
              These standards reflect the internal Koinonia Properties operating-rule drafts. Public policy language still needs broker, legal, insurance, and accounting review.
            </p>
          </div>
          <div className="koinonia-grid three">
            {standards.map((standard) => (
              <UniversalCard key={standard.title} title={standard.title} body={standard.body} items={standard.items} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-split">
            <div>
              <div className="koinonia-eyebrow">Launch Gates</div>
              <h2 className="koinonia-heading">These approvals turn the draft into a public operating promise.</h2>
              <p>Koinonia Properties can keep building the site now, but active management should wait until these gates are resolved.</p>
            </div>
            <ul>
              {launchGates.map((gate) => (
                <li key={gate}>{gate}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <PropertiesInquiry kind="owner" />

      <Footer serviceLine="Koinonia Properties" supportLine="Operating standards" />
    </main>
  );
}
