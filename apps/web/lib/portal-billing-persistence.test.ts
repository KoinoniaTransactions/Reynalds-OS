import { describe, expect, it } from "vitest";
import {
  getBillingOwnerId,
  getCanonicalBillingModelForService,
  getRequestedBillingClientObjectId,
  mergeBillingProfileData
} from "./portal-billing-persistence";

describe("portal billing persistence helpers", () => {
  it("derives the canonical billing model from the service template", () => {
    expect(
      getCanonicalBillingModelForService("Transaction Coordination Plus")
    ).toBe("prepaid");

    expect(
      getCanonicalBillingModelForService("Pay-at-Closing Coordination")
    ).toBe("pay_at_close");

    expect(
      getCanonicalBillingModelForService("Licensed Showing Coverage")
    ).toBe("per_request");
  });

  it("falls back to custom for an unknown service", () => {
    expect(
      getCanonicalBillingModelForService("Special Written Scope")
    ).toBe("custom");
  });

  it("requires an explicit client object for a staff-created request", () => {
    expect(
      getRequestedBillingClientObjectId(
        {
          clientObjectId: " obj_client_123 "
        },
        "employee-portal"
      )
    ).toBe("obj_client_123");

    expect(() =>
      getRequestedBillingClientObjectId({}, "employee-portal")
    ).toThrow(/clientObjectId is required/i);
  });

  it("does not allow a client request to choose another client object", () => {
    expect(
      getRequestedBillingClientObjectId(
        {
          clientObjectId: "obj_other_client"
        },
        "client-portal"
      )
    ).toBeUndefined();
  });

  it("never substitutes a staff user as the billing owner", () => {
    expect(getBillingOwnerId("usr_client")).toBe("usr_client");
    expect(getBillingOwnerId(undefined)).toBeNull();
  });

  it("preserves existing safe profile metadata and merges billing models", () => {
    expect(
      mergeBillingProfileData(
        {
          authorizedBillingModels: ["prepaid"],
          processorCustomerId: "cus_safe_reference",
          paymentMethodSummary: "Visa ending 4242"
        },
        {
          authorizedBillingModels: ["pay_at_close"],
          clientName: "Bright Homes Team",
          consentStatus: "Authorized"
        }
      )
    ).toEqual({
      authorizedBillingModels: ["prepaid", "pay_at_close"],
      clientName: "Bright Homes Team",
      consentStatus: "Authorized",
      paymentMethodSummary: "Visa ending 4242",
      processorCustomerId: "cus_safe_reference"
    });
  });
});
