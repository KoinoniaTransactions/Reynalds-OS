/**
 * GET-only Resend contact lookup by an already-linked contact ID.
 * Not wired to an API route or background job. No creation, update, enrollment or sends.
 * Caller must separately enforce Preview-only access, authorization and workspace scope.
 */
export type ResendLookupResult =
  | { state: "found"; id: string; email: string; unsubscribed: boolean }
  | { state: "not_found" | "unavailable" };

export async function getResendContactSnapshotById(
  contactId: string,
  apiKey: string,
  fetcher: typeof fetch = fetch
): Promise<ResendLookupResult> {
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(contactId) || !apiKey.startsWith("re_")) {
    return { state: "unavailable" };
  }
  try {
    const response = await fetcher("https://api.resend.com/contacts/" + encodeURIComponent(contactId), {
      method: "GET",
      headers: { Authorization: "Bearer " + apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(5000)
    });
    if (response.status === 404) return { state: "not_found" };
    if (!response.ok) return { state: "unavailable" };
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return { state: "unavailable" };
    const data = body as Record<string, unknown>;
    if (data.id !== contactId || typeof data.email !== "string" || typeof data.unsubscribed !== "boolean")
      return { state: "unavailable" };
    return { state: "found", id: contactId, email: data.email, unsubscribed: data.unsubscribed };
  } catch {
    return { state: "unavailable" };
  }
}
