import { CTA, Footer, Header, Hero, UniversalCard } from "../index";

const coverageCards = [
  {
    eyebrow: "01",
    title: "Licensed Showing Coverage",
    body:
      "Get licensed showing support when a schedule conflict, distance, or overlapping client need makes it hard to be in two places at once."
  },
  {
    eyebrow: "02",
    title: "Professional Open House Coverage",
    body:
      "Keep an open house covered professionally when your calendar is already committed somewhere else."
  },
  {
    eyebrow: "03",
    title: "Contract & Document Support",
    body:
      "Get document preparation support based on your instructions, with the Realtor retaining final review, advice, and approval."
  },
  {
    eyebrow: "04",
    title: "Transaction & Closing Preparation",
    body:
      "Keep the contract-to-close work organized with deadline tracking, document follow-up, communication support, and closing preparation."
  },
  {
    eyebrow: "05",
    title: "Day-to-Day Operations Support",
    body:
      "Add support for the recurring admin, CRM, follow-up, task organization, and business details that keep your real estate operation moving."
  }
] as const;

export function KoinoniaCoverage() {
  return (
    <main className="koinonia-site">
      <Header />

      <Hero
        eyebrow="Real Estate Operations Support"
        title="Transaction management is only part of the job."
        lead="When the work goes beyond the file, Koinonia gives Colorado Realtors access to licensed support—so more of the business stays covered."
        primaryLabel="Schedule a Consultation"
        primaryHref="/contact#schedule-consultation"
        secondaryLabel="View All Services"
        secondaryHref="/services"
        visualDesktopSrc="/assets/images/koinonia/services/services-hero-desktop.png"
        visualMobileSrc="/assets/images/koinonia/services/services-hero-mobile.png"
        visualAlt="Organized real estate operations support for Colorado Realtors"
        variant="fullBleed"
      />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">Support Beyond the File</div>
            <h2 className="koinonia-heading">More of the work can stay covered.</h2>
            <p className="koinonia-copy">
              Use the support that fits the day—from licensed field coverage to contract, transaction, and recurring operations support.
            </p>
          </div>

          <div className="koinonia-grid three">
            {coverageCards.map((card) => (
              <UniversalCard
                key={card.title}
                eyebrow={card.eyebrow}
                title={card.title}
                body={card.body}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">Built Around the Realtor</div>
            <h2 className="koinonia-heading">Keep the client relationship. Add support behind it.</h2>
            <p className="koinonia-copy">
              Koinonia is a support company for Colorado Realtors. Licensed real estate work is provided through appropriately licensed support, while advice, negotiation decisions, brokerage compliance, and final professional judgment remain with the Realtor.
            </p>
          </div>
        </div>
      </section>

      <CTA />
      <Footer />
    </main>
  );
}
