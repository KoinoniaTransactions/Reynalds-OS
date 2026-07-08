import { homeContent } from "@/content/home";
import { CTA, Footer, Hero, TrustPillars, UniversalCard } from "../index";

export function KoinoniaHome() {
  return (
    <main className="koinonia-site">
      <Hero
        eyebrow={homeContent.hero.eyebrow}
        title={homeContent.hero.title}
        lead={homeContent.hero.lead}
        primaryLabel={homeContent.hero.primaryLabel}
        primaryHref={homeContent.hero.primaryHref}
        secondaryLabel={homeContent.hero.secondaryLabel}
        secondaryHref={homeContent.hero.secondaryHref}
      />

      <TrustPillars />

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">{homeContent.servicesIntro.eyebrow}</div>
            <h2 className="koinonia-heading">{homeContent.servicesIntro.title}</h2>
            <p className="koinonia-copy">{homeContent.servicesIntro.lead}</p>
          </div>

          <div className="koinonia-grid four">
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
        </div>
      </section>

      <CTA />
      <Footer />
    </main>
  );
}