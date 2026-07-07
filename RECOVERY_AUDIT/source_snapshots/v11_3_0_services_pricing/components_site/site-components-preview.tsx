import { PrimaryHero, TrustSection, UniversalContentCard, PrimaryCta, FaqSection, KoinoniaFooter } from ".";

const pillars = [
  { title: "Organized Processes", text: "Every transaction follows a structured workflow." },
  { title: "Proactive Communication", text: "Clear updates help everyone stay aligned." },
  { title: "Dependable Partnership", text: "Support works as an extension of the Realtor's business." },
  { title: "Detail-Driven Execution", text: "Deadlines, documents, and details are handled with care." }
];

const services = [
  { title: "Transaction Management", text: "Contract-to-close coordination that keeps every detail moving.", benefits: ["Deadlines", "Communication", "File organization"] },
  { title: "Contract Preparation & Writing", text: "Accurate contract paperwork prepared with speed and consistency.", benefits: ["Offers", "Amendments", "Supporting forms"] },
  { title: "Licensed Showing Coverage", text: "Flexible showing support when schedules conflict or coverage is needed.", benefits: ["Licensed coverage", "Feedback", "Schedule support"] },
  { title: "Business Support", text: "Operational help that supports the broader rhythm of a Realtor's business.", benefits: ["Admin help", "Systems", "Follow-up support"] }
];

const faqs = [
  { question: "Can I use only the services I need?", answer: "Yes. Koinonia is designed to support the way your business works rather than force every Realtor into the same package." },
  { question: "When do I send a transaction?", answer: "Send the signed contract as soon as possible so the workflow, deadlines, and communication can begin cleanly." }
];

export function SiteComponentsPreview() {
  return (
    <main className="koinonia-page-preview">
      <PrimaryHero
        eyebrow="Koinonia Website Components"
        headline="Reusable sections for a calmer real estate website."
        supportingText="This preview verifies the canonical public website components inside the real Reynalds OS repository."
        ctaLabel="Review Components"
        ctaHref="#components"
      />
      <TrustSection pillars={pillars} />
      <section id="components" className="koinonia-section">
        <div className="koinonia-section-heading">
          <div className="koinonia-eyebrow">MOD-004</div>
          <h2>Universal Content Cards</h2>
          <p>One reusable component supports services, support levels, features, process cards, team cards, and future variants.</p>
        </div>
        <div className="koinonia-card-grid four">
          {services.map((service) => <UniversalContentCard key={service.title} {...service} />)}
        </div>
      </section>
      <FaqSection items={faqs} />
      <PrimaryCta
        headline="Ready to simplify your next transaction?"
        text="Start the conversation when you are ready. Koinonia is built to make support feel organized, calm, and easy to begin."
        ctaLabel="Schedule a Consultation"
        ctaHref="/contact"
      />
      <KoinoniaFooter />
    </main>
  );
}
