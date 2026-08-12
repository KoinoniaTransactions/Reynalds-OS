import {
  Footer,
  Hero,
  PropertiesNav,
  PropertiesSeoContent,
  UniversalCard
} from "../index";
import { mailto } from "../../../config/contact.config";

const contactPaths = [
  {
    title: "Property Owners",
    body: "Start with a rental analysis when you want to discuss a rental property, management needs, service scope, or timing.",
    items: [
      "Rental analysis",
      "Owner questions",
      "Management scope"
    ],
    actionLabel: "Request Rental Analysis",
    actionHref: "/rental-analysis"
  },
  {
    title: "Rental and Tenant Questions",
    body: "Use the tenant and rental pages for availability, application guidance, resident questions, and account-access direction.",
    items: [
      "Rental availability",
      "Application guidance",
      "Resident support"
    ],
    actionLabel: "Tenant Services",
    actionHref: "/tenants"
  },
  {
    title: "Maintenance",
    body: "Use the maintenance page for routine issue guidance, information to prepare, and the appropriate next step.",
    items: [
      "Routine issues",
      "Property details",
      "Maintenance questions"
    ],
    actionLabel: "Maintenance Guidance",
    actionHref: "/maintenance"
  },
  {
    title: "Vendors",
    body: "Service providers can review vendor expectations and use the vendor inquiry path for company, trade, and coverage information.",
    items: [
      "Vendor inquiry",
      "Trade information",
      "Service area"
    ],
    actionLabel: "Vendor Information",
    actionHref: "/vendors"
  }
];

export function KoinoniaPropertiesContact() {
  const generalInquiry =
    mailto("Koinonia Properties General Inquiry");

  return (
    <main className="koinonia-site">
      <PropertiesNav />

      <Hero
        visualVariant="properties"
        eyebrow="Contact"
        title="Start with the property or the question you need help with."
        lead="Koinonia Properties keeps owner, resident, maintenance, vendor, and rental inquiries inside the Properties website so you can reach the right next step clearly."
        primaryLabel="Email Koinonia Properties"
        primaryHref={generalInquiry}
        secondaryLabel="Request Rental Analysis"
        secondaryHref="/rental-analysis"
      />

      <PropertiesSeoContent variant="contact" />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">
              How Can We Help?
            </div>
            <h2 className="koinonia-heading">
              Choose the path that best matches your question.
            </h2>
            <p className="koinonia-copy">
              You stay within Koinonia Properties for public
              information and inquiry routing. Private account
              information should only be shared through the secure
              instructions provided for your property.
            </p>
          </div>

          <div className="koinonia-grid four">
            {contactPaths.map((path) => (
              <UniversalCard
                key={path.title}
                title={path.title}
                body={path.body}
                items={path.items}
                actionLabel={path.actionLabel}
                actionHref={path.actionHref}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-split">
            <div>
              <div className="koinonia-eyebrow">
                General Inquiry
              </div>
              <h2 className="koinonia-heading">
                Not sure which path fits?
              </h2>
              <p>
                Send a general Koinonia Properties inquiry with
                your name, the property address when applicable,
                and a short description of what you need.
              </p>
            </div>

            <div className="koinonia-inquiry-card">
              <h3>Helpful first details</h3>
              <ul>
                <li>Your name and best contact information</li>
                <li>Property address, when applicable</li>
                <li>Owner, tenant, rental, maintenance, or vendor question</li>
                <li>A short description of the next step you need</li>
              </ul>

              <div className="koinonia-actions">
                <a
                  className="koinonia-button primary"
                  href={generalInquiry}
                >
                  Email Koinonia Properties
                </a>
              </div>

              <p>
                Please do not email payment credentials,
                government identification numbers, banking
                information, or other sensitive account data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer
        serviceLine="Koinonia Properties"
        supportLine="Contact"
      />
    </main>
  );
}
