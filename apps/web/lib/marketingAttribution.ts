export type MarketingAttribution = {
  landingPath?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  liFatId?: string;
};

export const MARKETING_ATTRIBUTION_STORAGE_KEY = "koinonia-marketing-attribution-v1";

function clean(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 500) : undefined;
}

function readStoredAttribution(): MarketingAttribution {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.sessionStorage.getItem(MARKETING_ATTRIBUTION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MarketingAttribution) : {};
  } catch {
    return {};
  }
}

export function captureMarketingAttribution(): MarketingAttribution {
  if (typeof window === "undefined") return {};

  const stored = readStoredAttribution();
  const params = new URLSearchParams(window.location.search);

  const current: MarketingAttribution = {
    landingPath: `${window.location.pathname}${window.location.search}`.slice(0, 500),
    referrer: clean(document.referrer),
    utmSource: clean(params.get("utm_source")),
    utmMedium: clean(params.get("utm_medium")),
    utmCampaign: clean(params.get("utm_campaign")),
    utmContent: clean(params.get("utm_content")),
    utmTerm: clean(params.get("utm_term")),
    gclid: clean(params.get("gclid")),
    fbclid: clean(params.get("fbclid")),
    ttclid: clean(params.get("ttclid")),
    liFatId: clean(params.get("li_fat_id"))
  };

  const merged: MarketingAttribution = {
    landingPath: stored.landingPath ?? current.landingPath,
    referrer: stored.referrer ?? current.referrer,
    utmSource: current.utmSource ?? stored.utmSource,
    utmMedium: current.utmMedium ?? stored.utmMedium,
    utmCampaign: current.utmCampaign ?? stored.utmCampaign,
    utmContent: current.utmContent ?? stored.utmContent,
    utmTerm: current.utmTerm ?? stored.utmTerm,
    gclid: current.gclid ?? stored.gclid,
    fbclid: current.fbclid ?? stored.fbclid,
    ttclid: current.ttclid ?? stored.ttclid,
    liFatId: current.liFatId ?? stored.liFatId
  };

  try {
    window.sessionStorage.setItem(
      MARKETING_ATTRIBUTION_STORAGE_KEY,
      JSON.stringify(merged)
    );
  } catch {
    // Attribution is helpful, but a storage failure must never block the site.
  }

  return merged;
}

export function getMarketingAttribution() {
  return captureMarketingAttribution();
}
