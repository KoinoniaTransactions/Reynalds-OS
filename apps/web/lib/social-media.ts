export type SocialMediaImage = { key: string; type: string; size: number; name: string };
export const SOCIAL_IMAGE_MAX_BYTES = 3 * 1024 * 1024;
export const SOCIAL_IMAGE_MAX_COUNT = 4;
export const SOCIAL_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export function isSocialMediaImage(value: unknown): value is SocialMediaImage {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
    typeof (value as SocialMediaImage).key === "string" &&
    typeof (value as SocialMediaImage).type === "string" &&
    typeof (value as SocialMediaImage).size === "number" &&
    typeof (value as SocialMediaImage).name === "string";
}
export function socialMediaImages(value: unknown): SocialMediaImage[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isSocialMediaImage);
}
export function socialMediaPrefix(workspaceId: string, variantId: string) {
  return "social-preview/" + encodeURIComponent(workspaceId) + "/" + encodeURIComponent(variantId) + "/";
}
export function imageMimeFromBytes(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "image/png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP") return "image/webp";
  return null;
}
export function socialImageExtension(mime: string) {
  switch(mime) {
    case "image/jpeg": return "jpg";
    case "image/png": return "png";
    case "image/webp": return "webp";
    default: return null;
  }
}
