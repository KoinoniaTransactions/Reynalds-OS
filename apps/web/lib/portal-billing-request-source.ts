import type { Permission } from "@reynalds-os/auth";
import type { BillingSetupRequestSource } from "./billing-setup-requests";

export const koinoniaBillingRequestSourceHeader =
  "x-koinonia-billing-request-source";

export function getBillingSetupRequestSource(
  headerValue: string | null | undefined,
  actorRole: string
): BillingSetupRequestSource {
  const requestedSource = headerValue?.trim().toLowerCase();

  if (
    requestedSource === "client-portal" ||
    requestedSource === "employee-portal"
  ) {
    return requestedSource;
  }

  return actorRole === "Client"
    ? "client-portal"
    : "employee-portal";
}

export function getBillingSetupRequestPermission(
  requestSource: BillingSetupRequestSource
): Permission {
  return requestSource === "client-portal"
    ? "client-portal:billing:setup"
    : "billing-workspace:payment-methods:request";
}
