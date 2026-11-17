/** Browser mutations must come from the same origin; never trust forwarded origins. */
export function isSameOriginSocialMutation(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin || request.headers.get("sec-fetch-site") === "cross-site") return false;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}
