import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { assertPermission } from "../../../../../lib/auth";
import {
  RB_GMAIL_EXPECTED_ACCOUNT,
  exchangeCodeForTokens,
  encryptSecret,
  getGmailProfile
} from "../../../../../lib/reynalds-brothers-gmail";
import { REYNALDS_BROTHERS_WORKSPACE_ID } from "../../../../../lib/reynalds-brothers-work-items";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await assertPermission("objects:update");

    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const expectedState = request.cookies.get("rb_gmail_oauth_state")?.value;

    if (!code) throw new Error("Google did not return an authorization code.");
    if (!state || !expectedState || state !== expectedState) throw new Error("Google OAuth state validation failed.");

    const tokens = await exchangeCodeForTokens(code, request.url);
    if (!tokens.refresh_token) {
      throw new Error("Google did not return a refresh token. Reconnect and approve offline access.");
    }

    const profile = await getGmailProfile(tokens.access_token);
    const accountEmail = profile.emailAddress.toLowerCase();
    const expectedAccount = RB_GMAIL_EXPECTED_ACCOUNT.toLowerCase();

    if (accountEmail !== expectedAccount) {
      throw new Error(`Connected Google account ${accountEmail} does not match expected RB account ${expectedAccount}.`);
    }

    await prisma.gmailConnection.upsert({
      where: {
        workspaceId_accountEmail: {
          workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
          accountEmail
        }
      },
      update: {
        encryptedRefreshToken: encryptSecret(tokens.refresh_token),
        scopes: tokens.scope ? tokens.scope.split(" ") : [],
        status: "active",
        lastConnectedAt: new Date(),
        metadata: {
          historyId: profile.historyId ?? null
        }
      },
      create: {
        workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
        accountEmail,
        encryptedRefreshToken: encryptSecret(tokens.refresh_token),
        scopes: tokens.scope ? tokens.scope.split(" ") : [],
        status: "active",
        metadata: {
          historyId: profile.historyId ?? null
        }
      }
    });

    const response = NextResponse.redirect(new URL("/reynalds-brothers?gmail=connected#rb-email-intake", request.url));
    response.cookies.delete("rb_gmail_oauth_state");
    return response;
  } catch (error) {
    const safeMessage = error instanceof Error ? error.message : "Gmail connection failed.";
    console.error("[RB Gmail OAuth callback]", {
      message: safeMessage,
      name: error instanceof Error ? error.name : "UnknownError"
    });

    const message = encodeURIComponent(safeMessage);
    const response = NextResponse.redirect(new URL(`/reynalds-brothers?gmail=error&message=${message}#rb-email-intake`, request.url));
    response.cookies.delete("rb_gmail_oauth_state");
    return response;
  }
}
