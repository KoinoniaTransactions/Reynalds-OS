import { normalizeKoinoniaRelationshipData } from "./koinonia-relationship";
import { marketingAcquisitionChannel } from "./marketing-acquisition-channel";
export type MarketingRelationshipRecord = { status: string; data: unknown };
type CampaignRow = { campaign: string; relationships: number; consultations: number; currentQualified: number; customers: number; tagged: number; staffRecorded: number; recordedRevenue: number };
const customerStages = new Set(["Client", "Active Client", "Active Engagement", "Successful Delivery", "Advocate"]);
export function buildKoinoniaMarketingReport(records: MarketingRelationshipRecord[]) {
  const campaigns = new Map<string, CampaignRow>();
  const acquisitionChannels = { paid: 0, organic: 0, email: 0, referral: 0, unknown: 0 };
  let competitors = 0, unclassified = 0, recordedRevenue = 0, consultationRequests = 0, customers = 0, currentQualified = 0, suppressed = 0;
  for (const row of records) {
    const profile = normalizeKoinoniaRelationshipData(row.data);
    if (profile.contact?.audienceType === "competitor") { competitors++; continue; }
    if (!profile.contact?.audienceType || profile.contact.audienceType === "unreviewed") unclassified++;
    acquisitionChannels[marketingAcquisitionChannel(profile.acquisition?.conversionTouch)]++;
    const tagged = profile.acquisition?.conversionTouch?.utmCampaign?.trim() ?? "";
    const manual = profile.acquisition?.campaign?.trim() ?? "";
    const campaign = tagged || manual || "Unattributed";
    const aggregate = campaigns.get(campaign) ?? { campaign, relationships: 0, consultations: 0, currentQualified: 0, customers: 0, tagged: 0, staffRecorded: 0, recordedRevenue: 0 };
    aggregate.relationships++;
    if (tagged) aggregate.tagged++; else if (manual) aggregate.staffRecorded++;
    if (profile.consultationRequest?.submittedAt && Number.isFinite(Date.parse(profile.consultationRequest.submittedAt))) { aggregate.consultations++; consultationRequests++; }
    if (row.status === "Qualified Lead") { aggregate.currentQualified++; currentQualified++; }
    if (customerStages.has(row.status)) { aggregate.customers++; customers++; }
    // Cumulative replaces first-engagement amount, never sums it twice. No invoice/cash claim.
    const value = profile.growth?.cumulativeRevenue ?? profile.engagement?.firstEngagementRevenue;
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) { aggregate.recordedRevenue += value; recordedRevenue += value; }
    if (["unsubscribed", "do_not_contact"].includes(profile.emailMarketing?.status ?? "")) suppressed++;
    campaigns.set(campaign, aggregate);
  }
  return { relationships: records.length - competitors, competitors, unclassified, consultationRequests, currentQualified, customers, recordedRevenue, suppressed, acquisitionChannels,
    campaigns: [...campaigns.values()].sort((a, b) => b.relationships - a.relationships),
    websiteVisits: null, landingPageConversionRate: null, socialImpressions: null, emailEngagement: null, advertisingSpend: null,
    measurementNote: "Campaigns reflect CRM acquisition fields. Recorded relationship revenue is not verified cash, incremental revenue, or ROAS. Website/provider metrics require their own validated data connections." };
}
