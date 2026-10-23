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
  const identityReasons: string[] = [];
  const providerReasons: string[] = [];

  if (!linkedId) identityReasons.push("unlinked_identity");
  if (provider.state !== "found") identityReasons.push("provider_" + provider.state);
  if (provider.state === "found") {
    if (linkedId !== provider.id) identityReasons.push("contact_id_mismatch");
    if (email !== provider.email.trim().toLowerCase()) identityReasons.push("email_mismatch");
    if (provider.unsubscribed) providerReasons.push("provider_unsubscribed");
  }

  // Provider 'found and subscribed' is not comprehensive proof of bounce,
  // complaint, topic permission or safe enrollment. Always fail closed.
  const eligibility = previewKoinoniaMarketingProvisioning(rawData, "unknown");
  return {
    action: "manual_review" as const,
    identityMatched: identityReasons.length === 0,
    marketingEligible: false,
    providerUnsubscribed: provider.state === "found" ? provider.unsubscribed : null,
    // Retain the legacy field for existing consumers; now it means identity only.
    matched: identityReasons.length === 0,
    reasons: [...eligibility.reasons, ...identityReasons, ...providerReasons],
    email: eligibility.email,
    enrollmentApproved: false
  };
}
