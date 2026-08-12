const defaultFaqItems = [
  {
    q: "How do I start a property management conversation?",
    a: "Start with the property address, occupancy status, owner goals, and any known maintenance or leasing concerns."
  },
  {
    q: "Where should tenants go for support?",
    a: "Use the tenant, maintenance, rentals, and portal paths on this site for the appropriate next step."
  }
] as const;

type FAQItem = {
  question?: string;
  answer?: string;
  q?: string;
  a?: string;
};

type FAQProps = {
  items?: readonly FAQItem[];
  eyebrow?: string;
  title?: string;
};

export function FAQ({
  items = defaultFaqItems,
  eyebrow = "Common Questions",
  title = "Clear answers for owners and residents."
}: FAQProps) {
  return (
    <section className="koinonia-section">
      <div className="koinonia-container">
        <div className="koinonia-section-header">
          <div className="koinonia-eyebrow">{eyebrow}</div>
          <h2 className="koinonia-heading">{title}</h2>
        </div>

        <div className="koinonia-grid two">
          {items.map((faq) => {
            const question = faq.question ?? faq.q ?? "Question";
            const answer = faq.answer ?? faq.a ?? "Answer pending.";

            return (
              <article className="koinonia-card" key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}