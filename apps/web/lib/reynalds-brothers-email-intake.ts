import {
  REYNALDS_BROTHERS_WORK_ITEM_TYPE,
  accReplacementPhaseTrack,
  getWorkItemData,
  getWorkItemLocation,
  pressureWashingPhaseTrack,
  ucoPhaseTrack,
  type ReynaldsBrothersWorkItem
} from "./reynalds-brothers-work-items";

export const REYNALDS_BROTHERS_COMMUNICATION_TYPE = "rb.communication";
export const REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL = "wmtanks";
export const REYNALDS_BROTHERS_GMAIL_LABEL_NAME = "WalMart Tanks";

export type ReynaldsBrothersEmailInput = {
  providerMessageId?: string;
  providerThreadId?: string;
  sourceUrl?: string;
  from: string;
  to?: string;
  subject: string;
  receivedAt?: string;
  snippet?: string;
  body?: string;
  sourceLabel?: string;
  attachments?: string[];
};

export type ReynaldsBrothersEmailClassification = {
  action: "create_work_item" | "link_to_work_item" | "needs_review";
  confidence: "high" | "medium" | "low";
  matchedWorkItemId?: string;
  matchedWorkItemName?: string;
  suggestedWorkItemName?: string;
  suggestedServiceLine?: string;
  suggestedWorkType?: string;
  suggestedCustomer?: string;
  suggestedLocation?: string;
  suggestedCity?: string;
  suggestedState?: string;
  suggestedStoreNumber?: string;
  suggestedNextAction: string;
  requiresApproval?: boolean;
  multiStoreFlag?: boolean;
  extractedStoreNumbers?: string[];
  reasons: string[];
};

export type ReynaldsBrothersEmailCandidate = ReynaldsBrothersEmailInput & {
  id: string;
  classification: ReynaldsBrothersEmailClassification;
};

export const reynaldsBrothersFallbackEmails: ReynaldsBrothersEmailInput[] = [
  {
    providerMessageId: "gmail_preview_wm1540_001",
    from: "facility.coordinator@walmart.com",
    to: "WMTanks@ReynoldsBrothers.com",
    subject: "WM 450 - lower bay pressure washing schedule",
    receivedAt: "2026-07-29T08:15:00-06:00",
    snippet: "Can you confirm vac truck availability and disposal documentation for store 450?",
    body: "Please confirm vac truck availability, disposal documentation, and after photos for Walmart store 450 in Shreveport, LA lower bay pressure washing.",
    sourceLabel: REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL
  },
  {
    providerMessageId: "gmail_preview_new_uco_9001",
    from: "projects@walmart.com",
    to: "WMTanks@ReynoldsBrothers.com",
    subject: "New UCO tank replacement request - store 9001",
    receivedAt: "2026-07-29T09:05:00-06:00",
    snippet: "We have a new UCO tank replacement request for store 9001 in Tulsa.",
    body: "New request for a used cooking oil tank replacement at Walmart store 9001 in Tulsa, OK. Please review scope and provide availability.",
    sourceLabel: REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL
  },
  {
    providerMessageId: "gmail_preview_multi_store",
    from: "program.manager@walmart.com",
    to: "WMTanks@ReynoldsBrothers.com",
    subject: "New ACC triage requests - stores 331 and 746",
    receivedAt: "2026-07-29T09:45:00-06:00",
    snippet: "Please start ACC triage for stores 331 Sulphur LA and 746 Temple TX.",
    body: "Please start ACC Level 1 triage for Walmart store 331 in Sulphur, LA and store 746 in Temple, TX.",
    sourceLabel: REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL
  },
  {
    providerMessageId: "gmail_preview_vendor_quote",
    from: "supplier@example.com",
    to: "ops@reynaldsbrothers.com",
    subject: "Updated alarm material quote",
    receivedAt: "2026-07-29T10:30:00-06:00",
    snippet: "Updated pricing attached for alarm materials. Not sure which site this belongs to.",
    body: "Here is the updated quote for alarm materials. I do not have the site number in this thread.",
    sourceLabel: REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL
  }
];

export function classifyEmailForWorkItem(
  email: ReynaldsBrothersEmailInput,
  workItems: ReynaldsBrothersWorkItem[]
): ReynaldsBrothersEmailClassification {
  const text = normalizeText(`${email.subject} ${email.snippet ?? ""} ${email.body ?? ""}`);
  const storeNumber = findStoreNumber(text);
  const storeNumbers = findStoreNumbers(text);
  const workOrderNumber = findWorkOrderNumber(text);
  const serviceLine = inferServiceLine(text);
  const workType = inferWorkType(text, serviceLine);
  const customer = inferCustomer(text, email.from);
  const location = findCityState(text);
  const matched = findMatchingWorkItem(text, workItems, storeNumber, workOrderNumber);

  if (storeNumbers.length > 1 && looksLikeNewWork(text)) {
    const suggestedName = buildSuggestedWorkItemName(email, serviceLine, workType, customer, storeNumber);

    return {
      action: "create_work_item",
      confidence: "medium",
      suggestedWorkItemName: suggestedName,
      suggestedServiceLine: serviceLine,
      suggestedWorkType: workType,
      suggestedCustomer: customer,
      suggestedLocation: buildSuggestedLocation(storeNumber, location),
      suggestedCity: location?.city,
      suggestedState: location?.state,
      suggestedStoreNumber: storeNumber,
      suggestedNextAction: "Create separate Needs Approval jobs for each store and review the split before activation.",
      requiresApproval: true,
      multiStoreFlag: true,
      extractedStoreNumbers: storeNumbers,
      reasons: [
        "Email appears to describe new work for multiple stores.",
        "Each generated job requires human approval before it becomes active."
      ]
    };
  }

  if (matched) {
    return {
      action: "link_to_work_item",
      confidence: storeNumber || workOrderNumber ? "high" : "medium",
      matchedWorkItemId: matched.id,
      matchedWorkItemName: matched.name,
      suggestedServiceLine: getWorkItemData(matched).serviceLine ?? serviceLine,
      suggestedWorkType: getWorkItemData(matched).workType ?? getWorkItemData(matched).jobType ?? workType,
      suggestedCustomer: getWorkItemData(matched).customer ?? customer,
      suggestedLocation: getWorkItemLocation(matched),
      suggestedStoreNumber: storeNumber,
      suggestedNextAction: getSuggestedNextAction(text, "link_to_work_item"),
      multiStoreFlag: storeNumbers.length > 1,
      extractedStoreNumbers: storeNumbers,
      reasons: [
        storeNumber ? `Matched store ${storeNumber}.` : "Matched existing work item language.",
        "Email should be filed under the existing Work Item timeline.",
        ...(storeNumbers.length > 1 ? ["Multiple stores were detected; office review is required."] : [])
      ]
    };
  }

  if (looksLikeNewWork(text)) {
    const suggestedName = buildSuggestedWorkItemName(email, serviceLine, workType, customer, storeNumber);

    return {
      action: "create_work_item",
      confidence: serviceLine || storeNumber ? "medium" : "low",
      suggestedWorkItemName: suggestedName,
      suggestedServiceLine: serviceLine,
      suggestedWorkType: workType,
      suggestedCustomer: customer,
      suggestedLocation: buildSuggestedLocation(storeNumber, location),
      suggestedCity: location?.city,
      suggestedState: location?.state,
      suggestedStoreNumber: storeNumber,
      suggestedNextAction: getSuggestedNextAction(text, "create_work_item"),
      requiresApproval: true,
      multiStoreFlag: storeNumbers.length > 1,
      extractedStoreNumbers: storeNumbers,
      reasons: [
        "Email appears to describe new work.",
        "No existing Work Item match was found.",
        "AI-created jobs enter the Needs Approval lane until an authorized office user approves them.",
        ...(storeNumbers.length > 1 ? ["Multiple stores were detected; each generated job requires human approval."] : [])
      ]
    };
  }

  return {
    action: "needs_review",
    confidence: "low",
    suggestedServiceLine: serviceLine,
    suggestedWorkType: workType,
    suggestedCustomer: customer,
    suggestedStoreNumber: storeNumber,
    suggestedNextAction: "Review email and choose a Work Item before filing.",
    requiresApproval: true,
    multiStoreFlag: storeNumbers.length > 1,
    extractedStoreNumbers: storeNumbers,
    reasons: [
      "No confident Work Item match.",
      "Email does not clearly define a new job."
    ]
  };
}

export function buildEmailCandidates(
  emails: ReynaldsBrothersEmailInput[],
  workItems: ReynaldsBrothersWorkItem[]
): ReynaldsBrothersEmailCandidate[] {
  return emails.map((email, index) => ({
    ...email,
    id: email.providerMessageId ?? `rb_email_candidate_${index + 1}`,
    classification: classifyEmailForWorkItem(email, workItems)
  }));
}

export function validateEmailIntake(input: unknown): ReynaldsBrothersEmailInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Request body must be an object.");
  }

  const value = input as Record<string, unknown>;

  return {
    providerMessageId: getOptionalString(value.providerMessageId),
    providerThreadId: getOptionalString(value.providerThreadId),
    sourceUrl: getOptionalString(value.sourceUrl),
    from: getRequiredString(value.from, "from"),
    to: getOptionalString(value.to),
    subject: getRequiredString(value.subject, "subject"),
    receivedAt: getOptionalString(value.receivedAt),
    snippet: getOptionalString(value.snippet),
    body: getOptionalString(value.body),
    sourceLabel: getOptionalString(value.sourceLabel) ?? REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL,
    attachments: getStringList(value.attachments)
  };
}

function getStringList(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof input !== "string") return [];

  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function findMatchingWorkItem(
  text: string,
  workItems: ReynaldsBrothersWorkItem[],
  storeNumber?: string,
  workOrderNumber?: string
): ReynaldsBrothersWorkItem | undefined {
  if (workOrderNumber) {
    const workOrderMatches = workItems.filter((workItem) =>
      normalizeText(getWorkItemData(workItem).workOrderNumber ?? "") === workOrderNumber
    );
    if (workOrderMatches.length === 1) return workOrderMatches[0];
  }

  if (storeNumber) {
    const storeMatches = workItems.filter((workItem) =>
      normalizeText(getWorkItemData(workItem).storeNumber ?? "") === storeNumber
    );

    if (storeMatches.length === 1) return storeMatches[0];

    if (storeMatches.length > 1) {
      const languageMatches = storeMatches.filter((workItem) => {
        const data = getWorkItemData(workItem);
        const descriptors = [
          data.workOrderNumber,
          data.workType,
          data.jobType,
          data.siteName
        ]
          .map((value) => normalizeText(String(value ?? "")))
          .filter((value) => value.length >= 4);

        return descriptors.some((descriptor) => text.includes(descriptor));
      });

      if (languageMatches.length === 1) return languageMatches[0];
      return undefined;
    }
  }

  const languageMatches = workItems.filter((workItem) => {
    const data = getWorkItemData(workItem);
    const haystack = normalizeText(`${workItem.name} ${data.workOrderNumber ?? ""} ${data.siteName ?? ""}`);
    return haystack.length > 10 && text.includes(haystack);
  });

  return languageMatches.length === 1 ? languageMatches[0] : undefined;
}

function looksLikeNewWork(text: string): boolean {
  return [
    "new request",
    "new work",
    "new work order note",
    "work order note",
    "want us to complete",
    "please complete",
    "work completion",
    "replacement request",
    "service request",
    "triage request",
    "tank triage",
    "start acc triage",
    "please schedule",
    "tracking information",
    "order has shipped",
    "scope",
    "availability",
    "site survey"
  ].some((phrase) => text.includes(phrase));
}

function inferServiceLine(text: string): string | undefined {
  if (text.includes("uco") || text.includes("used cooking oil")) return "UCO";
  if (text.includes("pressure wash") || text.includes("lower bay")) return "Pressure Washing";
  if (text.includes("acc") || text.includes("level 1") || text.includes("level 2") || text.includes("tank triage")) return "ACC";
  if (text.includes("backflow")) return "Backflow";
  if (text.includes("grease interceptor")) return "Grease Interceptor";
  if (text.includes("zurn") || text.includes("alarm")) return "Zurn";
  if (text.includes("plumbing")) return "Plumbing";
  return undefined;
}

function inferWorkType(text: string, serviceLine?: string): string | undefined {
  if (text.includes("work completion")) {
    if (text.includes("acc") && text.includes("uco")) return "ACC UCO Work Completion";
    if (serviceLine === "UCO") return "UCO Work Completion";
    if (serviceLine === "ACC") return "ACC Work Completion";
    return "Work Completion";
  }

  if (text.includes("tank triage") || text.includes("level 2")) return "ACC Level 2 Triage";
  if (text.includes("level 1")) return "ACC Level 1 Triage";
  if (text.includes("tank replacement") || text.includes("replacement request")) {
    if (serviceLine === "UCO") return "UCO Tank Replacement";
    if (serviceLine === "ACC") return "ACC Tank Replacement";
  }
  if (serviceLine === "Pressure Washing") return "Pressure Washing";
  if (serviceLine === "UCO") return "UCO Tank Replacement";
  if (serviceLine === "ACC") return "ACC Level 1 Triage";
  return serviceLine;
}

function inferCustomer(text: string, from: string): string | undefined {
  if (text.includes("walmart") || from.includes("walmart")) return "Walmart";
  if (text.includes("zurn") || from.includes("zurn")) return "Zurn";
  return undefined;
}

function findStoreNumber(text: string): string | undefined {
  const match = text.match(/(?:store\/club|store#?|store|wm|location id)[:\-\s#]*(\d{3,5})/);
  return match?.[1];
}

function findStoreNumbers(text: string): string[] {
  const matches = [...text.matchAll(/(?:store\/club|store#?|store|wm|location id)[:\-\s#]*(\d{3,5})/g)];
  return [...new Set(matches.map((match) => match[1]))];
}

function findWorkOrderNumber(text: string): string | undefined {
  const explicit = text.match(/\b(?:rb-wo|wo|work order|tracking number)\s*[:#-]?\s*([a-z0-9-]{5,})/);
  if (explicit?.[1]) return normalizeText(explicit[1]);

  const lxRetail = text.match(/\b(\d{3,5}\.\d{3,5})\b/);
  if (lxRetail?.[1]) return lxRetail[1];

  const piped = text.match(/\|\s*(\d{7,12})\s*\|/);
  return piped?.[1];
}

function buildSuggestedWorkItemName(
  email: ReynaldsBrothersEmailInput,
  serviceLine?: string,
  suggestedWorkType?: string,
  customer?: string,
  storeNumber?: string
): string {
  const location = findCityState(normalizeText(`${email.subject} ${email.snippet ?? ""} ${email.body ?? ""}`));
  const workType = suggestedWorkType ?? getWorkTypeName(serviceLine);

  if (customer === "Walmart" && storeNumber && location) return `WM-${storeNumber} ${location.city}, ${stateName(location.state)} - ${workType}`;
  if (customer === "Walmart" && storeNumber && workType) return `WM-${storeNumber} - ${workType}`;
  if (customer && storeNumber && workType) return `${customer} ${storeNumber} - ${workType}`;
  if (customer && workType) return `${customer} - ${workType}`;
  if (workType) return `${workType} - ${email.subject}`;
  return email.subject;
}

export function getDefaultWorkItemDataForClassification(classification: ReynaldsBrothersEmailClassification) {
  const serviceLine = classification.suggestedServiceLine;
  const jobType = getWorkflowJobType(classification.suggestedWorkType, serviceLine);
  const workType = classification.suggestedWorkType ?? jobType;
  const phaseTrack = serviceLine === "UCO"
    ? ucoPhaseTrack
    : serviceLine === "Pressure Washing"
      ? pressureWashingPhaseTrack
      : accReplacementPhaseTrack;

  return {
    sourceSystem: "email",
    serviceLine,
    customer: classification.suggestedCustomer,
    jobType,
    approvalStatus: "Needs Approval",
    storeNumber: classification.suggestedStoreNumber,
    city: classification.suggestedCity,
    state: classification.suggestedState,
    siteName: classification.suggestedLocation,
    workType,
    phase: "Needs Approval",
    phaseTrack,
    poStatus: serviceLine === "Pressure Washing" ? "Not Required Yet" : "Missing",
    poDueDate: serviceLine === "Pressure Washing" ? undefined : "Within 5 business days of approval",
    lucernexStatus: "Not Started",
    permitStatus: serviceLine === "Pressure Washing" ? "Not required" : "Not Started",
    tankStatus: serviceLine === "UCO" ? "Not Ordered" : serviceLine === "ACC" ? "Not Ordered" : undefined,
    tankSupplier: serviceLine === "UCO" ? "Frontline LLC" : undefined,
    oilRemovalStatus: serviceLine === "Pressure Washing" ? undefined : "Not Coordinated",
    invoiceStatus: "Not Ready",
    billingApprovalStatus: "Not Started",
    mediaStatus: "No media yet",
    customerUpdateStatus: "Email received; human approval required."
  };
}

function getWorkTypeName(serviceLine?: string): string {
  if (serviceLine === "ACC") return "ACC Level 1 Triage";
  if (serviceLine === "UCO") return "UCO Tank Replacement";
  if (serviceLine === "Pressure Washing") return "Pressure Washing";
  return serviceLine ?? "Work Item";
}

function getWorkflowJobType(suggestedWorkType?: string, serviceLine?: string): string {
  if (suggestedWorkType === "ACC Level 2 Triage") return suggestedWorkType;
  if (suggestedWorkType === "ACC Level 1 Triage") return suggestedWorkType;
  if (suggestedWorkType === "ACC Tank Replacement") return suggestedWorkType;
  if (suggestedWorkType === "UCO Tank Replacement") return suggestedWorkType;
  if (suggestedWorkType === "Pressure Washing") return suggestedWorkType;
  return getWorkTypeName(serviceLine);
}

function findCityState(text: string): { city: string; state: string } | undefined {
  const patterns = [
    /location id:\s*\d+\s*\|\s*([a-z][a-z\s.'-]{2,40})\s*\|\s*([a-z]{2})\b/,
    /city\/state\s*[:\-]?\s*([a-z][a-z\s.'-]{2,40}?),?\s+([a-z]{2}|[a-z\s]{4,24})(?=\s+(?:store\/club|store|completion|start|date|tech|$))/,
    /wm\s+\d{3,5}\s+([a-z][a-z\s.'-]{2,40}?)\s+state:\s+([a-z\s]{2,24}?)(?=,|\s+(?:auto|acc|uco|tank|$))/,
    /\b(?:city|location)\s*[:\-]\s*([a-z][a-z\s.'-]{2,40}?)\s+(?:state\s*[:\-]\s*)?([a-z]{2})\b/,
    /\b(?:in|at)\s+([a-z][a-z\s.'-]{2,40}?),\s*([a-z]{2})\b/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    const state = normalizeState(match[2]);
    if (!isValidState(state)) continue;

    return {
      city: titleCase(match[1].trim()),
      state
    };
  }

  return undefined;
}

function buildSuggestedLocation(storeNumber?: string, location?: { city: string; state: string }) {
  if (storeNumber && location) return `WM-${storeNumber} ${location.city}, ${stateName(location.state)}`;
  if (storeNumber) return `Store ${storeNumber}`;
  if (location) return `${location.city}, ${location.state}`;
  return undefined;
}

function stateName(state: string): string {
  const normalized = normalizeState(state);
  const states: Record<string, string> = {
    AL: "Alabama",
    AR: "Arkansas",
    FL: "Florida",
    GA: "Georgia",
    LA: "Louisiana",
    MS: "Mississippi",
    NC: "North Carolina",
    OK: "Oklahoma",
    SC: "South Carolina",
    TN: "Tennessee",
    TX: "Texas"
  };

  return states[normalized] ?? titleCase(normalized.toLowerCase());
}

function normalizeState(state: string): string {
  const value = state.trim().toLowerCase().replace(/\s+/g, " ");
  const stateNames: Record<string, string> = {
    alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
    colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
    hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
    kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
    massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS", missouri: "MO",
    montana: "MT", nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
    "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND", ohio: "OH",
    oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
    "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
    virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI", wyoming: "WY",
    "district of columbia": "DC"
  };

  if (stateNames[value]) return stateNames[value];
  if (value.length === 2) return value.toUpperCase();
  return titleCase(value);
}

function isValidState(state: string): boolean {
  return new Set([
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA",
    "ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK",
    "OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
  ]).has(state);
}

function titleCase(value: string): string {
  return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function getSuggestedNextAction(text: string, action: ReynaldsBrothersEmailClassification["action"]): string {
  if (text.includes("work completion") || text.includes("completion date")) return "File completion proof and verify billing, photos, signatures, and closeout fields.";
  if (text.includes("tracking information") || text.includes("order has shipped")) return "File tracking information and update tank delivery status.";
  if (text.includes("invoice")) return "File vendor invoice and match it to the correct tank order or job.";
  if (text.includes("photos")) return "Confirm required photos and completion documentation.";
  if (text.includes("availability")) return "Confirm availability and planning requirements.";
  if (text.includes("quote")) return "Review quote and file it under the correct Work Item.";
  if (text.includes("schedule")) return "Confirm schedule, access window, and crew readiness.";
  if (action === "create_work_item") return "Review email, confirm scope, and create planning checklist.";
  return "File email and update the Work Item next action.";
}

function getRequiredString(input: unknown, fieldName: string): string {
  const value = getOptionalString(input);

  if (!value) {
    throw new Error(`${fieldName} is required.`);
  }

  return value;
}

function getOptionalString(input: unknown): string | undefined {
  if (typeof input !== "string") return undefined;
  const value = input.trim();
  return value.length > 0 ? value : undefined;
}

function normalizeText(input: string): string {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}
