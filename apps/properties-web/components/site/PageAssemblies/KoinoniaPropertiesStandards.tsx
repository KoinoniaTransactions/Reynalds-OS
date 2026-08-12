import { Footer, Hero, PropertiesInquiry, PropertiesNav, UniversalCard } from "../index";

const standards = [
  {
    title: "Owner Communication",
    body: "Owners receive organized communication, documented next steps, and a clear path for property questions.",
    items: ["Communication", "Next steps", "Property updates"]
  },
  {
    title: "Resident Support",
    body: "Residents receive clear direction for rentals, applications, maintenance, property communication, and account access.",
    items: ["Clear direction", "Property support", "Account guidance"]
  },
  {
    title: "Maintenance Coordination",
    body: "Maintenance communication focuses on the issue, property access, status, and documented follow-through.",
    items: ["Issue details", "Access", "Follow-through"]
  },
  {
    title: "Vendor Coordination",
    body: "Vendor communication centers on service scope, property access, documentation, and invoice details.",
    items: ["Scope", "Access", "Documentation"]
  },
  {
    title: "Record Organization",
    body: "Property communication and documents are kept organized so owners, residents, and service providers have clearer next steps.",
    items: ["Records", "Documents", "Communication"]
  },
  {
    title: "Privacy",
    body: "The public website avoids collecting private account information and directs sensitive activity to the appropriate secure process.",
    items: ["Public-site safety", "Secure access", "Need-to-know information"]
  }
];

const launchGates = [
  "Service scope and property responsibilities documented.",
  "Owner communication and reporting expectations documented.",
  "Owner service terms and maintenance expectations documented.",
  "Resident communication, privacy, and property-specific requirements documented.",
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
        lead="Koinonia Properties is built around clear communication, organized records, responsible follow-through, and property-specific guidance."
        primaryLabel="Owner Services"
        primaryHref="/owners"
        secondaryLabel="Policies"
        secondaryHref="/policies"
      />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Service Standards</div>
            <h2 className="koinonia-heading">A property management business needs rules before scale.</h2>
            <p className="koinonia-copy">
              These standards describe the public service experience Koinonia Properties works to provide for owners, residents, and vendors.
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
              <h2 className="koinonia-heading">Clear standards create a more consistent property experience.</h2>
              <p>Owners and residents receive property-specific details at the appropriate step, while the public site stays focused on clear expectations and communication.</p>
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
