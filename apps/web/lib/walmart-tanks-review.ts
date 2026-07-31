export type WalmartTanksReviewCommunication = {
  subject: string;
  sender: string;
  city?: string;
  state?: string;
  reviewReason?: string;
  snippet?: string;
};

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
