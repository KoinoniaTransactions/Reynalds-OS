import { contactContent } from "@/content/contact";
import { CTA, ContactActions, FAQ, Footer, Header, Hero, UniversalCard } from "../index";
import { contactConfig, mailto } from "../../../config/contact.config";

export function KoinoniaContact() {
  return (
    <main className="koinonia-site">
      <Header />

      <Hero
        eyebrow={contactContent.hero.eyebrow}
        title={contactContent.hero.title}
        lead={contactContent.hero.lead}
        primaryLabel={contactContent.hero.primaryLabel}
        primaryHref={mailto(contactConfig.consultationSubject)}
        secondaryLabel={contactContent.hero.secondaryLabel}
        secondaryHref={contactContent.hero.secondaryHref}
        visualDesktopSrc="/assets/images/koinonia/contact/contact-hero-desktop.png"
        visualMobileSrc="/assets/images/koinonia/contact/contact-hero-mobile.png"
        variant="fullBleed"
      />

      <section className="koinonia-section koinonia-contact-reach">
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

          <div className="koinonia-contact-detail-grid">
            <div className="koinonia-contact-note">
              <strong>Response Time:</strong> {contactConfig.responseTime}
              <br />
              <strong>Availability:</strong> {contactConfig.businessHours}
            </div>

            <article className="koinonia-contact-helpful">
              <h3>{contactContent.reachOut.noteTitle}</h3>

              <ul>
                {contactContent.reachOut.noteItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band koinonia-contact-support">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">
              {contactContent.supportOptions.eyebrow}
            </div>

            <h2 className="koinonia-heading">
              {contactContent.supportOptions.title}
            </h2>

            <p className="koinonia-copy">
              {contactContent.supportOptions.lead}
            </p>
          </div>

          <div className="koinonia-grid four">
            {contactContent.supportOptions.cards.map((card, index) => (
              <UniversalCard
                key={card.title}
                eyebrow={`0${index + 1}`}
                title={card.title}
                body={card.body}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-contact-next">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
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
            {contactContent.nextSteps.cards.map((card, index) => (
              <UniversalCard
                key={card.title}
                eyebrow={`0${index + 1}`}
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
