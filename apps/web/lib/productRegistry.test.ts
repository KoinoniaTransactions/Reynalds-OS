import { describe, expect, it } from "vitest";

import {
  getActiveProducts,
  getInternalProducts,
  getProductById,
  getPublicWebsites,
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

  it("derives product workspace navigation from registry entries", () => {
    const workspaceEntries = getWorkspaceProducts().map(
      (product) => product.workspaceEntry
    );

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
