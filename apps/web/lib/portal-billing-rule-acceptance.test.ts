import {
  describe,
  expect,
  it
} from "vitest";
import {
  buildAcceptedBillingRuleData,
  mergeBillingProfileRuleAuthorizationData,
  mergeBillingSetupRequestAcceptedTermsData,
  mergeServiceActivationAcceptedTermsData
} from "./portal-billing-rule-acceptance";

const acceptedAt =
  new Date(
    "2026-08-12T18:30:00.000Z"
  );

const evidence = {
  acceptedAt,
  acceptedByUserId:
    "usr_client",
  billingRuleAssignmentId:
    "rule_monthly_v1",
  termsVersion:
    "monthly-v1"
};

describe(
  "portal billing rule acceptance",
  () => {
    it("authorizes only an exact pending rule version", () => {
      expect(
        buildAcceptedBillingRuleData(
          {
            authorizationStatus:
              "Pending Acceptance",
            billingModel:
              "monthly",
            monthlyAmount:
              "1200.00",
            termsVersion:
              "monthly-v1"
          },
          {
            acceptance: {
              accepted: true,
              termsVersion:
                "monthly-v1"
            },
            acceptedAt,
            acceptedByUserId:
              "usr_client"
          }
        )
      ).toMatchObject({
        acceptedAt:
          "2026-08-12T18:30:00.000Z",
        acceptedByUserId:
          "usr_client",
        acceptedTermsVersion:
          "monthly-v1",
        authorizationStatus:
          "Authorized",
        monthlyAmount:
          "1200.00",
        termsVersion:
          "monthly-v1"
      });
    });

    it("rejects acceptance against a changed terms version", () => {
      expect(() =>
        buildAcceptedBillingRuleData(
          {
            authorizationStatus:
              "Pending Acceptance",
            termsVersion:
              "monthly-v2"
          },
          {
            acceptance: {
              accepted: true,
              termsVersion:
                "monthly-v1"
            },
            acceptedAt,
            acceptedByUserId:
              "usr_client"
          }
        )
      ).toThrow(
        /does not match/i
      );
    });

    it("authorizes the linked service activation with acceptance evidence", () => {
      expect(
        mergeServiceActivationAcceptedTermsData(
          {
            billingModel:
              "monthly",
            consentStatus:
              "Pending",
            termsAuthorizationStatus:
              "Pending Acceptance",
            termsVersion:
              "monthly-v1"
          },
          evidence
        )
      ).toMatchObject({
        billingModel:
          "monthly",
        billingRuleAssignmentId:
          "rule_monthly_v1",
        consentStatus:
          "Authorized",
        termsAcceptedAt:
          "2026-08-12T18:30:00.000Z",
        termsAcceptedByUserId:
          "usr_client",
        termsAuthorizationStatus:
          "Authorized",
        termsVersion:
          "monthly-v1"
      });
    });

    it("makes the exact setup request processor-eligible only after acceptance", () => {
      expect(
        mergeBillingSetupRequestAcceptedTermsData(
          {
            canonicalBillingModel:
              "monthly",
            consentAcknowledged:
              false,
            termsAuthorizationStatus:
              "Pending Acceptance",
            termsVersion:
              "monthly-v1"
          },
          evidence
        )
      ).toMatchObject({
        billingRuleAssignmentId:
          "rule_monthly_v1",
        canonicalBillingModel:
          "monthly",
        consentAcknowledged:
          true,
        termsAcceptedAt:
          "2026-08-12T18:30:00.000Z",
        termsAcceptedByUserId:
          "usr_client",
        termsAuthorizationStatus:
          "Authorized",
        termsVersion:
          "monthly-v1"
      });
    });

    it("preserves prior profile billing models and records per-service authorization", () => {
      const result =
        mergeBillingProfileRuleAuthorizationData(
          {
            authorizedBillingModels: [
              "prepaid"
            ],
            billingTermAuthorizations: {
              activation_old: {
                authorizationStatus:
                  "Authorized",
                billingModel:
                  "prepaid",
                termsVersion:
                  "legacy"
              }
            },
            consentStatus:
              "Pending"
          },
          {
            ...evidence,
            billingModel:
              "monthly",
            serviceActivationId:
              "activation_monthly"
          }
        );

      expect(
        result.authorizedBillingModels
      ).toEqual([
        "prepaid",
        "monthly"
      ]);

      expect(result).toMatchObject({
        consentStatus:
          "Authorized",
        consentTermsVersion:
          "monthly-v1",
        consentTimestamp:
          "2026-08-12T18:30:00.000Z",
        billingTermAuthorizations: {
          activation_old: {
            authorizationStatus:
              "Authorized",
            billingModel:
              "prepaid",
            termsVersion:
              "legacy"
          },
          activation_monthly: {
            acceptedAt:
              "2026-08-12T18:30:00.000Z",
            acceptedByUserId:
              "usr_client",
            authorizationStatus:
              "Authorized",
            billingModel:
              "monthly",
            billingRuleAssignmentId:
              "rule_monthly_v1",
            termsVersion:
              "monthly-v1"
          }
        }
      });
    });
  }
);
