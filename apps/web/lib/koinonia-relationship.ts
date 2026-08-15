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

export type RelationshipQuickCaptureSuggestion = {
  brokerage?: string;
  lifecycle?: string;
  source?: string;
  material?: string;
  primaryPressure?: string;
  path?: string;
  requestedService?: string;
  recommendedService?: string;
  nextAction?: string;
};

export type RelationshipLearningInteraction = {
  capturedAt: string;
  note: string;
  confirmed?: RelationshipQuickCaptureSuggestion;
};

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
  learning?: {
    interactions?: RelationshipLearningInteraction[];
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

function normalizeQuickCaptureSuggestion(value: unknown): RelationshipQuickCaptureSuggestion {
  const source = record(value);

  return {
    brokerage: text(source.brokerage),
    lifecycle: text(source.lifecycle),
    source: text(source.source),
    material: text(source.material),
    primaryPressure: text(source.primaryPressure),
    path: text(source.path),
    requestedService: text(source.requestedService),
    recommendedService: text(source.recommendedService),
    nextAction: text(source.nextAction)
  };
}

function normalizeLearningInteractions(value: unknown): RelationshipLearningInteraction[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const source = record(item);
      const capturedAt = text(source.capturedAt);
      const note = text(source.note);

      if (!capturedAt || !note) return null;

      return {
        capturedAt,
        note,
        confirmed: normalizeQuickCaptureSuggestion(source.confirmed)
      };
    })
    .filter((item): item is RelationshipLearningInteraction => Boolean(item));
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
  const learning = record(source.learning);

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
    },
    learning: {
      ...learning,
      interactions: normalizeLearningInteractions(learning.interactions)
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
    growth: { ...current.growth, ...patch.growth },
    learning: { ...current.learning, ...patch.learning }
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

function containsAny(value: string, terms: string[]): boolean {
  return terms.some((term) => value.includes(term));
}

function serviceForPressure(pressure: string): string {
  const serviceMap: Record<string, string> = {
    "Transaction/File Capacity": "Transaction Support / Contract-to-Close Coordination",
    "Contract/Document Workload": "Contract & Document Support",
    "Showing/Schedule Conflict": "Licensed Showing Coverage",
    "Open House/Listing Capacity": "Professional Open House Coverage",
    "CRM/Follow-Up/Business Organization": "Monthly Operations Partnership",
    "Referral/No-Capacity Client Opportunity": "40% Referral Partner Option"
  };

  return serviceMap[pressure] ?? "";
}

function extractBrokerage(note: string): string {
  const match = note.match(
    /\b(?:from|with|at)\s+([A-Z][A-Za-z0-9&.' -]{1,50}?(?:Realty|Properties|Group|Team|Brokerage|Real Estate))\b/
  );

  return match?.[1]?.trim() ?? "";
}

export function suggestRelationshipQuickCapture(
  note: string
): RelationshipQuickCaptureSuggestion {
  const raw = note.trim();
  const normalized = raw.toLowerCase();
  const suggestion: RelationshipQuickCaptureSuggestion = {};

  if (!raw) return suggestion;

  const brokerage = extractBrokerage(raw);
  if (brokerage) suggestion.brokerage = brokerage;

  if (containsAny(normalized, ["brokerage meeting", "office meeting", "sales meeting", "team meeting"])) {
    suggestion.source = "Brokerage Meeting";
  } else if (containsAny(normalized, ["networking", "realtor event", "association event", "conference"])) {
    suggestion.source = "Realtor Networking/Event";
  } else if (containsAny(normalized, ["introduced me", "introduced by", "direct introduction"])) {
    suggestion.source = "Direct Introduction";
  } else if (containsAny(normalized, ["lender", "title company", "title rep"])) {
    suggestion.source = "Lender/Title Partner";
  } else if (containsAny(normalized, ["website", "site form", "web form"])) {
    suggestion.source = "Website";
  } else if (containsAny(normalized, ["instagram", "facebook", "linkedin", "social media"])) {
    suggestion.source = "Social Media";
  } else if (containsAny(normalized, ["emailed", "email thread", "email reply"])) {
    suggestion.source = "Email";
  } else if (containsAny(normalized, ["met at an open house", "open house visitor", "open house interaction"])) {
    suggestion.source = "Open House Interaction";
  }

  if (containsAny(normalized, ["tri-fold", "trifold", "brochure"])) {
    suggestion.material = "Tri-Fold Brochure";
  } else if (normalized.includes("service guide")) {
    suggestion.material = "Service Guide";
  } else if (normalized.includes("pricing insert")) {
    suggestion.material = "Pricing Insert";
  } else if (normalized.includes("introduction sheet")) {
    suggestion.material = "Brokerage Introduction Sheet";
  } else if (containsAny(normalized, ["digital packet", "introduction packet"])) {
    suggestion.material = "Digital Introduction Packet";
  } else if (normalized.includes("business card")) {
    suggestion.material = "Business Card";
  } else if (normalized.includes("website")) {
    suggestion.material = "Website";
  }

  if (
    containsAny(normalized, [
      "refer the client",
      "refer this client",
      "referral fee",
      "40% referral",
      "can't take the client",
      "cannot take the client",
      "don't want to take",
      "doesn't want to take",
      "no room to take"
    ])
  ) {
    suggestion.primaryPressure = "Referral/No-Capacity Client Opportunity";
  } else if (containsAny(normalized, ["open house", "weekend hosting", "saturdays", "saturday", "sundays", "sunday"])) {
    suggestion.primaryPressure = "Open House/Listing Capacity";
  } else if (containsAny(normalized, ["showing", "showings", "property access", "schedule conflict"])) {
    suggestion.primaryPressure = "Showing/Schedule Conflict";
  } else if (containsAny(normalized, ["offer", "amendment", "addendum", "contract writing", "document prep", "paperwork"])) {
    suggestion.primaryPressure = "Contract/Document Workload";
  } else if (containsAny(normalized, ["under contract", "transaction", "closing", "deadline", "contract-to-close", "file coordination"])) {
    suggestion.primaryPressure = "Transaction/File Capacity";
  } else if (containsAny(normalized, ["crm", "follow-up", "follow up", "pipeline", "business organization", "task cleanup", "backend" ])) {
    suggestion.primaryPressure = "CRM/Follow-Up/Business Organization";
  } else if (containsAny(normalized, ["team operations", "brokerage operations", "office operations"])) {
    suggestion.primaryPressure = "Brokerage/Team Operations";
  }

  if (suggestion.primaryPressure) {
    const service = serviceForPressure(suggestion.primaryPressure);
    if (service) suggestion.recommendedService = service;
    suggestion.path = suggestion.primaryPressure === "Referral/No-Capacity Client Opportunity"
      ? "Refer Client"
      : "Keep Client";

    if (
      service &&
      containsAny(normalized, ["wants", "want to", "asked for", "needs", "need to", "try one", "try a", "interested in"])
    ) {
      suggestion.requestedService = service;
    }
  }

  if (containsAny(normalized, ["testimonial", "referred another", "sent me another", "advocate"])) {
    suggestion.lifecycle = "Advocate";
  } else if (containsAny(normalized, ["closed", "successful closing", "completed delivery", "completed service"])) {
    suggestion.lifecycle = "Successful Delivery";
  } else if (containsAny(normalized, ["started service", "active engagement", "work has started", "engagement began"])) {
    suggestion.lifecycle = "Active Engagement";
  } else if (containsAny(normalized, ["proposal", "quote sent", "pricing sent"])) {
    suggestion.lifecycle = "Proposal";
  } else if (containsAny(normalized, ["consultation", "consult", "meeting scheduled", "call scheduled"])) {
    suggestion.lifecycle = "Consultation";
  } else if (containsAny(normalized, ["wants to try", "interested", "wants more information", "send more information"])) {
    suggestion.lifecycle = "Interest";
  }

  if (suggestion.primaryPressure === "Open House/Listing Capacity" && normalized.includes("next month")) {
    suggestion.nextAction = "Follow up about open house coverage next month";
  } else if (containsAny(normalized, ["schedule a consultation", "schedule consultation", "book a consultation"])) {
    suggestion.nextAction = "Schedule consultation";
  } else if (containsAny(normalized, ["send the service guide", "send service guide"])) {
    suggestion.nextAction = "Send Service Guide";
  } else if (containsAny(normalized, ["follow up", "follow-up", "circle back", "check back"])) {
    suggestion.nextAction = "Follow up on this relationship";
  }

  return suggestion;
}
