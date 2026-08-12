import { FAQ, Footer, Hero, PropertiesInquiry, PropertiesNav, PropertiesSeoContent, UniversalCard } from "../index";

const ownerServices = [
  {
    title: "Rental Analysis",
    body: "Review property type, location, condition, rental readiness, and owner goals before recommending a management path.",
    items: ["Property review", "Rent-readiness notes", "Management recommendation"]
  },
  {
    title: "Leasing and Placement",
    body: "Prepare the listing, coordinate applicant communication, and support the path from marketing to signed lease.",
    items: ["Listing preparation", "Applicant workflow", "Lease setup support"]
  },
  {
    title: "Ongoing Management",
    body: "Keep rent collection, maintenance coordination, owner updates, records, and tenant communication organized.",
    items: ["Owner reporting", "Maintenance coordination", "Tenant communication"]
  }
];

const ownerExpectations = [
  "Management agreement and fee structure",
  "Reserve requirements and maintenance approval threshold",
  "Owner distribution and statement schedule",
  "Inspection cadence and communication standard",
  "Broker supervision, licensing, and trust accounting requirements"
];

const ownerFaqs = [
  {
    q: "What should an owner send first?",
    a: "Start with the property address, current rental status, owner goals, known maintenance concerns, and whether the property is occupied or vacant."
  },
  {
    q: "How is pricing determined?",
    a: "Pricing depends on the property and service scope. A rental analysis helps identify the management path and the services that fit."
  },
  {
    q: "Can Koinonia Properties support multiple rentals?",
    a: "Portfolio needs can be discussed during the rental analysis so communication, reporting, and property oversight can be organized consistently."
  }
];

export function KoinoniaPropertiesOwners() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Owner Services"
        title="A clearer way to manage your rental property."
        lead="Koinonia Properties helps owners move from scattered rental tasks to an organized management process with clear communication and responsible follow-through."
        primaryLabel="Request Rental Analysis"
        primaryHref="/rental-analysis"
        secondaryLabel="View Management Plans"
        secondaryHref="/pricing"
      />

      <PropertiesSeoContent variant="owners" />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Owner Path</div>
            <h2 className="koinonia-heading">Start with the property, then build the management plan.</h2>
          </div>
          <div className="koinonia-grid three">
            {ownerServices.map((service, index) => (
              <UniversalCard key={service.title} eyebrow={`0${index + 1}`} title={service.title} body={service.body} items={service.items} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-split">
            <div>
              <div className="koinonia-eyebrow">Before We Launch</div>
              <h2 className="koinonia-heading">Clear expectations support better property management.</h2>
              <p>Owners receive a clear service scope, communication path, maintenance expectations, and management terms for the property.</p>
            </div>
            <ul>
              {ownerExpectations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <FAQ items={ownerFaqs} eyebrow="Owner Questions" title="Owner clarity before commitment." />
      <PropertiesInquiry kind="owner" />
      <Footer serviceLine="Koinonia Properties" supportLine="Owner services" />
    </main>
  );
}
