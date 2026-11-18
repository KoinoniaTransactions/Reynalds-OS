import { FAQ, FaqJsonLd, Footer, Hero, PropertiesInquiry, PropertiesNav, Section, UniversalCard } from "../index";
import { contactConfig } from "../../../config/contact.config";
import { businessHours } from "../../../config/business.config";

const tenantPaths = [
  {
    title: "Find a rental",
    body: "See available homes, with rent, deposit, pet details and move-in dates up front.",
    items: ["Available homes", "Written rental criteria", "$35 application fee"],
    actionLabel: "Available Homes",
    actionHref: "/rentals"
  },
  {
    title: "Request maintenance",
    body: "Emergencies get a call back within 1 hour, 24/7. Routine requests are handled the next business day.",
    items: ["Emergency: call our main line", "Fire, gas or CO: call 911 first", "Include photos for routine requests"],
    actionLabel: "Maintenance",
    actionHref: "/maintenance"
  },
  {
    title: "Pay rent and resident login",
    body: "Residents receive rent payment and account instructions with their lease. Log in from the Login page.",
    items: ["Rent instructions with your lease", "Resident login", "Questions? Call or text us"],
    actionLabel: "Login",
    actionHref: "/portals"
  }
];

const tenantFaqs = [
  { q: "How do I request maintenance?", a: `For emergencies, call ${contactConfig.phone.display} any time. For routine requests, use the Maintenance page and include photos, the location in the home and permission to enter.` },
  { q: "What counts as an emergency?", a: "Fire, gas smell or carbon monoxide (call 911 first), flooding or active leaks, no heat in cold weather, sewage backup, or a home that can't be secured." },
  { q: "How do I pay rent?", a: "You'll receive rent payment instructions with your lease. If you can't find them, call or text us." },
  { q: "When is the office open?", a: `${businessHours.label}. Emergencies are handled any time.` }
];

export function KoinoniaPropertiesTenants() {
  return (
    <main className="koinonia-site">
      <FaqJsonLd items={tenantFaqs} />
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Resident Services"
        title="Renting with Koinonia: clear answers, fast repairs."
        lead="Find a home, request maintenance and get help when you need it. Emergencies get a call back within one hour, any time."
        primaryLabel="Available Homes"
        primaryHref="/rentals"
        secondaryLabel="Request Maintenance"
        secondaryHref="/maintenance"
        visualDesktopSrc="/assets/images/properties/heroes/tenants-hero.webp"
      />

      <Section eyebrow="Residents" title="What do you need today?">
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
      </Section>

      <FAQ items={tenantFaqs} eyebrow="Resident Questions" title="Quick answers for residents." />
      <PropertiesInquiry kind="tenant" />
      <Footer serviceLine="Koinonia Properties" supportLine="Resident services" />
    </main>
  );
}
