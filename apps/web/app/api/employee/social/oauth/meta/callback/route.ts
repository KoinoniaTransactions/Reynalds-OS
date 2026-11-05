import { NextRequest, NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../../../lib/api-auth";
import { prisma } from "../../../../../../../lib/db";
import { sealSocialConnection } from "../../../../../../../lib/social-connection-vault";
import { META_GRAPH_VERSION, META_OAUTH_COOKIE, metaCallbackUrl, metaOAuthConfigured, nonceHash, safeSocialSettingsRedirect } from "../../../../../../../lib/social-meta-oauth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageRecord = { id?: string; name?: string; access_token?: string; instagram_business_account?: { id?: string; username?: string } };
function returnToStudio(status: "connected" | "denied" | "invalid" | "unavailable", request: NextRequest) {
  const response = NextResponse.redirect(new URL(safeSocialSettingsRedirect(status), request.url), { status: 303 });
  response.cookies.set(META_OAUTH_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax",
    path: "/api/employee/social/oauth/meta", maxAge: 0 });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
async function metaJson<T>(url: URL): Promise<T> {
  const result = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(12000) });
  const body: unknown = await result.json();
  if (!result.ok) throw new Error("Meta returned HTTP " + result.status);
  return body as T;
}
export async function GET(request: NextRequest) {
  try {
    if (getAuthProvider() !== "clerk" || !metaOAuthConfigured() || new URL(request.url).origin !== new URL(metaCallbackUrl()).origin) {
      return returnToStudio("unavailable", request);
    }
    const actor = await assertPermission("employee-portal:view");
    if (actor.role !== "Owner") return returnToStudio("invalid", request);
    const state = request.nextUrl.searchParams.get("state") ?? "";
    const cookie = request.cookies.get(META_OAUTH_COOKIE)?.value ?? "";
    if (!state || state.length > 128 || state !== cookie) return returnToStudio("invalid", request);
    const record = await prisma.socialAuthorization.findUnique({ where: { nonceHash: nonceHash(state) } });
    if (!record || record.status !== "pending" || record.expiresAt <= new Date() || record.workspaceId !== actor.workspaceId ||
      record.actorId !== actor.id || record.platform !== "meta") return returnToStudio("invalid", request);
    const consumed = await prisma.socialAuthorization.updateMany({
      where: { id: record.id, status: "pending", expiresAt: { gt: new Date() } },
      data: { status: "used" }
    });
    if (consumed.count !== 1) return returnToStudio("invalid", request);
    if (request.nextUrl.searchParams.has("error")) return returnToStudio("denied", request);
    const code = request.nextUrl.searchParams.get("code");
    if (!code || code.length > 4000) return returnToStudio("invalid", request);
    const tokenUrl = new URL("https://graph.facebook.com/" + META_GRAPH_VERSION + "/oauth/access_token");
    tokenUrl.searchParams.set("client_id", process.env.META_APP_ID!);
    tokenUrl.searchParams.set("client_secret", process.env.META_APP_SECRET!);
    tokenUrl.searchParams.set("redirect_uri", metaCallbackUrl());
    tokenUrl.searchParams.set("code", code);
    const issued = await metaJson<{ access_token?: string; expires_in?: number }>(tokenUrl);
    if (!issued.access_token || issued.access_token.length > 8192) throw new Error("Meta authorization had no valid access token");

    const pagesUrl = new URL("https://graph.facebook.com/" + META_GRAPH_VERSION + "/me/accounts");
    pagesUrl.searchParams.set("fields", "id,name,access_token,instagram_business_account{id,username}");
    pagesUrl.searchParams.set("limit", "100");
    pagesUrl.searchParams.set("access_token", issued.access_token);
    const pagesResponse = await metaJson<{ data?: PageRecord[] }>(pagesUrl);
    const pages = (pagesResponse.data ?? []).filter(p => p.id && p.name);
    if (!pages.length) return returnToStudio("unavailable", request);
    const expiry = typeof issued.expires_in === "number" && issued.expires_in > 0 ?
      new Date(Date.now() + issued.expires_in * 1000) : null;
    const now = new Date();
    for (const page of pages) {
      const pageId = page.id!;
      const connection = await prisma.socialChannelConnection.upsert({
        where: { workspaceId_platform_providerAccountId: { workspaceId: actor.workspaceId, platform: "facebook", providerAccountId: pageId } },
        update: { status: "connected", displayName: page.name!, connectedAt: now, expiresAt: expiry,
          scopes: ["pages_show_list","pages_read_engagement","pages_manage_posts"] },
        create: { workspaceId: actor.workspaceId, platform: "facebook", providerAccountId: pageId, displayName: page.name!,
          status: "connected", connectedAt: now, expiresAt: expiry, scopes: ["pages_show_list","pages_read_engagement","pages_manage_posts"] }
      });
      await prisma.socialConnectionVault.upsert({
        where: { connectionId: connection.id },
        update: { encodedData: sealSocialConnection({ accessToken: page.access_token || issued.access_token, source: "meta_login", pageId }, actor.workspaceId, connection.id) },
        create: { workspaceId: actor.workspaceId, connectionId: connection.id,
          encodedData: sealSocialConnection({ accessToken: page.access_token || issued.access_token, source: "meta_login", pageId }, actor.workspaceId, connection.id) }
      });
      const instagram = page.instagram_business_account;
      if (instagram?.id) {
        const ig = await prisma.socialChannelConnection.upsert({
          where: { workspaceId_platform_providerAccountId: { workspaceId: actor.workspaceId, platform: "instagram", providerAccountId: instagram.id } },
          update: { status: "connected", displayName: instagram.username ?? "Instagram " + instagram.id, connectedAt: now, expiresAt: expiry,
            scopes: ["instagram_basic","instagram_content_publish"] },
          create: { workspaceId: actor.workspaceId, platform: "instagram", providerAccountId: instagram.id,
            displayName: instagram.username ?? "Instagram " + instagram.id, status: "connected", connectedAt: now, expiresAt: expiry,
            scopes: ["instagram_basic","instagram_content_publish"] }
        });
        await prisma.socialConnectionVault.upsert({
          where: { connectionId: ig.id },
          update: { encodedData: sealSocialConnection({ accessToken: issued.access_token, pageId, source: "meta_login" }, actor.workspaceId, ig.id) },
          create: { workspaceId: actor.workspaceId, connectionId: ig.id,
            encodedData: sealSocialConnection({ accessToken: issued.access_token, pageId, source: "meta_login" }, actor.workspaceId, ig.id) }
        });
      }
    }
    await prisma.auditEvent.create({ data: { workspaceId: actor.workspaceId, actorId: actor.id,
      action: "social.oauth.meta_connected", subjectType: "SocialChannelConnection",
      summary: "Meta business assets authorized; publishing remains disabled",
      metadata: { pages: pages.length, instagramAccounts: pages.filter(p => p.instagram_business_account?.id).length } } });
    return returnToStudio("connected", request);
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return NextResponse.json({ error: "Authorization required" }, { status: 401 });
    console.error("Meta callback failed", error instanceof Error ? error.message : "unknown");
    return returnToStudio("unavailable", request);
  }
}
