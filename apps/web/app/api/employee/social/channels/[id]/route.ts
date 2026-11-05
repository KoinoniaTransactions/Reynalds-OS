import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../../lib/api-auth";
import { prisma } from "../../../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

/** Local disconnect removes the encrypted provider grant. Platform-side revocation is separate. */
export async function DELETE(request: Request, { params }: Context) {
  try {
    if (getAuthProvider() !== "clerk") return NextResponse.json({ error: "Managed login required" }, { status: 503 });
    const actor = await assertPermission("employee-portal:view");
    if (actor.role !== "Owner") return NextResponse.json({ error: "Owner permission required" }, { status: 403 });
    const { id } = await params;
    const current = await prisma.socialChannelConnection.findFirst({ where: { id, workspaceId: actor.workspaceId } });
    if (!current) return NextResponse.json({ error: "Social account not found" }, { status: 404 });
    await prisma.$transaction(async tx => {
      await tx.socialConnectionVault.deleteMany({ where: { connectionId: id, workspaceId: actor.workspaceId } });
      await tx.socialChannelConnection.update({ where: { id }, data: { status: "disconnected", scopes: null, expiresAt: null } });
      await tx.auditEvent.create({ data: { workspaceId: actor.workspaceId, actorId: actor.id,
        action: "social.oauth.local_disconnected", subjectType: "SocialChannelConnection", subjectId: id,
        summary: "Encrypted social authorization removed from Koinonia. Provider-side authorization must be revoked separately.",
        metadata: { platform: current.platform } } });
    });
    return NextResponse.json({ disconnected: true, externalGrantRevoked: false }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Social account disconnect failed", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Unable to disconnect social account" }, { status: 503 });
  }
}
