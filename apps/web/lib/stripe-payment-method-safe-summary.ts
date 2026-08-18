import type Stripe from "stripe";

export type StripeSafePaymentMethodSummary = {
  paymentMethodBrand?: string;
  paymentMethodExpirationMonth?: number;
  paymentMethodExpirationYear?: number;
  paymentMethodLast4?: string;
  paymentMethodReference?: string;
  paymentMethodSummary?: string;
};

export function summarizeStripePaymentMethod(
  paymentMethod: Stripe.PaymentMethod
): StripeSafePaymentMethodSummary {
  const paymentMethodReference = /^pm_[A-Za-z0-9]+$/.test(paymentMethod.id)
    ? paymentMethod.id
    : undefined;
  const card = paymentMethod.type === "card" ? paymentMethod.card : undefined;

  if (!card?.last4) {
    return { paymentMethodReference };
  }

  const paymentMethodBrand = card.brand || undefined;
  const paymentMethodExpirationMonth = card.exp_month || undefined;
  const paymentMethodExpirationYear = card.exp_year || undefined;
  const paymentMethodLast4 = card.last4;
  const brand = paymentMethodBrand
    ? `${capitalize(paymentMethodBrand)} `
    : "";
  const expiration =
    paymentMethodExpirationMonth && paymentMethodExpirationYear
      ? `, expires ${paymentMethodExpirationMonth}/${paymentMethodExpirationYear}`
      : "";

  return {
    paymentMethodBrand,
    paymentMethodExpirationMonth,
    paymentMethodExpirationYear,
    paymentMethodLast4,
    paymentMethodReference,
    paymentMethodSummary: `${brand}ending ${paymentMethodLast4}${expiration}`
  };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
