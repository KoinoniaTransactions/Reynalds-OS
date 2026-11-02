/** Social content workflow only. This module does not schedule or publish externally. */
export type SocialVariantStatus =
  | "draft" | "in_review" | "changes_requested" | "approved"
  | "scheduled" | "publishing" | "published" | "failed"
  | "needs_reauthorization" | "canceled";

const allowed: Record<SocialVariantStatus, readonly SocialVariantStatus[]> = {
  draft: ["in_review", "canceled"],
  in_review: ["approved", "changes_requested", "canceled"],
  changes_requested: ["draft", "in_review", "canceled"],
  approved: ["scheduled", "draft", "canceled"],
  scheduled: ["publishing", "canceled", "needs_reauthorization"],
  publishing: ["published", "failed", "needs_reauthorization"],
  published: [],
  failed: ["scheduled", "canceled"],
  needs_reauthorization: ["scheduled", "canceled"],
  canceled: []
};

export function canTransitionSocialVariant(from: SocialVariantStatus, to: SocialVariantStatus): boolean {
  return allowed[from]?.includes(to) ?? false;
}

export function assertSocialVariantTransition(from: SocialVariantStatus, to: SocialVariantStatus): void {
  if (!canTransitionSocialVariant(from, to)) throw new Error(`Invalid social variant status transition: ${from} -> ${to}`);
}

/** Any approved content change requires a new approval for the incremented revision. */
export function nextEditedSocialRevision(currentRevision: number): { revision: number; status: "draft" } {
  if (!Number.isSafeInteger(currentRevision) || currentRevision < 1) throw new Error("Invalid revision");
  return { revision: currentRevision + 1, status: "draft" };
}

/** Explicit deny-by-default gate; never interpreted as owner approval. */
export function socialPublishingGloballyEnabled(value: string | undefined): boolean {
  return value === "true";
}

export function canQueueApprovedSocialVariant(input: {
  status: SocialVariantStatus;
  revision: number;
  approvedRevision: number | null;
  connectionStatus: string;
  globalEnabled: boolean;
  channelEnabled: boolean;
}): boolean {
  return input.status === "approved" &&
    input.approvedRevision === input.revision &&
    input.connectionStatus === "connected" &&
    input.globalEnabled &&
    input.channelEnabled;
}
