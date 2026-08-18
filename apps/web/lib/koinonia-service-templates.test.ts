import { describe, expect, it } from "vitest";
import {
  getKoinoniaBillingSetupOptions,
  getKoinoniaPublicServiceTitles,
  getKoinoniaStaffServiceCuesForWork,
  getKoinoniaServiceTemplateByPackageName,
  getKoinoniaServiceTemplateForWork,
  koinoniaServiceTemplates
} from "./koinonia-service-templates";

describe("koinonia service templates", () => {
  it("covers the public service paths used by the website", () => {
    expect(getKoinoniaPublicServiceTitles()).toEqual([
      "Transaction Support",
      "Contract & Document Support",
      "Licensed Showing Coverage",
      "Monthly Operations Partnership",
      "Realtor Support Plus"
    ]);
  });

  it("maps pay-at-close coordination to transaction work and pay-at-close billing", () => {
    const template = getKoinoniaServiceTemplateByPackageName("Pay-at-Closing Coordination");

    expect(template).toMatchObject({
      billingModel: "pay_at_close",
      defaultWorkType: "Transaction",
      id: "pay-at-closing-coordination",
      showingRequestRequired: false
    });
    expect(template?.requiredStaffRoles).toContain("Finance");
    expect(template?.staffNextAction).toContain("successful-close");
  });

  it("maps showing coverage to showing workflow and assigned provider visibility", () => {
    const template = getKoinoniaServiceTemplateByPackageName("Licensed Showing Coverage");

    expect(template).toMatchObject({
      defaultWorkType: "ShowingRequest",
      showingRequestRequired: true
    });
    expect(template?.clientPortalSections).toContain("Showings");
    expect(template?.requiredStaffRoles).toContain("Showing Provider");
  });

  it("keeps every template tied to portal sections, staff roles, and intake fields", () => {
    for (const template of koinoniaServiceTemplates) {
      expect(template.clientPortalSections.length).toBeGreaterThan(0);
      expect(template.employeePortalQueues.length).toBeGreaterThan(0);
      expect(template.intakeFields.length).toBeGreaterThan(0);
      expect(template.requiredStaffRoles.length).toBeGreaterThan(0);
      expect(template.riskNotes.length).toBeGreaterThan(0);
    }
  });

  it("builds billing setup options from service templates", () => {
    const options = getKoinoniaBillingSetupOptions();
    const payAtClose = options.find((option) => option.serviceName === "Pay-at-Closing Coordination");
    const showing = options.find((option) => option.serviceName === "Licensed Showing Coverage");

    expect(options.map((option) => option.serviceName)).toContain("Transaction Coordination Plus");
    expect(payAtClose).toMatchObject({
      billingModel: "pay_at_close",
      billingModelLabel: "Pay after successful close",
      templateId: "pay-at-closing-coordination"
    });
    expect(showing?.clientPortalSections).toContain("Showings");
    expect(showing?.showingRequestRequired).toBe(true);
  });

  it("infers service templates from portal work metadata", () => {
    expect(
      getKoinoniaServiceTemplateForWork({
        data: { packageName: "Transaction Coordination Plus" },
        name: "Smith Contract-to-Close",
        objectType: "Transaction"
      })?.id
    ).toBe("transaction-support");

    expect(
      getKoinoniaServiceTemplateForWork({
        data: {},
        name: "West Ridge Showing",
        objectType: "ShowingRequest"
      })?.id
    ).toBe("licensed-showing-coverage");
  });

  it("builds staff service cues for employee work detail pages", () => {
    const cues = getKoinoniaStaffServiceCuesForWork({
      data: { packageName: "Licensed Showing Coverage" },
      name: "West Ridge Showing",
      objectType: "ShowingRequest"
    });

    expect(cues).toMatchObject({
      billingModelLabel: "Per request after completion",
      serviceName: "Licensed Showing Coverage",
      showingRequestRequired: true,
      templateId: "licensed-showing-coverage"
    });
    expect(cues?.documentRequests).toContain("Access readiness confirmation");
    expect(cues?.employeePortalQueues).toContain("Showings");
    expect(cues?.requiredStaffRoles).toContain("Showing Provider");
    expect(cues?.riskNotes.join(" ")).toContain("access authorization");
    expect(cues?.staffNextAction).toContain("licensed showing provider");
  });
});
