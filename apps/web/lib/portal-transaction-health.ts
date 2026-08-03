import type { PortalTransactionDeadline } from "./portal-deadlines";

export type PortalTransactionHealthStatus =
  | "healthy"
  | "watch"
  | "at_risk";

export type PortalTransactionHealthFactorState =
  | "positive"
  | "warning"
  | "critical";

export type PortalTransactionHealthFactor = {
  detail: string;
  key: string;
  label: string;
  penalty: number;
  state: PortalTransactionHealthFactorState;
};

export type PortalTransactionHealthInput = {
  activeDocumentCount: number;
  assignedStaffUserId?: string | null;
  backupStaffUserId?: string | null;
  deadlines: readonly PortalTransactionDeadline[];
  missingExpectedDocumentCount: number;
  outstandingDocumentActionCount: number;
  recentActivityCount: number;
};

export type PortalTransactionHealth = {
  factors: PortalTransactionHealthFactor[];
  score: number;
  status: PortalTransactionHealthStatus;
  statusLabel: string;
};

export function calculatePortalTransactionHealth(
  input: PortalTransactionHealthInput
): PortalTransactionHealth {
  const factors: PortalTransactionHealthFactor[] = [];

  factors.push(getPrimaryStaffFactor(input.assignedStaffUserId));
  factors.push(getBackupStaffFactor(input.backupStaffUserId));
  factors.push(getActiveDocumentFactor(input.activeDocumentCount));
  factors.push(
    getDocumentActionFactor(input.outstandingDocumentActionCount)
  );
  factors.push(
    getMissingDocumentFactor(input.missingExpectedDocumentCount)
  );
  factors.push(getActivityFactor(input.recentActivityCount));
  factors.push(...getDeadlineFactors(input.deadlines));

  const totalPenalty = factors.reduce(
    (sum, factor) => sum + factor.penalty,
    0
  );
  const score = clampHealthScore(100 - totalPenalty);
  const status = getPortalTransactionHealthStatus(score);

  return {
    factors,
    score,
    status,
    statusLabel: getPortalTransactionHealthStatusLabel(status)
  };
}

export function getPortalTransactionHealthStatus(
  score: number
): PortalTransactionHealthStatus {
  if (score >= 85) {
    return "healthy";
  }

  if (score >= 65) {
    return "watch";
  }

  return "at_risk";
}

export function getPortalTransactionHealthStatusLabel(
  status: PortalTransactionHealthStatus
): string {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "watch":
      return "Needs Attention";
    default:
      return "At Risk";
  }
}

function getPrimaryStaffFactor(
  assignedStaffUserId?: string | null
): PortalTransactionHealthFactor {
  if (assignedStaffUserId) {
    return {
      detail: "A primary staff owner is assigned.",
      key: "primary_staff",
      label: "Primary Staff",
      penalty: 0,
      state: "positive"
    };
  }

  return {
    detail: "No primary staff owner is assigned.",
    key: "primary_staff",
    label: "Primary Staff",
    penalty: 25,
    state: "critical"
  };
}

function getBackupStaffFactor(
  backupStaffUserId?: string | null
): PortalTransactionHealthFactor {
  if (backupStaffUserId) {
    return {
      detail: "Backup staff coverage is assigned.",
      key: "backup_staff",
      label: "Backup Staff",
      penalty: 0,
      state: "positive"
    };
  }

  return {
    detail: "No backup staff coverage is assigned.",
    key: "backup_staff",
    label: "Backup Staff",
    penalty: 10,
    state: "warning"
  };
}

function getActiveDocumentFactor(
  activeDocumentCount: number
): PortalTransactionHealthFactor {
  if (activeDocumentCount > 0) {
    return {
      detail: `${activeDocumentCount} active document${
        activeDocumentCount === 1 ? " is" : "s are"
      } attached.`,
      key: "active_documents",
      label: "Active Documents",
      penalty: 0,
      state: "positive"
    };
  }

  return {
    detail: "No active documents are attached to the transaction.",
    key: "active_documents",
    label: "Active Documents",
    penalty: 10,
    state: "warning"
  };
}

function getDocumentActionFactor(
  outstandingDocumentActionCount: number
): PortalTransactionHealthFactor {
  const normalizedCount = Math.max(
    0,
    Math.floor(outstandingDocumentActionCount)
  );

  if (normalizedCount === 0) {
    return {
      detail: "No outstanding document actions are identified.",
      key: "document_actions",
      label: "Document Actions",
      penalty: 0,
      state: "positive"
    };
  }

  const penalty = Math.min(normalizedCount * 5, 20);

  return {
    detail: `${normalizedCount} document action${
      normalizedCount === 1 ? " requires" : "s require"
    } attention.`,
    key: "document_actions",
    label: "Document Actions",
    penalty,
    state: normalizedCount >= 3 ? "critical" : "warning"
  };
}

function getMissingDocumentFactor(
  missingExpectedDocumentCount: number
): PortalTransactionHealthFactor {
  const normalizedCount = Math.max(
    0,
    Math.floor(missingExpectedDocumentCount)
  );

  if (normalizedCount === 0) {
    return {
      detail: "No expected documents are currently identified as missing.",
      key: "missing_documents",
      label: "Expected Documents",
      penalty: 0,
      state: "positive"
    };
  }

  const penalty = Math.min(normalizedCount * 5, 20);

  return {
    detail: `${normalizedCount} expected document${
      normalizedCount === 1 ? " is" : "s are"
    } missing.`,
    key: "missing_documents",
    label: "Expected Documents",
    penalty,
    state: normalizedCount >= 3 ? "critical" : "warning"
  };
}

function getActivityFactor(
  recentActivityCount: number
): PortalTransactionHealthFactor {
  if (recentActivityCount > 0) {
    return {
      detail: `${recentActivityCount} recent activit${
        recentActivityCount === 1 ? "y is" : "ies are"
      } recorded.`,
      key: "recent_activity",
      label: "Recent Activity",
      penalty: 0,
      state: "positive"
    };
  }

  return {
    detail: "No recent transaction activity is recorded.",
    key: "recent_activity",
    label: "Recent Activity",
    penalty: 10,
    state: "warning"
  };
}

function getDeadlineFactors(
  deadlines: readonly PortalTransactionDeadline[]
): PortalTransactionHealthFactor[] {
  const overdueCount = deadlines.filter(
    (deadline) => deadline.risk === "overdue"
  ).length;
  const dueTodayCount = deadlines.filter(
    (deadline) => deadline.risk === "due_today"
  ).length;
  const dueSoonCount = deadlines.filter(
    (deadline) => deadline.risk === "due_soon"
  ).length;

  return [
    buildDeadlineFactor({
      count: overdueCount,
      key: "overdue_deadlines",
      label: "Overdue Deadlines",
      maximumPenalty: 40,
      penaltyPerItem: 20,
      riskState: "critical"
    }),
    buildDeadlineFactor({
      count: dueTodayCount,
      key: "due_today_deadlines",
      label: "Due Today",
      maximumPenalty: 20,
      penaltyPerItem: 10,
      riskState: "critical"
    }),
    buildDeadlineFactor({
      count: dueSoonCount,
      key: "due_soon_deadlines",
      label: "Due Soon",
      maximumPenalty: 15,
      penaltyPerItem: 5,
      riskState: "warning"
    })
  ];
}

function buildDeadlineFactor({
  count,
  key,
  label,
  maximumPenalty,
  penaltyPerItem,
  riskState
}: {
  count: number;
  key: string;
  label: string;
  maximumPenalty: number;
  penaltyPerItem: number;
  riskState: PortalTransactionHealthFactorState;
}): PortalTransactionHealthFactor {
  if (count === 0) {
    return {
      detail: `No ${label.toLowerCase()} are identified.`,
      key,
      label,
      penalty: 0,
      state: "positive"
    };
  }

  return {
    detail: `${count} deadline${count === 1 ? "" : "s"} ${
      key === "overdue_deadlines"
        ? count === 1
          ? "is overdue"
          : "are overdue"
        : key === "due_today_deadlines"
          ? count === 1
            ? "is due today"
            : "are due today"
          : count === 1
            ? "is due soon"
            : "are due soon"
    }.`,
    key,
    label,
    penalty: Math.min(count * penaltyPerItem, maximumPenalty),
    state: riskState
  };
}

function clampHealthScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}
