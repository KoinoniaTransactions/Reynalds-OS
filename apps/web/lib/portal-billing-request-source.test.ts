import { describe, expect, it } from "vitest";
import {
  getBillingSetupRequestPermission,
  getBillingSetupRequestSource
} from "./portal-billing-request-source";

describe("portal billing request source", () => {
  it("honors explicit client portal context for a dual-access owner", () => {
    const source = getBillingSetupRequestSource(
      "client-portal",
      "Owner"
    );

    expect(source).toBe("client-portal");
    expect(getBillingSetupRequestPermission(source)).toBe(
      "client-portal:billing:setup"
    );
  });

  it("keeps explicit employee portal context as staff work", () => {
    const source = getBillingSetupRequestSource(
      "employee-portal",
      "Owner"
    );

    expect(source).toBe("employee-portal");
    expect(getBillingSetupRequestPermission(source)).toBe(
      "billing-workspace:payment-methods:request"
    );
  });

  it("preserves legacy role fallback when no portal context is supplied", () => {
    expect(getBillingSetupRequestSource(null, "Client")).toBe(
      "client-portal"
    );

    expect(getBillingSetupRequestSource(null, "Owner")).toBe(
      "employee-portal"
    );
  });
});
