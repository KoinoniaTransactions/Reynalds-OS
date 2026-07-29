import type {
  PortalReadinessItem,
  PortalReadinessReport,
  PortalReadinessStatus
} from "./portal-readiness";

export type PortalLaunchChecklistPhaseId =
  | "provider"
  | "database"
  | "service-workflows"
  | "documents"
  | "billing"
  | "social-ai"
  | "live-validation";

export type PortalLaunchChecklistLink = {
  href: string;
  label: string;
};

export type PortalLaunchChecklistItem = {
  detail: string;
  id: string;
  link?: PortalLaunchChecklistLink;
  owner: string;
  phase: PortalLaunchChecklistPhaseId;
  proof: string;
  readinessItemIds?: string[];
  readinessGate: string;
  required: boolean;
  title: string;
};

export type PortalLaunchChecklistStatus = PortalReadinessStatus | "manual";

export type PortalLaunchChecklistItemStatus = PortalLaunchChecklistItem & {
  latestProof?: PortalLaunchChecklistProofRecord;
  readinessItems: PortalReadinessItem[];
  status: PortalLaunchChecklistStatus;
  statusDetail: string;
  statusLabel: string;
};

export type PortalLaunchChecklistPhase = {
  id: PortalLaunchChecklistPhaseId;
  items: PortalLaunchChecklistItem[];
  title: string;
};

export type PortalLaunchChecklistPhaseStatus = {
  id: PortalLaunchChecklistPhaseId;
  items: PortalLaunchChecklistItemStatus[];
  summary: PortalLaunchChecklistPhaseStatusSummary;
  title: string;
};

export type PortalLaunchChecklistPhaseStatusSummary = {
  attentionCount: number;
  blockedCount: number;
  manualCount: number;
  readyCount: number;
  requiredRemainingCount: number;
};

export type PortalLaunchChecklistSummary = {
  itemCount: number;
  optionalCount: number;
  phaseCount: number;
  requiredCount: number;
};

export type PortalLaunchChecklistReport = {
  generatedAt: string;
  overallStatus: PortalLaunchChecklistStatus;
  phases: PortalLaunchChecklistPhaseStatus[];
  summary: Array<{
    label: string;
    value: string;
  }>;
  workspaceId: string;
};

export type PortalLaunchChecklistProofRecord = {
  checklistItemId: string;
  evidenceUrl?: string;
  id: string;
  notes: string;
  proofDate: string;
  proofOwner: string;
  recordedAt: string;
  recordedByEmail?: string;
  recordedByName?: string;
  status: "Completed" | "Needs Follow-up";
};

export const portalLaunchChecklistPhases: PortalLaunchChecklistPhase[] = [
  {
    id: "provider",
    title: "Provider And Login",
    items: [
      {
        detail:
          "Production Clerk keys, hosted sign-in routing, and mock-auth blocking are configured in the deployment environment.",
        id: "clerk-production-auth",
        link: { href: "/employee/readiness", label: "Open Readiness" },
        owner: "Owner / Operations",
        phase: "provider",
        proof:
          "Readiness shows managed auth, production Clerk keys, hosted login, and mock auth as ready.",
        readinessItemIds: ["auth-provider", "clerk-keys", "hosted-login", "mock-auth"],
        readinessGate: "AUTH_PROVIDER=clerk with production Clerk keys and ROS_ALLOW_MOCK_AUTH=false.",
        required: true,
        title: "Production login is provider-backed"
      },
      {
        detail:
          "Every active staff user has MFA required before internal client, document, assignment, billing, or audit screens are used.",
        id: "staff-mfa-policy",
        link: { href: "/employee/access", label: "Open Access" },
        owner: "Owner / Operations",
        phase: "provider",
        proof: "Access workspace and readiness checks show zero active staff users missing MFA.",
        readinessItemIds: ["staff-mfa"],
        readinessGate: "Staff MFA is enforced in Clerk and reflected on active portal users.",
        required: true,
        title: "Staff MFA policy is verified"
      }
    ]
  },
  {
    id: "database",
    title: "Database And Access",
    items: [
      {
        detail:
          "The Koinonia workspace, approved role names, stored permission lists, and active Owner user are present in production storage.",
        id: "workspace-role-seed",
        link: { href: "/employee/access", label: "Open Access" },
        owner: "Owner / Operations",
        phase: "database",
        proof:
          "Readiness and access workspace show the workspace, roles, permissions, and active Owner account as ready.",
        readinessItemIds: ["database", "workspace", "roles", "owner"],
        readinessGate: "Production database is reachable and seeded with approved Koinonia portal roles.",
        required: true,
        title: "Workspace and roles are seeded"
      },
      {
        detail:
          "A real invited client and a real invited staff user have accepted their invitations and landed in the right portal view.",
        id: "accepted-client-staff-invites",
        link: { href: "/employee/access", label: "Open Access" },
        owner: "Owner / Operations",
        phase: "database",
        proof:
          "Readiness reports at least one accepted client invitation and one accepted staff invitation.",
        readinessItemIds: ["invite-acceptance"],
        readinessGate: "Invite acceptance works for both Client and staff roles before public launch.",
        required: true,
        title: "Client and staff invitation acceptance is proven"
      }
    ]
  },
  {
    id: "service-workflows",
    title: "Service Workflow QA",
    items: [
      {
        detail:
          "A contract-to-close sample file can be assigned, tracked by status, and reviewed for missing next actions.",
        id: "transaction-support-qa",
        link: { href: "/employee/dashboard", label: "Open Dashboard" },
        owner: "Transaction Coordinator",
        phase: "service-workflows",
        proof: "Employee dashboard shows assigned owner, backup owner, client, package, status, and next touch.",
        readinessGate: "Transaction Support workflows map cleanly to staff ownership and client status.",
        required: true,
        title: "Transaction Support workflow is testable"
      },
      {
        detail:
          "A contract and document support request can move through intake, internal review, staff approval, and client-visible status without exposing legal advice as automated output.",
        id: "contract-document-support-qa",
        link: { href: "/employee/review", label: "Open Staff Review" },
        owner: "Contract Support",
        phase: "service-workflows",
        proof: "Staff Review flags missing assignments, document gaps, stale work, and approval needs.",
        readinessGate: "Contract and document work stays staff-reviewed before client-facing action.",
        required: true,
        title: "Contract and document support is staff-reviewed"
      },
      {
        detail:
          "A client can request showing coverage or scheduling help, and staff can review timing, access needs, authorization, and assignment.",
        id: "showing-request-qa",
        link: { href: "/employee/dashboard", label: "Open Dashboard" },
        owner: "Showing Provider / Operations",
        phase: "service-workflows",
        proof: "Showing request queue displays current timing, notes, status, and next action.",
        readinessGate: "Showing requests are captured without unsafe login details and are visible for assignment.",
        required: true,
        title: "Showing request flow is ready for test clients"
      },
      {
        detail:
          "Monthly operations work can be represented as recurring service work with owner, backup, scope, status, and next touch.",
        id: "monthly-operations-qa",
        link: { href: "/employee/dashboard", label: "Open Dashboard" },
        owner: "Customer Success / Operations",
        phase: "service-workflows",
        proof: "Assigned client table can show package, active work, owner, backup, and next touch.",
        readinessGate: "Operations Partnership clients have repeatable ownership and follow-up visibility.",
        required: true,
        title: "Monthly Operations Partnership workflow is visible"
      }
    ]
  },
  {
    id: "documents",
    title: "Documents",
    items: [
      {
        detail:
          "Document uploads write to private storage, are scanner-gated, and can be downloaded only through protected portal routes.",
        id: "private-document-storage",
        link: { href: "/employee/documents", label: "Open Documents" },
        owner: "Operations / Document Staff",
        phase: "documents",
        proof:
          "Readiness shows absolute private upload storage, scanner command, and authorized download checks as ready.",
        readinessItemIds: ["document-storage", "document-scanner", "document-downloads"],
        readinessGate:
          "PORTAL_DOCUMENT_UPLOAD_DIR and PORTAL_DOCUMENT_MALWARE_SCAN_COMMAND are production-safe.",
        required: true,
        title: "Private document handling is verified"
      },
      {
        detail:
          "Client and staff document notes reject passwords, access codes, and sensitive credential language.",
        id: "document-sensitive-note-filter",
        link: { href: "/employee/documents", label: "Open Documents" },
        owner: "Operations / Document Staff",
        phase: "documents",
        proof: "Document intake validation tests pass and unsafe note language is rejected.",
        readinessGate: "Documents collect file context, not credentials or private access codes.",
        required: true,
        title: "Document notes are safe to collect"
      }
    ]
  },
  {
    id: "billing",
    title: "Billing And Payment",
    items: [
      {
        detail:
          "Prepay, pay-at-close, monthly, and invoice-later billing setup can be recorded for each client file without storing raw card data.",
        id: "billing-model-setup",
        link: { href: "/employee/billing", label: "Open Billing" },
        owner: "Finance / Owner",
        phase: "billing",
        proof:
          "Billing workspace shows request status, billing model, consent status, service context, and staff next action.",
        readinessItemIds: ["billing-metadata"],
        readinessGate: "Billing setup requests keep payment metadata separate from raw payment credentials.",
        required: true,
        title: "Client billing setup is file-level"
      },
      {
        detail:
          "The production payment processor setup link and webhook secret are configured so cards can be captured by the processor instead of the portal.",
        id: "payment-processor-tokenization",
        link: { href: "/employee/readiness", label: "Open Readiness" },
        owner: "Finance / Owner",
        phase: "billing",
        proof:
          "Readiness shows payment provider, public HTTPS setup URL, and webhook secret as configured.",
        readinessItemIds: ["payment-processor", "payment-setup-url", "payment-webhook-secret"],
        readinessGate: "Processor-hosted payment capture is ready before billing requests are sent to clients.",
        required: true,
        title: "Payment capture stays processor-hosted"
      }
    ]
  },
  {
    id: "social-ai",
    title: "Optional Social Login And AI",
    items: [
      {
        detail:
          "Google and Microsoft social login can be enabled only after invitation matching is tested with real client and staff accounts.",
        id: "social-login-provider-test",
        link: { href: "/employee/readiness", label: "Open Readiness" },
        owner: "Owner / Operations",
        phase: "social-ai",
        proof:
          "Readiness shows approved social providers and invite matching verified when social login is enabled.",
        readinessItemIds: ["social-login"],
        readinessGate:
          "KOINONIA_SOCIAL_LOGIN_INVITE_MATCHING_VERIFIED=true only after real invited-account testing.",
        required: false,
        title: "Social login remains invitation-gated"
      },
      {
        detail:
          "AI can help staff notice missing documents, billing gaps, access blockers, and stale work only after prompts, privacy rules, citations, audit logging, and human approval are approved.",
        id: "ai-review-controls",
        link: { href: "/employee/review", label: "Open Staff Review" },
        owner: "Owner / Operations",
        phase: "social-ai",
        proof:
          "Readiness shows AI review ready only if all launch-control flags and provider configuration are present.",
        readinessItemIds: ["ai-review"],
        readinessGate: "AI is optional for base launch and must stay read-only until all controls pass.",
        required: false,
        title: "AI staff assist remains controlled"
      }
    ]
  },
  {
    id: "live-validation",
    title: "Live Validation",
    items: [
      {
        detail:
          "The full verifier is run against the target production environment with real database connectivity before any real client files are accepted.",
        id: "full-production-verifier",
        link: { href: "/employee/readiness", label: "Open Readiness" },
        owner: "Owner / Operations",
        phase: "live-validation",
        proof: "Verifier output passes without source-only or database-skip mode.",
        readinessGate: "pnpm verify:portal passes without --skip-database.",
        required: true,
        title: "Full production verifier passes"
      },
      {
        detail:
          "A staff member walks one sample client through login, document upload, showing request, access request, billing setup, and dashboard status review.",
        id: "end-to-end-client-dry-run",
        link: { href: "/client/dashboard", label: "Open Client Preview" },
        owner: "Owner / Operations",
        phase: "live-validation",
        proof: "Dry-run notes confirm expected portal visibility and no unsafe sensitive data capture.",
        readinessGate: "One end-to-end test client flow passes with a real provider-backed user.",
        required: true,
        title: "End-to-end client dry run is complete"
      }
    ]
  }
];

export function getPortalLaunchChecklistPhases(): PortalLaunchChecklistPhase[] {
  return portalLaunchChecklistPhases;
}

export function getPortalLaunchChecklistItemById(
  checklistItemId: string
): PortalLaunchChecklistItem | undefined {
  return portalLaunchChecklistPhases
    .flatMap((phase) => phase.items)
    .find((item) => item.id === checklistItemId);
}

export function getPortalLaunchChecklistSummary(): PortalLaunchChecklistSummary {
  const items = portalLaunchChecklistPhases.flatMap((phase) => phase.items);
  const requiredCount = items.filter((item) => item.required).length;

  return {
    itemCount: items.length,
    optionalCount: items.length - requiredCount,
    phaseCount: portalLaunchChecklistPhases.length,
    requiredCount
  };
}

export function buildPortalLaunchChecklistReport(
  readinessReport: PortalReadinessReport,
  proofRecords: PortalLaunchChecklistProofRecord[] = []
): PortalLaunchChecklistReport {
  const readinessItemsById = new Map(
    readinessReport.groups.flatMap((group) => group.items).map((item) => [item.id, item])
  );
  const latestProofsByChecklistItemId = getLatestProofsByChecklistItemId(proofRecords);
  const phases = portalLaunchChecklistPhases.map((phase) => {
    const items = phase.items.map((item) =>
      getChecklistItemStatus(item, readinessItemsById, latestProofsByChecklistItemId)
    );

    return {
      ...phase,
      items,
      summary: getPhaseStatusSummary(items)
    };
  });
  const items = phases.flatMap((phase) => phase.items);
  const requiredItems = items.filter((item) => item.required);
  const readyCount = items.filter((item) => item.status === "ready").length;
  const attentionCount = items.filter((item) => item.status === "attention").length;
  const blockedCount = items.filter((item) => item.status === "blocked").length;
  const manualCount = items.filter((item) => item.status === "manual").length;
  const requiredReadyCount = requiredItems.filter((item) => item.status === "ready").length;
  const requiredAttentionCount = requiredItems.filter((item) => item.status === "attention").length;
  const requiredBlockedCount = requiredItems.filter((item) => item.status === "blocked").length;
  const requiredManualCount = requiredItems.filter((item) => item.status === "manual").length;
  const requiredRemainingCount = requiredItems.length - requiredReadyCount;
  const staticSummary = getPortalLaunchChecklistSummary();

  return {
    generatedAt: readinessReport.generatedAt,
    overallStatus:
      requiredBlockedCount > 0
        ? "blocked"
        : requiredAttentionCount > 0
          ? "attention"
          : requiredManualCount > 0
            ? "manual"
            : "ready",
    phases,
    summary: [
      { label: "Ready", value: String(readyCount) },
      { label: "Needs Attention", value: String(attentionCount) },
      { label: "Blocked", value: String(blockedCount) },
      { label: "Manual Proof Needed", value: String(manualCount) },
      { label: "Required Ready", value: String(requiredReadyCount) },
      { label: "Required Remaining", value: String(requiredRemainingCount) },
      { label: "Required", value: String(staticSummary.requiredCount) },
      { label: "Optional", value: String(staticSummary.optionalCount) }
    ],
    workspaceId: readinessReport.workspaceId
  };
}

function getPhaseStatusSummary(
  items: PortalLaunchChecklistItemStatus[]
): PortalLaunchChecklistPhaseStatusSummary {
  const readyCount = items.filter((item) => item.status === "ready").length;

  return {
    attentionCount: items.filter((item) => item.status === "attention").length,
    blockedCount: items.filter((item) => item.status === "blocked").length,
    manualCount: items.filter((item) => item.status === "manual").length,
    readyCount,
    requiredRemainingCount: items.filter((item) => item.required && item.status !== "ready").length
  };
}

function getChecklistItemStatus(
  item: PortalLaunchChecklistItem,
  readinessItemsById: Map<string, PortalReadinessItem>,
  latestProofsByChecklistItemId: Map<string, PortalLaunchChecklistProofRecord>
): PortalLaunchChecklistItemStatus {
  const readinessItems = (item.readinessItemIds ?? [])
    .map((id) => readinessItemsById.get(id))
    .filter((readinessItem): readinessItem is PortalReadinessItem => Boolean(readinessItem));
  const latestProof = latestProofsByChecklistItemId.get(item.id);

  if (!item.readinessItemIds || item.readinessItemIds.length === 0) {
    if (latestProof?.status === "Completed") {
      return {
        ...item,
        latestProof,
        readinessItems,
        status: "ready",
        statusDetail: `Proof recorded by ${latestProof.proofOwner} on ${latestProof.proofDate}.`,
        statusLabel: "Ready"
      };
    }

    if (latestProof?.status === "Needs Follow-up") {
      return {
        ...item,
        latestProof,
        readinessItems,
        status: "attention",
        statusDetail: `Follow-up recorded by ${latestProof.proofOwner} on ${latestProof.proofDate}.`,
        statusLabel: "Needs Attention"
      };
    }

    return {
      ...item,
      readinessItems,
      status: "manual",
      statusDetail: "Staff must complete and record this proof outside the automated readiness checks.",
      statusLabel: "Manual Proof Needed"
    };
  }

  if (readinessItems.length !== item.readinessItemIds.length) {
    return {
      ...item,
      readinessItems,
      status: "attention",
      statusDetail: "One or more linked readiness checks could not be found.",
      statusLabel: "Needs Attention"
    };
  }

  const blockedItem = readinessItems.find((readinessItem) => readinessItem.status === "blocked");
  if (blockedItem) {
    return {
      ...item,
      readinessItems,
      status: "blocked",
      statusDetail: blockedItem.nextAction ?? blockedItem.proof,
      statusLabel: "Blocked"
    };
  }

  const attentionItem = readinessItems.find((readinessItem) => readinessItem.status === "attention");
  if (attentionItem) {
    return {
      ...item,
      readinessItems,
      status: "attention",
      statusDetail: attentionItem.nextAction ?? attentionItem.proof,
      statusLabel: "Needs Attention"
    };
  }

  return {
    ...item,
    readinessItems,
    status: "ready",
    statusDetail: "Linked readiness checks are currently ready.",
    statusLabel: "Ready"
  };
}

function getLatestProofsByChecklistItemId(
  proofRecords: PortalLaunchChecklistProofRecord[]
): Map<string, PortalLaunchChecklistProofRecord> {
  return proofRecords.reduce((latest, proofRecord) => {
    const current = latest.get(proofRecord.checklistItemId);

    if (!current || proofRecord.recordedAt > current.recordedAt) {
      latest.set(proofRecord.checklistItemId, proofRecord);
    }

    return latest;
  }, new Map<string, PortalLaunchChecklistProofRecord>());
}
