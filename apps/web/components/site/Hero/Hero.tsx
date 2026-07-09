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
  visualAlt = "Koinonia organized real estate operations workspace"
}: HeroProps) {
  return (
    <section className="koinonia-section koinonia-hero">
      <div className="koinonia-container koinonia-hero-grid">
        <div>
          <div className="koinonia-eyebrow">{eyebrow}</div>
          <h1 className="koinonia-title">{title}</h1>
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

        <div className={visualDesktopSrc ? "koinonia-visual has-image" : "koinonia-visual"}>
          {visualDesktopSrc ? (
            <picture>
              {visualMobileSrc ? (
                <source media="(max-width: 980px)" srcSet={visualMobileSrc} />
              ) : null}
              <img src={visualDesktopSrc} alt={visualAlt} />
            </picture>
          ) : null}
        </div>
      </div>
    </section>
  );
}