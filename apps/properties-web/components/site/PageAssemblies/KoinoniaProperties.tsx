import { FAQ, FaqJsonLd, Footer, Hero, PromiseStrip, PropertiesNav, Section, UniversalCard } from "../index";
import { contactConfig } from "../../../config/contact.config";
import { absoluteUrl } from "../../../config/seo.config";
import { included, plans, serviceArea } from "../../../config/business.config";

const doors = [
  {
    title: "Rent out my home",
    body: "Full-service management with every fee published. Start with a free rent estimate for your address.",
    actionLabel: "Owner Services",
    actionHref: "/owners"
  },
  {
    title: "My home isn't selling",
    body: "Rent it now and sell when the market turns. See if rent can cover your payment.",
    actionLabel: "Run the Numbers",
    actionHref: "/home-not-selling"
  },
  {
    title: "I'm a real estate agent",
    body: "Keep your client and get paid. We send them back to you when they're ready to sell.",
    actionLabel: "Agent Program",
    actionHref: "/for-agents"
  },
  {
    title: "Find a rental",
    body: "See available homes, rental criteria and the $35 application, limited to actual screening cost.",
    actionLabel: "Available Homes",
    actionHref: "/rentals"
  },
  {
    title: "I'm a resident",
    body: "Pay rent, request maintenance, and know exactly what to do in an emergency.",
    actionLabel: "Resident Services",
    actionHref: "/tenants"
  }
];

const steps = [
  { title: "Free rental analysis", body: "Enter your address for an instant estimate, then talk through the numbers with us." },
  { title: "Sign and onboard", body: "No setup fee. We collect keys, HOA rules, warranties and utility details and assess the home." },
  { title: "Market, screen and lease", body: "Listing, showings, screening to written criteria, lease signing and a move-in inspection." },
  { title: "Get paid and stay informed", body: "Rent collection, payouts on the 10th, monthly statements and maintenance handled to your approval limits." }
];

const homeFaqs = [
  { q: "How much does property management cost?", a: "10% of rent collected for full service, or 8% if you handle eligible non-urgent maintenance yourself. Tenant placement is 50% of one month's rent and renewals are $199. No setup, vacancy or termination fees." },
  { q: "What is the 12-month tenant guarantee?", a: "If a tenant we place breaks the lease or is evicted in the first 12 months, we re-place the home with no placement fee while it's under our management. Owner-caused departures and lawful tenant termination rights are excluded." },
  { q: "When do owners get paid?", a: "On the 10th of each month when rent is on time. If rent is late, 5 business days after we receive it." },
  { q: "How fast do you respond?", a: "During business hours (Monday–Friday, 8–5 Mountain), we reply with next steps within one hour and start work the same or next business day. Emergencies are handled any time." },
  { q: "What areas do you serve?", a: "The Front Range corridor from Boulder south to Fountain, east to Aurora, and the major west-side cities, starting with Castle Rock and Parker. Pueblo is planned for later." }
];

const organizationUrl = absoluteUrl("/");
const organizationId = organizationUrl ? `${organizationUrl}#organization` : undefined;

const propertiesOrganizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": organizationId,
  name: contactConfig.businessName,
  url: organizationUrl ?? undefined,
  logo: absoluteUrl("/icon.svg") ?? undefined,
  email: contactConfig.email,
  telephone: contactConfig.phone.href.replace("tel:", ""),
  areaServed: serviceArea.regions.flatMap((region) => region.cities).map((name) => ({ "@type": "City", name: `${name}, Colorado` })),
  openingHours: "Mo-Fr 08:00-17:00"
};

const propertiesServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Rental Property Management",
  url: organizationUrl ?? undefined,
  description:
    "Front Range rental property management with published fees: 10% full service or 8% owner-involved, a 12-month tenant guarantee, payouts on the 10th and next steps within one hour during business hours.",
  serviceType: "Rental property management",
  provider: organizationId
    ? {
        "@type": "Organization",
        "@id": organizationId,
        name: contactConfig.businessName
      }
    : {
        "@type": "Organization",
        name: contactConfig.businessName
      },
  audience: [
    {
      "@type": "Audience",
      audienceType: "Rental property owners and real estate investors"
    },
    {
      "@type": "Audience",
      audienceType: "Residents and rental applicants"
    }
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Koinonia Properties property management services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Rental analysis and leasing support"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Tenant screening coordination and lease administration"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Rent collection coordination and owner communication"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Maintenance and vendor coordination"
        }
      }
    ]
  }
};

export function KoinoniaProperties() {
  return (
    <main className="koinonia-site">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertiesOrganizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertiesServiceJsonLd) }}
      />
      <FaqJsonLd items={homeFaqs} />

      <PropertiesNav />

      <Hero
        visualVariant="properties"
        eyebrow="Front Range Property Management"
        title="Property management with every fee published."
        lead="Koinonia Properties leases and manages rental homes from Boulder to Fountain, starting in Castle Rock and Parker. Clear pricing, a 12-month tenant guarantee, payouts on the 10th, and a reply within one hour during business hours."
        primaryLabel="Free Rental Analysis"
        primaryHref="/rental-analysis"
        secondaryLabel="See Pricing"
        secondaryHref="/pricing"
        visualDesktopSrc="/assets/images/properties/heroes/home-hero.webp"
        visualAlt="Bright, well-cared-for residential interior with a property management workspace for Koinonia Properties"
      />

      <PromiseStrip />

      <Section eyebrow="Start Here" title="What brings you here today?">
        <div className="koinonia-grid three properties-audience-grid">
          {doors.map((door) => (
            <UniversalCard
              key={door.title}
              title={door.title}
              body={door.body}
              actionLabel={door.actionLabel}
              actionHref={door.actionHref}
            />
          ))}
        </div>
      </Section>

      <Section eyebrow="Pricing" title="Two simple plans." lead="Both plans include the same guarantee, payout schedule and response standard." band>
        <div className="koinonia-grid two">
          {plans.map((plan) => (
            <UniversalCard
              key={plan.key}
              title={`${plan.name} — ${plan.rateLabel}`}
              body={plan.fits}
              items={plan.items}
            />
          ))}
        </div>
        <div className="koinonia-actions">
          <a className="koinonia-button secondary" href="/pricing">Full fee schedule</a>
        </div>
      </Section>

      <Section eyebrow="Included" title="What every owner gets at no extra charge.">
        <ul className="properties-check-list">
          {included.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="koinonia-actions">
          <a className="koinonia-button secondary" href="/owners">See all owner services</a>
        </div>
      </Section>

      <Section eyebrow="How It Works" title="From first call to first payout." band>
        <div className="koinonia-grid four">
          {steps.map((step, index) => (
            <UniversalCard key={step.title} eyebrow={`0${index + 1}`} title={step.title} body={step.body} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Service Area" title="Serving the Front Range corridor." lead={`${serviceArea.summary} ${serviceArea.later}`}>
        <div className="koinonia-actions">
          <a className="koinonia-button secondary" href="/property-management/castle-rock">Castle Rock</a>
          <a className="koinonia-button secondary" href="/property-management/parker">Parker</a>
          <a className="koinonia-button secondary" href="/service-areas">All service areas</a>
        </div>
      </Section>

      <FAQ items={homeFaqs} eyebrow="Owner Questions" title="Quick answers before you call." />

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-cta">
            <div className="koinonia-eyebrow">Free Rental Analysis</div>
            <h2 className="koinonia-heading">Find out what your home will rent for.</h2>
            <p className="koinonia-copy">
              Enter your address for an instant estimate. We'll follow up with next steps within one business hour.
            </p>
            <div className="koinonia-actions" style={{ justifyContent: "center" }}>
              <a className="koinonia-button primary" href="/rental-analysis">Free Rental Analysis</a>
              <a className="koinonia-button secondary" href="/owner-faq">Owner FAQ</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
