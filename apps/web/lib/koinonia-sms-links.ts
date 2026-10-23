/**
 * Campaign 2 public branded links.
 *
 * IDs are non-sensitive campaign row codes (never names, email, phone).
 * Do not create redirects for unapproved campaigns by silently widening
 * the range. Coordinate campaign IDs with the sales tracker.
 */
export function resolveKoinoniaSmsCampaignCode(rawCode: string): URLSearchParams | null {
  const match = /^K(0[3-5][0-9]|060)$/i.exec(rawCode);
  if (!match) return null;
  const number = Number(match[1]);
  if (number < 31 || number > 60) return null;

  return new URLSearchParams({
    utm_source: "direct_outreach",
    utm_medium: "sms",
    utm_campaign: "agent_intro_pilot2",
    utm_content: `K-${String(number).padStart(3, "0")}`
  });
}
