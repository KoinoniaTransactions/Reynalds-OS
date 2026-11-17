import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../../../lib/api-auth";
import { prisma } from "../../../../../../../lib/db";
import { nonceHash } from "../../../../../../../lib/social-meta-oauth";
import { buildLinkedinLoginUrl, linkedinCallbackUrl, linkedinOAuthConfigured, LINKEDIN_OAUTH_COOKIE } from "../../../../../../../lib/social-linkedin-oauth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    if (getAuthProvider() !== "clerk" || !linkedinOAuthConfigured() || new URL(request.url).origin !== new URL(linkedinCallbackUrl()).origin) return NextResponse.json({ error: "LinkedIn developer configuration or registered origin is unavailable" }, { status: 503 });
    const actor = await assertPermission("employee-portal:view");
    if (actor.role !== "Owner") return NextResponse.json({ error: "Owner permission required" }, { status: 403 });
    if (await prisma.socialAuthorization.count({ where: { workspaceId: actor.workspaceId, actorId: actor.id, platform: "linkedin", createdAt: { gt: new Date(Date.now() - 600000) } } }) >= 5) return NextResponse.json({ error: "Too many authorization attempts; try again in ten minutes" }, { status: 429 });
    const state = randomBytes(32).toString("base64url");
    await prisma.socialAuthorization.create({ data: { workspaceId: actor.workspaceId, actorId: actor.id, platform: "linkedin", nonceHash: nonceHash(state), expiresAt: new Date(Date.now() + 600000) } });
    const response = NextResponse.json({ authorizationUrl: buildLinkedinLoginUrl(state) }, { headers: { "Cache-Control": "private, no-store" } });
    response.cookies.set(LINKEDIN_OAUTH_COOKIE, state, { secure: true, httpOnly: true, sameSite: "lax", path: "/api/employee/social/oauth/linkedin", maxAge: 600 });
    return response;
  } catch (error) { return getAuthErrorResponse(error) ?? NextResponse.json({ error: "Unable to begin LinkedIn authorization" }, { status: 503 }); }
}
