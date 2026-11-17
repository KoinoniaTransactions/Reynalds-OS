/** Approval permission is evaluated server-side from trusted authenticated actor roles. */
export function mayApproveSocialVariant(input: {
  actorRole: string;
  actorId: string;
  creatorId: string;
  ownerSelfApprovalAcknowledged: boolean;
}): boolean {
  if (input.actorRole !== "Owner" && input.actorRole !== "Admin") return false;
  if (input.actorId !== input.creatorId) return true;
  return input.actorRole === "Owner" && input.ownerSelfApprovalAcknowledged === true;
}
