import type { TransactionSide, TransactionStage } from "./transaction-intake";

export type TransactionDocumentRequirementLevel = "required" | "conditional" | "optional";

export type TransactionDocumentRequirement = {
  id: string;
  label: string;
  level: TransactionDocumentRequirementLevel;
  aliases: string[];
  guidance: string;
};

export type TransactionDocumentChecklistStatus =
  | "received"
  | "missing"
  | "conditional"
  | "optional";

export type TransactionDocumentChecklistItem = TransactionDocumentRequirement & {
  status: TransactionDocumentChecklistStatus;
  documentId?: string;
  fileName?: string;
};

type RequirementSet = {
  side: TransactionSide;
  stage: TransactionStage;
  requirements: TransactionDocumentRequirement[];
};

const requirementSets: RequirementSet[] = [
  {
    side: "buyer",
    stage: "pre_contract",
    requirements: [
      requirement(
        "buyer-agency-agreement",
        "Buyer Agency / Representation Agreement",
        "required",
        ["buyer agency agreement", "buyer representation agreement", "buyer agency / representation agreement"],
        "Establishes the buyer representation relationship."
      ),
      requirement(
        "lender-preapproval",
        "Lender Pre-Approval / Prequalification",
        "conditional",
        ["pre-approval letter", "preapproval letter", "prequalification letter", "lender pre-approval"],
        "Useful when financing is part of the buyer workflow."
      ),
      requirement(
        "buyer-consultation-notes",
        "Buyer Consultation Notes",
        "optional",
        ["buyer consultation notes", "buyer intake notes"],
        "Optional supporting information for the buyer relationship."
      )
    ]
  },
  {
    side: "buyer",
    stage: "under_contract",
    requirements: [
      requirement(
        "purchase-contract",
        "Executed Contract to Buy and Sell",
        "required",
        ["executed contract to buy and sell", "contract to buy and sell", "purchase contract", "sales contract"],
        "Primary executed purchase contract for the transaction."
      ),
      requirement(
        "buyer-agency-agreement",
        "Buyer Agency / Representation Agreement",
        "required",
        ["buyer agency agreement", "buyer representation agreement", "buyer agency / representation agreement"],
        "Buyer representation agreement for the client relationship."
      ),
      requirement(
        "counterproposal",
        "Counterproposal",
        "conditional",
        ["counterproposal", "counter proposal"],
        "Needed when a counterproposal is part of the executed agreement."
      ),
      requirement(
        "amend-extend",
        "Amend / Extend",
        "conditional",
        ["amend extend", "amend / extend", "amendment", "extension"],
        "Needed when contract terms or deadlines are changed."
      ),
      requirement(
        "lender-preapproval",
        "Lender Pre-Approval / Prequalification",
        "conditional",
        ["pre-approval letter", "preapproval letter", "prequalification letter", "lender pre-approval"],
        "Useful for financed buyer transactions."
      )
    ]
  },
  {
    side: "seller",
    stage: "pre_contract",
    requirements: [
      requirement(
        "listing-agreement",
        "Listing Agreement",
        "required",
        ["listing agreement", "exclusive right-to-sell listing contract", "exclusive right to sell listing contract", "executed listing agreement"],
        "Primary listing-side agreement for a seller file."
      ),
      requirement(
        "seller-property-disclosure",
        "Seller Property Disclosure",
        "conditional",
        ["seller property disclosure", "seller's property disclosure", "sellers property disclosure"],
        "Track when applicable to the property and transaction."
      ),
      requirement(
        "lead-based-paint-disclosure",
        "Lead-Based Paint Disclosure",
        "conditional",
        ["lead-based paint disclosure", "lead based paint disclosure", "lead-based paint"],
        "Track when applicable to the property."
      ),
      requirement(
        "mls-property-sheet",
        "MLS / Property Information",
        "optional",
        ["mls sheet", "mls listing", "property information sheet"],
        "Optional supporting listing/property information."
      ),
      requirement(
        "hoa-property-documents",
        "HOA / Property Documents",
        "conditional",
        ["hoa documents", "hoa docs", "association documents", "property documents"],
        "Track when applicable to the property."
      )
    ]
  },
  {
    side: "seller",
    stage: "under_contract",
    requirements: [
      requirement(
        "purchase-contract",
        "Executed Contract to Buy and Sell",
        "required",
        ["executed contract to buy and sell", "contract to buy and sell", "purchase contract", "sales contract"],
        "Primary executed purchase contract for the sale transaction."
      ),
      requirement(
        "listing-agreement",
        "Listing Agreement",
        "required",
        ["listing agreement", "exclusive right-to-sell listing contract", "exclusive right to sell listing contract", "executed listing agreement"],
        "Preserves the listing-side relationship and listing terms."
      ),
      requirement(
        "counterproposal",
        "Counterproposal",
        "conditional",
        ["counterproposal", "counter proposal"],
        "Needed when a counterproposal is part of the executed agreement."
      ),
      requirement(
        "amend-extend",
        "Amend / Extend",
        "conditional",
        ["amend extend", "amend / extend", "amendment", "extension"],
        "Needed when contract terms or deadlines are changed."
      ),
      requirement(
        "seller-property-disclosure",
        "Seller Property Disclosure",
        "conditional",
        ["seller property disclosure", "seller's property disclosure", "sellers property disclosure"],
        "Track when applicable to the property and transaction."
      ),
      requirement(
        "lead-based-paint-disclosure",
        "Lead-Based Paint Disclosure",
        "conditional",
        ["lead-based paint disclosure", "lead based paint disclosure", "lead-based paint"],
        "Track when applicable to the property."
      ),
      requirement(
        "hoa-property-documents",
        "HOA / Property Documents",
        "conditional",
        ["hoa documents", "hoa docs", "association documents", "property documents"],
        "Track when applicable to the property."
      )
    ]
  }
];

export function getTransactionDocumentRequirements(
  side: TransactionSide,
  stage: TransactionStage
): TransactionDocumentRequirement[] {
  return (
    requirementSets.find((set) => set.side === side && set.stage === stage)?.requirements ?? []
  );
}

export function getTransactionDocumentRequirement(
  side: TransactionSide,
  stage: TransactionStage,
  requirementId: string | undefined
): TransactionDocumentRequirement | undefined {
  if (!requirementId) return undefined;
  return getTransactionDocumentRequirements(side, stage).find(
    (requirement) => requirement.id === requirementId
  );
}

export function buildTransactionDocumentChecklist(
  side: TransactionSide,
  stage: TransactionStage,
  documents: Array<{ id: string; documentType: string; fileName: string }>
): TransactionDocumentChecklistItem[] {
  const availableDocuments = [...documents];

  return getTransactionDocumentRequirements(side, stage).map((requirement) => {
    const matchIndex = availableDocuments.findIndex((document) =>
      documentTypeMatchesRequirement(document.documentType, requirement)
    );
    const matched = matchIndex >= 0 ? availableDocuments.splice(matchIndex, 1)[0] : undefined;

    return {
      ...requirement,
      status: matched
        ? "received"
        : requirement.level === "required"
          ? "missing"
          : requirement.level,
      documentId: matched?.id,
      fileName: matched?.fileName
    };
  });
}

export function documentTypeMatchesRequirement(
  documentType: string,
  requirement: TransactionDocumentRequirement
): boolean {
  const normalized = normalizeDocumentType(documentType);
  return [requirement.label, ...requirement.aliases]
    .map(normalizeDocumentType)
    .some((candidate) => candidate === normalized || normalized.includes(candidate) || candidate.includes(normalized));
}

function requirement(
  id: string,
  label: string,
  level: TransactionDocumentRequirementLevel,
  aliases: string[],
  guidance: string
): TransactionDocumentRequirement {
  return { id, label, level, aliases, guidance };
}

function normalizeDocumentType(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
