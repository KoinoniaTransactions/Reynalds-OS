import { describe, expect, it } from "vitest";
import {
  isKoinoniaStripeEnabled,
  koinoniaStripeDisabledMessage
} from "./stripe-runtime";

describe("Koinonia Stripe runtime gate", () => {
  it("defaults to disabled", () => {
    expect(isKoinoniaStripeEnabled({})).toBe(false);
  });

  it("remains disabled for non-true values", () => {
    expect(
      isKoinoniaStripeEnabled({
        KOINONIA_STRIPE_ENABLED: "false"
      })
    ).toBe(false);

    expect(
      isKoinoniaStripeEnabled({
        KOINONIA_STRIPE_ENABLED: "1"
      })
    ).toBe(false);
  });

  it("enables only explicit true", () => {
    expect(
      isKoinoniaStripeEnabled({
        KOINONIA_STRIPE_ENABLED: "true"
      })
    ).toBe(true);

    expect(
      isKoinoniaStripeEnabled({
        KOINONIA_STRIPE_ENABLED: " TRUE "
      })
    ).toBe(true);
  });

  it("uses a controlled disabled response message", () => {
    expect(koinoniaStripeDisabledMessage).toBe(
      "Stripe payment processing is not enabled."
    );
  });
});
