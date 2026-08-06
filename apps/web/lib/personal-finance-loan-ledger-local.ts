import "server-only";

import {
  createPersonalFinanceId,
  openPersonalFinanceDatabase
} from "./personal-finance-db-local";

export type LoanCalculationMethod =
  | "monthly_amortization"
  | "daily_simple_interest"
  | "interest_only"
  | "manual";

export type LoanPaymentFrequency =
  | "weekly"
  | "biweekly"
  | "monthly";

export type LoanRateType =
  | "fixed"
  | "variable";

export type ConfigureLoanTermsInput = {
  liabilityId: string;
  calculationMethod:
    LoanCalculationMethod;
  annualInterestRate:
    number | string;
  originalTermMonths?:
    number | string | null;
  remainingTermMonths?:
    number | string | null;
  loanStartDate?: string | null;
  firstPaymentDate?: string | null;
  paymentFrequency?:
    LoanPaymentFrequency;
  scheduledPayment?:
    number | string | null;
  scheduledEscrow?:
    number | string | null;
  rateType?: LoanRateType;
  lastAccrualDate?: string | null;
};

export type ApplyLoanPaymentInput = {
  liabilityId?: string | null;
  obligationId?: string | null;
  sourceKey: string;
  paidOn: string;
  totalPayment: number | string;
  escrow?: number | string | null;
  fees?: number | string | null;
  extraPrincipal?: number | string | null;
  interestOverride?:
    number | string | null;
  note?: string | null;
};

export type LoanPaymentResult = {
  paymentId: string;
  liabilityId: string;
  obligationId: string | null;
  openingBalance: number;
  totalPayment: number;
  interest: number;
  principal: number;
  extraPrincipal: number;
  escrow: number;
  fees: number;
  closingBalance: number;
  calculationMethod:
    LoanCalculationMethod;
  paidOn: string;
};

type LoanTermsRow = {
  liability_id: string;
  calculation_method:
    LoanCalculationMethod;
  annual_interest_rate_basis_points:
    number;
  original_term_months: number | null;
  remaining_term_months: number | null;
  loan_start_date: string | null;
  first_payment_date: string | null;
  payment_frequency:
    LoanPaymentFrequency;
  scheduled_payment_cents:
    number | null;
  scheduled_escrow_cents: number;
  rate_type: LoanRateType;
  last_accrual_date: string | null;
};

export function configureLoanTerms(
  input: ConfigureLoanTermsInput
): void {
  assertLocalPersonalFinanceEnabled();

  const liabilityId = requiredText(
    input.liabilityId,
    "Liability ID"
  );

  const calculationMethod =
    validateCalculationMethod(
      input.calculationMethod
    );

  const annualInterestRate =
    requiredRate(
      input.annualInterestRate
    );

  const originalTermMonths =
    optionalPositiveInteger(
      input.originalTermMonths,
      "Original term"
    );

  const remainingTermMonths =
    optionalNonNegativeInteger(
      input.remainingTermMonths,
      "Remaining term"
    );

  const loanStartDate =
    optionalDate(
      input.loanStartDate,
      "Loan start date"
    );

  const firstPaymentDate =
    optionalDate(
      input.firstPaymentDate,
      "First payment date"
    );

  const lastAccrualDate =
    optionalDate(
      input.lastAccrualDate,
      "Last accrual date"
    );

  const paymentFrequency =
    validatePaymentFrequency(
      input.paymentFrequency ??
        "monthly"
    );

  const scheduledPayment =
    optionalMoney(
      input.scheduledPayment,
      "Scheduled payment"
    );

  const scheduledEscrow =
    optionalMoney(
      input.scheduledEscrow,
      "Scheduled escrow"
    ) ?? 0;

  const rateType =
    validateRateType(
      input.rateType ?? "fixed"
    );

  const database =
    openPersonalFinanceDatabase();

  try {
    assertLiabilityExists(
      database,
      liabilityId
    );

    database
      .prepare(`
        INSERT INTO loan_terms (
          liability_id,
          calculation_method,
          annual_interest_rate_basis_points,
          original_term_months,
          remaining_term_months,
          loan_start_date,
          first_payment_date,
          payment_frequency,
          scheduled_payment_cents,
          scheduled_escrow_cents,
          rate_type,
          last_accrual_date,
          updated_at
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (liability_id)
        DO UPDATE SET
          calculation_method =
            excluded.calculation_method,
          annual_interest_rate_basis_points =
            excluded.annual_interest_rate_basis_points,
          original_term_months =
            excluded.original_term_months,
          remaining_term_months =
            excluded.remaining_term_months,
          loan_start_date =
            excluded.loan_start_date,
          first_payment_date =
            excluded.first_payment_date,
          payment_frequency =
            excluded.payment_frequency,
          scheduled_payment_cents =
            excluded.scheduled_payment_cents,
          scheduled_escrow_cents =
            excluded.scheduled_escrow_cents,
          rate_type =
            excluded.rate_type,
          last_accrual_date =
            excluded.last_accrual_date,
          updated_at =
            CURRENT_TIMESTAMP
      `)
      .run(
        liabilityId,
        calculationMethod,
        Math.round(
          annualInterestRate * 100
        ),
        originalTermMonths,
        remainingTermMonths,
        loanStartDate,
        firstPaymentDate,
        paymentFrequency,
        scheduledPayment === null
          ? null
          : dollarsToCents(
              scheduledPayment
            ),
        dollarsToCents(
          scheduledEscrow
        ),
        rateType,
        lastAccrualDate
      );
  } finally {
    database.close();
  }
}

export function applyLoanPayment(
  input: ApplyLoanPaymentInput
): LoanPaymentResult {
  assertLocalPersonalFinanceEnabled();

  const sourceKey = requiredText(
    input.sourceKey,
    "Payment source key"
  );

  const paidOn = requiredDate(
    input.paidOn,
    "Payment date"
  );

  const totalPayment =
    requiredPositiveMoney(
      input.totalPayment,
      "Total payment"
    );

  const escrow =
    optionalMoney(
      input.escrow,
      "Escrow"
    ) ?? 0;

  const fees =
    optionalMoney(
      input.fees,
      "Fees"
    ) ?? 0;

  const requestedExtraPrincipal =
    optionalMoney(
      input.extraPrincipal,
      "Extra principal"
    ) ?? 0;

  const interestOverride =
    optionalMoney(
      input.interestOverride,
      "Interest override"
    );

  const database =
    openPersonalFinanceDatabase();

  try {
    const apply =
      database.transaction(() => {
        const liability =
          resolveLiability(
            database,
            input
          );

        const duplicate =
          database
            .prepare(`
              SELECT id
              FROM liability_payments
              WHERE source_key = ?
              LIMIT 1
            `)
            .get(sourceKey);

        if (duplicate) {
          throw new Error(
            "This payment has already been applied."
          );
        }

        const terms =
          readLoanTerms(
            database,
            liability.id
          );

        if (!terms) {
          throw new Error(
            "Loan terms must be configured before applying a payment."
          );
        }

        const openingBalanceCents =
          liability.current_balance_cents;

        const totalPaymentCents =
          dollarsToCents(
            totalPayment
          );

        const escrowCents =
          dollarsToCents(escrow);

        const feesCents =
          dollarsToCents(fees);

        const calculatedInterestCents =
          interestOverride === null
            ? calculateInterestCents({
                balanceCents:
                  openingBalanceCents,
                annualRateBasisPoints:
                  terms
                    .annual_interest_rate_basis_points,
                method:
                  terms.calculation_method,
                frequency:
                  terms.payment_frequency,
                previousAccrualDate:
                  terms.last_accrual_date,
                paidOn
              })
            : dollarsToCents(
                interestOverride
              );

        const availableForPrincipal =
          totalPaymentCents -
          escrowCents -
          feesCents -
          calculatedInterestCents;

        if (availableForPrincipal < 0) {
          throw new Error(
            "Payment is not large enough to cover interest, escrow, and fees."
          );
        }

        const principalCents =
          Math.min(
            openingBalanceCents,
            availableForPrincipal
          );

        const requestedExtraPrincipalCents =
          dollarsToCents(
            requestedExtraPrincipal
          );

        if (
          requestedExtraPrincipalCents >
          principalCents
        ) {
          throw new Error(
            "Extra principal cannot exceed the total principal applied."
          );
        }

        const closingBalanceCents =
          openingBalanceCents -
          principalCents;

        const paymentId =
          createPersonalFinanceId(
            "liability_payment",
            [
              liability.id,
              sourceKey,
              paidOn
            ]
          );

        database
          .prepare(`
            INSERT INTO liability_payments (
              id,
              liability_id,
              obligation_id,
              source_key,
              paid_on,
              total_payment_cents,
              interest_cents,
              principal_cents,
              escrow_cents,
              fees_cents,
              extra_principal_cents,
              opening_balance_cents,
              closing_balance_cents,
              calculation_method,
              note
            )
            VALUES (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?
            )
          `)
          .run(
            paymentId,
            liability.id,
            liability.obligation_id,
            sourceKey,
            paidOn,
            totalPaymentCents,
            calculatedInterestCents,
            principalCents,
            escrowCents,
            feesCents,
            requestedExtraPrincipalCents,
            openingBalanceCents,
            closingBalanceCents,
            terms.calculation_method,
            optionalText(input.note)
          );

        database
          .prepare(`
            UPDATE liabilities
            SET
              current_balance_cents = ?,
              balance_as_of = ?,
              updated_at =
                CURRENT_TIMESTAMP
            WHERE id = ?
          `)
          .run(
            closingBalanceCents,
            paidOn,
            liability.id
          );

        database
          .prepare(`
            UPDATE loan_terms
            SET
              last_accrual_date = ?,
              remaining_term_months =
                CASE
                  WHEN
                    payment_frequency =
                      'monthly' AND
                    remaining_term_months
                      IS NOT NULL AND
                    remaining_term_months > 0
                  THEN
                    remaining_term_months - 1
                  ELSE
                    remaining_term_months
                END,
              updated_at =
                CURRENT_TIMESTAMP
            WHERE liability_id = ?
          `)
          .run(
            paidOn,
            liability.id
          );

        database
          .prepare(`
            INSERT INTO
              liability_balance_history (
                id,
                liability_id,
                payment_id,
                balance_cents,
                balance_on,
                balance_kind,
                note
              )
            VALUES (
              ?,
              ?,
              ?,
              ?,
              ?,
              ?,
              ?
            )
          `)
          .run(
            createPersonalFinanceId(
              "liability_balance",
              [
                liability.id,
                paymentId,
                paidOn
              ]
            ),
            liability.id,
            paymentId,
            closingBalanceCents,
            paidOn,
            closingBalanceCents === 0
              ? "payoff"
              : "calculated",
            optionalText(input.note)
          );

        return {
          paymentId,
          liabilityId:
            liability.id,
          obligationId:
            liability.obligation_id,
          openingBalance:
            centsToDollars(
              openingBalanceCents
            ),
          totalPayment,
          interest:
            centsToDollars(
              calculatedInterestCents
            ),
          principal:
            centsToDollars(
              principalCents
            ),
          extraPrincipal:
            centsToDollars(
              requestedExtraPrincipalCents
            ),
          escrow,
          fees,
          closingBalance:
            centsToDollars(
              closingBalanceCents
            ),
          calculationMethod:
            terms.calculation_method,
          paidOn
        } satisfies LoanPaymentResult;
      });

    return apply.immediate();
  } finally {
    database.close();
  }
}

export function calculateScheduledPayment({
  principal,
  annualInterestRate,
  termMonths
}: {
  principal: number;
  annualInterestRate: number;
  termMonths: number;
}): number {
  if (
    !Number.isFinite(principal) ||
    principal < 0
  ) {
    throw new Error(
      "Principal must be zero or greater."
    );
  }

  if (
    !Number.isFinite(
      annualInterestRate
    ) ||
    annualInterestRate < 0
  ) {
    throw new Error(
      "Interest rate must be zero or greater."
    );
  }

  if (
    !Number.isInteger(termMonths) ||
    termMonths <= 0
  ) {
    throw new Error(
      "Loan term must be a positive number of months."
    );
  }

  if (principal === 0) {
    return 0;
  }

  const monthlyRate =
    annualInterestRate /
    100 /
    12;

  if (monthlyRate === 0) {
    return roundMoney(
      principal / termMonths
    );
  }

  const payment =
    principal *
    (
      monthlyRate *
      Math.pow(
        1 + monthlyRate,
        termMonths
      )
    ) /
    (
      Math.pow(
        1 + monthlyRate,
        termMonths
      ) - 1
    );

  return roundMoney(payment);
}

function resolveLiability(
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >,
  input: ApplyLoanPaymentInput
): {
  id: string;
  obligation_id: string | null;
  current_balance_cents: number;
} {
  const liabilityId =
    optionalText(
      input.liabilityId
    );

  const obligationId =
    optionalText(
      input.obligationId
    );

  if (!liabilityId && !obligationId) {
    throw new Error(
      "A liability or linked bill is required."
    );
  }

  const row = liabilityId
    ? database
        .prepare(`
          SELECT
            id,
            obligation_id,
            current_balance_cents
          FROM liabilities
          WHERE
            id = ? AND
            is_active = 1
          LIMIT 1
        `)
        .get(liabilityId)
    : database
        .prepare(`
          SELECT
            id,
            obligation_id,
            current_balance_cents
          FROM liabilities
          WHERE
            obligation_id = ? AND
            is_active = 1
          LIMIT 1
        `)
        .get(obligationId);

  if (!row) {
    throw new Error(
      "No active linked liability was found."
    );
  }

  return row as {
    id: string;
    obligation_id: string | null;
    current_balance_cents: number;
  };
}

function readLoanTerms(
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >,
  liabilityId: string
): LoanTermsRow | undefined {
  return database
    .prepare(`
      SELECT *
      FROM loan_terms
      WHERE liability_id = ?
      LIMIT 1
    `)
    .get(
      liabilityId
    ) as LoanTermsRow | undefined;
}

function calculateInterestCents({
  balanceCents,
  annualRateBasisPoints,
  method,
  frequency,
  previousAccrualDate,
  paidOn
}: {
  balanceCents: number;
  annualRateBasisPoints: number;
  method: LoanCalculationMethod;
  frequency: LoanPaymentFrequency;
  previousAccrualDate: string | null;
  paidOn: string;
}): number {
  if (
    method === "manual"
  ) {
    return 0;
  }

  const annualRate =
    annualRateBasisPoints /
    10_000;

  if (
    method ===
      "daily_simple_interest"
  ) {
    if (!previousAccrualDate) {
      throw new Error(
        "Daily-interest loans require a last accrual date or an interest override."
      );
    }

    const days =
      daysBetween(
        previousAccrualDate,
        paidOn
      );

    return Math.round(
      balanceCents *
      annualRate *
      days /
      365
    );
  }

  const periodsPerYear =
    frequency === "weekly"
      ? 52
      : frequency === "biweekly"
        ? 26
        : 12;

  return Math.round(
    balanceCents *
    annualRate /
    periodsPerYear
  );
}

function daysBetween(
  startDate: string,
  endDate: string
): number {
  const start = Date.parse(
    `${startDate}T00:00:00Z`
  );

  const end = Date.parse(
    `${endDate}T00:00:00Z`
  );

  const difference =
    Math.floor(
      (end - start) /
      86_400_000
    );

  if (difference < 0) {
    throw new Error(
      "Payment date cannot precede the last accrual date."
    );
  }

  return difference;
}

function assertLiabilityExists(
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >,
  liabilityId: string
): void {
  const row = database
    .prepare(`
      SELECT id
      FROM liabilities
      WHERE id = ?
      LIMIT 1
    `)
    .get(liabilityId);

  if (!row) {
    throw new Error(
      "Liability was not found."
    );
  }
}

function validateCalculationMethod(
  value: unknown
): LoanCalculationMethod {
  const allowed =
    new Set<LoanCalculationMethod>([
      "monthly_amortization",
      "daily_simple_interest",
      "interest_only",
      "manual"
    ]);

  if (!allowed.has(
    value as LoanCalculationMethod
  )) {
    throw new Error(
      "Loan calculation method is not valid."
    );
  }

  return value as
    LoanCalculationMethod;
}

function validatePaymentFrequency(
  value: unknown
): LoanPaymentFrequency {
  const allowed =
    new Set<LoanPaymentFrequency>([
      "weekly",
      "biweekly",
      "monthly"
    ]);

  if (!allowed.has(
    value as LoanPaymentFrequency
  )) {
    throw new Error(
      "Loan payment frequency is not valid."
    );
  }

  return value as
    LoanPaymentFrequency;
}

function validateRateType(
  value: unknown
): LoanRateType {
  if (
    value !== "fixed" &&
    value !== "variable"
  ) {
    throw new Error(
      "Loan rate type is not valid."
    );
  }

  return value;
}

function requiredRate(
  value: unknown
): number {
  const rate = Number(value);

  if (
    !Number.isFinite(rate) ||
    rate < 0 ||
    rate > 100
  ) {
    throw new Error(
      "Interest rate must be between zero and 100."
    );
  }

  return Math.round(
    rate * 100
  ) / 100;
}

function requiredPositiveMoney(
  value: unknown,
  label: string
): number {
  const amount =
    Number(value);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      `${label} must be greater than zero.`
    );
  }

  return roundMoney(amount);
}

function optionalMoney(
  value: unknown,
  label: string
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const amount =
    Number(value);

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error(
      `${label} must be zero or greater.`
    );
  }

  return roundMoney(amount);
}

function optionalPositiveInteger(
  value: unknown,
  label: string
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const integer = Number(value);

  if (
    !Number.isInteger(integer) ||
    integer <= 0
  ) {
    throw new Error(
      `${label} must be a positive whole number.`
    );
  }

  return integer;
}

function optionalNonNegativeInteger(
  value: unknown,
  label: string
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const integer = Number(value);

  if (
    !Number.isInteger(integer) ||
    integer < 0
  ) {
    throw new Error(
      `${label} must be zero or greater.`
    );
  }

  return integer;
}

function requiredText(
  value: unknown,
  label: string
): string {
  const text =
    optionalText(value);

  if (!text) {
    throw new Error(
      `${label} is required.`
    );
  }

  return text;
}

function optionalText(
  value: unknown
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const text =
    String(value).trim();

  return text || null;
}

function requiredDate(
  value: unknown,
  label: string
): string {
  const date =
    optionalDate(
      value,
      label
    );

  if (!date) {
    throw new Error(
      `${label} is required.`
    );
  }

  return date;
}

function optionalDate(
  value: unknown,
  label: string
): string | null {
  const text =
    optionalText(value);

  if (!text) {
    return null;
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      text
    ) ||
    Number.isNaN(
      Date.parse(
        `${text}T00:00:00Z`
      )
    )
  ) {
    throw new Error(
      `${label} must use YYYY-MM-DD.`
    );
  }

  return text;
}

function dollarsToCents(
  value: number
): number {
  return Math.round(
    value * 100
  );
}

function centsToDollars(
  value: number
): number {
  return value / 100;
}

function roundMoney(
  value: number
): number {
  return Math.round(
    value * 100
  ) / 100;
}

function assertLocalPersonalFinanceEnabled():
  void {
  if (
    process.env
      .ENABLE_LOCAL_PERSONAL_FINANCE !==
    "true"
  ) {
    throw new Error(
      "Local Personal Finance is disabled."
    );
  }
}
