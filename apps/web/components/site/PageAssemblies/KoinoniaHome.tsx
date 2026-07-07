import { CTA, Footer, Hero, TrustPillars, UniversalCard } from "../index";

const services = [
  {
    title: "Transaction Management",
    body: "Organized contract-to-close support that keeps timelines, documents, communication, and deadlines moving.",
    items: ["Timeline coordination", "Deadline tracking", "Communication support"]
  },
  {
    title: "Contract Preparation & Writing",
    body: "Professional contract paperwork support for Realtors who need accurate, timely document preparation.",
    items: ["Offer preparation", "Amendments and addenda", "Signature-ready files"]
  },
  {
    title: "Licensed Showing Coverage",
    body: "Flexible showing support when schedules conflict or additional coverage is needed.",
    items: ["Licensed support", "Access coordination", "Showing feedback"]
  },
  {
    title: "Business Support",
    body: "Operational assistance that helps Realtors stay organized beyond a single transaction.",
    items: ["Workflow support", "Client coordination", "Business organization"]
  }
];

export function KoinoniaHome() {
  return (
    <main className="koinonia-site">
      <Hero
        eyebrow="Real Estate Operations Support"
        title="Support that keeps your business moving."
        lead="Koinonia helps Realtors stay organized, communicate clearly, and move transactions forward with dependable support behind the scenes."
        primaryLabel="Explore Services"
        primaryHref="/koinonia/services"
        secondaryLabel="Contact Koinonia"
        secondaryHref="/koinonia/contact"
      />
      <TrustPillars />
      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">What We Support</div>
            <h2 className="koinonia-heading">Real estate operations built around the way Realtors work.</h2>
            <p className="koinonia-copy">Start with the support you need today and expand as your business grows.</p>
          </div>
          <div className="koinonia-grid four">
            {services.map((service, index) => (
              <UniversalCard
                key={service.title}
                eyebrow={`0${index + 1}`}
                title={service.title}
                body={service.body}
                items={service.items}
              />
            ))}
          </div>
        </div>
      </section>
      <CTA />
      <Footer />
    </main>
  );
}
