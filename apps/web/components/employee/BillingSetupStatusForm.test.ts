import {
  describe,
  expect,
  it
} from "vitest";

import {
  isBillingSetupProcessorActionLocked
} from "./BillingSetupStatusForm";

describe(
  "BillingSetupStatusForm processor action gate",
  () => {
    it(
      "locks processor setup while billing consent is still needed",
      () => {
        expect(
          isBillingSetupProcessorActionLocked(
            "Consent Needed"
          )
        ).toBe(true);
      }
    );

    it(
      "allows processor setup after consent advances the request",
      () => {
        expect(
          isBillingSetupProcessorActionLocked(
            "Setup Requested"
          )
        ).toBe(false);

        expect(
          isBillingSetupProcessorActionLocked(
            "Processor Link Needed"
          )
        ).toBe(false);
      }
    );

    it(
      "does not regress an already ready setup request",
      () => {
        expect(
          isBillingSetupProcessorActionLocked(
            "Payment Method Ready"
          )
        ).toBe(false);
      }
    );
  }
);
