import { getProductById } from "./productRegistry";

export type WorkspaceNavigationItem = {
  label: string;
  href?: string;
  enabled: boolean;
};

const reynaldsBrothers = getProductById("reynalds-brothers-os");

if (!reynaldsBrothers) {
  throw new Error("Reynalds Brothers OS is missing from the product registry.");
}

export const workspaceNavigation: WorkspaceNavigationItem[] = [
  { label: "Dashboard", href: "/", enabled: true },
  { label: reynaldsBrothers.owner, href: "/reynalds-brothers", enabled: true },
  { label: "CRM", href: "/crm", enabled: true },
  { label: "Transactions", href: "/transactions", enabled: true },
  { label: "Contracts", enabled: false },
  { label: "Showings", enabled: false },
  { label: "Operations", href: "/operations", enabled: true },
  { label: "Finance", href: "/finance", enabled: true },
  { label: "Customer Success", enabled: false },
  { label: "Knowledge", enabled: false },
  { label: "Reports", enabled: false },
  { label: "Administration", enabled: false },
  { label: "Object Explorer", href: "/objects", enabled: true },
  { label: "Timeline", enabled: false },
  { label: "Workflows", enabled: false },
  { label: "Automations", enabled: false },
  { label: "Intelligence", enabled: false }
];
