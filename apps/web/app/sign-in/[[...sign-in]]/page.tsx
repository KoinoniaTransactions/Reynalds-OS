import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Footer, Header } from "../../../components/site";
import { absoluteUrl } from "../../../config/seo.config";
import { getHostedSignInUrl, normalizePortalReturnTo } from "../../../lib/portal-auth";

export const metadata: Metadata = {
  title: "Secure Login",
  description: "Secure login entry for Koinonia client and employee portals.",
  alternates: {
    canonical: absoluteUrl("/sign-in")
  },
  robots: {
    index: false,
    follow: false
  }
};

type SignInPageProps = {
  searchParams?: Promise<{
    redirect_url?: string;
    return_to?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const returnTo = normalizePortalReturnTo(params?.return_to ?? params?.redirect_url);
  const hostedSignInUrl = getHostedSignInUrl(returnTo);
  const shouldRenderClerkSignIn = hasClerkPublishableKey();

  return (
    <main className="koinonia-site koinonia-client-portal">
      <Header />

      <section className="koinonia-section koinonia-client-portal-entry">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Secure Login</p>

            <h1 className="koinonia-title">
              Sign in to your Koinonia workspace.
            </h1>

            <p className="koinonia-lead">
              Client files, staff assignments, billing setup, and document work
              are protected behind secure login before real information is
              accepted.
            </p>
          </div>

          {shouldRenderClerkSignIn ? (
            <div className="koinonia-auth-panel">
              <SignIn fallbackRedirectUrl={returnTo} />
            </div>
          ) : (
            <>
              <div className="koinonia-actions">
                {hostedSignInUrl ? (
                  <a className="koinonia-button primary" href={hostedSignInUrl}>
                    Continue to Secure Login
                  </a>
                ) : (
                  <a className="koinonia-button primary" href="/contact#schedule-consultation">
                    Request Portal Access
                  </a>
                )}

                <a className="koinonia-button secondary" href="/client">
                  Client Portal
                </a>

                <a className="koinonia-button secondary" href="/employee">
                  Employee Portal
                </a>
              </div>

              <div className="koinonia-grid three">
                <article className="koinonia-card">
                  <h2>Client access</h2>
                  <p>
                    Realtor clients will receive an invitation before their
                    file, documents, billing setup, and active work appear in
                    the portal.
                  </p>
                </article>

                <article className="koinonia-card">
                  <h2>Staff access</h2>
                  <p>
                    Koinonia staff accounts should use multi-factor login and
                    only show the clients, work, and billing tasks assigned to
                    their role.
                  </p>
                </article>

                <article className="koinonia-card">
                  <h2>Safe boundaries</h2>
                  <p>
                    Brokerage passwords, raw card numbers, and CVV codes should
                    never be pasted into the portal.
                  </p>
                </article>
              </div>
            </>
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
