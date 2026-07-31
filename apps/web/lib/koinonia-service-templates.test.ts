import { describe, expect, it } from "vitest";
import {
  getKoinoniaPublicServiceTitles,
  getKoinoniaServiceTemplateByPackageName,
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
    }
  });
});
