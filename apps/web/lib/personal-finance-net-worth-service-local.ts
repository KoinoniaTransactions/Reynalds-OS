import "server-only";

import {
  createPersonalFinanceId,
  openPersonalFinanceDatabase
} from "./personal-finance-db-local";

import {
  calculatePersonalFinanceNetWorth,
  type PersonalFinanceNetWorth
} from "./personal-finance-net-worth-local";

import {
  encryptPersonalFinanceValue,
  maskSensitiveValue
} from "./personal-finance-sensitive-local";

export type PersonalFinanceAssetType =
  | "cash"
  | "checking"
  | "savings"
  | "investment"
  | "real_estate"
  | "vehicle"
  | "business"
  | "personal_property"
  | "other";

export type PersonalFinanceLiabilityType =
  | "mortgage"
  | "home_equity"
  | "auto_loan"
  | "credit_card"
  | "personal_loan"
  | "student_loan"
  | "tax_debt"
  | "medical_debt"
  | "other";

export type PersonalFinanceAssetRecord = {
  id: string;
  name: string;
  assetType: PersonalFinanceAssetType;
  institution: string | null;
  description: string | null;
  value: number;
  valuedOn: string;
  valuationSource: string | null;
};

export type PersonalFinanceLiabilityRecord = {
  id: string;
  obligationId: string | null;
  linkedAssetId: string | null;
  name: string;
  liabilityType: PersonalFinanceLiabilityType;
  institution: string | null;
  originalBalance: number | null;
  currentBalance: number;
  balanceAsOf: string | null;
  interestRate: number | null;
  minimumPayment: number | null;
  escrowPayment: number | null;
  creditLimit: number | null;
  maturityDate: string | null;
  maskedAccountNumber: string | null;
};

export type PersonalFinanceNetWorthCatalog = {
  assets: PersonalFinanceAssetRecord[];
  liabilities: PersonalFinanceLiabilityRecord[];
  summary: PersonalFinanceNetWorth;
};

export type CreatePersonalFinanceAssetInput = {
  recordType: "asset";
  name: string;
  assetType: PersonalFinanceAssetType;
  institution?: string | null;
  description?: string | null;
  value: number | string;
  valuedOn: string;
  valuationSource?: string | null;
  accountNumber?: string | null;

  hasAttachedLiability?: boolean;
  liabilityName?: string | null;
  liabilityType?:
    PersonalFinanceLiabilityType | null;
  liabilityInstitution?: string | null;
  originalBalance?: number | string | null;
  currentBalance?: number | string | null;
  balanceAsOf?: string | null;
  interestRate?: number | string | null;
  minimumPayment?: number | string | null;
  escrowPayment?: number | string | null;
  maturityDate?: string | null;
  liabilityAccountNumber?: string | null;

  createRecurringBill?: boolean;
  billName?: string | null;
  billDueDay?: number | string | null;
  billFrequency?:
    | "weekly"
    | "biweekly"
    | "monthly"
    | "quarterly"
    | "semiannual"
    | "annual"
    | "variable";
  billPaymentMethod?:
    | "autopay"
    | "bank_bill_pay"
    | "provider_website"
    | "phone"
    | "check"
    | "manual"
    | "other";
  billIsAutopay?: boolean;
};

export type CreatePersonalFinanceLiabilityInput = {
  recordType: "liability";
  name: string;
  liabilityType: PersonalFinanceLiabilityType;
  obligationId?: string | null;
  linkedAssetId?: string | null;
  institution?: string | null;
  originalBalance?: number | string | null;
  currentBalance: number | string;
  balanceAsOf?: string | null;
  interestRate?: number | string | null;
  minimumPayment?: number | string | null;
  escrowPayment?: number | string | null;
  creditLimit?: number | string | null;
  maturityDate?: string | null;
  accountNumber?: string | null;
};

export type CreatePersonalFinanceNetWorthRecordInput =
  | CreatePersonalFinanceAssetInput
  | CreatePersonalFinanceLiabilityInput;

const ASSET_TYPES =
  new Set<PersonalFinanceAssetType>([
    "cash",
    "checking",
    "savings",
    "investment",
    "real_estate",
    "vehicle",
    "business",
    "personal_property",
    "other"
  ]);

const LIABILITY_TYPES =
  new Set<PersonalFinanceLiabilityType>([
    "mortgage",
    "home_equity",
    "auto_loan",
    "credit_card",
    "personal_loan",
    "student_loan",
    "tax_debt",
    "medical_debt",
    "other"
  ]);

export function readPersonalFinanceNetWorthCatalog():
  PersonalFinanceNetWorthCatalog {
  assertLocalPersonalFinanceEnabled();

  const database =
    openPersonalFinanceDatabase();

  try {
    return readCatalog(database);
  } finally {
    database.close();
  }
}

export function createPersonalFinanceNetWorthRecord(
  input: CreatePersonalFinanceNetWorthRecordInput
): PersonalFinanceNetWorthCatalog {
  assertLocalPersonalFinanceEnabled();

  if (input.recordType === "asset") {
    return createAsset(input);
  }

  if (input.recordType === "liability") {
    return createLiability(input);
  }

  throw new Error(
    "Record type must be asset or liability."
  );
}

function createAsset(
  input: CreatePersonalFinanceAssetInput
): PersonalFinanceNetWorthCatalog {
  const name =
    requiredText(input.name, "Asset name");

  const assetType =
    validateSetValue(
      input.assetType,
      ASSET_TYPES,
      "Asset type"
    );

  const value =
    requiredMoney(
      input.value,
      "Asset value"
    );

  const valuedOn =
    requiredDate(
      input.valuedOn,
      "Valuation date"
    );

  const attachedLiability =
    input.hasAttachedLiability
      ? normalizeAttachedLiability({
          assetName: name,
          assetType,
          institution:
            optionalText(
              input.liabilityInstitution
            ) ??
            optionalText(
              input.institution
            ),
          liabilityName:
            optionalText(
              input.liabilityName
            ),
          liabilityType:
            input.liabilityType,
          originalBalance:
            optionalMoney(
              input.originalBalance,
              "Original balance"
            ),
          currentBalance:
            requiredMoney(
              input.currentBalance,
              "Current balance"
            ),
          balanceAsOf:
            optionalDate(
              input.balanceAsOf,
              "Balance date"
            ) ??
            valuedOn,
          interestRate:
            optionalRate(
              input.interestRate
            ),
          minimumPayment:
            optionalMoney(
              input.minimumPayment,
              "Regular payment"
            ),
          escrowPayment:
            optionalMoney(
              input.escrowPayment,
              "Escrow payment"
            ),
          maturityDate:
            optionalDate(
              input.maturityDate,
              "Maturity date"
            ),
          accountNumber:
            optionalText(
              input.liabilityAccountNumber
            ),
          createRecurringBill:
            Boolean(
              input.createRecurringBill
            ),
          billName:
            optionalText(
              input.billName
            ),
          billDueDay:
            optionalDueDay(
              input.billDueDay
            ),
          billFrequency:
            input.billFrequency ??
            "monthly",
          billPaymentMethod:
            input.billPaymentMethod ??
            (
              input.billIsAutopay
                ? "autopay"
                : "manual"
            ),
          billIsAutopay:
            Boolean(
              input.billIsAutopay
            )
        })
      : null;

  const database =
    openPersonalFinanceDatabase();

  try {
    const create =
      database.transaction(() => {
        const now =
          new Date().toISOString();

        const id =
          createPersonalFinanceId(
            "asset",
            [
              name,
              assetType,
              now
            ]
          );

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
            id,
            name,
            assetType,
            optionalText(
              input.institution
            ),
            optionalText(
              input.description
            )
          );

        database
          .prepare(`
            INSERT INTO asset_valuations (
              id,
              asset_id,
              value_cents,
              valued_on,
              source
            )
            VALUES (?, ?, ?, ?, ?)
          `)
          .run(
            createPersonalFinanceId(
              "asset_valuation",
              [
                id,
                valuedOn,
                value
              ]
            ),
            id,
            dollarsToCents(value),
            valuedOn,
            optionalText(
              input.valuationSource
            )
          );

        storeSensitiveAccountNumber({
          database,
          ownerType: "asset",
          ownerId: id,
          accountNumber:
            optionalText(
              input.accountNumber
            )
        });

        if (attachedLiability) {
          createAttachedLiability({
            database,
            assetId: id,
            assetName: name,
            assetType,
            input: attachedLiability
          });
        }

        return readCatalog(database);
      });

    return create.immediate();
  } finally {
    database.close();
  }
}

type AttachedLiabilityInput = {
  liabilityName: string;
  liabilityType:
    PersonalFinanceLiabilityType;
  institution: string | null;
  originalBalance: number | null;
  currentBalance: number;
  balanceAsOf: string;
  interestRate: number | null;
  minimumPayment: number | null;
  escrowPayment: number | null;
  maturityDate: string | null;
  accountNumber: string | null;
  createRecurringBill: boolean;
  billName: string;
  billDueDay: number | null;
  billFrequency:
    | "weekly"
    | "biweekly"
    | "monthly"
    | "quarterly"
    | "semiannual"
    | "annual"
    | "variable";
  billPaymentMethod:
    | "autopay"
    | "bank_bill_pay"
    | "provider_website"
    | "phone"
    | "check"
    | "manual"
    | "other";
  billIsAutopay: boolean;
};

function normalizeAttachedLiability({
  assetName,
  assetType,
  institution,
  liabilityName,
  liabilityType,
  originalBalance,
  currentBalance,
  balanceAsOf,
  interestRate,
  minimumPayment,
  escrowPayment,
  maturityDate,
  accountNumber,
  createRecurringBill,
  billName,
  billDueDay,
  billFrequency,
  billPaymentMethod,
  billIsAutopay
}: {
  assetName: string;
  assetType:
    PersonalFinanceAssetType;
  institution: string | null;
  liabilityName: string | null;
  liabilityType:
    PersonalFinanceLiabilityType |
    null |
    undefined;
  originalBalance: number | null;
  currentBalance: number;
  balanceAsOf: string;
  interestRate: number | null;
  minimumPayment: number | null;
  escrowPayment: number | null;
  maturityDate: string | null;
  accountNumber: string | null;
  createRecurringBill: boolean;
  billName: string | null;
  billDueDay: number | null;
  billFrequency:
    AttachedLiabilityInput[
      "billFrequency"
    ];
  billPaymentMethod:
    AttachedLiabilityInput[
      "billPaymentMethod"
    ];
  billIsAutopay: boolean;
}): AttachedLiabilityInput {
  const defaultLiabilityType:
    PersonalFinanceLiabilityType =
      assetType === "real_estate"
        ? "mortgage"
        : assetType === "vehicle"
          ? "auto_loan"
          : "other";

  const resolvedLiabilityType =
    liabilityType ??
    defaultLiabilityType;

  if (
    !LIABILITY_TYPES.has(
      resolvedLiabilityType
    )
  ) {
    throw new Error(
      "Liability type is not valid."
    );
  }

  if (
    assetType === "real_estate" &&
    resolvedLiabilityType !==
      "mortgage" &&
    resolvedLiabilityType !==
      "home_equity"
  ) {
    throw new Error(
      "Real estate must be linked to a mortgage or home-equity liability."
    );
  }

  if (
    assetType === "vehicle" &&
    resolvedLiabilityType !==
      "auto_loan"
  ) {
    throw new Error(
      "A vehicle must be linked to an auto-loan liability."
    );
  }

  if (
    !Number.isInteger(billDueDay) &&
    billDueDay !== null
  ) {
    throw new Error(
      "Due day must be between 1 and 31."
    );
  }

  const resolvedName =
    liabilityName ??
    (
      assetType === "real_estate"
        ? `${assetName} mortgage`
        : assetType === "vehicle"
          ? `${assetName} auto loan`
          : `${assetName} liability`
    );

  return {
    liabilityName: resolvedName,
    liabilityType:
      resolvedLiabilityType,
    institution,
    originalBalance,
    currentBalance,
    balanceAsOf,
    interestRate,
    minimumPayment,
    escrowPayment,
    maturityDate,
    accountNumber,
    createRecurringBill,
    billName:
      billName ??
      resolvedName,
    billDueDay,
    billFrequency,
    billPaymentMethod,
    billIsAutopay
  };
}

function createAttachedLiability({
  database,
  assetId,
  assetName,
  assetType,
  input
}: {
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >;
  assetId: string;
  assetName: string;
  assetType:
    PersonalFinanceAssetType;
  input: AttachedLiabilityInput;
}): void {
  let obligationId: string | null =
    null;

  if (input.createRecurringBill) {
    const homeKind =
      assetType === "real_estate"
        ? "home"
        : assetType === "vehicle"
          ? "vehicle"
          : "other";

    const existingHome =
      database
        .prepare(`
          SELECT id
          FROM obligation_homes
          WHERE
            lower(name) = lower(?) AND
            kind = ?
          LIMIT 1
        `)
        .get(
          assetName,
          homeKind
        ) as
        | { id: string }
        | undefined;

    const homeId =
      existingHome?.id ??
      createPersonalFinanceId(
        "obligation_home",
        [
          assetName,
          homeKind
        ]
      );

    if (!existingHome) {
      database
        .prepare(`
          INSERT INTO obligation_homes (
            id,
            name,
            kind
          )
          VALUES (?, ?, ?)
        `)
        .run(
          homeId,
          assetName,
          homeKind
        );
    }

    obligationId =
      createPersonalFinanceId(
        "obligation",
        [
          assetId,
          input.billName,
          input.liabilityType
        ]
      );

    const obligationType =
      input.liabilityType ===
        "mortgage" ||
      input.liabilityType ===
        "home_equity"
        ? "mortgage"
        : input.liabilityType ===
            "auto_loan"
          ? "auto"
          : "loan";

    database
      .prepare(`
        INSERT INTO obligations (
          id,
          home_id,
          name,
          obligation_type,
          provider,
          account_last_four,
          expected_amount_cents,
          due_day,
          frequency,
          payment_method,
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
          ?
        )
      `)
      .run(
        obligationId,
        homeId,
        input.billName,
        obligationType,
        input.institution,
        lastFour(
          input.accountNumber
        ),
        input.minimumPayment === null
          ? null
          : dollarsToCents(
              input.minimumPayment
            ),
        input.billDueDay,
        input.billFrequency,
        input.billPaymentMethod,
        input.billIsAutopay
          ? 1
          : 0,
        "Created from the Net Worth asset workflow."
      );
  }

  const liabilityId =
    createPersonalFinanceId(
      "liability",
      [
        assetId,
        input.liabilityName,
        input.liabilityType
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
      input.liabilityName,
      input.liabilityType,
      input.institution,
      input.originalBalance === null
        ? null
        : dollarsToCents(
            input.originalBalance
          ),
      dollarsToCents(
        input.currentBalance
      ),
      input.balanceAsOf,
      input.interestRate === null
        ? null
        : Math.round(
            input.interestRate * 100
          ),
      input.minimumPayment === null
        ? null
        : dollarsToCents(
            input.minimumPayment
          ),
      input.escrowPayment === null
        ? null
        : dollarsToCents(
            input.escrowPayment
          ),
      input.maturityDate
    );

  storeSensitiveAccountNumber({
    database,
    ownerType: "liability",
    ownerId: liabilityId,
    accountNumber:
      input.accountNumber
  });

  if (
    obligationId &&
    input.accountNumber
  ) {
    storeSensitiveAccountNumber({
      database,
      ownerType: "obligation",
      ownerId: obligationId,
      accountNumber:
        input.accountNumber
    });
  }
}

function createLiability(
  input:
    CreatePersonalFinanceLiabilityInput
): PersonalFinanceNetWorthCatalog {
  const name =
    requiredText(
      input.name,
      "Liability name"
    );

  const liabilityType =
    validateSetValue(
      input.liabilityType,
      LIABILITY_TYPES,
      "Liability type"
    );

  const currentBalance =
    requiredMoney(
      input.currentBalance,
      "Current balance"
    );

  const originalBalance =
    optionalMoney(
      input.originalBalance,
      "Original balance"
    );

  const interestRate =
    optionalRate(input.interestRate);

  const minimumPayment =
    optionalMoney(
      input.minimumPayment,
      "Minimum payment"
    );

  const escrowPayment =
    optionalMoney(
      input.escrowPayment,
      "Escrow payment"
    );

  const creditLimit =
    optionalMoney(
      input.creditLimit,
      "Credit limit"
    );

  const balanceAsOf =
    optionalDate(
      input.balanceAsOf,
      "Balance date"
    );

  const maturityDate =
    optionalDate(
      input.maturityDate,
      "Maturity date"
    );

  const database =
    openPersonalFinanceDatabase();

  try {
    const create =
      database.transaction(() => {
        const linkedAssetId =
          optionalText(
            input.linkedAssetId
          );

        if (linkedAssetId) {
          assertRecordExists(
            database,
            "assets",
            linkedAssetId,
            "Linked asset"
          );
        }

        const obligationId =
          optionalText(
            input.obligationId
          );

        if (obligationId) {
          assertRecordExists(
            database,
            "obligations",
            obligationId,
            "Linked bill"
          );
        }

        const id =
          createPersonalFinanceId(
            "liability",
            [
              name,
              liabilityType,
              new Date().toISOString()
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
              credit_limit_cents,
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
              ?,
              ?
            )
          `)
          .run(
            id,
            obligationId,
            linkedAssetId,
            name,
            liabilityType,
            optionalText(
              input.institution
            ),
            originalBalance === null
              ? null
              : dollarsToCents(
                  originalBalance
                ),
            dollarsToCents(
              currentBalance
            ),
            balanceAsOf,
            interestRate === null
              ? null
              : Math.round(
                  interestRate * 100
                ),
            minimumPayment === null
              ? null
              : dollarsToCents(
                  minimumPayment
                ),
            escrowPayment === null
              ? null
              : dollarsToCents(
                  escrowPayment
                ),
            creditLimit === null
              ? null
              : dollarsToCents(
                  creditLimit
                ),
            maturityDate
          );

        storeSensitiveAccountNumber({
          database,
          ownerType: "liability",
          ownerId: id,
          accountNumber:
            optionalText(
              input.accountNumber
            )
        });

        return readCatalog(database);
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
): PersonalFinanceNetWorthCatalog {
  const assets =
    database
      .prepare(`
        SELECT
          assets.id,
          assets.name,
          assets.asset_type,
          assets.institution,
          assets.description,
          asset_valuations.value_cents,
          asset_valuations.valued_on,
          asset_valuations.source
        FROM assets
        INNER JOIN asset_valuations
          ON asset_valuations.id = (
            SELECT latest.id
            FROM asset_valuations AS latest
            WHERE
              latest.asset_id = assets.id
            ORDER BY
              latest.valued_on DESC,
              latest.created_at DESC
            LIMIT 1
          )
        WHERE assets.is_active = 1
        ORDER BY
          assets.name COLLATE NOCASE
      `)
      .all() as Array<{
        id: string;
        name: string;
        asset_type:
          PersonalFinanceAssetType;
        institution: string | null;
        description: string | null;
        value_cents: number;
        valued_on: string;
        source: string | null;
      }>;

  const liabilities =
    database
      .prepare(`
        SELECT
          liabilities.id,
          liabilities.obligation_id,
          liabilities.linked_asset_id,
          liabilities.name,
          liabilities.liability_type,
          liabilities.institution,
          liabilities.original_balance_cents,
          liabilities.current_balance_cents,
          liabilities.balance_as_of,
          liabilities.interest_rate_basis_points,
          liabilities.minimum_payment_cents,
          liabilities.escrow_payment_cents,
          liabilities.credit_limit_cents,
          liabilities.maturity_date,
          sensitive_values.last_four
        FROM liabilities
        LEFT JOIN sensitive_values
          ON
            sensitive_values.owner_type =
              'liability' AND
            sensitive_values.owner_id =
              liabilities.id AND
            sensitive_values.field_name =
              'account_number'
        WHERE liabilities.is_active = 1
        ORDER BY
          liabilities.name COLLATE NOCASE
      `)
      .all() as Array<{
        id: string;
        obligation_id: string | null;
        linked_asset_id: string | null;
        name: string;
        liability_type:
          PersonalFinanceLiabilityType;
        institution: string | null;
        original_balance_cents:
          number | null;
        current_balance_cents: number;
        balance_as_of: string | null;
        interest_rate_basis_points:
          number | null;
        minimum_payment_cents:
          number | null;
        escrow_payment_cents:
          number | null;
        credit_limit_cents:
          number | null;
        maturity_date: string | null;
        last_four: string | null;
      }>;

  const assetRecords =
    assets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      assetType: asset.asset_type,
      institution:
        asset.institution,
      description:
        asset.description,
      value:
        centsToDollars(
          asset.value_cents
        ),
      valuedOn:
        asset.valued_on,
      valuationSource:
        asset.source
    }));

  const liabilityRecords =
    liabilities.map(
      (liability) => ({
        id: liability.id,
        obligationId:
          liability.obligation_id,
        linkedAssetId:
          liability.linked_asset_id,
        name: liability.name,
        liabilityType:
          liability.liability_type,
        institution:
          liability.institution,
        originalBalance:
          nullableCentsToDollars(
            liability
              .original_balance_cents
          ),
        currentBalance:
          centsToDollars(
            liability
              .current_balance_cents
          ),
        balanceAsOf:
          liability.balance_as_of,
        interestRate:
          liability
            .interest_rate_basis_points ===
          null
            ? null
            : liability
                .interest_rate_basis_points /
              100,
        minimumPayment:
          nullableCentsToDollars(
            liability
              .minimum_payment_cents
          ),
        escrowPayment:
          nullableCentsToDollars(
            liability
              .escrow_payment_cents
          ),
        creditLimit:
          nullableCentsToDollars(
            liability
              .credit_limit_cents
          ),
        maturityDate:
          liability.maturity_date,
        maskedAccountNumber:
          liability.last_four
            ? maskSensitiveValue(
                liability.last_four
              )
            : null
      })
    );

  return {
    assets: assetRecords,
    liabilities:
      liabilityRecords,
    summary:
      calculatePersonalFinanceNetWorth(
        assetRecords.map(
          (asset) => ({
            id: asset.id,
            name: asset.name,
            valueCents:
              dollarsToCents(
                asset.value
              )
          })
        ),
        liabilityRecords.map(
          (liability) => ({
            id: liability.id,
            name:
              liability.name,
            currentBalanceCents:
              dollarsToCents(
                liability
                  .currentBalance
              ),
            linkedAssetId:
              liability
                .linkedAssetId
          })
        )
      )
  };
}

function storeSensitiveAccountNumber({
  database,
  ownerType,
  ownerId,
  accountNumber
}: {
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >;
  ownerType:
    | "asset"
    | "liability"
    | "obligation";
  ownerId: string;
  accountNumber: string | null;
}): void {
  if (!accountNumber) {
    return;
  }

  const encrypted =
    encryptPersonalFinanceValue(
      accountNumber
    );

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
      encrypted
        .initializationVector,
      encrypted
        .authenticationTag,
      encrypted.keyVersion,
      encrypted.lastFour
    );
}

function assertRecordExists(
  database: ReturnType<
    typeof openPersonalFinanceDatabase
  >,
  table:
    | "assets"
    | "obligations",
  id: string,
  label: string
): void {
  const result =
    database
      .prepare(`
        SELECT id
        FROM ${table}
        WHERE id = ?
      `)
      .get(id);

  if (!result) {
    throw new Error(
      `${label} was not found.`
    );
  }
}

function requiredText(
  value: unknown,
  label: string
): string {
  const normalized =
    optionalText(value);

  if (!normalized) {
    throw new Error(
      `${label} is required.`
    );
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

function requiredMoney(
  value: unknown,
  label: string
): number {
  const amount =
    optionalMoney(value, label);

  if (amount === null) {
    throw new Error(
      `${label} is required.`
    );
  }

  return amount;
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

  const amount = Number(value);

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new Error(
      `${label} must be zero or greater.`
    );
  }

  return (
    Math.round(amount * 100) /
    100
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

function lastFour(
  value: string | null
): string | null {
  if (!value) {
    return null;
  }

  const normalized =
    value.replace(
      /[^A-Za-z0-9]/g,
      ""
    );

  return normalized.slice(-4) ||
    null;
}

function optionalRate(
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

  return (
    Math.round(rate * 100) /
    100
  );
}

function requiredDate(
  value: unknown,
  label: string
): string {
  const normalized =
    optionalDate(value, label);

  if (!normalized) {
    throw new Error(
      `${label} is required.`
    );
  }

  return normalized;
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

function validateSetValue<
  T extends string
>(
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

function dollarsToCents(
  value: number
): number {
  return Math.round(value * 100);
}

function centsToDollars(
  value: number
): number {
  return value / 100;
}

function nullableCentsToDollars(
  value: number | null
): number | null {
  return value === null
    ? null
    : centsToDollars(value);
}

function assertLocalPersonalFinanceEnabled():
  void {
  if (
    process.env
      .ENABLE_LOCAL_PERSONAL_FINANCE !==
    "true"
  ) {
    throw new Error(
      "Local personal finance is disabled."
    );
  }
}
