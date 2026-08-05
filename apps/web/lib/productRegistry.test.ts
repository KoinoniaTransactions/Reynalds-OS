import { describe, expect, it } from "vitest";

import {
  assertValidProductRegistry,
  getActiveProducts,
  getInternalProducts,
  getProductById,
  getPublicWebsites,
  getWorkspaceNavigationEntries,
  getWorkspaceProducts,
  ProductNotFoundError,
  ProductRegistryValidationError,
  productRegistry,
  validateProductRegistry
} from "./productRegistry";
import { workspaceNavigation } from "./workspaceNavigation";

describe("product registry", () => {
  it("passes canonical registry validation", () => {
    expect(validateProductRegistry()).toEqual([]);
    expect(assertValidProductRegistry()).toBe(productRegistry);
  });

  it("reports duplicate identifiers, workspace routes, and workspace order", () => {
    const invalidRegistry = [
      {
        id: "duplicate-product",
        name: "First Internal Product",
        owner: "Example Owner",
        type: "company-operating-system",
        audience: "internal",
        purpose: "Exercise registry validation.",
        status: "active",
        hasPublicWebsite: false,
        recordAuthority: "reynalds-os",
        workspaceEntry: {
          label: "First",
          href: "/duplicate",
          enabled: true,
          order: 100
        }
      },
      {
        id: "duplicate-product",
        name: "Second Internal Product",
        owner: "Example Owner",
        type: "company-operating-system",
        audience: "internal",
        purpose: "Exercise registry validation.",
        status: "active",
        hasPublicWebsite: false,
        recordAuthority: "reynalds-os",
        workspaceEntry: {
          label: "Second",
          href: "/duplicate",
          enabled: true,
          order: 100
        }
      }
    ] as const;

    const issues = validateProductRegistry(invalidRegistry);

    expect(issues.map((issue) => issue.code)).toEqual([
      "duplicate-product-id",
      "duplicate-workspace-href",
      "duplicate-workspace-order"
    ]);

    expect(() => assertValidProductRegistry(invalidRegistry)).toThrow(
      ProductRegistryValidationError
    );

    try {
      assertValidProductRegistry(invalidRegistry);
    } catch (error) {
      expect(error).toBeInstanceOf(ProductRegistryValidationError);
      expect((error as ProductRegistryValidationError).issues).toEqual(issues);
      expect((error as Error).message).toContain("duplicate-product");
      expect((error as Error).message).toContain("/duplicate");
      expect((error as Error).message).toContain("100");
    }
  });

  it("uses unique canonical product identifiers", () => {
    const productIds = productRegistry.map((product) => product.id);

    expect(new Set(productIds).size).toBe(productIds.length);
  });

  it("resolves every registered product by its canonical identifier", () => {
    for (const product of productRegistry) {
      expect(getProductById(product.id)).toBe(product);
    }
  });

  it("throws a structured error when a canonical lookup cannot resolve", () => {
    expect(() =>
      getProductById("missing-product" as Parameters<typeof getProductById>[0])
    ).toThrow(ProductNotFoundError);

    try {
      getProductById("missing-product" as Parameters<typeof getProductById>[0]);
    } catch (error) {
      expect(error).toBeInstanceOf(ProductNotFoundError);
      expect((error as ProductNotFoundError).productId).toBe("missing-product");
      expect((error as Error).message).toContain("missing-product");
    }
  });

  it("enforces public and internal product boundary metadata", () => {
    for (const product of productRegistry) {
      if (product.type === "public-website") {
        expect(product.audience).toBe("public");
        expect(product.hasPublicWebsite).toBe(true);
        expect("workspaceEntry" in product).toBe(false);
      } else {
        expect(product.audience).toBe("internal");
        expect(product.hasPublicWebsite).toBe(false);
      }
    }
  });

  it("keeps registry query helpers complete and aligned with product metadata", () => {
    expect(getInternalProducts()).toEqual(
      productRegistry.filter((product) => product.audience === "internal")
    );
    expect(getPublicWebsites()).toEqual(
      productRegistry.filter((product) => product.type === "public-website")
    );
    expect(getActiveProducts()).toEqual(
      productRegistry.filter((product) => product.status !== "planned")
    );
  });

  it("returns complete workspace navigation entries in explicit registry order", () => {
    const workspaceProducts = getWorkspaceProducts();
    const expectedWorkspaceProducts = productRegistry.flatMap((product) =>
      "workspaceEntry" in product ? [product] : []
    );
    const expectedEntries = [...expectedWorkspaceProducts]
      .sort(
        (left, right) =>
          left.workspaceEntry.order - right.workspaceEntry.order
      )
      .map(({ workspaceEntry: { label, href, enabled } }) => ({
        label,
        href,
        enabled
      }));
    const entries = getWorkspaceNavigationEntries();

    expect(workspaceProducts).toEqual(expectedWorkspaceProducts);
    expect(entries).toEqual(expectedEntries);
    expect(entries.every((entry) => !("order" in entry))).toBe(true);
  });

  it("orders workspace navigation by metadata instead of registry position", () => {
    const registry = [
      {
        id: "workspace-last",
        name: "Workspace Last",
        owner: "Example Owner",
        type: "company-operating-system",
        audience: "internal",
        purpose: "Verify explicit workspace ordering.",
        status: "active",
        hasPublicWebsite: false,
        recordAuthority: "reynalds-os",
        workspaceEntry: {
          label: "Last",
          href: "/last",
          enabled: true,
          order: 300
        }
      },
      {
        id: "public-middle",
        name: "Public Middle",
        owner: "Example Owner",
        type: "public-website",
        audience: "public",
        purpose: "Verify public products are excluded.",
        status: "active",
        hasPublicWebsite: true,
        recordAuthority: "reynalds-os"
      },
      {
        id: "workspace-first",
        name: "Workspace First",
        owner: "Example Owner",
        type: "central-operating-system",
        audience: "internal",
        purpose: "Verify explicit workspace ordering.",
        status: "active",
        hasPublicWebsite: false,
        recordAuthority: "reynalds-os",
        workspaceEntry: {
          label: "First",
          href: "/first",
          enabled: false,
          order: 100
        }
      },
      {
        id: "workspace-second",
        name: "Workspace Second",
        owner: "Example Owner",
        type: "company-operating-system",
        audience: "internal",
        purpose: "Verify explicit workspace ordering.",
        status: "active-development",
        hasPublicWebsite: false,
        recordAuthority: "reynalds-os",
        workspaceEntry: {
          label: "Second",
          href: "/second",
          enabled: true,
          order: 200
        }
      }
    ] as const;

    expect(getWorkspaceProducts(registry).map((product) => product.id)).toEqual([
      "workspace-last",
      "workspace-first",
      "workspace-second"
    ]);
    expect(getWorkspaceNavigationEntries(registry)).toEqual([
      { label: "First", href: "/first", enabled: false },
      { label: "Second", href: "/second", enabled: true },
      { label: "Last", href: "/last", enabled: true }
    ]);
  });

  it("derives product workspace navigation from ordered registry entries", () => {
    const workspaceEntries = getWorkspaceNavigationEntries();
    const personalWorkspaceEntry = {
      label: "Personal",
      href: "/personal",
      enabled: true
    };

    expect(workspaceNavigation[1]).toEqual(personalWorkspaceEntry);
    expect(
      workspaceEntries.some(
        (entry) => entry.href === personalWorkspaceEntry.href
      )
    ).toBe(false);
    expect(
      workspaceNavigation.filter(
        (item) => item.href === personalWorkspaceEntry.href
      )
    ).toHaveLength(1);
    expect(workspaceNavigation.slice(2, workspaceEntries.length + 2)).toEqual(
      workspaceEntries
    );

    for (const entry of workspaceEntries) {
      expect(
        workspaceNavigation.filter((item) => item.href === entry.href)
      ).toHaveLength(1);
    }
  });
});
