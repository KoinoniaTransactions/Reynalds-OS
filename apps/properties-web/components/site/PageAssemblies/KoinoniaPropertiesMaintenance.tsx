import { Footer, Hero, PropertiesInquiry, PropertiesNav, Section, UniversalCard } from "../index";
import { contactConfig } from "../../../config/contact.config";
import { businessHours, maintenanceTiers } from "../../../config/business.config";

const requestTips = [
  "What's wrong and where in the home",
  "Photos or a short video if you can",
  "When it started and whether it's getting worse",
  "Whether we have permission to enter",
  "Pets in the home and best times to reach you"
];

export function KoinoniaPropertiesMaintenance() {
  return (
    <main className="koinonia-site">
      <PropertiesNav />
      <Hero
        visualVariant="properties"
        eyebrow="Maintenance"
        title="Request maintenance, day or night."
        lead={`For emergencies, call our main line at ${contactConfig.phone.display} any time. You'll get a call back within one hour, 24/7.`}
        primaryLabel={`Call ${contactConfig.phone.display}`}
        primaryHref={contactConfig.phone.href}
        secondaryLabel="Resident Services"
        secondaryHref="/tenants"
        visualDesktopSrc="/assets/images/properties/heroes/tenants-hero.webp"
      />

      <Section eyebrow="Safety First" title="Fire, gas smell or carbon monoxide? Call 911 first." lead={`Get everyone out, call 911, then call us at ${contactConfig.phone.display}.`}>
        <div className="koinonia-actions">
          <a className="koinonia-button primary" href="tel:911">Call 911</a>
          <a className="koinonia-button secondary" href={contactConfig.phone.href}>Call Koinonia</a>
        </div>
      </Section>

      <Section eyebrow="Response Times" title="How fast we respond." band>
        <div className="koinonia-grid three">
          {maintenanceTiers.map((tier) => (
            <UniversalCard key={tier.name} eyebrow={tier.name} title={tier.response} body="For example:" items={tier.examples} />
          ))}
        </div>
      </Section>

      <Section eyebrow="Routine Requests" title="What to include in your request." lead={`Routine requests are handled the next business day. Office hours are ${businessHours.label}.`}>
        <ul className="properties-check-list">
          {requestTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </Section>

      <PropertiesInquiry kind="maintenance" />

      <Footer serviceLine="Koinonia Properties" supportLine="Maintenance requests" />
    </main>
  );
}
