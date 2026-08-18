import { describe, expect, it } from "vitest";
import { getHumanAuditAction, isPortalAuditAction, normalizeAuditLimit } from "./portal-audit";

describe("portal audit helpers", () => {
  it("recognizes portal audit actions", () => {
    expect(isPortalAuditAction("portal.invitation.created")).toBe(true);
    expect(isPortalAuditAction("invoice.created")).toBe(false);
  });

  it("normalizes requested audit limits", () => {
    expect(normalizeAuditLimit(null)).toBe(25);
    expect(normalizeAuditLimit("0")).toBe(25);
    expect(normalizeAuditLimit("12")).toBe(12);
    expect(normalizeAuditLimit("200")).toBe(100);
  });

  it("formats known and fallback audit actions", () => {
    expect(getHumanAuditAction("portal.invitation.provider_error")).toBe("Provider Invite Review");
    expect(getHumanAuditAction("portal.custom_action.created")).toBe("Custom Action Created");
  });
});
