import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { prisma } from "../../../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

async function staff() {
  if (process.env.NODE_ENV === "production" && getAuthProvider() !== "clerk") throw new Error("Managed authentication required");
  return assertPermission("employee-portal:view");
}

/** Edit drafts only. Every edit increments revision and invalidates approval. */
export async function PATCH(request: Request, { params }: Context) {
  try {
    const actor = await staff();
    if (process.env.SOCIAL_CONTENT_STUDIO_ENABLED !== "true") return NextResponse.json({ error: "Studio disabled" }, { status: 503 });
    const { id } = await params;
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const payload = body as Record<string, unknown>;
    const title = typeof payload.title === "string" ? payload.title.trim() : "";
    const caption = typeof payload.caption === "string" ? payload.caption.trim() : "";
    const variantId = typeof payload.variantId === "string" ? payload.variantId : "";
    const revision = payload.revision;
    if (!title || title.length > 160 || !caption || caption.length > 5000 || !variantId || !Number.isSafeInteger(revision) || (revision as number) < 1) return NextResponse.json({ error: "Invalid draft data" }, { status: 400 });
    const updated = await prisma.$transaction(async tx => {
      const post = await tx.socialPost.findFirst({ where: { id, workspaceId: actor.workspaceId }, include: { variants: true } });
      const variant = post?.variants.find(v => v.id === variantId);
      if (!post || !variant) return { error: "not_found" } as const;
      if (!["draft", "changes_requested"].includes(variant.status) || post.status !== "draft") return { error: "locked" } as const;
      if (variant.revision !== revision) return { error: "conflict" } as const;
      const changed = await tx.socialPostVariant.updateMany({
        where: { id: variant.id, revision: revision as number, status: { in: ["draft", "changes_requested"] } },
        data: { caption, revision: { increment: 1 }, status: "draft" }
      });
      if (changed.count !== 1) return { error: "conflict" } as const;
      await tx.socialPost.update({ where: { id: post.id }, data: { title } });
      await tx.auditEvent.create({ data: { workspaceId: actor.workspaceId, actorId: actor.id, action: "social.draft.updated", subjectType: "SocialPost", subjectId: post.id, summary: "Social draft edited; approval reset", metadata: { variantId: variant.id, previousRevision: revision } } });
      return { ok: true } as const;
    });
    if ("error" in updated) return NextResponse.json({ error: updated.error }, { status: updated.error === "not_found" ? 404 : 409 });
    return NextResponse.json({ saved: true });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Social draft edit failed", error);
    return NextResponse.json({ error: "Unable to update draft" }, { status: 503 });
  }
}
