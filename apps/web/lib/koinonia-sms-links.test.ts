import { describe, expect, it } from "vitest";
import { resolveKoinoniaSmsCampaignCode } from "./koinonia-sms-links";

describe("Koinonia branded campaign links", () => {
  it("preserves original Campaign 2 codes and attribution", () => {
    expect(resolveKoinoniaSmsCampaignCode("K031")?.get("utm_content")).toBe("K-031");
    expect(resolveKoinoniaSmsCampaignCode("K060")?.get("utm_content")).toBe("K-060");
    expect(resolveKoinoniaSmsCampaignCode("k041")?.get("utm_campaign")).toBe("agent_intro_pilot2");
  });

  it("supports exactly the next 60 approved prospect links", () => {
    const ids = [61, 62, 64, 65, 67, 69, 70, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 89, 90, 91, 92, 95, 99, 100, 101, 104, 106, 107, 108, 109, 110, 112, 113, 114, 116, 117, 118, 119, 120, 121, 122, 123, 125, 126, 127, 128, 130, 131, 132, 133, 134, 135, 136, 137];
    expect(ids).toHaveLength(60);
    for (const id of ids) {
      const code = `K${String(id).padStart(3, "0")}`;
      const mapped = resolveKoinoniaSmsCampaignCode(code);
      expect(mapped?.get("utm_content")).toBe(`K-${String(id).padStart(3, "0")}`);
      expect(mapped?.get("utm_campaign")).toBe("agent_intro_next60");
      expect(mapped?.get("utm_medium")).toBe("sms");
    }
  });

  it("rejects unknown or unapproved IDs", () => {
    for (const code of ["K030", "K063", "K066", "K088", "K098", "K129", "K138", "K999", "../admin", "frank", ""]) {
      expect(resolveKoinoniaSmsCampaignCode(code)).toBeNull();
    }
  });
});
