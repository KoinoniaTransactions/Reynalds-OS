import { Footer, Hero, PropertiesInquiry, PropertiesNav, UniversalCard } from "../index";

const policyGroups = [
  {
    title: "Application Policies",
    body: "Application criteria, screening requirements, pet rules, income expectations, and fair housing language should be written before accepting applications.",
    items: ["Screening criteria", "Pet policy", "Fair housing language"]
  },
  {
    title: "Resident Policies",
    body: "Residents need clear rent payment, late fee, maintenance, emergency, move-in, and move-out expectations.",
    items: ["Rent payment", "Maintenance requests", "Move-in and move-out"]
  },
  {
    title: "Owner Policies",
    body: "Owners need clarity around reserves, maintenance approvals, reporting, distributions, inspections, and termination.",
    items: ["Owner reserve", "Approval threshold", "Reporting cadence"]
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
    area: "Application Criteria",
    status: "Drafting",
    next: "Write screening criteria, fee disclosures, pet policy, privacy language, and fair-housing review notes."
  },
  {
    area: "Resident Rules",
    status: "Drafting",
    next: "Define rent payment expectations, maintenance routing, move-in standards, move-out steps, and resident communication channel."
  },
  {
    area: "Owner Agreement",
    status: "Broker Review Needed",
    next: "Confirm reserves, approval thresholds, distributions, inspection cadence, termination rules, and management authority."
  },
  {
    area: "Accounting and Deposits",
    status: "Verification Needed",
    next: "Confirm trust account, security deposit, fee withdrawal, vendor payment, statement, and year-end reporting rules."
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
        lead="Koinonia Properties should publish policies only after the operating rules, legal requirements, and broker review are aligned."
        primaryLabel="Tenant Services"
        primaryHref="/properties/tenants"
        secondaryLabel="Owner Services"
        secondaryHref="/properties/owners"
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
              <h2 className="koinonia-heading">Policy copy is not final until it is verified.</h2>
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
            <div className="koinonia-eyebrow">Policy Readiness</div>
            <h2 className="koinonia-heading">Publish the public policy only after the internal rule is approved.</h2>
            <p className="koinonia-copy">
              This keeps the site useful during buildout while preventing early policy language from becoming an accidental promise.
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
