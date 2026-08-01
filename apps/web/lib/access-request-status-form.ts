import type { AccessRequestStatus } from "./access-requests";

export const accessRequestStatusOptions = [
  "Access Needed",
  "Waiting on Client",
  "Client Says Granted",
  "Blocked",
  "No Longer Needed"
] as const satisfies readonly AccessRequestStatus[];

export type AccessRequestStatusFormPayload = {
  notes: string;
  status: AccessRequestStatus;
};

export function normalizeAccessRequestStatusSelection(
  status: string
): AccessRequestStatus {
  return accessRequestStatusOptions.includes(status as AccessRequestStatus)
    ? (status as AccessRequestStatus)
    : "Access Needed";
}

export function buildAccessRequestStatusFormPayload(
  status: string,
  notes: string
): AccessRequestStatusFormPayload {
  return {
    notes,
    status: normalizeAccessRequestStatusSelection(status)
  };
}
