import { META_GRAPH_VERSION } from "./social-meta-oauth";
import type { SocialSnapshot } from "./social-queue-policy";
import { imageMimeFromBytes, SOCIAL_IMAGE_MAX_BYTES } from "./social-media";

export type ProviderContext = { snapshot: SocialSnapshot; accountId: string; accessToken: string; mediaUrl: (key: string) => string; mediaBytes?: (key: string) => Promise<Uint8Array>; state: Record<string, unknown> };
export type PreparedSocialPost = { ready: boolean; state: Record<string, unknown> };
export class SocialProviderError extends Error {
  constructor(public kind: "retryable" | "reauthorize" | "permanent" | "ambiguous", public code: string, public retryAfterSeconds = 0) {
    super("Social provider request requires " + (kind === "ambiguous" ? "reconciliation" : kind)); this.name = "SocialProviderError";
  }
}
export interface SocialProviderAdapter {
  prepare(context: ProviderContext): Promise<PreparedSocialPost>;
  publish(context: ProviderContext): Promise<string>;
  verify(context: ProviderContext, externalId: string): Promise<boolean>;
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new SocialProviderError("permanent", "malformed_response");
  return value as Record<string, unknown>;
}
function id(value: unknown, dispatch = true): string {
  if (typeof value !== "string" || !/^[\w:()-]{1,200}$/.test(value)) throw new SocialProviderError(dispatch ? "ambiguous" : "permanent", "missing_external_id");
  return value;
}
/** Never return/log provider bodies: they can contain access tokens and private URLs. */
async function providerRequest(url: URL, init: RequestInit, dispatch: boolean) {
  let response: Response;
  try { response = await fetch(url, { ...init, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(15000) }); }
  catch { throw new SocialProviderError(dispatch ? "ambiguous" : "retryable", "transport_failure"); }
  let body: unknown;
  try { const text = await response.text(); body = text ? JSON.parse(text) : {}; }
  catch { throw new SocialProviderError(dispatch ? "ambiguous" : "retryable", "unreadable_response"); }
  let object: Record<string, unknown>;
  try { object = record(body); } catch { throw new SocialProviderError(dispatch ? "ambiguous" : "retryable", "malformed_response"); }
  if (!response.ok || object.error) {
    const error = object.error && typeof object.error === "object" ? record(object.error) : {};
    const numericCode = typeof error.code === "number" ? error.code : response.status;
    const code = "http_" + response.status + "_provider_" + numericCode;
    if (response.status === 401 || response.status === 403 || numericCode === 190) throw new SocialProviderError("reauthorize", code);
    if (response.status === 429 || numericCode === 4 || numericCode === 17 || numericCode === 32 || numericCode === 613) {
      const retry = Number(response.headers.get("retry-after"));
      throw new SocialProviderError("retryable", code, Number.isFinite(retry) ? Math.max(0, Math.min(86400, retry)) : 60);
    }
    if (response.status >= 500) throw new SocialProviderError(dispatch ? "ambiguous" : "retryable", code);
    throw new SocialProviderError("permanent", code);
  }
  return { body: object, response };
}
function graph(accountId: string, path: string) {
  if (!/^\d{1,64}$/.test(accountId)) throw new SocialProviderError("permanent", "invalid_account_id");
  return new URL("https://graph.facebook.com/" + META_GRAPH_VERSION + "/" + accountId + path);
}
async function meta(context: ProviderContext, accountId: string, path: string, fields: Record<string, string>, method: "GET" | "POST", dispatch = false) {
  const url = graph(accountId, path);
  const headers = { Authorization: "Bearer " + context.accessToken, Accept: "application/json" };
  if (method === "GET") for (const [key, value] of Object.entries(fields)) url.searchParams.set(key, value);
  return (await providerRequest(url, { method, headers, ...(method === "POST" ? { body: new URLSearchParams(fields) } : {}) }, dispatch)).body;
}
const facebook: SocialProviderAdapter = {
  async prepare(context) {
    if (!context.snapshot.media.length) return { ready: true, state: {} };
    const mediaIds = await Promise.all(context.snapshot.media.map(async image => {
      const response = await meta(context, context.accountId, "/photos", { url: context.mediaUrl(image.key), published: "false" }, "POST");
      return id(response.id, false);
    }));
    return { ready: true, state: { mediaIds } };
  },
  async publish(context) {
    const mediaIds = Array.isArray(context.state.mediaIds) ? context.state.mediaIds.map(value => id(value, false)) : [];
    if (mediaIds.length !== context.snapshot.media.length) throw new SocialProviderError("permanent", "media_not_prepared");
    const fields: Record<string, string> = { message: context.snapshot.caption };
    mediaIds.forEach((mediaId, index) => { fields["attached_media[" + index + "]"] = JSON.stringify({ media_fbid: mediaId }); });
    const response = await meta(context, context.accountId, "/feed", fields, "POST", true);
    return id(response.id);
  },
  async verify(context, externalId) {
    if (!/^\d+(?:_\d+)?$/.test(externalId)) throw new SocialProviderError("permanent", "invalid_external_id");
    const url = new URL("https://graph.facebook.com/" + META_GRAPH_VERSION + "/" + externalId);
    url.searchParams.set("fields", "id,is_published,from,message");
    const result = await providerRequest(url, { method: "GET", headers: { Authorization: "Bearer " + context.accessToken } }, false);
    const author = result.body.from && typeof result.body.from === "object" ? record(result.body.from) : {};
    return result.body.id === externalId && result.body.is_published === true && author.id === context.accountId && sameCaption(result.body.message, context.snapshot.caption);
  }
};
const instagram: SocialProviderAdapter = {
  async prepare(context) {
    if (typeof context.state.containerId === "string") {
      const containerId = id(context.state.containerId, false);
      const result = await meta(context, containerId, "", { fields: "status_code" }, "GET");
      if (result.status_code === "FINISHED") return { ready: true, state: { containerId } };
      if (result.status_code === "IN_PROGRESS") return { ready: false, state: { containerId } };
      throw new SocialProviderError("permanent", "instagram_container_" + (result.status_code === "EXPIRED" ? "expired" : "failed"));
    }
    const asset = context.snapshot.media[0];
    if (!asset) throw new SocialProviderError("permanent", "media_required");
    const fields: Record<string, string> = asset.type === "video/mp4" ? { media_type: "REELS", video_url: context.mediaUrl(asset.key), caption: context.snapshot.caption } : { image_url: context.mediaUrl(asset.key), caption: context.snapshot.caption };
    const created = await meta(context, context.accountId, "/media", fields, "POST");
    return { ready: false, state: { containerId: id(created.id, false) } };
  },
  async publish(context) {
    const created = await meta(context, context.accountId, "/media_publish", { creation_id: id(context.state.containerId) }, "POST", true);
    return id(created.id);
  },
  async verify(context, externalId) {
    const result = await meta(context, id(externalId), "", { fields: "id,permalink,owner,caption" }, "GET");
    const owner = result.owner && typeof result.owner === "object" ? record(result.owner).id : result.owner;
    return result.id === externalId && owner === context.accountId && sameCaption(result.caption, context.snapshot.caption) && typeof result.permalink === "string" && result.permalink.startsWith("https://www.instagram.com/");
  }
};
const linkedin: SocialProviderAdapter = {
  async prepare(context) {
    const assets = context.snapshot.media;
    if (!assets.length) return { ready: true, state: {} };
    const imageUrns = linkedinImageUrns(context.state.imageUrns ?? []);
    if (imageUrns.length > assets.length) throw new SocialProviderError("permanent", "invalid_image_checkpoint");
    if (imageUrns.length < assets.length) {
      const asset = assets[imageUrns.length];
      if (!context.mediaBytes || !["image/jpeg", "image/png"].includes(asset.type) || asset.size > SOCIAL_IMAGE_MAX_BYTES) throw new SocialProviderError("permanent", "unsupported_linkedin_image");
      const bytes = await context.mediaBytes(asset.key);
      if (bytes.byteLength !== asset.size || bytes.byteLength > SOCIAL_IMAGE_MAX_BYTES || imageMimeFromBytes(bytes) !== asset.type) throw new SocialProviderError("permanent", "image_content_mismatch");
      const initialized = await providerRequest(new URL("https://api.linkedin.com/rest/images?action=initializeUpload"), { method: "POST", headers: linkedinHeaders(context.accessToken), body: JSON.stringify({ initializeUploadRequest: { owner: context.accountId } }) }, false);
      const value = record(initialized.body.value);
      const image = linkedinImageUrns([value.image])[0];
      const uploadUrl = linkedinImageUploadUrl(value.uploadUrl);
      if (typeof value.uploadUrlExpiresAt !== "number" || value.uploadUrlExpiresAt <= Date.now()) throw new SocialProviderError("retryable", "upload_url_expired");
      let uploaded: Response;
      try { uploaded = await fetch(uploadUrl, { method: "PUT", headers: { Authorization: "Bearer " + context.accessToken, "Content-Type": asset.type }, body: Uint8Array.from(bytes).buffer, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(15000) }); }
      catch { throw new SocialProviderError("retryable", "image_upload_failed"); }
      if (!uploaded.ok) throw new SocialProviderError(uploaded.status === 401 || uploaded.status === 403 ? "reauthorize" : "retryable", "image_upload_http_" + uploaded.status);
      return { ready: false, state: { imageUrns: [...imageUrns, image] } };
    }
    const processing = await Promise.all(imageUrns.map(async image => {
      const result = await providerRequest(new URL("https://api.linkedin.com/rest/images/" + encodeURIComponent(image)), { method: "GET", headers: linkedinHeaders(context.accessToken) }, false);
      if (result.body.owner !== context.accountId || result.body.id !== image) throw new SocialProviderError("permanent", "image_owner_mismatch");
      if (["WAITING_UPLOAD", "PROCESSING"].includes(String(result.body.status))) return true;
      if (result.body.status !== "AVAILABLE") throw new SocialProviderError("permanent", "image_processing_failed");
      return false;
    }));
    return { ready: !processing.some(Boolean), state: { imageUrns } };
  },
  async publish(context) {
    if (!/^urn:li:(organization|person):[\w-]+$/.test(context.accountId)) throw new SocialProviderError("permanent", "invalid_linkedin_author");
    const images = linkedinImageUrns(context.state.imageUrns ?? []);
    if (images.length !== context.snapshot.media.length) throw new SocialProviderError("permanent", "media_not_prepared");
    const content = images.length === 1 ? { media: { id: images[0] } } : images.length > 1 ? { multiImage: { images: images.map(image => ({ id: image })) } } : undefined;
    const result = await providerRequest(new URL("https://api.linkedin.com/rest/posts"), { method: "POST", headers: linkedinHeaders(context.accessToken),
      body: JSON.stringify({ author: context.accountId, commentary: context.snapshot.caption, visibility: "PUBLIC", distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] }, lifecycleState: "PUBLISHED", isReshareDisabledByAuthor: false, ...(content ? { content } : {}) }) }, true);
    return id(result.response.headers.get("x-restli-id"));
  },
  async verify(context, externalId) {
    const result = await providerRequest(new URL("https://api.linkedin.com/rest/posts/" + encodeURIComponent(externalId)), { method: "GET", headers: linkedinHeaders(context.accessToken) }, false);
    return result.body.id === externalId && result.body.lifecycleState === "PUBLISHED" && result.body.author === context.accountId && sameCaption(result.body.commentary, context.snapshot.caption);
  }
};
function linkedinImageUrns(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 4 || !value.every(item => typeof item === "string" && /^urn:li:image:[\w-]+$/.test(item))) throw new SocialProviderError("permanent", "invalid_linkedin_image_id");
  return value;
}
export function linkedinImageUploadUrl(value: unknown): URL {
  if (typeof value !== "string") throw new SocialProviderError("permanent", "invalid_linkedin_upload_url");
  let url: URL; try { url = new URL(value); } catch { throw new SocialProviderError("permanent", "invalid_linkedin_upload_url"); }
  if (url.protocol !== "https:" || url.hostname !== "www.linkedin.com" || url.port || url.username || url.password || !url.pathname.startsWith("/dms-uploads/") || url.hash) throw new SocialProviderError("permanent", "invalid_linkedin_upload_url");
  return url;
}
function sameCaption(actual: unknown, approved: string) {
  return typeof actual === "string" && actual.replace(/\r\n/g, "\n").trim() === approved.replace(/\r\n/g, "\n").trim();
}
function linkedinHeaders(accessToken: string) {
  const version = process.env.SOCIAL_LINKEDIN_API_VERSION;
  if (!version || !/^20\d{4}$/.test(version)) throw new SocialProviderError("permanent", "linkedin_api_version_required");
  return { Authorization: "Bearer " + accessToken, "Content-Type": "application/json", "Linkedin-Version": version, "X-Restli-Protocol-Version": "2.0.0" };
}
export function socialProviderAdapter(platform: string): SocialProviderAdapter {
  if (platform === "facebook") return facebook;
  if (platform === "instagram") return instagram;
  if (platform === "linkedin") return linkedin;
  throw new SocialProviderError("permanent", "provider_policy_blocked");
}
