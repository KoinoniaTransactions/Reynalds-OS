import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Property = { formattedAddress?: string; propertyType?: string; bedrooms?: number; bathrooms?: number; squareFootage?: number };
type Comparable = { formattedAddress?: string; price?: number; distance?: number; status?: string; bedrooms?: number; bathrooms?: number };
type Estimate = { rent?: number; rentRangeLow?: number; rentRangeHigh?: number; subjectProperty?: Property; comparables?: Comparable[] };
const unavailable = (message: string, status: number) => NextResponse.json({ ok: false, message }, { status, headers: { "Cache-Control": "no-store" } });

// The shared Next.js Data Cache avoids repeating RentCast requests for the
// same normalized address within 24 hours. This is not a billing hard cap.
class RentCastStatusError extends Error { constructor(public status: number) { super("RentCast returned HTTP " + status); } }
const cachedRentEstimate = unstable_cache(async (address: string): Promise<Estimate> => {
  const url = new URL("https://api.rentcast.io/v1/avm/rent/long-term");
  url.searchParams.set("address", address);
  url.searchParams.set("compCount", "5");
  const response = await fetch(url.toString(), {
    headers: { "Accept": "application/json", "X-Api-Key": process.env.RENTCAST_API_KEY! },
    cache: "no-store", signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new RentCastStatusError(response.status);
  return await response.json() as Estimate;
}, ["koinonia-properties-rentcast-long-term-v1"], { revalidate: 86400 });

export async function POST(req: NextRequest) {
  if (process.env.PROPERTIES_RENTCAST_ENABLED !== "true" || !process.env.RENTCAST_API_KEY || !process.env.PROPERTIES_TURNSTILE_SECRET_KEY) {
    return unavailable("The online rental estimate is not available yet. Please request a personal assessment below.", 503);
  }
  const expectedOrigin = process.env.PROPERTIES_INQUIRY_ALLOWED_ORIGIN;
  if (!expectedOrigin || req.headers.get("origin") !== expectedOrigin) return unavailable("Unverified request origin.", 403);
  if (Number(req.headers.get("content-length") || 0) > 4000) return unavailable("Request too large.", 413);
  let address: string, token: string;
  try {
    if (!req.headers.get("content-type")?.includes("application/json")) return unavailable("Invalid request.", 415);
    const raw = await req.text();
    if (raw.length > 4000) return unavailable("Request too large.", 413);
    const body = JSON.parse(raw);
    address = typeof body.address === "string" ? body.address.trim() : "";
    token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
  } catch { return unavailable("Invalid request.", 400); }
  if (address.length < 12 || address.length > 220 || !/\d/.test(address) || token.length < 10 || token.length > 2200) {
    return unavailable("Enter a complete street address and complete verification.", 400);
  }
  // Verify a single-use human challenge before spending any paid/free API allowance.
  try {
    const proof = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: process.env.PROPERTIES_TURNSTILE_SECRET_KEY, response: token }),
      signal: AbortSignal.timeout(7000)
    });
    const result = await proof.json() as { success?: boolean; hostname?: string };
    if (!proof.ok || !result.success || result.hostname !== new URL(expectedOrigin).hostname) return unavailable("Verification failed. Please retry.", 403);
  } catch { return unavailable("Verification unavailable. Please retry.", 503); }

  try {
    const data = await cachedRentEstimate(address.replace(/\s+/g, " ").toLowerCase());
    if (typeof data.rent !== "number" || !Number.isFinite(data.rent) || data.rent <= 0) return unavailable("Not enough local rental information was found. Request a personal assessment below.", 404);
    const valid = (n: unknown) => typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : null;
    return NextResponse.json({
      ok: true, address: data.subjectProperty?.formattedAddress || address,
      rent: data.rent, low: valid(data.rentRangeLow), high: valid(data.rentRangeHigh),
      property: { type: data.subjectProperty?.propertyType || null, bedrooms: valid(data.subjectProperty?.bedrooms), bathrooms: valid(data.subjectProperty?.bathrooms), squareFootage: valid(data.subjectProperty?.squareFootage) },
      comparables: (data.comparables || []).slice(0, 5).filter(c => valid(c.price) !== null).map(c => ({
        address: c.formattedAddress || "Nearby comparable", rent: c.price, distance: valid(c.distance), status: c.status || null,
        bedrooms: valid(c.bedrooms), bathrooms: valid(c.bathrooms)
      }))
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof RentCastStatusError) {
      console.error("RentCast API returned status", error.status);
      return unavailable(error.status === 429 ? "Our estimate allowance is temporarily exhausted. Request a personal assessment below." : "An automated estimate is unavailable for this address. Request a personal assessment below.", error.status === 429 ? 429 : 502);
    }
    return unavailable("The estimate service could not be reached. Request a personal assessment below.", 503);
  }
}
