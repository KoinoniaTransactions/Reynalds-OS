/** Read-only topic snapshot; never authorizes enrollment or implies consent. */
export type ContactTopicsSnapshot =
  | { state: "found"; count: number; hasMore: boolean; optedIn: number; optedOut: number }
  | { state: "unavailable" };

export async function getResendContactTopicsSnapshot(
  contactId: string, apiKey: string, fetcher: typeof fetch = fetch
): Promise<ContactTopicsSnapshot> {
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(contactId) || !apiKey.startsWith("re_"))
    return { state: "unavailable" };
  try {
    const response = await fetcher(
      "https://api.resend.com/contacts/" + encodeURIComponent(contactId) + "/topics",
      { method: "GET", headers: { Authorization: "Bearer " + apiKey }, cache: "no-store",
        signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) return { state: "unavailable" };
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || Array.isArray(body))
      return { state: "unavailable" };
    const data = body as Record<string, unknown>;
    if (data.object !== "list" || typeof data.has_more !== "boolean" || !Array.isArray(data.data))
      return { state: "unavailable" };
    let optedIn = 0, optedOut = 0;
    const ids = new Set<string>();
    for (const raw of data.data) {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { state: "unavailable" };
      const item = raw as Record<string, unknown>;
      if (typeof item.id !== "string" || !item.id || ids.has(item.id) ||
          (item.subscription !== "opt_in" && item.subscription !== "opt_out"))
        return { state: "unavailable" };
      ids.add(item.id);
      if (item.subscription === "opt_in") optedIn++; else optedOut++;
    }
    // Pagination or a missing specific verified topic prevents positive membership inference.
    return { state: "found", count: ids.size, hasMore: data.has_more, optedIn, optedOut };
  } catch { return { state: "unavailable" }; }
}
