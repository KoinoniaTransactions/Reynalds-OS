export type TrustPillar = {
  title: string;
  text: string;
};

export function TrustSection({ pillars }: { pillars: TrustPillar[] }) {
  return (
    <section className="koinonia-section">
      <div className="koinonia-section-heading">
        <div className="koinonia-eyebrow">Why Realtors Choose Koinonia</div>
        <h2>A trusted partner behind every successful transaction.</h2>
        <p>Clear systems, proactive communication, and dependable execution help Realtors move forward with confidence.</p>
      </div>
      <div className="koinonia-card-grid four">
        {pillars.map((pillar) => (
          <article className="koinonia-card" key={pillar.title}>
            <h3>{pillar.title}</h3>
            <p>{pillar.text}</p>
          </article>
        ))}
      </div>
      <p className="koinonia-transition">Here is how that support comes to life.</p>
    </section>
  );
}
