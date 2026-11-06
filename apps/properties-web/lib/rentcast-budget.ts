import { createHash, randomUUID } from "node:crypto";

/**
 * An atomic, rolling request budget for the public rental-valuation API.
 *
 * Reserves at most 25 new RentCast calls in any rolling 35-day period
 * (deliberately below the 50 monthly free-plan requests to leave headroom
 * for other account usage and imperfect billing-cycle alignment).
 * Cached results do not consume a RentCast call.
 * Redis/credential errors fail closed, not open.
 */
const MAX_CALLS_PER_WINDOW = 25;
const WINDOW_MS = 35 * 24 * 60 * 60 * 1000;
const CACHE_SECONDS = 24 * 60 * 60;

const SCRIPT = [
  "local cached = redis.call('GET', KEYS[1])",
  "if cached then return {1, cached} end",
  "local now = tonumber(ARGV[1])",
  "local span = tonumber(ARGV[2])",
  "local maximum = tonumber(ARGV[3])",
  "redis.call('ZREMRANGEBYSCORE', KEYS[2], '-inf', now - span)",
  "local used = redis.call('ZCARD', KEYS[2])",
  "if used >= maximum then return {0, tostring(used)} end",
  "redis.call('ZADD', KEYS[2], now, ARGV[4])",
  "redis.call('EXPIRE', KEYS[2], math.ceil(span / 1000) + 86400)",
  "return {2, tostring(used + 1)}"
].join("\n");

function config() {
  const rawUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!rawUrl || !token) throw new Error("Rental estimate budget is not configured");
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".upstash.io") || url.username || url.password || url.search || url.hash) {
    throw new Error("Invalid Redis endpoint configuration");
  }
  return { url: url.origin, token };
}

async function command(parts: Array<string | number>): Promise<unknown> {
  const { url, token } = config();
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(parts),
    cache: "no-store",
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) throw new Error("Budget store HTTP " + response.status);
  const parsed = await response.json() as { result?: unknown; error?: unknown };
  if (parsed.error || !Object.prototype.hasOwnProperty.call(parsed, "result")) throw new Error("Budget store rejected command");
  return parsed.result;
}

export type BudgetReservation =
  | { status: "cached"; json: string }
  | { status: "reserved"; cacheKey: string }
  | { status: "exhausted" };

export async function reserveRentcastCall(address: string): Promise<BudgetReservation> {
  const digest = createHash("sha256").update(address).digest("hex");
  const cacheKey = "koinonia:properties:rentcast:cache:v1:" + digest;
  const quotaKey = "koinonia:properties:rentcast:requests:rolling-35-days:v1";
  const response = await command(["EVAL", SCRIPT, 2, cacheKey, quotaKey, Date.now(), WINDOW_MS, MAX_CALLS_PER_WINDOW, randomUUID()]);
  if (!Array.isArray(response) || response.length < 2) throw new Error("Budget store returned an invalid response");
  const code = Number(response[0]);
  if (code === 1 && typeof response[1] === "string") return { status: "cached", json: response[1] };
  if (code === 0) return { status: "exhausted" };
  if (code === 2) return { status: "reserved", cacheKey };
  throw new Error("Budget store returned an unknown result");
}

export async function saveRentcastResult(cacheKey: string, result: object): Promise<void> {
  await command(["SET", cacheKey, JSON.stringify(result), "EX", CACHE_SECONDS]);
}
