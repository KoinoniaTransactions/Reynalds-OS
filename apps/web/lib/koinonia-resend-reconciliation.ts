import { normalizeKoinoniaRelationshipData } from "./koinonia-relationship";
import { previewKoinoniaMarketingProvisioning } from "./koinonia-marketing-eligibility";

/** Read-only reconciliation. No provider calls, subscriptions or CRM writes. */
export type ResendContactSnapshot =
  | { state: "found"; id: string; email: string; unsubscribed: boolean }
  | { state: "not_found" | "unavailable" | "ambiguous" };

export function reconcileKoinoniaResendContact(
  rawData: unknown,
  provider: ResendContactSnapshot
) {
  const profile = normalizeKoinoniaRelationshipData(rawData);
  const linkedId = profile.emailMarketing?.resendContactId?.trim() || "";
  const email = profile.contact?.email?.trim().toLowerCase() || "";
  const reasons: string[] = [];

  if (!linkedId) reasons.push("unlinked_identity");
  if (provider.state !== "found") reasons.push("provider_" + provider.state);
  if (provider.state === "found") {
    if (linkedId !== provider.id) reasons.push("contact_id_mismatch");
    if (email !== provider.email.trim().toLowerCase()) reasons.push("email_mismatch");
    if (provider.unsubscribed) reasons.push("provider_unsubscribed");
  }

  // Provider 'found and subscribed' is not comprehensive proof of bounce,
  // complaint, topic permission or safe enrollment. Always fail closed.
  const eligibility = previewKoinoniaMarketingProvisioning(rawData, "unknown");
  return {
    action: "manual_review" as const,
    matched: reasons.length === 0,
    reasons: [...eligibility.reasons, ...reasons],
    email: eligibility.email,
    enrollmentApproved: false
  };
}
