import "server-only";

import {
  createPersonalFinanceId,
  openPersonalFinanceDatabase
} from "./personal-finance-db-local";

import {
  encryptPersonalFinanceValue
} from "./personal-finance-sensitive-local";

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

  assetName?: string | null;
  assetValue?: number | string | null;
  assetValuedOn?: string | null;
  currentBalance?: number | string | null;
  originalBalance?: number | string | null;
  interestRate?: number | string | null;
  minimumPayment?: number | string | null;
  escrowPayment?: number | string | null;
  maturityDate?: string | null;
  fullAccountNumber?: string | null;
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

  const financedAssetInput =
    normalizeFinancedAssetInput({
      obligationType,
      assetName:
        optionalText(input.assetName) ??
        optionalText(input.homeName),
      assetValue:
        optionalAmount(input.assetValue),
      assetValuedOn:
        optionalDate(
          input.assetValuedOn,
          "Asset valuation date"
        ),
      currentBalance:
        optionalAmount(input.currentBalance),
      originalBalance:
        optionalAmount(input.originalBalance),
      interestRate:
        optionalInterestRate(
          input.interestRate
        ),
      minimumPayment:
        optionalAmount(input.minimumPayment),
      escrowPayment:
        optionalAmount(input.escrowPayment),
      maturityDate:
        optionalDate(
          input.maturityDate,
          "Maturity date"
        ),
      fullAccountNumber:
        optionalText(
          input.fullAccountNumber
        )
    });

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

      if (financedAssetInput) {
        createFinancedAssetRecords({
          database,
          obligationId: id,
          obligationName: name,
          provider:
            optionalText(input.provider),
          input: financedAssetInput
        });
      }

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

type FinancedAssetInput = {
  obligationType: "mortgage" | "auto";
  assetName: string;
  assetValue: number;
  assetValuedOn: string;
  currentBalance: number;
  originalBalance: number | null;
  interestRate: number | null;
  minimumPayment: number | null;
  escrowPayment: number | null;
  maturityDate: string | null;
  fullAccountNumber: string | null;
};

function normalizeFinancedAssetInput({
  obligationType,
  assetName,
  assetValue,
  assetValuedOn,
  currentBalance,
  originalBalance,
  interestRate,
  minimumPayment,
  escrowPayment,
  maturityDate,
  fullAccountNumber
}: {
  obligationType:
    PersonalFinanceObligationType;
  assetName: string | null;
  assetValue: number | null;
  assetValuedOn: string | null;
  currentBalance: number | null;
  originalBalance: number | null;
  interestRate: number | null;
  minimumPayment: number | null;
  escrowPayment: number | null;
  maturityDate: string | null;
  fullAccountNumber: string | null;
}): FinancedAssetInput | null {
  if (
    obligationType !== "mortgage" &&
    obligationType !== "auto"
  ) {
    return null;
  }

  const hasFinancialDetails =
    assetValue !== null ||
    currentBalance !== null ||
    originalBalance !== null ||
    interestRate !== null ||
    fullAccountNumber !== null;

  if (!hasFinancialDetails) {
    return null;
  }

  if (!assetName) {
    throw new Error(
      "Asset name is required for a financed asset."
    );
  }

  if (assetValue === null) {
    throw new Error(
      "Asset value is required for a financed asset."
    );
  }

  if (currentBalance === null) {
    throw new Error(
      "Current loan balance is required for a financed asset."
    );
  }

  return {
    obligationType,
    assetName,
    assetValue,
    assetValuedOn:
      assetValuedOn ??
      new Date().toISOString().slice(0, 10),
    currentBalance,
    originalBalance,
    interestRate,
    minimumPayment,
    escrowPayment,
    maturityDate,
    fullAccountNumber
  };
}

function createFinancedAssetRecords({
  database,
  obligationId,
  obligationName,
  provider,
  input
}: {
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >;
  obligationId: string;
  obligationName: string;
  provider: string | null;
  input: FinancedAssetInput;
}): void {
  const assetType =
    input.obligationType === "mortgage"
      ? "real_estate"
      : "vehicle";

  const liabilityType =
    input.obligationType === "mortgage"
      ? "mortgage"
      : "auto_loan";

  const existingAsset = database
    .prepare(`
      SELECT id
      FROM assets
      WHERE
        lower(name) = lower(?) AND
        asset_type = ? AND
        is_active = 1
      LIMIT 1
    `)
    .get(
      input.assetName,
      assetType
    ) as
    | { id: string }
    | undefined;

  const assetId =
    existingAsset?.id ??
    createPersonalFinanceId(
      "asset",
      [
        assetType,
        input.assetName
      ]
    );

  if (!existingAsset) {
    database
      .prepare(`
        INSERT INTO assets (
          id,
          name,
          asset_type,
          institution,
          description
        )
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        assetId,
        input.assetName,
        assetType,
        provider,
        `Created from ${obligationName} bill setup.`
      );
  }

  database
    .prepare(`
      INSERT INTO asset_valuations (
        id,
        asset_id,
        value_cents,
        valued_on,
        source,
        note
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (
        asset_id,
        valued_on
      )
      DO UPDATE SET
        value_cents =
          excluded.value_cents,
        source =
          excluded.source,
        note =
          excluded.note
    `)
    .run(
      createPersonalFinanceId(
        "asset_valuation",
        [
          assetId,
          input.assetValuedOn
        ]
      ),
      assetId,
      Math.round(
        input.assetValue * 100
      ),
      input.assetValuedOn,
      "Bills workspace",
      `Updated from ${obligationName}.`
    );

  const liabilityId =
    createPersonalFinanceId(
      "liability",
      [
        obligationId,
        liabilityType
      ]
    );

  database
    .prepare(`
      INSERT INTO liabilities (
        id,
        obligation_id,
        linked_asset_id,
        name,
        liability_type,
        institution,
        original_balance_cents,
        current_balance_cents,
        balance_as_of,
        interest_rate_basis_points,
        minimum_payment_cents,
        escrow_payment_cents,
        maturity_date
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
        ?
      )
    `)
    .run(
      liabilityId,
      obligationId,
      assetId,
      obligationName,
      liabilityType,
      provider,
      input.originalBalance === null
        ? null
        : Math.round(
            input.originalBalance * 100
          ),
      Math.round(
        input.currentBalance * 100
      ),
      input.assetValuedOn,
      input.interestRate === null
        ? null
        : Math.round(
            input.interestRate * 100
          ),
      input.minimumPayment === null
        ? null
        : Math.round(
            input.minimumPayment * 100
          ),
      input.escrowPayment === null
        ? null
        : Math.round(
            input.escrowPayment * 100
          ),
      input.maturityDate
    );

  if (!input.fullAccountNumber) {
    return;
  }

  const encrypted =
    encryptPersonalFinanceValue(
      input.fullAccountNumber
    );

  for (
    const [ownerType, ownerId]
    of [
      ["obligation", obligationId],
      ["liability", liabilityId]
    ] as const
  ) {
    database
      .prepare(`
        INSERT INTO sensitive_values (
          id,
          owner_type,
          owner_id,
          field_name,
          ciphertext,
          initialization_vector,
          authentication_tag,
          key_version,
          last_four
        )
        VALUES (
          ?,
          ?,
          ?,
          'account_number',
          ?,
          ?,
          ?,
          ?,
          ?
        )
      `)
      .run(
        createPersonalFinanceId(
          "sensitive_value",
          [
            ownerType,
            ownerId,
            "account_number"
          ]
        ),
        ownerType,
        ownerId,
        encrypted.ciphertext,
        encrypted.initializationVector,
        encrypted.authenticationTag,
        encrypted.keyVersion,
        encrypted.lastFour
      );
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

function optionalInterestRate(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

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

  return Math.round(rate * 100) / 100;
}

function optionalDate(
  value: unknown,
  label: string
): string | null {
  const normalized =
    optionalText(value);

  if (!normalized) {
    return null;
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      normalized
    ) ||
    Number.isNaN(
      Date.parse(
        `${normalized}T00:00:00Z`
      )
    )
  ) {
    throw new Error(
      `${label} must use YYYY-MM-DD.`
    );
  }

  return normalized;
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
