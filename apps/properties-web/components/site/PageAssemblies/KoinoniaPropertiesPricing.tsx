import {
  FAQ,
  FaqJsonLd,
  FeeTable,
  FirstYearCostCalculator,
  Footer,
  Hero,
  PropertiesInquiry,
  PropertiesNav,
  Section,
  UniversalCard
} from "../index";
import { guarantee, included, plans, repairApproval } from "../../../config/business.config";

const pricingFaqs = [
  { q: "Is the fee charged on rent collected or rent due?", a: "Rent actually collected. No fee on rent that isn't collected." },
  { q: "When is the placement fee charged?", a: "Only after an approved tenant signs the lease and moves in." },
  { q: "Do you mark up repairs?", a: "Yes, 10% on vendor work we coordinate, itemized on every statement. No markup when you hire and pay a contractor yourself." },
  { q: "Are there any other fees?", a: "Major renovations or special projects are quoted separately and need your written approval first. Anything else is listed in the table on this page." }
];

export function KoinoniaPropertiesPricing() {
  return (
    <main className="koinonia-site">
      <FaqJsonLd items={pricingFaqs} />
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Pricing and Scope"
        title="Property management pricing, published in full."
        lead="10% full service or 8% if you handle eligible maintenance. No setup, vacancy or termination fees. Here is every charge, and when it applies."
        primaryLabel="Free Rental Analysis"
        primaryHref="/rental-analysis"
        secondaryLabel="Owner Services"
        secondaryHref="/owners"
        visualDesktopSrc="/assets/images/properties/heroes/pricing-hero.webp"
      />

      <Section eyebrow="Management Plans" title="Two ways to manage your rental.">
        <div className="koinonia-grid two">
          {plans.map((plan) => (
            <UniversalCard key={plan.key} title={`${plan.name} — ${plan.rateLabel}`} body={plan.fits} items={plan.items} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Fee Schedule" title="Every fee, in one table." band>
        <FeeTable />
      </Section>

      <Section eyebrow="Included" title="Included at no extra charge.">
        <ul className="properties-check-list">
          {included.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Estimate" title="See your first-year cost." lead="Enter your expected rent to compare both plans, including placement." band>
        <FirstYearCostCalculator />
      </Section>

      <Section eyebrow="Guarantee and Approvals" title="What protects you.">
        <div className="koinonia-grid two">
          <UniversalCard title={guarantee.headline} body={guarantee.body} items={guarantee.exclusions.map((item) => `Excludes: ${item}`)} />
          <UniversalCard title="Repair approval limits" body={repairApproval.body} />
        </div>
      </Section>

      <FAQ items={pricingFaqs} eyebrow="Pricing Questions" title="Common pricing questions." />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <p className="koinonia-copy">
            Fees are confirmed in your written management agreement. The applicant-paid application fee is limited to
            the actual cost of screening, as Colorado law requires.
          </p>
        </div>
      </section>

      <PropertiesInquiry kind="owner" />

      <Footer serviceLine="Koinonia Properties" supportLine="Pricing and scope" />
    </main>
  );
}
