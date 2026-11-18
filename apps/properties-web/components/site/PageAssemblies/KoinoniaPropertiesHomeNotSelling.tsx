import { FAQ, FaqJsonLd, Footer, Hero, MortgageCoverageCalculator, PropertiesInquiry, PropertiesNav, Section, UniversalCard } from "../index";

const options = [
  {
    title: "Cut the price",
    body: "Sell now, but take less than you hoped and possibly bring money to closing."
  },
  {
    title: "Keep waiting",
    body: "Carry the full payment, utilities and upkeep on a home no one is living in."
  },
  {
    title: "Rent now, sell later",
    body: "Let a tenant help cover the payment while the market recovers, then sell on your timing."
  }
];

const steps = [
  { title: "Run the numbers", body: "Use the calculator below or request a free rental analysis for your address." },
  { title: "Talk to your agent", body: "We'll pay your listing agent's brokerage a referral fee if you lease with us, so they're part of the plan from the start." },
  { title: "Get the home rent-ready", body: "We'll tell you what renters in your area expect and what can wait." },
  { title: "Lease and manage", body: "Marketing, screening, lease, rent collection, maintenance and monthly statements, with a 12-month tenant guarantee." },
  { title: "Sell when you're ready", body: "We steer you back to your original agent. If you'd rather sell with us, your agent is still paid a referral fee for 24 months." }
];

const faqs = [
  {
    q: "Will I lose my capital gains tax break if I rent my home?",
    a: "Not right away. The IRS home-sale exclusion generally requires that you owned the home and lived in it for 2 of the 5 years before the sale. If you've lived there at least 2 years, you may have up to about 3 years of renting before the exclusion is lost. Depreciation taken while renting is taxed when you sell. Confirm your situation with a tax professional."
  },
  {
    q: "Do I have to cancel my listing to rent the home?",
    a: "Talk with your listing agent first. Your listing agreement sets the rules, and we never ask anyone to break one. Many owners rent once their listing ends, or with their agent's agreement."
  },
  {
    q: "What if rent doesn't cover my whole payment?",
    a: "Then renting costs you something each month, and we'll show you exactly how much. For many owners a smaller monthly shortfall still beats a large price cut or carrying a vacant home. You decide with the real numbers in front of you."
  },
  {
    q: "What happens to my agent?",
    a: "We pay their brokerage a referral fee once the first month's rent clears. When you're ready to sell, we steer you back to them. If you choose to sell with Koinonia within 24 months of the first lease, your agent's brokerage still receives 40% of our commission."
  },
  {
    q: "How long does a lease have to be?",
    a: "Most leases run 12 months. We can match the lease end to the season you'd like to sell in, so the home is ready to list when you are."
  }
];

export function KoinoniaPropertiesHomeNotSelling() {
  return (
    <main className="koinonia-site">
      <FaqJsonLd items={faqs} />
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Home Not Selling?"
        title="Rent it now. Sell when the market comes back."
        lead="If your home has been on the market a while, renting it can help cover your payment until it's a better time to sell. We work with your current agent, and when you're ready to sell, we'll send you back to them."
        primaryLabel="Run the Numbers"
        primaryHref="#calculator"
        secondaryLabel="Get a Rent Estimate"
        secondaryHref="/rental-analysis"
        visualDesktopSrc="/assets/images/properties/heroes/home-hero.webp"
      />

      <Section eyebrow="Your Options" title="When a home sits, owners usually have three choices.">
        <div className="koinonia-grid three">
          {options.map((option, index) => (
            <UniversalCard key={option.title} eyebrow={`0${index + 1}`} title={option.title} body={option.body} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Calculator"
        title="Can rent cover my mortgage?"
        lead="Enter your numbers. We'll show the monthly surplus or shortfall on either management plan."
        band
        id="calculator"
      >
        <MortgageCoverageCalculator />
      </Section>

      <Section
        eyebrow="Taxes"
        title="Renting for a while doesn't have to cost you the home-sale tax break."
        lead="The IRS exclusion on home-sale gains generally requires that you lived in the home 2 of the 5 years before you sell. If you've lived there at least 2 years, you may be able to rent for up to about 3 years and still qualify. Depreciation taken while renting is taxed at sale."
      >
        <p className="properties-note">
          Source: <a href="https://www.irs.gov/faqs/capital-gains-losses-and-sale-of-home/property-basis-sale-of-home-etc/property-basis-sale-of-home-etc-5" rel="noopener" target="_blank">IRS, sale of home FAQ</a>. This is general information, not tax advice. Check with your tax professional.
        </p>
      </Section>

      <Section eyebrow="How It Works" title="From listed to leased, without leaving your agent behind." band>
        <ol className="properties-steps">
          {steps.map((step) => (
            <li key={step.title}>
              <strong>{step.title}</strong>
              {step.body}
            </li>
          ))}
        </ol>
      </Section>

      <FAQ items={faqs} eyebrow="Questions" title="What owners ask before renting instead of selling." />

      <PropertiesInquiry kind="listed" />

      <Footer serviceLine="Koinonia Properties" supportLine="Rent now, sell later" />
    </main>
  );
}
