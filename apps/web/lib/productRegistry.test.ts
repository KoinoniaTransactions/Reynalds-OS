import { describe, expect, it } from "vitest";

import {
  getActiveProducts,
  getInternalProducts,
  getProductById,
  getPublicWebsites,
  getWorkspaceNavigationEntries,
  getWorkspaceProducts,
  productRegistry
} from "./productRegistry";
import { workspaceNavigation } from "./workspaceNavigation";

describe("product registry", () => {
  it("uses unique canonical product identifiers", () => {
    const productIds = productRegistry.map((product) => product.id);

    expect(new Set(productIds).size).toBe(productIds.length);
  });

  it("resolves every registered product by its canonical identifier", () => {
    for (const product of productRegistry) {
      expect(getProductById(product.id)).toBe(product);
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
