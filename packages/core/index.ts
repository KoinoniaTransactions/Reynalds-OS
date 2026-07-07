export type RosObject = {
  id: string;
  workspaceId: string;
  objectType: string;
  name: string;
  status: string;
  health: "Healthy" | "Attention" | "Critical" | string;
  ownerId?: string;
  nextAction?: string;
  data?: Record<string, unknown>;
};

export type TimelineEvent = {
  id: string;
  workspaceId: string;
  objectId: string;
  actorId?: string;
  eventType: string;
  summary: string;
  createdAt: Date;
};

export function getDashboardMetrics() {
  return [
    { label: "Core Services", value: "4", note: "production certified" },
    { label: "Platform Version", value: "8.0", note: "production scaffold" },
    { label: "Object Engine", value: "Ready", note: "schema defined" },
    { label: "MVP Epics", value: "12", note: "build backlog" }
  ];
}

export function createTimelineEvent(input: Omit<TimelineEvent, "id" | "createdAt">): TimelineEvent {
  return {
    ...input,
    id: `evt_${crypto.randomUUID()}`,
    createdAt: new Date()
  };
}

export function calculateHealth(objects: RosObject[]) {
  return {
    total: objects.length,
    critical: objects.filter((object) => object.health === "Critical").length,
    attention: objects.filter((object) => object.health === "Attention").length,
    healthy: objects.filter((object) => object.health === "Healthy").length
  };
}
