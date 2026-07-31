import { FAQ, Footer, Hero, PropertiesInquiry, PropertiesNav, PropertiesSeoContent, UniversalCard } from "../index";

const tenantPaths = [
  {
    title: "Find a Rental",
    body: "Browse current and upcoming vacancies, then move from listing to application with clear next steps.",
    items: ["Current availability", "Property details", "Apply from listing"],
    actionLabel: "Apply",
    actionHref: "/properties/apply"
  },
  {
    title: "Pay Rent",
    body: "Once the portal is active, tenants should have a direct rent payment path without searching through the site.",
    items: ["Tenant portal", "Payment access", "Account visibility"],
    actionLabel: "Portal Access",
    actionHref: "/properties/portals"
  },
  {
    title: "Request Maintenance",
    body: "Maintenance requests should be routed through a clear process with expected response timing.",
    items: ["Routine requests", "Urgent routing", "Photo-ready intake"],
    actionLabel: "Maintenance",
    actionHref: "/properties/maintenance"
  }
];

const tenantFaqs = [
  {
    q: "Are applications open now?",
    a: "Applications should open from active listings once Koinonia Properties has available rentals and a finalized screening process."
  },
  {
    q: "Where will tenants submit maintenance requests?",
    a: "The tenant portal should become the primary path for maintenance requests once the property management platform is selected."
  },
  {
    q: "Will policies be posted online?",
    a: "Yes. Application criteria, rent payment expectations, maintenance policies, and move-in requirements should be posted before launch."
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
        lead="Koinonia Properties should give tenants direct paths for listings, applications, rent payments, maintenance requests, and support."
        primaryLabel="View Rentals"
        primaryHref="/properties/rentals"
        secondaryLabel="Tenant Portal"
        secondaryHref="/properties/portals"
      />

      <PropertiesSeoContent variant="tenants" />

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">Resident Paths</div>
            <h2 className="koinonia-heading">Tenants should know exactly where to go.</h2>
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
