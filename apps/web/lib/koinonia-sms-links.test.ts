import { describe, expect, it } from "vitest";
import { resolveKoinoniaSmsCampaignCode } from "./koinonia-sms-links";

describe("Campaign 2 branded links", () => {
  it("maps the first and last approved codes to non-PII campaign parameters", () => {
    expect(resolveKoinoniaSmsCampaignCode("K031")?.get("utm_content")).toBe("K-031");
    expect(resolveKoinoniaSmsCampaignCode("K060")?.get("utm_content")).toBe("K-060");
    expect(resolveKoinoniaSmsCampaignCode("k041")?.get("utm_campaign")).toBe("agent_intro_pilot2");
  });
  it("rejects unknown codes instead of fabricating attribution", () => {
    for (const code of ["K030", "K061", "K999", "../admin", "frank", ""]) {
      expect(resolveKoinoniaSmsCampaignCode(code)).toBeNull();
    }
  });
});
