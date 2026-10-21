import { describe, expect, it } from "vitest";
import { checkMarketingPreviewAccess } from "./koinonia-marketing-preview-access";

describe("marketing Preview access control", () => {
  it.each(["Owner", "Admin"])("allows %s in the Koinonia workspace", role => {
    expect(checkMarketingPreviewAccess(role, "wks_koinonia")).toEqual({ allowed: true });
  });
  it.each(["Viewer", "Member", "Client", "Staff", "", "owner"])("denies non-privileged role %s", role => {
    expect(checkMarketingPreviewAccess(role, "wks_koinonia").allowed).toBe(false);
  });
  it.each(["wks_other", "", "wks_koinonia_extra"])("denies other workspace %s", workspace => {
    expect(checkMarketingPreviewAccess("Admin", workspace).allowed).toBe(false);
  });
});
