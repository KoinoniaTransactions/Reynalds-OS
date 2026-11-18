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
  "Equal Housing Opportunity: every applicant is reviewed against the same written criteria, in line with federal and Colorado fair housing law.",
  "Application fees are $35, limited to the actual cost of screening. Portable screening reports are accepted as Colorado law allows.",
  "Security deposits are held and returned under Colorado law, with an itemized statement of any deductions.",
  "After hours, call our main line. Emergencies get a call back within 1 hour, 24/7. For fire, gas smell or carbon monoxide, call 911 first.",
  "Urgent issues get a written plan within 24 hours, 7 days a week. Routine requests are handled the next business day."
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
        title="Rental policies, in plain language."
        lead="Fair housing, application fees, deposits and after-hours emergencies. Property-specific terms come with each listing and lease."
        primaryLabel="Tenant Services"
        primaryHref="/tenants"
        secondaryLabel="Owner Services"
        secondaryHref="/owners"
        visualDesktopSrc="/assets/images/properties/heroes/policies-hero.webp"
      />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Policy Library</div>
            <h2 className="koinonia-heading">Where to find the terms that apply to you.</h2>
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
              <div className="koinonia-eyebrow">Key Policies</div>
              <h2 className="koinonia-heading">The rules we follow for every home.</h2>
              <p>Your lease or management agreement has the full terms for your home.</p>
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
