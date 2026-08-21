export type TransactionSide = "buyer" | "seller";
export type TransactionStage = "pre_contract" | "under_contract";

export type TransactionIntakeDefinition = {
  side: TransactionSide;
  stage: TransactionStage;
  title: string;
  description: string;
  preferredDocument: string;
  alternateDocuments: string[];
  extractedFields: string[];
  followUpFields: string[];
};

export const transactionIntakeDefinitions: TransactionIntakeDefinition[] = [
  {
    side: "buyer",
    stage: "pre_contract",
    title: "Buyer — Not Under Contract Yet",
    description:
      "Start with the buyer relationship. A property address is not required until the buyer goes under contract.",
    preferredDocument: "Buyer agency / representation agreement",
    alternateDocuments: ["Buyer consultation notes", "Pre-approval letter"],
    extractedFields: [
      "Buyer legal names",
      "Representation dates",
      "Realtor and brokerage",
      "Client contact details when present"
    ],
    followUpFields: ["Missing client email or phone", "Preferred communication details"]
  },
  {
    side: "buyer",
    stage: "under_contract",
    title: "Buyer — Under Contract",
    description:
      "Build the purchase transaction from the executed contract and connect it to an existing client record whenever possible.",
    preferredDocument: "Executed Contract to Buy and Sell",
    alternateDocuments: ["Counterproposal", "Buyer agency agreement", "Lender contact sheet"],
    extractedFields: [
      "Property address",
      "Buyer and seller names",
      "Purchase price",
      "Financing",
      "Earnest money",
      "Contract deadlines",
      "Closing and possession"
    ],
    followUpFields: ["Missing lender/contact information", "Any data the document parser cannot confirm"]
  },
  {
    side: "seller",
    stage: "pre_contract",
    title: "Seller — Listing / Not Under Contract Yet",
    description:
      "Start with the listing relationship and property. Seller-side disclosure requests can appear progressively after setup.",
    preferredDocument: "Executed listing agreement",
    alternateDocuments: ["MLS sheet", "Seller disclosures already completed"],
    extractedFields: [
      "Seller legal names",
      "Property address",
      "List price",
      "Listing dates",
      "Realtor and brokerage",
      "Client contact details when present"
    ],
    followUpFields: ["Missing seller contact information", "Required disclosures not found in uploaded documents"]
  },
  {
    side: "seller",
    stage: "under_contract",
    title: "Seller — Under Contract",
    description:
      "Build the sale transaction from the executed contract while preserving the listing relationship and seller-specific workflow.",
    preferredDocument: "Executed Contract to Buy and Sell",
    alternateDocuments: ["Listing agreement", "Counterproposal", "Seller disclosures"],
    extractedFields: [
      "Property address",
      "Buyer and seller names",
      "Purchase price",
      "Earnest money",
      "Contract deadlines",
      "Closing and possession"
    ],
    followUpFields: ["Missing title/HOA information", "Any seller-side information the document parser cannot confirm"]
  }
];

export function getTransactionIntakeDefinition(
  side: TransactionSide,
  stage: TransactionStage
): TransactionIntakeDefinition {
  const definition = transactionIntakeDefinitions.find(
    (candidate) => candidate.side === side && candidate.stage === stage
  );

  if (!definition) {
    throw new Error(`Unsupported transaction intake path: ${side}/${stage}`);
  }

  return definition;
}

export const reusableClientRule = {
  objectType: "Relationship",
  relationshipTypes: {
    buyer: "transaction_party:buyer",
    seller: "transaction_party:seller",
    relatedTransaction: "related_transaction"
  },
  guidance:
    "A client or household can participate in multiple independent transactions. Buyer and seller are roles on a transaction, not permanent client types."
} as const;
