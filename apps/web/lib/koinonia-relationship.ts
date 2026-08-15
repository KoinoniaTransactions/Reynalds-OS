export const relationshipLifecycleStages = [
  "Awareness",
  "Interest",
  "Lead",
  "Qualified Lead",
  "Consultation",
  "Proposal",
  "Client",
  "Active Engagement",
  "Successful Delivery",
  "Advocate",
  "Referral"
] as const;

export const relationshipSources = [
  "Brokerage Meeting",
  "Realtor Networking/Event",
  "Direct Introduction",
  "Lender/Title Partner",
  "Existing Client/Referral",
  "Website",
  "Social Media",
  "Email",
  "Open House Interaction",
  "Outbound Relationship Building",
  "Other"
] as const;

export const relationshipPressureCategories = [
  "Transaction/File Capacity",
  "Contract/Document Workload",
  "Showing/Schedule Conflict",
  "Open House/Listing Capacity",
  "CRM/Follow-Up/Business Organization",
  "Referral/No-Capacity Client Opportunity",
  "Brokerage/Team Operations",
  "Unclear/Other"
] as const;

export const relationshipPaths = [
  "Undetermined",
  "Keep Client",
  "Refer Client"
] as const;

export const relationshipServiceOptions = [
  "",
  "Transaction Support / Contract-to-Close Coordination",
  "Contract & Document Support",
  "Licensed Showing Coverage",
  "Professional Open House Coverage",
  "Monthly Operations Partnership",
  "40% Referral Partner Option",
  "Not Sure Yet"
] as const;

export const relationshipMaterialOptions = [
  "",
  "Business Card",
  "Brokerage Introduction Sheet",
  "Service Guide",
  "Pricing Insert",
  "Digital Introduction Packet",
  "Tri-Fold Brochure",
  "Website",
  "Other"
] as const;

export type KoinoniaRelationshipData = {
  relationshipProfileVersion?: number;
  contact?: {
    email?: string;
    phone?: string;
    role?: string;
    brokerage?: string;
    market?: string;
  };
  acquisition?: {
    source?: string;
    sourceDetail?: string;
    firstTouchChannel?: string;
    campaign?: string;
    material?: string;
    firstTouchDate?: string;
    referrer?: string;
  };
  problem?: {
    primaryPressure?: string;
    secondaryPressure?: string;
    exactLanguage?: string;
    triggeringSituation?: string;
    urgency?: string;
    currentWorkaround?: string;
    objection?: string;
    desiredOutcome?: string;
  };
  diagnosis?: {
    path?: string;
    requestedService?: string;
    recommendedService?: string;
    rationale?: string;
    consultationCompleted?: boolean;
    consultationDate?: string;
  };
  consultationRequest?: {
    type?: string;
    preferredDate?: string;
    preferredTime?: string;
    notes?: string;
    submittedAt?: string;
  };
  engagement?: {
    firstPaidService?: string;
    firstEngagementDate?: string;
    firstEngagementRevenue?: number;
    deliveryResult?: string;
    successfulCompletion?: boolean;
  };
  growth?: {
    repeatEngagementCount?: number;
    cumulativeRevenue?: number;
    crossServiceAdoption?: boolean;
    brokerageIntroductions?: number;
    professionalReferrals?: number;
    testimonialStatus?: string;
    advocateStatus?: string;
    lastMeaningfulInteraction?: string;
    nextNurtureDate?: string;
  };
  [key: string]: unknown;
};

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function booleanValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

export function normalizeKoinoniaRelationshipData(
  input: unknown
): KoinoniaRelationshipData {
  const source = record(input);
  const contact = record(source.contact);
  const acquisition = record(source.acquisition);
  const problem = record(source.problem);
  const diagnosis = record(source.diagnosis);
  const consultationRequest = record(source.consultationRequest);
  const engagement = record(source.engagement);
  const growth = record(source.growth);

  return {
    ...source,
    relationshipProfileVersion:
      numberValue(source.relationshipProfileVersion) ?? 1,
    contact: {
      ...contact,
      email: text(contact.email),
      phone: text(contact.phone),
      role: text(contact.role),
      brokerage: text(contact.brokerage),
      market: text(contact.market)
    },
    acquisition: {
      ...acquisition,
      source: text(acquisition.source),
      sourceDetail: text(acquisition.sourceDetail),
      firstTouchChannel: text(acquisition.firstTouchChannel),
      campaign: text(acquisition.campaign),
      material: text(acquisition.material),
      firstTouchDate: text(acquisition.firstTouchDate),
      referrer: text(acquisition.referrer)
    },
    problem: {
      ...problem,
      primaryPressure: text(problem.primaryPressure),
      secondaryPressure: text(problem.secondaryPressure),
      exactLanguage: text(problem.exactLanguage),
      triggeringSituation: text(problem.triggeringSituation),
      urgency: text(problem.urgency),
      currentWorkaround: text(problem.currentWorkaround),
      objection: text(problem.objection),
      desiredOutcome: text(problem.desiredOutcome)
    },
    diagnosis: {
      ...diagnosis,
      path: text(diagnosis.path) || "Undetermined",
      requestedService: text(diagnosis.requestedService),
      recommendedService: text(diagnosis.recommendedService),
      rationale: text(diagnosis.rationale),
      consultationCompleted: booleanValue(diagnosis.consultationCompleted) ?? false,
      consultationDate: text(diagnosis.consultationDate)
    },
    consultationRequest: {
      ...consultationRequest,
      type: text(consultationRequest.type),
      preferredDate: text(consultationRequest.preferredDate),
      preferredTime: text(consultationRequest.preferredTime),
      notes: text(consultationRequest.notes),
      submittedAt: text(consultationRequest.submittedAt)
    },
    engagement: {
      ...engagement,
      firstPaidService: text(engagement.firstPaidService),
      firstEngagementDate: text(engagement.firstEngagementDate),
      firstEngagementRevenue: numberValue(engagement.firstEngagementRevenue),
      deliveryResult: text(engagement.deliveryResult),
      successfulCompletion: booleanValue(engagement.successfulCompletion)
    },
    growth: {
      ...growth,
      repeatEngagementCount: numberValue(growth.repeatEngagementCount) ?? 0,
      cumulativeRevenue: numberValue(growth.cumulativeRevenue) ?? 0,
      crossServiceAdoption: booleanValue(growth.crossServiceAdoption) ?? false,
      brokerageIntroductions: numberValue(growth.brokerageIntroductions) ?? 0,
      professionalReferrals: numberValue(growth.professionalReferrals) ?? 0,
      testimonialStatus: text(growth.testimonialStatus),
      advocateStatus: text(growth.advocateStatus),
      lastMeaningfulInteraction: text(growth.lastMeaningfulInteraction),
      nextNurtureDate: text(growth.nextNurtureDate)
    }
  };
}

export function mergeKoinoniaRelationshipData(
  existing: unknown,
  patch: KoinoniaRelationshipData
): KoinoniaRelationshipData {
  const current = normalizeKoinoniaRelationshipData(existing);

  return normalizeKoinoniaRelationshipData({
    ...current,
    ...patch,
    contact: { ...current.contact, ...patch.contact },
    acquisition: { ...current.acquisition, ...patch.acquisition },
    problem: { ...current.problem, ...patch.problem },
    diagnosis: { ...current.diagnosis, ...patch.diagnosis },
    consultationRequest: {
      ...current.consultationRequest,
      ...patch.consultationRequest
    },
    engagement: { ...current.engagement, ...patch.engagement },
    growth: { ...current.growth, ...patch.growth }
  });
}

export function mapConsultationTypeToRelationshipIntent(
  consultationType: string
): { pressure: string; service: string; path: string } {
  const normalized = consultationType.toLowerCase();

  if (normalized.includes("transaction")) {
    return {
      pressure: "Transaction/File Capacity",
      service: "Transaction Support / Contract-to-Close Coordination",
      path: "Keep Client"
    };
  }

  if (normalized.includes("contract") || normalized.includes("document")) {
    return {
      pressure: "Contract/Document Workload",
      service: "Contract & Document Support",
      path: "Keep Client"
    };
  }

  if (normalized.includes("showing")) {
    return {
      pressure: "Showing/Schedule Conflict",
      service: "Licensed Showing Coverage",
      path: "Keep Client"
    };
  }

  if (normalized.includes("open house")) {
    return {
      pressure: "Open House/Listing Capacity",
      service: "Professional Open House Coverage",
      path: "Keep Client"
    };
  }

  if (normalized.includes("monthly") || normalized.includes("operations")) {
    return {
      pressure: "CRM/Follow-Up/Business Organization",
      service: "Monthly Operations Partnership",
      path: "Keep Client"
    };
  }

  if (normalized.includes("referral")) {
    return {
      pressure: "Referral/No-Capacity Client Opportunity",
      service: "40% Referral Partner Option",
      path: "Refer Client"
    };
  }

  return {
    pressure: "Unclear/Other",
    service: consultationType || "Not Sure Yet",
    path: "Undetermined"
  };
}

function lifecycleRank(status: string): number {
  const exactIndex = relationshipLifecycleStages.indexOf(
    status as (typeof relationshipLifecycleStages)[number]
  );

  if (exactIndex !== -1) return exactIndex;

  const legacyStatusRanks: Record<string, number> = {
    Open: 2,
    Active: 6,
    "Active Client": 6,
    Complete: 8,
    Closed: 8
  };

  return legacyStatusRanks[status] ?? -1;
}

export function preserveAdvancedLifecycle(
  currentStatus: string,
  proposedStatus: string
): string {
  const currentRank = lifecycleRank(currentStatus);
  const proposedRank = lifecycleRank(proposedStatus);

  if (currentRank === -1) return proposedStatus;
  if (proposedRank === -1) return currentStatus;

  return currentRank >= proposedRank ? currentStatus : proposedStatus;
}
