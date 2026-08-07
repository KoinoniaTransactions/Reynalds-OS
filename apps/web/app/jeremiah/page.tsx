import type { Metadata } from "next";
import styles from "./digital-card.module.css";

const cardUrl = "https://koinoniatransactions.com/jeremiah";

export const metadata: Metadata = {
  title: "Jeremiah Reynalds | Koinonia Transactions",
  description:
    "Connect with Jeremiah Reynalds, Managing Support Partner at Koinonia Transactions.",
  alternates: {
    canonical: cardUrl
  },
  openGraph: {
    title: "Jeremiah Reynalds | Koinonia Transactions",
    description: "Real Estate Operations. Elevated.",
    url: cardUrl,
    type: "profile"
  }
};

const actions = [
  {
    label: "Save Contact",
    detail: "Add Jeremiah to your phone",
    href: "/jeremiah-reynalds.vcf",
    download: true
  },
  {
    label: "Call",
    detail: "(719) 745-8497",
    href: "tel:+17197458497"
  },
  {
    label: "Text",
    detail: "Send a message",
    href: "sms:+17197458497"
  },
  {
    label: "Email",
    detail: "jeremiah@koinoniaadmin.com",
    href: "mailto:jeremiah@koinoniaadmin.com"
  }
];

export default function JeremiahDigitalCardPage() {
  return (
    <main className={styles.page}>
      <div className={styles.glowOne} aria-hidden="true" />
      <div className={styles.glowTwo} aria-hidden="true" />

      <section className={styles.shell} aria-labelledby="digital-card-name">
        <header className={styles.brandRow}>
          <div className={styles.mark} aria-hidden="true">K</div>
          <div>
            <div className={styles.brandName}>Koinonia</div>
            <div className={styles.brandSub}>TRANSACTIONS</div>
          </div>
        </header>

        <div className={styles.eyebrow}>REAL ESTATE OPERATIONS. ELEVATED.</div>

        <div className={styles.identity}>
          <div className={styles.goldRule} aria-hidden="true" />
          <div>
            <h1 id="digital-card-name">Jeremiah Reynalds</h1>
            <p>Managing Support Partner</p>
          </div>
        </div>

        <p className={styles.intro}>
          Calm, dependable real estate operations support behind the client relationship.
        </p>

        <div className={styles.actions}>
          {actions.map((action) => (
            <a
              key={action.label}
              className={styles.action}
              href={action.href}
              download={action.download ? "Jeremiah-Reynalds-Koinonia.vcf" : undefined}
            >
              <span>{action.label}</span>
              <small>{action.detail}</small>
              <b aria-hidden="true">→</b>
            </a>
          ))}
        </div>

        <a className={styles.website} href="https://koinoniatransactions.com">
          <span>Visit Koinonia</span>
          <strong>koinoniatransactions.com</strong>
        </a>

        <div className={styles.sharePanel}>
          <div className={styles.shareCopy}>
            <span>SHARE THIS CARD</span>
            <p>Scan the QR code or send this page: koinoniatransactions.com/jeremiah</p>
          </div>
          <img
            className={styles.qr}
            src="/assets/images/koinonia/jeremiah-digital-card-qr.svg"
            alt="QR code for Jeremiah Reynalds digital business card"
          />
        </div>

        <footer className={styles.footer}>
          <span>/koy-noh-NEE-uh/</span>
          <p>fellowship · joint participation · sharing in common</p>
        </footer>
      </section>
    </main>
  );
}
