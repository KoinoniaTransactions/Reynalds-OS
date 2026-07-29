export const REYNALDS_BROTHERS_WORKSPACE_ID = "wks_reynalds_brothers";
export const REYNALDS_BROTHERS_WORK_ITEM_TYPE = "rb.work_item";

export type ReynaldsBrothersWorkItemData = {
  serviceLine?: string | null;
  customer?: string | null;
  storeNumber?: string | null;
  city?: string | null;
  state?: string | null;
  workType?: string | null;
  workOrderNumber?: string | null;
  siteName?: string | null;
  phase?: string | null;
  crewLead?: string | null;
  crewMembers?: string[];
  equipmentRequired?: string[];
  documentationRequired?: string[];
  operationalRisks?: string[];
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  invoiceStatus?: string | null;
  customerUpdateStatus?: string | null;
  mediaStatus?: string | null;
  permitStatus?: string | null;
};

export type ReynaldsBrothersWorkItem = {
  id: string;
  objectType: string;
  name: string;
  status: string;
  health: string;
  nextAction?: string | null;
  data?: ReynaldsBrothersWorkItemData | null;
};

export type ReynaldsBrothersMetrics = {
  total: number;
  active: number;
  attention: number;
  planning: number;
  waiting: number;
  invoiceReady: number;
  missingCrew: number;
  missingDocumentation: number;
};

export type ReynaldsBrothersWorkItemCreateInput = {
  name: string;
  status: string;
  health: string;
  nextAction?: string;
  data: ReynaldsBrothersWorkItemData;
};

export type ReynaldsBrothersWorkItemUpdateInput = {
  status?: string;
  health?: string;
  nextAction?: string;
  data?: ReynaldsBrothersWorkItemData;
};

export const reynaldsBrothersFallbackWorkItems: ReynaldsBrothersWorkItem[] = [
  {
    id: "rb_wi_acc_1540_preview",
    objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
    name: "WM 1540 - ACC Lower Bay Pressure Washing",
    status: "Planning",
    health: "Watch",
    nextAction: "Confirm crew, equipment, disposal, and completion documentation.",
    data: {
      serviceLine: "Pressure Washing",
      customer: "Walmart",
      storeNumber: "1540",
      city: "South Haven",
      state: "MI",
      workType: "Lower Bay Pressure Washing",
      workOrderNumber: "RB-WO-1540-001",
      siteName: "Walmart 1540",
      phase: "Pre-Job Planning",
      crewLead: "Jeremiah Reynalds",
      crewMembers: ["Gavyn"],
      equipmentRequired: ["Hot water pressure washer", "Vacuum truck", "Surface cleaner", "PPE"],
      documentationRequired: ["Before photos", "After photos", "Disposal manifest", "Completion notes"],
      operationalRisks: ["Disposal coordination", "Water volume control", "Overnight access window"],
      invoiceStatus: "Not Ready",
      customerUpdateStatus: "Needs confirmation email",
      mediaStatus: "Before photos required",
      permitStatus: "Not required"
    }
  },
  {
    id: "rb_wi_uco_4672_preview",
    objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
    name: "WM 4672 - UCO Tank Replacement",
    status: "Intake",
    health: "Healthy",
    nextAction: "Review Walmart project details and confirm scope.",
    data: {
      serviceLine: "UCO",
      customer: "Walmart",
      storeNumber: "4672",
      city: "Montgomery",
      state: "AL",
      workType: "Used Cooking Oil Tank Replacement",
      workOrderNumber: "RB-WO-4672-001",
      siteName: "Walmart 4672",
      phase: "Intake",
      crewLead: null,
      crewMembers: [],
      equipmentRequired: ["UCO tank", "Install tools", "PPE"],
      documentationRequired: ["Scope confirmation", "Before photos", "Install photos", "Completion notes"],
      operationalRisks: ["Scope confirmation pending", "Material availability"],
      invoiceStatus: "Not Ready",
      customerUpdateStatus: "Scope not confirmed",
      mediaStatus: "No media yet",
      permitStatus: "Review needed"
    }
  },
  {
    id: "rb_wi_zurn_alarm_001_preview",
    objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
    name: "Zurn Alarm Installation - Sample Project",
    status: "Open",
    health: "Healthy",
    nextAction: "Confirm site contact and required alarm materials.",
    data: {
      serviceLine: "Zurn",
      customer: "Zurn",
      workType: "Grease Interceptor Alarm Installation",
      workOrderNumber: "RB-WO-ZURN-001",
      siteName: "Zurn Sample Site",
      phase: "Open",
      crewLead: null,
      crewMembers: [],
      equipmentRequired: ["Alarm materials", "Install tools", "PPE"],
      documentationRequired: ["Site contact confirmation", "Material list", "Completion photos"],
      operationalRisks: ["Site contact not confirmed", "Material requirements pending"],
      invoiceStatus: "Not Ready",
      customerUpdateStatus: "Needs site contact",
      mediaStatus: "No media yet",
      permitStatus: "Unknown"
    }
  },
  {
    id: "rb_wi_backflow_221_preview",
    objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
    name: "Backflow Service - Multi-Site Review",
    status: "Waiting on Customer",
    health: "Attention",
    nextAction: "Get site list, access windows, and device counts before scheduling.",
    data: {
      serviceLine: "Backflow",
      customer: "Commercial Client",
      workType: "Backflow testing and documentation",
      workOrderNumber: "RB-WO-BF-221",
      siteName: "Multi-site route",
      phase: "Scope Hold",
      crewLead: null,
      crewMembers: [],
      equipmentRequired: ["Backflow test kit", "Calibration record", "Tablet"],
      documentationRequired: ["Device list", "Test reports", "Customer authorization"],
      operationalRisks: ["Incomplete site list", "Access windows unknown"],
      invoiceStatus: "Blocked",
      customerUpdateStatus: "Waiting on customer details",
      mediaStatus: "Not applicable",
      permitStatus: "Jurisdiction review"
    }
  }
];

export function getWorkItemData(item: ReynaldsBrothersWorkItem): ReynaldsBrothersWorkItemData {
  return item.data ?? {};
}

export function getWorkItemLocation(item: ReynaldsBrothersWorkItem): string {
  const data = getWorkItemData(item);
  const cityState = [data.city, data.state].filter(Boolean).join(", ");

  if (data.storeNumber && cityState) return `Store ${data.storeNumber} - ${cityState}`;
  if (data.storeNumber) return `Store ${data.storeNumber}`;
  return cityState || data.siteName || "Location TBD";
}

export function needsCrew(item: ReynaldsBrothersWorkItem): boolean {
  const data = getWorkItemData(item);
  return !data.crewLead || data.crewLead === "Unassigned";
}

export function needsDocumentation(item: ReynaldsBrothersWorkItem): boolean {
  const data = getWorkItemData(item);
  return (data.documentationRequired ?? []).length > 0 && data.mediaStatus !== "Complete";
}

export function getWorkItemLane(item: ReynaldsBrothersWorkItem): string {
  const status = item.status.toLowerCase();
  const phase = String(getWorkItemData(item).phase ?? "").toLowerCase();
  const invoiceStatus = String(getWorkItemData(item).invoiceStatus ?? "");

  if (status.includes("waiting") || status.includes("hold") || phase.includes("hold")) return "Waiting";
  if (status.includes("complete") || status.includes("closed")) return "Complete";
  if (isInvoiceReadyStatus(invoiceStatus)) return "Billing";
  if (status.includes("planning") || status.includes("intake") || phase.includes("planning")) return "Planning";
  return "Field Work";
}

export function getWorkItemMetrics(items: ReynaldsBrothersWorkItem[]): ReynaldsBrothersMetrics {
  return {
    total: items.length,
    active: items.filter((item) => !["Complete", "Closed", "Archived"].includes(item.status)).length,
    attention: items.filter((item) => ["Watch", "Attention", "Critical"].includes(item.health)).length,
    planning: items.filter((item) => getWorkItemLane(item) === "Planning").length,
    waiting: items.filter((item) => getWorkItemLane(item) === "Waiting").length,
    invoiceReady: items.filter((item) => isInvoiceReadyStatus(getWorkItemData(item).invoiceStatus)).length,
    missingCrew: items.filter(needsCrew).length,
    missingDocumentation: items.filter(needsDocumentation).length
  };
}

export function isInvoiceReadyStatus(invoiceStatus: unknown): boolean {
  const normalizedStatus = String(invoiceStatus ?? "").trim().toLowerCase();

  return normalizedStatus.includes("ready") && !normalizedStatus.includes("not ready");
}

export function validateWorkItemCreate(input: unknown): ReynaldsBrothersWorkItemCreateInput {
  const value = getRequestObject(input);
  const name = getRequiredString(value.name, "name");
  const data = getWorkItemPayloadData(value);

  return {
    name,
    status: getOptionalString(value.status) ?? "Intake",
    health: getOptionalString(value.health) ?? "Healthy",
    nextAction: getOptionalString(value.nextAction),
    data
  };
}

export function validateWorkItemUpdate(input: unknown): ReynaldsBrothersWorkItemUpdateInput {
  const value = getRequestObject(input);
  const update: ReynaldsBrothersWorkItemUpdateInput = {};

  const status = getOptionalString(value.status);
  const health = getOptionalString(value.health);
  const nextAction = getOptionalString(value.nextAction);

  if (status) update.status = status;
  if (health) update.health = health;
  if (nextAction !== undefined) update.nextAction = nextAction;
  if (value.data !== undefined) update.data = getWorkItemPayloadData(value);

  if (Object.keys(update).length === 0) {
    throw new Error("At least one Work Item field is required.");
  }

  return update;
}

function getRequestObject(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Request body must be an object.");
  }

  return input as Record<string, unknown>;
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

function getWorkItemPayloadData(value: Record<string, unknown>): ReynaldsBrothersWorkItemData {
  const sourceData = getRequestObject(value.data ?? {});

  return {
    serviceLine: getOptionalString(sourceData.serviceLine),
    customer: getOptionalString(sourceData.customer),
    storeNumber: getOptionalString(sourceData.storeNumber),
    city: getOptionalString(sourceData.city),
    state: getOptionalString(sourceData.state),
    workType: getOptionalString(sourceData.workType),
    workOrderNumber: getOptionalString(sourceData.workOrderNumber),
    siteName: getOptionalString(sourceData.siteName),
    phase: getOptionalString(sourceData.phase),
    crewLead: getOptionalString(sourceData.crewLead),
    crewMembers: getStringList(sourceData.crewMembers),
    equipmentRequired: getStringList(sourceData.equipmentRequired),
    documentationRequired: getStringList(sourceData.documentationRequired),
    operationalRisks: getStringList(sourceData.operationalRisks),
    scheduledStart: getOptionalString(sourceData.scheduledStart),
    scheduledEnd: getOptionalString(sourceData.scheduledEnd),
    invoiceStatus: getOptionalString(sourceData.invoiceStatus) ?? "Not Ready",
    customerUpdateStatus: getOptionalString(sourceData.customerUpdateStatus),
    mediaStatus: getOptionalString(sourceData.mediaStatus),
    permitStatus: getOptionalString(sourceData.permitStatus)
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
