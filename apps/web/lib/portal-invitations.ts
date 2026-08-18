export type InvitationInput = {
  clientObjectId?: string;
  email: string;
  expiresAt?: string;
  name?: string;
  providerInvitationId?: string;
  redirectUrl?: string;
  roleName: string;
  sendProviderInvitation?: boolean;
  serviceContext?: Record<string, unknown>;
};

export class InvitationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvitationValidationError";
  }
}

export function canRevokeInvitationStatus(status: string): boolean {
  return status === "pending" || status === "provider_pending" || status === "provider_error";
}

export function validateInvitationInput(input: unknown): InvitationInput {
  if (!input || typeof input !== "object") {
    throw new InvitationValidationError("Request body must be an object.");
  }

  const value = input as Record<string, unknown>;
  const email = typeof value.email === "string" ? value.email.trim().toLowerCase() : "";
  const roleName = typeof value.roleName === "string" ? value.roleName.trim() : "";

  if (!isValidEmail(email)) {
    throw new InvitationValidationError("email is required.");
  }

  if (!roleName) {
    throw new InvitationValidationError("roleName is required.");
  }

  const providerInvitationId =
    typeof value.providerInvitationId === "string" && value.providerInvitationId.trim()
      ? value.providerInvitationId.trim()
      : undefined;
  const sendProviderInvitation = value.sendProviderInvitation === true;

  if (providerInvitationId && sendProviderInvitation) {
    throw new InvitationValidationError(
      "providerInvitationId cannot be supplied when sendProviderInvitation is true."
    );
  }

  const redirectUrl =
    typeof value.redirectUrl === "string" && value.redirectUrl.trim()
      ? value.redirectUrl.trim()
      : undefined;

  if (redirectUrl && !isAllowedRedirectUrl(redirectUrl)) {
    throw new InvitationValidationError(
      "redirectUrl must be a same-site path or a configured Koinonia redirect origin."
    );
  }

  return {
    email,
    roleName,
    name: typeof value.name === "string" && value.name.trim() ? value.name.trim() : undefined,
    providerInvitationId,
    redirectUrl,
    sendProviderInvitation,
    clientObjectId:
      typeof value.clientObjectId === "string" && value.clientObjectId.trim()
        ? value.clientObjectId.trim()
        : undefined,
    serviceContext:
      value.serviceContext && typeof value.serviceContext === "object" && !Array.isArray(value.serviceContext)
        ? (value.serviceContext as Record<string, unknown>)
        : undefined,
    expiresAt: typeof value.expiresAt === "string" && value.expiresAt.trim() ? value.expiresAt.trim() : undefined
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isAllowedRedirectUrl(url: string): boolean {
  const trimmed = url.trim();

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  try {
    const parsedUrl = new URL(trimmed);
    const allowedOrigins = getAllowedAuthRedirectOrigins();

    if (allowedOrigins.includes(parsedUrl.origin)) {
      return true;
    }

    return process.env.NODE_ENV !== "production" && isLocalPreviewOrigin(parsedUrl);
  } catch {
    return false;
  }
}

export function getAllowedAuthRedirectOrigins(): string[] {
  const configuredOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    ...(process.env.KOINONIA_ALLOWED_AUTH_REDIRECT_ORIGINS ?? "").split(",")
  ];

  return Array.from(
    new Set(configuredOrigins.map(toAllowedOrigin).filter((origin): origin is string => Boolean(origin)))
  );
}

function toAllowedOrigin(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed || containsPlaceholder(trimmed)) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(trimmed);

    if (parsedUrl.protocol === "https:") {
      return parsedUrl.origin;
    }

    if (process.env.NODE_ENV !== "production" && isLocalPreviewOrigin(parsedUrl)) {
      return parsedUrl.origin;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function isLocalPreviewOrigin(url: URL): boolean {
  return (
    (url.protocol === "http:" || url.protocol === "https:") &&
    (url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1" ||
      url.hostname === "[::1]")
  );
}

function containsPlaceholder(value: string): boolean {
  return /\b(placeholder|changeme|change-me|dummy|example|fake|todo|your-url|your_url)\b/i.test(value);
}
