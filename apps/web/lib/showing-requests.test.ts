import { describe, expect, it } from "vitest";
import {
  buildShowingRequestName,
  buildShowingRequestNextAction,
  buildShowingStatusNextAction,
  getShowingStatusHealth,
  getShowingNoteLabels,
  getShowingTimingLabel,
  normalizeShowingStatus,
  ShowingRequestValidationError,
  validateShowingRequestInput,
  validateShowingRequestStatusUpdateInput
} from "./showing-requests";

describe("showing request helpers", () => {
  it("validates a client showing request", () => {
    expect(
      validateShowingRequestInput({
        authorization: true,
        buyerName: "Morgan Lee",
        preferredWindow: "Friday morning",
        propertyAddress: "123 Main St",
        serviceLevel: "Licensed showing coverage"
      })
    ).toEqual({
      authorization: true,
      buyerName: "Morgan Lee",
      preferredWindow: "Friday morning",
      propertyAddress: "123 Main St",
      serviceLevel: "Licensed showing coverage"
    });
  });

  it("requires property and timing details", () => {
    expect(() => validateShowingRequestInput({ preferredWindow: "Today" })).toThrow(
      ShowingRequestValidationError
    );
    expect(() => validateShowingRequestInput({ propertyAddress: "123 Main St" })).toThrow(
      ShowingRequestValidationError
    );
  });

  it("blocks private access secrets in notes", () => {
    expect(() =>
      validateShowingRequestInput({
        notes: "Lockbox code is 1234",
        preferredWindow: "Today",
        propertyAddress: "123 Main St"
      })
    ).toThrow("Do not include lockbox codes");
  });

  it("builds display and next-action labels", () => {
    const input = validateShowingRequestInput({
      authorization: false,
      preferredWindow: "Tomorrow afternoon",
      propertyAddress: "456 Oak Ave"
    });

    expect(buildShowingRequestName(input)).toBe("Showing Request - 456 Oak Ave");
    expect(buildShowingRequestNextAction(input)).toContain("Resolve missing authorization");
    expect(getShowingTimingLabel({ preferredWindow: "Tomorrow afternoon" })).toBe("Tomorrow afternoon");
    expect(getShowingNoteLabels({ authorization: true, buyerName: "Avery", serviceLevel: "Tour setup" })).toEqual([
      "Client contact authorized",
      "Tour setup",
      "Buyer: Avery"
    ]);
  });

  it("validates the staff showing status lifecycle", () => {
    expect(
      validateShowingRequestStatusUpdateInput({
        assignedProvider: "Maya Torres",
        confirmedWindow: "Friday 10 AM",
        feedbackSummary: "Buyer liked the kitchen layout.",
        notes: "Confirmed with Realtor.",
        status: "Confirmed"
      })
    ).toEqual({
      assignedProvider: "Maya Torres",
      confirmedWindow: "Friday 10 AM",
      feedbackSummary: "Buyer liked the kitchen layout.",
      notes: "Confirmed with Realtor.",
      status: "Confirmed"
    });

    expect(normalizeShowingStatus("Scheduled")).toBe("Confirmed");
    expect(normalizeShowingStatus("Waiting on Client")).toBe("Needs Follow-up");
    expect(buildShowingStatusNextAction("Scheduling")).toContain("Coordinate showing time");
    expect(getShowingStatusHealth("Completed")).toBe("Healthy");
    expect(getShowingStatusHealth("Needs Follow-up")).toBe("Blocked");
  });

  it("blocks private access secrets in showing status updates", () => {
    expect(() =>
      validateShowingRequestStatusUpdateInput({
        notes: "Gate code is 1234",
        status: "Scheduling"
      })
    ).toThrow("Do not include lockbox codes");
  });
});
