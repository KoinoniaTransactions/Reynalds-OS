/**
 * Campaign 2 and next-60 public branded links.
 *
 * IDs are non-sensitive campaign row codes (never names, email, phone).
 * Do not create redirects for unapproved campaigns by silently widening
 * the range. Coordinate campaign IDs with the sales tracker.
 */
export function resolveKoinoniaSmsCampaignCode(rawCode: string): URLSearchParams | null {
  const match = /^K(0[3-9][0-9]|1[0-3][0-9])$/i.exec(rawCode);
  if (!match) return null;
  const number = Number(match[1]);
  if (number < 31 || number > 137) return null;
  // Only campaign-approved prospect codes resolve. Missing IDs stay 404.
  const nextCampaignCodes = new Set<number>([61, 62, 64, 65, 67, 69, 70, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 89, 90, 91, 92, 95, 99, 100, 101, 104, 106, 107, 108, 109, 110, 112, 113, 114, 116, 117, 118, 119, 120, 121, 122, 123, 125, 126, 127, 128, 130, 131, 132, 133, 134, 135, 136, 137]);
  if (number > 60 && !nextCampaignCodes.has(number)) return null;

  return new URLSearchParams({
    utm_source: "direct_outreach",
    utm_medium: "sms",
    utm_campaign: number <= 60 ? "agent_intro_pilot2" : "agent_intro_next60",
    utm_content: `K-${String(number).padStart(3, "0")}`
  });
}
