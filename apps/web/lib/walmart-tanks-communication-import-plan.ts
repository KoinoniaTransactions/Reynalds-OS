import {
  planCommunicationWorkItemMatch,
  type CommunicationMatchPlan,
  type CommunicationWorkItemCandidate
} from "./walmart-tanks-communication-matcher";
import {
  normalizeArchivedCommunicationCandidate,
  type CandidateNormalizationResult,
  type NormalizedCommunicationCandidate
} from "./walmart-tanks-communication-normalizer";
import type {
  ArchivedCommunicationCandidateEnvelope
} from "./walmart-tanks-communication-batches";

export type CommunicationImportPlanItem = {
  communication: NormalizedCommunicationCandidate;
  match: CommunicationMatchPlan;
  action:
    | "insert_and_link"
    | "insert_for_review"
    | "insert_duplicate"
    | "skip_existing";
};

export type CommunicationImportPlan = {
  items: CommunicationImportPlanItem[];
  rejected: Extract<CandidateNormalizationResult, { ok: false }>[];
  duplicateOccurrences: string[];
  summary: {
    candidateOccurrences: number;
    normalizedOccurrences: number;
    rejectedOccurrences: number;
    uniqueMessages: number;
    duplicateOccurrences: number;
    skipExisting: number;
    insertAndLink: number;
    insertForReview: number;
    insertDuplicate: number;
  };
};

export function buildCommunicationImportPlan(input: {
  candidates: ArchivedCommunicationCandidateEnvelope[];
  workItems: CommunicationWorkItemCandidate[];
  existingMessageIds?: Iterable<string>;
}): CommunicationImportPlan {
  const {
    candidates,
    workItems,
    existingMessageIds = []
  } = input;

  const existingIds = new Set(existingMessageIds);
  const uniqueCommunications =
    new Map<string, NormalizedCommunicationCandidate>();
  const rejected: Extract<
    CandidateNormalizationResult,
    { ok: false }
  >[] = [];
  const duplicateOccurrences: string[] = [];

  for (const candidate of candidates) {
    const result =
      normalizeArchivedCommunicationCandidate(candidate);

    if (!result.ok) {
      rejected.push(result);
      continue;
    }

    const messageId = result.value.externalMessageId;

    if (uniqueCommunications.has(messageId)) {
      duplicateOccurrences.push(messageId);
      continue;
    }

    uniqueCommunications.set(messageId, result.value);
  }

  const items: CommunicationImportPlanItem[] = [];

  for (const communication of uniqueCommunications.values()) {
    const match = planCommunicationWorkItemMatch({
      communication,
      workItems
    });

    let action: CommunicationImportPlanItem["action"];

    if (existingIds.has(communication.externalMessageId)) {
      action = "skip_existing";
    } else if (communication.status === "duplicate") {
      action = "insert_duplicate";
    } else if (match.workItemId && !match.requiresReview) {
      action = "insert_and_link";
    } else {
      action = "insert_for_review";
    }

    items.push({
      communication,
      match,
      action
    });
  }

  return {
    items,
    rejected,
    duplicateOccurrences,
    summary: {
      candidateOccurrences: candidates.length,
      normalizedOccurrences:
        candidates.length - rejected.length,
      rejectedOccurrences: rejected.length,
      uniqueMessages: uniqueCommunications.size,
      duplicateOccurrences: duplicateOccurrences.length,
      skipExisting: items.filter(
        (item) => item.action === "skip_existing"
      ).length,
      insertAndLink: items.filter(
        (item) => item.action === "insert_and_link"
      ).length,
      insertForReview: items.filter(
        (item) => item.action === "insert_for_review"
      ).length,
      insertDuplicate: items.filter(
        (item) => item.action === "insert_duplicate"
      ).length
    }
  };
}
