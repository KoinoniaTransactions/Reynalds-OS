import { CTA, ContactActions, FAQ, Footer, Hero, UniversalCard } from "../index";
import { contactConfig, mailto } from "../../../config/contact.config";

const contactFaqs = [
  {
    question: "What should I include when I reach out?",
    answer: "Share the type of support you need, whether there is an active contract or deadline, and the best way to contact you. Koinonia will help identify the right next step."
  },
  {
    question: "Can I ask about more than one service?",
    answer: "Yes. Many Realtors need a mix of transaction management, contract preparation, showing coverage, or business support. The first conversation can clarify what fits your business."
  },
  {
    question: "Is reaching out a commitment?",
    answer: "No. The first step is simply a conversation to understand your needs and determine whether Koinonia is the right support partner."
  }
];

export function KoinoniaContact() {
  return (
    <main className="koinonia-site">
      <Hero
        eyebrow="Contact Koinonia"
        title="Start the conversation with confidence."
        lead="Whether you need support for an active transaction or want to build a more organized real estate workflow, Koinonia is ready to help you identify the right next step."
        primaryLabel="Email Koinonia"
        primaryHref={mailto(contactConfig.consultationSubject)}
        secondaryLabel="View Services"
        secondaryHref="/koinonia/services"
      />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">How to Reach Out</div>
            <h2 className="koinonia-heading">Choose the easiest way to start.</h2>
            <p className="koinonia-copy">
              Koinonia keeps the first step simple. Send a message with the support you need, and the conversation can move from there.
            </p>
          </div>
          <ContactActions />
          <div className="koinonia-contact-note">
            <strong>Response Time:</strong> {contactConfig.responseTime}<br />
            <strong>Availability:</strong> {contactConfig.businessHours}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">What Happens Next</div>
            <h2 className="koinonia-heading">A clear first step, then organized follow-through.</h2>
            <p className="koinonia-copy">
              The contact process should feel like the rest of Koinonia: calm, professional, and easy to understand.
            </p>
          </div>
          <div className="koinonia-grid three">
            <UniversalCard
              title="You reach out"
              body="Share the support you need, whether by phone, text, or email, along with any important dates, documents, or context."
            />
            <UniversalCard
              title="We clarify the fit"
              body="Koinonia reviews the need, confirms the right support path, and identifies any missing details."
            />
            <UniversalCard
              title="You know the next step"
              body="The conversation turns into a clear plan for transaction, contract, showing, or business support."
            />
          </div>
        </div>
      </section>

      <FAQ items={contactFaqs} eyebrow="Contact FAQ" title="Questions before you reach out." />
      <CTA />
      <Footer />
    </main>
  );
}
