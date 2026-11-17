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

export async function GET(request: Request) {
  try {
    const actor = await requireStaff();
    const query = new URL(request.url).searchParams.get("query")?.trim().slice(0, 100) ?? "";
    const posts = await prisma.socialPost.findMany({
      where: { workspaceId: actor.workspaceId, ...(query ? { OR: [ { title: { contains: query, mode: "insensitive" as const } }, { campaignKey: { contains: query, mode: "insensitive" as const } }, { variants: { some: { caption: { contains: query, mode: "insensitive" as const } } } } ] } : {}) },
      include: { variants: { select: { id: true, platform: true, caption: true, status: true, revision: true, scheduledAt: true, media: true } } },
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
    const campaignKey = typeof input.campaignKey === "string" ? input.campaignKey.trim() : "";
    const selectedPlatforms = Array.isArray(input.platforms) ? input.platforms : [input.platform];
    const platforms = [...new Set(selectedPlatforms)];
    if (!title || title.length > 160 || !caption || caption.length > 5000 || (campaignKey && !/^[a-z0-9][a-z0-9_-]{0,79}$/.test(campaignKey)) || platforms.length < 1 || platforms.length > 4 || !platforms.every(p => typeof p === "string" && validPlatforms.has(p))) {
      return NextResponse.json({ error: "A valid title, caption and platform are required." }, { status: 400 });
    }
    const post = await prisma.socialPost.create({
      data: {
        workspaceId: actor.workspaceId,
        createdById: actor.id,
        title,
        campaignKey: campaignKey || null,
        status: "draft",
        variants: { create: platforms.map(platform => ({ platform: platform as string, caption, status: "draft", revision: 1 })) }
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
