import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../lib/api-auth";
import { prisma } from "../../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const validPlatforms = new Set(["facebook", "instagram", "tiktok", "linkedin"]);

async function requireStaff() {
  // Do not expose draft data through local/mock identities on remote environments.
  if (process.env.NODE_ENV === "production" && getAuthProvider() !== "clerk") {
    throw new Error("Managed authentication required");
  }
  return assertPermission("employee-portal:view");
}

export async function GET() {
  try {
    const actor = await requireStaff();
    const posts = await prisma.socialPost.findMany({
      where: { workspaceId: actor.workspaceId },
      include: { variants: { select: { id: true, platform: true, caption: true, status: true } } },
      orderBy: { createdAt: "desc" }, take: 50
    });
    return NextResponse.json({ posts }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const authResponse = getAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Social draft list failed", error);
    return NextResponse.json({ error: "Draft workspace unavailable. Check migration and authentication." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireStaff();
    if (process.env.SOCIAL_CONTENT_STUDIO_ENABLED !== "true") {
      return NextResponse.json({ error: "Content Studio not activated in this environment." }, { status: 503 });
    }
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid draft" }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const caption = typeof input.caption === "string" ? input.caption.trim() : "";
    const platform = typeof input.platform === "string" ? input.platform : "";
    if (!title || title.length > 160 || !caption || caption.length > 5000 || !validPlatforms.has(platform)) {
      return NextResponse.json({ error: "A valid title, caption and platform are required." }, { status: 400 });
    }
    const post = await prisma.socialPost.create({
      data: {
        workspaceId: actor.workspaceId,
        createdById: actor.id,
        title,
        status: "draft",
        variants: { create: { platform, caption, status: "draft", revision: 1 } }
      }, include: { variants: true }
    });
    return NextResponse.json({ post }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const authResponse = getAuthErrorResponse(error);
    if (authResponse) return authResponse;
    console.error("Social draft creation failed", error);
    return NextResponse.json({ error: "Unable to save draft." }, { status: 503 });
  }
}
