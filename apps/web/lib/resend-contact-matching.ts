import { normalizeKoinoniaRelationshipData, type KoinoniaRelationshipData } from "./koinonia-relationship";

/**
 * Fail closed: only a single, explicitly linked Resend contact may be updated.
 * Email addresses alone are not authoritative: they can appear in several workspaces.
 * The caller must first scope the candidate records to the Koinonia workspace.
 */
export function selectLinkedMarketingRelationship(
  candidates: Array<{ id: string; data: unknown }>,
  contactId: string,
  email: string
): { id: string; profile: KoinoniaRelationshipData } | null {
  if (!contactId.trim() || !email.trim()) return null;
  const matches = candidates.flatMap((candidate) => {
    const profile = normalizeKoinoniaRelationshipData(candidate.data);
    const idMatches = profile.emailMarketing?.resendContactId === contactId;
    const emailMatches = profile.contact?.email?.trim().toLowerCase() === email.trim().toLowerCase();
    return idMatches && emailMatches ? [{ id: candidate.id, profile }] : [];
  });
  return matches.length === 1 ? matches[0] : null;
}

/** Unsubscribe can only tighten eligibility, never grant it. */
export function applyGlobalMarketingUnsubscribe(
  profile: KoinoniaRelationshipData,
  timestamp: string
): KoinoniaRelationshipData {
  const previous = profile.emailMarketing ?? {};
  if (previous.status === "do_not_contact") return profile;
  return {
    ...profile,
    emailMarketing: {
      ...previous,
      status: "unsubscribed",
      optedOutAt: previous.optedOutAt || timestamp,
      optOutSource: previous.optOutSource || "resend"
    }
  };
}
