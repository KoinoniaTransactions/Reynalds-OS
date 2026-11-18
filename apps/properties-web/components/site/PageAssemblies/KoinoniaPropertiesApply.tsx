import { FAQ, FaqJsonLd, Footer, Hero, PropertiesInquiry, PropertiesNav, Section, UniversalCard } from "../index";

const applicationSteps = [
  {
    title: "Choose a home",
    body: "Start from an available listing so you know exactly which home you're applying for and what it requires.",
    items: ["Rent, deposit and move-in date", "Pet and occupancy details", "Written rental criteria"]
  },
  {
    title: "Apply",
    body: "Every applicant is screened against the same written criteria. The application fee is $35, limited to the actual cost of screening.",
    items: ["One application per adult", "Screening authorization", "Proof of income"]
  },
  {
    title: "Decision and lease",
    body: "We'll tell you the decision in writing, then walk you through lease signing and move-in.",
    items: ["Written decision", "Lease signing", "Move-in inspection"]
  }
];

const applyFaqs = [
  { q: "How much is the application fee?", a: "$35 per applicant, limited to the actual cost of screening, as Colorado law requires." },
  { q: "Can I use a screening report I already have?", a: "Yes. We accept portable tenant screening reports as Colorado law allows. Ask us how before you pay a new fee." },
  { q: "How do you decide?", a: "Every applicant is reviewed against the same written criteria, applied equally to everyone, in line with fair housing law." }
];

export function KoinoniaPropertiesApply() {
  return (
    <main className="koinonia-site">
      <FaqJsonLd items={applyFaqs} />
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Apply"
        title="Apply for a Koinonia rental home."
        lead="Pick an available home, review the criteria and apply. The application fee is $35, limited to the actual cost of screening."
        primaryLabel="Available Homes"
        primaryHref="/rentals"
        secondaryLabel="Resident Services"
        secondaryHref="/tenants"
        visualDesktopSrc="/assets/images/properties/heroes/rentals-hero.webp"
      />

      <Section eyebrow="How to Apply" title="Three steps to your new home.">
        <div className="koinonia-grid three">
          {applicationSteps.map((step, index) => (
            <UniversalCard key={step.title} eyebrow={`0${index + 1}`} title={step.title} body={step.body} items={step.items} />
          ))}
        </div>
      </Section>

      <FAQ items={applyFaqs} eyebrow="Applicant Questions" title="Before you apply." />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <p className="koinonia-copy">Equal Housing Opportunity. We do business in accordance with federal and Colorado fair housing law.</p>
        </div>
      </section>

      <PropertiesInquiry kind="tenant" />

      <Footer serviceLine="Koinonia Properties" supportLine="Rental applications" />
    </main>
  );
}
