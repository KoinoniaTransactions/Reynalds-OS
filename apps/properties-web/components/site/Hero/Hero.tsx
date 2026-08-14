export type HeroProps = {
  eyebrow: string;
  title: string;
  lead: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  visualDesktopSrc?: string;
  visualMobileSrc?: string;
  visualAlt?: string;
  variant?: "standard" | "fullBleed";
  visualVariant?: "operations" | "properties";
};

const propertyHeroImages: Record<string, string> = {
  "Owner Services": "/assets/images/properties/heroes/owners-hero.webp",
  "Rental Analysis": "/assets/images/properties/heroes/owners-hero.webp",
  "Available Rentals": "/assets/images/properties/heroes/rentals-hero.webp",
  Apply: "/assets/images/properties/heroes/rentals-hero.webp",
  "Tenant Services": "/assets/images/properties/heroes/tenants-hero.webp",
  Maintenance: "/assets/images/properties/heroes/tenants-hero.webp",
  "Pricing and Scope": "/assets/images/properties/heroes/pricing-hero.webp",
  Portals: "/assets/images/properties/heroes/contact-hero.webp",
  "Operating Standards": "/assets/images/properties/heroes/standards-hero.webp",
  Vendors: "/assets/images/properties/heroes/standards-hero.webp",
  Policies: "/assets/images/properties/heroes/policies-hero.webp",
  Contact: "/assets/images/properties/heroes/contact-hero.webp",
  "Service Areas": "/assets/images/properties/heroes/service-areas-hero.webp"
};

export function Hero({
  eyebrow,
  title,
  lead,
  primaryLabel = "Request Rental Analysis",
  primaryHref = "/rental-analysis",
  secondaryLabel,
  secondaryHref,
  visualDesktopSrc,
  visualMobileSrc,
  visualAlt = "Koinonia Properties property management",
  variant = "standard",
  visualVariant = "properties"
}: HeroProps) {
  const mappedPropertyImage = visualVariant === "properties" ? propertyHeroImages[eyebrow] : undefined;
  const resolvedDesktopSrc = visualDesktopSrc ?? mappedPropertyImage;
  const resolvedMobileSrc = visualMobileSrc ?? resolvedDesktopSrc;
  const hasPropertiesBackground = visualVariant === "properties" && Boolean(resolvedDesktopSrc);

  const heroClassName = [
    "koinonia-section",
    "koinonia-hero",
    variant === "fullBleed" || hasPropertiesBackground ? "full-bleed" : "",
    visualVariant,
    hasPropertiesBackground ? "properties-image" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={heroClassName}>
      {hasPropertiesBackground ? (
        <div className="properties-hero-background" aria-hidden="true">
          <picture>
            {resolvedMobileSrc ? <source media="(max-width: 980px)" srcSet={resolvedMobileSrc} /> : null}
            <img src={resolvedDesktopSrc} alt="" />
          </picture>
        </div>
      ) : null}

      <div className="koinonia-container koinonia-hero-grid">
        <div className="koinonia-hero-copy">
          <div className="koinonia-eyebrow">{eyebrow}</div>
          <h1 className="koinonia-title">{title}</h1>

          {!hasPropertiesBackground && resolvedDesktopSrc ? (
            <div className="koinonia-hero-mobile-visual">
              <picture>
                {resolvedMobileSrc ? <source media="(max-width: 980px)" srcSet={resolvedMobileSrc} /> : null}
                <img src={resolvedMobileSrc ?? resolvedDesktopSrc} alt={visualAlt} />
              </picture>
            </div>
          ) : null}

          <p className="koinonia-lead">{lead}</p>

          <div className="koinonia-actions">
            <a className="koinonia-button primary" href={primaryHref}>{primaryLabel}</a>
            {secondaryLabel && secondaryHref ? (
              <a className="koinonia-button secondary" href={secondaryHref}>{secondaryLabel}</a>
            ) : null}
          </div>
        </div>

        {!hasPropertiesBackground ? (
          <div className={resolvedDesktopSrc ? "koinonia-visual has-image" : "koinonia-visual"} aria-label={visualAlt}>
            {resolvedDesktopSrc ? (
              <picture>
                {resolvedMobileSrc ? <source media="(max-width: 980px)" srcSet={resolvedMobileSrc} /> : null}
                <img src={resolvedDesktopSrc} alt={visualAlt} />
              </picture>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
