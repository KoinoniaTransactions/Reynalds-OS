export type PrimaryHeroProps = {
  eyebrow: string;
  headline: string;
  supportingText: string;
  ctaLabel: string;
  ctaHref: string;
  visualTitle?: string;
  visualText?: string;
};

export function PrimaryHero({
  eyebrow,
  headline,
  supportingText,
  ctaLabel,
  ctaHref,
  visualTitle = "Organized support for every step.",
  visualText = "A calm, professional operating experience for real estate transactions."
}: PrimaryHeroProps) {
  return (
    <section className="koinonia-section koinonia-hero">
      <div>
        <div className="koinonia-eyebrow">{eyebrow}</div>
        <h1>{headline}</h1>
        <p className="koinonia-lede">{supportingText}</p>
        <a className="koinonia-button" href={ctaHref}>{ctaLabel}</a>
      </div>
      <aside className="koinonia-visual-card" aria-label="Koinonia work preview">
        <span>Reynalds OS / Koinonia</span>
        <strong>{visualTitle}</strong>
        <p>{visualText}</p>
      </aside>
    </section>
  );
}
