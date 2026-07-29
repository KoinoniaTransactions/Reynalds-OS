export type InvitationInput = {
  clientObjectId?: string;
  email: string;
  expiresAt?: string;
  name?: string;
  providerInvitationId?: string;
  roleName: string;
  serviceContext?: Record<string, unknown>;
};

export class InvitationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvitationValidationError";
  }
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

  return {
    email,
    roleName,
    name: typeof value.name === "string" && value.name.trim() ? value.name.trim() : undefined,
    providerInvitationId:
      typeof value.providerInvitationId === "string" && value.providerInvitationId.trim()
        ? value.providerInvitationId.trim()
        : undefined,
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
