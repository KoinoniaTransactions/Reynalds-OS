import { servicesContent } from "@/content/services";
import { CTA, FAQ, Footer, Hero, TrustPillars, UniversalCard } from "../index";

export function KoinoniaServices() {
  return (
    <main className="koinonia-site">
      <Hero
        eyebrow={servicesContent.hero.eyebrow}
        title={servicesContent.hero.title}
        lead={servicesContent.hero.lead}
      />

      <TrustPillars />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">{servicesContent.categories.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.categories.title}</h2>
          </div>

          <div className="koinonia-grid four">
            {servicesContent.services.map((service, index) => (
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

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">How It Works</div>
            <h2 className="koinonia-heading">A simple process built around you.</h2>
          </div>

          <div className="koinonia-grid three">
            {servicesContent.process.map((step, index) => (
              <UniversalCard
                key={step.title}
                eyebrow={`0${index + 1}`}
                title={step.title}
                body={step.body}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Support Levels</div>
            <h2 className="koinonia-heading">Choose the support that fits your business.</h2>
            <p className="koinonia-copy">
              The conversation stays focused on support first. Pricing supports the decision rather than driving it.
            </p>
          </div>

          <div className="koinonia-grid three">
            {servicesContent.supportLevels.map((level) => (
              <UniversalCard
                key={level.title}
                title={level.title}
                body={level.body}
                items={level.items}
              />
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