import type { TransactionSide, TransactionStage } from "./transaction-intake";
import type { TransactionDocumentChecklistItem } from "./transaction-document-requirements";

const baselineRequirementIds: Record<`${TransactionSide}:${TransactionStage}`, string[]> = {
  "buyer:pre_contract": [
    "buyer-agency-agreement",
    "brokerage-disclosure-buyer",
    "definitions-working-relationships"
  ],
  "buyer:under_contract": [
    "purchase-contract",
    "buyer-agency-agreement",
    "contract-addenda"
  ],
  "seller:pre_contract": [
    "listing-agreement",
    "seller-property-disclosure",
    "mls-history"
  ],
  "seller:under_contract": [
    "purchase-contract",
    "listing-agreement",
    "seller-property-disclosure",
    "contract-addenda"
  ]
};

export function getBaselineDocumentRequirementIds(
  side: TransactionSide,
  stage: TransactionStage
): string[] {
  return baselineRequirementIds[`${side}:${stage}`];
}

export function getOutstandingBaselineDocuments(
  side: TransactionSide,
  stage: TransactionStage,
  checklist: TransactionDocumentChecklistItem[]
): TransactionDocumentChecklistItem[] {
  const baseline = new Set(getBaselineDocumentRequirementIds(side, stage));

  return checklist.filter(
    (item) => baseline.has(item.id) && item.status !== "received"
  );
}

export function shouldAskResidualTransactionQuestions(
  side: TransactionSide,
  stage: TransactionStage,
  checklist: TransactionDocumentChecklistItem[]
): boolean {
  return getOutstandingBaselineDocuments(side, stage, checklist).length === 0;
}
