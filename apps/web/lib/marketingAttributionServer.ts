export type SanitizedMarketingAttribution = {
  landingPath: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  gclid: string;
  fbclid: string;
  ttclid: string;
  liFatId: string;
};

function clean(input: unknown) {
  return typeof input === "string" ? input.trim().slice(0, 500) : "";
}

export function sanitizeMarketingAttribution(
  input: unknown
): SanitizedMarketingAttribution {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      landingPath: "",
      referrer: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmContent: "",
      utmTerm: "",
      gclid: "",
      fbclid: "",
      ttclid: "",
      liFatId: ""
    };
  }

  const record = input as Record<string, unknown>;

  return {
    landingPath: clean(record.landingPath),
    referrer: clean(record.referrer),
    utmSource: clean(record.utmSource),
    utmMedium: clean(record.utmMedium),
    utmCampaign: clean(record.utmCampaign),
    utmContent: clean(record.utmContent),
    utmTerm: clean(record.utmTerm),
    gclid: clean(record.gclid),
    fbclid: clean(record.fbclid),
    ttclid: clean(record.ttclid),
    liFatId: clean(record.liFatId)
  };
}

export function marketingAttributionRows(
  attribution: SanitizedMarketingAttribution
) {
  return [
    ["Marketing Source", attribution.utmSource],
    ["Marketing Medium", attribution.utmMedium],
    ["Marketing Campaign", attribution.utmCampaign],
    ["Marketing Content", attribution.utmContent],
    ["Marketing Term", attribution.utmTerm],
    ["Landing Path", attribution.landingPath],
    ["Referrer", attribution.referrer],
    ["GCLID", attribution.gclid],
    ["FBCLID", attribution.fbclid],
    ["TTCLID", attribution.ttclid],
    ["LinkedIn Click ID", attribution.liFatId]
  ].filter(([, rowValue]) => rowValue);
}

export function marketingAttributionText(
  attribution: SanitizedMarketingAttribution
) {
  const rows = marketingAttributionRows(attribution);

  if (!rows.length) return "";

  return [
    "",
    "Marketing Attribution:",
    ...rows.map(([label, rowValue]) => `${label}: ${rowValue}`)
  ].join("\n");
}
