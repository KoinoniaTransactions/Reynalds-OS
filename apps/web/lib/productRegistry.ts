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
  order: number;
};

type ProductDefinitionBase<TProductId extends string> = {
  id: TProductId;
  name: string;
  owner: string;
  purpose: string;
  status: ProductStatus;
  recordAuthority: ProductRecordAuthority;
};

export type InternalProductDefinition<TProductId extends string = string> =
  ProductDefinitionBase<TProductId> & {
    type: "central-operating-system" | "company-operating-system";
    audience: "internal";
    hasPublicWebsite: false;
    workspaceEntry?: ProductWorkspaceEntry;
  };

export type PublicWebsiteProductDefinition<
  TProductId extends string = string
> = ProductDefinitionBase<TProductId> & {
  type: "public-website";
  audience: "public";
  hasPublicWebsite: true;
  workspaceEntry?: never;
};

export type ProductDefinition<TProductId extends string = string> =
  | InternalProductDefinition<TProductId>
  | PublicWebsiteProductDefinition<TProductId>;

export type ProductRegistryValidationIssueCode =
  | "duplicate-product-id"
  | "duplicate-workspace-href"
  | "duplicate-workspace-order";

export type ProductRegistryValidationIssue = {
  code: ProductRegistryValidationIssueCode;
  value: string | number;
  productIds: string[];
  message: string;
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
      enabled: true,
      order: 100
    }
  }
] as const satisfies readonly ProductDefinition[];

export type Product = (typeof productRegistry)[number];
export type ProductId = Product["id"];

function recordRegistryValue(
  registryValues: Map<string | number, string[]>,
  value: string | number,
  productId: string
) {
  const existingProductIds = registryValues.get(value) ?? [];
  registryValues.set(value, [...existingProductIds, productId]);
}

function appendDuplicateIssues(
  issues: ProductRegistryValidationIssue[],
  registryValues: Map<string | number, string[]>,
  code: ProductRegistryValidationIssueCode,
  label: string
) {
  for (const [value, productIds] of registryValues) {
    if (productIds.length < 2) {
      continue;
    }

    issues.push({
      code,
      value,
      productIds,
      message: `${label} ${String(value)} is used by multiple products: ${productIds.join(
        ", "
      )}.`
    });
  }
}

export function validateProductRegistry(
  registry: readonly ProductDefinition[] = productRegistry
) {
  const issues: ProductRegistryValidationIssue[] = [];
  const productIds = new Map<string | number, string[]>();
  const workspaceHrefs = new Map<string | number, string[]>();
  const workspaceOrders = new Map<string | number, string[]>();

  for (const product of registry) {
    recordRegistryValue(productIds, product.id, product.id);

    if (product.workspaceEntry) {
      recordRegistryValue(
        workspaceHrefs,
        product.workspaceEntry.href,
        product.id
      );
      recordRegistryValue(
        workspaceOrders,
        product.workspaceEntry.order,
        product.id
      );
    }
  }

  appendDuplicateIssues(
    issues,
    productIds,
    "duplicate-product-id",
    "Product identifier"
  );
  appendDuplicateIssues(
    issues,
    workspaceHrefs,
    "duplicate-workspace-href",
    "Workspace route"
  );
  appendDuplicateIssues(
    issues,
    workspaceOrders,
    "duplicate-workspace-order",
    "Workspace order"
  );

  return issues;
}

export function getProductById(productId: ProductId) {
  return productRegistry.find((product) => product.id === productId);
}

export function getInternalProducts() {
  return productRegistry.filter((product) => product.audience === "internal");
}

export function getPublicWebsites() {
  return productRegistry.filter((product) => product.type === "public-website");
}

export function getWorkspaceProducts() {
  return productRegistry.filter(
    (product): product is Product & { workspaceEntry: ProductWorkspaceEntry } =>
      "workspaceEntry" in product
  );
}

export function getWorkspaceNavigationEntries() {
  return getWorkspaceProducts()
    .map((product) => product.workspaceEntry)
    .sort((left, right) => left.order - right.order)
    .map(({ label, href, enabled }) => ({ label, href, enabled }));
}

export function getActiveProducts() {
  return productRegistry.filter((product) => product.status !== "planned");
}
