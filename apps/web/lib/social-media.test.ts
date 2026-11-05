import { describe, expect, it } from "vitest";
import { imageMimeFromBytes, socialMediaImages, socialMediaPrefix, socialImageExtension } from "./social-media";
describe("private social image attachment security", () => {
  it("sniffs JPEG PNG and WebP signatures", () => {
    expect(imageMimeFromBytes(new Uint8Array([255,216,255]))).toBe("image/jpeg");
    expect(imageMimeFromBytes(new Uint8Array([137,80,78,71,13,10,26,10]))).toBe("image/png");
    expect(imageMimeFromBytes(new TextEncoder().encode("RIFFxxxxWEBP"))).toBe("image/webp");
    expect(imageMimeFromBytes(new TextEncoder().encode("<svg><script>"))).toBe(null);
  });
  it("isolates file prefixes by workspace and variant", () => {
    expect(socialMediaPrefix("workspace/a","variant/b")).toBe("social-preview/workspace%2Fa/variant%2Fb/");
  });
  it("allows only exact image MIME values", () => {
    expect(socialImageExtension("image/jpeg")).toBe("jpg");
    expect(socialImageExtension("image/svg+xml")).toBe(null);
  });
  it("discards unexpected attachment records", () => {
    expect(socialMediaImages([{key:"x",type:"image/png",size:12,name:"a.png"},null,{key:1}])).toHaveLength(1);
  });
});
