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

  return new URLSearchParams({
    utm_source: "direct_outreach",
    utm_medium: "sms",
    utm_campaign: number <= 60 ? "agent_intro_pilot2" : "agent_intro_next60",
    utm_content: `K-${String(number).padStart(3, "0")}`
  });
}
