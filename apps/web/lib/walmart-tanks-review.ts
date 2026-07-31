export type WalmartTanksReviewCommunication = {
  subject: string;
  sender: string;
  city?: string;
  state?: string;
  reviewReason?: string;
  snippet?: string;
};

export type WalmartTanksWorkBucket = "acc" | "uco" | "pw";

export type WalmartTanksIdentifiers = {
  storeNumbers: string[];
  workOrderNumbers: string[];
  purchaseOrderNumbers: string[];
};

export type WalmartTanksLocation = {
  city?: string;
  state?: string;
};

const STATE_NAMES: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  florida: "FL",
  georgia: "GA",
  illinois: "IL",
  indiana: "IN",
  kentucky: "KY",
  louisiana: "LA",
  mississippi: "MS",
  missouri: "MO",
  new_mexico: "NM",
  new_york: "NY",
  north_carolina: "NC",
  oklahoma: "OK",
  south_carolina: "SC",
  tennessee: "TN",
  texas: "TX"
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function toTitleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
}

export function getWalmartTanksReviewCategory(communication: WalmartTanksReviewCommunication) {
  const location = extractWalmartTanksLocation([communication.subject, communication.snippet].filter(Boolean).join(" "));
  const hasLocation = Boolean(communication.city || communication.state || location.city || location.state);
  const reviewText = [
    communication.reviewReason,
    communication.subject,
    communication.sender,
    communication.snippet
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!hasLocation && /city|state|location|address/.test(reviewText)) return "Needs city/state";
  if (/multiple|multi-store|several stores|store numbers|split/.test(reviewText)) return "Multi-store";
  if (/statement|invoice|vendor|remit|balance/.test(reviewText)) return "Vendor statement";
  if (/no job|not a job|newsletter|marketing|notification|receipt/.test(reviewText)) return "Non-job";
  return "Manual review";
}

export function getWalmartTanksWorkBuckets(searchText: string): WalmartTanksWorkBucket[] {
  const normalizedText = searchText.toLowerCase();
  const buckets = new Set<WalmartTanksWorkBucket>();

  if (/\bacc\b|gauge|new oil|hydraulic|morrison/.test(normalizedText)) buckets.add("acc");
  if (/\buco\b|used cooking oil|grease tank|caddy|fog bin/.test(normalizedText)) buckets.add("uco");
  if (/wmpw|paperwork|jotform|completion|lxretail|workflow|permit|document/.test(normalizedText)) buckets.add("pw");

  return Array.from(buckets);
}

export function extractWalmartTanksIdentifiers(text: string): WalmartTanksIdentifiers {
  const storeNumbers = Array.from(
    text.matchAll(/\b(?:WM|NHM|SC|Walmart|Sam's Club)\s*(?:WM\s*)?-?\s*(\d{2,5})\b/gi),
    (match) => match[1]
  );
  const workOrderNumbers = Array.from(
    text.matchAll(/\b\d{2,5}\.\d{3,5}\b/g),
    (match) => match[0]
  );
  const purchaseOrderNumbers = Array.from(
    text.matchAll(/\b(?:PO|P\.O\.|purchase order)\s*[:#-]?\s*([A-Z0-9][A-Z0-9-]{3,})\b/gi),
    (match) => match[1]
  );

  return {
    storeNumbers: unique(storeNumbers),
    workOrderNumbers: unique(workOrderNumbers),
    purchaseOrderNumbers: unique(purchaseOrderNumbers)
  };
}

export function extractWalmartTanksLocation(text: string): WalmartTanksLocation {
  const stateNameMatch = text.match(/\b([A-Za-z]+(?:\s+[A-Za-z]+){0,2})\s+State:\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)\b/);
  if (stateNameMatch) {
    const stateKey = stateNameMatch[2].toLowerCase().replace(/\s+/g, "_");
    return {
      city: toTitleCase(stateNameMatch[1]),
      state: STATE_NAMES[stateKey] ?? stateNameMatch[2].toUpperCase()
    };
  }

  const abbreviationMatch = text.match(/\b([A-Za-z]+(?:\s+[A-Za-z]+){0,2})\s*,?\s+(AL|AK|AR|AZ|CA|CO|CT|FL|GA|IL|IN|KY|LA|MS|MO|NC|NM|NY|OK|SC|TN|TX)\b/);
  if (abbreviationMatch) {
    return {
      city: toTitleCase(abbreviationMatch[1]),
      state: abbreviationMatch[2].toUpperCase()
    };
  }

  return {};
}
