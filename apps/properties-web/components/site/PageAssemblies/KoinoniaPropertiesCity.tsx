import { FAQ, FaqJsonLd, Footer, Hero, PromiseStrip, PropertiesInquiry, PropertiesNav, Section, UniversalCard } from "../index";
import { cities } from "../../../config/cities.config";
import { plans } from "../../../config/business.config";
import { contactConfig } from "../../../config/contact.config";
import { absoluteUrl } from "../../../config/seo.config";

export function KoinoniaPropertiesCity({ slug }: { slug: string }) {
  const city = cities[slug];

  if (!city) {
    throw new Error(`Unknown city page: ${slug}`);
  }

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${city.name} Property Management`,
    serviceType: "Residential property management",
    url: absoluteUrl(`/property-management/${city.slug}`) ?? undefined,
    areaServed: { "@type": "City", name: `${city.name}, Colorado` },
    provider: {
      "@type": "Organization",
      name: contactConfig.businessName,
      telephone: contactConfig.phone.href.replace("tel:", "")
    }
  };

  return (
    <main className="koinonia-site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <FaqJsonLd items={city.faqs} />
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow={`${city.name} Property Management`}
        title={`${city.name} property management with every fee published.`}
        lead={city.intro}
        primaryLabel="Free Rental Analysis"
        primaryHref="/rental-analysis"
        secondaryLabel="See Pricing"
        secondaryHref="/pricing"
        visualDesktopSrc="/assets/images/properties/heroes/service-areas-hero.webp"
      />

      <PromiseStrip />

      <Section eyebrow={`${city.name} Market`} title={`What ${city.name} owners should know right now.`} band>
        <div className="koinonia-grid three">
          {city.market.map((item) => (
            <article className="koinonia-card" key={item.label}>
              <div className="koinonia-eyebrow">{item.label}</div>
              <h3>{item.value}</h3>
              {item.source ? (
                <p>
                  Source: <a href={item.source.url} rel="noopener" target="_blank">{item.source.name}</a>
                </p>
              ) : (
                <p>
                  <a href="/rental-analysis">Request a free rental analysis</a>
                </p>
              )}
            </article>
          ))}
        </div>
        <p className="properties-note">Figures are third-party estimates as of November 2026 and change over time.</p>
      </Section>

      <Section eyebrow="Neighborhoods" title={`Where ${city.name} rentals perform.`}>
        <div className="koinonia-grid two">
          {city.neighborhoods.map((area) => (
            <UniversalCard key={area.name} title={area.name} body={area.note} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Local Rules" title={`Renting a home in ${city.name}: the rules that apply.`} band>
        <div className="koinonia-grid three">
          {city.rules.map((rule) => (
            <article className="koinonia-card" key={rule.title}>
              <h3>{rule.title}</h3>
              <p>{rule.body}</p>
              {rule.source ? (
                <p>
                  Source: <a href={rule.source.url} rel="noopener" target="_blank">{rule.source.name}</a>
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Pricing" title="Two plans. Same promises.">
        <div className="koinonia-grid two">
          {plans.map((plan) => (
            <UniversalCard
              key={plan.key}
              title={`${plan.name} — ${plan.rateLabel}`}
              body={plan.fits}
              items={plan.items}
              actionLabel="Full fee schedule"
              actionHref="/pricing"
            />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Listed and Not Selling?"
        title={`Rent your ${city.name} home now and sell when the market turns.`}
        lead="See whether rent can cover your payment, keep your agent in the loop, and sell later."
        band
      >
        <div className="koinonia-actions">
          <a className="koinonia-button primary" href="/home-not-selling">Run the numbers</a>
          <a className="koinonia-button secondary" href="/for-agents">For listing agents</a>
        </div>
      </Section>

      <FAQ items={city.faqs} eyebrow={`${city.name} Questions`} title={`${city.name} property management questions.`} />

      <Section eyebrow="Nearby" title="We also serve nearby cities.">
        <p className="koinonia-copy">
          {city.nearby.join(" · ")} and the rest of the Front Range corridor. <a href="/service-areas">See all service areas</a>.
        </p>
      </Section>

      <PropertiesInquiry kind="rental" />

      <Footer serviceLine="Koinonia Properties" supportLine={`${city.name} property management`} />
    </main>
  );
}
