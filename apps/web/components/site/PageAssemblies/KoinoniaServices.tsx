import { servicesContent } from "@/content/services";
import { CTA, FAQ, Footer, Header, Hero, UniversalCard } from "../index";

export function KoinoniaServices() {
  return (
    <main className="koinonia-site">
      <Header />

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

      <section className="koinonia-section koinonia-services-core">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{servicesContent.categories.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.categories.title}</h2>
            <p className="koinonia-copy">{servicesContent.categories.lead}</p>
          </div>

          <div className="koinonia-grid balanced-five">
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

      <section className="koinonia-section koinonia-services-referrals">
        <div className="koinonia-container">
          <div className="koinonia-cta">
            <div className="koinonia-eyebrow">{servicesContent.referralDiscovery.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.referralDiscovery.title}</h2>
            <p className="koinonia-copy">{servicesContent.referralDiscovery.lead}</p>
            <div className="koinonia-actions" style={{ justifyContent: "center" }}>
              <a className="koinonia-button primary" href={servicesContent.referralDiscovery.primaryHref}>
                {servicesContent.referralDiscovery.primaryLabel}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band koinonia-services-open-house">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{servicesContent.openHouse.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.openHouse.title}</h2>
            <p className="koinonia-copy">{servicesContent.openHouse.lead}</p>
          </div>

          <div className="koinonia-grid two">
            <article className="koinonia-card">
              <h3>What professional coverage includes</h3>
              <ul>
                {servicesContent.openHouse.included.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="koinonia-card koinonia-pricing-card">
              <div className="koinonia-price-badge">
                <span className="koinonia-price-badge-label">Standalone</span>
                <span className="koinonia-price-badge-value">{servicesContent.openHouse.standalonePrice}</span>
              </div>
              <h3>Professional Open House</h3>
              <p>{servicesContent.openHouse.standaloneLabel}</p>

              <div className="koinonia-price-badge">
                <span className="koinonia-price-badge-label">Additional event</span>
                <span className="koinonia-price-badge-value">{servicesContent.openHouse.additionalPrice}</span>
              </div>
              <p>{servicesContent.openHouse.additionalLabel}</p>
              <p>{servicesContent.openHouse.packageNote}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="monthly-support" className="koinonia-section koinonia-services-support">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{servicesContent.monthlySupport.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.monthlySupport.title}</h2>
            <p className="koinonia-copy">{servicesContent.monthlySupport.lead}</p>
          </div>

          <div className="koinonia-grid three">
            {servicesContent.monthlySupport.tiers.map((tier) => (
              <article key={tier.title} className="koinonia-card koinonia-pricing-card">
                <div className="koinonia-price-badge">
                  <span className="koinonia-price-badge-label">Monthly</span>
                  <span className="koinonia-price-badge-value">{tier.price}</span>
                </div>

                <h3>{tier.title}</h3>
                <p>{tier.body}</p>

                <ul>
                  {tier.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-services-pricing">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{servicesContent.pricingSnapshot.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.pricingSnapshot.title}</h2>
            <p className="koinonia-copy">{servicesContent.pricingSnapshot.lead}</p>
          </div>

          <div className="koinonia-grid balanced-five">
            {servicesContent.pricingSnapshot.prices.map((price) => (
              <article key={price.title} className="koinonia-card koinonia-pricing-card">
                <div className="koinonia-price-badge">
                  <span className="koinonia-price-badge-label">Starting at</span>
                  <span className="koinonia-price-badge-value">{price.price}</span>
                </div>

                <h3>{price.title}</h3>
                <p>{price.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-services-scope">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{servicesContent.scopeNotes.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.scopeNotes.title}</h2>
            <p className="koinonia-copy">{servicesContent.scopeNotes.lead}</p>
          </div>

          <div className="koinonia-grid balanced-five">
            {servicesContent.scopeNotes.notes.map((note) => (
              <UniversalCard key={note.title} title={note.title} body={note.body} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band koinonia-services-fit">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{servicesContent.fit.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.fit.title}</h2>
            <p className="koinonia-copy">{servicesContent.fit.lead}</p>
          </div>

          <div className="koinonia-grid balanced-five">
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

      <section className="koinonia-section koinonia-services-process">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{servicesContent.process.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.process.title}</h2>
            <p className="koinonia-copy">{servicesContent.process.lead}</p>
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

      <section className="koinonia-section koinonia-band koinonia-services-boundaries">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{servicesContent.boundaries.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.boundaries.title}</h2>
            <p className="koinonia-copy">{servicesContent.boundaries.lead}</p>
          </div>

          <div className="koinonia-grid three">
            {servicesContent.boundaries.cards.map((card) => (
              <UniversalCard key={card.title} title={card.title} body={card.body} />
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
