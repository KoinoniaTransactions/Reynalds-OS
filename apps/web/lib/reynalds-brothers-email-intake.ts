import {
  REYNALDS_BROTHERS_WORK_ITEM_TYPE,
  getWorkItemData,
  getWorkItemLocation,
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
  suggestedNextAction: string;
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
    to: "ops@reynaldsbrothers.com",
    subject: "WM 1540 - lower bay pressure washing schedule",
    receivedAt: "2026-07-29T08:15:00-06:00",
    snippet: "Can you confirm crew availability and disposal documentation for store 1540?",
    body: "Please confirm crew availability, equipment, disposal documentation, and after photos for Walmart store 1540 lower bay pressure washing."
  },
  {
    providerMessageId: "gmail_preview_new_uco_9001",
    from: "projects@walmart.com",
    to: "ops@reynaldsbrothers.com",
    subject: "New UCO tank replacement request - store 9001",
    receivedAt: "2026-07-29T09:05:00-06:00",
    snippet: "We have a new UCO tank replacement request for store 9001 in Tulsa.",
    body: "New request for a used cooking oil tank replacement at Walmart store 9001 in Tulsa, OK. Please review scope and provide availability."
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
  const workOrderNumber = findWorkOrderNumber(text);
  const serviceLine = inferServiceLine(text);
  const customer = inferCustomer(text, email.from);
  const matched = findMatchingWorkItem(text, workItems, storeNumber, workOrderNumber);

  if (matched) {
    return {
      action: "link_to_work_item",
      confidence: storeNumber || workOrderNumber ? "high" : "medium",
      matchedWorkItemId: matched.id,
      matchedWorkItemName: matched.name,
      suggestedServiceLine: getWorkItemData(matched).serviceLine ?? serviceLine,
      suggestedCustomer: getWorkItemData(matched).customer ?? customer,
      suggestedLocation: getWorkItemLocation(matched),
      suggestedNextAction: getSuggestedNextAction(text, "link_to_work_item"),
      reasons: [
        storeNumber ? `Matched store ${storeNumber}.` : "Matched existing work item language.",
        "Email should be filed under the existing Work Item timeline."
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
      suggestedLocation: storeNumber ? `Store ${storeNumber}` : undefined,
      suggestedNextAction: getSuggestedNextAction(text, "create_work_item"),
      reasons: [
        "Email appears to describe new work.",
        "No existing Work Item match was found."
      ]
    };
  }

  return {
    action: "needs_review",
    confidence: "low",
    suggestedServiceLine: serviceLine,
    suggestedCustomer: customer,
    suggestedNextAction: "Review email and choose a Work Item before filing.",
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
    "replacement request",
    "service request",
    "please schedule",
    "scope",
    "availability",
    "site survey"
  ].some((phrase) => text.includes(phrase));
}

function inferServiceLine(text: string): string | undefined {
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
  const match = text.match(/(?:store|wm)\s*#?\s*(\d{3,5})/);
  return match?.[1];
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
  if (customer && storeNumber && serviceLine) return `${customer} ${storeNumber} - ${serviceLine}`;
  if (customer && serviceLine) return `${customer} - ${serviceLine}`;
  if (serviceLine) return `${serviceLine} - ${email.subject}`;
  return email.subject;
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
