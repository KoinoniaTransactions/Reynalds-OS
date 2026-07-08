import { homeContent } from "@/content/home";
import { CTA, Footer, Hero, Section, TrustPillars, UniversalCard } from "../index";

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

      <Section
        variant="band"
        eyebrow={homeContent.servicesIntro.eyebrow}
        title={homeContent.servicesIntro.title}
        lead={homeContent.servicesIntro.lead}
      >
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
      </Section>

      <CTA />
      <Footer />
    </main>
  );
}