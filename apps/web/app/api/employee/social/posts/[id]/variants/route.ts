import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../../../lib/api-auth";
import { prisma } from "../../../../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
const platforms = new Set(["facebook", "instagram", "tiktok", "linkedin"]);

/** Add a platform-specific draft: no account is connected and nothing is published. */
export async function POST(request: Request, { params }: Context) {
  try {
    if (process.env.NODE_ENV === "production" && getAuthProvider() !== "clerk") return NextResponse.json({ error: "Managed authentication required" }, { status: 503 });
    const actor = await assertPermission("employee-portal:view");
    if (process.env.SOCIAL_CONTENT_STUDIO_ENABLED !== "true") return NextResponse.json({ error: "Studio disabled" }, { status: 503 });
    const { id } = await params;
    const raw: unknown = await request.json();
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const input = raw as Record<string, unknown>;
    const platform = typeof input.platform === "string" ? input.platform : "";
    const caption = typeof input.caption === "string" ? input.caption.trim() : "";
    if (!platforms.has(platform) || !caption || caption.length > 5000) return NextResponse.json({ error: "Invalid platform or caption" }, { status: 400 });
    const result = await prisma.$transaction(async tx => {
      const post = await tx.socialPost.findFirst({ where: { id, workspaceId: actor.workspaceId }, include: { variants: true } });
      if (!post) return "not_found" as const;
      if (post.variants.some(v => v.platform === platform)) return "exists" as const;
      const variant = await tx.socialPostVariant.create({ data: { postId: post.id, platform, caption, status: "draft", revision: 1 } });
      await tx.auditEvent.create({ data: { workspaceId: actor.workspaceId, actorId: actor.id, action: "social.variant.created", subjectType: "SocialPostVariant", subjectId: variant.id, summary: "Draft platform variant created", metadata: { postId: id, platform } } });
      return "ok" as const;
    });
    if (result !== "ok") return NextResponse.json({ error: result }, { status: result === "not_found" ? 404 : 409 });
    return NextResponse.json({ saved: true }, { status: 201 });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Social variant creation failed", error);
    return NextResponse.json({ error: "Unable to create platform draft" }, { status: 503 });
  }
}
