import {
  getKoinoniaBillingModelLabel,
  getKoinoniaServiceTemplateForWork,
  type KoinoniaBillingModel,
  type KoinoniaStaffRole,
  type KoinoniaStaffServiceCues
} from "./koinonia-service-templates";
import {
  getTransactionDeadlines,
  type PortalDeadlineRisk
} from "./portal-deadlines";

export type PortalPlaybookExpectedDocument = {
  key: string;
  label: string;
};

export type PortalPlaybookDeadline = {
  date: Date;
  dateLabel: string;
  daysUntilDue: number;
  key: string;
  label: string;
  risk: PortalDeadlineRisk;
};

export type PortalPlaybookInitialAction = {
  id: string;
  label: string;
  type: "staff_next_action";
};

export type PortalPlaybookClientDocumentRequest = {
  action: string;
  due: string;
  status: string;
  title: string;
  transaction: string;
};

export type PortalPlaybook = {
  billingModel: KoinoniaBillingModel;
  deadlinePlaceholders: PortalPlaybookDeadline[];
  employeePortalQueues: string[];
  expectedDocuments: PortalPlaybookExpectedDocument[];
  healthFactorKeys: string[];
  initialActions: PortalPlaybookInitialAction[];
  requiredStaffRoles: KoinoniaStaffRole[];
  riskNotes: string[];
  serviceName: string;
  templateId: string;
};

export function buildPortalPlaybook(input: {
  data?: unknown;
  name: string;
  now?: Date;
  objectType: string;
}): PortalPlaybook | null {
  const template = getKoinoniaServiceTemplateForWork({
    data: input.data,
    name: input.name,
    objectType: input.objectType
  });

  if (!template) {
    return null;
  }

  const expectedDocuments = buildExpectedDocuments(
    template.documentRequests
  );
  const deadlines = getTransactionDeadlines(
    input.data,
    input.now ?? new Date()
  );

  return {
    billingModel: template.billingModel,
    deadlinePlaceholders: deadlines.map((deadline) => ({
      date: deadline.date,
      dateLabel: deadline.dateLabel,
      daysUntilDue: deadline.daysUntilDue,
      key: deadline.key,
      label: deadline.label,
      risk: deadline.risk
    })),
    employeePortalQueues: [...template.employeePortalQueues],
    expectedDocuments,
    healthFactorKeys: [
      "primary_staff",
      "backup_staff",
      "active_documents",
      "document_actions",
      "missing_documents",
      "recent_activity",
      "overdue_deadlines",
      "due_today_deadlines",
      "due_soon_deadlines"
    ],
    initialActions: template.staffNextAction.trim()
      ? [
          {
            id: `playbook-${template.id}-staff-next-action`,
            label: template.staffNextAction.trim(),
            type: "staff_next_action"
          }
        ]
      : [],
    requiredStaffRoles: [...template.requiredStaffRoles],
    riskNotes: [...template.riskNotes],
    serviceName:
      template.packageNames[0] ?? template.publicServiceTitle,
    templateId: template.id
  };
}

function buildExpectedDocuments(
  documentRequests: readonly string[]
): PortalPlaybookExpectedDocument[] {
  const seen = new Set<string>();

  return documentRequests.flatMap((documentRequest) => {
    const label = documentRequest.trim();
    const normalized = label.toLowerCase().replace(/\s+/g, " ");

    if (!label || seen.has(normalized)) {
      return [];
    }

    seen.add(normalized);

    return [
      {
        key: slugify(label),
        label
      }
    ];
  });
}

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "document"
  );
}

export function getPersistedPortalPlaybook(
  data: unknown
): PortalPlaybook | null {
  const record = toRecord(data);
  const stored = toRecord(record.playbook);

  if (
    typeof stored.templateId !== "string" ||
    !stored.templateId.trim() ||
    typeof stored.serviceName !== "string" ||
    !stored.serviceName.trim() ||
    !isBillingModel(stored.billingModel)
  ) {
    return null;
  }

  const employeePortalQueues = readStringArray(
    stored.employeePortalQueues
  );

  const expectedDocuments = Array.isArray(stored.expectedDocuments)
    ? stored.expectedDocuments.flatMap((value) => {
        const item = toRecord(value);
        const key =
          typeof item.key === "string" ? item.key.trim() : "";
        const label =
          typeof item.label === "string" ? item.label.trim() : "";

        return key && label ? [{ key, label }] : [];
      })
    : [];

  const requiredStaffRoles = Array.isArray(stored.requiredStaffRoles)
    ? stored.requiredStaffRoles.filter(isStaffRole)
    : [];

  const initialActions = Array.isArray(stored.initialActions)
    ? stored.initialActions.flatMap((value) => {
        const item = toRecord(value);
        const id =
          typeof item.id === "string" ? item.id.trim() : "";
        const label =
          typeof item.label === "string" ? item.label.trim() : "";

        return id && label
          ? [
              {
                id,
                label,
                type: "staff_next_action" as const
              }
            ]
          : [];
      })
    : [];

  const deadlinePlaceholders = Array.isArray(
    stored.deadlinePlaceholders
  )
    ? stored.deadlinePlaceholders.flatMap((value) => {
        const item = toRecord(value);
        const date =
          typeof item.date === "string"
            ? new Date(item.date)
            : null;

        if (
          !date ||
          Number.isNaN(date.getTime()) ||
          typeof item.key !== "string" ||
          typeof item.label !== "string" ||
          typeof item.dateLabel !== "string" ||
          typeof item.daysUntilDue !== "number" ||
          !isDeadlineRisk(item.risk)
        ) {
          return [];
        }

        return [
          {
            date,
            dateLabel: item.dateLabel,
            daysUntilDue: item.daysUntilDue,
            key: item.key,
            label: item.label,
            risk: item.risk
          }
        ];
      })
    : [];

  const healthFactorKeys = readStringArray(
    stored.healthFactorKeys
  );
  const riskNotes = readStringArray(stored.riskNotes);

  return {
    billingModel: stored.billingModel,
    deadlinePlaceholders,
    employeePortalQueues,
    expectedDocuments,
    healthFactorKeys,
    initialActions,
    requiredStaffRoles,
    riskNotes,
    serviceName: stored.serviceName.trim(),
    templateId: stored.templateId.trim()
  };
}

export function buildStaffServiceCuesFromPlaybook(
  playbook: PortalPlaybook,
  options: {
    showingRequestRequired?: boolean;
  } = {}
): KoinoniaStaffServiceCues {
  return {
    billingModelLabel: getKoinoniaBillingModelLabel(
      playbook.billingModel
    ),
    documentRequests: playbook.expectedDocuments.map(
      (document) => document.label
    ),
    employeePortalQueues: [...playbook.employeePortalQueues],
    requiredStaffRoles: [...playbook.requiredStaffRoles],
    riskNotes: [...playbook.riskNotes],
    serviceName: playbook.serviceName,
    showingRequestRequired:
      options.showingRequestRequired ?? false,
    staffNextAction:
      playbook.initialActions[0]?.label ??
      "Review the active service playbook.",
    templateId: playbook.templateId
  };
}

export function buildClientServiceCuesFromPlaybook(
  playbook: PortalPlaybook,
  options: {
    clientPortalSections?: readonly string[];
  } = {}
): string[] {
  return [
    ...(options.clientPortalSections ?? []),
    ...playbook.expectedDocuments
      .map((document) => document.label)
      .slice(0, 2)
  ].slice(0, 5);
}

export function buildClientDocumentRequestsFromPlaybooks(
  items: readonly {
    due: string;
    playbook: PortalPlaybook | null;
    transaction: string;
  }[]
): PortalPlaybookClientDocumentRequest[] {
  const seen = new Set<string>();

  return items.flatMap((item) => {
    if (!item.playbook) {
      return [];
    }

    return item.playbook.expectedDocuments.flatMap((document) => {
      const title = document.label.trim();
      const transaction = item.transaction.trim();
      const dedupeKey = `${transaction.toLowerCase()}::${title.toLowerCase()}`;

      if (!title || !transaction || seen.has(dedupeKey)) {
        return [];
      }

      seen.add(dedupeKey);

      return [
        {
          action: `Upload ${title} or add a note if it is already handled.`,
          due: item.due,
          status: "Requested",
          title,
          transaction
        }
      ];
    });
  });
}

export function getPortalPlaybookForWork(input: {
  data?: unknown;
  name: string;
  now?: Date;
  objectType: string;
}): PortalPlaybook | null {
  return (
    getPersistedPortalPlaybook(input.data) ??
    buildPortalPlaybook(input)
  );
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const text =
      typeof item === "string" ? item.trim() : "";

    return text ? [text] : [];
  });
}

function isBillingModel(
  value: unknown
): value is KoinoniaBillingModel {
  return [
    "prepaid",
    "pay_at_close",
    "per_request",
    "monthly",
    "custom"
  ].includes(String(value));
}

function isStaffRole(value: unknown): value is KoinoniaStaffRole {
  return [
    "Operations",
    "Transaction Coordinator",
    "Contract Support",
    "Showing Provider",
    "Customer Success",
    "Finance"
  ].includes(String(value));
}

function isDeadlineRisk(
  value: unknown
): value is PortalDeadlineRisk {
  return [
    "overdue",
    "due_today",
    "due_soon",
    "upcoming"
  ].includes(String(value));
}

function toRecord(value: unknown): Record<string, unknown> {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export type PersistedPortalPlaybookSnapshot = {
  billingModel: KoinoniaBillingModel;
  deadlinePlaceholders: Array<{
    date: string;
    dateLabel: string;
    daysUntilDue: number;
    key: string;
    label: string;
    risk: PortalDeadlineRisk;
  }>;
  employeePortalQueues: string[];
  expectedDocuments: PortalPlaybookExpectedDocument[];
  healthFactorKeys: string[];
  initialActions: PortalPlaybookInitialAction[];
  instantiatedAt: string;
  requiredStaffRoles: KoinoniaStaffRole[];
  riskNotes: string[];
  serviceName: string;
  templateId: string;
};

export function buildPersistedPortalPlaybookSnapshot(
  playbook: PortalPlaybook,
  instantiatedAt = new Date()
): PersistedPortalPlaybookSnapshot {
  return {
    billingModel: playbook.billingModel,
    deadlinePlaceholders: playbook.deadlinePlaceholders.map(
      (deadline) => ({
        date: deadline.date.toISOString(),
        dateLabel: deadline.dateLabel,
        daysUntilDue: deadline.daysUntilDue,
        key: deadline.key,
        label: deadline.label,
        risk: deadline.risk
      })
    ),
    employeePortalQueues: [...playbook.employeePortalQueues],
    expectedDocuments: playbook.expectedDocuments.map((document) => ({
      key: document.key,
      label: document.label
    })),
    healthFactorKeys: [...playbook.healthFactorKeys],
    initialActions: playbook.initialActions.map((action) => ({
      id: action.id,
      label: action.label,
      type: action.type
    })),
    instantiatedAt: instantiatedAt.toISOString(),
    requiredStaffRoles: [...playbook.requiredStaffRoles],
    riskNotes: [...playbook.riskNotes],
    serviceName: playbook.serviceName,
    templateId: playbook.templateId
  };
}
