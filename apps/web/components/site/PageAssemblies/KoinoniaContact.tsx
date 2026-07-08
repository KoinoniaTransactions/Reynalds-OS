import { contactContent } from "@/content/contact";
import { CTA, ContactActions, FAQ, Footer, Hero, UniversalCard } from "../index";
import { contactConfig, mailto } from "../../../config/contact.config";

export function KoinoniaContact() {
  return (
    <main className="koinonia-site">
      <Hero
        eyebrow={contactContent.hero.eyebrow}
        title={contactContent.hero.title}
        lead={contactContent.hero.lead}
        primaryLabel={contactContent.hero.primaryLabel}
        primaryHref={mailto(contactConfig.consultationSubject)}
        secondaryLabel={contactContent.hero.secondaryLabel}
        secondaryHref={contactContent.hero.secondaryHref}
      />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">
              {contactContent.reachOut.eyebrow}
            </div>

            <h2 className="koinonia-heading">
              {contactContent.reachOut.title}
            </h2>

            <p className="koinonia-copy">
              {contactContent.reachOut.lead}
            </p>
          </div>

          <ContactActions />

          <div className="koinonia-contact-note">
            <strong>Response Time:</strong> {contactConfig.responseTime}
            <br />
            <strong>Availability:</strong> {contactConfig.businessHours}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">
              {contactContent.nextSteps.eyebrow}
            </div>

            <h2 className="koinonia-heading">
              {contactContent.nextSteps.title}
            </h2>

            <p className="koinonia-copy">
              {contactContent.nextSteps.lead}
            </p>
          </div>

          <div className="koinonia-grid three">
            {contactContent.nextSteps.cards.map((card) => (
              <UniversalCard
                key={card.title}
                title={card.title}
                body={card.body}
              />
            ))}
          </div>
        </div>
      </section>

      <FAQ
        eyebrow={contactContent.faq.eyebrow}
        title={contactContent.faq.title}
        items={contactContent.faq.items}
      />

      <CTA />
      <Footer />
    </main>
  );
}