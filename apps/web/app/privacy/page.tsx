import type { Metadata } from "next";
import { Footer, Header } from "../../components/site";
import { privacyContent } from "../../content/privacy";
import { absoluteUrl } from "../../config/seo.config";

export const metadata: Metadata = {
  title: "Privacy Policy | Koinonia",
  description:
    "Learn how Koinonia handles information shared through its website, consultation requests, marketing, and professional service relationships.",
  alternates: {
    canonical: absoluteUrl("/privacy")
  },
  openGraph: {
    title: "Privacy Policy | Koinonia",
    description:
      "Learn how Koinonia handles information shared through its website, consultation requests, marketing, and professional service relationships.",
    url: absoluteUrl("/privacy")
  }
};

export default function PrivacyPage() {
  return (
    <main className="koinonia-site">
      <Header />
      <section className="koinonia-section">
        <div className="koinonia-container" style={{ maxWidth: "900px" }}>
          <div className="koinonia-section-header">
            <div className="koinonia-eyebrow">{privacyContent.eyebrow}</div>
            <h1 className="koinonia-heading">{privacyContent.title}</h1>
            <p className="koinonia-copy">{privacyContent.lead}</p>
            <p className="koinonia-copy"><strong>Last updated:</strong> {privacyContent.lastUpdated}</p>
          </div>
          <div style={{ display: "grid", gap: "2rem" }}>
            {privacyContent.sections.map((section) => (
              <section key={section.title}>
                <h2 className="koinonia-heading" style={{ fontSize: "1.6rem" }}>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p className="koinonia-copy" key={paragraph}>{paragraph}</p>
                ))}
                {section.items.length ? (
                  <ul className="koinonia-copy">
                    {section.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
