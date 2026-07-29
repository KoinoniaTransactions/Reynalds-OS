import { TaskSetupMFA } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Footer, Header } from "../../../components/site";
import { absoluteUrl } from "../../../config/seo.config";

export const metadata: Metadata = {
  title: "Set Up Multi-Factor Authentication",
  description: "Koinonia staff multi-factor authentication setup task.",
  alternates: {
    canonical: absoluteUrl("/session-tasks/setup-mfa")
  },
  robots: {
    index: false,
    follow: false
  }
};

export default function SetupMfaTaskPage() {
  const shouldRenderClerkTask = hasClerkPublishableKey();

  return (
    <main className="koinonia-site koinonia-client-portal">
      <Header />

      <section className="koinonia-section koinonia-client-portal-entry">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Secure Staff Access</p>

            <h1 className="koinonia-title">
              Finish multi-factor setup before entering the portal.
            </h1>

            <p className="koinonia-lead">
              Koinonia staff accounts must complete the required security task
              before protected client files, assignments, billing, or document
              tools are available.
            </p>
          </div>

          {shouldRenderClerkTask ? (
            <div className="koinonia-auth-panel">
              <TaskSetupMFA redirectUrlComplete="/employee/dashboard" />
            </div>
          ) : (
            <div className="koinonia-grid two">
              <article className="koinonia-card">
                <h2>Setup Required</h2>
                <p>
                  Multi-factor setup is available after Clerk production keys
                  are configured.
                </p>
              </article>

              <article className="koinonia-card">
                <h2>Portal Boundary</h2>
                <p>
                  Staff should not access real client files until managed login
                  and MFA policy are active.
                </p>
              </article>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function hasClerkPublishableKey(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}
