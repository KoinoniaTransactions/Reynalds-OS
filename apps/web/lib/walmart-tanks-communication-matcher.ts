import type {
  NormalizedCommunicationCandidate
} from "./walmart-tanks-communication-normalizer";

export type CommunicationWorkItemCandidate = {
  id: string;
  name: string;
  storeNumber?: string;
  workOrderNumber?: string;
  city?: string;
  state?: string;
};

export type CommunicationMatchPlan = {
  workItemId?: string;
  confidence: number;
  evidence: string[];
  requiresReview: boolean;
  reviewReason?: string;
};

function normalized(value: string | undefined) {
  return value?.trim().toLowerCase();
}

export function planCommunicationWorkItemMatch(input: {
  communication: NormalizedCommunicationCandidate;
  workItems: CommunicationWorkItemCandidate[];
}): CommunicationMatchPlan {
  const { communication, workItems } = input;

  if (communication.status === "duplicate") {
    return {
      confidence: 0,
      evidence: ["Archived candidate is marked duplicate."],
      requiresReview: false
    };
  }

  if (communication.status === "review") {
    return {
      confidence: 0,
      evidence: [
        "Archived candidate requires manual review."
      ],
      requiresReview: true,
      reviewReason:
        communication.review?.reason ??
        "Manual review required before filing."
    };
  }

  const storeMatches = workItems.filter((item) =>
    communication.identifiers.storeNumbers.some(
      (storeNumber) =>
        normalized(item.storeNumber) === normalized(storeNumber)
    )
  );

  if (storeMatches.length === 1) {
    return {
      workItemId: storeMatches[0]?.id,
      confidence: 100,
      evidence: [
        `Exact store number match: ${storeMatches[0]?.storeNumber}`
      ],
      requiresReview: false
    };
  }

  if (storeMatches.length > 1) {
    return {
      confidence: 60,
      evidence: [
        "Multiple work items share the same store number."
      ],
      requiresReview: true,
      reviewReason:
        "Multiple existing work items match the detected store number."
    };
  }

  const workOrderMatches = workItems.filter((item) =>
    communication.identifiers.workOrderNumbers.some(
      (workOrderNumber) =>
        normalized(item.workOrderNumber) ===
        normalized(workOrderNumber)
    )
  );

  if (workOrderMatches.length === 1) {
    return {
      workItemId: workOrderMatches[0]?.id,
      confidence: 100,
      evidence: [
        `Exact work order match: ${workOrderMatches[0]?.workOrderNumber}`
      ],
      requiresReview: false
    };
  }

  if (workOrderMatches.length > 1) {
    return {
      confidence: 60,
      evidence: [
        "Multiple work items share the same work order number."
      ],
      requiresReview: true,
      reviewReason:
        "Multiple existing work items match the detected work order."
    };
  }

  return {
    confidence: 0,
    evidence: [
      "No exact existing work-item match was found."
    ],
    requiresReview: true,
    reviewReason:
      "No existing work item matches the detected identifiers."
  };
}
