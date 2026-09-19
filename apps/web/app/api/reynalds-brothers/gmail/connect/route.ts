import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { assertPermission } from "../../../../../lib/auth";
import { buildGoogleAuthorizationUrl } from "../../../../../lib/reynalds-brothers-gmail";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await assertPermission("objects:update");
    const state = crypto.randomBytes(24).toString("base64url");
    const authorizationUrl = buildGoogleAuthorizationUrl(request.url, state);
    const response = NextResponse.redirect(authorizationUrl);

    response.cookies.set("rb_gmail_oauth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/"
    });

    return response;
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Gmail connection could not be started."
    }, { status: 400 });
  }
}
