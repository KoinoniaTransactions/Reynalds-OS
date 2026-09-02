export const marketingAttributionStorageKey = "koinonia_marketing_attribution_v2";
export const legacyMarketingAttributionStorageKey = "koinonia_marketing_attribution";

export type MarketingTouch = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  fbclid: string;
  ttclid: string;
  gclid: string;
  gbraid: string;
  wbraid: string;
  msclkid: string;
  referrer: string;
  landingPage: string;
  capturedAt: string;
};

export type MarketingAttributionState = {
  version: 2;
  firstTouch: MarketingTouch;
  latestTouch: MarketingTouch;
};

export type MarketingAttributionSubmission = MarketingAttributionState & {
  conversionTouch: MarketingTouch;
};

const emptyTouch: MarketingTouch = {
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmContent: "",
  utmTerm: "",
  fbclid: "",
  ttclid: "",
  gclid: "",
  gbraid: "",
  wbraid: "",
  msclkid: "",
  referrer: "",
  landingPage: "",
  capturedAt: ""
};

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function externalReferrer(referrer: string, landingPage: string): string {
  if (!referrer) return "";

  try {
    return new URL(referrer).origin === new URL(landingPage).origin ? "" : referrer;
  } catch {
    return referrer;
  }
}

export function normalizeMarketingTouch(input: unknown): MarketingTouch {
  const source = input && typeof input === "object" && !Array.isArray(input)
    ? input as Record<string, unknown>
    : {};

  return {
    utmSource: text(source.utmSource),
    utmMedium: text(source.utmMedium),
    utmCampaign: text(source.utmCampaign),
    utmContent: text(source.utmContent),
    utmTerm: text(source.utmTerm),
    fbclid: text(source.fbclid),
    ttclid: text(source.ttclid),
    gclid: text(source.gclid),
    gbraid: text(source.gbraid),
    wbraid: text(source.wbraid),
    msclkid: text(source.msclkid),
    referrer: text(source.referrer),
    landingPage: text(source.landingPage),
    capturedAt: text(source.capturedAt)
  };
}

export function hasMarketingSignal(touch: MarketingTouch): boolean {
  return Boolean(
    touch.utmSource ||
      touch.utmMedium ||
      touch.utmCampaign ||
      touch.utmContent ||
      touch.utmTerm ||
      touch.fbclid ||
      touch.ttclid ||
      touch.gclid ||
      touch.gbraid ||
      touch.wbraid ||
      touch.msclkid ||
      touch.referrer
  );
}

export function createMarketingTouch({
  search,
  referrer,
  landingPage,
  capturedAt
}: {
  search: string;
  referrer: string;
  landingPage: string;
  capturedAt: string;
}): MarketingTouch {
  const params = new URLSearchParams(search);

  return {
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
    utmContent: params.get("utm_content") ?? "",
    utmTerm: params.get("utm_term") ?? "",
    fbclid: params.get("fbclid") ?? "",
    ttclid: params.get("ttclid") ?? "",
    gclid: params.get("gclid") ?? "",
    gbraid: params.get("gbraid") ?? "",
    wbraid: params.get("wbraid") ?? "",
    msclkid: params.get("msclkid") ?? "",
    referrer: externalReferrer(referrer, landingPage),
    landingPage,
    capturedAt
  };
}

export function normalizeMarketingAttributionState(
  input: unknown
): MarketingAttributionState | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;

  const source = input as Record<string, unknown>;

  if (source.version !== 2 || !source.firstTouch || !source.latestTouch) {
    return null;
  }

  return {
    version: 2,
    firstTouch: normalizeMarketingTouch(source.firstTouch),
    latestTouch: normalizeMarketingTouch(source.latestTouch)
  };
}

export function migrateLegacyMarketingAttribution(
  input: unknown,
  fallback: MarketingTouch
): MarketingAttributionState | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;

  const legacy = normalizeMarketingTouch({
    ...(input as Record<string, unknown>),
    landingPage: fallback.landingPage,
    capturedAt: fallback.capturedAt
  });

  if (!hasMarketingSignal(legacy)) return null;

  return {
    version: 2,
    firstTouch: legacy,
    latestTouch: legacy
  };
}

export function updateMarketingAttribution(
  existing: MarketingAttributionState | null,
  current: MarketingTouch
): MarketingAttributionState {
  if (!existing) {
    return {
      version: 2,
      firstTouch: current,
      latestTouch: current
    };
  }

  return {
    version: 2,
    firstTouch: existing.firstTouch,
    latestTouch: hasMarketingSignal(current) ? current : existing.latestTouch
  };
}

export function buildMarketingAttributionSubmission(
  state: MarketingAttributionState | null,
  current: MarketingTouch
): MarketingAttributionSubmission {
  const resolved = updateMarketingAttribution(state, current);

  return {
    ...resolved,
    conversionTouch: hasMarketingSignal(current) ? current : resolved.latestTouch
  };
}

export function emptyMarketingAttributionSubmission(): MarketingAttributionSubmission {
  return {
    version: 2,
    firstTouch: emptyTouch,
    latestTouch: emptyTouch,
    conversionTouch: emptyTouch
  };
}
