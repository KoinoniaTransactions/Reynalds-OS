import "server-only";

import {
  createPersonalFinanceId,
  openPersonalFinanceDatabase
} from "./personal-finance-db-local";

export type PersonalFinanceObligationHomeKind =
  | "home"
  | "vehicle"
  | "household"
  | "debt"
  | "other";

export type PersonalFinanceObligationType =
  | "mortgage"
  | "rent"
  | "auto"
  | "utility"
  | "insurance"
  | "credit_card"
  | "loan"
  | "subscription"
  | "tax"
  | "membership"
  | "other";

export type PersonalFinanceObligationFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "annual"
  | "variable";

export type PersonalFinanceObligationPaymentMethod =
  | "autopay"
  | "bank_bill_pay"
  | "provider_website"
  | "phone"
  | "check"
  | "manual"
  | "other";

export type PersonalFinanceObligationHome = {
  id: string;
  name: string;
  kind: PersonalFinanceObligationHomeKind;
  description: string | null;
};

export type PersonalFinanceObligationAccount = {
  id: string;
  institution: string;
  name: string;
  lastFour: string | null;
};

export type PersonalFinanceObligation = {
  id: string;
  homeId: string | null;
  budgetItemKey: string | null;
  name: string;
  obligationType: PersonalFinanceObligationType;
  provider: string | null;
  accountLastFour: string | null;
  expectedAmount: number | null;
  dueDay: number | null;
  frequency: PersonalFinanceObligationFrequency;
  paymentMethod: PersonalFinanceObligationPaymentMethod;
  fundingAccountId: string | null;
  fundingAccountLabel: string | null;
  paymentUrl: string | null;
  isAutopay: boolean;
  notes: string | null;
  isActive: boolean;
};

export type PersonalFinanceObligationCatalog = {
  homes: PersonalFinanceObligationHome[];
  accounts: PersonalFinanceObligationAccount[];
  obligations: PersonalFinanceObligation[];
};

export type CreatePersonalFinanceObligationInput = {
  name: string;
  obligationType: PersonalFinanceObligationType;
  homeName?: string | null;
  homeKind?: PersonalFinanceObligationHomeKind | null;
  budgetItemKey?: string | null;
  provider?: string | null;
  accountLastFour?: string | null;
  expectedAmount?: number | string | null;
  dueDay?: number | string | null;
  frequency?: PersonalFinanceObligationFrequency;
  paymentMethod?: PersonalFinanceObligationPaymentMethod;
  fundingAccountId?: string | null;
  fundingAccountLabel?: string | null;
  paymentUrl?: string | null;
  isAutopay?: boolean;
  notes?: string | null;
};

const HOME_KINDS = new Set<PersonalFinanceObligationHomeKind>([
  "home",
  "vehicle",
  "household",
  "debt",
  "other"
]);

const OBLIGATION_TYPES = new Set<PersonalFinanceObligationType>([
  "mortgage",
  "rent",
  "auto",
  "utility",
  "insurance",
  "credit_card",
  "loan",
  "subscription",
  "tax",
  "membership",
  "other"
]);

const FREQUENCIES = new Set<PersonalFinanceObligationFrequency>([
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "semiannual",
  "annual",
  "variable"
]);

const PAYMENT_METHODS =
  new Set<PersonalFinanceObligationPaymentMethod>([
    "autopay",
    "bank_bill_pay",
    "provider_website",
    "phone",
    "check",
    "manual",
    "other"
  ]);

export function readPersonalFinanceObligationCatalog():
  PersonalFinanceObligationCatalog {
  assertLocalPersonalFinanceEnabled();

  const database = openPersonalFinanceDatabase();

  try {
    return readCatalog(database);
  } finally {
    database.close();
  }
}

export function createPersonalFinanceObligation(
  input: CreatePersonalFinanceObligationInput
): PersonalFinanceObligation {
  assertLocalPersonalFinanceEnabled();

  const name = requiredText(input.name, "Bill name");
  const obligationType = validateSetValue(
    input.obligationType,
    OBLIGATION_TYPES,
    "Bill type"
  );

  const homeKind = input.homeKind
    ? validateSetValue(
        input.homeKind,
        HOME_KINDS,
        "Financial home type"
      )
    : "other";

  const frequency = validateSetValue(
    input.frequency ?? "monthly",
    FREQUENCIES,
    "Payment frequency"
  );

  const paymentMethod = validateSetValue(
    input.paymentMethod ??
      (input.isAutopay ? "autopay" : "manual"),
    PAYMENT_METHODS,
    "Payment method"
  );

  const expectedAmount = optionalAmount(
    input.expectedAmount
  );

  const dueDay = optionalDueDay(input.dueDay);
  const accountLastFour = optionalLastFour(
    input.accountLastFour
  );

  const paymentUrl = optionalPaymentUrl(
    input.paymentUrl
  );

  const database = openPersonalFinanceDatabase();

  try {
    const create = database.transaction(() => {
      const homeId = resolveHome({
        database,
        homeName: optionalText(input.homeName),
        homeKind
      });

      const fundingAccountId = optionalText(
        input.fundingAccountId
      );

      if (fundingAccountId) {
        const fundingAccount = database
          .prepare(`
            SELECT id
            FROM accounts
            WHERE
              id = ? AND
              is_active = 1
          `)
          .get(fundingAccountId);

        if (!fundingAccount) {
          throw new Error(
            "The selected funding account was not found."
          );
        }
      }

      const id = createPersonalFinanceId(
        "obligation",
        [
          name,
          optionalText(input.provider) ?? "",
          homeId ?? "",
          new Date().toISOString()
        ]
      );

      database
        .prepare(`
          INSERT INTO obligations (
            id,
            home_id,
            budget_item_key,
            name,
            obligation_type,
            provider,
            account_last_four,
            expected_amount_cents,
            due_day,
            frequency,
            payment_method,
            funding_account_id,
            funding_account_label,
            payment_url,
            is_autopay,
            notes
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
            ?,
            ?
          )
        `)
        .run(
          id,
          homeId,
          optionalText(input.budgetItemKey),
          name,
          obligationType,
          optionalText(input.provider),
          accountLastFour,
          expectedAmount === null
            ? null
            : Math.round(expectedAmount * 100),
          dueDay,
          frequency,
          paymentMethod,
          fundingAccountId,
          optionalText(input.fundingAccountLabel),
          paymentUrl,
          input.isAutopay ? 1 : 0,
          optionalText(input.notes)
        );

      const catalog = readCatalog(database);

      const created = catalog.obligations.find(
        (obligation) => obligation.id === id
      );

      if (!created) {
        throw new Error(
          "The new bill could not be loaded."
        );
      }

      return created;
    });

    return create.immediate();
  } finally {
    database.close();
  }
}

function readCatalog(
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >
): PersonalFinanceObligationCatalog {
  const homes = database
    .prepare(`
      SELECT
        id,
        name,
        kind,
        description
      FROM obligation_homes
      ORDER BY
        CASE kind
          WHEN 'home' THEN 1
          WHEN 'vehicle' THEN 2
          WHEN 'household' THEN 3
          WHEN 'debt' THEN 4
          ELSE 5
        END,
        name COLLATE NOCASE
    `)
    .all() as Array<{
      id: string;
      name: string;
      kind: PersonalFinanceObligationHomeKind;
      description: string | null;
    }>;

  const accounts = database
    .prepare(`
      SELECT
        id,
        institution,
        name,
        last_four
      FROM accounts
      WHERE is_active = 1
      ORDER BY
        institution COLLATE NOCASE,
        name COLLATE NOCASE
    `)
    .all() as Array<{
      id: string;
      institution: string;
      name: string;
      last_four: string | null;
    }>;

  const obligations = database
    .prepare(`
      SELECT
        id,
        home_id,
        budget_item_key,
        name,
        obligation_type,
        provider,
        account_last_four,
        expected_amount_cents,
        due_day,
        frequency,
        payment_method,
        funding_account_id,
        funding_account_label,
        payment_url,
        is_autopay,
        notes,
        is_active
      FROM obligations
      WHERE is_active = 1
      ORDER BY
        CASE
          WHEN due_day IS NULL THEN 1
          ELSE 0
        END,
        due_day,
        name COLLATE NOCASE
    `)
    .all() as Array<{
      id: string;
      home_id: string | null;
      budget_item_key: string | null;
      name: string;
      obligation_type:
        PersonalFinanceObligationType;
      provider: string | null;
      account_last_four: string | null;
      expected_amount_cents: number | null;
      due_day: number | null;
      frequency:
        PersonalFinanceObligationFrequency;
      payment_method:
        PersonalFinanceObligationPaymentMethod;
      funding_account_id: string | null;
      funding_account_label: string | null;
      payment_url: string | null;
      is_autopay: number;
      notes: string | null;
      is_active: number;
    }>;

  return {
    homes,
    accounts: accounts.map((account) => ({
      id: account.id,
      institution: account.institution,
      name: account.name,
      lastFour: account.last_four
    })),
    obligations: obligations.map(
      (obligation) => ({
        id: obligation.id,
        homeId: obligation.home_id,
        budgetItemKey:
          obligation.budget_item_key,
        name: obligation.name,
        obligationType:
          obligation.obligation_type,
        provider: obligation.provider,
        accountLastFour:
          obligation.account_last_four,
        expectedAmount:
          obligation.expected_amount_cents === null
            ? null
            : obligation.expected_amount_cents /
              100,
        dueDay: obligation.due_day,
        frequency: obligation.frequency,
        paymentMethod:
          obligation.payment_method,
        fundingAccountId:
          obligation.funding_account_id,
        fundingAccountLabel:
          obligation.funding_account_label,
        paymentUrl: obligation.payment_url,
        isAutopay:
          obligation.is_autopay === 1,
        notes: obligation.notes,
        isActive:
          obligation.is_active === 1
      })
    )
  };
}

function resolveHome({
  database,
  homeName,
  homeKind
}: {
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >;
  homeName: string | null;
  homeKind:
    PersonalFinanceObligationHomeKind;
}): string | null {
  if (!homeName) {
    return null;
  }

  const existing = database
    .prepare(`
      SELECT id
      FROM obligation_homes
      WHERE lower(name) = lower(?)
      LIMIT 1
    `)
    .get(homeName) as
    | { id: string }
    | undefined;

  if (existing) {
    return existing.id;
  }

  const id = createPersonalFinanceId(
    "obligation_home",
    [homeName, homeKind]
  );

  database
    .prepare(`
      INSERT INTO obligation_homes (
        id,
        name,
        kind
      )
      VALUES (?, ?, ?)
    `)
    .run(id, homeName, homeKind);

  return id;
}

function assertLocalPersonalFinanceEnabled():
  void {
  if (
    process.env.ENABLE_LOCAL_PERSONAL_FINANCE !==
    "true"
  ) {
    throw new Error(
      "Local personal finance is disabled."
    );
  }
}

function requiredText(
  value: unknown,
  label: string
): string {
  const normalized = optionalText(value);

  if (!normalized) {
    throw new Error(`${label} is required.`);
  }

  return normalized;
}

function optionalText(
  value: unknown
): string | null {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  return value.trim();
}

function optionalAmount(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const amount = Number(value);

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error(
      "Expected amount must be zero or greater."
    );
  }

  return (
    Math.round(amount * 100) / 100
  );
}

function optionalDueDay(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const dueDay = Number(value);

  if (
    !Number.isInteger(dueDay) ||
    dueDay < 1 ||
    dueDay > 31
  ) {
    throw new Error(
      "Due day must be between 1 and 31."
    );
  }

  return dueDay;
}

function optionalLastFour(
  value: unknown
): string | null {
  const normalized = optionalText(value);

  if (!normalized) {
    return null;
  }

  if (
    !/^[A-Za-z0-9]{2,4}$/.test(
      normalized
    )
  ) {
    throw new Error(
      "Account identifier must contain two to four letters or numbers."
    );
  }

  return normalized;
}

function optionalPaymentUrl(
  value: unknown
): string | null {
  const normalized = optionalText(value);

  if (!normalized) {
    return null;
  }

  let parsed: URL;

  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error(
      "Payment URL must be a valid web address."
    );
  }

  if (
    parsed.protocol !== "https:" &&
    parsed.protocol !== "http:"
  ) {
    throw new Error(
      "Payment URL must use HTTP or HTTPS."
    );
  }

  return parsed.toString();
}

function validateSetValue<T extends string>(
  value: unknown,
  allowed: ReadonlySet<T>,
  label: string
): T {
  if (
    typeof value !== "string" ||
    !allowed.has(value as T)
  ) {
    throw new Error(
      `${label} is not valid.`
    );
  }

  return value as T;
}
