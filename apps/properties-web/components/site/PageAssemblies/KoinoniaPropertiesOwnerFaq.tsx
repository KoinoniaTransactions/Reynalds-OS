import { FaqJsonLd, Footer, Hero, PropertiesNav, Section } from "../index";
import { businessHours, guarantee, payout, repairApproval, serviceArea } from "../../../config/business.config";

const groups = [
  {
    title: "Fees and contract",
    items: [
      { q: "How much does property management cost?", a: "10% of rent collected on our full-service plan, or 8% if you handle eligible non-urgent maintenance yourself. Tenant placement is 50% of one month's rent, and a lease renewal is $199." },
      { q: "What's the difference between the 10% and 8% plans?", a: "On Managed for You (10%), we coordinate vendors and routine repairs. On Managed With You (8%), you handle eligible non-urgent maintenance with qualified vendors, while we still take every request, decide how urgent it is and talk with the resident. Emergencies are always handled by us." },
      { q: "Is the fee charged on rent collected or rent due?", a: "Rent actually collected. If rent isn't collected, there's no management fee on it." },
      { q: "Do you charge when the home is vacant?", a: "No. There's no vacancy fee." },
      { q: "Is there a setup fee?", a: "No. Setup and onboarding are $0." },
      { q: "When is the placement fee charged?", a: "Only after an approved tenant signs the lease and moves in. No extra fee if an applicant withdraws or the home needs more showings." },
      { q: "Do you mark up repairs?", a: "Yes, 10% on vendor work we coordinate, on both plans, shown as its own line on your statement. There's no markup when you hire and pay a contractor yourself." },
      { q: "Can I cancel? Is there a termination fee?", a: "There's no termination penalty. Fees already earned and obligations in the agreement still apply." }
    ]
  },
  {
    title: "Leasing and tenants",
    items: [
      { q: "How do you set the rent?", a: "We start with a data-backed estimate for your address, then adjust for condition, features and current competition nearby. You approve the price before we list." },
      { q: "How do you screen tenants?", a: "Every applicant is screened against the same written criteria, applied equally, in line with fair housing law. We accept portable screening reports as Colorado requires." },
      { q: "What is the 12-month tenant guarantee?", a: `${guarantee.body} Excluded: ${guarantee.exclusions.join("; ")}.` },
      { q: "What does the applicant pay?", a: "The application fee is $35, limited to the actual cost of screening as Colorado law requires." }
    ]
  },
  {
    title: "Money and reporting",
    items: [
      { q: "When do I get paid?", a: payout.body },
      { q: "What will I see each month?", a: "A statement showing rent collected, fees, any repairs with the 10% coordination charge itemized, and your payout." },
      { q: "Can I earn a credit for referring another owner?", a: "Yes. Once the home you referred is placed, you receive a credit equal to one month of your management fee. Credits are not paid in cash." }
    ]
  },
  {
    title: "Maintenance and emergencies",
    items: [
      { q: "When do you need my approval for repairs?", a: repairApproval.body },
      { q: "Can I use my own vendors?", a: "Yes. On the 8% plan you can use your own qualified, insured vendors for eligible non-urgent work. Emergencies and legal repair deadlines are always handled by us." },
      { q: "How do you handle emergencies after hours?", a: "Residents call our main line any time. Emergencies get a call back within 1 hour, 24/7. Urgent issues get a written plan within 24 hours, 7 days a week. Routine requests are handled the next business day." },
      { q: "How often do you inspect?", a: "We inspect at move-in and move-out (included) and offer a mid-lease inspection for $99. You can request extra visits for $99 each." }
    ]
  },
  {
    title: "Getting started",
    items: [
      { q: "What areas do you serve?", a: `${serviceArea.summary} ${serviceArea.later}` },
      { q: "How fast will you get back to me?", a: `During business hours (${businessHours.label}), we reply with next steps within one hour.` },
      { q: "My home is listed and not selling. Can you help?", a: "Yes. We can lease and manage it until you're ready to sell, and we work with your listing agent. See our Home Not Selling page for the numbers." },
      { q: "Do you help with buying and selling too?", a: "Yes. Koinonia Properties offers residential real estate services alongside property management, so you can rent now and sell later with the same team." }
    ]
  }
];

const allItems = groups.flatMap((group) => group.items);

export function KoinoniaPropertiesOwnerFaq() {
  return (
    <main className="koinonia-site">
      <FaqJsonLd items={allItems} />
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Owner FAQ"
        title="Straight answers to the questions owners ask most."
        lead="Fees, guarantees, payouts, repairs and emergencies, all in one place. If your question isn't here, call or text us."
        primaryLabel="Free Rental Analysis"
        primaryHref="/rental-analysis"
        secondaryLabel="See Pricing"
        secondaryHref="/pricing"
        visualDesktopSrc="/assets/images/properties/heroes/owners-hero.webp"
      />

      {groups.map((group, index) => (
        <Section key={group.title} eyebrow="Owner Questions" title={group.title} band={index % 2 === 1}>
          <div className="koinonia-grid two">
            {group.items.map((item) => (
              <article className="koinonia-card" key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </Section>
      ))}

      <Section eyebrow="Still Have Questions?" title="Talk to a person, not a call center." band={groups.length % 2 === 1}>
        <div className="koinonia-actions">
          <a className="koinonia-button primary" href="/rental-analysis">Free Rental Analysis</a>
          <a className="koinonia-button secondary" href="/contact">Contact Us</a>
        </div>
      </Section>

      <Footer serviceLine="Koinonia Properties" supportLine="Owner questions" />
    </main>
  );
}
