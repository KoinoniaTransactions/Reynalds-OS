import { FAQ, FaqJsonLd, Footer, Hero, PropertiesInquiry, PropertiesNav, Section } from "../index";
import { agentProgram } from "../../../config/business.config";

const terms = [
  { term: "When the home is leased", detail: agentProgram.leaseFee },
  { term: "When your client is ready to sell", detail: agentProgram.saleChoice },
  { term: "If your client sells with us", detail: agentProgram.saleFallback },
  { term: "How long it lasts", detail: agentProgram.term },
  { term: "In writing", detail: agentProgram.agreement }
];

const commitments = [
  "We don't ask your client for the listing while we manage their home.",
  "We tell you when the lease is signed, renewed or ending, and if your client mentions selling.",
  "We share status updates only with your client's written permission, never rent amounts or tenant details.",
  "We never ask a client to break or cancel a listing agreement."
];

const faqs = [
  {
    q: "Why would I send my listing to a property manager?",
    a: "If the home isn't selling, your client may pull it or switch agents. Renting keeps them as your client: you're paid now, and you get the listing back when the market turns."
  },
  {
    q: "How much is the referral fee?",
    a: "One month of the management fee, paid to your brokerage after the first month's rent clears. If your client later sells with Koinonia within 24 months of the first lease, your brokerage receives 40% of our side of the commission."
  },
  {
    q: "Does my client have to use me when they sell?",
    a: "Your client always chooses their own agent. We recommend you in writing and connect you. If they choose Koinonia instead, you're still paid during the 24-month term."
  },
  {
    q: "How is the referral fee paid?",
    a: "Brokerage to brokerage, under a signed referral agreement, as Colorado requires. We can't pay an agent directly."
  },
  {
    q: "What if my listing agreement covers leasing?",
    a: "Some listing agreements pay the agent if the home is leased during the listing. We'll review it with you so fees don't overlap."
  }
];

export function KoinoniaPropertiesForAgents() {
  return (
    <main className="koinonia-site">
      <FaqJsonLd items={faqs} />
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="For Real Estate Agents"
        title="Listing not moving? Keep your client and get paid."
        lead="When a home sits, we lease and manage it while the market recovers. Your brokerage earns a referral fee, and when your client is ready to sell, we send them back to you."
        primaryLabel="Refer a Client"
        primaryHref="#agent-inquiry"
        secondaryLabel="Owner Pricing"
        secondaryHref="/pricing"
        visualDesktopSrc="/assets/images/properties/heroes/owners-hero.webp"
      />

      <Section eyebrow="The Program" title="What you get, in plain terms.">
        <div className="properties-table-wrap">
          <table className="properties-table">
            <caption className="properties-visually-hidden">Agent referral program terms</caption>
            <tbody>
              {terms.map((row) => (
                <tr key={row.term}>
                  <th scope="row">{row.term}</th>
                  <td style={{ whiteSpace: "normal", fontWeight: 400 }}>{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section eyebrow="Our Commitments" title="We're not here to take your client." band>
        <ul className="properties-check-list">
          {commitments.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section
        eyebrow="Show Your Client"
        title="A rent-or-sell plan they can see for themselves."
        lead="Send your client our calculator. It shows whether rent can cover their payment and explains how renting affects the home-sale tax exclusion."
      >
        <div className="koinonia-actions">
          <a className="koinonia-button secondary" href="/home-not-selling">Home Not Selling page</a>
        </div>
      </Section>

      <FAQ items={faqs} eyebrow="Agent Questions" title="Questions agents ask us." />

      <PropertiesInquiry kind="agent" />

      <Footer serviceLine="Koinonia Properties" supportLine="Agent referrals" />
    </main>
  );
}
