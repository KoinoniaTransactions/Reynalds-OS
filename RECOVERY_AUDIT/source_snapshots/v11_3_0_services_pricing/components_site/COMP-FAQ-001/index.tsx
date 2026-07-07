export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section className="koinonia-section">
      <div className="koinonia-section-heading">
        <div className="koinonia-eyebrow">Questions</div>
        <h2>Answers that remove uncertainty.</h2>
      </div>
      <div className="koinonia-faq-list">
        {items.map((item) => (
          <details className="koinonia-faq" key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
