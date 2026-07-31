import {
  extractWalmartTanksIdentifiers,
  extractWalmartTanksLocation,
  getWalmartTanksReviewCategory
} from "./walmart-tanks-review";

export const ARCHIVED_CANDIDATE_BUCKETS = [
  "filingCandidates",
  "reviewCandidates",
  "enrichmentCandidates",
  "alreadyFiled",
  "duplicateOrAlreadyFiled",
  "relatedMessages",
  "heldForNextReview"
] as const;

export type ArchivedCandidateBucket =
  (typeof ARCHIVED_CANDIDATE_BUCKETS)[number];

export type ArchivedCommunicationCandidate =
  Record<string, unknown>;

export type NormalizedCommunicationCandidate = {
  source: "gmail";
  externalMessageId: string;
  externalThreadId?: string;
  subject: string;
  sender: string;
  sentAt?: string;
  status: "ready_to_file" | "review" | "duplicate";
  matchConfidence?: number;
  identifiers: {
    storeNumbers: string[];
    workOrderNumbers: string[];
    purchaseOrderNumbers: string[];
  };
  location: {
    city?: string;
    state?: string;
  };
  suggestedWorkItemName?: string;
  review?: {
    category: string;
    reason: string;
  };
  rawMetadata: {
    bucket: ArchivedCandidateBucket;
    sourceFile: string;
    original: ArchivedCommunicationCandidate;
    matchEvidence?: unknown;
  };
};

const CONFIDENCE_SCORES: Record<string, number> = {
  high: 95,
  medium: 75,
  low: 50
};

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : undefined;
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function statusForBucket(
  bucket: ArchivedCandidateBucket
): NormalizedCommunicationCandidate["status"] {
  if (
    bucket === "reviewCandidates" ||
    bucket === "heldForNextReview"
  ) {
    return "review";
  }

  if (
    bucket === "alreadyFiled" ||
    bucket === "duplicateOrAlreadyFiled"
  ) {
    return "duplicate";
  }

  return "ready_to_file";
}

function confidenceScore(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }

  const normalized = stringValue(value)?.toLowerCase();
  return normalized ? CONFIDENCE_SCORES[normalized] : undefined;
}

export type CandidateNormalizationResult =
  | {
      ok: true;
      value: NormalizedCommunicationCandidate;
    }
  | {
      ok: false;
      reason: string;
    };

export function normalizeArchivedCommunicationCandidate(input: {
  bucket: ArchivedCandidateBucket;
  sourceFile: string;
  candidate: ArchivedCommunicationCandidate;
}): CandidateNormalizationResult {
  const { bucket, sourceFile, candidate } = input;

  const externalMessageId =
    stringValue(candidate.gmailId) ??
    stringValue(candidate.messageId) ??
    stringValue(candidate.externalMessageId) ??
    stringValue(candidate.id);

  if (!externalMessageId) {
    return {
      ok: false,
      reason: `Missing external message ID in ${sourceFile}:${bucket}`
    };
  }

  const subject = stringValue(candidate.subject) ?? "(no subject)";
  const sender = stringValue(candidate.sender) ?? "Unknown sender";
  const reviewReason =
    stringValue(candidate.reviewReason) ??
    stringValue(candidate.reason);

  const searchText = [
    subject,
    reviewReason,
    stringValue(candidate.city),
    stringValue(candidate.state),
    stringValue(candidate.storeNumber),
    stringValue(candidate.workOrderNumber),
    stringValue(candidate.purchaseOrderNumber)
  ]
    .filter(Boolean)
    .join(" ");

  const extractedIdentifiers =
    extractWalmartTanksIdentifiers(searchText);
  const extractedLocation =
    extractWalmartTanksLocation(searchText);

  const explicitStoreNumber = stringValue(candidate.storeNumber);
  const explicitWorkOrderNumber =
    stringValue(candidate.workOrderNumber);
  const explicitPurchaseOrderNumber =
    stringValue(candidate.purchaseOrderNumber);

  const identifiers = {
    storeNumbers: unique([
      ...(explicitStoreNumber ? [explicitStoreNumber] : []),
      ...extractedIdentifiers.storeNumbers
    ]),
    workOrderNumbers: unique([
      ...(explicitWorkOrderNumber ? [explicitWorkOrderNumber] : []),
      ...extractedIdentifiers.workOrderNumbers
    ]),
    purchaseOrderNumbers: unique([
      ...(explicitPurchaseOrderNumber
        ? [explicitPurchaseOrderNumber]
        : []),
      ...extractedIdentifiers.purchaseOrderNumbers
    ])
  };

  const city =
    stringValue(candidate.city) ?? extractedLocation.city;
  const state =
    stringValue(candidate.state)?.toUpperCase() ??
    extractedLocation.state;
  const status = statusForBucket(bucket);

  const suggestedWorkItemName =
    stringValue(candidate.recommendedCard) ??
    stringValue(candidate.existingCard);

  const review =
    status === "review"
      ? {
          category: getWalmartTanksReviewCategory({
            subject,
            sender,
            city,
            state,
            reviewReason
          }),
          reason:
            reviewReason ??
            "Manual review required before filing."
        }
      : undefined;

  return {
    ok: true,
    value: {
      source: "gmail",
      externalMessageId,
      externalThreadId: stringValue(candidate.threadId),
      subject,
      sender,
      sentAt: stringValue(candidate.sentAt),
      status,
      matchConfidence: confidenceScore(candidate.matchConfidence),
      identifiers,
      location: {
        city,
        state
      },
      suggestedWorkItemName,
      review,
      rawMetadata: {
        bucket,
        sourceFile,
        original: candidate,
        matchEvidence: candidate.matchEvidence
      }
    }
  };
}
