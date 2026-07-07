type FAQItem = {
  question?: string;
  answer?: string;
  q?: string;
  a?: string;
};

type FAQProps = {
  items?: FAQItem[];
  eyebrow?: string;
  title?: string;
};

const defaultFaqs: FAQItem[] = [
  {
    q: "When should I bring Koinonia into a transaction?",
    a: "As soon as the contract is signed. Early involvement helps deadlines, documents, communication, and next steps get organized from the beginning."
  },
  {
    q: "Can I use only the services I need?",
    a: "Yes. Koinonia is designed around support levels and operational needs, not one-size-fits-all packages."
  },
  {
    q: "Will I still stay informed?",
    a: "Yes. The goal is not to remove you from the transaction; it is to keep you supported, informed, and focused on your clients."
  },
  {
    q: "How is billing handled?",
    a: "Koinonia supports both prepaid and pay-at-close models depending on the service level and agreement."
  }
];

export function FAQ({ items = defaultFaqs, eyebrow = "Questions", title = "Answers that remove uncertainty." }: FAQProps) {
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
