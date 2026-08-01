import { SignOutButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Footer, Header } from "../../../components/site";
import { absoluteUrl } from "../../../config/seo.config";

export const metadata: Metadata = {
  title: "Portal Access Status",
  description:
    "Koinonia portal access status for authenticated users who have not yet been provisioned.",
  alternates: {
    canonical: absoluteUrl("/portal/access-status")
  },
  robots: {
    index: false,
    follow: false
  }
};

export default function PortalAccessStatusPage() {
  return (
    <main className="koinonia-site koinonia-client-portal">
      <Header />

      <section className="koinonia-section koinonia-client-portal-entry">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Portal Access</p>

            <h1 className="koinonia-title">
              Your account is signed in, but portal access is not active yet.
            </h1>

            <p className="koinonia-lead">
              Koinonia portal access is invitation-only. Confirm that you signed
              in with the same email address that received your invitation, or
              contact Koinonia so we can review your access.
            </p>
          </div>

          <div className="koinonia-grid three">
            <article className="koinonia-card">
              <h2>Check your email</h2>
              <p>
                Portal invitations are connected to a specific email address.
                Try signing in with the address where your invitation was sent.
              </p>
            </article>

            <article className="koinonia-card">
              <h2>Request access</h2>
              <p>
                If you are an active Koinonia client or staff member, contact us
                so we can verify and activate the correct portal role.
              </p>
            </article>

            <article className="koinonia-card">
              <h2>Your information is protected</h2>
              <p>
                Signing in does not automatically grant access to client files,
                documents, billing information, or staff workspaces.
              </p>
            </article>
          </div>

          <div className="koinonia-actions">
            <a
              className="koinonia-button primary"
              href="/contact#schedule-consultation"
            >
              Request Portal Access
            </a>

            <a className="koinonia-button secondary" href="/client">
              Return to Client Portal
            </a>

            {hasClerkPublishableKey() ? (
              <SignOutButton redirectUrl="/">
                <button className="koinonia-button secondary" type="button">
                  Sign Out
                </button>
              </SignOutButton>
            ) : null}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}


function hasClerkPublishableKey(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}
