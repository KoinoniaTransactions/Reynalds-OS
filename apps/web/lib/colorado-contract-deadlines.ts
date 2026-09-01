export type ColoradoContractDeadlineCategory =
  | "earnest_money"
  | "title"
  | "hoa"
  | "seller_disclosure"
  | "financing"
  | "appraisal"
  | "survey"
  | "due_diligence"
  | "conditional_sale"
  | "lead_paint"
  | "closing"
  | "possession"
  | "acceptance"
  | "contract_deadline";

export type ColoradoContractDeadlineDefinition = {
  item: number;
  name: string;
  key: string;
  category: ColoradoContractDeadlineCategory;
  phaseOrder: number;
  sequenceOrder: number;
  operationalDate: boolean;
};

// Colorado Real Estate Commission CBS1 residential §3.1 schedule, mandatory-use 2026 form.
// Blank, N/A, or Deleted entries are not applicable and should not create obligations.
export const coloradoResidentialContractDeadlines: readonly ColoradoContractDeadlineDefinition[] = [
  { item: 1, name: "Time of Day Deadline", key: "time-of-day", category: "contract_deadline", phaseOrder: 0, sequenceOrder: 1, operationalDate: false },
  { item: 2, name: "Alternative Earnest Money Deadline", key: "alternative-earnest-money", category: "earnest_money", phaseOrder: 1, sequenceOrder: 2, operationalDate: true },
  { item: 3, name: "Record Title Deadline (and Tax Certificate)", key: "record-title", category: "title", phaseOrder: 2, sequenceOrder: 3, operationalDate: true },
  { item: 4, name: "Record Title Objection Deadline", key: "record-title-objection", category: "title", phaseOrder: 2, sequenceOrder: 4, operationalDate: true },
  { item: 5, name: "Off-Record Title Deadline", key: "off-record-title", category: "title", phaseOrder: 2, sequenceOrder: 5, operationalDate: true },
  { item: 6, name: "Off-Record Title Objection Deadline", key: "off-record-title-objection", category: "title", phaseOrder: 2, sequenceOrder: 6, operationalDate: true },
  { item: 7, name: "Title Resolution Deadline", key: "title-resolution", category: "title", phaseOrder: 2, sequenceOrder: 7, operationalDate: true },
  { item: 8, name: "Third Party Right to Purchase/Approve Deadline", key: "third-party-purchase-approve", category: "title", phaseOrder: 2, sequenceOrder: 8, operationalDate: true },
  { item: 9, name: "Association Documents Deadline", key: "association-documents", category: "hoa", phaseOrder: 3, sequenceOrder: 9, operationalDate: true },
  { item: 10, name: "Association Documents Termination Deadline", key: "association-documents-termination", category: "hoa", phaseOrder: 3, sequenceOrder: 10, operationalDate: true },
  { item: 11, name: "Seller's Property Disclosure Deadline", key: "seller-property-disclosure", category: "seller_disclosure", phaseOrder: 4, sequenceOrder: 11, operationalDate: true },
  { item: 12, name: "Lead-Based Paint Disclosure Deadline", key: "lead-based-paint-disclosure", category: "lead_paint", phaseOrder: 4, sequenceOrder: 12, operationalDate: true },
  { item: 13, name: "New Loan Application Deadline", key: "new-loan-application", category: "financing", phaseOrder: 7, sequenceOrder: 13, operationalDate: true },
  { item: 14, name: "New Loan Terms Deadline", key: "new-loan-terms", category: "financing", phaseOrder: 7, sequenceOrder: 14, operationalDate: true },
  { item: 15, name: "New Loan Availability Deadline", key: "new-loan-availability", category: "financing", phaseOrder: 7, sequenceOrder: 15, operationalDate: true },
  { item: 16, name: "Buyer's Credit Information Deadline", key: "buyer-credit-information", category: "financing", phaseOrder: 7, sequenceOrder: 16, operationalDate: true },
  { item: 17, name: "Disapproval of Buyer's Credit Information Deadline", key: "buyer-credit-disapproval", category: "financing", phaseOrder: 7, sequenceOrder: 17, operationalDate: true },
  { item: 18, name: "Existing Loan Deadline", key: "existing-loan", category: "financing", phaseOrder: 7, sequenceOrder: 18, operationalDate: true },
  { item: 19, name: "Existing Loan Termination Deadline", key: "existing-loan-termination", category: "financing", phaseOrder: 7, sequenceOrder: 19, operationalDate: true },
  { item: 20, name: "Loan Transfer Approval Deadline", key: "loan-transfer-approval", category: "financing", phaseOrder: 7, sequenceOrder: 20, operationalDate: true },
  { item: 21, name: "Seller or Private Financing Deadline", key: "seller-private-financing", category: "financing", phaseOrder: 7, sequenceOrder: 21, operationalDate: true },
  { item: 22, name: "Appraisal Deadline", key: "appraisal", category: "appraisal", phaseOrder: 8, sequenceOrder: 22, operationalDate: true },
  { item: 23, name: "Appraisal Objection Deadline", key: "appraisal-objection", category: "appraisal", phaseOrder: 8, sequenceOrder: 23, operationalDate: true },
  { item: 24, name: "Appraisal Resolution Deadline", key: "appraisal-resolution", category: "appraisal", phaseOrder: 8, sequenceOrder: 24, operationalDate: true },
  { item: 25, name: "New ILC or New Survey Deadline", key: "new-ilc-survey", category: "survey", phaseOrder: 5, sequenceOrder: 25, operationalDate: true },
  { item: 26, name: "New ILC or New Survey Objection Deadline", key: "new-ilc-survey-objection", category: "survey", phaseOrder: 5, sequenceOrder: 26, operationalDate: true },
  { item: 27, name: "New ILC or New Survey Resolution Deadline", key: "new-ilc-survey-resolution", category: "survey", phaseOrder: 5, sequenceOrder: 27, operationalDate: true },
  { item: 28, name: "Water Rights Examination Deadline", key: "water-rights-examination", category: "due_diligence", phaseOrder: 6, sequenceOrder: 28, operationalDate: true },
  { item: 29, name: "Mineral Rights Examination Deadline", key: "mineral-rights-examination", category: "due_diligence", phaseOrder: 6, sequenceOrder: 29, operationalDate: true },
  { item: 30, name: "Inspection Termination Deadline", key: "inspection-termination", category: "due_diligence", phaseOrder: 6, sequenceOrder: 30, operationalDate: true },
  { item: 31, name: "Inspection Objection Deadline", key: "inspection-objection", category: "due_diligence", phaseOrder: 6, sequenceOrder: 31, operationalDate: true },
  { item: 32, name: "Inspection Resolution Deadline", key: "inspection-resolution", category: "due_diligence", phaseOrder: 6, sequenceOrder: 32, operationalDate: true },
  { item: 33, name: "Property Insurance Termination Deadline", key: "property-insurance-termination", category: "due_diligence", phaseOrder: 6, sequenceOrder: 33, operationalDate: true },
  { item: 34, name: "Due Diligence Documents Delivery Deadline", key: "due-diligence-documents-delivery", category: "due_diligence", phaseOrder: 6, sequenceOrder: 34, operationalDate: true },
  { item: 35, name: "Due Diligence Documents Objection Deadline", key: "due-diligence-documents-objection", category: "due_diligence", phaseOrder: 6, sequenceOrder: 35, operationalDate: true },
  { item: 36, name: "Due Diligence Documents Resolution Deadline", key: "due-diligence-documents-resolution", category: "due_diligence", phaseOrder: 6, sequenceOrder: 36, operationalDate: true },
  { item: 37, name: "Conditional Sale Deadline", key: "conditional-sale", category: "conditional_sale", phaseOrder: 9, sequenceOrder: 37, operationalDate: true },
  { item: 38, name: "Lead-Based Paint Termination Deadline", key: "lead-based-paint-termination", category: "lead_paint", phaseOrder: 6, sequenceOrder: 38, operationalDate: true },
  { item: 39, name: "Closing Date", key: "closing", category: "closing", phaseOrder: 10, sequenceOrder: 39, operationalDate: true },
  { item: 40, name: "Possession Date", key: "possession-date", category: "possession", phaseOrder: 11, sequenceOrder: 40, operationalDate: true },
  { item: 41, name: "Possession Time", key: "possession-time", category: "possession", phaseOrder: 11, sequenceOrder: 41, operationalDate: false },
  { item: 42, name: "Acceptance Deadline Date", key: "acceptance-date", category: "acceptance", phaseOrder: 0, sequenceOrder: 42, operationalDate: false },
  { item: 43, name: "Acceptance Deadline Time", key: "acceptance-time", category: "acceptance", phaseOrder: 0, sequenceOrder: 43, operationalDate: false }
] as const;

const normalizedIndex = new Map(
  coloradoResidentialContractDeadlines.map((definition) => [normalizeDeadlineName(definition.name), definition])
);

export function matchColoradoResidentialDeadline(name: string): ColoradoContractDeadlineDefinition | null {
  const normalized = normalizeDeadlineName(name);
  const exact = normalizedIndex.get(normalized);
  if (exact) return exact;

  // Common punctuation/wording variants from PDFs and contract platforms.
  if (normalized.includes("record title deadline") && !normalized.includes("objection")) return byKey("record-title");
  if (normalized.includes("association documents termination")) return byKey("association-documents-termination");
  if (normalized.includes("association documents") && normalized.includes("deadline")) return byKey("association-documents");
  if (normalized.includes("seller property disclosure")) return byKey("seller-property-disclosure");
  if (normalized.includes("lead based paint disclosure")) return byKey("lead-based-paint-disclosure");
  if (normalized.includes("new ilc") && normalized.includes("objection")) return byKey("new-ilc-survey-objection");
  if (normalized.includes("new ilc") && normalized.includes("resolution")) return byKey("new-ilc-survey-resolution");
  if (normalized.includes("new ilc") || normalized.includes("new survey")) return byKey("new-ilc-survey");
  return null;
}

export function getColoradoResidentialOperationalDeadlineNames(): string[] {
  return coloradoResidentialContractDeadlines
    .filter((definition) => definition.operationalDate)
    .map((definition) => definition.name);
}

export function canonicalizeContractDeadline(name: string): {
  name: string;
  key: string;
  category: ColoradoContractDeadlineCategory;
  phaseOrder: number;
  sequenceOrder: number;
  operationalDate: boolean;
} {
  const definition = matchColoradoResidentialDeadline(name);
  if (definition) return definition;
  return {
    name: name.trim(),
    key: normalizeDeadlineName(name).replace(/\s+/g, "-") || "deadline",
    category: "contract_deadline",
    phaseOrder: 50,
    sequenceOrder: 999,
    operationalDate: true
  };
}

function byKey(key: string): ColoradoContractDeadlineDefinition | null {
  return coloradoResidentialContractDeadlines.find((definition) => definition.key === key) ?? null;
}

function normalizeDeadlineName(value: string): string {
  return value
    .toLocaleLowerCase("en-US")
    .replace(/[’']/g, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}
