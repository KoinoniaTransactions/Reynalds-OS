import {
  getKoinoniaServiceTemplateForWork,
  type KoinoniaBillingModel,
  type KoinoniaStaffRole
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

export type PortalPlaybook = {
  billingModel: KoinoniaBillingModel;
  deadlinePlaceholders: PortalPlaybookDeadline[];
  expectedDocuments: PortalPlaybookExpectedDocument[];
  healthFactorKeys: string[];
  initialActions: PortalPlaybookInitialAction[];
  requiredStaffRoles: KoinoniaStaffRole[];
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
