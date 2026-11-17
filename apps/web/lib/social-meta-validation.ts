type RecordValue = Record<string, unknown>;
export function metaRecord(value: unknown): RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid Meta response");
  return value as RecordValue;
}
export function metaToken(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.length > 8192) throw new Error("Invalid Meta token");
  return value;
}
export function metaId(value: unknown): string {
  if (typeof value !== "string" || !/^\d{1,64}$/.test(value)) throw new Error("Invalid Meta account identity");
  return value;
}
export function validateMetaGrant(value: unknown, appId: string, now = Date.now()) {
  const token = metaRecord(metaRecord(value).data);
  if (token.is_valid !== true || String(token.app_id) !== appId || !Array.isArray(token.scopes) ||
      !token.scopes.every(s => typeof s === "string")) throw new Error("Invalid Meta grant");
  const expiries: number[] = [];
  for (const key of ["expires_at", "data_access_expires_at"]) {
    const expiry = token[key];
    if (expiry !== undefined && (typeof expiry !== "number" || !Number.isSafeInteger(expiry) || expiry < 0)) throw new Error("Invalid Meta expiry");
    if (typeof expiry === "number" && expiry > 0) {
      if (expiry * 1000 <= now) throw new Error("Expired Meta grant");
      expiries.push(expiry * 1000);
    }
  }
  return { scopes: token.scopes as string[], expiresAt: expiries.length ? new Date(Math.min(...expiries)) : null,
    profileId: typeof token.profile_id === "string" ? token.profile_id : null };
}
export function parseMetaPages(value: unknown) {
  const response = metaRecord(value);
  if (!Array.isArray(response.data) || response.data.length > 100) throw new Error("Invalid Meta pages");
  const pages = response.data.map(raw => {
    const page = metaRecord(raw);
    const id = metaId(page.id);
    if (typeof page.name !== "string" || !page.name.trim() || page.name.length > 300) throw new Error("Invalid Meta Page name");
    const instagram = page.instagram_business_account ? metaRecord(page.instagram_business_account) : null;
    return { id, name: page.name, accessToken: metaToken(page.access_token),
      instagram: instagram ? { id: metaId(instagram.id), username: typeof instagram.username === "string" ? instagram.username.slice(0, 300) : null } : null };
  });
  const paging = response.paging ? metaRecord(response.paging) : null;
  const cursors = paging?.cursors ? metaRecord(paging.cursors) : null;
  // Never follow provider-supplied URLs carrying credentials. Rebuild the fixed endpoint with its cursor.
  const after = paging?.next ? cursors?.after : null;
  if (paging?.next && (typeof after !== "string" || !after || after.length > 4096)) throw new Error("Invalid Meta cursor");
  return { pages, after: typeof after === "string" ? after : null };
}
