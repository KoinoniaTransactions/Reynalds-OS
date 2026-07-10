import { aboutContent } from "@/content/about";
import { CTA, Footer, Hero, UniversalCard } from "../index";

export function KoinoniaAbout() {
  return (
    <main className="koinonia-site">
      <Hero
        eyebrow={aboutContent.hero.eyebrow}
        title={aboutContent.hero.title}
        lead={aboutContent.hero.lead}
        primaryLabel={aboutContent.hero.primaryLabel}
        primaryHref={aboutContent.hero.primaryHref}
        secondaryLabel={aboutContent.hero.secondaryLabel}
        secondaryHref={aboutContent.hero.secondaryHref}
        visualDesktopSrc="/assets/images/koinonia/about/about-hero-desktop.png"
        visualMobileSrc="/assets/images/koinonia/about/about-hero-mobile.png"
        variant="fullBleed"
      />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">
              {aboutContent.meaning.eyebrow}
            </div>

            <h2 className="koinonia-heading">
              {aboutContent.meaning.title}
            </h2>

            <p className="koinonia-copy">
              {aboutContent.meaning.lead}
            </p>
          </div>

          <div className="koinonia-grid two">
            {aboutContent.meaning.cards.map((card) => (
              <UniversalCard
                key={card.title}
                title={card.title}
                body={card.body}
                items={card.items}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">
              {aboutContent.trust.eyebrow}
            </div>

            <h2 className="koinonia-heading">
              {aboutContent.trust.title}
            </h2>

            <p className="koinonia-copy">
              {aboutContent.trust.lead}
            </p>
          </div>

          <div className="koinonia-grid three">
            {aboutContent.trust.cards.map((card) => (
              <UniversalCard
                key={card.title}
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
            <div className="koinonia-eyebrow">
              {aboutContent.founder.eyebrow}
            </div>

            <h2 className="koinonia-heading">
              {aboutContent.founder.title}
            </h2>

            <p className="koinonia-copy">
              {aboutContent.founder.lead}
            </p>
          </div>

          <div className="koinonia-grid three">
            {aboutContent.founder.cards.map((card) => (
              <UniversalCard
                key={card.title}
                title={card.title}
                body={card.body}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">
              {aboutContent.foundation.eyebrow}
            </div>

            <h2 className="koinonia-heading">
              {aboutContent.foundation.title}
            </h2>
          </div>

          <div className="koinonia-grid three">
            {aboutContent.foundation.cards.map((card) => (
              <UniversalCard
                key={card.title}
                title={card.title}
                body={card.body}
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
