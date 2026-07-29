export const REYNALDS_BROTHERS_WORKSPACE_ID = "wks_reynalds_brothers";
export const REYNALDS_BROTHERS_WORK_ITEM_TYPE = "rb.work_item";

export type ReynaldsBrothersWorkItemData = {
  serviceLine?: string | null;
  customer?: string | null;
  jobType?: string | null;
  approvalStatus?: string | null;
  approvedBy?: string | null;
  storeNumber?: string | null;
  city?: string | null;
  state?: string | null;
  region?: string | null;
  workType?: string | null;
  workOrderNumber?: string | null;
  siteName?: string | null;
  phase?: string | null;
  phaseTrack?: string[];
  crewLead?: string | null;
  crewMembers?: string[];
  equipmentRequired?: string[];
  documentationRequired?: string[];
  readinessRequired?: string[];
  operationalRisks?: string[];
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  poNumber?: string | null;
  poStatus?: string | null;
  poDueDate?: string | null;
  lucernexStatus?: string | null;
  lucernexUrl?: string | null;
  permitStatus?: string | null;
  permitSubmittedDate?: string | null;
  permitApprovedDate?: string | null;
  tankStatus?: string | null;
  tankSupplier?: string | null;
  tankSerialNumbers?: string[];
  oilRemovalStatus?: string | null;
  vacTruckCompany?: string | null;
  disposalFacility?: string | null;
  companyCamUrl?: string | null;
  completionDate?: string | null;
  invoiceStatus?: string | null;
  billingApprovalStatus?: string | null;
  customerUpdateStatus?: string | null;
  mediaStatus?: string | null;
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
  needsApproval: number;
  attention: number;
  triage: number;
  permits: number;
  tanks: number;
  scheduling: number;
  waiting: number;
  invoiceReady: number;
  missingCrew: number;
  missingDocumentation: number;
  redFlags: number;
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

export const reynaldsBrothersOfficeUsers = [
  "Jeremiah Reynalds",
  "Joshua Reynalds",
  "Shay Reynalds",
  "John Nestor",
  "Darren Fielder"
];

export const reynaldsBrothersJobTypes = [
  "ACC Level 1 Triage",
  "ACC Level 2 Triage",
  "ACC Tank Replacement",
  "DIY Only",
  "UCO Tank Replacement",
  "Pressure Washing"
];

export const reynaldsBrothersBoardLanes = [
  "Needs Approval",
  "Triage",
  "Permits",
  "Tanks",
  "Scheduling",
  "Field Work",
  "Billing",
  "Complete"
];

export const reynaldsBrothersLucernexStatuses = [
  "Not Started",
  "Submitted",
  "Waiting Walmart",
  "Approved",
  "Rejected",
  "Needs Update"
];

export const reynaldsBrothersBillingApprovalFlow = [
  "Shay starts billing packet",
  "Jeremiah approval",
  "Darren final approval",
  "Josh visibility"
];

export const accReplacementPhaseTrack = [
  "Needs Approval",
  "Level 1 Triage",
  "Level 2 Triage",
  "Replacement Recommended",
  "Permitting",
  "Tanks Ordered",
  "Tanks Received and Tested",
  "PO Confirmed",
  "Oil Removal Coordinated",
  "Scheduled",
  "Field Work",
  "Completion Review",
  "Billing Review",
  "Paid",
  "Complete"
];

export const ucoPhaseTrack = [
  "Needs Approval",
  "Planning",
  "Permitting",
  "Tank Ordered",
  "Tank Received",
  "PO Confirmed",
  "Oil Removal Coordinated",
  "Scheduled",
  "Field Work",
  "Completion Review",
  "Billing Review",
  "Paid",
  "Complete"
];

export const pressureWashingPhaseTrack = [
  "Needs Approval",
  "Planning",
  "Vac Truck Secured",
  "Disposal Facility Secured",
  "Scheduled",
  "Field Work",
  "Completion Review",
  "Billing Review",
  "Paid",
  "Complete"
];

export const reynaldsBrothersFallbackWorkItems: ReynaldsBrothersWorkItem[] = [
  {
    id: "rb_wi_acc_1590_preview",
    objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
    name: "WM-1590 Hialeah, Florida - ACC Tank Replacement",
    status: "Permitting",
    health: "Critical",
    nextAction: "Confirm final permit approvals, PO status, and coordinated oil removal before scheduling.",
    data: {
      serviceLine: "ACC",
      customer: "Walmart",
      jobType: "ACC Tank Replacement",
      approvalStatus: "Approved",
      storeNumber: "1590",
      city: "Hialeah",
      state: "FL",
      region: "Florida",
      workType: "ACC Tank Replacement",
      workOrderNumber: "247399487",
      siteName: "WM-1590 Hialeah, Florida",
      phase: "Permitting",
      phaseTrack: accReplacementPhaseTrack,
      crewLead: null,
      crewMembers: [],
      equipmentRequired: ["Two 400 gallon bulk oil tanks", "700 gallon waste oil tank", "105 gallon DIY tank", "25 gallon filter crusher tank", "Install tools", "PPE"],
      documentationRequired: ["CompanyCam project link", "Before photos", "After photos", "New tank serial numbers", "Manager name and title", "Completion notes"],
      readinessRequired: ["PO number confirmed", "Tanks ordered", "Tanks received", "New tanks vacuum tested", "Manufacturer recorded", "Serial numbers recorded", "Final permit approvals", "Service Channel notice", "Oil removal coordinated"],
      operationalRisks: ["PO missing red flag", "Permit delay", "Oil removal vendor not coordinated", "Missing CompanyCam photos"],
      poStatus: "Missing",
      poDueDate: "Within 5 business days of approval",
      lucernexStatus: "Waiting Walmart",
      permitStatus: "In Progress",
      tankStatus: "Ordered",
      oilRemovalStatus: "Not Coordinated",
      companyCamUrl: "",
      invoiceStatus: "Not Ready",
      billingApprovalStatus: "Not Started",
      customerUpdateStatus: "Needs Service Channel update",
      mediaStatus: "Before photos required",
      tankSerialNumbers: []
    }
  },
  {
    id: "rb_wi_uco_4672_preview",
    objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
    name: "WM-4672 Montgomery, Alabama - UCO Tank Replacement",
    status: "Tanks",
    health: "Watch",
    nextAction: "Confirm Frontline delivery, permit approval, and PO red flag before scheduling.",
    data: {
      serviceLine: "UCO",
      customer: "Walmart",
      jobType: "UCO Tank Replacement",
      approvalStatus: "Approved",
      storeNumber: "4672",
      city: "Montgomery",
      state: "AL",
      region: "Alabama",
      workType: "Used Cooking Oil Tank Replacement",
      workOrderNumber: "RB-WO-4672-001",
      siteName: "WM-4672 Montgomery, Alabama",
      phase: "Tank Ordered",
      phaseTrack: ucoPhaseTrack,
      crewLead: null,
      crewMembers: [],
      equipmentRequired: ["Frontline UCO tank", "Install tools", "PPE"],
      documentationRequired: ["CompanyCam project link", "Before photos", "Install photos", "New tank serial number", "Manager name and title", "Completion notes"],
      readinessRequired: ["Frontline tank ordered", "Frontline tank received", "Permit approvals complete", "PO number tracked", "Oil removal coordinated"],
      operationalRisks: ["Tank delivery pending", "PO missing red flag", "Permit approval pending"],
      poStatus: "Missing",
      poDueDate: "Within 5 business days of approval",
      lucernexStatus: "Submitted",
      permitStatus: "In Progress",
      tankStatus: "Ordered from Frontline LLC",
      tankSupplier: "Frontline LLC",
      oilRemovalStatus: "Not Coordinated",
      invoiceStatus: "Not Ready",
      billingApprovalStatus: "Not Started",
      customerUpdateStatus: "Scope not confirmed",
      mediaStatus: "No media yet",
      tankSerialNumbers: []
    }
  },
  {
    id: "rb_wi_l1_331_preview",
    objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
    name: "WM-331 Sulphur, Louisiana - ACC Level 1 Triage",
    status: "Triage",
    health: "Attention",
    nextAction: "Call store manager, document findings, then close as wrong asset or advance to Level 2 triage.",
    data: {
      serviceLine: "ACC",
      customer: "Walmart",
      jobType: "ACC Level 1 Triage",
      approvalStatus: "Approved",
      storeNumber: "331",
      city: "Sulphur",
      state: "LA",
      region: "Louisiana",
      workType: "ACC Level 1 Triage",
      workOrderNumber: "357907787",
      siteName: "WM-331 Sulphur, Louisiana",
      phase: "Level 1 Triage",
      phaseTrack: accReplacementPhaseTrack,
      crewLead: null,
      crewMembers: [],
      equipmentRequired: ["Office phone call", "Service Channel notes"],
      documentationRequired: ["Store call record", "Manager name and title", "Triage notes", "Service Channel update"],
      readinessRequired: ["Store called", "Wrong asset decision or Level 2 decision recorded"],
      operationalRisks: ["Level 1 triage overdue", "Store call not recorded"],
      lucernexStatus: "Needs Update",
      permitStatus: "Not Started",
      invoiceStatus: "Not Ready",
      billingApprovalStatus: "Not Started",
      customerUpdateStatus: "Needs Level 1 call",
      mediaStatus: "No media yet",
      poStatus: "Not Required Yet"
    }
  },
  {
    id: "rb_wi_pw_450_preview",
    objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
    name: "WM-450 Shreveport, Louisiana - Pressure Washing",
    status: "Scheduling",
    health: "Attention",
    nextAction: "Secure vac truck company and disposal facility for overnight lower bay work.",
    data: {
      serviceLine: "Pressure Washing",
      customer: "Walmart",
      jobType: "Pressure Washing",
      approvalStatus: "Needs Approval",
      storeNumber: "450",
      city: "Shreveport",
      state: "LA",
      region: "Louisiana",
      workType: "Pressure Washing",
      workOrderNumber: "RB-WO-PW-450",
      siteName: "WM-450 Shreveport, Louisiana",
      phase: "Planning",
      phaseTrack: pressureWashingPhaseTrack,
      crewLead: null,
      crewMembers: [],
      equipmentRequired: ["Hot water pressure washer", "Vac truck", "Surface cleaner", "PPE"],
      documentationRequired: ["CompanyCam project link", "Before photos", "After photos", "Disposal manifest", "Manager name and title", "Completion notes"],
      readinessRequired: ["Vac truck company secured", "Disposal facility secured", "Overnight access window confirmed"],
      operationalRisks: ["Needs human approval", "Vac truck not secured", "Disposal facility not secured"],
      vacTruckCompany: "",
      disposalFacility: "",
      invoiceStatus: "Not Ready",
      billingApprovalStatus: "Not Started",
      customerUpdateStatus: "Needs approval before activation",
      mediaStatus: "No media yet",
      permitStatus: "Not required"
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
  const approvalStatus = String(getWorkItemData(item).approvalStatus ?? "").toLowerCase();

  if (approvalStatus.includes("needs approval") || status.includes("approval")) return "Needs Approval";
  if (status.includes("complete") || status.includes("closed")) return "Complete";
  if (isInvoiceReadyStatus(invoiceStatus)) return "Billing";
  if (status.includes("billing") || phase.includes("billing") || invoiceStatus.includes("invoice")) return "Billing";
  if (status.includes("triage") || phase.includes("triage")) return "Triage";
  if (status.includes("permit") || phase.includes("permit")) return "Permits";
  if (status.includes("tank") || phase.includes("tank")) return "Tanks";
  if (status.includes("sched") || phase.includes("sched") || status.includes("planning") || status.includes("intake")) return "Scheduling";
  return "Field Work";
}

export function getWorkItemMetrics(items: ReynaldsBrothersWorkItem[]): ReynaldsBrothersMetrics {
  return {
    total: items.length,
    active: items.filter((item) => !["Complete", "Closed", "Archived"].includes(item.status)).length,
    needsApproval: items.filter((item) => getWorkItemLane(item) === "Needs Approval").length,
    attention: items.filter((item) => ["Watch", "Attention", "Critical"].includes(item.health)).length,
    triage: items.filter((item) => getWorkItemLane(item) === "Triage").length,
    permits: items.filter((item) => getWorkItemLane(item) === "Permits").length,
    tanks: items.filter((item) => getWorkItemLane(item) === "Tanks").length,
    scheduling: items.filter((item) => getWorkItemLane(item) === "Scheduling").length,
    waiting: items.filter((item) => getWorkItemLane(item) === "Field Work").length,
    invoiceReady: items.filter((item) => isInvoiceReadyStatus(getWorkItemData(item).invoiceStatus)).length,
    missingCrew: items.filter(needsCrew).length,
    missingDocumentation: items.filter(needsDocumentation).length,
    redFlags: items.reduce((count, item) => count + getWorkItemAlerts(item).length, 0)
  };
}

export function isInvoiceReadyStatus(invoiceStatus: unknown): boolean {
  const normalizedStatus = String(invoiceStatus ?? "").trim().toLowerCase();

  return normalizedStatus.includes("ready") && !normalizedStatus.includes("not ready");
}

export function getWorkItemAlerts(item: ReynaldsBrothersWorkItem): string[] {
  const data = getWorkItemData(item);
  const alerts: string[] = [];
  const jobType = String(data.jobType ?? data.serviceLine ?? "");

  if (data.approvalStatus === "Needs Approval") alerts.push("Human approval required before this job becomes active.");
  if (data.poStatus === "Missing") alerts.push("PO missing; alert all office staff after 5 business days.");
  if (data.permitStatus && !["Approved", "Not required", "Not Required"].includes(data.permitStatus)) alerts.push("Permit process is not complete.");
  if ((jobType.includes("ACC") || jobType.includes("UCO")) && !["coordinated", "confirmed"].includes(String(data.oilRemovalStatus ?? "").trim().toLowerCase())) {
    alerts.push("Coordinated oil removal is not confirmed.");
  }
  if ((jobType.includes("ACC") || jobType.includes("UCO")) && !String(data.tankStatus ?? "").toLowerCase().includes("received")) {
    alerts.push("Tank assignment, delivery, or receiving is not complete.");
  }
  if (jobType.includes("Pressure Washing") && !data.vacTruckCompany) alerts.push("Vac truck company is not secured.");
  if (jobType.includes("Pressure Washing") && !data.disposalFacility) alerts.push("Disposal facility is not secured.");
  if (needsDocumentation(item)) alerts.push("Required photos or documents are still missing.");
  if (isInvoiceReadyStatus(data.invoiceStatus) && data.billingApprovalStatus !== "Approved") {
    alerts.push("Billing packet is ready but approval pass-off is not complete.");
  }

  return alerts;
}

export function getPhaseProgress(item: ReynaldsBrothersWorkItem): { currentIndex: number; total: number; percent: number } {
  const data = getWorkItemData(item);
  const phaseTrack = data.phaseTrack ?? [];
  const currentIndex = Math.max(phaseTrack.findIndex((phase) => phase === data.phase), 0);
  const total = phaseTrack.length;
  const percent = total > 1 ? Math.round((currentIndex / (total - 1)) * 100) : 0;

  return { currentIndex, total, percent };
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
    jobType: getOptionalString(sourceData.jobType),
    approvalStatus: getOptionalString(sourceData.approvalStatus),
    approvedBy: getOptionalString(sourceData.approvedBy),
    storeNumber: getOptionalString(sourceData.storeNumber),
    city: getOptionalString(sourceData.city),
    state: getOptionalString(sourceData.state),
    region: getOptionalString(sourceData.region),
    workType: getOptionalString(sourceData.workType),
    workOrderNumber: getOptionalString(sourceData.workOrderNumber),
    siteName: getOptionalString(sourceData.siteName),
    phase: getOptionalString(sourceData.phase),
    phaseTrack: getStringList(sourceData.phaseTrack),
    crewLead: getOptionalString(sourceData.crewLead),
    crewMembers: getStringList(sourceData.crewMembers),
    equipmentRequired: getStringList(sourceData.equipmentRequired),
    documentationRequired: getStringList(sourceData.documentationRequired),
    readinessRequired: getStringList(sourceData.readinessRequired),
    operationalRisks: getStringList(sourceData.operationalRisks),
    scheduledStart: getOptionalString(sourceData.scheduledStart),
    scheduledEnd: getOptionalString(sourceData.scheduledEnd),
    poNumber: getOptionalString(sourceData.poNumber),
    poStatus: getOptionalString(sourceData.poStatus),
    poDueDate: getOptionalString(sourceData.poDueDate),
    lucernexStatus: getOptionalString(sourceData.lucernexStatus),
    lucernexUrl: getOptionalString(sourceData.lucernexUrl),
    permitStatus: getOptionalString(sourceData.permitStatus),
    permitSubmittedDate: getOptionalString(sourceData.permitSubmittedDate),
    permitApprovedDate: getOptionalString(sourceData.permitApprovedDate),
    tankStatus: getOptionalString(sourceData.tankStatus),
    tankSupplier: getOptionalString(sourceData.tankSupplier),
    tankSerialNumbers: getStringList(sourceData.tankSerialNumbers),
    oilRemovalStatus: getOptionalString(sourceData.oilRemovalStatus),
    vacTruckCompany: getOptionalString(sourceData.vacTruckCompany),
    disposalFacility: getOptionalString(sourceData.disposalFacility),
    companyCamUrl: getOptionalString(sourceData.companyCamUrl),
    completionDate: getOptionalString(sourceData.completionDate),
    invoiceStatus: getOptionalString(sourceData.invoiceStatus) ?? "Not Ready",
    billingApprovalStatus: getOptionalString(sourceData.billingApprovalStatus),
    customerUpdateStatus: getOptionalString(sourceData.customerUpdateStatus),
    mediaStatus: getOptionalString(sourceData.mediaStatus)
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
