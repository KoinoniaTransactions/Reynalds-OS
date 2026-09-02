export const LISTING_ENGAGEMENT_OBJECT_TYPE = "Listing Engagement";
export const TRANSACTION_OBJECT_TYPE = "Transaction";
export const LISTING_TO_TRANSACTION_RELATIONSHIP = "converted_to_transaction";

export const listingStatuses = [
  "Intake",
  "Launch Planning",
  "Preparing Property",
  "Listing Build",
  "Marketing Approval",
  "Active",
  "Under Contract",
  "Closed",
  "Archived"
] as const;

export type ListingIntakeInput = {
  propertyAddress: string;
  sellerNames: string;
  targetListDate?: string;
  listingAgreementStatus: "signed" | "pending" | "not_yet";
  listPrice?: string;
  occupancyStatus?: string;
  sellerContactPermission?: string;
  mediaPreference?: string;
  signLockboxNeeded?: string;
  openHousePlan?: string;
  marketingRequested: boolean;
  specialInstructions?: string;
};

export type AcceptedOfferInput = {
  buyerNames?: string;
  buyerAgent?: string;
  closingDate?: string;
  closingCompany?: string;
  contractNotes?: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown) {
  const normalized = text(value);
  return normalized || undefined;
}

function booleanValue(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function dateValue(value: unknown, fieldName: string) {
  const normalized = text(value);
  if (!normalized) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new Error(`${fieldName} must use YYYY-MM-DD format.`);
  }
  return normalized;
}

export function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export function validateListingIntake(input: unknown): ListingIntakeInput {
  if (!input || typeof input !== "object") {
    throw new Error("Request body must be an object.");
  }

  const value = input as Record<string, unknown>;
  const propertyAddress = text(value.propertyAddress);
  const sellerNames = text(value.sellerNames);
  const listingAgreementStatus = text(value.listingAgreementStatus);

  if (!propertyAddress) throw new Error("propertyAddress is required.");
  if (!sellerNames) throw new Error("sellerNames is required.");
  if (!["signed", "pending", "not_yet"].includes(listingAgreementStatus)) {
    throw new Error("listingAgreementStatus must be signed, pending, or not_yet.");
  }

  return {
    propertyAddress,
    sellerNames,
    targetListDate: dateValue(value.targetListDate, "targetListDate"),
    listingAgreementStatus: listingAgreementStatus as ListingIntakeInput["listingAgreementStatus"],
    listPrice: optionalText(value.listPrice),
    occupancyStatus: optionalText(value.occupancyStatus),
    sellerContactPermission: optionalText(value.sellerContactPermission),
    mediaPreference: optionalText(value.mediaPreference),
    signLockboxNeeded: optionalText(value.signLockboxNeeded),
    openHousePlan: optionalText(value.openHousePlan),
    marketingRequested: booleanValue(value.marketingRequested, true),
    specialInstructions: optionalText(value.specialInstructions)
  };
}

export function validateAcceptedOffer(input: unknown): AcceptedOfferInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Request body must be an object.");
  }

  const value = input as Record<string, unknown>;

  return {
    buyerNames: optionalText(value.buyerNames),
    buyerAgent: optionalText(value.buyerAgent),
    closingDate: dateValue(value.closingDate, "closingDate"),
    closingCompany: optionalText(value.closingCompany),
    contractNotes: optionalText(value.contractNotes)
  };
}

export function buildListingName(input: ListingIntakeInput) {
  return `${input.propertyAddress} — ${input.sellerNames}`;
}

export function buildListingData(input: ListingIntakeInput) {
  return {
    schemaVersion: 1,
    lifecycle: "hand_us_the_listing",
    phase: "intake",
    propertyAddress: input.propertyAddress,
    sellerNames: input.sellerNames,
    targetListDate: input.targetListDate ?? null,
    listingAgreementStatus: input.listingAgreementStatus,
    listPrice: input.listPrice ?? null,
    occupancyStatus: input.occupancyStatus ?? null,
    sellerContactPermission: input.sellerContactPermission ?? null,
    mediaPreference: input.mediaPreference ?? "koinonia_coordinate",
    signLockboxNeeded: input.signLockboxNeeded ?? "unknown",
    openHousePlan: input.openHousePlan ?? "unknown",
    marketingRequested: input.marketingRequested,
    specialInstructions: input.specialInstructions ?? null,
    approvalState: "intake_review",
    launchChecklist: {
      authority: "open",
      documents: "open",
      launchPlan: "open",
      mediaVendors: "open",
      listingBuild: "open",
      marketing: input.marketingRequested ? "open" : "not_requested",
      launchQa: "open"
    }
  };
}

export function buildInitialListingTasks(input: ListingIntakeInput) {
  const tasks = [
    "Verify listing agreement, authority, and brokerage requirements",
    "Collect and organize listing documents and seller disclosures",
    "Build coordinated listing launch plan",
    "Confirm property access, sign, and lockbox requirements",
    "Coordinate media and property-preparation vendors",
    "Prepare MLS/listing setup and launch QA"
  ];

  if (input.marketingRequested) {
    tasks.push("Create listing marketing work order and approval package");
  }

  if (input.openHousePlan && input.openHousePlan !== "no") {
    tasks.push("Confirm open-house plan, coverage, lead handoff, and promotion");
  }

  return tasks;
}

export function buildTransactionDataFromListing(
  listingId: string,
  listingData: Record<string, unknown>,
  offer: AcceptedOfferInput
) {
  return {
    schemaVersion: 1,
    sourceListingEngagementId: listingId,
    handoffSource: "hand_us_the_listing",
    propertyAddress: listingData.propertyAddress ?? null,
    sellerNames: listingData.sellerNames ?? null,
    buyerNames: offer.buyerNames ?? null,
    buyerAgent: offer.buyerAgent ?? null,
    closingDate: offer.closingDate ?? null,
    closingCompany: offer.closingCompany ?? null,
    contractNotes: offer.contractNotes ?? null,
    acceptedOfferRecordedAt: new Date().toISOString()
  };
}
