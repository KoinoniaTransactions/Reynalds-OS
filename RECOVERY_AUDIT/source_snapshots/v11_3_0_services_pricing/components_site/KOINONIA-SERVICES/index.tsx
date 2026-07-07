import { FaqSection, KoinoniaFooter, PrimaryCta, PrimaryHero, TrustSection, UniversalContentCard } from "..";

const trustPillars = [
  {
    title: "Organized Processes",
    text: "Every file follows a structured workflow so deadlines, documents, and communication stay visible."
  },
  {
    title: "Proactive Communication",
    text: "You stay informed without needing to chase updates or wonder what is happening next."
  },
  {
    title: "Dependable Partnership",
    text: "Koinonia works as an extension of your real estate business, not as a disconnected vendor."
  },
  {
    title: "Detail-Driven Execution",
    text: "Important dates, paperwork, and follow-through are handled with consistency and care."
  }
];

const serviceCards = [
  {
    eyebrow: "Core Support",
    title: "Transaction Management",
    text: "Contract-to-close coordination that keeps the moving pieces organized after the agreement is signed.",
    benefits: ["Deadline and timeline tracking", "File and communication coordination", "Closing preparation support"]
  },
  {
    eyebrow: "Paperwork Support",
    title: "Contract Preparation & Writing",
    text: "Accurate paperwork support for offers, amendments, addenda, and supporting real estate documents.",
    benefits: ["Offer preparation", "Amendments and addenda", "Consistent document review"]
  },
  {
    eyebrow: "Field Support",
    title: "Licensed Showing Coverage",
    text: "Licensed showing support when your calendar is full, your clients need coverage, or timing conflicts arise.",
    benefits: ["Licensed showing assistance", "Schedule conflict coverage", "Showing feedback support"]
  },
  {
    eyebrow: "Business Support",
    title: "Business Operations Support",
    text: "Operational help for the follow-up, organization, and administrative work that keeps your business moving.",
    benefits: ["Administrative support", "Workflow organization", "Follow-up systems"]
  }
];

const processCards = [
  {
    eyebrow: "Step 1",
    title: "You send the details.",
    text: "Share the contract, request, showing need, or support scope so Koinonia can begin with the right information."
  },
  {
    eyebrow: "Step 2",
    title: "You stay focused on clients.",
    text: "While you serve your clients and grow your business, Koinonia helps keep the operational details moving."
  },
  {
    eyebrow: "Step 3",
    title: "You move forward with confidence.",
    text: "The work is tracked, communicated, and organized so you know what is happening and what comes next."
  }
];

const supportLevels = [
  {
    eyebrow: "Transaction Support",
    title: "Transaction Coordination Plus",
    text: "Best for Realtors who want dependable contract-to-close support on an active transaction.",
    benefits: ["Prepaid support model", "Core transaction management", "Organized deadline and file coordination"],
    actionLabel: "$389 prepaid",
    actionHref: "#contact"
  },
  {
    eyebrow: "Closing-Based Support",
    title: "Pay-at-Closing Coordination",
    text: "Best for Realtors who prefer to pay at successful closing while still receiving professional support.",
    benefits: ["No fee if the transaction does not close", "Contract-to-close coordination", "Billing aligned to the closing outcome"],
    actionLabel: "$599 at closing",
    actionHref: "#contact"
  },
  {
    eyebrow: "Ongoing Support",
    title: "Realtor Support Plus",
    text: "Best for agents and teams who need broader operational support beyond one transaction.",
    benefits: ["Custom support scope", "Business operations assistance", "Built around your workflow"],
    actionLabel: "Custom support",
    actionHref: "#contact"
  }
];

const faqs = [
  {
    question: "Can I use only the service I need?",
    answer: "Yes. Koinonia is designed to support the way you work. You can use transaction management, contract preparation, showing coverage, business support, or a combination of services."
  },
  {
    question: "When should I send a transaction or request?",
    answer: "The earlier the better. Once you have a signed contract, draft request, or showing need, send the details so the workflow can begin cleanly and quickly."
  },
  {
    question: "Will I still stay informed during the process?",
    answer: "Yes. Koinonia is built around clear communication and organized updates so you are not left wondering what is happening next."
  },
  {
    question: "How does billing work?",
    answer: "Koinonia offers prepaid transaction support, pay-at-closing support, and custom ongoing support depending on the level of help your business needs."
  },
  {
    question: "Is Koinonia replacing my role with the client?",
    answer: "No. Koinonia supports the operational side of the work so you can remain focused on the relationship, negotiation, service, and growth of your business."
  }
];

export function KoinoniaServicesPage() {
  return (
    <main className="koinonia-page-preview koinonia-services-page">
      <PrimaryHero
        eyebrow="Services & Pricing"
        headline="Support that keeps every transaction moving."
        supportingText="Choose the level of real estate operations support that fits your business, from transaction management and contract preparation to licensed showing coverage and ongoing business support."
        ctaLabel="Start the Conversation"
        ctaHref="#contact"
        visualTitle="Reliable support behind the scenes."
        visualText="A structured operating experience for deadlines, documents, showings, communication, and the details that keep real estate work moving."
      />

      <TrustSection pillars={trustPillars} />

      <section className="koinonia-section" id="services">
        <div className="koinonia-section-heading">
          <div className="koinonia-eyebrow">Our Services</div>
          <h2>Operational capabilities that support the way Realtors actually work.</h2>
          <p>
            Each service solves a different operational need while fitting into one organized support system for your real estate business.
          </p>
        </div>
        <div className="koinonia-card-grid four">
          {serviceCards.map((service) => (
            <UniversalContentCard key={service.title} {...service} />
          ))}
        </div>
      </section>

      <section className="koinonia-section" id="how-it-works">
        <div className="koinonia-section-heading">
          <div className="koinonia-eyebrow">How It Works</div>
          <h2>A simple process designed around your workflow.</h2>
          <p>
            Working with Koinonia should feel straightforward. You send the details, stay focused on your clients, and move forward with organized support behind the scenes.
          </p>
        </div>
        <div className="koinonia-card-grid three">
          {processCards.map((step) => (
            <UniversalContentCard key={step.title} {...step} />
          ))}
        </div>
      </section>

      <section className="koinonia-section" id="support-levels">
        <div className="koinonia-section-heading">
          <div className="koinonia-eyebrow">Support Levels</div>
          <h2>Choose the support that fits the way you work.</h2>
          <p>
            Pricing is presented as a support decision, not a commodity comparison. Start with the business need, then choose the right level of operational help.
          </p>
        </div>
        <div className="koinonia-card-grid three koinonia-support-grid">
          {supportLevels.map((level) => (
            <UniversalContentCard key={level.title} {...level} />
          ))}
        </div>
      </section>

      <FaqSection items={faqs} />

      <div id="contact">
        <PrimaryCta
          headline="Ready to simplify your next transaction?"
          text="Start the conversation when you are ready. Koinonia is built to make real estate support feel organized, calm, and easy to begin."
          ctaLabel="Start the Conversation"
          ctaHref="/contact"
        />
      </div>

      <KoinoniaFooter />
    </main>
  );
}
