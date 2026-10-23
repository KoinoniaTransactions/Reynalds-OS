import { normalizeKoinoniaRelationshipData } from "./koinonia-relationship";

/** Consent quality audit only. No writes, provider requests or send authorization. */
export function auditKoinoniaMarketingConsent(rawData: unknown) {
  const p = normalizeKoinoniaRelationshipData(rawData);
  const m = p.emailMarketing;
  const reasons: string[] = [];
  const email = p.contact?.email?.trim().toLowerCase() ?? "";
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) reasons.push("invalid_email");
  if (m?.status !== "eligible") reasons.push("not_eligible");
  const source = m?.permissionSource?.trim() ?? "";
  if (!source) reasons.push("permission_missing");
  // A recorded source is not automatically proof of valid permission.
  if (/^(import|purchased|scraped|unknown|inferred|business card)$/i.test(source)) reasons.push("permission_source_needs_review");
  const date = m?.permissionRecordedAt?.trim() ?? "";
  if (!/^\\d{4}-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d(?:\\.\\d+)?(?:Z|[+-]\\d\\d:\\d\\d)$/.test(date) ||
      !Number.isFinite(Date.parse(date)) || Date.parse(date) > Date.now())
    reasons.push("permission_date_invalid");
  if (m?.optedOutAt?.trim() || m?.optOutSource?.trim() || m?.status === "unsubscribed" || m?.status === "do_not_contact")
    reasons.push("prior_opt_out");
  if (!Array.isArray(m?.topicConsents) || m.topicConsents.length === 0)
    reasons.push("topic_permission_unverified");
  return { email, permissionEvidenceComplete: reasons.length === 0, action: "manual_review" as const,
    enrollmentApproved: false as const, reasons: [...new Set(reasons)] };
}
