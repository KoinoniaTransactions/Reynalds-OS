import { describe, expect, it } from "vitest";
import {
  AccessRequestValidationError,
  buildAccessRequestName,
  buildAccessRequestNextAction,
  getAccessRequestDetail,
  getAccessRequestHealth,
  getAccessRequestMetaLabels,
  validateAccessRequestInput
} from "./access-requests";

describe("access request helpers", () => {
  it("validates a safe delegated access request", () => {
    const input = validateAccessRequestInput({
      accessPurpose: "Prepare contract documents",
      clientName: "Bright Homes Team",
      permissionLevel: "Transaction coordinator access",
      platformName: "Transaction platform",
      relatedWorkName: "Smith Contract-to-Close",
      status: "Access Needed"
    });

    expect(input).toEqual({
      accessPurpose: "Prepare contract documents",
      clientName: "Bright Homes Team",
      permissionLevel: "Transaction coordinator access",
      platformName: "Transaction platform",
      relatedWorkName: "Smith Contract-to-Close",
      status: "Access Needed"
    });
    expect(buildAccessRequestName(input)).toBe("Access Request - Transaction platform");
    expect(buildAccessRequestNextAction(input)).toContain("safe access instructions");
  });

  it("requires platform and purpose", () => {
    expect(() => validateAccessRequestInput({ accessPurpose: "Drafting" })).toThrow(
      AccessRequestValidationError
    );
    expect(() => validateAccessRequestInput({ platformName: "Forms workspace" })).toThrow(
      AccessRequestValidationError
    );
  });

  it("blocks private credentials in notes", () => {
    expect(() =>
      validateAccessRequestInput({
        accessPurpose: "Prepare forms",
        notes: "The username is agent@example.com and password is hidden here.",
        platformName: "Forms workspace"
      })
    ).toThrow("Do not include passwords");
  });

  it("builds display labels for staff and client queues", () => {
    expect(getAccessRequestHealth("Client Says Granted")).toBe("Healthy");
    expect(getAccessRequestHealth("Blocked")).toBe("Critical");
    expect(
      getAccessRequestDetail({
        accessPurpose: "Track deadlines",
        permissionLevel: "Read-only access"
      })
    ).toBe("Track deadlines - Read-only access");
    expect(
      getAccessRequestMetaLabels({
        clientName: "Wilson Realty Group",
        relatedWorkName: "Buyer Offer Package"
      })
    ).toEqual(["No password stored", "Buyer Offer Package", "Wilson Realty Group"]);
  });
});
