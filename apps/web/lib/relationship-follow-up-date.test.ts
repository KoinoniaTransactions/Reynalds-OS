import { describe, expect, it } from "vitest";

import { suggestFollowUpDueDate } from "./relationship-follow-up-date";

const referenceDate = new Date(2026, 7, 15, 12, 0, 0);

describe("relationship follow-up date suggestions", () => {
  it("suggests tomorrow from a clear relative phrase", () => {
    expect(
      suggestFollowUpDueDate("Follow up tomorrow about the listing.", referenceDate)
    ).toBe("2026-08-16");
  });

  it("suggests relative weeks", () => {
    expect(
      suggestFollowUpDueDate("Check back in two weeks.", referenceDate)
    ).toBe("2026-08-29");
  });

  it("suggests next month using the same calendar day when possible", () => {
    expect(
      suggestFollowUpDueDate("She wants to try an open house next month.", referenceDate)
    ).toBe("2026-09-15");
  });

  it("suggests the next named weekday", () => {
    expect(
      suggestFollowUpDueDate("Call her Tuesday.", referenceDate)
    ).toBe("2026-08-18");
  });

  it("does not invent a date from an unknown business milestone", () => {
    expect(
      suggestFollowUpDueDate("Follow up before her listing goes live.", referenceDate)
    ).toBe("");
  });
});
