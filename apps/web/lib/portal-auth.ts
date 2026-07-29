import { notFound, redirect } from "next/navigation";
import { PermissionDeniedError, type AuthUser, type Permission } from "@reynalds-os/auth";
import { assertPermission, AuthenticationRequiredError } from "./auth";

const defaultSignInPath = "/sign-in";

export async function requirePortalPermission(
  permission: Permission,
  returnTo: string
): Promise<AuthUser> {
  try {
    return await assertPermission(permission);
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      redirect(getSignInPath(returnTo));
    }

    if (error instanceof PermissionDeniedError) {
      notFound();
    }

    throw error;
  }
}

export function getSignInPath(returnTo: string): string {
  return `${defaultSignInPath}?return_to=${encodeURIComponent(returnTo)}`;
}

export function getHostedSignInUrl(returnTo: string): string | null {
  const signInUrl =
    process.env.NEXT_PUBLIC_AUTH_SIGN_IN_URL ?? process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;

  if (!signInUrl) {
    return null;
  }

  return withRedirectParam(signInUrl, returnTo);
}

export function getHostedSignOutUrl(returnTo = "/"): string | null {
  const signOutUrl =
    process.env.NEXT_PUBLIC_AUTH_SIGN_OUT_URL ?? process.env.NEXT_PUBLIC_CLERK_SIGN_OUT_URL;

  if (!signOutUrl) {
    return null;
  }

  return withRedirectParam(signOutUrl, returnTo);
}

function withRedirectParam(url: string, returnTo: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}redirect_url=${encodeURIComponent(returnTo)}`;
}
