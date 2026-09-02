import type { Metadata } from "next";
import { Footer, Header } from "../../components/site";
import { absoluteUrl } from "../../config/seo.config";

export const metadata: Metadata = {
  title: "Real Estate Coverage for Colorado Realtors",
  description:
    "Flexible Koinonia support for Colorado Realtors across transaction management, contract preparation, licensed showing coverage, and business operations.",
  alternates: {
    canonical: absoluteUrl("/coverage")
  },
  robots: {
    index: false,
    follow: true
  }
};

const coverageOptions = [
  {
    eyebrow: "01",
    title: "Transaction Management",
    body:
      "Contract-to-close coordination that keeps deadlines, documents, communication, and the file moving while you stay focused on the client."
  },
  {
    eyebrow: "02",
    title: "Contract Preparation",
    body:
      "Send the terms and Koinonia can prepare the contract or document for your review and approval."
  },
  {
    eyebrow: "03",
    title: "Licensed Showing Coverage",
    body:
      "When your schedule overlaps, licensed showing support can help you keep serving the client instead of choosing which appointment gets your attention."
  },
  {
    eyebrow: "04",
    title: "Business Operations Support",
    body:
      "Flexible backend support for the operational work that competes with prospecting, client care, and revenue-producing activity."
  }
] as const;

export default function CoveragePage() {
  return (
    <main className="koinonia-site">
      <Header />

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">Coverage for Colorado Realtors</div>
            <h1 className="koinonia-heading">Real estate doesn&apos;t happen one thing at a time.</h1>
            <p className="koinonia-copy">
              A showing request lands while you are headed to a closing. A contract needs to be
              prepared while another transaction needs attention. Koinonia gives Colorado Realtors
              flexible support where the work actually overlaps.
            </p>
            <div className="koinonia-actions" style={{ justifyContent: "center" }}>
              <a className="koinonia-button primary" href="/contact#schedule-consultation">
                See Your Coverage Options
              </a>
              <a className="koinonia-button secondary" href="/services">
                View Services &amp; Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-section-header center">
            <div className="koinonia-eyebrow">Support beyond the file</div>
            <h2 className="koinonia-heading">Keep the client. Get the coverage.</h2>
            <p className="koinonia-copy">
              Traditional transaction coordination solves the file-management problem. Koinonia can
              also support the licensed and operational work that shows up around the transaction.
            </p>
          </div>

          <div className="koinonia-grid two">
            {coverageOptions.map((option) => (
              <article className="koinonia-card" key={option.title}>
                <div className="koinonia-eyebrow">{option.eyebrow}</div>
                <h3>{option.title}</h3>
                <p>{option.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-cta">
            <div className="koinonia-eyebrow">Built around the way Realtors actually work</div>
            <h2 className="koinonia-heading">Use the support you need, when you need it.</h2>
            <p className="koinonia-copy">
              You do not need to hand off your business. Use Koinonia for the pieces that are taking
              you away from clients, prospecting, and the work only you can do.
            </p>
            <div className="koinonia-actions" style={{ justifyContent: "center" }}>
              <a className="koinonia-button primary" href="/contact#schedule-consultation">
                Schedule a Consultation
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
