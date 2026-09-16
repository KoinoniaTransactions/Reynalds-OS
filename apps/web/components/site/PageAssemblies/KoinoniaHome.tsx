import { homeContent } from "@/content/home";
import { CTA, Footer, Header, Hero, Section, UniversalCard } from "../index";

export function KoinoniaHome() {
  return (
    <main className="koinonia-site">
      <Header />

      <Hero
        eyebrow={homeContent.hero.eyebrow}
        title={homeContent.hero.title}
        lead={homeContent.hero.lead}
        primaryLabel={homeContent.hero.primaryLabel}
        primaryHref={homeContent.hero.primaryHref}
        secondaryLabel={homeContent.hero.secondaryLabel}
        secondaryHref={homeContent.hero.secondaryHref}
        visualDesktopSrc="/assets/images/koinonia/home/home-hero-desktop.png"
        visualMobileSrc="/assets/images/koinonia/home/home-hero-mobile.png"
        variant="fullBleed"
      />

      <Section
        className="koinonia-home-positioning"
        align="center"
        eyebrow={homeContent.positioning.eyebrow}
        title={homeContent.positioning.title}
        lead={homeContent.positioning.lead}
      >
        <div className="koinonia-grid three">
          {homeContent.positioning.highlights.map((highlight, index) => (
            <UniversalCard
              key={highlight.title}
              eyebrow={`0${index + 1}`}
              title={highlight.title}
              body={highlight.body}
            />
          ))}
        </div>
      </Section>

      <Section
        variant="band"
        align="center"
        eyebrow={homeContent.servicesIntro.eyebrow}
        title={homeContent.servicesIntro.title}
        lead={homeContent.servicesIntro.lead}
      >
        <div className="koinonia-grid balanced-five">
          {homeContent.services.map((service, index) => (
            <UniversalCard
              key={service.title}
              eyebrow={`0${index + 1}`}
              title={service.title}
              body={service.body}
              items={service.items}
            />
          ))}
        </div>
      </Section>

      <section className="koinonia-section koinonia-home-referrals">
        <div className="koinonia-container">
          <div className="koinonia-cta">
            <div className="koinonia-eyebrow">{homeContent.referralDiscovery.eyebrow}</div>
            <h2 className="koinonia-heading">{homeContent.referralDiscovery.title}</h2>
            <p className="koinonia-copy">{homeContent.referralDiscovery.lead}</p>
            <p className="koinonia-copy">{homeContent.referralDiscovery.body}</p>
            <div className="koinonia-actions" style={{ justifyContent: "center" }}>
              <a className="koinonia-button primary" href={homeContent.referralDiscovery.primaryHref}>
                {homeContent.referralDiscovery.primaryLabel}
              </a>
              <a className="koinonia-button secondary" href={homeContent.referralDiscovery.secondaryHref}>
                {homeContent.referralDiscovery.secondaryLabel}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Section
        className="koinonia-home-fit"
        align="center"
        eyebrow={homeContent.fit.eyebrow}
        title={homeContent.fit.title}
        lead={homeContent.fit.lead}
      >
        <div className="koinonia-grid three">
          {homeContent.fit.cards.map((card, index) => (
            <UniversalCard
              key={card.title}
              eyebrow={`0${index + 1}`}
              title={card.title}
              body={card.body}
            />
          ))}
        </div>
      </Section>

      <Section
        className="koinonia-home-process"
        align="center"
        eyebrow={homeContent.experience.eyebrow}
        title={homeContent.experience.title}
        lead={homeContent.experience.lead}
      >
        <div className="koinonia-grid three">
          {homeContent.experience.cards.map((card, index) => (
            <UniversalCard
              key={card.title}
              eyebrow={`0${index + 1}`}
              title={card.title}
              body={card.body}
            />
          ))}
        </div>
      </Section>

      <CTA />
      <Footer />
    </main>
  );
}
