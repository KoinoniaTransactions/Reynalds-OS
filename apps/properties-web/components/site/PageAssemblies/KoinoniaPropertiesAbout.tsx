import { Footer, Hero, PropertiesNav, Section, TeamGrid, UniversalCard } from "../index";
import { businessHours, serviceArea } from "../../../config/business.config";

const values = [
  {
    title: "Koinonia means fellowship",
    body: "It's a Greek word for partnership and shared life. We treat owners as partners and the people renting their homes as neighbors."
  },
  {
    title: "Everything in writing",
    body: "Every fee, guarantee and response time is published on this site and repeated in your agreement. No surprises on your statement."
  },
  {
    title: "Fast, honest answers",
    body: "Next steps within one hour during business hours, and straight numbers even when the answer isn't what you hoped."
  }
];

export function KoinoniaPropertiesAbout() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="About Koinonia Properties"
        title="A local property manager you can actually reach."
        lead={`Koinonia Properties manages rental homes and helps owners buy and sell across ${serviceArea.summary.replace(/^The /, "the ").replace(/\.$/, "")}.`}
        primaryLabel="Free Rental Analysis"
        primaryHref="/rental-analysis"
        secondaryLabel="Contact Us"
        secondaryHref="/contact"
        visualDesktopSrc="/assets/images/properties/heroes/contact-hero.webp"
      />

      <Section eyebrow="Our Values" title="Why owners choose Koinonia.">
        <div className="koinonia-grid three">
          {values.map((value, index) => (
            <UniversalCard key={value.title} eyebrow={`0${index + 1}`} title={value.title} body={value.body} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Our Team" title="The people who take care of your home." band>
        <TeamGrid />
      </Section>

      <Section eyebrow="Reach Us" title="When you call, you reach us.">
        <p className="koinonia-copy">
          Office hours are {businessHours.label}. Emergencies are handled any time through our main line.
        </p>
        <div className="koinonia-actions">
          <a className="koinonia-button primary" href="/contact">Contact Us</a>
          <a className="koinonia-button secondary" href="/service-areas">Service Areas</a>
        </div>
      </Section>

      <Footer serviceLine="Koinonia Properties" supportLine="About" />
    </main>
  );
}
