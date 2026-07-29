export const showingRequestObjectType = "ShowingRequest";

export type ShowingRequestInput = {
  authorization: boolean;
  buyerContact?: string;
  buyerName?: string;
  clientName?: string;
  notes?: string;
  preferredWindow: string;
  propertyAddress: string;
  serviceLevel: string;
};

export class ShowingRequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShowingRequestValidationError";
  }
}

export function validateShowingRequestInput(input: unknown): ShowingRequestInput {
  if (!input || typeof input !== "object") {
    throw new ShowingRequestValidationError("Request body must be an object.");
  }

  const value = input as Record<string, unknown>;
  const propertyAddress = requiredString(value.propertyAddress, "propertyAddress");
  const preferredWindow = requiredString(value.preferredWindow, "preferredWindow");
  const serviceLevel = optionalString(value.serviceLevel) ?? "Showing coverage";
  const notes = optionalString(value.notes);

  if (notes && containsCredentialLanguage(notes)) {
    throw new ShowingRequestValidationError(
      "Do not include lockbox codes, gate codes, passwords, or private access secrets in showing request notes."
    );
  }

  return {
    authorization: value.authorization === true,
    buyerContact: optionalString(value.buyerContact),
    buyerName: optionalString(value.buyerName),
    clientName: optionalString(value.clientName),
    notes,
    preferredWindow,
    propertyAddress,
    serviceLevel
  };
}

export function buildShowingRequestName(input: ShowingRequestInput): string {
  return `Showing Request - ${input.propertyAddress}`;
}

export function buildShowingRequestNextAction(input: ShowingRequestInput): string {
  if (!input.authorization) {
    return "Confirm Realtor authorization before Koinonia contacts the buyer or schedules directly.";
  }

  return "Review requested showing window and confirm licensed coverage.";
}

export function getHumanShowingStatus(status: string): string {
  switch (status) {
    case "Requested":
      return "Scheduling Requested";
    case "Waiting on Client":
      return "Waiting on Client";
    case "Scheduled":
      return "Scheduled";
    case "Completed":
      return "Completed";
    case "Canceled":
      return "Canceled";
    default:
      return status;
  }
}

export function getShowingTimingLabel(data: unknown): string {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Timing needed";
  }

  const preferredWindow = (data as Record<string, unknown>).preferredWindow;

  return typeof preferredWindow === "string" && preferredWindow.trim()
    ? preferredWindow.trim()
    : "Timing needed";
}

export function getShowingNoteLabels(data: unknown): string[] {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["Request details needed"];
  }

  const value = data as Record<string, unknown>;
  const labels = [
    value.authorization === true ? "Client contact authorized" : "Authorization needed",
    optionalString(value.serviceLevel) ?? "Showing coverage"
  ];

  const buyerName = optionalString(value.buyerName);

  if (buyerName) {
    labels.push(`Buyer: ${buyerName}`);
  }

  return labels;
}

function requiredString(value: unknown, fieldName: string): string {
  const text = optionalString(value);

  if (!text) {
    throw new ShowingRequestValidationError(`${fieldName} is required.`);
  }

  return text;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function containsCredentialLanguage(value: string): boolean {
  return /\b(password|passcode|lockbox|gate code|door code|combo|pin|mls login|showingtime login)\b/i.test(value);
}
