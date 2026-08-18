export const koinoniaStripeDisabledMessage =
  "Stripe payment processing is not enabled.";

type KoinoniaStripeEnv = Record<string, string | undefined>;

export function isKoinoniaStripeEnabled(
  env: KoinoniaStripeEnv = process.env
): boolean {
  return (
    env.KOINONIA_STRIPE_ENABLED
      ?.trim()
      .toLowerCase() === "true"
  );
}
