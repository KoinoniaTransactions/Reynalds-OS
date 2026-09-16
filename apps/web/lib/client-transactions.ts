import {
  reusableClientRule,
  type TransactionSide,
  type TransactionStage
} from "./transaction-intake";

export const clientTransactionObjectType = "Transaction";
export const clientRelationshipObjectType = reusableClientRule.objectType;

export type ClientTransactionIntakeInput = {
  clientName?: string;
  intakeRequestId?: string;
  propertyAddress?: string;
  side?: TransactionSide;
  sourceDocumentName: string;
  stage?: TransactionStage;
};

export class ClientTransactionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientTransactionValidationError";
  }
}

export function validateClientTransactionIntakeInput(
  input: unknown
): ClientTransactionIntakeInput {
  if (!input || typeof input !== "object") {
    throw new ClientTransactionValidationError("Transaction intake must be an object.");
  }

  const value = input as Record<string, unknown>;
  const sourceDocumentName = requiredString(
    value.sourceDocumentName,
    "A source document is required to start the file."
  );
  const side = optionalTransactionSide(value.side);
  const stage = optionalTransactionStage(value.stage);
  const intakeRequestId = optionalString(value.intakeRequestId);

  if (value.side !== undefined && !side) {
    throw new ClientTransactionValidationError("Transaction side must be buyer or seller when provided.");
  }

  if (value.stage !== undefined && !stage) {
    throw new ClientTransactionValidationError(
      "Transaction stage must be pre_contract or under_contract when provided."
    );
  }

  if (intakeRequestId && intakeRequestId.length > 100) {
    throw new ClientTransactionValidationError("Transaction intake request id is too long.");
  }

  return {
    clientName: optionalString(value.clientName),
    intakeRequestId,
    propertyAddress: optionalString(value.propertyAddress),
    side,
    sourceDocumentName,
    stage
  };
}

export function buildClientTransactionName(input: ClientTransactionIntakeInput): string {
  const anchor = input.propertyAddress ?? input.clientName ?? stripFileExtension(input.sourceDocumentName);
  if (!input.side) return `${anchor} — Transaction Intake`;
  return `${anchor} — ${input.side === "buyer" ? "Buyer" : "Seller"}`;
}

export function getClientTransactionStatus(
  stage?: TransactionStage,
  hasConfirmedIdentity = false
): string {
  if (!hasConfirmedIdentity || !stage) {
    return "Intake - Processing";
  }

  return stage === "under_contract" ? "Under Contract" : "Intake";
}

export function getClientTransactionNextAction(
  input: ClientTransactionIntakeInput
): string {
  if (!input.side || !input.stage) {
    return "Identify the transaction side, stage, client, property, and transaction details from the uploaded documents.";
  }

  if (!input.clientName || (input.side === "seller" && !input.propertyAddress)) {
    return "Extract client, property, and transaction details from the uploaded document.";
  }

  return input.stage === "under_contract"
    ? "Review the executed contract and confirm extracted transaction deadlines."
    : input.side === "buyer"
      ? "Review the buyer representation document and complete any missing client details."
      : "Review the listing agreement and complete any missing seller or property details.";
}

export function getClientTransactionPartyRelationshipType(side: TransactionSide): string {
  return reusableClientRule.relationshipTypes[side];
}

export function normalizeClientIdentityName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

export function getTransactionIntakeRequestId(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const requestId = (value as Record<string, unknown>).intakeRequestId;
  return typeof requestId === "string" && requestId.trim() ? requestId.trim() : null;
}

function stripFileExtension(value: string): string {
  return value.replace(/\.[^.]+$/, "").trim() || "New Transaction";
}

function requiredString(value: unknown, message: string): string {
  const normalized = optionalString(value);

  if (!normalized) {
    throw new ClientTransactionValidationError(message);
  }

  return normalized;
}

function optionalTransactionSide(value: unknown): TransactionSide | undefined {
  return value === "buyer" || value === "seller" ? value : undefined;
}

function optionalTransactionStage(value: unknown): TransactionStage | undefined {
  return value === "pre_contract" || value === "under_contract" ? value : undefined;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length ? normalized : undefined;
}
