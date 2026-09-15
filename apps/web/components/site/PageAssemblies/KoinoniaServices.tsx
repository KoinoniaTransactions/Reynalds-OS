import { servicesContent } from "@/content/services";
import { ServiceDetailDialog } from "../ServiceDetailDialog/ServiceDetailDialog";
import { CTA, FAQ, Footer, Header, Hero, UniversalCard } from "../index";
import styles from "./KoinoniaServices.module.css";

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

      <section className={`koinonia-section ${styles.breadthSection}`}>
        <div className="koinonia-container">
          <div className={`koinonia-section-header ${styles.narrowHeader}`}>
            <div className="koinonia-eyebrow">{servicesContent.breadth.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.breadth.title}</h2>
            <p className="koinonia-copy">{servicesContent.breadth.lead}</p>
          </div>
        </div>
      </section>

      <section className={`koinonia-section koinonia-band ${styles.capabilitiesSection}`}>
        <div className="koinonia-container">
          <div className={`koinonia-section-header ${styles.sectionHeaderLeft}`}>
            <div className="koinonia-eyebrow">{servicesContent.capabilities.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.capabilities.title}</h2>
            <p className="koinonia-copy">{servicesContent.capabilities.lead}</p>
          </div>

          <div className={`koinonia-grid three ${styles.capabilityGrid}`}>
            {servicesContent.capabilities.items.map((service, index) => (
              <UniversalCard
                key={service.title}
                eyebrow={`0${index + 1}`}
                title={service.title}
                body={service.body}
                items={service.items.slice(0, 3)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className={`koinonia-section ${styles.differentiationSection}`}>
        <div className="koinonia-container">
          <div className={`koinonia-section-header ${styles.sectionHeaderLeft}`}>
            <div className="koinonia-eyebrow">{servicesContent.differentiation.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.differentiation.title}</h2>
            <p className="koinonia-copy">{servicesContent.differentiation.lead}</p>
          </div>

          <div className={styles.differentiationPanel}>
            {servicesContent.differentiation.items.map((item, index) => (
              <div key={item.title} className={styles.differentiationItem}>
                <span className={styles.proofIndex}>0{index + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </div>
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
            {servicesContent.pricing.products.map((product) => {
              const detail = servicesContent.details.find((item) => item.id === product.id);
              const outcome = detail?.headline ?? product.body;
              const visibleItems = product.items.slice(0, 4);

              return (
                <article
                  key={product.id}
                  id={product.id}
                  className={`koinonia-card koinonia-pricing-card ${styles.pricingCard}`}
                >
                  <div className="koinonia-price-badge">
                    <span className="koinonia-price-badge-label">{product.priceNote}</span>
                    <span className="koinonia-price-badge-value">{product.priceLabel}</span>
                  </div>

                  <h3>{product.title}</h3>
                  <p className={styles.outcome}>{outcome}</p>

                  <ul className={styles.inclusionList}>
                    {visibleItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  {"secondaryPrice" in product && product.secondaryPrice ? (
                    <p className={`koinonia-copy ${styles.secondaryPrice}`}>
                      <strong>{product.secondaryPrice}</strong>
                    </p>
                  ) : null}

                  <div className={styles.actions}>
                    <a className="koinonia-button primary" href="/contact#schedule-consultation">
                      {product.ctaLabel}
                    </a>
                    {detail ? <ServiceDetailDialog detail={detail} quietTrigger /> : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`koinonia-section ${styles.comparisonSection}`}>
        <div className="koinonia-container">
          <div className={`koinonia-section-header ${styles.sectionHeaderLeft}`}>
            <div className="koinonia-eyebrow">{servicesContent.comparison.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.comparison.title}</h2>
            <p className="koinonia-copy">{servicesContent.comparison.lead}</p>
          </div>

          <div className={`koinonia-grid two ${styles.comparisonGrid}`}>
            {servicesContent.comparison.columns.map((column) => {
              const isPartnership = column.title === "Koinonia Partnership";

              return (
                <article
                  key={column.title}
                  className={`koinonia-card ${styles.comparisonCard} ${isPartnership ? styles.partnershipCard : ""}`}
                >
                  <div className="koinonia-price-badge">
                    <span className="koinonia-price-badge-label">Monthly</span>
                    <span className="koinonia-price-badge-value">{column.price}</span>
                  </div>
                  <h3>{column.title}</h3>
                  <p className={styles.bestFor}>{column.bestFor}</p>
                  <ul>
                    {column.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`koinonia-section koinonia-band ${styles.solutionsSection}`}>
        <div className="koinonia-container">
          <div className={`koinonia-section-header ${styles.sectionHeaderLeft}`}>
            <div className="koinonia-eyebrow">{servicesContent.popularSolutions.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.popularSolutions.title}</h2>
            <p className="koinonia-copy">{servicesContent.popularSolutions.lead}</p>
          </div>

          <div className={styles.solutionGrid}>
            {servicesContent.popularSolutions.items.map((item, index) => (
              <article key={item.title} className={styles.solutionItem}>
                <span className={styles.solutionIndex}>0{index + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`koinonia-section ${styles.outsideCostsSection}`}>
        <div className="koinonia-container">
          <div className={styles.outsideCostsCallout}>
            <div className="koinonia-eyebrow">{servicesContent.outsideCosts.eyebrow}</div>
            <h2>{servicesContent.outsideCosts.title}</h2>
            <p>{servicesContent.outsideCosts.lead}</p>
          </div>
        </div>
      </section>

      <section className={`koinonia-section ${styles.processSection}`}>
        <div className="koinonia-container">
          <div className={`koinonia-section-header ${styles.sectionHeaderLeft}`}>
            <div className="koinonia-eyebrow">{servicesContent.process.eyebrow}</div>
            <h2 className="koinonia-heading">{servicesContent.process.title}</h2>
            <p className="koinonia-copy">{servicesContent.process.lead}</p>
          </div>

          <div className={`koinonia-grid four ${styles.processGrid}`}>
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

      <section className={`koinonia-section ${styles.boundariesSection}`}>
        <div className="koinonia-container">
          <div className={styles.boundariesLayout}>
            <div className={styles.boundariesIntro}>
              <div className="koinonia-eyebrow">{servicesContent.boundaries.eyebrow}</div>
              <h2 className="koinonia-heading">{servicesContent.boundaries.title}</h2>
              <p className="koinonia-copy">{servicesContent.boundaries.lead}</p>
            </div>

            <div className={styles.boundaryList}>
              {servicesContent.boundaries.items.map((item) => (
                <div key={item.title} className={styles.boundaryItem}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
