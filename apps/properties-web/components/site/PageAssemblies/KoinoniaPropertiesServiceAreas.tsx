import { Footer, Hero, PropertiesInquiry, PropertiesNav, Section, UniversalCard } from "../index";
import { cities } from "../../../config/cities.config";
import { serviceArea } from "../../../config/business.config";

export function KoinoniaPropertiesServiceAreas() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Service Areas"
        title="Property management across the Front Range."
        lead={`${serviceArea.summary} We're starting with Castle Rock and Parker.`}
        primaryLabel="Free Rental Analysis"
        primaryHref="/rental-analysis"
        secondaryLabel="Castle Rock"
        secondaryHref="/property-management/castle-rock"
        visualDesktopSrc="/assets/images/properties/heroes/service-areas-hero.webp"
      />

      <Section eyebrow="Featured Cities" title="Where we're focused first.">
        <div className="koinonia-grid two">
          {Object.values(cities).map((city) => (
            <UniversalCard
              key={city.slug}
              title={`${city.name} property management`}
              body={city.intro}
              actionLabel={`${city.name} details`}
              actionHref={`/property-management/${city.slug}`}
            />
          ))}
        </div>
      </Section>

      <Section eyebrow="Coverage" title="Cities we serve." lead={serviceArea.later} band>
        <div className="properties-area-grid">
          {serviceArea.regions.map((region) => (
            <article className="koinonia-card" key={region.name}>
              <h3>{region.name}</h3>
              <ul className="properties-check-list">
                {region.cities.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Not Sure?" title="Don't see your city?" lead="Send the address. If it's within the corridor, we'll confirm coverage and send next steps within one business hour.">
        <div className="koinonia-actions">
          <a className="koinonia-button primary" href="/rental-analysis">Free Rental Analysis</a>
          <a className="koinonia-button secondary" href="/contact">Contact Us</a>
        </div>
      </Section>

      <PropertiesInquiry kind="owner" />

      <Footer serviceLine="Koinonia Properties" supportLine="Service areas" />
    </main>
  );
}
