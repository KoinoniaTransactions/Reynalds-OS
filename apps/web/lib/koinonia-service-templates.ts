export type KoinoniaBillingModel =
  | "prepaid"
  | "pay_at_close"
  | "per_request"
  | "monthly"
  | "custom";

export type KoinoniaStaffRole =
  | "Operations"
  | "Transaction Coordinator"
  | "Contract Support"
  | "Showing Provider"
  | "Customer Success"
  | "Finance";

export type KoinoniaServiceTemplate = {
  billingModel: KoinoniaBillingModel;
  clientPortalSections: string[];
  defaultWorkType: string;
  documentRequests: string[];
  employeePortalQueues: string[];
  id: string;
  intakeFields: string[];
  packageNames: string[];
  publicServiceTitle: string;
  requiredStaffRoles: KoinoniaStaffRole[];
  showingRequestRequired: boolean;
  staffNextAction: string;
};

export type KoinoniaBillingSetupOption = {
  billingModel: KoinoniaBillingModel;
  billingModelLabel: string;
  clientPortalSections: string[];
  documentRequests: string[];
  serviceName: string;
  showingRequestRequired: boolean;
  staffNextAction: string;
  templateId: string;
};

const billingModelLabels = {
  prepaid: "Prepaid before work begins",
  pay_at_close: "Pay after successful close",
  per_request: "Per request after completion",
  monthly: "Monthly recurring support",
  custom: "Custom written agreement"
} as const satisfies Record<KoinoniaBillingModel, string>;

export const koinoniaServiceTemplates = [
  {
    id: "transaction-support",
    publicServiceTitle: "Transaction Support",
    packageNames: ["Transaction Coordination Plus"],
    defaultWorkType: "Transaction",
    billingModel: "prepaid",
    requiredStaffRoles: ["Transaction Coordinator", "Operations", "Finance"],
    clientPortalSections: ["Dashboard", "Documents", "Billing"],
    employeePortalQueues: ["Assignments", "Documents", "Billing"],
    intakeFields: [
      "propertyAddress",
      "contractDate",
      "closingDate",
      "titleContact",
      "lenderContact",
      "brokerContact",
      "deadlineSummary"
    ],
    documentRequests: [
      "Executed contract",
      "Disclosures and addenda",
      "Lender/title contacts",
      "Broker compliance notes"
    ],
    showingRequestRequired: false,
    staffNextAction: "Assign a transaction coordinator and confirm contract-to-close dates."
  },
  {
    id: "pay-at-closing-coordination",
    publicServiceTitle: "Transaction Support",
    packageNames: ["Pay-at-Closing Coordination"],
    defaultWorkType: "Transaction",
    billingModel: "pay_at_close",
    requiredStaffRoles: ["Transaction Coordinator", "Operations", "Finance"],
    clientPortalSections: ["Dashboard", "Documents", "Billing"],
    employeePortalQueues: ["Assignments", "Documents", "Billing"],
    intakeFields: [
      "propertyAddress",
      "contractDate",
      "closingDate",
      "titleContact",
      "lenderContact",
      "brokerContact",
      "closingTrigger"
    ],
    documentRequests: [
      "Executed contract",
      "Closing timeline",
      "Title/lender contacts",
      "Closing confirmation source"
    ],
    showingRequestRequired: false,
    staffNextAction: "Assign transaction support and track the successful-close billing trigger."
  },
  {
    id: "contract-document-support",
    publicServiceTitle: "Contract & Document Support",
    packageNames: ["Contract & Document Support"],
    defaultWorkType: "Document",
    billingModel: "per_request",
    requiredStaffRoles: ["Contract Support", "Operations"],
    clientPortalSections: ["Dashboard", "Documents"],
    employeePortalQueues: ["Documents", "Review"],
    intakeFields: [
      "documentType",
      "realtorInstructions",
      "propertyAddress",
      "transactionTerms",
      "supportingFiles",
      "approvalStatus"
    ],
    documentRequests: [
      "Realtor instructions",
      "Supporting contract terms",
      "Property details",
      "Approval before sending"
    ],
    showingRequestRequired: false,
    staffNextAction: "Collect Realtor instructions and prepare the document for approval."
  },
  {
    id: "licensed-showing-coverage",
    publicServiceTitle: "Licensed Showing Coverage",
    packageNames: ["Licensed Showing Coverage"],
    defaultWorkType: "ShowingRequest",
    billingModel: "per_request",
    requiredStaffRoles: ["Showing Provider", "Operations", "Finance"],
    clientPortalSections: ["Dashboard", "Showings", "Billing"],
    employeePortalQueues: ["Assignments", "Showings", "Billing"],
    intakeFields: [
      "propertyAddress",
      "preferredWindow",
      "buyerOrClientLabel",
      "approvedContact",
      "accessInstructionsStatus",
      "showingAuthorization"
    ],
    documentRequests: [
      "Showing instructions",
      "Access readiness confirmation",
      "Safety/access notes",
      "Feedback request"
    ],
    showingRequestRequired: true,
    staffNextAction: "Assign a licensed showing provider and confirm access before scheduling."
  },
  {
    id: "monthly-operations-partnership",
    publicServiceTitle: "Monthly Operations Partnership",
    packageNames: ["Monthly Operations Partnership", "Starter", "Growth", "Partner"],
    defaultWorkType: "Operations",
    billingModel: "monthly",
    requiredStaffRoles: ["Customer Success", "Operations", "Finance"],
    clientPortalSections: ["Dashboard", "Documents", "Billing"],
    employeePortalQueues: ["Assignments", "Review", "Billing"],
    intakeFields: [
      "planTier",
      "recurringTasks",
      "systemsInvolved",
      "monthlyPriorities",
      "hoursIncluded",
      "checkInCadence"
    ],
    documentRequests: [
      "Monthly priorities",
      "CRM/task system context",
      "Recurring workflow notes",
      "Check-in cadence"
    ],
    showingRequestRequired: false,
    staffNextAction: "Assign an account owner and confirm monthly priorities, hours, and cadence."
  },
  {
    id: "realtor-support-plus",
    publicServiceTitle: "Realtor Support Plus",
    packageNames: ["Realtor Support Plus"],
    defaultWorkType: "Relationship",
    billingModel: "custom",
    requiredStaffRoles: [
      "Customer Success",
      "Operations",
      "Transaction Coordinator",
      "Contract Support",
      "Finance"
    ],
    clientPortalSections: ["Dashboard", "Documents", "Showings", "Billing"],
    employeePortalQueues: ["Assignments", "Documents", "Showings", "Review", "Billing"],
    intakeFields: [
      "accountOwner",
      "serviceMix",
      "priorityRequests",
      "activeFiles",
      "monthlyNeeds",
      "billingTerms"
    ],
    documentRequests: [
      "Service mix summary",
      "Current active-file list",
      "Recurring support priorities",
      "Billing authorization"
    ],
    showingRequestRequired: false,
    staffNextAction: "Assign an account owner and route requests to the right service queue."
  }
] as const satisfies readonly KoinoniaServiceTemplate[];

export function getKoinoniaServiceTemplateByPackageName(
  packageName: string
): KoinoniaServiceTemplate | null {
  const normalizedPackageName = normalizeServiceText(packageName);

  return (
    koinoniaServiceTemplates.find((template) =>
      template.packageNames.some((name) => normalizeServiceText(name) === normalizedPackageName)
    ) ?? null
  );
}

export function getKoinoniaServiceTemplateById(id: string): KoinoniaServiceTemplate | null {
  return koinoniaServiceTemplates.find((template) => template.id === id) ?? null;
}

export function getKoinoniaServiceTemplateForWork(input: {
  data?: unknown;
  name: string;
  objectType: string;
}): KoinoniaServiceTemplate | null {
  const candidates = [
    ...getSafeServiceTextCandidates(input.data),
    input.name,
    input.objectType === "ShowingRequest" ? "Licensed Showing Coverage" : ""
  ];

  for (const candidate of candidates) {
    const template = candidate ? getKoinoniaServiceTemplateByPackageName(candidate) : null;

    if (template) {
      return template;
    }
  }

  return null;
}

export function getKoinoniaPublicServiceTitles(): string[] {
  return [...new Set(koinoniaServiceTemplates.map((template) => template.publicServiceTitle))];
}

export function getKoinoniaBillingModelLabel(model: KoinoniaBillingModel): string {
  return billingModelLabels[model];
}

export function getKoinoniaBillingSetupOptions(): KoinoniaBillingSetupOption[] {
  return koinoniaServiceTemplates.flatMap((template) =>
    template.packageNames.map((serviceName) => ({
      billingModel: template.billingModel,
      billingModelLabel: getKoinoniaBillingModelLabel(template.billingModel),
      clientPortalSections: [...template.clientPortalSections],
      documentRequests: [...template.documentRequests],
      serviceName,
      showingRequestRequired: template.showingRequestRequired,
      staffNextAction: template.staffNextAction,
      templateId: template.id
    }))
  );
}

function normalizeServiceText(value: string): string {
  return value.trim().toLowerCase().replaceAll(/\s+/g, " ");
}

function getSafeServiceTextCandidates(data: unknown): string[] {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return [];
  }

  const value = data as Record<string, unknown>;
  const candidates = [
    value.packageName,
    value.package,
    value.serviceName,
    value.service,
    value.serviceLevel,
    value.billingModel
  ];

  return candidates.filter((candidate): candidate is string => typeof candidate === "string");
}
