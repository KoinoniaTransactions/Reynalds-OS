import {
  reusableClientRule,
  type TransactionSide,
  type TransactionStage
} from "./transaction-intake";

export const clientTransactionObjectType = "Transaction";
export const clientRelationshipObjectType = reusableClientRule.objectType;

export type ClientTransactionIntakeInput = {
  clientName?: string;
  propertyAddress?: string;
  side: TransactionSide;
  sourceDocumentName: string;
  stage: TransactionStage;
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
  const side = value.side;
  const stage = value.stage;

  if (side !== "buyer" && side !== "seller") {
    throw new ClientTransactionValidationError("Transaction side must be buyer or seller.");
  }

  if (stage !== "pre_contract" && stage !== "under_contract") {
    throw new ClientTransactionValidationError(
      "Transaction stage must be pre_contract or under_contract."
    );
  }

  return {
    clientName: optionalString(value.clientName),
    propertyAddress: optionalString(value.propertyAddress),
    side,
    sourceDocumentName,
    stage
  };
}

export function buildClientTransactionName(input: ClientTransactionIntakeInput): string {
  const anchor = input.propertyAddress ?? input.clientName ?? stripFileExtension(input.sourceDocumentName);
  return `${anchor} — ${input.side === "buyer" ? "Buyer" : "Seller"}`;
}

export function getClientTransactionStatus(
  stage: TransactionStage,
  hasConfirmedIdentity = false
): string {
  if (!hasConfirmedIdentity) {
    return "Intake - Processing";
  }

  return stage === "under_contract" ? "Under Contract" : "Intake";
}

export function getClientTransactionNextAction(
  input: ClientTransactionIntakeInput
): string {
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

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length ? normalized : undefined;
}
