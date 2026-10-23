import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import { checkMarketingPreviewAccess } from "../../../../../lib/koinonia-marketing-preview-access";
import { getResendContactSnapshotById } from "../../../../../lib/koinonia-resend-contact-lookup";
import { reconcileKoinoniaResendContact } from "../../../../../lib/koinonia-resend-reconciliation";
import { getResendSuppressionSnapshot } from "../../../../../lib/koinonia-resend-suppression";
import { evaluateKoinoniaProviderDecision } from "../../../../../lib/koinonia-marketing-provider-decision";
import { getResendContactTopicsSnapshot } from "../../../../../lib/koinonia-resend-topic-lookup";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// This QA route is restricted to the one existing internal test contact.
const qaContactId = "f6a8cde9-b7e9-4dd2-a1fe-f8e193db8c85";
const qaEmail = "jeremiahreynalds@gmail.com";

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview" ||
      process.env.KOINONIA_RESEND_QA_LOOKUP_ENABLED !== "true") {
    return NextResponse.json({ error: "QA lookup disabled." }, { status: 404 });
  }
  if (getAuthProvider() !== "clerk") {
    return NextResponse.json({ error: "Managed authentication required." }, { status: 503 });
  }
  let host: string;
  try { host = new URL(process.env.DATABASE_URL ?? "").hostname; }
  catch { return NextResponse.json({ error: "Approved Preview database required." }, { status: 503 }); }
  if (!/^ep-wild-star-afpyagbo(?:-pooler)?\.c-2\.us-west-2\.aws\.neon\.tech$/.test(host)) {
    return NextResponse.json({ error: "Approved Preview database required." }, { status: 503 });
  }
  let user: Awaited<ReturnType<typeof assertPermission>>;
  try { user = await assertPermission("objects:view"); }
  catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error
      ? (error as { status?: unknown }).status : undefined;
    if (status === 401 || status === 403) {
      return NextResponse.json({ error: status === 401 ? "Authentication required." : "Access denied." }, { status });
    }
    throw error;
  }
  const access = checkMarketingPreviewAccess(user.role, user.workspaceId);
  if (!access.allowed) return NextResponse.json({ error: access.error }, { status: 403 });
  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ error: "QA provider lookup unavailable." }, { status: 503 });

  const records = await prisma.rosObject.findMany({
    where: {
      workspaceId: user.workspaceId,
      objectType: "Relationship",
      archivedAt: null,
      data: { path: ["emailMarketing", "resendContactId"], equals: qaContactId }
    },
    select: { id: true, data: true },
    take: 2
  });
  if (records.length !== 1) {
    return NextResponse.json({ mode: "qa_read_only", matched: false, identityMatched: false, marketingEligible: false, enrollmentApproved: false, reason: "relationship_not_unique" },
      { headers: { "Cache-Control": "no-store" } });
  }
  const record = records[0];
  const profile = record.data && typeof record.data === "object" && !Array.isArray(record.data)
    ? record.data as Record<string, unknown> : {};
  const contact = profile.contact && typeof profile.contact === "object" && !Array.isArray(profile.contact)
    ? profile.contact as Record<string, unknown> : {};
  if (typeof contact.email !== "string" || contact.email.trim().toLowerCase() !== qaEmail) {
    return NextResponse.json({ mode: "qa_read_only", matched: false, identityMatched: false, marketingEligible: false, enrollmentApproved: false, reason: "qa_email_mismatch" },
      { headers: { "Cache-Control": "no-store" } });
  }

  const provider = await getResendContactSnapshotById(qaContactId, key);
  const result = reconcileKoinoniaResendContact(record.data, provider);
  // A GET-only provider check; unknown provider results always deny enrollment.
  const suppression = await getResendSuppressionSnapshot(qaEmail, key);
  const decision = evaluateKoinoniaProviderDecision(record.data, provider, suppression);
  const topics = await getResendContactTopicsSnapshot(qaContactId, key);
  return NextResponse.json({
    mode: "qa_read_only",
    providerState: provider.state,
    suppressionState: suppression.state,
    suppressionOrigin: suppression.state === "suppressed" ? suppression.origin : null,
    topicLookupState: topics.state,
    topicCount: topics.state === "found" ? topics.count : null,
    topicLookupIncomplete: topics.state === "found" ? topics.hasMore : true,
    matched: result.matched,
    identityMatched: result.identityMatched,
    marketingEligible: decision.marketingEligible,
    eligibilityDecision: decision.action,
    providerUnsubscribed: result.providerUnsubscribed,
    enrollmentApproved: false,
    reasons: decision.reasons,
    contactIdMatches: provider.state === "found" ? provider.id === qaContactId : false
  }, { headers: { "Cache-Control": "no-store" } });
}
