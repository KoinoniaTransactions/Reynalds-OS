import { sharedContent } from "@/content/shared";

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
  items = sharedContent.faq.items,
  eyebrow = sharedContent.faq.eyebrow,
  title = sharedContent.faq.title
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