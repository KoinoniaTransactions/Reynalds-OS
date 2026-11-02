import { describe, expect, it } from "vitest";
import { isSocialPlatform, socialPlatforms, getSocialMediaRequirement } from "./social-platforms";

describe("social publishing platform requirements", () => {
  it("allows only four supported platforms", () => {
    expect(socialPlatforms).toHaveLength(4);
    for (const platform of socialPlatforms) expect(isSocialPlatform(platform)).toBe(true);
    expect(isSocialPlatform("unknown")).toBe(false);
  });
  it("identifies platform prerequisites", () => {
    for (const platform of socialPlatforms) expect(getSocialMediaRequirement(platform).length).toBeGreaterThan(20);
  });
});
