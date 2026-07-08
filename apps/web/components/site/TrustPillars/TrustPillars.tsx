import { sharedContent } from "@/content/shared";

export function TrustPillars() {
  const trustPillars = sharedContent.trustPillars;

  return (
    <section className="koinonia-section">
      <div className="koinonia-container">
        <div className="koinonia-section-header center">
          <div className="koinonia-eyebrow">{trustPillars.eyebrow}</div>
          <h2 className="koinonia-heading">{trustPillars.title}</h2>
          <p className="koinonia-copy">{trustPillars.body}</p>
        </div>

        <div className="koinonia-grid four">
          {trustPillars.pillars.map((pillar, index) => (
            <article className="koinonia-card" key={pillar.title}>
              <div className="koinonia-icon">{index + 1}</div>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}