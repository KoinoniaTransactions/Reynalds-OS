import { brandContent } from "@/content/brand";

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

export function Hero({
  eyebrow,
  title,
  lead,
  primaryLabel = brandContent.cta.primaryLabel,
  primaryHref = brandContent.navigation.contact,
  secondaryLabel,
  secondaryHref,
  visualDesktopSrc,
  visualMobileSrc,
  visualAlt = "Koinonia organized real estate operations workspace",
  variant = "standard",
  visualVariant = "operations"
}: HeroProps) {
  const heroClassName = [
    "koinonia-section",
    "koinonia-hero",
    variant === "fullBleed" ? "full-bleed" : "",
    visualVariant
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={heroClassName}>
      <div className="koinonia-container koinonia-hero-grid">
        <div className="koinonia-hero-copy">
          <div className="koinonia-eyebrow">{eyebrow}</div>
          <h1 className="koinonia-title">{title}</h1>

          {visualDesktopSrc ? (
            <div className="koinonia-hero-mobile-visual">
              <picture>
                {visualMobileSrc ? (
                  <source media="(max-width: 980px)" srcSet={visualMobileSrc} />
                ) : null}
                <img src={visualMobileSrc ?? visualDesktopSrc} alt={visualAlt} />
              </picture>
            </div>
          ) : null}

          <p className="koinonia-lead">{lead}</p>

          <div className="koinonia-actions">
            <a className="koinonia-button primary" href={primaryHref}>
              {primaryLabel}
            </a>

            {secondaryLabel && secondaryHref ? (
              <a className="koinonia-button secondary" href={secondaryHref}>
                {secondaryLabel}
              </a>
            ) : null}
          </div>
        </div>

        <div
          className={visualDesktopSrc ? "koinonia-visual has-image" : "koinonia-visual"}
          aria-label={
            visualVariant === "properties"
              ? "Koinonia Properties management workspace"
              : visualAlt
          }
        >
          {visualDesktopSrc ? (
            <picture>
              {visualMobileSrc ? (
                <source media="(max-width: 980px)" srcSet={visualMobileSrc} />
              ) : null}
              <img src={visualDesktopSrc} alt={visualAlt} />
            </picture>
          ) : visualVariant === "properties" ? (
            <div className="koinonia-visual-panel" aria-hidden="true">
              <span>Property OS</span>
              <strong>Owner · Tenant · Maintenance</strong>
              <ul>
                <li>
                  <b>Rent</b>
                  <em>Ready</em>
                </li>
                <li>
                  <b>Work Orders</b>
                  <em>Tracked</em>
                </li>
                <li>
                  <b>Owner Updates</b>
                  <em>Monthly</em>
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
