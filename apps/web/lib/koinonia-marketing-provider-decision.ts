import { evaluateKoinoniaMarketingEligibility } from "./koinonia-marketing-eligibility";
import type { ResendContactSnapshot } from "./koinonia-resend-reconciliation";
import type { SuppressionCheck } from "./koinonia-resend-suppression";
import { normalizeKoinoniaRelationshipData } from "./koinonia-relationship";

/** Pure combined provider/CRM gate. Read-only; never authorizes enrollment. */
export function evaluateKoinoniaProviderDecision(
  rawData: unknown, contact: ResendContactSnapshot, suppression: SuppressionCheck
) {
  const profile = normalizeKoinoniaRelationshipData(rawData);
  const linkedId = profile.emailMarketing?.resendContactId?.trim() ?? "";
  const email = profile.contact?.email?.trim().toLowerCase() ?? "";
  const reasons: string[] = [];
  if (!linkedId) reasons.push("unlinked_identity");
  if (contact.state !== "found") reasons.push("contact_" + contact.state);
  if (contact.state === "found") {
    if (contact.id !== linkedId) reasons.push("contact_id_mismatch");
    if (contact.email.trim().toLowerCase() !== email) reasons.push("email_mismatch");
    if (contact.unsubscribed) reasons.push("provider_unsubscribed");
  }
  if (suppression.state === "suppressed") reasons.push("provider_suppressed");
  if (suppression.state === "unavailable") reasons.push("suppression_unverified");
  const crm = evaluateKoinoniaMarketingEligibility(rawData, "unknown");
  // Even a verified clear provider and CRM permission are not proof of topic
  // consent or complete provider suppression coverage; intentionally fail closed.
  reasons.push(...crm.reasons);
  if (!reasons.includes("topic_permission_unverified")) reasons.push("topic_permission_unverified");
  return {
    identityMatched: contact.state === "found" && !!linkedId &&
      contact.id === linkedId && contact.email.trim().toLowerCase() === email,
    providerUnsubscribed: contact.state === "found" ? contact.unsubscribed : null,
    suppressionState: suppression.state,
    marketingEligible: false as const,
    enrollmentApproved: false as const,
    action: "manual_review" as const,
    reasons: [...new Set(reasons)]
  };
}
