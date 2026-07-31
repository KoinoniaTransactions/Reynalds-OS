import { Footer, Hero, PropertiesInquiry, PropertiesNav, PropertiesSeoContent, UniversalCard } from "../index";

const applicationSteps = [
  {
    title: "Choose a Property",
    body: "Applications should begin from an active rental listing so applicants know exactly which home they are applying for.",
    items: ["Listing selected", "Availability confirmed", "Application criteria reviewed"]
  },
  {
    title: "Submit Application",
    body: "The application should collect only the information needed for screening and should clearly explain required documents and fees.",
    items: ["Applicant details", "Screening authorization", "Required documents"]
  },
  {
    title: "Review and Next Steps",
    body: "Applicants should know what happens after submission, how communication works, and when to expect the next update.",
    items: ["Review timeline", "Decision communication", "Lease next steps"]
  }
];

const criteriaNotes = [
  "Application criteria must be reviewed for fair housing compliance before publication.",
  "Application fees, deposits, and screening disclosures must match state and broker requirements.",
  "Each listing should link directly to the correct application path.",
  "Applicants should see pet policy, income expectations, and occupancy standards before applying.",
  "The application page should not collect personal data until privacy policy language is finalized."
];

export function KoinoniaPropertiesApply() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Apply"
        title="A rental application path that is clear before it collects data."
        lead="Koinonia Properties should make application requirements easy to understand before applicants submit personal information."
        primaryLabel="View Rentals"
        primaryHref="/properties/rentals"
        secondaryLabel="Tenant Services"
        secondaryHref="/properties/tenants"
      />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Application Flow</div>
            <h2 className="koinonia-heading">The application should start from the listing, not a mystery form.</h2>
          </div>
          <div className="koinonia-grid three">
            {applicationSteps.map((step, index) => (
              <UniversalCard key={step.title} eyebrow={`0${index + 1}`} title={step.title} body={step.body} items={step.items} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-split">
            <div>
              <div className="koinonia-eyebrow">Before Applications Open</div>
              <h2 className="koinonia-heading">Screening rules need to be written before the button goes live.</h2>
              <p>These items protect applicants, owners, and Koinonia Properties from unclear or inconsistent application handling.</p>
            </div>
            <ul>
              {criteriaNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <PropertiesSeoContent variant="apply" />

      <PropertiesInquiry kind="tenant" />

      <Footer serviceLine="Koinonia Properties" supportLine="Rental applications" />
    </main>
  );
}
