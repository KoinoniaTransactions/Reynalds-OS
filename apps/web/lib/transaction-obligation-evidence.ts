export type TransactionObligationEvidenceRule = {
  documentMatches: string[];
  obligationKeys: string[];
  reason: string;
};

// Evidence rules are intentionally conservative. A document is allowed to auto-satisfy an
// obligation only when its presence clearly proves that specific transaction milestone occurred.
// Silence / absence of a document never satisfies an objection, termination, or resolution right.
export const transactionObligationEvidenceRules: readonly TransactionObligationEvidenceRule[] = [
  {
    documentMatches: ["earnest money receipt", "earnest money deposit receipt", "earnest money confirmation"],
    obligationKeys: ["contract.alternative-earnest-money"],
    reason: "Earnest money receipt confirms delivery/deposit evidence is in the file."
  },
  {
    documentMatches: ["seller property disclosure", "seller's property disclosure"],
    obligationKeys: ["contract.seller-property-disclosure"],
    reason: "Seller Property Disclosure is in the transaction file."
  },
  {
    documentMatches: ["lead-based paint disclosure", "lead based paint disclosure"],
    obligationKeys: ["contract.lead-based-paint-disclosure"],
    reason: "Lead-Based Paint Disclosure is in the transaction file."
  },
  {
    documentMatches: ["hoa / association documents", "hoa association documents", "association documents", "hoa documents"],
    obligationKeys: ["contract.association-documents"],
    reason: "Association document package is in the transaction file."
  },
  {
    documentMatches: ["inspection objection", "inspection objection notice"],
    obligationKeys: ["contract.inspection-objection"],
    reason: "Inspection Objection document is in the transaction file."
  },
  {
    documentMatches: ["inspection resolution"],
    obligationKeys: ["contract.inspection-resolution"],
    reason: "Inspection Resolution document is in the transaction file."
  },
  {
    documentMatches: ["title commitment", "title commitment / title documents", "title commitment and documents"],
    obligationKeys: ["contract.record-title"],
    reason: "Title commitment evidence is in the transaction file."
  },
  {
    documentMatches: ["title-related objection notice", "title objection", "title objection notice"],
    obligationKeys: ["contract.record-title-objection", "contract.off-record-title-objection"],
    reason: "A title objection document is in the transaction file."
  },
  {
    documentMatches: ["appraisal", "appraisal report"],
    obligationKeys: ["contract.appraisal"],
    reason: "Appraisal evidence is in the transaction file."
  },
  {
    documentMatches: ["appraised value objection notice", "appraisal objection", "appraisal objection notice"],
    obligationKeys: ["contract.appraisal-objection"],
    reason: "Appraisal objection evidence is in the transaction file."
  }
] as const;

export function getTransactionObligationEvidenceRules(
  documentType: string
): TransactionObligationEvidenceRule[] {
  const normalized = normalizeDocumentType(documentType);
  return transactionObligationEvidenceRules.filter((rule) =>
    rule.documentMatches.some((candidate) => normalized === normalizeDocumentType(candidate))
  );
}

function normalizeDocumentType(value: string): string {
  return value
    .toLocaleLowerCase("en-US")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}
