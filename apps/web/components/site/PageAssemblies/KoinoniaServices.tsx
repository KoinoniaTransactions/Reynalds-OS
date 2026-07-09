import { servicesContent } from "@/content/services";
import { CTA, FAQ, Footer, Hero, UniversalCard } from "../index";

export function KoinoniaServices() {
  return (
    <main className="koinonia-site">
      <Hero
        eyebrow={servicesContent.hero.eyebrow}
        title={servicesContent.hero.title}
        lead={servicesContent.hero.lead}
        primaryLabel={servicesContent.hero.primaryLabel}
        primaryHref={servicesContent.hero.primaryHref}
        secondaryLabel={servicesContent.hero.secondaryLabel}
        secondaryHref={servicesContent.hero.secondaryHref}
        visualDesktopSrc="/assets/images/koinonia/services/services-hero-desktop.png"
        visualMobileSrc="/assets/images/koinonia/services/services-hero-mobile.png"
        variant="fullBleed"
      />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">{servicesContent.categories.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.categories.title}</h2>
            <p className="koinonia-copy">{servicesContent.categories.lead}</p>
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
            <div className="koinonia-eyebrow">{servicesContent.fit.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.fit.title}</h2>
            <p className="koinonia-copy">{servicesContent.fit.lead}</p>
          </div>

          <div className="koinonia-grid four">
            {servicesContent.fit.cards.map((card, index) => (
              <UniversalCard
                key={card.title}
                eyebrow={`0${index + 1}`}
                title={card.title}
                body={card.body}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">{servicesContent.process.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.process.title}</h2>
          </div>

          <div className="koinonia-grid four">
            {servicesContent.process.steps.map((step, index) => (
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

      <section id="support-levels" className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">{servicesContent.supportLevels.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.supportLevels.title}</h2>
            <p className="koinonia-copy">{servicesContent.supportLevels.lead}</p>
          </div>

          <div className="koinonia-grid three">
            {servicesContent.supportLevels.levels.map((level) => (
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
