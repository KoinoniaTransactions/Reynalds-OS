/** Preview-only commercial email footer renderer. Never sends or enables subscriptions. */
export const KOINONIA_DRAFT_MAILING_ADDRESS = [
  "Koinonia Transactions LLC",
  "14101 Scarlet Sage St",
  "Parker, CO 80134",
] as const;

export function previewKoinoniaCommercialFooter(unsubscribeUrl: unknown) {
  // Refuse a bogus link; sender must supply a verified recipient-specific unsubscribe URL.
  if (typeof unsubscribeUrl !== "string") return { ready: false as const, reason: "unsubscribe_url_missing" as const };
  let url: URL;
  try { url = new URL(unsubscribeUrl); }
  catch { return { ready: false as const, reason: "unsubscribe_url_invalid" as const }; }
  if (url.protocol !== "https:" || !url.hostname || url.username || url.password)
    return { ready: false as const, reason: "unsubscribe_url_invalid" as const };
  return {
    ready: true as const,
    text: `${KOINONIA_DRAFT_MAILING_ADDRESS.join("\n")}\nUnsubscribe: ${url.toString()}`,
    draftOnly: true as const,
    sendingEnabled: false as const,
  };
}
