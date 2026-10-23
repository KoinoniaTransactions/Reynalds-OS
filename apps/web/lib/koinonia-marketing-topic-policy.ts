/** Local-only topic consent preview. Not proof of Resend topic subscription. */
export type TopicConsent = { topicId?: string; consent?: "opted_in" | "opted_out"; permissionSource?: string; permissionRecordedAt?: string };
export function evaluateTopicConsent(input: unknown, topicId: string) {
  const fail = (reason: string) => ({verified:false as const,reason});
  if (!topicId.trim()) return fail("topic_unspecified");
  if (!Array.isArray(input)) return fail("topic_permission_unverified");
  const matches = input.filter((x): x is TopicConsent => !!x && typeof x === "object" && !Array.isArray(x) && (x as TopicConsent).topicId === topicId);
  if (matches.length !== 1) return fail("topic_permission_unverified");
  const p = matches[0];
  if (p.consent !== "opted_in") return fail("topic_permission_unverified");
  if (!p.permissionSource?.trim()) return fail("topic_permission_unverified");
  const timestamp = p.permissionRecordedAt ?? "";
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(timestamp) ||
    !Number.isFinite(Date.parse(timestamp)) || Date.parse(timestamp) > Date.now()) return fail("topic_permission_unverified");
  // Resend topic membership must separately be verified before any use.
  return {verified:true as const, reason:null};
}
