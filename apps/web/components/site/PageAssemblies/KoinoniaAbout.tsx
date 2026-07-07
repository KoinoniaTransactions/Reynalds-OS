import { CTA, Footer, Hero, TrustPillars, UniversalCard } from "../index";

export function KoinoniaAbout() {
  return (
    <main className="koinonia-site">
      <Hero
        eyebrow="About Koinonia"
        title="Built to serve Realtors with clarity, care, and dependable support."
        lead="Koinonia was created to bring organized real estate operations, clear communication, and reliable partnership to Realtors who want stronger support behind the scenes."
      />
      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">The Meaning Behind the Name</div>
            <h2 className="koinonia-heading">Koinonia reflects partnership, shared purpose, and service.</h2>
            <p className="koinonia-copy">
              The business is built around the belief that strong support should feel like a trusted partnership. Realtors should not have to carry every operational detail alone while also serving clients, negotiating, showing homes, and growing their business.
            </p>
          </div>
          <div className="koinonia-grid two">
            <UniversalCard
              title="Why Koinonia Exists"
              body="Koinonia exists to help Realtors operate with more confidence, consistency, and organization."
              items={["Support behind the scenes", "Clearer client experience", "Reliable systems and follow-through"]}
            />
            <UniversalCard
              title="How We Serve"
              body="The work is practical, detail-driven, and relationship-focused. The goal is not to add complexity; it is to simplify the moving parts."
              items={["Professional communication", "Organized execution", "Calm support through busy seasons"]}
            />
          </div>
        </div>
      </section>
      <TrustPillars />
      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Meet Jeremiah</div>
            <h2 className="koinonia-heading">A Colorado Realtor building support systems for real estate professionals.</h2>
            <p className="koinonia-copy">
              Jeremiah has been a licensed Colorado Realtor since 2020 and understands the pressure Realtors carry during active transactions. Koinonia was shaped from that experience: practical support, strong organization, clear communication, and a commitment to serving clients and agents well.
            </p>
          </div>
          <div className="koinonia-grid three">
            <UniversalCard title="Licensed Perspective" body="Support is shaped by real estate experience and an understanding of what Realtors are responsible for." />
            <UniversalCard title="Operational Mindset" body="The focus is on systems, consistency, deadlines, documentation, and communication." />
            <UniversalCard title="Service Foundation" body="The brand is grounded in serving others with professionalism, care, and dependability." />
          </div>
        </div>
      </section>
      <CTA />
      <Footer />
    </main>
  );
}
