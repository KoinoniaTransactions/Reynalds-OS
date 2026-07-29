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

export type ReynaldsBrothersEmailInput = {
  providerMessageId?: string;
  from: string;
  to?: string;
  subject: string;
  receivedAt?: string;
  snippet?: string;
  body?: string;
};

export type ReynaldsBrothersEmailClassification = {
  action: "create_work_item" | "link_to_work_item" | "needs_review";
  confidence: "high" | "medium" | "low";
  matchedWorkItemId?: string;
  matchedWorkItemName?: string;
  suggestedWorkItemName?: string;
  suggestedServiceLine?: string;
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
    body: "Please confirm vac truck availability, disposal documentation, and after photos for Walmart store 450 in Shreveport, LA lower bay pressure washing."
  },
  {
    providerMessageId: "gmail_preview_new_uco_9001",
    from: "projects@walmart.com",
    to: "WMTanks@ReynoldsBrothers.com",
    subject: "New UCO tank replacement request - store 9001",
    receivedAt: "2026-07-29T09:05:00-06:00",
    snippet: "We have a new UCO tank replacement request for store 9001 in Tulsa.",
    body: "New request for a used cooking oil tank replacement at Walmart store 9001 in Tulsa, OK. Please review scope and provide availability."
  },
  {
    providerMessageId: "gmail_preview_multi_store",
    from: "program.manager@walmart.com",
    to: "WMTanks@ReynoldsBrothers.com",
    subject: "New ACC triage requests - stores 331 and 746",
    receivedAt: "2026-07-29T09:45:00-06:00",
    snippet: "Please start ACC triage for stores 331 Sulphur LA and 746 Temple TX.",
    body: "Please start ACC Level 1 triage for Walmart store 331 in Sulphur, LA and store 746 in Temple, TX."
  },
  {
    providerMessageId: "gmail_preview_vendor_quote",
    from: "supplier@example.com",
    to: "ops@reynaldsbrothers.com",
    subject: "Updated alarm material quote",
    receivedAt: "2026-07-29T10:30:00-06:00",
    snippet: "Updated pricing attached for alarm materials. Not sure which site this belongs to.",
    body: "Here is the updated quote for alarm materials. I do not have the site number in this thread."
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
  const customer = inferCustomer(text, email.from);
  const location = findCityState(text);
  const matched = findMatchingWorkItem(text, workItems, storeNumber, workOrderNumber);

  if (storeNumbers.length > 1 && looksLikeNewWork(text)) {
    const suggestedName = buildSuggestedWorkItemName(email, serviceLine, customer, storeNumber);

    return {
      action: "create_work_item",
      confidence: "medium",
      suggestedWorkItemName: suggestedName,
      suggestedServiceLine: serviceLine,
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
    const suggestedName = buildSuggestedWorkItemName(email, serviceLine, customer, storeNumber);

    return {
      action: "create_work_item",
      confidence: serviceLine || storeNumber ? "medium" : "low",
      suggestedWorkItemName: suggestedName,
      suggestedServiceLine: serviceLine,
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
    from: getRequiredString(value.from, "from"),
    to: getOptionalString(value.to),
    subject: getRequiredString(value.subject, "subject"),
    receivedAt: getOptionalString(value.receivedAt),
    snippet: getOptionalString(value.snippet),
    body: getOptionalString(value.body)
  };
}

function findMatchingWorkItem(
  text: string,
  workItems: ReynaldsBrothersWorkItem[],
  storeNumber?: string,
  workOrderNumber?: string
): ReynaldsBrothersWorkItem | undefined {
  return workItems.find((workItem) => {
    const data = getWorkItemData(workItem);
    const haystack = normalizeText(`${workItem.name} ${data.storeNumber ?? ""} ${data.workOrderNumber ?? ""} ${data.siteName ?? ""}`);

    if (workOrderNumber && normalizeText(data.workOrderNumber ?? "") === workOrderNumber) return true;
    if (storeNumber && normalizeText(data.storeNumber ?? "") === storeNumber) return true;

    return text.includes(haystack) && haystack.length > 10;
  });
}

function looksLikeNewWork(text: string): boolean {
  return [
    "new request",
    "new work",
    "want us to complete",
    "please complete",
    "replacement request",
    "service request",
    "triage request",
    "start acc triage",
    "please schedule",
    "scope",
    "availability",
    "site survey"
  ].some((phrase) => text.includes(phrase));
}

function inferServiceLine(text: string): string | undefined {
  if (text.includes("acc") || text.includes("level 1") || text.includes("level 2")) return "ACC";
  if (text.includes("uco") || text.includes("used cooking oil")) return "UCO";
  if (text.includes("pressure wash") || text.includes("lower bay")) return "Pressure Washing";
  if (text.includes("backflow")) return "Backflow";
  if (text.includes("grease interceptor")) return "Grease Interceptor";
  if (text.includes("zurn") || text.includes("alarm")) return "Zurn";
  if (text.includes("plumbing")) return "Plumbing";
  return undefined;
}

function inferCustomer(text: string, from: string): string | undefined {
  if (text.includes("walmart") || from.includes("walmart")) return "Walmart";
  if (text.includes("zurn") || from.includes("zurn")) return "Zurn";
  return undefined;
}

function findStoreNumber(text: string): string | undefined {
  const match = text.match(/(?:store|wm)[-\s]*#?\s*(\d{3,5})/);
  return match?.[1];
}

function findStoreNumbers(text: string): string[] {
  const matches = [...text.matchAll(/(?:store|wm)[-\s]*#?\s*(\d{3,5})/g)];
  return [...new Set(matches.map((match) => match[1]))];
}

function findWorkOrderNumber(text: string): string | undefined {
  const match = text.match(/\b(?:rb-wo|wo|work order)\s*-?\s*([a-z0-9-]+)/);
  return match?.[0] ? normalizeText(match[0]) : undefined;
}

function buildSuggestedWorkItemName(
  email: ReynaldsBrothersEmailInput,
  serviceLine?: string,
  customer?: string,
  storeNumber?: string
): string {
  const location = findCityState(normalizeText(`${email.subject} ${email.snippet ?? ""} ${email.body ?? ""}`));
  const workType = getWorkTypeName(serviceLine);

  if (customer === "Walmart" && storeNumber && location) return `WM-${storeNumber} ${location.city}, ${stateName(location.state)} - ${workType}`;
  if (customer === "Walmart" && storeNumber && serviceLine) return `WM-${storeNumber} - ${workType}`;
  if (customer && storeNumber && serviceLine) return `${customer} ${storeNumber} - ${workType}`;
  if (customer && serviceLine) return `${customer} - ${serviceLine}`;
  if (serviceLine) return `${serviceLine} - ${email.subject}`;
  return email.subject;
}

export function getDefaultWorkItemDataForClassification(classification: ReynaldsBrothersEmailClassification) {
  const serviceLine = classification.suggestedServiceLine;
  const jobType = getWorkTypeName(serviceLine);
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
    workType: jobType,
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

function findCityState(text: string): { city: string; state: string } | undefined {
  const match = text.match(/\bin\s+([a-z][a-z\s.'-]{2,40}),?\s+([a-z]{2})\b/);
  if (!match) return undefined;

  return {
    city: titleCase(match[1].trim()),
    state: match[2].toUpperCase()
  };
}

function buildSuggestedLocation(storeNumber?: string, location?: { city: string; state: string }) {
  if (storeNumber && location) return `WM-${storeNumber} ${location.city}, ${stateName(location.state)}`;
  if (storeNumber) return `Store ${storeNumber}`;
  if (location) return `${location.city}, ${location.state}`;
  return undefined;
}

function stateName(state: string): string {
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

  return states[state.toUpperCase()] ?? state.toUpperCase();
}

function titleCase(value: string): string {
  return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function getSuggestedNextAction(text: string, action: ReynaldsBrothersEmailClassification["action"]): string {
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
