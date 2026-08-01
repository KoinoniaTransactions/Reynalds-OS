import type { Metadata } from "next";
import { Footer, Header } from "../../../components/site";
import { absoluteUrl } from "../../../config/seo.config";

export const metadata: Metadata = {
  title: "Access Denied",
  description: "Koinonia portal permission status.",
  alternates: {
    canonical: absoluteUrl("/portal/access-denied")
  },
  robots: {
    index: false,
    follow: false
  }
};

type AccessDeniedPageProps = {
  searchParams: Promise<{
    portal?: string;
  }>;
};

export default async function AccessDeniedPage({
  searchParams
}: AccessDeniedPageProps) {
  const { portal } = await searchParams;
  const destination = getDestination(portal);

  return (
    <main className="koinonia-site koinonia-client-portal">
      <Header />

      <section className="koinonia-section koinonia-client-portal-entry">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Access Denied</p>

            <h1 className="koinonia-title">
              Your account is not authorized to access the {destination.name}.
            </h1>

            <p className="koinonia-lead">
              You are signed in successfully, but your assigned portal role does
              not include permission to view this area. No restricted information
              has been displayed.
            </p>
          </div>

          <div className="koinonia-grid three">
            <article className="koinonia-card">
              <h2>Your account is active</h2>
              <p>
                This message does not mean your existing portal access has been
                disabled. It only means this particular workspace is outside your
                assigned permissions.
              </p>
            </article>

            <article className="koinonia-card">
              <h2>Return to your portal</h2>
              <p>
                Use the button below to return to the portal associated with your
                current account.
              </p>
            </article>

            <article className="koinonia-card">
              <h2>Need a role change?</h2>
              <p>
                Contact a Koinonia administrator if your responsibilities have
                changed and you believe additional access is required.
              </p>
            </article>
          </div>

          <div className="koinonia-actions">
            <a className="koinonia-button primary" href={destination.returnPath}>
              {destination.returnLabel}
            </a>

            <a
              className="koinonia-button secondary"
              href="/contact#schedule-consultation"
            >
              Contact Koinonia
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function getDestination(portal: string | undefined): {
  name: string;
  returnLabel: string;
  returnPath: string;
} {
  if (portal === "employee") {
    return {
      name: "Employee Portal",
      returnLabel: "Return to Client Portal",
      returnPath: "/client/dashboard"
    };
  }

  if (portal === "client") {
    return {
      name: "Client Portal",
      returnLabel: "Return to Employee Portal",
      returnPath: "/employee/dashboard"
    };
  }

  return {
    name: "requested portal area",
    returnLabel: "Return Home",
    returnPath: "/"
  };
}
