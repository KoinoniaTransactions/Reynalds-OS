export type RosObjectType =
  | "relationship"
  | "listing_engagement"
  | "transaction"
  | "task"
  | "invoice"
  | "document"
  | "workflow"
  | "timeline_event"
  | "company"
  | "knowledge_item"
  | "workspace";

export type RosObjectHealth = "healthy" | "watch" | "attention" | "critical";

export type RosObjectStatus =
  | "active"
  | "pending"
  | "in_progress"
  | "completed"
  | "archived";

export type RosObjectSummary = {
  id: string;
  type: RosObjectType;
  name: string;
  status: RosObjectStatus;
  health: RosObjectHealth;
  owner?: string;
  nextAction?: string;
};

export const objectEnginePrinciples = {
  name: "Reynalds OS Object Engine",
  rule: "Everything important should be represented as an object whenever practical.",
  purpose:
    "Provide a shared object model for companies, workflows, relationships, listing engagements, transactions, tasks, documents, finance, knowledge, and future Brain orchestration.",
  currentStatus: "Foundation established"
};

export const coreObjectTypes: RosObjectType[] = [
  "relationship",
  "listing_engagement",
  "transaction",
  "task",
  "invoice",
  "document",
  "workflow",
  "timeline_event",
  "company",
  "knowledge_item",
  "workspace"
];
