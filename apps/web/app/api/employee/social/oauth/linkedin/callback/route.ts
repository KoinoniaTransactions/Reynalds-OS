import { NextRequest, NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../../../lib/auth";
import { prisma } from "../../../../../../../lib/db";
import { nonceHash } from "../../../../../../../lib/social-meta-oauth";
import { sealSocialConnection } from "../../../../../../../lib/social-connection-vault";
import { findLinkedinOrganizationRole, linkedinCallbackUrl, linkedinJson, linkedinOAuthConfigured, linkedinOrganizationUrn, LINKEDIN_OAUTH_COOKIE, validateLinkedinGrant } from "../../../../../../../lib/social-linkedin-oauth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
function back(request: NextRequest, status: "connected" | "denied" | "invalid" | "unavailable") {
  const response = NextResponse.redirect(new URL("/employee/social?tab=accounts&linkedin=" + status, request.url), 303);
  response.cookies.set(LINKEDIN_OAUTH_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/api/employee/social/oauth/linkedin", maxAge: 0 });
  response.headers.set("Cache-Control", "private, no-store"); return response;
}
export async function GET(request: NextRequest) {
  try {
    if (getAuthProvider() !== "clerk" || !linkedinOAuthConfigured() || new URL(request.url).origin !== new URL(linkedinCallbackUrl()).origin) return back(request, "unavailable");
    const actor = await assertPermission("employee-portal:view");
    if (actor.role !== "Owner") return back(request, "invalid");
    const state = request.nextUrl.searchParams.get("state") ?? "";
    if (!state || state.length > 128 || state !== request.cookies.get(LINKEDIN_OAUTH_COOKIE)?.value) return back(request, "invalid");
    const record = await prisma.socialAuthorization.findUnique({ where: { nonceHash: nonceHash(state) } });
    if (!record || record.workspaceId !== actor.workspaceId || record.actorId !== actor.id || record.platform !== "linkedin" || record.status !== "pending" || record.expiresAt <= new Date()) return back(request, "invalid");
    const consumed = await prisma.socialAuthorization.updateMany({ where: { id: record.id, status: "pending", expiresAt: { gt: new Date() } }, data: { status: "used" } });
    if (consumed.count !== 1) return back(request, "invalid");
    if (request.nextUrl.searchParams.has("error")) return back(request, "denied");
    const code = request.nextUrl.searchParams.get("code");
    if (!code || code.length > 4000) return back(request, "invalid");
    const issued = await linkedinJson("accessToken", { form: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: linkedinCallbackUrl(), client_id: process.env.LINKEDIN_CLIENT_ID!, client_secret: process.env.LINKEDIN_CLIENT_SECRET! }) });
    const token = issued.access_token;
    if (typeof token !== "string" || !token || token.length > 8192) throw new Error("LinkedIn token invalid");
    const inspected = await linkedinJson("introspectToken", { form: new URLSearchParams({ client_id: process.env.LINKEDIN_CLIENT_ID!, client_secret: process.env.LINKEDIN_CLIENT_SECRET!, token }) });
    const grant = validateLinkedinGrant(inspected, process.env.LINKEDIN_CLIENT_ID!);
    const organization = linkedinOrganizationUrn();
    let matched = false;
    for (let start = 0; start < 500; start += 100) {
      const result = findLinkedinOrganizationRole(await linkedinJson("organizationAcls", { token, start }), organization);
      if (result.matched) { matched = true; break; }
      if (!result.hasNext) break;
    }
    if (!matched) throw new Error("Configured LinkedIn organization role not verified");
    await prisma.$transaction(async tx => {
      const data = { displayName: "LinkedIn company " + organization.split(":").pop(), status: "connected", scopes: grant.scopes, connectedAt: new Date(), expiresAt: grant.expiresAt };
      const connection = await tx.socialChannelConnection.upsert({ where: { workspaceId_platform_providerAccountId: { workspaceId: actor.workspaceId, platform: "linkedin", providerAccountId: organization } }, create: { workspaceId: actor.workspaceId, platform: "linkedin", providerAccountId: organization, ...data }, update: data });
      const encodedData = sealSocialConnection({ accessToken: token, source: "linkedin_oauth", organization }, actor.workspaceId, connection.id);
      await tx.socialConnectionVault.upsert({ where: { connectionId: connection.id }, create: { workspaceId: actor.workspaceId, connectionId: connection.id, encodedData }, update: { encodedData } });
      await tx.auditEvent.create({ data: { workspaceId: actor.workspaceId, actorId: actor.id, action: "social.oauth.linkedin_connected", subjectType: "SocialChannelConnection", subjectId: connection.id, summary: "LinkedIn grant and configured organization role verified; publishing remains separately gated" } });
    });
    return back(request, "connected");
  } catch (error) { console.error("LinkedIn callback failed", error instanceof Error ? error.name : "unknown"); return back(request, "unavailable"); }
}
