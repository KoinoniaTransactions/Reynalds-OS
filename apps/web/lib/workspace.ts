export type WorkspaceStatus = "active" | "inactive" | "planned";

export type WorkspaceCategory =
  | "operating_system"
  | "business"
  | "personal"
  | "ministry"
  | "future_company";

export type WorkspaceSummary = {
  id: string;
  name: string;
  category: WorkspaceCategory;
  status: WorkspaceStatus;
  route: string;
  description: string;
  primaryObjectTypes: string[];
};

export const workspaces: WorkspaceSummary[] = [
  {
    id: "reynalds-os",
    name: "Reynalds OS",
    category: "operating_system",
    status: "active",
    route: "/",
    description: "The core operating system and command center.",
    primaryObjectTypes: ["workspace", "task", "workflow", "knowledge_item"]
  },
  {
    id: "koinonia-erp",
    name: "Koinonia ERP",
    category: "business",
    status: "active",
    route: "/koinonia",
    description: "The first production workspace for Koinonia real estate operations.",
    primaryObjectTypes: ["relationship", "transaction", "task", "invoice", "document"]
  },
  {
    id: "reynalds-brothers",
    name: "Reynalds Brothers",
    category: "business",
    status: "active",
    route: "/operations",
    description: "Managed company workspace for field operations, Walmart tank work, pressure washing, plumbing, backflow, grease interceptors, and Zurn projects.",
    primaryObjectTypes: ["work_item", "organization", "location", "communication", "document", "media", "financial_transaction"]
  }
];

export const activeWorkspace = workspaces[0];