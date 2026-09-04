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

          <div className="koinonia-grid three">
            {servicesContent.pricing.products.map((product) => (
              <article key={product.id} className="koinonia-card koinonia-pricing-card">
                <div className="koinonia-price-badge">
                  <span className="koinonia-price-badge-label">{product.priceNote}</span>
                  <span className="koinonia-price-badge-value">{product.priceLabel}</span>
                </div>

                <h3>{product.title}</h3>
                <p>{product.body}</p>

                <ul>
                  {product.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                {"secondaryPrice" in product && product.secondaryPrice ? (
                  <p className="koinonia-copy"><strong>{product.secondaryPrice}</strong></p>
                ) : null}

                <div className="koinonia-actions">
                  <a className="koinonia-button secondary" href={`#${product.id}`}>
                    See everything included
                  </a>
                  <a className="koinonia-button primary" href="/contact#schedule-consultation">
                    {product.ctaLabel}
                  </a>
                </div>
              </article>
            ))}
          </div>
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

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">WHAT DO I ACTUALLY GET?</div>
            <h2 className="koinonia-heading">See the full standard scope behind each price.</h2>
            <p className="koinonia-copy">
              The short cards make the pricing easy to compare. The sections below explain what you hand us, what Koinonia handles, what is included, what may be separate, and where your Realtor responsibilities remain.
            </p>
          </div>

          <div style={{ display: "grid", gap: "2rem" }}>
            {servicesContent.details.map((detail) => (
              <article id={detail.id} key={detail.id} className="koinonia-card">
                <div className="koinonia-eyebrow">{detail.eyebrow}</div>
                <h2 className="koinonia-heading">{detail.title}</h2>
                <h3>{detail.headline}</h3>
                <p className="koinonia-copy">{detail.body}</p>

                <div className="koinonia-grid two">
                  <div>
                    <h3>What you hand us</h3>
                    <ul>
                      {detail.handUs.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>What Koinonia handles</h3>
                    <ul>
                      {detail.handles.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Included in the price</h3>
                    <ul>
                      {detail.included.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>What may be separate</h3>
                    <ul>
                      {detail.separate.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="koinonia-grid two">
                  <div>
                    <h3>What remains with you</h3>
                    <ul>
                      {detail.remains.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>{detail.exampleTitle}</h3>
                    <p>{detail.exampleBody}</p>
                  </div>
                </div>

                <div className="koinonia-actions">
                  <a className="koinonia-button primary" href="/contact#schedule-consultation">
                    {detail.ctaLabel}
                  </a>
                  <a className="koinonia-button secondary" href="#pricing">
                    Back to pricing
                  </a>
                </div>
              </article>
            ))}
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
