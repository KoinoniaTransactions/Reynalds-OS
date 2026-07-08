import { sharedContent } from "@/content/shared";
import { contactConfig, mailto } from "../../../config/contact.config";

export function Footer() {
  const footer = sharedContent.footer;

  return (
    <footer className="koinonia-footer">
      <div className="koinonia-footer-inner">
        <div>
          <strong>{footer.companyName}</strong>
          <div style={{ color: "#cfcfcf", marginTop: 4 }}>
            {footer.tagline}
          </div>

          <div className="koinonia-footer-contact">
            <a href={mailto()}>Email</a>
            <a
              href={contactConfig.phone.href}
              aria-disabled={contactConfig.phone.isPlaceholder ? "true" : undefined}
            >
              Phone
            </a>
            <a
              href={contactConfig.sms.href}
              aria-disabled={contactConfig.sms.isPlaceholder ? "true" : undefined}
            >
              Text
            </a>
          </div>
        </div>

        <nav aria-label="Koinonia footer navigation">
          {footer.navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}