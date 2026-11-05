import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../lib/api-auth";
import { prisma } from "../../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    if (process.env.NODE_ENV === "production" && getAuthProvider() !== "clerk") {
      return NextResponse.json({ error: "Managed login required" }, { status: 503 });
    }
    const actor = await assertPermission("employee-portal:view");
    const channels = await prisma.socialChannelConnection.findMany({
      where: { workspaceId: actor.workspaceId },
      select: { id: true, platform: true, displayName: true, status: true, scopes: true, expiresAt: true },
      orderBy: { platform: "asc" }
    });
    return NextResponse.json({ channels, connectionChangesEnabled: false }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Social channel listing failed", error);
    return NextResponse.json({ error: "Channel status unavailable" }, { status: 503 });
  }
}
