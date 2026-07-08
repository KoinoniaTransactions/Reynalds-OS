import { sharedContent } from "@/content/shared";
import { contactConfig, mailto } from "../../../config/contact.config";

type ContactActionsProps = {
  variant?: "cards" | "inline";
};

function getContactAction(action: (typeof sharedContent.contactActions.actions)[number]) {
  if (action.key === "phone") {
    return {
      ...action,
      label: contactConfig.phone.display,
      href: contactConfig.phone.href,
      placeholder: contactConfig.phone.isPlaceholder
    };
  }

  if (action.key === "sms") {
    return {
      ...action,
      label: contactConfig.sms.display,
      href: contactConfig.sms.href,
      placeholder: contactConfig.sms.isPlaceholder
    };
  }

  return {
    ...action,
    label: contactConfig.email,
    href: mailto(),
    placeholder: false
  };
}

export function ContactActions({ variant = "cards" }: ContactActionsProps) {
  const actions = sharedContent.contactActions.actions.map(getContactAction);

  if (variant === "inline") {
    return (
      <div
        className="koinonia-contact-inline"
        aria-label={sharedContent.contactActions.inlineLabel}
      >
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
    <div
      className="koinonia-grid three koinonia-contact-actions"
      aria-label={sharedContent.contactActions.cardsLabel}
    >
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
