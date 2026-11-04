import { Footer, Hero, PropertiesNav, UniversalCard } from "../index";
import { mailto } from "../../../config/contact.config";

const buyerSteps = [
  {
    title: "Start with Your Goals",
    body: "Tell us what matters to you in a home, your timing, and the questions you want answered."
  },
  {
    title: "Understand Your Options",
    body: "Discuss the purchase process, financing preparation, and a search approach tailored to your priorities."
  },
  {
    title: "Move Forward with Clarity",
    body: "When you are ready, talk through next steps and how representation would work."
  }
];

const sellerSteps = [
  {
    title: "Understand Your Property",
    body: "Start with your home's condition, your objectives, and your preferred timeline."
  },
  {
    title: "Review a Selling Strategy",
    body: "Discuss pricing considerations, preparation, marketing, and the steps involved in a sale."
  },
  {
    title: "Plan the Next Step",
    body: "Explore what professional representation would include before making a decision."
  }
];

export function KoinoniaPropertiesRealEstate() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Residential Real Estate"
        title="A thoughtful approach to buying and selling."
        lead="Buying or selling a home is a major decision. Start with your priorities, ask your questions, and understand the path ahead with Koinonia Properties."
        primaryLabel="Ask About Buying"
        primaryHref="#buy"
        secondaryLabel="Ask About Selling"
        secondaryHref="#sell"
      />

      <section className="koinonia-section" id="buy">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">For Buyers</div>
            <h2 className="koinonia-heading">Find a home that fits your next chapter.</h2>
            <p className="koinonia-copy">
              Every search begins differently. Whether you are buying for the first time,
              relocating, or considering a different home, the first step is understanding
              your needs and making a realistic plan.
            </p>
          </div>
          <div className="koinonia-grid three">
            {buyerSteps.map((step, index) => (
              <UniversalCard key={step.title} eyebrow={`0${index + 1}`} title={step.title} body={step.body} />
            ))}
          </div>
          <div className="koinonia-actions">
            <a className="koinonia-button primary" href={mailto("Koinonia Properties - Buying a Home Inquiry")}>
              Discuss Buying a Home
            </a>
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band" id="sell">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">For Sellers</div>
            <h2 className="koinonia-heading">A selling plan built around your priorities.</h2>
            <p className="koinonia-copy">
              The right approach begins with a clear picture of the home, your goals, and your
              timing. Learn what goes into preparing, positioning, and selling a property.
            </p>
          </div>
          <div className="koinonia-grid three">
            {sellerSteps.map((step, index) => (
              <UniversalCard key={step.title} eyebrow={`0${index + 1}`} title={step.title} body={step.body} />
            ))}
          </div>
          <div className="koinonia-actions">
            <a className="koinonia-button primary" href={mailto("Koinonia Properties - Selling a Home Inquiry")}>
              Discuss Selling a Home
            </a>
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-cta">
            <div className="koinonia-eyebrow">Looking to Keep a Property as a Rental?</div>
            <h2 className="koinonia-heading">Your property decisions do not end at the sale.</h2>
            <p className="koinonia-copy">
              If you are also considering renting out a home, explore Koinonia's separate property-management services.
            </p>
            <div className="koinonia-actions">
              <a className="koinonia-button secondary" href="/owners">Explore Property Management</a>
            </div>
          </div>
        </div>
      </section>

      <Footer serviceLine="Koinonia Properties" supportLine="Residential real estate" />
    </main>
  );
}
