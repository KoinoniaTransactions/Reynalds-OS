import { aboutContent } from "@/content/about";
import { CTA, Footer, Header, Hero, UniversalCard } from "../index";

export function KoinoniaAbout() {
  return (
    <main className="koinonia-site">
      <Header />

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

      <section className="koinonia-section koinonia-about-word-meaning">
        <div className="koinonia-container">
          <article className="koinonia-word-meaning-card">
            <div className="koinonia-word-meaning-mark" aria-hidden="true">
              K
            </div>

            <div className="koinonia-word-meaning-content">
              <div className="koinonia-eyebrow">
                {aboutContent.wordMeaning.eyebrow}
              </div>

              <h2 className="koinonia-word-meaning-title">
                {aboutContent.wordMeaning.word}
              </h2>

              <p className="koinonia-word-meaning-pronunciation">
                {aboutContent.wordMeaning.pronunciation}
              </p>

              <p className="koinonia-word-meaning-definition">
                {aboutContent.wordMeaning.definition}
              </p>

              <p className="koinonia-copy">
                {aboutContent.wordMeaning.body}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="koinonia-section koinonia-about-meaning">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
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

      <section className="koinonia-section koinonia-band koinonia-about-trust">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
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
            {aboutContent.trust.cards.map((card, index) => (
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

      <section className="koinonia-section koinonia-about-founder">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
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
            {aboutContent.founder.cards.map((card, index) => (
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

      <section className="koinonia-section koinonia-band koinonia-about-foundation">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">
              {aboutContent.foundation.eyebrow}
            </div>

            <h2 className="koinonia-heading">
              {aboutContent.foundation.title}
            </h2>

            <p className="koinonia-copy">
              {aboutContent.foundation.lead}
            </p>
          </div>

          <div className="koinonia-grid three">
            {aboutContent.foundation.cards.map((card, index) => (
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

      <CTA />
      <Footer />
    </main>
  );
}
