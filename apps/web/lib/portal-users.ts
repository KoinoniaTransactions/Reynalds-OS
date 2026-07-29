export type PortalUserDeactivationInput = {
  actorUserId: string;
  portalAccessStatus: string;
  status: string;
  targetUserId: string;
};

export function getPortalUserDeactivationBlocker(
  input: PortalUserDeactivationInput
): string | null {
  if (input.actorUserId === input.targetUserId) {
    return "You cannot deactivate your own portal access.";
  }

  if (input.status !== "active" || input.portalAccessStatus !== "active") {
    return "Portal user access is already inactive.";
  }

  return null;
}
