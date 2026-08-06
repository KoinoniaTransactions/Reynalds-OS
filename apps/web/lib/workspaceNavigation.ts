import { getWorkspaceNavigationEntries } from "./productRegistry";

export type WorkspaceNavigationItem = {
  label: string;
  href?: string;
  enabled: boolean;
};

export const workspaceNavigation: WorkspaceNavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", enabled: true },
  { label: "Personal", href: "/personal", enabled: true },
  ...getWorkspaceNavigationEntries(),
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
