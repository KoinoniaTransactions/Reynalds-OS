import {
  readTransactionObligationData,
  type TransactionObligationRecord
} from "./transaction-obligations";

export type TransactionObligationOutcome = "occurred" | "no_event" | "completed";

export type TransactionObligationDependencyRule = {
  dependentKey: string;
  triggerKeys: string[];
  mode: "any_trigger_occurred";
};

export const transactionObligationDependencyRules: readonly TransactionObligationDependencyRule[] = [
  {
    dependentKey: "contract.inspection-resolution",
    triggerKeys: ["contract.inspection-objection"],
    mode: "any_trigger_occurred"
  },
  {
    dependentKey: "contract.title-resolution",
    triggerKeys: ["contract.record-title-objection", "contract.off-record-title-objection"],
    mode: "any_trigger_occurred"
  },
  {
    dependentKey: "contract.appraisal-resolution",
    triggerKeys: ["contract.appraisal-objection"],
    mode: "any_trigger_occurred"
  },
  {
    dependentKey: "contract.due-diligence-documents-resolution",
    triggerKeys: ["contract.due-diligence-documents-objection"],
    mode: "any_trigger_occurred"
  },
  {
    dependentKey: "contract.new-ilc-survey-resolution",
    triggerKeys: ["contract.new-ilc-survey-objection"],
    mode: "any_trigger_occurred"
  }
] as const;

export type ObligationDependencyStatus = "active" | "conditional_waiting" | "not_applicable";

export function getTransactionObligationDependencyStatus(
  obligation: TransactionObligationRecord,
  allObligations: TransactionObligationRecord[]
): ObligationDependencyStatus {
  const data = readTransactionObligationData(obligation.data);
  if (!data) return "active";

  const rule = transactionObligationDependencyRules.find(
    (candidate) => candidate.dependentKey === data.obligationKey
  );
  if (!rule) return "active";

  const currentTriggers = rule.triggerKeys
    .map((key) => getCurrentObligationByKey(allObligations, key))
    .filter((record): record is TransactionObligationRecord => Boolean(record));

  if (!currentTriggers.length) return "conditional_waiting";

  if (currentTriggers.some((trigger) => getTransactionObligationOutcome(trigger) === "occurred")) {
    return "active";
  }

  const allTriggersResolvedWithoutEvent = currentTriggers.every((trigger) => {
    const triggerData = readTransactionObligationData(trigger.data);
    if (!triggerData) return false;
    return (
      getTransactionObligationOutcome(trigger) === "no_event" ||
      triggerData.state === "not_applicable"
    );
  });

  if (allTriggersResolvedWithoutEvent) return "not_applicable";
  return "conditional_waiting";
}

export function getTransactionObligationOutcome(
  obligation: TransactionObligationRecord
): TransactionObligationOutcome | null {
  const raw = asRecord(obligation.data);
  const explicit = raw?.satisfactionOutcome;
  if (explicit === "occurred" || explicit === "no_event" || explicit === "completed") {
    return explicit;
  }

  const data = readTransactionObligationData(obligation.data);
  if (!data) return null;

  // Existing evidence-backed obligations predate the explicit outcome marker.
  // For objection/event milestones, documentary evidence proves the event occurred.
  if ((data.evidenceDocumentIds?.length ?? 0) > 0) return "occurred";
  if (data.state === "satisfied") return "completed";
  return null;
}

export function getCurrentObligationByKey(
  obligations: TransactionObligationRecord[],
  obligationKey: string
): TransactionObligationRecord | null {
  return obligations
    .filter((record) => {
      const data = readTransactionObligationData(record.data);
      return data?.obligationKey === obligationKey && data.state !== "superseded";
    })
    .sort((left, right) => {
      const leftData = readTransactionObligationData(left.data);
      const rightData = readTransactionObligationData(right.data);
      return (rightData?.sequence ?? 0) - (leftData?.sequence ?? 0);
    })[0] ?? null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
