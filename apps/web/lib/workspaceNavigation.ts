export type WorkspaceNavigationItem = {
  label: string;
  href?: string;
};

export const workspaceNavigation: WorkspaceNavigationItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Reynalds Brothers", href: "/reynalds-brothers" },
  { label: "CRM", href: "/crm" },
  { label: "Transactions", href: "/transactions" },
  { label: "Contracts" },
  { label: "Showings" },
  { label: "Operations", href: "/operations" },
  { label: "Finance", href: "/finance" },
  { label: "Customer Success" },
  { label: "Knowledge" },
  { label: "Reports" },
  { label: "Administration" },
  { label: "Object Explorer", href: "/objects" },
  { label: "Timeline" },
  { label: "Workflows" },
  { label: "Automations" },
  { label: "Intelligence" }
];
