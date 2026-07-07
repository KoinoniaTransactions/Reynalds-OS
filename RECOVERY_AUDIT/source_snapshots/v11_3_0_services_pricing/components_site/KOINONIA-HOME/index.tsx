import { KoinoniaFooter, PrimaryCta, PrimaryHero, TrustSection, UniversalContentCard } from "..";

const trustPillars = [
  {
    title: "Organized Processes",
    text: "Every transaction follows a clear workflow so deadlines, documents, and communication stay on track."
  },
  {
    title: "Proactive Communication",
    text: "You stay informed without needing to chase updates or wonder what is happening next."
  },
  {
    title: "Dependable Partnership",
    text: "Koinonia works as an extension of your business, not as a disconnected vendor."
  },
  {
    title: "Detail-Driven Execution",
    text: "The small details receive the same care as the major milestones."
  }
];

const serviceCards = [
  {
    eyebrow: "Core Support",
    title: "Transaction Management",
    text: "Contract-to-close coordination that keeps every detail moving while you stay focused on your clients.",
    benefits: ["Deadline tracking", "File coordination", "Communication support"],
    actionLabel: "Explore transaction support",
    actionHref: "/koinonia/services"
  },
  {
    eyebrow: "Paperwork Support",
    title: "Contract Preparation & Writing",
    text: "Accurate real estate paperwork prepared with speed, consistency, and attention to detail.",
    benefits: ["Offers", "Amendments", "Supporting forms"],
    actionLabel: "Review drafting support",
    actionHref: "/koinonia/services"
  },
  {
    eyebrow: "Field Support",
    title: "Licensed Showing Coverage",
    text: "Flexible licensed coverage when your schedule is full or another appointment conflicts.",
    benefits: ["Licensed showings", "Schedule coverage", "Showing feedback"],
    actionLabel: "See showing coverage",
    actionHref: "/koinonia/services"
  },
  {
    eyebrow: "Business Support",
    title: "Business Operations Support",
    text: "Ongoing operational support for the moving pieces that keep a real estate business running smoothly.",
    benefits: ["Admin support", "Systems help", "Follow-up workflows"],
    actionLabel: "View business support",
    actionHref: "/koinonia/services"
  }
];

const operatingCards = [
  {
    eyebrow: "Calm",
    title: "Less mental load",
    text: "Koinonia helps reduce the number of details you have to personally track across each transaction."
  },
  {
    eyebrow: "Clear",
    title: "Better visibility",
    text: "The work is organized so the next step is easier to understand, communicate, and complete."
  },
  {
    eyebrow: "Consistent",
    title: "A repeatable process",
    text: "Each engagement follows a structured operating rhythm that supports quality and reliability."
  }
];

export function KoinoniaHomePage() {
  return (
    <main className="koinonia-page-preview koinonia-public-home">
      <PrimaryHero
        eyebrow="Real Estate Operations Support"
        headline="Support that keeps your transactions moving."
        supportingText="Koinonia helps Realtors stay focused on clients while providing organized transaction management, contract preparation, licensed showing coverage, and business support behind the scenes."
        ctaLabel="Explore Services"
        ctaHref="/koinonia/services"
        visualTitle="A calmer way to manage the moving pieces."
        visualText="Structured support for deadlines, documents, communication, and the operational details that keep real estate business moving."
      />

      <TrustSection pillars={trustPillars} />

      <section className="koinonia-section" id="services-preview">
        <div className="koinonia-section-heading">
          <div className="koinonia-eyebrow">More Than Transaction Coordination</div>
          <h2>Operational support designed around the way Realtors actually work.</h2>
          <p>
            Choose the level of help that fits your business. Each service is designed to work together as part of one organized support system.
          </p>
        </div>
        <div className="koinonia-card-grid four">
          {serviceCards.map((service) => (
            <UniversalContentCard key={service.title} {...service} />
          ))}
        </div>
      </section>

      <section className="koinonia-section" aria-labelledby="home-operating-experience">
        <div className="koinonia-section-heading">
          <div className="koinonia-eyebrow">The Koinonia Experience</div>
          <h2 id="home-operating-experience">The website should feel like the service: organized, calm, and easy to follow.</h2>
          <p>
            Koinonia is built to demonstrate reliability before the first conversation. The same clarity you see here is the standard for how the work is handled.
          </p>
        </div>
        <div className="koinonia-card-grid three">
          {operatingCards.map((card) => (
            <UniversalContentCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <PrimaryCta
        headline="Ready to simplify your next transaction?"
        text="Start the conversation when you are ready. Koinonia is built to make real estate support feel organized, calm, and easy to begin."
        ctaLabel="Start the Conversation"
        ctaHref="/contact"
      />
      <KoinoniaFooter />
    </main>
  );
}
