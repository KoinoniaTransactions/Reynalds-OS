import {
  describe,
  expect,
  it
} from "vitest";
import {
  applyTermsManagedBillingSetupPolicy,
  assertBillingRuleAcceptanceMatches,
  assertTermsManagedBillingSetupStatusAllowed,
  buildBillingRuleAssignmentData,
  buildSupersededBillingRuleData,
  getBillingRuleContext,
  isTermsManagedBillingModel,
  mergeBillingSetupRequestPendingTermsData,
  mergeServiceActivationPendingTermsData,
  validateBillingRuleAcceptanceInput,
  validateBillingRuleAssignmentInput
} from "./portal-billing-rules";

describe("portal billing rules", () => {
  it("identifies monthly and custom as terms-managed models", () => {
    expect(
      isTermsManagedBillingModel(
        "monthly"
      )
    ).toBe(true);

    expect(
      isTermsManagedBillingModel(
        "custom"
      )
    ).toBe(true);

    expect(
      isTermsManagedBillingModel(
        "prepaid"
      )
    ).toBe(false);
  });

  it("forces monthly setup into consent needed", () => {
    const input = {
      billingModel:
        "Monthly recurring support",
      consentAcknowledged: true,
      serviceName:
        "Monthly Operations Partnership",
      status:
        "Setup Requested" as const
    };

    expect(
      applyTermsManagedBillingSetupPolicy(
        input,
        "monthly"
      )
    ).toMatchObject({
      consentAcknowledged: false,
      status: "Consent Needed"
    });

    expect(
      applyTermsManagedBillingSetupPolicy(
        input,
        "prepaid"
      )
    ).toEqual(input);
  });

  it("blocks setup advancement before exact terms acceptance", () => {
    const pending = {
      canonicalBillingModel:
        "monthly",
      termsAuthorizationStatus:
        "Pending Acceptance"
    };

    expect(() =>
      assertTermsManagedBillingSetupStatusAllowed(
        pending,
        "Processor Link Needed"
      )
    ).toThrow(
      /cannot advance/i
    );

    expect(() =>
      assertTermsManagedBillingSetupStatusAllowed(
        pending,
        "Consent Needed"
      )
    ).not.toThrow();

    expect(() =>
      assertTermsManagedBillingSetupStatusAllowed(
        {
          canonicalBillingModel:
            "monthly",
          termsAuthorizationStatus:
            "Authorized"
        },
        "Processor Link Needed"
      )
    ).not.toThrow();
  });

  it("validates monthly written terms", () => {
    expect(
      validateBillingRuleAssignmentInput({
        billingDay: 1,
        billingModel: "monthly",
        checkInCadence:
          "Monthly review",
        effectiveDate:
          "2026-09-01",
        includedHours: 12,
        monthlyAmount: "1200",
        overageRate: "100",
        paymentTiming:
          "Invoice is prepared on the first day of each service month.",
        renewalCancellationSummary:
          "Month-to-month until changed under a new written agreement.",
        scopeSummary:
          "Operations support within the approved monthly priorities.",
        termsVersion:
          "monthly-v1"
      })
    ).toMatchObject({
      billingModel:
        "monthly",
      monthlyAmount:
        "1200.00",
      overageRate:
        "100.00",
      termsVersion:
        "monthly-v1"
    });
  });

  it("validates custom written terms", () => {
    expect(
      validateBillingRuleAssignmentInput({
        authorizationRequirements:
          "A charge requires the approved written scope.",
        billingModel: "custom",
        effectiveDate:
          "2026-09-01",
        paymentTiming:
          "Billing occurs only under the accepted written scope.",
        pricingBasis:
          "Pricing follows the approved scope.",
        renewalCancellationSummary:
          "Changes require a new written terms version.",
        reviewCadence:
          "Review before scope expansion",
        scopeSummary:
          "Realtor Support Plus mixed-service support.",
        termsVersion:
          "custom-v1"
      })
    ).toMatchObject({
      billingModel:
        "custom",
      termsVersion:
        "custom-v1"
    });
  });

  it("rejects sensitive payment data inside terms", () => {
    expect(() =>
      validateBillingRuleAssignmentInput({
        billingDay: 1,
        billingModel:
          "monthly",
        checkInCadence:
          "Monthly",
        effectiveDate:
          "2026-09-01",
        includedHours: 10,
        monthlyAmount: "500",
        paymentTiming:
          "Use card number 4242 4242 4242 4242.",
        renewalCancellationSummary:
          "Monthly",
        scopeSummary:
          "Operations support",
        termsVersion:
          "monthly-v1"
      })
    ).toThrow(
      /must not contain/i
    );
  });

  it("requires explicit acceptance of the exact terms version", () => {
    const acceptance =
      validateBillingRuleAcceptanceInput({
        accepted: true,
        termsVersion:
          "monthly-v1"
      });

    expect(() =>
      assertBillingRuleAcceptanceMatches(
        {
          authorizationStatus:
            "Pending Acceptance",
          termsVersion:
            "monthly-v1"
        },
        acceptance
      )
    ).not.toThrow();

    expect(() =>
      assertBillingRuleAcceptanceMatches(
        {
          authorizationStatus:
            "Pending Acceptance",
          termsVersion:
            "monthly-v2"
        },
        acceptance
      )
    ).toThrow(
      /does not match/i
    );
  });

  it("builds pending monthly rule persistence metadata", () => {
    const rule =
      validateBillingRuleAssignmentInput({
        billingDay: 5,
        billingModel:
          "monthly",
        checkInCadence:
          "Monthly review",
        effectiveDate:
          "2026-09-01",
        includedHours: 20,
        monthlyAmount: "1500",
        overageRate: "125",
        paymentTiming:
          "Billing cycle begins on the fifth day of each service month.",
        renewalCancellationSummary:
          "Month-to-month unless changed under a new accepted version.",
        scopeSummary:
          "Monthly operations support.",
        termsVersion:
          "monthly-v1"
      });

    expect(
      buildBillingRuleAssignmentData({
        actorId:
          "usr_finance",
        billingSetupRequestId:
          "request_1",
        createdAt:
          new Date(
            "2026-08-12T18:00:00.000Z"
          ),
        customerBillingProfileId:
          "profile_1",
        rule,
        serviceActivationId:
          "activation_1",
        serviceName:
          "Monthly Operations Partnership"
      })
    ).toMatchObject({
      authorizationStatus:
        "Pending Acceptance",
      billingDay: 5,
      billingModel:
        "monthly",
      billingSetupRequestId:
        "request_1",
      customerBillingProfileId:
        "profile_1",
      monthlyAmount:
        "1500.00",
      overageRate:
        "125.00",
      serviceActivationId:
        "activation_1",
      serviceName:
        "Monthly Operations Partnership",
      termsVersion:
        "monthly-v1"
    });
  });

  it("marks an older rule as superseded without deleting its original terms", () => {
    expect(
      buildSupersededBillingRuleData(
        {
          authorizationStatus:
            "Authorized",
          billingModel:
            "custom",
          pricingBasis:
            "Approved scope",
          termsVersion:
            "custom-v1"
        },
        {
          actorId:
            "usr_finance",
          supersededAt:
            new Date(
              "2026-08-12T18:05:00.000Z"
            )
        }
      )
    ).toMatchObject({
      authorizationStatus:
        "Superseded",
      billingModel:
        "custom",
      pricingBasis:
        "Approved scope",
      supersededAt:
        "2026-08-12T18:05:00.000Z",
      supersededByUserId:
        "usr_finance",
      termsVersion:
        "custom-v1"
    });
  });

  it("moves service activation back to pending for a replacement terms version", () => {
    expect(
      mergeServiceActivationPendingTermsData(
        {
          billingModel:
            "monthly",
          consentStatus:
            "Authorized",
          termsAcceptedAt:
            "2026-08-01T00:00:00.000Z",
          termsAcceptedByUserId:
            "usr_client",
          termsVersion:
            "monthly-v1"
        },
        {
          billingRuleAssignmentId:
            "rule_v2",
          termsVersion:
            "monthly-v2"
        }
      )
    ).toMatchObject({
      billingModel:
        "monthly",
      billingRuleAssignmentId:
        "rule_v2",
      consentStatus:
        "Pending",
      termsAuthorizationStatus:
        "Pending Acceptance",
      termsVersion:
        "monthly-v2"
    });
  });

  it("keeps the billing setup request consent-pending for a replacement rule", () => {
    const result =
      mergeBillingSetupRequestPendingTermsData(
        {
          canonicalBillingModel:
            "custom",
          consentAcknowledged:
            true,
          termsAcceptedAt:
            "2026-08-01T00:00:00.000Z",
          termsVersion:
            "custom-v1"
        },
        {
          billingRuleAssignmentId:
            "rule_v2",
          termsVersion:
            "custom-v2"
        }
      );

    expect(
      result
    ).toMatchObject({
      billingRuleAssignmentId:
        "rule_v2",
      canonicalBillingModel:
        "custom",
      consentAcknowledged:
        false,
      termsAuthorizationStatus:
        "Pending Acceptance",
      termsVersion:
        "custom-v2"
    });

    expect(
      result.termsAcceptedAt
    ).toBeUndefined();
  });

  it("reads safe relationship context from persisted rule data", () => {
    expect(
      getBillingRuleContext({
        authorizationStatus:
          "Pending Acceptance",
        billingModel:
          "custom",
        billingSetupRequestId:
          "request_1",
        customerBillingProfileId:
          "profile_1",
        serviceActivationId:
          "activation_1",
        serviceName:
          "Realtor Support Plus",
        termsVersion:
          "custom-v1"
      })
    ).toEqual({
      authorizationStatus:
        "Pending Acceptance",
      billingModel:
        "custom",
      billingSetupRequestId:
        "request_1",
      customerBillingProfileId:
        "profile_1",
      serviceActivationId:
        "activation_1",
      serviceName:
        "Realtor Support Plus",
      termsVersion:
        "custom-v1"
    });
  });
});
