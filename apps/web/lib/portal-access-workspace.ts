export type AccessSummaryCounts = {
  activeAccess: number;
  blockedAccess: number;
  mfaRequired: number;
  pendingInvitations: number;
};

export type AccessSummaryCard = {
  body: string;
  label: string;
  value: string;
};

export type PortalUserAccessState = {
  mfaRequired: boolean;
  portalAccessStatus: string;
  roleName?: string | null;
  status: string;
};

export type PortalInvitationState = {
  status: string;
};

const pendingInvitationStatuses = new Set(["pending", "provider_pending", "provider_error"]);
const blockedInvitationStatuses = new Set(["provider_error", "revoked", "expired"]);

export function buildAccessSummaryCards(counts: AccessSummaryCounts): AccessSummaryCard[] {
  return [
    {
      label: "Pending Invites",
      value: String(counts.pendingInvitations),
      body: "Client and staff users waiting on invitation, acceptance, or profile setup."
    },
    {
      label: "MFA Required",
      value: String(counts.mfaRequired),
      body: "Internal staff accounts that must keep stronger sign-in protection enabled."
    },
    {
      label: "Active Access",
      value: String(counts.activeAccess),
      body: "Users mapped to Koinonia roles, workspace access, and current service ownership."
    },
    {
      label: "Blocked",
      value: String(counts.blockedAccess),
      body: "Access records held until ownership, billing, or security questions are resolved."
    }
  ];
}

export function getAccessSummaryCounts(
  users: PortalUserAccessState[],
  invitations: PortalInvitationState[]
): AccessSummaryCounts {
  return {
    pendingInvitations: invitations.filter((invitation) => pendingInvitationStatuses.has(invitation.status)).length,
    mfaRequired: users.filter(
      (user) => user.mfaRequired && user.status === "active" && user.portalAccessStatus === "active"
    ).length,
    activeAccess: users.filter((user) => user.status === "active" && user.portalAccessStatus === "active").length,
    blockedAccess:
      users.filter((user) => user.status !== "active" || user.portalAccessStatus !== "active").length +
      invitations.filter((invitation) => blockedInvitationStatuses.has(invitation.status)).length
  };
}

export function getHumanInvitationStatus(status: string): string {
  switch (status) {
    case "provider_pending":
      return "Invite Sent";
    case "provider_error":
      return "Send Review";
    case "accepted":
      return "Accepted";
    case "revoked":
      return "Revoked";
    case "expired":
      return "Expired";
    case "pending":
      return "Pending Send";
    default:
      return titleizeStatus(status);
  }
}

export function getHumanPortalAccessStatus(status: string, portalAccessStatus: string): string {
  if (status !== "active") {
    return titleizeStatus(status);
  }

  switch (portalAccessStatus) {
    case "active":
      return "Active";
    case "deactivated":
      return "Deactivated";
    case "pending":
      return "Pending";
    case "blocked":
      return "Blocked";
    default:
      return titleizeStatus(portalAccessStatus);
  }
}

export function getMfaLabel(user: PortalUserAccessState): string {
  if (user.roleName === "Client") {
    return user.mfaRequired ? "Required" : "Client Optional";
  }

  return user.mfaRequired ? "Required" : "Needs Review";
}

export function isStaffPortalUser(user: PortalUserAccessState): boolean {
  return user.roleName !== "Client";
}

export function getServiceContextText(
  value: unknown,
  keys: string[],
  fallback: string
): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fallback;
  }

  const record = value as Record<string, unknown>;

  for (const key of keys) {
    const candidate = record[key];

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return fallback;
}

function titleizeStatus(status: string): string {
  return status
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
