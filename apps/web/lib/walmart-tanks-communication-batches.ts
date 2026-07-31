import {
  ARCHIVED_CANDIDATE_BUCKETS,
  type ArchivedCandidateBucket,
  type ArchivedCommunicationCandidate
} from "./walmart-tanks-communication-normalizer";

export type ArchivedCommunicationCandidateEnvelope = {
  bucket: ArchivedCandidateBucket;
  sourceFile: string;
  candidate: ArchivedCommunicationCandidate;
};

function isCandidate(
  value: unknown
): value is ArchivedCommunicationCandidate {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value)
  );
}

export function collectArchivedCommunicationCandidates(input: {
  sourceFile: string;
  batch: unknown;
}): ArchivedCommunicationCandidateEnvelope[] {
  const { sourceFile, batch } = input;

  if (!isCandidate(batch)) {
    return [];
  }

  const candidates: ArchivedCommunicationCandidateEnvelope[] = [];

  for (const bucket of ARCHIVED_CANDIDATE_BUCKETS) {
    const entries = batch[bucket];

    if (!Array.isArray(entries)) {
      continue;
    }

    for (const candidate of entries) {
      if (!isCandidate(candidate)) {
        continue;
      }

      candidates.push({
        bucket,
        sourceFile,
        candidate
      });
    }
  }

  return candidates;
}
