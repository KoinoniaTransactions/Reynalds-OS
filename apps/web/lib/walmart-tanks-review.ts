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

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function getWalmartTanksReviewCategory(communication: WalmartTanksReviewCommunication) {
  const reviewText = [
    communication.reviewReason,
    communication.subject,
    communication.sender,
    communication.snippet
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!communication.city && !communication.state && /city|state|location|address/.test(reviewText)) return "Needs city/state";
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
