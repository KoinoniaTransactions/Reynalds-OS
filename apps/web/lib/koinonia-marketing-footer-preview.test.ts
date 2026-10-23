import { describe, expect, it } from "vitest";
import { KOINONIA_DRAFT_MAILING_ADDRESS, previewKoinoniaCommercialFooter as preview } from "./koinonia-marketing-footer-preview";
describe("commercial footer draft preview", () => {
 it("includes owner-designated mailing address but cannot enable sending", () => {
  const output = preview("https://example.org/unsubscribe/test");
  expect(output).toMatchObject({ready:true,draftOnly:true,sendingEnabled:false});
  if (output.ready) expect(output.text).toContain(KOINONIA_DRAFT_MAILING_ADDRESS[1]);
 });
 it.each(["","javascript:alert(1)","http://example.com","https://user:password@example.com","not a url"])("refuses unsafe/unverified placeholder %s", value => {
  expect(preview(value).ready).toBe(false);
 });
 it("requires an unsubscribe URL",()=>expect(preview(undefined)).toEqual({ready:false,reason:"unsubscribe_url_missing"}));
});
