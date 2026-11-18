import {
  CommitmentCards,
  FAQ,
  FaqJsonLd,
  Footer,
  Hero,
  PromiseStrip,
  PropertiesInquiry,
  PropertiesNav,
  Section,
  UniversalCard
} from "../index";
import { guarantee, payout, plans, referralCredit, repairApproval, responseStandard } from "../../../config/business.config";

const services = [
  {
    id: "leasing",
    title: "Tenant placement and leasing",
    body: "We price the home, market it, show it and screen every applicant against the same written criteria.",
    items: [
      "Rental analysis and pricing you approve",
      "Listing, advertising and showings",
      "Screening to written, fair housing–compliant criteria",
      "Colorado lease preparation and signing",
      "Move-in condition inspection with photos"
    ]
  },
  {
    id: "management",
    title: "Full-service management",
    body: "Day-to-day operation of the home after the lease is signed, so you don't get the late-night calls.",
    items: [
      "Rent collection and late-rent follow-up",
      "Resident communication and lease enforcement",
      "Renewals and rent reviews before the lease ends",
      "Security deposits handled under Colorado law",
      "Move-out inspection and turnover"
    ]
  },
  {
    id: "maintenance",
    title: "Maintenance and repairs",
    body: "Every request comes to us first. We decide how urgent it is, talk with the resident and follow it through.",
    items: [
      "24/7 emergency handling through our main line",
      "Routine repairs up to $250 without a call to you",
      "Emergency repairs capped at $1,000 before we reach you",
      "Qualified, insured vendors; 10% coordination charge itemized",
      "On the 8% plan, use your own vendors for eligible non-urgent work"
    ]
  },
  {
    id: "reporting",
    title: "Payouts and reporting",
    body: "You always know what came in, what went out and why.",
    items: [
      "Payouts on the 10th when rent is on time",
      "Monthly statements with every charge itemized",
      "Repair invoices and approvals kept on file",
      "Mid-lease inspections available for $99"
    ]
  },
  {
    id: "rent-or-sell",
    title: "Rent now, sell later",
    body: "Koinonia Properties also offers residential real estate services, so the home can move from rental to sale without changing teams.",
    items: [
      "Rent-versus-sell numbers for your address",
      "Help for listed homes that aren't selling",
      "We work with your listing agent, not around them"
    ]
  }
];

const steps = [
  { title: "Free rental analysis", body: "An instant estimate for your address, then a call to talk through price, timing and condition." },
  { title: "Agreement and onboarding", body: "No setup fee. We collect keys, HOA rules, warranties and utility details and assess the home." },
  { title: "Market and place", body: "Listing, showings, screening and lease signing, then a move-in inspection." },
  { title: "Manage and report", body: "Rent collection, maintenance to your approval limits, monthly statements and payouts on the 10th." }
];

const ownerFaqs = [
  { q: "How much does it cost?", a: "10% of rent collected for full service, or 8% if you handle eligible non-urgent maintenance yourself. Tenant placement is 50% of one month's rent. Renewals are $199. No setup, vacancy or termination fees." },
  { q: "When do you need my approval for repairs?", a: repairApproval.body },
  { q: "When do I get paid?", a: payout.body },
  { q: "What if the tenant leaves early?", a: `${guarantee.body}` },
  { q: "Do you reward referrals?", a: referralCredit.body }
];

export function KoinoniaPropertiesOwners() {
  return (
    <main className="koinonia-site">
      <FaqJsonLd items={ownerFaqs} />
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Rental Property Management for Owners"
        title="Everything your rental needs, from first showing to monthly payout."
        lead="Leasing, tenant screening, rent collection, maintenance and reporting for Front Range rental homes. Every fee is published, and you'll hear back within one hour during business hours."
        primaryLabel="Free Rental Analysis"
        primaryHref="/rental-analysis"
        secondaryLabel="See Pricing"
        secondaryHref="/pricing"
        visualDesktopSrc="/assets/images/properties/heroes/owners-hero.webp"
      />

      <PromiseStrip />

      <Section eyebrow="Plans" title="Choose how involved you want to be." lead="Same guarantee, payout schedule and response standard on both plans.">
        <div className="koinonia-grid two">
          {plans.map((plan) => (
            <UniversalCard key={plan.key} title={`${plan.name} — ${plan.rateLabel}`} body={plan.fits} items={plan.items} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Services" title="What we do for owners." band>
        <nav className="koinonia-actions" aria-label="Owner services on this page">
          {services.map((service) => (
            <a className="koinonia-button secondary" href={`#${service.id}`} key={service.id}>
              {service.title}
            </a>
          ))}
        </nav>
        <div className="koinonia-grid two">
          {services.map((service) => (
            <div id={service.id} key={service.id}>
              <UniversalCard title={service.title} body={service.body} items={service.items} />
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Our Commitments" title="Promises you can hold us to.">
        <CommitmentCards />
      </Section>

      <Section eyebrow="How It Works" title="Four steps to a managed rental." band>
        <div className="koinonia-grid four">
          {steps.map((step, index) => (
            <UniversalCard key={step.title} eyebrow={`0${index + 1}`} title={step.title} body={step.body} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Response" title="You won't have to chase us." lead={responseStandard.body}>
        <div className="koinonia-actions">
          <a className="koinonia-button secondary" href="/owner-faq">Read the Owner FAQ</a>
          <a className="koinonia-button secondary" href="/home-not-selling">Home not selling?</a>
        </div>
      </Section>

      <FAQ items={ownerFaqs} eyebrow="Owner Questions" title="Common questions from owners." />

      <PropertiesInquiry kind="owner" />

      <Footer serviceLine="Koinonia Properties" supportLine="Owner services" />
    </main>
  );
}
