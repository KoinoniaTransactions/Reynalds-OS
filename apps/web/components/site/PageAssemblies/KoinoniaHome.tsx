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
        <div className="koinonia-grid three">
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

      <Section
        className="koinonia-home-flagship"
        align="center"
        eyebrow={homeContent.flagship.eyebrow}
        title={homeContent.flagship.title}
        lead={homeContent.flagship.lead}
      >
        <article className="koinonia-card koinonia-pricing-card">
          <div className="koinonia-price-badge">
            <span className="koinonia-price-badge-label">Hand Us the Listing</span>
            <span className="koinonia-price-badge-value">{homeContent.flagship.price}</span>
          </div>
          <div className="koinonia-actions">
            <a className="koinonia-button primary" href={homeContent.flagship.ctaHref}>
              {homeContent.flagship.ctaLabel}
            </a>
          </div>
        </article>
      </Section>

      <Section
        variant="band"
        align="center"
        eyebrow={homeContent.field.eyebrow}
        title={homeContent.field.title}
        lead={homeContent.field.lead}
      >
        <article className="koinonia-card koinonia-pricing-card">
          <div className="koinonia-price-badge">
            <span className="koinonia-price-badge-label">Licensed Field Coverage</span>
            <span className="koinonia-price-badge-value">{homeContent.field.price}</span>
          </div>
          <div className="koinonia-actions">
            <a className="koinonia-button primary" href={homeContent.field.ctaHref}>
              {homeContent.field.ctaLabel}
            </a>
          </div>
        </article>
      </Section>

      <Section
        className="koinonia-home-recurring"
        align="center"
        eyebrow={homeContent.recurring.eyebrow}
        title={homeContent.recurring.title}
        lead={homeContent.recurring.lead}
      >
        <div className="koinonia-grid two">
          {homeContent.recurring.cards.map((card) => (
            <article key={card.title} className="koinonia-card koinonia-pricing-card">
              <div className="koinonia-price-badge">
                <span className="koinonia-price-badge-label">{card.title}</span>
                <span className="koinonia-price-badge-value">{card.price}</span>
              </div>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
        <div className="koinonia-actions" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
          <a className="koinonia-button secondary" href="/services#marketing-management">
            Compare Monthly Support
          </a>
        </div>
      </Section>

      <Section
        variant="band"
        align="center"
        eyebrow={homeContent.pricing.eyebrow}
        title={homeContent.pricing.title}
        lead={homeContent.pricing.lead}
      >
        <div className="koinonia-grid three">
          {homeContent.pricing.items.map((item) => (
            <article key={item.title} className="koinonia-card koinonia-pricing-card">
              <div className="koinonia-price-badge">
                <span className="koinonia-price-badge-label">{item.note}</span>
                <span className="koinonia-price-badge-value">{item.price}</span>
              </div>
              <h3>{item.title}</h3>
            </article>
          ))}
        </div>
        <div className="koinonia-actions" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
          <a className="koinonia-button primary" href="/services#pricing">
            See Everything Included
          </a>
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
