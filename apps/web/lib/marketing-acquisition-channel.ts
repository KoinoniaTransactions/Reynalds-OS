/** Report explicit campaign tags separately from verified platform billing/analytics. */
export function marketingAcquisitionChannel(touch?: { utmMedium?: string; gclid?: string; gbraid?: string; wbraid?: string; msclkid?: string; ttclid?: string; fbclid?: string } | null): "paid" | "organic" | "email" | "referral" | "unknown" {
  const medium = touch?.utmMedium?.trim().toLowerCase().replace(/[ -]+/g, "_") ?? "";
  if (["cpc", "ppc", "cpm", "display", "paid", "paid_social", "paid_search", "paidsocial", "paidsearch"].includes(medium)) return "paid";
  if (["organic", "organic_social", "organic_search", "organicsocial"].includes(medium)) return "organic";
  if (["email", "warm_followup", "personal_outbound"].includes(medium)) return "email";
  if (medium === "referral") return "referral";
  // A social click identifier alone does not establish paid acquisition.
  return "unknown";
}
