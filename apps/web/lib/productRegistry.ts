export type ProductAudience = "internal" | "public";

export type ProductStatus =
  | "active"
  | "active-development"
  | "planned";

export type ProductType =
  | "central-operating-system"
  | "company-operating-system"
  | "public-website";

export type ProductRecordAuthority =
  | "reynalds-os"
  | "reynalds-os-with-verified-integration";

export type ProductWorkspaceEntry = {
  label: string;
  href: string;
  enabled: boolean;
};

export type ProductDefinition = {
  id:
    | "reynalds-os"
    | "koinonia-transactions-website"
    | "koinonia-properties-website"
    | "reynalds-brothers-os";
  name: string;
  owner: string;
  type: ProductType;
  audience: ProductAudience;
  purpose: string;
  status: ProductStatus;
  hasPublicWebsite: boolean;
  recordAuthority: ProductRecordAuthority;
  workspaceEntry?: ProductWorkspaceEntry;
};

export const productRegistry = [
  {
    id: "reynalds-os",
    name: "Reynalds OS",
    owner: "Jeremiah Reynalds",
    type: "central-operating-system",
    audience: "internal",
    purpose:
      "Preserve knowledge, decisions, workflows, company records, and operational history across projects and companies.",
    status: "active",
    hasPublicWebsite: false,
    recordAuthority: "reynalds-os"
  },
  {
    id: "koinonia-transactions-website",
    name: "Koinonia Transactions Website",
    owner: "Koinonia Transactions",
    type: "public-website",
    audience: "public",
    purpose:
      "Present the company, its services, brand, and approved public-facing business information.",
    status: "active-development",
    hasPublicWebsite: true,
    recordAuthority: "reynalds-os"
  },
  {
    id: "koinonia-properties-website",
    name: "Koinonia Properties Website",
    owner: "Koinonia Properties",
    type: "public-website",
    audience: "public",
    purpose:
      "Present Koinonia Properties, its services, brand, and approved public-facing business information.",
    status: "planned",
    hasPublicWebsite: true,
    recordAuthority: "reynalds-os"
  },
  {
    id: "reynalds-brothers-os",
    name: "Reynalds Brothers OS",
    owner: "Reynalds Brothers",
    type: "company-operating-system",
    audience: "internal",
    purpose:
      "Support internal company operations, field activity, Walmart Tanks work, and related workflows.",
    status: "active-development",
    hasPublicWebsite: false,
    recordAuthority: "reynalds-os-with-verified-integration",
    workspaceEntry: {
      label: "Reynalds Brothers",
      href: "/reynalds-brothers",
      enabled: true
    }
  }
] as const satisfies readonly ProductDefinition[];

export type ProductId = (typeof productRegistry)[number]["id"];

export function getProductById(productId: ProductId) {
  return productRegistry.find((product) => product.id === productId);
}
