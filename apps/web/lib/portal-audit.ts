export const portalAuditActionPrefix = "portal.";

export function isPortalAuditAction(action: string): boolean {
  return action.startsWith(portalAuditActionPrefix);
}

export function normalizeAuditLimit(value: string | null, defaultLimit = 25, maxLimit = 100): number {
  if (!value) {
    return defaultLimit;
  }

  const parsedLimit = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
    return defaultLimit;
  }

  return Math.min(parsedLimit, maxLimit);
}

export function getHumanAuditAction(action: string): string {
  switch (action) {
    case "portal.invitation.created":
      return "Invitation Created";
    case "portal.invitation.provider_sent":
      return "Provider Invite Sent";
    case "portal.invitation.provider_error":
      return "Provider Invite Review";
    case "portal.invitation.accepted":
      return "Invitation Accepted";
    case "portal.invitation.revoked":
      return "Invitation Revoked";
    case "portal.user.deactivated":
      return "User Deactivated";
    default:
      return action
        .replace(/^portal\./, "")
        .split(/[._\s-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
  }
}
