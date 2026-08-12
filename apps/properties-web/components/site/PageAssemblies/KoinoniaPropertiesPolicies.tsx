import { Footer, Hero, PropertiesInquiry, PropertiesNav, UniversalCard } from "../index";

const policyGroups = [
  {
    title: "Rental Applications",
    body: "Application instructions and property-specific requirements are provided with active rental listings.",
    items: ["Listing details", "Application instructions", "Property requirements"]
  },
  {
    title: "Resident Information",
    body: "Residents receive property-specific guidance for payments, maintenance, communication, and move-in or move-out steps.",
    items: ["Property communication", "Maintenance guidance", "Resident instructions"]
  },
  {
    title: "Owner Services",
    body: "Owners receive service terms and property-specific expectations as part of the management relationship.",
    items: ["Service scope", "Communication", "Property expectations"]
  }
];

const complianceNotes = [
  "Verify fair housing language before publishing tenant criteria.",
  "Verify late fee, notice, security deposit, and habitability rules for the state.",
  "Confirm broker supervision and trust accounting requirements.",
  "Add privacy policy language before collecting personal data.",
  "Keep accessibility and equal housing information visible on tenant-facing pages."
];

const policyReadiness = [
  {
    area: "Applications",
    status: "Listing Specific",
    next: "Use the instructions and requirements provided with the active rental listing."
  },
  {
    area: "Resident Guidance",
    status: "Property Specific",
    next: "Follow the payment, maintenance, communication, and occupancy instructions provided for the property."
  },
  {
    area: "Owner Services",
    status: "Agreement Specific",
    next: "Use the service scope and property expectations provided for the management relationship."
  },
  {
    area: "Questions",
    status: "Contact Koinonia",
    next: "Contact Koinonia Properties when you need clarification about the correct policy or next step."
  }
];

export function KoinoniaPropertiesPolicies() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Policies"
        title="Rules should protect clarity, compliance, and trust."
        lead="Koinonia Properties keeps public policy guidance clear while property-specific terms are provided with the relevant listing, lease process, or management relationship."
        primaryLabel="Tenant Services"
        primaryHref="/tenants"
        secondaryLabel="Owner Services"
        secondaryHref="/owners"
      />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Policy Library</div>
            <h2 className="koinonia-heading">The public site should make expectations easy to find.</h2>
          </div>
          <div className="koinonia-grid three">
            {policyGroups.map((group) => (
              <UniversalCard key={group.title} title={group.title} body={group.body} items={group.items} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-split">
            <div>
              <div className="koinonia-eyebrow">Compliance Notes</div>
              <h2 className="koinonia-heading">Property-specific terms come with the property or service.</h2>
              <p>These checks stay explicit so the website does not publish operational promises ahead of the legal and brokerage structure.</p>
            </div>
            <ul>
              {complianceNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Policy Guidance</div>
            <h2 className="koinonia-heading">Use the policy information provided for your property.</h2>
            <p className="koinonia-copy">
              General guidance lives on the public site, while property-specific requirements are provided at the appropriate step.
            </p>
          </div>
          <div className="koinonia-readiness">
            {policyReadiness.map((item) => (
              <article key={item.area}>
                <span>{item.status}</span>
                <strong>{item.area}</strong>
                <p>{item.next}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PropertiesInquiry kind="tenant" />

      <Footer serviceLine="Koinonia Properties" supportLine="Policies" />
    </main>
  );
}
