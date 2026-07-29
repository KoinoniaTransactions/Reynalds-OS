export const clientPortalWorkObjectTypes = [
  "Transaction",
  "Task",
  "Service",
  "Customer Success",
  "ShowingRequest",
  "AccessRequest",
  "BillingSetupRequest"
] as const;

export type PortalWorkStatusBucket = "active" | "completed" | "review" | "waiting";

export function getPortalWorkItemTypeLabel(objectType: string): string {
  switch (objectType) {
    case "AccessRequest":
      return "Access Request";
    case "BillingSetupRequest":
      return "Billing Setup";
    case "Customer Success":
      return "Client Follow-Up";
    case "ShowingRequest":
      return "Showing Request";
    case "Service":
      return "Service Support";
    case "Task":
      return "Task";
    case "Transaction":
      return "Transaction Support";
    default:
      return objectType;
  }
}

export function getPortalWorkStatusBucket(status: string): PortalWorkStatusBucket {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus.includes("complete") ||
    normalizedStatus.includes("archived") ||
    normalizedStatus.includes("closed") ||
    normalizedStatus.includes("sent") ||
    normalizedStatus.includes("approved")
  ) {
    return "completed";
  }

  if (
    normalizedStatus.includes("review") ||
    normalizedStatus.includes("approval") ||
    normalizedStatus.includes("ready")
  ) {
    return "review";
  }

  if (
    normalizedStatus.includes("waiting") ||
    normalizedStatus.includes("needed") ||
    normalizedStatus.includes("blocked") ||
    normalizedStatus.includes("missing") ||
    normalizedStatus.includes("requested")
  ) {
    return "waiting";
  }

  return "active";
}

export function getPortalWorkDueLabel(data: unknown): string {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Date pending";
  }

  const value = data as Record<string, unknown>;

  for (const key of ["dueLabel", "due", "dueAt", "closeDate", "preferredWindow", "triggerDescription"]) {
    const candidate = value[key];

    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "Date pending";
}

export function buildPortalWorkSummaryCounts(items: Array<{ status: string }>) {
  const counts = {
    active: 0,
    completed: 0,
    review: 0,
    waiting: 0
  };

  for (const item of items) {
    counts[getPortalWorkStatusBucket(item.status)] += 1;
  }

  return counts;
}
