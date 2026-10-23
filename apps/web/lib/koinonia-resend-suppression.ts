/** Read-only Resend suppression check, never sufficient alone to approve marketing. */
export type SuppressionCheck =
  | { state: "suppressed"; origin: "bounce" | "complaint" | "manual"; observedAt: string }
  | { state: "not_found" | "unavailable" };

export async function getResendSuppressionSnapshot(
  emailInput: string, apiKey: string, fetcher: typeof fetch = fetch
): Promise<SuppressionCheck> {
  const email = emailInput.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !apiKey.startsWith("re_")) {
    return { state: "unavailable" };
  }
  try {
    const response = await fetcher("https://api.resend.com/suppressions/" + encodeURIComponent(email), {
      method: "GET",
      headers: { Authorization: "Bearer " + apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(5000)
    });
    // A documented 404 may mean no record, but is NOT blanket proof of
    // permission, topic choice or deliverability.
    if (response.status === 404) return { state: "not_found" };
    if (!response.ok) return { state: "unavailable" };
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) return { state: "unavailable" };
    const s = data as Record<string, unknown>;
    if (s.email !== email || s.object !== "suppression" ||
        (s.origin !== "bounce" && s.origin !== "complaint" && s.origin !== "manual") ||
        typeof s.created_at !== "string" || !Number.isFinite(Date.parse(s.created_at))) {
      return { state: "unavailable" };
    }
    return { state: "suppressed", origin: s.origin, observedAt: s.created_at };
  } catch { return { state: "unavailable" }; }
}
