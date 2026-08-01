import { describe, expect, it } from "vitest";
import {
  accessRequestStatusOptions,
  buildAccessRequestStatusFormPayload,
  normalizeAccessRequestStatusSelection
} from "./access-request-status-form";

describe("access request status form helpers", () => {
  it("exposes the approved status lifecycle", () => {
    expect(accessRequestStatusOptions).toEqual([
      "Access Needed",
      "Waiting on Client",
      "Client Says Granted",
      "Blocked",
      "No Longer Needed"
    ]);
  });

  it("keeps approved statuses and safely defaults unknown values", () => {
    expect(normalizeAccessRequestStatusSelection("Client Says Granted")).toBe(
      "Client Says Granted"
    );
    expect(normalizeAccessRequestStatusSelection("Approved")).toBe("Access Needed");
    expect(normalizeAccessRequestStatusSelection("")).toBe("Access Needed");
  });

  it("builds the PATCH request payload used by the staff form", () => {
    expect(
      buildAccessRequestStatusFormPayload(
        "Waiting on Client",
        "Client invitation sent through the approved platform."
      )
    ).toEqual({
      notes: "Client invitation sent through the approved platform.",
      status: "Waiting on Client"
    });
  });

  it("does not allow an unknown status into the request payload", () => {
    expect(buildAccessRequestStatusFormPayload("Granted", "").status).toBe(
      "Access Needed"
    );
  });
});
