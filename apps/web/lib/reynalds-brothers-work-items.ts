export const REYNALDS_BROTHERS_WORKSPACE_ID = "wks_reynalds_brothers";
export const REYNALDS_BROTHERS_WORK_ITEM_TYPE = "rb.work_item";

export type ReynaldsBrothersWorkItemData = {
  serviceLine?: string | null;
  customer?: string | null;
  jobType?: string | null;
  approvalStatus?: string | null;
  approvedBy?: string | null;
  approvalDecisionAt?: string | null;
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
  checklistCompleted?: string[];
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
  managerName?: string | null;
  managerTitle?: string | null;
  signatureStatus?: string | null;
  completionDate?: string | null;
  invoiceStatus?: string | null;
  billingApprovalStatus?: string | null;
  customerUpdateStatus?: string | null;
  mediaStatus?: string | null;
  sourceSystem?: string | null;
  sourceReferenceId?: string | null;
  intakeReasons?: string[];
};

export type ReynaldsBrothersChecklistItem = {
  id: string;
  label: string;
  phase: string;
  owner: "Office" | "Field" | "Billing" | "AI";
  requiredBefore: string;
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

export type ReynaldsBrothersRouteBatch = {
  region: string;
  workItems: ReynaldsBrothersWorkItem[];
  readyCount: number;
  blockedCount: number;
  redFlagCount: number;
  nextAction: string;
};

export type ReynaldsBrothersTankInventorySummary = {
  requiredTanks: string[];
  assignedSerials: string[];
  missingSerialCount: number;
  status: "Not applicable" | "Not ordered" | "Ordered" | "Received" | "Ready";
  readyForScheduling: boolean;
  nextAction: string;
};

export type ReynaldsBrothersFieldProofSummary = {
  requiredProofItems: string[];
  completedProofItems: string[];
  missingProofItems: string[];
  companyCamLinked: boolean;
  managerCaptured: boolean;
  completionDateRecorded: boolean;
  readyForBilling: boolean;
  nextAction: string;
};

export type ReynaldsBrothersBillingPassoffSummary = {
  currentOwner: string;
  completedSteps: string[];
  pendingSteps: string[];
  approved: boolean;
  nextAction: string;
};

export type ReynaldsBrothersWorkItemCreateInput = {
  name: string;
  status: string;
  health: string;
  nextAction?: string;
  data: ReynaldsBrothersWorkItemData;
};

export type ReynaldsBrothersTrialImportRecord = {
  rowNumber: number;
  input: ReynaldsBrothersWorkItemCreateInput;
  warnings: string[];
};

export type ReynaldsBrothersTrialImportError = {
  rowNumber: number;
  message: string;
};

export type ReynaldsBrothersTrialImportPreview = {
  records: ReynaldsBrothersTrialImportRecord[];
  errors: ReynaldsBrothersTrialImportError[];
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

export const accTankCatalog = [
  "400 gallon bulk oil tank - 5W-20",
  "400 gallon bulk oil tank - 5W-30",
  "700 gallon waste oil tank",
  "105 gallon DIY tank",
  "25 gallon filter crusher tank"
];

export const ucoTankCatalog = [
  "160 or 315 gallon UCO tank"
];

export const accLevel1Checklist: ReynaldsBrothersChecklistItem[] = [
  { id: "l1_store_called", label: "Store manager called", phase: "Level 1 Triage", owner: "Office", requiredBefore: "Level 1 complete" },
  { id: "l1_manager_recorded", label: "Manager name and title recorded", phase: "Level 1 Triage", owner: "Office", requiredBefore: "Level 1 complete" },
  { id: "l1_scope_decision", label: "Wrong-asset or in-scope decision recorded", phase: "Level 1 Triage", owner: "Office", requiredBefore: "Level 1 complete" },
  { id: "l1_service_channel_note", label: "Service Channel / Walmart update entered", phase: "Level 1 Triage", owner: "Office", requiredBefore: "Level 1 complete" },
  { id: "l1_level2_decision", label: "Level 2 needed decision recorded", phase: "Level 1 Triage", owner: "Office", requiredBefore: "Move to Level 2 or close" }
];

export const accLevel2Checklist: ReynaldsBrothersChecklistItem[] = [
  { id: "l2_companycam_link", label: "CompanyCam project linked", phase: "Level 2 Triage", owner: "Office", requiredBefore: "Field dispatch" },
  { id: "l2_all_tank_photos", label: "Photos captured for all five ACC tanks", phase: "Level 2 Triage", owner: "Field", requiredBefore: "Level 2 complete" },
  { id: "l2_starting_gauges", label: "Starting gauge photos captured for each vacuum test", phase: "Level 2 Triage", owner: "Field", requiredBefore: "Level 2 complete" },
  { id: "l2_ending_gauges", label: "Ending gauge photos captured for each vacuum test", phase: "Level 2 Triage", owner: "Field", requiredBefore: "Level 2 complete" },
  { id: "l2_tank_age_recorded", label: "Tank age recorded for each tank", phase: "Level 2 Triage", owner: "Field", requiredBefore: "Recommendation" },
  { id: "l2_tank_dimensions_recorded", label: "Tank dimensions recorded", phase: "Level 2 Triage", owner: "Field", requiredBefore: "Recommendation" },
  { id: "l2_shop_location_recorded", label: "Tank location in shop recorded", phase: "Level 2 Triage", owner: "Field", requiredBefore: "Recommendation" },
  { id: "l2_interstitial_photos", label: "Interstitial / secondary-space photos captured", phase: "Level 2 Triage", owner: "Field", requiredBefore: "Recommendation" },
  { id: "l2_recommendation_sent", label: "Replacement recommendation sent to Walmart when needed", phase: "Replacement Recommended", owner: "Office", requiredBefore: "ACC replacement" }
];

export const accReplacementChecklist: ReynaldsBrothersChecklistItem[] = [
  { id: "acc_po_confirmed", label: "PO number confirmed or red flag acknowledged", phase: "PO Confirmed", owner: "Office", requiredBefore: "Scheduling" },
  { id: "acc_tanks_ordered", label: "ACC tank set ordered", phase: "Tanks Ordered", owner: "Office", requiredBefore: "Scheduling" },
  { id: "acc_tanks_received", label: "ACC tank set received", phase: "Tanks Received and Tested", owner: "Office", requiredBefore: "Scheduling" },
  { id: "acc_new_tanks_tested", label: "New tanks vacuum tested", phase: "Tanks Received and Tested", owner: "Field", requiredBefore: "Scheduling" },
  { id: "acc_manufacturer_recorded", label: "Tank manufacturer recorded", phase: "Tanks Received and Tested", owner: "Office", requiredBefore: "Completion" },
  { id: "acc_serials_recorded", label: "New tank serial numbers recorded", phase: "Tanks Received and Tested", owner: "Field", requiredBefore: "Completion" },
  { id: "acc_permits_approved", label: "Final permitting authority approvals received", phase: "Permitting", owner: "Office", requiredBefore: "Scheduling" },
  { id: "acc_service_channel_notice", label: "Walmart install notice entered in Service Channel", phase: "Scheduling", owner: "Office", requiredBefore: "Field work" },
  { id: "acc_oil_removal_coordinated", label: "Safety Kleen / LES coordinated oil removal confirmed", phase: "Oil Removal Coordinated", owner: "Office", requiredBefore: "Field work" },
  { id: "acc_companycam_complete", label: "CompanyCam before/after photo set complete", phase: "Completion Review", owner: "Field", requiredBefore: "Billing" },
  { id: "acc_manager_signature", label: "Manager name, title, and signature captured", phase: "Completion Review", owner: "Field", requiredBefore: "Billing" },
  { id: "acc_completion_date", label: "Completion date recorded", phase: "Completion Review", owner: "Office", requiredBefore: "Billing" }
];

export const ucoChecklist: ReynaldsBrothersChecklistItem[] = [
  { id: "uco_po_confirmed", label: "PO number confirmed or red flag acknowledged", phase: "PO Confirmed", owner: "Office", requiredBefore: "Scheduling" },
  { id: "uco_frontline_ordered", label: "Frontline LLC tank ordered", phase: "Tank Ordered", owner: "Office", requiredBefore: "Scheduling" },
  { id: "uco_frontline_received", label: "Frontline LLC tank received", phase: "Tank Received", owner: "Office", requiredBefore: "Scheduling" },
  { id: "uco_permits_approved", label: "Permits and jurisdiction approvals complete", phase: "Permitting", owner: "Office", requiredBefore: "Scheduling" },
  { id: "uco_oil_removal_coordinated", label: "Safety Kleen / LES coordinated oil removal confirmed", phase: "Oil Removal Coordinated", owner: "Office", requiredBefore: "Field work" },
  { id: "uco_serial_recorded", label: "New UCO tank serial number recorded", phase: "Completion Review", owner: "Field", requiredBefore: "Billing" },
  { id: "uco_companycam_complete", label: "CompanyCam install photos complete", phase: "Completion Review", owner: "Field", requiredBefore: "Billing" },
  { id: "uco_manager_signature", label: "Manager name, title, and signature captured", phase: "Completion Review", owner: "Field", requiredBefore: "Billing" },
  { id: "uco_completion_date", label: "Completion date recorded", phase: "Completion Review", owner: "Office", requiredBefore: "Billing" }
];

export const pressureWashingChecklist: ReynaldsBrothersChecklistItem[] = [
  { id: "pw_vac_truck_secured", label: "Vac truck company secured", phase: "Vac Truck Secured", owner: "Office", requiredBefore: "Scheduling" },
  { id: "pw_disposal_facility", label: "Disposal facility arranged", phase: "Disposal Facility Secured", owner: "Office", requiredBefore: "Scheduling" },
  { id: "pw_overnight_access", label: "Overnight access window confirmed", phase: "Scheduled", owner: "Office", requiredBefore: "Field work" },
  { id: "pw_companycam_link", label: "CompanyCam project linked", phase: "Planning", owner: "Office", requiredBefore: "Field dispatch" },
  { id: "pw_before_photos", label: "Before photos captured", phase: "Field Work", owner: "Field", requiredBefore: "Completion" },
  { id: "pw_after_photos", label: "After photos captured", phase: "Completion Review", owner: "Field", requiredBefore: "Billing" },
  { id: "pw_disposal_manifest", label: "Disposal manifest captured", phase: "Completion Review", owner: "Field", requiredBefore: "Billing" },
  { id: "pw_manager_signature", label: "Manager name, title, and signature captured", phase: "Completion Review", owner: "Field", requiredBefore: "Billing" },
  { id: "pw_completion_date", label: "Completion date recorded", phase: "Completion Review", owner: "Office", requiredBefore: "Billing" }
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
      checklistCompleted: ["acc_tanks_ordered"],
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
      checklistCompleted: ["uco_frontline_ordered"],
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
      checklistCompleted: [],
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
      checklistCompleted: [],
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

export function getRouteBatches(items: ReynaldsBrothersWorkItem[]): ReynaldsBrothersRouteBatch[] {
  const groups = new Map<string, ReynaldsBrothersWorkItem[]>();

  items
    .filter((item) => !["Complete", "Closed", "Archived"].includes(item.status))
    .filter((item) => getWorkItemData(item).approvalStatus !== "Needs Approval")
    .forEach((item) => {
      const data = getWorkItemData(item);
      const region = data.region ?? data.state ?? "Region TBD";
      groups.set(region, [...(groups.get(region) ?? []), item]);
    });

  return [...groups.entries()]
    .map(([region, workItems]) => {
      const redFlagCount = workItems.reduce((count, item) => count + getWorkItemAlerts(item).length, 0);
      const blockedCount = workItems.filter((item) => getWorkItemAlerts(item).length > 0).length;
      const readyCount = workItems.length - blockedCount;

      return {
        region,
        workItems,
        readyCount,
        blockedCount,
        redFlagCount,
        nextAction: getRouteBatchNextAction(region, workItems.length, readyCount, blockedCount)
      };
    })
    .sort((first, second) => second.workItems.length - first.workItems.length || first.region.localeCompare(second.region));
}

export function getTankInventorySummary(item: ReynaldsBrothersWorkItem): ReynaldsBrothersTankInventorySummary {
  const data = getWorkItemData(item);
  const jobType = String(data.jobType ?? data.workType ?? data.serviceLine ?? "");
  const assignedSerials = data.tankSerialNumbers ?? [];
  const requiredTanks = getRequiredTanksForJobType(jobType);

  if (requiredTanks.length === 0) {
    return {
      requiredTanks,
      assignedSerials,
      missingSerialCount: 0,
      status: "Not applicable",
      readyForScheduling: true,
      nextAction: "No tank inventory required for this job."
    };
  }

  const normalizedStatus = String(data.tankStatus ?? "").toLowerCase();
  const received = normalizedStatus.includes("received");
  const ordered = normalizedStatus.includes("ordered") || received;
  const missingSerialCount = Math.max(requiredTanks.length - assignedSerials.length, 0);
  const readyForScheduling = received && missingSerialCount === 0;
  const status = readyForScheduling ? "Ready" : received ? "Received" : ordered ? "Ordered" : "Not ordered";

  return {
    requiredTanks,
    assignedSerials,
    missingSerialCount,
    status,
    readyForScheduling,
    nextAction: getTankInventoryNextAction(status, missingSerialCount, requiredTanks.length)
  };
}

export function getFieldProofSummary(item: ReynaldsBrothersWorkItem): ReynaldsBrothersFieldProofSummary {
  const data = getWorkItemData(item);
  const completed = new Set(data.checklistCompleted ?? []);
  const jobType = String(data.jobType ?? data.workType ?? data.serviceLine ?? "");
  const requiredProofItems = getRequiredFieldProofItems(jobType);
  const completedProofItems = requiredProofItems.filter((item) => completed.has(item.id)).map((item) => item.label);
  const missingProofItems = requiredProofItems.filter((item) => !completed.has(item.id)).map((item) => item.label);
  const companyCamLinked = Boolean(data.companyCamUrl);
  const managerCaptured = Boolean(data.managerName && data.managerTitle) || ["Captured", "Complete"].includes(String(data.signatureStatus ?? ""));
  const completionDateRecorded = Boolean(data.completionDate);
  const readyForBilling = missingProofItems.length === 0 && companyCamLinked && managerCaptured && completionDateRecorded;

  return {
    requiredProofItems: requiredProofItems.map((item) => item.label),
    completedProofItems,
    missingProofItems,
    companyCamLinked,
    managerCaptured,
    completionDateRecorded,
    readyForBilling,
    nextAction: getFieldProofNextAction({
      companyCamLinked,
      managerCaptured,
      completionDateRecorded,
      missingProofItems
    })
  };
}

export function getBillingPassoffSummary(item: ReynaldsBrothersWorkItem): ReynaldsBrothersBillingPassoffSummary {
  const data = getWorkItemData(item);
  const status = String(data.billingApprovalStatus ?? "Not Started");
  const invoiceReady = isInvoiceReadyStatus(data.invoiceStatus);
  const stepIndex = getBillingStepIndex(status);
  const approved = status === "Approved";

  if (!invoiceReady && !approved) {
    return {
      currentOwner: "Field / Office",
      completedSteps: [],
      pendingSteps: reynaldsBrothersBillingApprovalFlow,
      approved: false,
      nextAction: "Complete field proof before Shay starts the billing packet."
    };
  }

  return {
    currentOwner: getBillingCurrentOwner(status),
    completedSteps: approved ? reynaldsBrothersBillingApprovalFlow : reynaldsBrothersBillingApprovalFlow.slice(0, stepIndex),
    pendingSteps: approved ? [] : reynaldsBrothersBillingApprovalFlow.slice(stepIndex),
    approved,
    nextAction: getBillingNextAction(status)
  };
}

function getRequiredFieldProofItems(jobType: string): ReynaldsBrothersChecklistItem[] {
  if (jobType.includes("Pressure Washing")) {
    return pressureWashingChecklist.filter((item) => ["pw_before_photos", "pw_after_photos", "pw_disposal_manifest", "pw_manager_signature", "pw_completion_date"].includes(item.id));
  }

  if (jobType.includes("UCO")) {
    return ucoChecklist.filter((item) => ["uco_serial_recorded", "uco_companycam_complete", "uco_manager_signature", "uco_completion_date"].includes(item.id));
  }

  if (jobType.includes("ACC Tank Replacement") || jobType.includes("DIY")) {
    return accReplacementChecklist.filter((item) => ["acc_serials_recorded", "acc_companycam_complete", "acc_manager_signature", "acc_completion_date"].includes(item.id));
  }

  if (jobType.includes("ACC Level 2")) {
    return accLevel2Checklist.filter((item) => ["l2_all_tank_photos", "l2_starting_gauges", "l2_ending_gauges", "l2_interstitial_photos"].includes(item.id));
  }

  return [];
}

function getFieldProofNextAction(input: {
  companyCamLinked: boolean;
  managerCaptured: boolean;
  completionDateRecorded: boolean;
  missingProofItems: string[];
}): string {
  if (!input.companyCamLinked) return "Add the CompanyCam project link before proof review.";
  if (input.missingProofItems.length > 0) return `Complete proof item: ${input.missingProofItems[0]}.`;
  if (!input.managerCaptured) return "Record manager name, title, and signature status.";
  if (!input.completionDateRecorded) return "Record the completion date.";

  return "Field proof is ready for billing review.";
}

function getBillingStepIndex(status: string): number {
  if (status === "Needs Shay Review" || status === "Not Started") return 0;
  if (status === "Needs Jeremiah Approval") return 1;
  if (status === "Needs Darren Final Approval") return 2;
  if (status === "Josh Visibility") return 3;
  if (status === "Approved") return reynaldsBrothersBillingApprovalFlow.length;

  return 0;
}

function getBillingCurrentOwner(status: string): string {
  if (status === "Needs Shay Review" || status === "Not Started") return "Shay Reynalds";
  if (status === "Needs Jeremiah Approval") return "Jeremiah Reynalds";
  if (status === "Needs Darren Final Approval") return "Darren Fielder";
  if (status === "Josh Visibility") return "Joshua Reynalds";
  if (status === "Approved") return "Billing complete";

  return "Office";
}

function getBillingNextAction(status: string): string {
  if (status === "Needs Shay Review" || status === "Not Started") return "Shay prepares the billing packet and sends it to Jeremiah.";
  if (status === "Needs Jeremiah Approval") return "Jeremiah reviews the packet and passes it to Darren.";
  if (status === "Needs Darren Final Approval") return "Darren gives final billing approval.";
  if (status === "Josh Visibility") return "Josh has visibility before final closeout.";
  if (status === "Approved") return "Billing pass-off is approved.";

  return "Confirm the next billing owner.";
}

function getRequiredTanksForJobType(jobType: string): string[] {
  if (jobType.includes("UCO")) return ucoTankCatalog;
  if (jobType.includes("DIY")) return ["105 gallon DIY tank"];
  if (jobType.includes("ACC Tank Replacement")) return accTankCatalog;

  return [];
}

function getTankInventoryNextAction(status: ReynaldsBrothersTankInventorySummary["status"], missingSerialCount: number, requiredCount: number): string {
  if (status === "Not applicable") return "No tank inventory required for this job.";
  if (status === "Not ordered") return `Order ${requiredCount} required tank${requiredCount === 1 ? "" : "s"} before scheduling.`;
  if (status === "Ordered") return "Track delivery, receiving, and vacuum testing before scheduling.";
  if (missingSerialCount > 0) return `Record ${missingSerialCount} missing tank serial number${missingSerialCount === 1 ? "" : "s"}.`;

  return "Tank package is ready for scheduling review.";
}

function getRouteBatchNextAction(region: string, total: number, readyCount: number, blockedCount: number): string {
  if (readyCount >= 2 && blockedCount === 0) return `Schedule ${readyCount} ${region} jobs together.`;
  if (readyCount >= 2) return `Hold ${region} route until ${blockedCount} blocked job${blockedCount === 1 ? "" : "s"} clear.`;
  if (readyCount === 1 && total > 1) return `Clear blockers so this ${region} run can be batched.`;
  if (readyCount === 1) return `Single ${region} job can schedule when crew and route timing are set.`;

  return `Clear blockers before scheduling ${region}.`;
}

export function isInvoiceReadyStatus(invoiceStatus: unknown): boolean {
  const normalizedStatus = String(invoiceStatus ?? "").trim().toLowerCase();

  return normalizedStatus.includes("ready") && !normalizedStatus.includes("not ready");
}

export function getWorkItemAlerts(item: ReynaldsBrothersWorkItem): string[] {
  const data = getWorkItemData(item);
  const alerts: string[] = [];
  const jobType = String(data.jobType ?? data.serviceLine ?? "");
  const openChecklistItems = getOpenChecklistItems(item);
  const completed = new Set(data.checklistCompleted ?? []);

  if (data.approvalStatus === "Needs Approval") alerts.push("Human approval required before this job becomes active.");
  if (data.poStatus === "Missing") alerts.push("PO missing; alert all office staff after 5 business days.");
  if (data.permitStatus && !["Approved", "Not required", "Not Required"].includes(data.permitStatus)) alerts.push("Permit process is not complete.");
  if ((jobType.includes("ACC") || jobType.includes("UCO")) && !["coordinated", "confirmed"].includes(String(data.oilRemovalStatus ?? "").trim().toLowerCase()) && !hasAnyCompleted(completed, ["acc_oil_removal_coordinated", "uco_oil_removal_coordinated"])) {
    alerts.push("Coordinated oil removal is not confirmed.");
  }
  if ((jobType.includes("ACC") || jobType.includes("UCO")) && !String(data.tankStatus ?? "").toLowerCase().includes("received") && !hasAnyCompleted(completed, ["acc_tanks_received", "uco_frontline_received"])) {
    alerts.push("Tank assignment, delivery, or receiving is not complete.");
  }
  if (jobType.includes("Pressure Washing") && !data.vacTruckCompany && !completed.has("pw_vac_truck_secured")) alerts.push("Vac truck company is not secured.");
  if (jobType.includes("Pressure Washing") && !data.disposalFacility && !completed.has("pw_disposal_facility")) alerts.push("Disposal facility is not secured.");
  if (needsDocumentation(item)) alerts.push("Required photos or documents are still missing.");
  if (isInvoiceReadyStatus(data.invoiceStatus) && data.billingApprovalStatus !== "Approved") {
    alerts.push("Billing packet is ready but approval pass-off is not complete.");
  }
  if (openChecklistItems.length > 0) alerts.push(`${openChecklistItems.length} required checklist item${openChecklistItems.length === 1 ? "" : "s"} still open.`);

  return alerts;
}

export function applyChecklistAutomation(
  data: ReynaldsBrothersWorkItemData,
  checklistCompleted: string[]
): ReynaldsBrothersWorkItemData {
  const completed = new Set(checklistCompleted);
  const next: ReynaldsBrothersWorkItemData = {
    ...data,
    checklistCompleted
  };

  if (hasAnyCompleted(completed, ["acc_po_confirmed", "uco_po_confirmed"])) {
    next.poStatus = "Received";
  } else if (next.poStatus === "Received" && !next.poNumber) {
    next.poStatus = next.jobType === "Pressure Washing" ? "Not Required Yet" : "Missing";
  }

  if (hasAnyCompleted(completed, ["acc_permits_approved", "uco_permits_approved"])) {
    next.permitStatus = "Approved";
  } else if (next.permitStatus === "Approved" && !next.permitApprovedDate) {
    next.permitStatus = next.jobType === "Pressure Washing" ? "Not required" : "In Progress";
  }

  if (completed.has("acc_tanks_ordered")) next.tankStatus = "Ordered";
  if (completed.has("acc_tanks_received")) next.tankStatus = "Received";
  if (completed.has("uco_frontline_ordered")) next.tankStatus = "Ordered from Frontline LLC";
  if (completed.has("uco_frontline_received")) next.tankStatus = "Received from Frontline LLC";

  if (hasAnyCompleted(completed, ["acc_oil_removal_coordinated", "uco_oil_removal_coordinated"])) {
    next.oilRemovalStatus = "Coordinated";
  } else if (next.oilRemovalStatus === "Coordinated") {
    next.oilRemovalStatus = "Not Coordinated";
  }

  if (completed.has("pw_vac_truck_secured") && !next.vacTruckCompany) {
    next.vacTruckCompany = "Secured - details pending";
  } else if (!completed.has("pw_vac_truck_secured") && next.vacTruckCompany === "Secured - details pending") {
    next.vacTruckCompany = "";
  }

  if (completed.has("pw_disposal_facility") && !next.disposalFacility) {
    next.disposalFacility = "Secured - details pending";
  } else if (!completed.has("pw_disposal_facility") && next.disposalFacility === "Secured - details pending") {
    next.disposalFacility = "";
  }

  if (hasAnyCompleted(completed, ["acc_companycam_complete", "uco_companycam_complete", "pw_after_photos", "pw_disposal_manifest"])) {
    next.mediaStatus = "Complete";
  } else if (next.mediaStatus === "Complete") {
    next.mediaStatus = "No media yet";
  }

  if (hasAnyCompleted(completed, ["acc_completion_date", "uco_completion_date", "pw_completion_date"]) && !next.completionDate) {
    next.completionDate = "Recorded";
  } else if (!hasAnyCompleted(completed, ["acc_completion_date", "uco_completion_date", "pw_completion_date"]) && next.completionDate === "Recorded") {
    next.completionDate = null;
  }

  if (isReadyForBilling(next)) {
    next.invoiceStatus = "Ready to Invoice";
    next.billingApprovalStatus = !next.billingApprovalStatus || next.billingApprovalStatus === "Not Started"
      ? "Needs Shay Review"
      : next.billingApprovalStatus;
  } else if (next.invoiceStatus === "Ready to Invoice") {
    next.invoiceStatus = "Not Ready";
  }

  next.phase = getAutomatedPhase(next);

  return next;
}

function isReadyForBilling(data: ReynaldsBrothersWorkItemData): boolean {
  const completed = new Set(data.checklistCompleted ?? []);
  const jobType = String(data.jobType ?? "");

  if (jobType.includes("Pressure Washing")) {
    return ["pw_after_photos", "pw_disposal_manifest", "pw_manager_signature", "pw_completion_date"].every((id) => completed.has(id));
  }

  if (jobType.includes("UCO")) {
    return ["uco_serial_recorded", "uco_companycam_complete", "uco_manager_signature", "uco_completion_date"].every((id) => completed.has(id));
  }

  if (jobType.includes("ACC")) {
    return ["acc_serials_recorded", "acc_companycam_complete", "acc_manager_signature", "acc_completion_date"].every((id) => completed.has(id));
  }

  return false;
}

function getAutomatedPhase(data: ReynaldsBrothersWorkItemData): string | null | undefined {
  const completed = new Set(data.checklistCompleted ?? []);
  const currentPhase = data.phase;
  const jobType = String(data.jobType ?? "");

  if (data.invoiceStatus === "Ready to Invoice") return "Billing Review";
  if (jobType.includes("Pressure Washing")) {
    if (completed.has("pw_disposal_facility")) return "Scheduled";
    if (completed.has("pw_vac_truck_secured")) return "Disposal Facility Secured";
  }
  if (jobType.includes("UCO")) {
    if (completed.has("uco_oil_removal_coordinated")) return "Scheduled";
    if (completed.has("uco_po_confirmed")) return "PO Confirmed";
    if (completed.has("uco_frontline_received")) return "Tank Received";
    if (completed.has("uco_frontline_ordered")) return "Tank Ordered";
    if (completed.has("uco_permits_approved")) return "Permitting";
  }
  if (jobType.includes("ACC")) {
    if (completed.has("acc_oil_removal_coordinated")) return "Scheduled";
    if (completed.has("acc_po_confirmed")) return "PO Confirmed";
    if (completed.has("acc_tanks_received")) return "Tanks Received and Tested";
    if (completed.has("acc_tanks_ordered")) return "Tanks Ordered";
    if (completed.has("acc_permits_approved")) return "Permitting";
    if (completed.has("l2_recommendation_sent")) return "Replacement Recommended";
    if (completed.has("l1_level2_decision")) return "Level 2 Triage";
  }

  return currentPhase;
}

function hasAnyCompleted(completed: Set<string>, itemIds: string[]): boolean {
  return itemIds.some((itemId) => completed.has(itemId));
}

export function getWorkItemChecklist(item: ReynaldsBrothersWorkItem): ReynaldsBrothersChecklistItem[] {
  const data = getWorkItemData(item);
  const jobType = String(data.jobType ?? data.workType ?? data.serviceLine ?? "");

  if (jobType.includes("Pressure Washing")) return pressureWashingChecklist;
  if (jobType.includes("UCO")) return ucoChecklist;
  if (jobType.includes("ACC Tank Replacement")) return [...accLevel1Checklist, ...accLevel2Checklist, ...accReplacementChecklist];
  if (jobType.includes("ACC Level 2")) return accLevel2Checklist;
  if (jobType.includes("DIY")) return accReplacementChecklist.filter((item) => item.id.includes("po") || item.id.includes("serial") || item.id.includes("companycam") || item.id.includes("manager") || item.id.includes("completion"));
  if (jobType.includes("ACC")) return accLevel1Checklist;

  return [];
}

export function getPhaseTrackForJobType(jobType: string): string[] {
  if (jobType.includes("Pressure Washing")) return pressureWashingPhaseTrack;
  if (jobType.includes("UCO")) return ucoPhaseTrack;
  if (jobType.includes("ACC") || jobType.includes("DIY")) return accReplacementPhaseTrack;

  return [];
}

export function getActivationPhaseForJobType(jobType?: string | null): string {
  const normalizedJobType = String(jobType ?? "");

  if (normalizedJobType.includes("Pressure Washing")) return "Planning";
  if (normalizedJobType.includes("UCO")) return "Planning";
  if (normalizedJobType.includes("ACC Level 2")) return "Level 2 Triage";
  if (normalizedJobType.includes("ACC Tank Replacement") || normalizedJobType.includes("DIY")) return "Permitting";
  if (normalizedJobType.includes("ACC")) return "Level 1 Triage";

  return "Planning";
}

export function getOpenChecklistItems(item: ReynaldsBrothersWorkItem): ReynaldsBrothersChecklistItem[] {
  const completed = new Set(getWorkItemData(item).checklistCompleted ?? []);

  return getWorkItemChecklist(item).filter((checklistItem) => !completed.has(checklistItem.id));
}

export function getChecklistProgress(item: ReynaldsBrothersWorkItem): { complete: number; total: number; percent: number } {
  const checklist = getWorkItemChecklist(item);
  const completed = new Set(getWorkItemData(item).checklistCompleted ?? []);
  const complete = checklist.filter((item) => completed.has(item.id)).length;
  const total = checklist.length;
  const percent = total > 0 ? Math.round((complete / total) * 100) : 100;

  return { complete, total, percent };
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

export function previewTrialWorkItemImport(input: string): ReynaldsBrothersTrialImportPreview {
  const table = parseDelimitedRows(input);
  if (table.length === 0) return { records: [], errors: [] };

  const [headerRow, ...dataRows] = table;
  const headers = headerRow.map(normalizeImportHeader);
  const records: ReynaldsBrothersTrialImportRecord[] = [];
  const errors: ReynaldsBrothersTrialImportError[] = [];

  dataRows.forEach((row, index) => {
    const rowNumber = index + 2;
    if (row.every((cell) => cell.trim().length === 0)) return;

    const value = getImportRowValue(headers, row);
    const storeNumber = value(["storeNumber", "store", "storeNo", "storeNum", "walmartStore"]);
    const city = value(["city", "locationCity"]);
    const state = value(["state", "st", "locationState"]);
    const importedJobType = normalizeJobType(value(["jobType", "type", "workType", "serviceType", "division"]));
    const serviceLine = value(["serviceLine", "service"]) ?? getServiceLineFromJobType(importedJobType);
    const name = value(["jobTitle", "title", "name", "jobName", "workItem", "projectName"])
      ?? buildWalmartJobName(storeNumber, city, state, importedJobType);

    const missing = [
      !storeNumber ? "store number" : "",
      !city ? "city" : "",
      !state ? "state" : "",
      !name ? "job title" : ""
    ].filter(Boolean);

    if (missing.length > 0) {
      errors.push({
        rowNumber,
        message: `Missing required ${missing.join(", ")}.`
      });
      return;
    }

    const validName = name!;
    const validStoreNumber = storeNumber!;
    const validCity = city!;
    const validState = state!;
    const poNumber = value(["poNumber", "po", "apo", "apoNumber"]);
    const lucernexUrl = value(["lucernexUrl", "lucernexLink", "lucernex"]);
    const permitStatus = value(["permitStatus", "permit", "permits"]);
    const tankStatus = value(["tankStatus", "tanks", "tank"]);
    const approvalStatus = value(["approvalStatus", "approval"]) ?? "Needs Approval";
    const nextAction = value(["nextAction", "next", "action", "notes"])
      ?? "Review imported job details and approve when ready.";

    records.push({
      rowNumber,
      input: {
        name: validName,
        status: "Needs Approval",
        health: "Watch",
        nextAction,
        data: {
          serviceLine,
          customer: value(["customer", "client"]) ?? "Walmart",
          jobType: importedJobType,
          approvalStatus,
          storeNumber: validStoreNumber,
          city: validCity,
          state: validState,
          region: value(["region", "routeRegion"]) ?? validState,
          workType: value(["workType"]) ?? importedJobType,
          workOrderNumber: value(["workOrderNumber", "wo", "workOrder", "serviceChannel", "serviceChannelWo"]),
          siteName: value(["siteName", "site", "storeName"]),
          phase: "Needs Approval",
          phaseTrack: getPhaseTrackForJobType(importedJobType),
          checklistCompleted: [],
          poNumber,
          poStatus: poNumber ? "Received" : importedJobType === "Pressure Washing" ? "Not Required Yet" : "Missing",
          lucernexStatus: lucernexUrl ? "Submitted" : "Not Started",
          lucernexUrl,
          permitStatus: permitStatus ?? (importedJobType === "Pressure Washing" ? "Not required" : "Not Started"),
          tankStatus,
          oilRemovalStatus: value(["oilRemovalStatus", "oilRemoval", "coordinatedVisit"]) ?? "Not Coordinated",
          vacTruckCompany: value(["vacTruckCompany", "vacTruck"]),
          disposalFacility: value(["disposalFacility", "disposal"]),
          companyCamUrl: value(["companyCamUrl", "companyCam", "photos"]),
          completionDate: value(["completionDate", "completeDate", "dateComplete"]),
          invoiceStatus: value(["invoiceStatus", "billingStatus"]) ?? "Not Ready",
          billingApprovalStatus: value(["billingApprovalStatus", "billingApproval"]) ?? "Not Started",
          customerUpdateStatus: "Imported for human approval.",
          mediaStatus: value(["mediaStatus"]) ?? "Needs CompanyCam review",
          sourceSystem: "trial_import",
          sourceReferenceId: `trial_import_row_${rowNumber}`,
          intakeReasons: ["Imported from pasted trial data."]
        }
      },
      warnings: getTrialImportWarnings(importedJobType, poNumber, lucernexUrl)
    });
  });

  return { records, errors };
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
    approvalDecisionAt: getOptionalString(sourceData.approvalDecisionAt),
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
    checklistCompleted: getStringList(sourceData.checklistCompleted),
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
    managerName: getOptionalString(sourceData.managerName),
    managerTitle: getOptionalString(sourceData.managerTitle),
    signatureStatus: getOptionalString(sourceData.signatureStatus),
    completionDate: getOptionalString(sourceData.completionDate),
    invoiceStatus: getOptionalString(sourceData.invoiceStatus) ?? "Not Ready",
    billingApprovalStatus: getOptionalString(sourceData.billingApprovalStatus),
    customerUpdateStatus: getOptionalString(sourceData.customerUpdateStatus),
    mediaStatus: getOptionalString(sourceData.mediaStatus),
    sourceSystem: getOptionalString(sourceData.sourceSystem),
    sourceReferenceId: getOptionalString(sourceData.sourceReferenceId),
    intakeReasons: getStringList(sourceData.intakeReasons)
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

function parseDelimitedRows(input: string): string[][] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const delimiter = trimmed.includes("\t") ? "\t" : ",";
  const rows: string[][] = [];
  let currentCell = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < trimmed.length; index += 1) {
    const char = trimmed[index];
    const next = trimmed[index + 1];

    if (char === "\"" && inQuotes && next === "\"") {
      currentCell += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
      currentCell = "";
      currentRow = [];
      continue;
    }

    currentCell += char;
  }

  currentRow.push(currentCell.trim());
  rows.push(currentRow);

  return rows.filter((row) => row.some((cell) => cell.length > 0));
}

function normalizeImportHeader(input: string): string {
  const compact = input.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  const aliases: Record<string, string> = {
    action: "nextAction",
    apo: "apo",
    aponumber: "apoNumber",
    billingapproval: "billingApproval",
    billingapprovalstatus: "billingApprovalStatus",
    billingstatus: "billingStatus",
    client: "client",
    companycam: "companyCam",
    companycamlink: "companyCamUrl",
    companycamurl: "companyCamUrl",
    completedate: "completeDate",
    completiondate: "completionDate",
    coordinatedvisit: "coordinatedVisit",
    customer: "customer",
    datecomplete: "dateComplete",
    disposal: "disposal",
    disposalfacility: "disposalFacility",
    division: "division",
    job: "jobTitle",
    jobname: "jobName",
    jobtitle: "jobTitle",
    jobtype: "jobType",
    lucernex: "lucernex",
    lucernexlink: "lucernexLink",
    lucernexurl: "lucernexUrl",
    next: "next",
    nextaction: "nextAction",
    notes: "notes",
    permit: "permit",
    permits: "permits",
    permitstatus: "permitStatus",
    photos: "photos",
    po: "po",
    ponumber: "poNumber",
    projectname: "projectName",
    region: "region",
    routeregion: "routeRegion",
    service: "service",
    servicechannel: "serviceChannel",
    servicechannelwo: "serviceChannelWo",
    serviceline: "serviceLine",
    servicetype: "serviceType",
    site: "site",
    sitename: "siteName",
    st: "st",
    state: "state",
    store: "store",
    storename: "storeName",
    storeno: "storeNo",
    storenumber: "storeNumber",
    storenum: "storeNum",
    tank: "tank",
    tanks: "tanks",
    tankstatus: "tankStatus",
    title: "title",
    type: "type",
    vachtruck: "vacTruck",
    vactruck: "vacTruck",
    vactruckcompany: "vacTruckCompany",
    walmartstore: "walmartStore",
    wo: "wo",
    workitem: "workItem",
    workorder: "workOrder",
    workordernumber: "workOrderNumber",
    worktype: "workType"
  };

  return aliases[compact] ?? compact;
}

function getImportRowValue(headers: string[], row: string[]) {
  return (candidates: string[]): string | undefined => {
    for (const candidate of candidates) {
      const index = headers.indexOf(candidate);
      if (index >= 0) {
        const value = row[index]?.trim();
        if (value) return value;
      }
    }

    return undefined;
  };
}

function normalizeJobType(input?: string): string {
  const value = input?.trim();
  if (!value) return "ACC Level 1 Triage";
  const normalized = value.toLowerCase();

  if (normalized.includes("pressure") || normalized === "pw") return "Pressure Washing";
  if (normalized.includes("uco")) return "UCO Tank Replacement";
  if (normalized.includes("diy")) return "DIY Only";
  if (normalized.includes("level 2") || normalized.includes("l2")) return "ACC Level 2 Triage";
  if (normalized.includes("level 1") || normalized.includes("l1") || normalized.includes("triage")) return "ACC Level 1 Triage";
  if (normalized.includes("acc")) return "ACC Tank Replacement";

  return value;
}

function getServiceLineFromJobType(jobType: string): string {
  if (jobType.includes("UCO")) return "UCO";
  if (jobType.includes("Pressure Washing")) return "Pressure Washing";

  return "ACC";
}

function buildWalmartJobName(storeNumber?: string, city?: string, state?: string, jobType?: string): string | undefined {
  if (!storeNumber || !city || !state || !jobType) return undefined;

  return `WM-${storeNumber} ${city}, ${state} - ${jobType}`;
}

function getTrialImportWarnings(jobType: string, poNumber?: string, lucernexUrl?: string): string[] {
  const warnings: string[] = [];

  if (!reynaldsBrothersJobTypes.includes(jobType)) {
    warnings.push("Job type is not one of the current ACC/UCO/PW workflow templates.");
  }

  if (jobType !== "Pressure Washing" && !poNumber) {
    warnings.push("PO is missing and will be red flagged after import.");
  }

  if (!lucernexUrl && jobType !== "Pressure Washing") {
    warnings.push("Lucernex link is missing.");
  }

  return warnings;
}
