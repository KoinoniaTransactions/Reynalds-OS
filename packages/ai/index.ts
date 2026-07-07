export type CopilotContext = {
  objectIds: string[];
  workflowIds: string[];
  timelineEventIds: string[];
  userRole: string;
  question: string;
};

export type CopilotAnswer = {
  answer: string;
  supportingReferences: string[];
  recommendedAction?: string;
  requiresHumanReview: boolean;
};

export function buildReadOnlyCopilotAnswer(context: CopilotContext): CopilotAnswer {
  return {
    answer: "Review the highest-risk objects first. This placeholder must be replaced by a grounded model call.",
    supportingReferences: [...context.objectIds, ...context.workflowIds, ...context.timelineEventIds],
    recommendedAction: "Open Operations Work Queue",
    requiresHumanReview: true
  };
}
