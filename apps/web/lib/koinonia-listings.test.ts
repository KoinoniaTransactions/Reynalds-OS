import { describe, expect, it } from "vitest";

import {
  buildInitialListingTasks,
  buildListingData,
  buildListingName,
  buildTransactionDataFromListing,
  validateAcceptedOffer,
  validateListingIntake
} from "./koinonia-listings";

const baseInput = {
  propertyAddress: "123 Main Street, Parker, CO",
  sellerNames: "Alex and Jordan Seller",
  targetListDate: "2026-09-10",
  listingAgreementStatus: "signed",
  listPrice: "685000",
  occupancyStatus: "occupied",
  mediaPreference: "koinonia_coordinate",
  signLockboxNeeded: "yes",
  openHousePlan: "maybe",
  marketingRequested: true,
  specialInstructions: "Seller prefers afternoon appointments."
};

describe("Koinonia listing intake", () => {
  it("normalizes a valid listing intake", () => {
    const input = validateListingIntake(baseInput);

    expect(input.propertyAddress).toBe("123 Main Street, Parker, CO");
    expect(input.sellerNames).toBe("Alex and Jordan Seller");
    expect(input.listingAgreementStatus).toBe("signed");
    expect(input.marketingRequested).toBe(true);
  });

  it("rejects missing required listing fields", () => {
    expect(() =>
      validateListingIntake({ ...baseInput, propertyAddress: "" })
    ).toThrow("propertyAddress is required");
  });

  it("rejects malformed dates", () => {
    expect(() =>
      validateListingIntake({ ...baseInput, targetListDate: "09/10/2026" })
    ).toThrow("targetListDate must use YYYY-MM-DD format");
  });

  it("builds a stable listing name and launch data", () => {
    const input = validateListingIntake(baseInput);
    const data = buildListingData(input);

    expect(buildListingName(input)).toBe(
      "123 Main Street, Parker, CO — Alex and Jordan Seller"
    );
    expect(data).toMatchObject({
      lifecycle: "hand_us_the_listing",
      phase: "intake",
      propertyAddress: "123 Main Street, Parker, CO",
      marketingRequested: true,
      approvalState: "intake_review"
    });
    expect(data.launchChecklist.marketing).toBe("open");
  });

  it("adds marketing and open-house work when requested", () => {
    const tasks = buildInitialListingTasks(validateListingIntake(baseInput));

    expect(tasks).toContain("Create listing marketing work order and approval package");
    expect(tasks).toContain("Confirm open-house plan, coverage, lead handoff, and promotion");
  });

  it("does not create a marketing task when marketing is not requested", () => {
    const input = validateListingIntake({
      ...baseInput,
      marketingRequested: false,
      openHousePlan: "no"
    });
    const tasks = buildInitialListingTasks(input);

    expect(tasks).not.toContain("Create listing marketing work order and approval package");
    expect(tasks).not.toContain("Confirm open-house plan, coverage, lead handoff, and promotion");
  });
});

describe("accepted offer handoff", () => {
  it("validates accepted-offer dates", () => {
    expect(() => validateAcceptedOffer({ closingDate: "10/01/2026" })).toThrow(
      "closingDate must use YYYY-MM-DD format"
    );
  });

  it("carries known listing data into transaction data", () => {
    const listingData = buildListingData(validateListingIntake(baseInput));
    const offer = validateAcceptedOffer({
      buyerNames: "Taylor Buyer",
      buyerAgent: "Morgan Agent",
      closingDate: "2026-10-15",
      closingCompany: "Example Title"
    });

    const transactionData = buildTransactionDataFromListing(
      "listing_123",
      listingData,
      offer
    );

    expect(transactionData).toMatchObject({
      sourceListingEngagementId: "listing_123",
      handoffSource: "hand_us_the_listing",
      propertyAddress: "123 Main Street, Parker, CO",
      sellerNames: "Alex and Jordan Seller",
      buyerNames: "Taylor Buyer",
      closingDate: "2026-10-15",
      closingCompany: "Example Title"
    });
  });
});
