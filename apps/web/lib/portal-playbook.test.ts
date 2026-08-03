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

describe("playbook staff service cues", () => {
  it("converts a resolved playbook into employee service cues", async () => {
    const {
      buildPortalPlaybook,
      buildStaffServiceCuesFromPlaybook
    } = await import("./portal-playbook");

    const playbook = buildPortalPlaybook({
      data: {
        packageName: "Licensed Showing Coverage"
      },
      name: "West Ridge Showing",
      objectType: "ShowingRequest"
    });

    expect(playbook).not.toBeNull();

    const cues = buildStaffServiceCuesFromPlaybook(
      playbook!,
      {
        showingRequestRequired: true
      }
    );

    expect(cues).toMatchObject({
      billingModelLabel: "Per request after completion",
      serviceName: "Licensed Showing Coverage",
      showingRequestRequired: true,
      templateId: "licensed-showing-coverage"
    });
    expect(cues.documentRequests).toContain(
      "Access readiness confirmation"
    );
    expect(cues.requiredStaffRoles).toContain(
      "Showing Provider"
    );
    expect(cues.employeePortalQueues).toContain("Showings");
    expect(cues.riskNotes.join(" ")).toContain(
      "access authorization"
    );
    expect(cues.staffNextAction).toContain(
      "licensed showing provider"
    );
  });
});

describe("persisted portal playbooks", () => {
  it("prefers a valid persisted playbook snapshot", async () => {
    const { getPortalPlaybookForWork } = await import(
      "./portal-playbook"
    );

    const playbook = getPortalPlaybookForWork({
      data: {
        packageName: "Transaction Coordination Plus",
        playbook: {
          billingModel: "per_request",
          deadlinePlaceholders: [],
          expectedDocuments: [
            {
              key: "custom-document",
              label: "Custom persisted document"
            }
          ],
          healthFactorKeys: ["primary_staff"],
          initialActions: [
            {
              id: "custom-action",
              label: "Follow the persisted workflow",
              type: "staff_next_action"
            }
          ],
          requiredStaffRoles: ["Operations"],
          serviceName: "Persisted Service",
          templateId: "persisted-template"
        }
      },
      name: "Existing Transaction",
      objectType: "Transaction"
    });

    expect(playbook).toMatchObject({
      billingModel: "per_request",
      serviceName: "Persisted Service",
      templateId: "persisted-template"
    });

    expect(playbook?.expectedDocuments).toEqual([
      {
        key: "custom-document",
        label: "Custom persisted document"
      }
    ]);
  });

  it("falls back to template resolution when persisted data is invalid", async () => {
    const { getPortalPlaybookForWork } = await import(
      "./portal-playbook"
    );

    const playbook = getPortalPlaybookForWork({
      data: {
        packageName: "Licensed Showing Coverage",
        playbook: {
          templateId: ""
        }
      },
      name: "Showing",
      objectType: "ShowingRequest"
    });

    expect(playbook?.templateId).toBe(
      "licensed-showing-coverage"
    );
  });
});

describe("persisted playbook snapshots", () => {
  it("serializes playbooks into JSON-safe snapshots", async () => {
    const {
      buildPersistedPortalPlaybookSnapshot,
      buildPortalPlaybook
    } = await import("./portal-playbook");

    const playbook = buildPortalPlaybook({
      data: {
        closingDate: "2026-08-20",
        packageName: "Transaction Coordination Plus"
      },
      name: "Smith Transaction",
      now: new Date("2026-08-03T15:00:00.000Z"),
      objectType: "Transaction"
    });

    expect(playbook).not.toBeNull();

    const snapshot = buildPersistedPortalPlaybookSnapshot(
      playbook!,
      new Date("2026-08-03T18:00:00.000Z")
    );

    expect(snapshot).toMatchObject({
      instantiatedAt: "2026-08-03T18:00:00.000Z",
      serviceName: "Transaction Coordination Plus",
      templateId: "transaction-support"
    });

    expect(snapshot.deadlinePlaceholders[0]?.date).toBe(
      "2026-08-20T00:00:00.000Z"
    );
    expect(snapshot.employeePortalQueues).toContain(
      "Assignments"
    );
    expect(snapshot.riskNotes.length).toBeGreaterThan(0);
    expect(JSON.parse(JSON.stringify(snapshot))).toEqual(snapshot);
  });
});

describe("non-service portal workflows", () => {
  it("does not force a service playbook onto access requests", () => {
    const playbook = buildPortalPlaybook({
      data: {
        accessPurpose: "Delegated transaction platform access",
        grantMethod: "Team invitation",
        platformName: "Brokerage Platform"
      },
      name: "Access Request - Brokerage Platform",
      objectType: "AccessRequest"
    });

    expect(playbook).toBeNull();
  });
});

describe("portal evidence records", () => {
  it("does not force a service playbook onto launch proofs", () => {
    const playbook = buildPortalPlaybook({
      data: {
        checklistItemId: "portal-launch-check",
        proofDate: "2026-08-03",
        proofOwner: "Operations",
        status: "Completed"
      },
      name: "Launch Proof - Portal Launch Check",
      objectType: "PortalLaunchProof"
    });

    expect(playbook).toBeNull();
  });
});
