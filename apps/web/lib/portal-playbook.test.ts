import { describe, expect, it } from "vitest";
import { buildPortalPlaybook } from "./portal-playbook";

describe("portal playbook", () => {
  it("builds a transaction-support playbook from work metadata", () => {
    const playbook = buildPortalPlaybook({
      data: {
        closingDate: "2026-08-20",
        contractDate: "2026-08-01",
        packageName: "Transaction Coordination Plus"
      },
      name: "Smith Contract-to-Close",
      now: new Date("2026-08-03T15:00:00.000Z"),
      objectType: "Transaction"
    });

    expect(playbook).toMatchObject({
      billingModel: "prepaid",
      serviceName: "Transaction Coordination Plus",
      templateId: "transaction-support"
    });

    expect(playbook?.requiredStaffRoles).toContain(
      "Transaction Coordinator"
    );
    expect(playbook?.expectedDocuments).toEqual([
      {
        key: "executed-contract",
        label: "Executed contract"
      },
      {
        key: "disclosures-and-addenda",
        label: "Disclosures and addenda"
      },
      {
        key: "lender-title-contacts",
        label: "Lender/title contacts"
      },
      {
        key: "broker-compliance-notes",
        label: "Broker compliance notes"
      }
    ]);

    expect(
      playbook?.deadlinePlaceholders.map(
        (deadline) => deadline.key
      )
    ).toEqual(["contractDate", "closingDate"]);

    expect(playbook?.initialActions[0]?.label).toContain(
      "Assign a transaction coordinator"
    );
  });

  it("builds a showing playbook from object type fallback", () => {
    const playbook = buildPortalPlaybook({
      data: {},
      name: "123 Main Street Showing",
      now: new Date("2026-08-03T15:00:00.000Z"),
      objectType: "ShowingRequest"
    });

    expect(playbook).toMatchObject({
      billingModel: "per_request",
      serviceName: "Licensed Showing Coverage",
      templateId: "licensed-showing-coverage"
    });

    expect(
      playbook?.expectedDocuments.map((document) => document.label)
    ).toContain("Access readiness confirmation");
    expect(playbook?.requiredStaffRoles).toContain(
      "Showing Provider"
    );
  });

  it("creates deadline placeholders only from explicit entered dates", () => {
    const playbook = buildPortalPlaybook({
      data: {
        deadlineSummary: "Dates are still being confirmed.",
        packageName: "Transaction Coordination Plus"
      },
      name: "Pending Transaction",
      now: new Date("2026-08-03T15:00:00.000Z"),
      objectType: "Transaction"
    });

    expect(playbook?.deadlinePlaceholders).toEqual([]);
  });

  it("returns null when no service template can be resolved", () => {
    expect(
      buildPortalPlaybook({
        data: {},
        name: "Unmapped Internal Work",
        objectType: "Unknown"
      })
    ).toBeNull();
  });

  it("provides stable health-factor keys without duplicate entries", () => {
    const playbook = buildPortalPlaybook({
      data: {
        packageName: "Licensed Showing Coverage"
      },
      name: "Showing",
      objectType: "ShowingRequest"
    });

    expect(new Set(playbook?.healthFactorKeys).size).toBe(
      playbook?.healthFactorKeys.length
    );
  });
});
