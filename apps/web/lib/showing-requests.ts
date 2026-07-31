export const showingRequestObjectType = "ShowingRequest";

export const showingRequestStatuses = [
  "Requested",
  "Scheduling",
  "Confirmed",
  "Completed",
  "Needs Follow-up"
] as const;

export type ShowingRequestStatus = (typeof showingRequestStatuses)[number];

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

export type ShowingRequestStatusUpdateInput = {
  assignedProvider?: string;
  confirmedWindow?: string;
  feedbackSummary?: string;
  notes?: string;
  status: ShowingRequestStatus;
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
    return buildShowingStatusNextAction("Needs Follow-up");
  }

  return buildShowingStatusNextAction("Requested");
}

export function getHumanShowingStatus(status: string): string {
  switch (status) {
    case "Requested":
      return "Requested";
    case "Scheduling":
      return "Scheduling";
    case "Confirmed":
    case "Scheduled":
      return "Confirmed";
    case "Needs Follow-up":
    case "Waiting on Client":
      return "Needs Follow-up";
    case "Completed":
      return "Completed";
    case "Canceled":
      return "Needs Follow-up";
    default:
      return status;
  }
}

export function validateShowingRequestStatusUpdateInput(
  input: unknown
): ShowingRequestStatusUpdateInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ShowingRequestValidationError("Status update body must be an object.");
  }

  const value = input as Record<string, unknown>;
  const status = normalizeShowingStatus(optionalString(value.status) ?? "");
  const notes = optionalString(value.notes);
  const feedbackSummary = optionalString(value.feedbackSummary);

  for (const candidate of [notes, feedbackSummary]) {
    if (candidate && containsCredentialLanguage(candidate)) {
      throw new ShowingRequestValidationError(
        "Do not include lockbox codes, gate codes, passwords, or private access secrets in showing status notes."
      );
    }
  }

  return {
    assignedProvider: optionalString(value.assignedProvider),
    confirmedWindow: optionalString(value.confirmedWindow),
    feedbackSummary,
    notes,
    status
  };
}

export function buildShowingStatusNextAction(status: ShowingRequestStatus): string {
  switch (status) {
    case "Requested":
      return "Review the requested showing window and confirm licensed coverage.";
    case "Scheduling":
      return "Coordinate showing time, buyer availability, and access readiness.";
    case "Confirmed":
      return "Complete the confirmed showing and record feedback after coverage.";
    case "Completed":
      return "Review completion notes, feedback, and billing follow-up.";
    case "Needs Follow-up":
      return "Resolve missing authorization, access details, feedback, or client follow-up.";
  }
}

export function getShowingStatusHealth(status: ShowingRequestStatus): string {
  switch (status) {
    case "Requested":
    case "Scheduling":
      return "Attention";
    case "Confirmed":
      return "Watch";
    case "Completed":
      return "Healthy";
    case "Needs Follow-up":
      return "Blocked";
  }
}

export function normalizeShowingStatus(status: string): ShowingRequestStatus {
  if (showingRequestStatuses.includes(status as ShowingRequestStatus)) {
    return status as ShowingRequestStatus;
  }

  if (status === "Scheduled") {
    return "Confirmed";
  }

  if (status === "Waiting on Client" || status === "Canceled") {
    return "Needs Follow-up";
  }

  throw new ShowingRequestValidationError(
    "status must be Requested, Scheduling, Confirmed, Completed, or Needs Follow-up."
  );
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
