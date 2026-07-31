import { describe, expect, it } from "vitest";

import {
  getActiveProducts,
  getInternalProducts,
  getProductById,
  getPublicWebsites,
  getWorkspaceNavigationEntries,
  getWorkspaceProducts,
  productRegistry,
  validateProductRegistry
} from "./productRegistry";
import { workspaceNavigation } from "./workspaceNavigation";

describe("product registry", () => {
  it("passes canonical registry validation", () => {
    expect(validateProductRegistry()).toEqual([]);
  });

  it("reports duplicate identifiers, workspace routes, and workspace order", () => {
    const issues = validateProductRegistry([
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
    ]);

    expect(issues.map((issue) => issue.code)).toEqual([
      "duplicate-product-id",
      "duplicate-workspace-href",
      "duplicate-workspace-order"
    ]);
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

  it("keeps registry query helpers aligned with product metadata", () => {
    expect(
      getInternalProducts().every((product) => product.audience === "internal")
    ).toBe(true);
    expect(
      getPublicWebsites().every(
        (product) =>
          product.type === "public-website" &&
          product.audience === "public" &&
          product.hasPublicWebsite
      )
    ).toBe(true);
    expect(
      getActiveProducts().every((product) => product.status !== "planned")
    ).toBe(true);
  });

  it("returns workspace navigation entries in explicit registry order", () => {
    const entries = getWorkspaceNavigationEntries();
    const orders = getWorkspaceProducts()
      .map((product) => product.workspaceEntry.order)
      .sort((left, right) => left - right);

    expect(entries).toHaveLength(orders.length);
    expect(entries.every((entry) => !("order" in entry))).toBe(true);
  });

  it("derives product workspace navigation from ordered registry entries", () => {
    const workspaceEntries = getWorkspaceNavigationEntries();

    expect(workspaceNavigation.slice(1, workspaceEntries.length + 1)).toEqual(
      workspaceEntries
    );

    for (const entry of workspaceEntries) {
      expect(
        workspaceNavigation.filter((item) => item.href === entry.href)
      ).toHaveLength(1);
    }
  });
});
