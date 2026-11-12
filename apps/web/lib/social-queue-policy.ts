import { createHash } from "node:crypto";
import { isSocialPlatform, type SocialPlatform } from "./social-platforms";
import { isSocialMediaImage, socialMediaPrefix, type SocialMediaImage } from "./social-media";

export type SocialSnapshot = { workspaceId: string; variantId: string; revision: number; platform: SocialPlatform; caption: string; media: SocialMediaImage[]; campaignKey: string | null };
export function readSocialSnapshot(input: unknown): SocialSnapshot {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid publish snapshot");
  const v = input as Record<string, unknown>;
  if (typeof v.workspaceId !== "string" || !v.workspaceId || typeof v.variantId !== "string" || !v.variantId ||
      !Number.isSafeInteger(v.revision) || (v.revision as number) < 1 || !isSocialPlatform(v.platform) ||
      typeof v.caption !== "string" || !v.caption.trim() || v.caption.length > 5000 || !Array.isArray(v.media) || v.media.length > 4 ||
      !(v.campaignKey === null || typeof v.campaignKey === "string")) throw new Error("Invalid publish snapshot");
  const prefix = socialMediaPrefix(v.workspaceId, v.variantId);
  if (!v.media.every(m => isSocialMediaImage(m) && m.key.startsWith(prefix) && !m.key.slice(prefix.length).includes("/") &&
      !m.key.includes("..") && Number.isSafeInteger(m.size) && m.size > 0 && m.size <= 512 * 1024 * 1024 &&
      ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"].includes(m.type))) throw new Error("Invalid scoped media");
  return v as SocialSnapshot;
}
export function socialQueueKey(workspaceId: string, variantId: string, revision: number, connectionId: string | null, mode: string) {
  return createHash("sha256").update(JSON.stringify(["social-job-v1", workspaceId, variantId, revision, connectionId, mode])).digest("hex");
}
/** An offset is mandatory: a wall-clock string alone is ambiguous across daylight-saving changes. */
export function parseSocialSchedule(value: unknown, timeZone: unknown, now = Date.now()) {
  if (typeof value !== "string" || !/T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) || typeof timeZone !== "string") throw new Error("An ISO timestamp with timezone offset is required");
  new Intl.DateTimeFormat("en-US", { timeZone });
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.getTime() < now + 60000 || date.getTime() > now + 366 * 86400000) throw new Error("Choose a date one minute to one year in the future");
  return date;
}
export function liveSocialPublishingEnabled(env: Record<string, string | undefined> = process.env) {
  return env.SOCIAL_PUBLISHING_ENABLED === "true" && env.SOCIAL_LIVE_PUBLISHING_OWNER_APPROVED === "true";
}
export function socialRetryAt(attempt: number, now = Date.now(), retryAfterSeconds = 0) {
  return new Date(now + Math.min(86400000, Math.max(30000 * 2 ** Math.min(attempt - 1, 10), retryAfterSeconds * 1000)));
}
export function liveSocialContentProblem(snapshot: SocialSnapshot): string | null {
  if (snapshot.platform === "tiktok") return "TikTok Direct Post is blocked for an internal team utility under current platform intended-use policy.";
  if (snapshot.platform === "linkedin" && snapshot.caption.length > 3000) return "LinkedIn captions must be 3,000 characters or fewer.";
  if (snapshot.platform === "instagram" && snapshot.caption.length > 2200) return "Instagram captions must be 2,200 characters or fewer.";
  if (snapshot.platform === "instagram" && (snapshot.media.length !== 1 || !["image/jpeg", "video/mp4"].includes(snapshot.media[0].type))) return "Instagram publishing currently supports one JPEG image or MP4 Reel; other formats require conversion or a carousel adapter.";
  if (snapshot.platform === "linkedin" && snapshot.media.length) return "LinkedIn media upload must be verified before live media publishing; text posts are supported.";
  if (snapshot.platform === "facebook" && snapshot.media.some(m => m.type.startsWith("video/"))) return "Facebook video processing must be verified before live video publishing; text and image posts are supported.";
  return null;
}
