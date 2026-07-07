import { CTA, FAQ, Footer, Hero, TrustPillars, UniversalCard } from "../index";

const services = [
  {
    title: "Transaction Management",
    body: "The operational foundation of Koinonia: contract-to-close support that keeps the file moving.",
    items: ["Deadlines and timeline management", "Communication coordination", "Document and task follow-through"]
  },
  {
    title: "Contract Preparation & Writing",
    body: "Support for Realtors who need accurate, professionally prepared contract paperwork.",
    items: ["Offer paperwork", "Amendments and addenda", "Signature-ready document preparation"]
  },
  {
    title: "Licensed Showing Coverage",
    body: "Licensed support when scheduling conflicts, distance, or workload make showings difficult to cover.",
    items: ["Licensed property access", "Showing coordination", "Feedback delivery"]
  },
  {
    title: "Business Support",
    body: "Flexible operational assistance for the broader needs of a real estate business.",
    items: ["Administrative workflows", "Client communication support", "Business organization"]
  }
];

const process = [
  {
    title: "You send the contract.",
    body: "Koinonia gathers the details, reviews the file, and starts organizing the transaction."
  },
  {
    title: "You stay focused on your clients.",
    body: "While you serve your clients and grow your business, Koinonia tracks deadlines, documents, and communication."
  },
  {
    title: "You close with confidence.",
    body: "The file reaches the finish line with organized support every step of the way."
  }
];

const supportLevels = [
  {
    title: "Transaction Support",
    body: "Best for Realtors who need dependable contract-to-close coordination.",
    items: ["Core transaction management", "Deadline support", "Communication assistance"]
  },
  {
    title: "Expanded Realtor Support",
    body: "Best for Realtors who also need help with contract paperwork or additional operational tasks.",
    items: ["Transaction coordination", "Contract preparation support", "Flexible operational help"]
  },
  {
    title: "Operations Partner",
    body: "Best for Realtors or teams looking for ongoing business support across multiple needs.",
    items: ["Custom support structure", "Business workflow assistance", "Long-term operational partnership"]
  }
];

export function KoinoniaServices() {
  return (
    <main className="koinonia-site">
      <Hero
        eyebrow="Services & Pricing"
        title="Support for every stage of your real estate business."
        lead="Choose the level of operational support that fits the way you work, from transaction management to broader business support."
      />
      <TrustPillars />
      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Service Categories</div>
            <h2 className="koinonia-heading">Four ways Koinonia supports your business.</h2>
          </div>
          <div className="koinonia-grid four">
            {services.map((service, index) => (
              <UniversalCard key={service.title} eyebrow={`0${index + 1}`} title={service.title} body={service.body} items={service.items} />
            ))}
          </div>
        </div>
      </section>
      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">How It Works</div>
            <h2 className="koinonia-heading">A simple process built around you.</h2>
          </div>
          <div className="koinonia-grid three">
            {process.map((step, index) => (
              <UniversalCard key={step.title} eyebrow={`0${index + 1}`} title={step.title} body={step.body} />
            ))}
          </div>
        </div>
      </section>
      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Support Levels</div>
            <h2 className="koinonia-heading">Choose the support that fits your business.</h2>
            <p className="koinonia-copy">The conversation stays focused on support first. Pricing supports the decision rather than driving it.</p>
          </div>
          <div className="koinonia-grid three">
            {supportLevels.map((level) => (
              <UniversalCard key={level.title} title={level.title} body={level.body} items={level.items} />
            ))}
          </div>
        </div>
      </section>
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
