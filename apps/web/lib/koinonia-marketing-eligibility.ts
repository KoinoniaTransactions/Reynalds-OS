import { normalizeKoinoniaRelationshipData } from "./koinonia-relationship";

/** Pure, fail-closed policy. This module never contacts Resend or changes CRM data. */
export type ProviderMarketingStatus = "verified_clear" | "suppressed" | "unknown";
export type MarketingEligibilityReason =
  | "invalid_email" | "not_eligible" | "permission_missing"
  | "permission_date_invalid" | "prior_opt_out"
  | "provider_suppressed" | "provider_unverified";

export function evaluateKoinoniaMarketingEligibility(
  rawData: unknown,
  providerStatus: ProviderMarketingStatus = "unknown"
) {
  const profile = normalizeKoinoniaRelationshipData(rawData);
  const email = (profile.contact?.email ?? "").trim().toLowerCase();
  const m = profile.emailMarketing;
  const reasons: MarketingEligibilityReason[] = [];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) reasons.push("invalid_email");
  if (m?.status !== "eligible") reasons.push("not_eligible");
  if (!m?.permissionSource?.trim()) reasons.push("permission_missing");
  const date = m?.permissionRecordedAt?.trim() ?? "";
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(date)
    || !Number.isFinite(Date.parse(date)) || Date.parse(date) > Date.now()) reasons.push("permission_date_invalid");
  // A previous opt-out is not erased merely by a later eligible flag.
  if (m?.optedOutAt?.trim() || m?.optOutSource?.trim()) reasons.push("prior_opt_out");
  if (providerStatus === "suppressed") reasons.push("provider_suppressed");
  else if (providerStatus !== "verified_clear") reasons.push("provider_unverified");
  return { eligible: reasons.length === 0, email, reasons };
}

/** Never performs network calls, sends, or contact creation. */
export function previewKoinoniaMarketingProvisioning(
  rawData: unknown, providerStatus: ProviderMarketingStatus = "unknown"
) {
  const decision = evaluateKoinoniaMarketingEligibility(rawData, providerStatus);
  return { ...decision, action: decision.eligible ? "eligible_for_review" as const : "skip" as const };
}
