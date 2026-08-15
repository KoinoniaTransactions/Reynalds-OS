import { referralsContent } from "@/content/referrals";
import { FAQ, Footer, Header, Hero, UniversalCard } from "../index";

export function KoinoniaReferrals() {
  return (
    <main className="koinonia-site">
      <Header />

      <Hero
        eyebrow={referralsContent.hero.eyebrow}
        title={referralsContent.hero.title}
        lead={referralsContent.hero.lead}
        primaryLabel={referralsContent.hero.primaryLabel}
        primaryHref={referralsContent.hero.primaryHref}
        secondaryLabel={referralsContent.hero.secondaryLabel}
        secondaryHref={referralsContent.hero.secondaryHref}
      />

      <section className="koinonia-section koinonia-referrals-why">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{referralsContent.whyRefer.eyebrow}</div>
            <h2 className="koinonia-heading">{referralsContent.whyRefer.title}</h2>
            <p className="koinonia-copy">{referralsContent.whyRefer.lead}</p>
          </div>

          <article className="koinonia-card">
            <h3>The economic decision</h3>
            <p>{referralsContent.whyRefer.principle}</p>
          </article>

          <div className="koinonia-grid three">
            {referralsContent.whyRefer.cards.map((card) => (
              <UniversalCard key={card.title} title={card.title} body={card.body} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band koinonia-referrals-choice">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{referralsContent.choice.eyebrow}</div>
            <h2 className="koinonia-heading">{referralsContent.choice.title}</h2>
            <p className="koinonia-copy">{referralsContent.choice.lead}</p>
          </div>

          <div className="koinonia-grid two">
            {referralsContent.choice.cards.map((card) => (
              <UniversalCard
                key={card.title}
                title={card.title}
                body={card.body}
                items={card.items}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-referrals-program">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{referralsContent.program.eyebrow}</div>
            <h2 className="koinonia-heading">{referralsContent.program.title}</h2>
            <p className="koinonia-copy">{referralsContent.program.lead}</p>
          </div>

          <div className="koinonia-grid three">
            {referralsContent.program.steps.map((step, index) => (
              <UniversalCard
                key={step.title}
                eyebrow={`0${index + 1}`}
                title={step.title}
                body={step.body}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band koinonia-referrals-fit">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{referralsContent.fit.eyebrow}</div>
            <h2 className="koinonia-heading">{referralsContent.fit.title}</h2>
            <p className="koinonia-copy">{referralsContent.fit.lead}</p>
          </div>

          <div className="koinonia-grid three">
            {referralsContent.fit.cards.map((card) => (
              <UniversalCard key={card.title} title={card.title} body={card.body} />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-referrals-visibility">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{referralsContent.visibility.eyebrow}</div>
            <h2 className="koinonia-heading">{referralsContent.visibility.title}</h2>
            <p className="koinonia-copy">{referralsContent.visibility.lead}</p>
          </div>

          <article className="koinonia-card">
            <h3>Milestone-level updates</h3>
            <ul>
              {referralsContent.visibility.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="koinonia-section koinonia-band koinonia-referrals-economics">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{referralsContent.economics.eyebrow}</div>
            <h2 className="koinonia-heading">{referralsContent.economics.title}</h2>
            <p className="koinonia-copy">{referralsContent.economics.lead}</p>
          </div>

          <div className="koinonia-grid two">
            <article className="koinonia-card koinonia-pricing-card">
              <div className="koinonia-price-badge">
                <span className="koinonia-price-badge-label">Referral fee</span>
                <span className="koinonia-price-badge-value">{referralsContent.economics.referralRate}</span>
              </div>
              <h3>Partner referral benefit</h3>
              <p>{referralsContent.economics.referralLabel}</p>
            </article>

            <article className="koinonia-card koinonia-pricing-card">
              <div className="koinonia-price-badge">
                <span className="koinonia-price-badge-label">At successful closing</span>
                <span className="koinonia-price-badge-value">{referralsContent.economics.coordinationFee}</span>
              </div>
              <h3>Required transaction support</h3>
              <p>{referralsContent.economics.coordinationLabel}</p>
            </article>
          </div>

          <article className="koinonia-card">
            <h3>How the payout works</h3>
            <p>{referralsContent.economics.formula}</p>
            <ul>
              {referralsContent.economics.terms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="koinonia-section koinonia-referrals-trust">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">{referralsContent.trust.eyebrow}</div>
            <h2 className="koinonia-heading">{referralsContent.trust.title}</h2>
            <p className="koinonia-copy">{referralsContent.trust.lead}</p>
          </div>

          <div className="koinonia-grid three">
            {referralsContent.trust.cards.map((card) => (
              <UniversalCard key={card.title} title={card.title} body={card.body} />
            ))}
          </div>
        </div>
      </section>

      <FAQ
        eyebrow={referralsContent.faq.eyebrow}
        title={referralsContent.faq.title}
        items={referralsContent.faq.items}
      />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-cta">
            <div className="koinonia-eyebrow">Referral Partner Conversation</div>
            <h2 className="koinonia-heading">Have a client or lead you may want to refer?</h2>
            <p className="koinonia-copy">
              Start with the opportunity. We will confirm fit, brokerage requirements, referral terms, and the appropriate next step before any client handoff occurs.
            </p>
            <div className="koinonia-actions" style={{ justifyContent: "center" }}>
              <a className="koinonia-button primary" href="/contact#schedule-consultation">
                Ask About the 40% Referral Option
              </a>
              <a className="koinonia-button secondary" href="/services">
                Keep the Client? View Support
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
