import { describe, expect, it } from "vitest";
import { marketingAcquisitionChannel } from "./marketing-acquisition-channel";
describe("recorded acquisition channel", () => {
  it("uses explicit campaign tags and leaves ambiguous social clicks unknown", () => {
    expect(marketingAcquisitionChannel({ utmMedium: "organic_social", fbclid: "click" })).toBe("organic");
    expect(marketingAcquisitionChannel({ utmMedium: "paid-social" })).toBe("paid");
    expect(marketingAcquisitionChannel({ fbclid: "click", ttclid: "click" })).toBe("unknown");
    expect(marketingAcquisitionChannel({ utmMedium: "unpaid" })).toBe("unknown");
    expect(marketingAcquisitionChannel({ utmMedium: "warm_followup" })).toBe("email");
  });
});
