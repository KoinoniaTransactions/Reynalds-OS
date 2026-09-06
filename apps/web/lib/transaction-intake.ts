export type TransactionSide = "buyer" | "seller";
export type TransactionStage = "pre_contract" | "under_contract";

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
