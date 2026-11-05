import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../../../lib/api-auth";
import { prisma } from "../../../../../../../lib/db";
import { buildMetaLoginUrl, metaCallbackUrl, metaOAuthConfigured, newMetaOAuthState, nonceHash, META_OAUTH_COOKIE } from "../../../../../../../lib/social-meta-oauth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    if (getAuthProvider() !== "clerk" || !metaOAuthConfigured()) {
      return NextResponse.json({ error: "Managed login or Meta developer configuration is missing" }, { status: 503 });
    }
    if (new URL(request.url).origin !== new URL(metaCallbackUrl()).origin) {
      return NextResponse.json({ error: "Meta callback must use the same registered origin as the Content Studio" }, { status: 503 });
    }
    const actor = await assertPermission("employee-portal:view");
    if (actor.role !== "Owner") return NextResponse.json({ error: "Owner approval required to connect social accounts" }, { status: 403 });
    const state = newMetaOAuthState();
    const callback = buildMetaLoginUrl(state);
    await prisma.socialAuthorization.create({ data: {
      workspaceId: actor.workspaceId, actorId: actor.id, platform: "meta",
      nonceHash: nonceHash(state), expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    } });
    const result = NextResponse.json({ authorizationUrl: callback }, { headers: { "Cache-Control": "private, no-store" } });
    result.cookies.set(META_OAUTH_COOKIE, state, {
      httpOnly: true, secure: true, sameSite: "lax", path: "/api/employee/social/oauth/meta", maxAge: 600
    });
    return result;
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return auth;
    console.error("Meta OAuth initialization failed", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Unable to begin Meta connection" }, { status: 503 });
  }
}
