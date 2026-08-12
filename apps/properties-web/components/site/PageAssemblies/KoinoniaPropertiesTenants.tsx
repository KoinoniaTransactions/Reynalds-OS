import { FAQ, Footer, Hero, PropertiesInquiry, PropertiesNav, PropertiesSeoContent, UniversalCard } from "../index";

const tenantPaths = [
  {
    title: "Find a Rental",
    body: "Browse public rental availability and review the details provided for each property.",
    items: ["Current availability", "Property details", "Rental questions"],
    actionLabel: "View Rentals",
    actionHref: "/rentals"
  },
  {
    title: "Apply",
    body: "Applications are tied to active rental listings. Follow the application instructions provided for the property.",
    items: ["Listing first", "Application instructions", "Next-step communication"],
    actionLabel: "Application Help",
    actionHref: "/apply"
  },
  {
    title: "Maintenance and Support",
    body: "Use the maintenance page for routine issue guidance and contact Koinonia Properties when you need help with the next step.",
    items: ["Routine requests", "Property details", "Support questions"],
    actionLabel: "Maintenance",
    actionHref: "/maintenance"
  }
];

const tenantFaqs = [
  {
    q: "How do I apply for a rental?",
    a: "Start with an active rental listing and follow the application instructions provided for that property."
  },
  {
    q: "How do I request maintenance?",
    a: "Use the Maintenance page for guidance and the contact path provided for your property. Include the property address and a short description of the issue."
  },
  {
    q: "Where do I find payment or portal information?",
    a: "Residents receive payment and secure account-access instructions directly for the property they occupy."
  }
];

export function KoinoniaPropertiesTenants() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Tenant Services"
        title="A rental experience with clearer next steps."
        lead="Koinonia Properties gives residents clear paths for rentals, applications, maintenance guidance, account access, and support."
        primaryLabel="View Rentals"
        primaryHref="/rentals"
        secondaryLabel="Tenant Portal"
        secondaryHref="/portals"
      />

      <PropertiesSeoContent variant="tenants" />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Resident Paths</div>
            <h2 className="koinonia-heading">Clear next steps for residents.</h2>
          </div>
          <div className="koinonia-grid three">
            {tenantPaths.map((path, index) => (
              <UniversalCard
                key={path.title}
                eyebrow={`0${index + 1}`}
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

      <FAQ items={tenantFaqs} eyebrow="Tenant Questions" title="Simple answers for residents." />
      <PropertiesInquiry kind="tenant" />
      <Footer serviceLine="Koinonia Properties" supportLine="Tenant services" />
    </main>
  );
}
