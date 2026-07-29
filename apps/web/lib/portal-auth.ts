import { notFound, redirect } from "next/navigation";
import { PermissionDeniedError, type AuthUser, type Permission } from "@reynalds-os/auth";
import {
  assertPermission,
  AuthenticationRequiredError,
  AuthProviderConfigurationError
} from "./auth";

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

    if (error instanceof AuthProviderConfigurationError) {
      redirect(getSignInPath(returnTo, "configuration"));
    }

    if (error instanceof PermissionDeniedError) {
      notFound();
    }

    throw error;
  }
}

export function getSignInPath(returnTo: string, status?: "configuration"): string {
  const params = new URLSearchParams({ return_to: normalizePortalReturnTo(returnTo) });

  if (status) {
    params.set("auth_status", status);
  }

  return `${defaultSignInPath}?${params.toString()}`;
}

export function getHostedSignInUrl(returnTo: string): string | null {
  const signInUrl = firstPresent(
    process.env.NEXT_PUBLIC_AUTH_SIGN_IN_URL,
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL
  );

  if (!signInUrl || !isAllowedHostedAuthUrl(signInUrl)) {
    return null;
  }

  return withRedirectParam(signInUrl, normalizePortalReturnTo(returnTo));
}

export function getHostedSignOutUrl(returnTo = "/"): string | null {
  const signOutUrl = firstPresent(
    process.env.NEXT_PUBLIC_AUTH_SIGN_OUT_URL,
    process.env.NEXT_PUBLIC_CLERK_SIGN_OUT_URL
  );

  if (!signOutUrl || !isAllowedHostedAuthUrl(signOutUrl)) {
    return null;
  }

  return withRedirectParam(signOutUrl, normalizePortalReturnTo(returnTo, "/"));
}

export function normalizePortalReturnTo(value: string | undefined, fallback = "/client/dashboard"): string {
  const trimmed = value?.trim();

  if (!trimmed || !isSameSitePath(trimmed)) {
    return fallback;
  }

  return trimmed;
}

export function isAllowedHostedAuthUrl(url: string, nodeEnv = process.env.NODE_ENV): boolean {
  const trimmed = url.trim();

  if (isSameSitePath(trimmed)) {
    return true;
  }

  if (containsPlaceholder(trimmed)) {
    return false;
  }

  try {
    const parsedUrl = new URL(trimmed);

    if (parsedUrl.protocol === "https:" && !isLocalPreviewHost(parsedUrl.hostname)) {
      return true;
    }

    return (
      nodeEnv !== "production" &&
      (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") &&
      isLocalPreviewHost(parsedUrl.hostname)
    );
  } catch {
    return false;
  }
}

function firstPresent(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === "string" && value.trim().length > 0);
}

function withRedirectParam(url: string, returnTo: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}redirect_url=${encodeURIComponent(returnTo)}`;
}

function isSameSitePath(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//") && !hasControlCharacter(value);
}

function isLocalPreviewHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
}

function containsPlaceholder(value: string): boolean {
  return /\b(placeholder|changeme|change-me|dummy|example|fake|todo|your-url|your_url)\b/i.test(value);
}

function hasControlCharacter(value: string): boolean {
  return /[\u0000-\u001f\u007f]/.test(value);
}
