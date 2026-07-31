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
      grantMethod: "Team or assistant seat",
      noSecretsAcknowledged: true,
      permissionLevel: "Transaction coordinator access",
      platformName: "Transaction platform",
      relatedWorkName: "Smith Contract-to-Close",
      status: "Access Needed"
    });

    expect(input).toEqual({
      accessPurpose: "Prepare contract documents",
      clientName: "Bright Homes Team",
      grantMethod: "Team or assistant seat",
      noSecretsAcknowledged: true,
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
        noSecretsAcknowledged: true,
        platformName: "Forms workspace"
      })
    ).toThrow("Do not include passwords");
  });

  it("requires safe access acknowledgement and an approved grant method", () => {
    expect(() =>
      validateAccessRequestInput({
        accessPurpose: "Prepare forms",
        platformName: "Forms workspace"
      })
    ).toThrow("Confirm that this access request will not include passwords");

    expect(() =>
      validateAccessRequestInput({
        accessPurpose: "Prepare forms",
        grantMethod: "Paste login in notes",
        noSecretsAcknowledged: true,
        platformName: "Forms workspace"
      })
    ).toThrow("grantMethod must match an approved safe access method");
  });

  it("builds display labels for staff and client queues", () => {
    expect(getAccessRequestHealth("Client Says Granted")).toBe("Healthy");
    expect(getAccessRequestHealth("Blocked")).toBe("Critical");
    expect(
      getAccessRequestDetail({
        accessPurpose: "Track deadlines",
        grantMethod: "Read-only role",
        permissionLevel: "Read-only access"
      })
    ).toBe("Track deadlines - Read-only access via Read-only role");
    expect(
      getAccessRequestMetaLabels({
        clientName: "Wilson Realty Group",
        grantMethod: "Processor or platform invite",
        relatedWorkName: "Buyer Offer Package"
      })
    ).toEqual([
      "No password stored",
      "Processor or platform invite",
      "Buyer Offer Package",
      "Wilson Realty Group"
    ]);
  });
});
