import { contactConfig, mailto } from "../../../config/contact.config";

type ContactActionsProps = {
  variant?: "cards" | "inline";
};

const actions = [
  {
    eyebrow: "Call",
    title: "Call Koinonia",
    body: "Use phone when a transaction or timeline needs a direct conversation.",
    label: contactConfig.phone.display,
    href: contactConfig.phone.href,
    placeholder: contactConfig.phone.isPlaceholder
  },
  {
    eyebrow: "Text",
    title: "Text Koinonia",
    body: "Use SMS for quick questions, scheduling, or time-sensitive coordination.",
    label: contactConfig.sms.display,
    href: contactConfig.sms.href,
    placeholder: contactConfig.sms.isPlaceholder
  },
  {
    eyebrow: "Email",
    title: "Email Koinonia",
    body: "Use email for new inquiries, transaction details, and organized written context.",
    label: contactConfig.email,
    href: mailto(),
    placeholder: false
  }
];

export function ContactActions({ variant = "cards" }: ContactActionsProps) {
  if (variant === "inline") {
    return (
      <div className="koinonia-contact-inline" aria-label="Koinonia contact actions">
        {actions.map((action) => (
          <a
            key={action.title}
            className={`koinonia-button secondary${action.placeholder ? " disabled" : ""}`}
            href={action.href}
            aria-disabled={action.placeholder ? "true" : undefined}
          >
            {action.eyebrow}: {action.label}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="koinonia-grid three koinonia-contact-actions" aria-label="Koinonia contact methods">
      {actions.map((action) => (
        <article className="koinonia-card koinonia-contact-card" key={action.title}>
          <div className="koinonia-icon">{action.eyebrow}</div>
          <h3>{action.title}</h3>
          <p>{action.body}</p>
          <a
            className={`koinonia-button secondary${action.placeholder ? " disabled" : ""}`}
            href={action.href}
            aria-disabled={action.placeholder ? "true" : undefined}
          >
            {action.label}
          </a>
        </article>
      ))}
    </div>
  );
}
