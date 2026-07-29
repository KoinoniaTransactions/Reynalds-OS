import type { Metadata } from "next";
import { absoluteUrl } from "../../../config/seo.config";
import { Footer, Header } from "../../../components/site";
import { prisma } from "../../../lib/db";
import { requirePortalPermission } from "../../../lib/portal-auth";
import {
  buildPortalReadinessReport,
  portalReadinessRequiredRoles,
  type PortalDatabaseReadiness,
  type PortalReadinessItem,
  type PortalReadinessStatus
} from "../../../lib/portal-readiness";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portal Readiness",
  description:
    "Koinonia employee portal readiness view for login, data, documents, client workflows, AI review, and production gates.",
  alternates: {
    canonical: absoluteUrl("/employee/readiness")
  },
  robots: {
    index: false,
    follow: false
  }
};

export default async function EmployeePortalReadinessPage() {
  const actor = await requirePortalPermission("employee-portal:view", "/employee/readiness");
  const readinessWorkspaceId = process.env.ROS_DEFAULT_WORKSPACE_ID ?? "wks_koinonia";
  const database = await getPortalDatabaseReadiness(readinessWorkspaceId);
  const report = buildPortalReadinessReport({
    aiProviderConfigured: Boolean(process.env.OPENAI_API_KEY || process.env.AI_PROVIDER),
    authProvider: process.env.AUTH_PROVIDER,
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    clerkSecretKey: process.env.CLERK_SECRET_KEY,
    documentMalwareScanCommand: process.env.PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND,
    documentUploadDir: process.env.PORTAL_DOCUMENT_UPLOAD_DIR,
    hostedSignInUrl:
      process.env.NEXT_PUBLIC_AUTH_SIGN_IN_URL ?? process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    nodeEnv: process.env.NODE_ENV,
    rosAllowMockAuth: process.env.ROS_ALLOW_MOCK_AUTH,
    socialLoginConfigured: process.env.KOINONIA_SOCIAL_LOGIN_CONFIGURED === "true",
    workspaceId: readinessWorkspaceId,
    database
  });

  return (
    <main className="koinonia-site koinonia-readiness">
      <Header />

      <section className="koinonia-section koinonia-readiness-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Portal Oversight</p>

            <h1 className="koinonia-title">
              Live production readiness for Koinonia login and portal work.
            </h1>

            <p className="koinonia-lead">
              This staff view shows the current state of login, client data,
              document handling, workflow safety, and AI review gates before
              the portal accepts real client activity.
            </p>
          </div>

          <div className="koinonia-readiness-status-row">
            <StatusBadge status={report.overallStatus} label="Overall" />
            <span>Workspace: {report.workspaceId}</span>
            <span>Updated: {formatDateTime(report.generatedAt)}</span>
          </div>

          <div className="koinonia-readiness-summary-grid">
            {report.summary.map((card) => (
              <article className="koinonia-readiness-summary-card" key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-readiness-grid">
            {report.groups.map((group) => (
              <section className="koinonia-readiness-panel" key={group.id}>
                <div className="koinonia-readiness-panel-heading">
                  <p className="koinonia-eyebrow">{group.title}</p>
                  <StatusBadge status={getGroupStatus(group.items)} />
                </div>

                <div className="koinonia-readiness-list">
                  {group.items.map((item) => (
                    <article className={`koinonia-readiness-item ${item.status}`} key={item.id}>
                      <div className="koinonia-readiness-item-heading">
                        <h2>{item.title}</h2>
                        <StatusBadge status={item.status} />
                      </div>
                      <p>{item.detail}</p>
                      <small>{item.proof}</small>
                      {item.nextAction ? <strong>{item.nextAction}</strong> : null}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="koinonia-section koinonia-band">
        <div className="koinonia-container">
          <div className="koinonia-readiness-next">
            <p className="koinonia-eyebrow">Recommended Direction</p>
            <h2 className="koinonia-heading">Social login and AI belong here, with guardrails.</h2>
            <div className="koinonia-readiness-next-grid">
              <article>
                <h3>Social Login</h3>
                <p>
                  Use Google and Microsoft through Clerk, but only after invite
                  matching, database role checks, and staff MFA are verified.
                </p>
              </article>
              <article>
                <h3>AI Review</h3>
                <p>
                  Start with a read-only reviewer that flags missing documents,
                  unsigned approvals, deadline risks, billing setup gaps, and
                  showing-access blockers.
                </p>
              </article>
              <article>
                <h3>Testing View</h3>
                <p>
                  Keep this page as the oversight surface for launch checks,
                  staff QA, and provider configuration readiness.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function StatusBadge({ label, status }: { label?: string; status: PortalReadinessStatus }) {
  return (
    <span className={`koinonia-readiness-badge ${status}`}>
      {label ? `${label}: ` : ""}
      {getStatusLabel(status)}
    </span>
  );
}

function getGroupStatus(items: PortalReadinessItem[]): PortalReadinessStatus {
  if (items.some((item) => item.status === "blocked")) return "blocked";
  if (items.some((item) => item.status === "attention")) return "attention";
  return "ready";
}

function getStatusLabel(status: PortalReadinessStatus): string {
  switch (status) {
    case "blocked":
      return "Blocked";
    case "attention":
      return "Needs Attention";
    case "ready":
      return "Ready";
  }
}

function formatDateTime(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(isoDate));
}

async function getPortalDatabaseReadiness(workspaceId: string): Promise<PortalDatabaseReadiness> {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const [workspace, roles, users] = await Promise.all([
      prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { id: true }
      }),
      prisma.role.findMany({
        where: {
          workspaceId,
          name: { in: [...portalReadinessRequiredRoles] }
        },
        select: { name: true, permissions: true }
      }),
      prisma.user.findMany({
        where: {
          workspaceId,
          status: "active"
        },
        select: {
          mfaRequired: true,
          portalAccessStatus: true,
          role: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    const seededRoles = new Set(roles.map((role) => role.name));
    const missingRoles = portalReadinessRequiredRoles.filter((role) => !seededRoles.has(role));
    const rolesMissingPermissions = roles
      .filter((role) => !Array.isArray(role.permissions) || role.permissions.length === 0)
      .map((role) => role.name);
    const activeOwnerCount = users.filter(
      (user) => user.role?.name === "Owner" && user.portalAccessStatus === "active"
    ).length;
    const staffWithoutMfaCount = users.filter(
      (user) => user.role?.name !== "Client" && user.portalAccessStatus === "active" && !user.mfaRequired
    ).length;

    return {
      activeOwnerCount,
      connected: true,
      detail: "Database connection check passed.",
      missingRoles,
      rolesMissingPermissions,
      staffWithoutMfaCount,
      workspaceExists: Boolean(workspace)
    };
  } catch (error) {
    return {
      connected: false,
      detail: "Database readiness check failed."
    };
  }
}
