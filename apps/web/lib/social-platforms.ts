export const socialPlatforms = ["facebook", "instagram", "tiktok", "linkedin"] as const;
export type SocialPlatform = (typeof socialPlatforms)[number];
export function isSocialPlatform(value: unknown): value is SocialPlatform {
  return typeof value === "string" && socialPlatforms.some(platform => platform === value);
}
export function getSocialMediaRequirement(platform: SocialPlatform): string {
  switch (platform) {
    case "instagram": return "Professional account; supported image or video media required.";
    case "tiktok": return "Approved developer posting access and supported video media required.";
    case "facebook": return "Authorized Facebook Page and supported media or text content required.";
    case "linkedin": return "Authorized LinkedIn organization and supported post content required.";
  }
}
