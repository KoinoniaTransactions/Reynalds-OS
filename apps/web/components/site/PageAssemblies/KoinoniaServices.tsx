import { servicesContent } from "@/content/services";
import { CTA, FAQ, Footer, Header, Hero, UniversalCard } from "../index";
import { ServicePricingExperience } from "../ServicePricingExperience/ServicePricingExperience";

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

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{servicesContent.breadth.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.breadth.title}</h2>
            <p className="koinonia-copy">{servicesContent.breadth.lead}</p>
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{servicesContent.capabilities.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.capabilities.title}</h2>
            <p className="koinonia-copy">{servicesContent.capabilities.lead}</p>
          </div>

          <div className="koinonia-grid three">
            {servicesContent.capabilities.items.map((service, index) => (
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

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{servicesContent.differentiation.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.differentiation.title}</h2>
            <p className="koinonia-copy">{servicesContent.differentiation.lead}</p>
          </div>

          <div className="koinonia-grid four">
            {servicesContent.differentiation.items.map((item) => (
              <UniversalCard key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{servicesContent.pricing.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.pricing.title}</h2>
            <p className="koinonia-copy">{servicesContent.pricing.lead}</p>
          </div>

          <ServicePricingExperience
            products={servicesContent.pricing.products}
            details={servicesContent.details}
          />
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{servicesContent.comparison.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.comparison.title}</h2>
            <p className="koinonia-copy">{servicesContent.comparison.lead}</p>
          </div>

          <div className="koinonia-grid two">
            {servicesContent.comparison.columns.map((column) => (
              <article key={column.title} className="koinonia-card koinonia-pricing-card">
                <div className="koinonia-price-badge">
                  <span className="koinonia-price-badge-label">Monthly</span>
                  <span className="koinonia-price-badge-value">{column.price}</span>
                </div>
                <h3>{column.title}</h3>
                <p>{column.bestFor}</p>
                <ul>
                  {column.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{servicesContent.popularSolutions.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.popularSolutions.title}</h2>
            <p className="koinonia-copy">{servicesContent.popularSolutions.lead}</p>
          </div>

          <div className="koinonia-grid four">
            {servicesContent.popularSolutions.items.map((item) => (
              <UniversalCard key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{servicesContent.outsideCosts.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.outsideCosts.title}</h2>
            <p className="koinonia-copy">{servicesContent.outsideCosts.lead}</p>
          </div>
        </div>
      </section>

      <section className="koinonia-section">
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

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{servicesContent.boundaries.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.boundaries.title}</h2>
            <p className="koinonia-copy">{servicesContent.boundaries.lead}</p>
          </div>

          <div className="koinonia-grid three">
            {servicesContent.boundaries.items.map((item) => (
              <UniversalCard key={item.title} title={item.title} body={item.body} />
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
