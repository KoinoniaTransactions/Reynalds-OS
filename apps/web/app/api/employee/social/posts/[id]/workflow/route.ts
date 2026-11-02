import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../../../lib/api-auth";
import { prisma } from "../../../../../../../lib/db";
import { canTransitionSocialVariant, type SocialVariantStatus } from "../../../../../../../lib/social-publishing-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
type Action = "submit" | "approve" | "request_changes" | "return_to_draft" | "plan" | "clear_plan";
const transitions: Partial<Record<Action, { from: SocialVariantStatus; to: SocialVariantStatus }>> = {
  submit: { from: "draft", to: "in_review" },
  approve: { from: "in_review", to: "approved" },
  request_changes: { from: "in_review", to: "changes_requested" },
  return_to_draft: { from: "changes_requested", to: "draft" }
};

/** Administrative workflow only: the plan action records a proposed time but never creates a publish job. */
export async function POST(request: Request, { params }: Context) {
  try {
    if (process.env.NODE_ENV === "production" && getAuthProvider() !== "clerk") {
      return NextResponse.json({ error: "Managed authentication required" }, { status: 503 });
    }
    const actor = await assertPermission("employee-portal:view");
    if (process.env.SOCIAL_CONTENT_STUDIO_ENABLED !== "true") {
      return NextResponse.json({ error: "Content Studio disabled" }, { status: 503 });
    }
    const { id } = await params;
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const input = body as Record<string, unknown>;
    const variantId = typeof input.variantId === "string" ? input.variantId : "";
    const action = input.action as Action;
    const revision = input.revision;
    if (!variantId || !Number.isSafeInteger(revision) || (revision as number) < 1 || !["submit","approve","request_changes","return_to_draft","plan","clear_plan"].includes(action)) {
      return NextResponse.json({ error: "Invalid workflow action" }, { status: 400 });
    }
    // A reviewer must have an administrative role, never just any staff permission.
    if (["approve", "request_changes"].includes(action) && !["Owner", "Admin"].includes(actor.role)) {
      return NextResponse.json({ error: "Administrative approval required" }, { status: 403 });
    }
    const scheduledAt = action === "plan" && typeof input.scheduledAt === "string" ? new Date(input.scheduledAt) : null;
    if (action === "plan" && (!scheduledAt || !Number.isFinite(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now() + 60000)) {
      return NextResponse.json({ error: "Choose a future planned date" }, { status: 400 });
    }
    const result = await prisma.$transaction(async tx => {
      const post = await tx.socialPost.findFirst({ where: { id, workspaceId: actor.workspaceId }, include: { variants: { where: { id: variantId } } } });
      const variant = post?.variants[0];
      if (!variant) return "not_found" as const;
      if (variant.revision !== revision) return "conflict" as const;
      const change = transitions[action];
      if (change && (variant.status !== change.from || !canTransitionSocialVariant(change.from, change.to))) return "invalid_state" as const;
      if (action === "approve" && variant.scheduledAt) return "invalid_state" as const;
      if (action === "plan" && variant.status !== "approved") return "invalid_state" as const;
      if (action === "clear_plan" && !["approved","draft"].includes(variant.status)) return "invalid_state" as const;
      if (action === "approve" && post!.createdById === actor.id) return "self_approval" as const;
      const condition = change ? { status: change.from } : { status: variant.status };
      const written = await tx.socialPostVariant.updateMany({
        where: { id: variant.id, revision: revision as number, ...condition },
        data: {
          ...(change ? { status: change.to } : {}),
          ...(action === "plan" ? { scheduledAt } : action === "clear_plan" ? { scheduledAt: null } : {})
        }
      });
      if (written.count !== 1) return "conflict" as const;
      if (action === "approve") {
        await tx.socialApproval.create({ data: { variantId, revision: revision as number, approvedById: actor.id } });
      }
      await tx.auditEvent.create({ data: {
        workspaceId: actor.workspaceId, actorId: actor.id,
        action: "social.workflow." + action, subjectType: "SocialPostVariant", subjectId: variant.id,
        summary: "Social content workflow: " + action,
        metadata: { postId: id, revision, plannedTime: scheduledAt?.toISOString() ?? null }
      } });
      return "ok" as const;
    });
    if (result !== "ok") return NextResponse.json({ error: result }, { status: result === "not_found" ? 404 : result === "self_approval" ? 403 : 409 });
    return NextResponse.json({ saved: true, publishingEnabled: false });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Social workflow failed", error);
    return NextResponse.json({ error: "Unable to update social workflow" }, { status: 503 });
  }
}
