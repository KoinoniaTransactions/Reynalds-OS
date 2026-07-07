const pillars = [
  {
    title: "Organized Processes",
    body: "Structured workflows keep deadlines, documents, communication, and follow-through from depending on memory."
  },
  {
    title: "Proactive Communication",
    body: "Clear updates help Realtors, clients, lenders, title teams, and partners understand what is happening next."
  },
  {
    title: "Dependable Partnership",
    body: "Koinonia works as an extension of the Realtor's business, not as a disconnected vendor."
  },
  {
    title: "Detail-Driven Execution",
    body: "Files are handled with consistency, care, and attention to the details that keep transactions moving."
  }
];

export function TrustPillars() {
  return (
    <section className="koinonia-section">
      <div className="koinonia-container">
        <div className="koinonia-section-header center">
          <div className="koinonia-eyebrow">Why Realtors Choose Koinonia</div>
          <h2 className="koinonia-heading">A trusted partner behind every successful transaction.</h2>
          <p className="koinonia-copy">
            Koinonia helps Realtors stay focused on clients while reliable systems, clear communication, and organized support keep the work moving behind the scenes.
          </p>
        </div>
        <div className="koinonia-grid four">
          {pillars.map((pillar, index) => (
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
