import { NextRequest, NextResponse } from "next/server";
import { assertPermission, getAuthProvider } from "../../../../../../../lib/auth";
import { getAuthErrorResponse } from "../../../../../../../lib/api-auth";
import { prisma } from "../../../../../../../lib/db";
import { sealSocialConnection } from "../../../../../../../lib/social-connection-vault";
import { META_GRAPH_VERSION, META_OAUTH_COOKIE, metaCallbackUrl, metaOAuthConfigured, nonceHash, safeSocialSettingsRedirect } from "../../../../../../../lib/social-meta-oauth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { metaRecord, metaToken, parseMetaPages, validateMetaGrant } from "../../../../../../../lib/social-meta-validation";
function returnToStudio(status: "connected" | "denied" | "invalid" | "unavailable", request: NextRequest) {
  const response = NextResponse.redirect(new URL(safeSocialSettingsRedirect(status), request.url), { status: 303 });
  response.cookies.set(META_OAUTH_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax",
    path: "/api/employee/social/oauth/meta", maxAge: 0 });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
async function metaJson(url: URL): Promise<unknown> {
  const result = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(12000) });
  const body: unknown = await result.json();
  if (!result.ok) throw new Error("Meta returned HTTP " + result.status);
  return body;
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
    const issued = metaRecord(await metaJson(tokenUrl));
    const accessToken = metaToken(issued.access_token);
    const inspectUrl = new URL("https://graph.facebook.com/" + META_GRAPH_VERSION + "/debug_token");
    inspectUrl.searchParams.set("input_token", accessToken);
    inspectUrl.searchParams.set("access_token", process.env.META_APP_ID! + "|" + process.env.META_APP_SECRET!);
    const userGrant = validateMetaGrant(await metaJson(inspectUrl), process.env.META_APP_ID!);
    const grantedScopes = userGrant.scopes;
    const instagramReady = ["pages_show_list", "pages_read_engagement", "instagram_content_publish", "instagram_basic"].every(scope => grantedScopes.includes(scope));

    const pagesUrl = new URL("https://graph.facebook.com/" + META_GRAPH_VERSION + "/me/accounts");
    pagesUrl.searchParams.set("fields", "id,name,access_token,instagram_business_account{id,username}");
    pagesUrl.searchParams.set("limit", "100");
    pagesUrl.searchParams.set("access_token", accessToken);
    const pages: ReturnType<typeof parseMetaPages>["pages"] = [];
    const cursors = new Set<string>();
    for (let batch = 0; batch < 10; batch++) {
      const result = parseMetaPages(await metaJson(pagesUrl));
      pages.push(...result.pages);
      if (!result.after) break;
      if (batch === 9 || cursors.has(result.after)) throw new Error("Meta pagination limit reached");
      cursors.add(result.after);
      pagesUrl.searchParams.set("after", result.after);
    }
    if (!pages.length) return returnToStudio("unavailable", request);
    if (new Set(pages.map(page => page.id)).size !== pages.length) throw new Error("Duplicate Meta assets");
    // Validate each Page token independently; never substitute a user token for a missing Page grant.
    const verified: { page: typeof pages[number]; grant: ReturnType<typeof validateMetaGrant> }[] = [];
    for (const page of pages) {
      inspectUrl.searchParams.set("input_token", page.accessToken);
      const grant = validateMetaGrant(await metaJson(inspectUrl), process.env.META_APP_ID!);
      if (grant.profileId !== page.id) throw new Error("Meta Page identity mismatch");
      verified.push({ page, grant });
    }
    const expiry = userGrant.expiresAt;
    const now = new Date();
    await prisma.$transaction(async tx => {
    for (const { page, grant } of verified) {
      const pageId = page.id;
      const pageReady = ["pages_show_list", "pages_manage_posts", "pages_read_engagement"].every(scope => grant.scopes.includes(scope));
      const pageExpiry = grant.expiresAt && expiry ? new Date(Math.min(grant.expiresAt.getTime(), expiry.getTime())) : grant.expiresAt ?? expiry;
      const connection = await tx.socialChannelConnection.upsert({
        where: { workspaceId_platform_providerAccountId: { workspaceId: actor.workspaceId, platform: "facebook", providerAccountId: pageId } },
        update: { status: pageReady ? "connected" : "needs_permission", displayName: page.name, connectedAt: now, expiresAt: pageExpiry,
          scopes: grant.scopes },
        create: { workspaceId: actor.workspaceId, platform: "facebook", providerAccountId: pageId, displayName: page.name,
          status: pageReady ? "connected" : "needs_permission", connectedAt: now, expiresAt: pageExpiry, scopes: grant.scopes }
      });
      await tx.socialConnectionVault.upsert({
        where: { connectionId: connection.id },
        update: { encodedData: sealSocialConnection({ accessToken: page.accessToken, source: "meta_login", pageId }, actor.workspaceId, connection.id) },
        create: { workspaceId: actor.workspaceId, connectionId: connection.id,
          encodedData: sealSocialConnection({ accessToken: page.accessToken, source: "meta_login", pageId }, actor.workspaceId, connection.id) }
      });
      const instagram = page.instagram;
      if (instagram?.id) {
        const ig = await tx.socialChannelConnection.upsert({
          where: { workspaceId_platform_providerAccountId: { workspaceId: actor.workspaceId, platform: "instagram", providerAccountId: instagram.id } },
          update: { status: instagramReady ? "connected" : "needs_permission", displayName: instagram.username ?? "Instagram " + instagram.id, connectedAt: now, expiresAt: expiry,
            scopes: grantedScopes },
          create: { workspaceId: actor.workspaceId, platform: "instagram", providerAccountId: instagram.id,
            displayName: instagram.username ?? "Instagram " + instagram.id, status: instagramReady ? "connected" : "needs_permission", connectedAt: now, expiresAt: expiry,
            scopes: grantedScopes }
        });
        await tx.socialConnectionVault.upsert({
          where: { connectionId: ig.id },
          update: { encodedData: sealSocialConnection({ accessToken, pageId, source: "meta_login" }, actor.workspaceId, ig.id) },
          create: { workspaceId: actor.workspaceId, connectionId: ig.id,
            encodedData: sealSocialConnection({ accessToken, pageId, source: "meta_login" }, actor.workspaceId, ig.id) }
        });
      }
    }
    await tx.auditEvent.create({ data: { workspaceId: actor.workspaceId, actorId: actor.id,
      action: "social.oauth.meta_connected", subjectType: "SocialChannelConnection",
      summary: "Meta business assets authorized; publishing remains disabled",
      metadata: { pages: pages.length, instagramAccounts: pages.filter(p => p.instagram?.id).length } } });
    });
    return returnToStudio("connected", request);
  } catch (error) {
    const auth = getAuthErrorResponse(error);
    if (auth) return NextResponse.json({ error: "Authorization required" }, { status: 401 });
    console.error("Meta callback failed", error instanceof Error ? error.name : "unknown");
    return returnToStudio("unavailable", request);
  }
}
