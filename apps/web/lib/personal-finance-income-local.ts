import "server-only";

import {
  createPersonalFinanceId,
  openPersonalFinanceDatabase
} from "./personal-finance-db-local";

import {
  generateIncomeOccurrenceDates,
  personalFinancePeriodLabel
} from "./personal-finance-income-schedule";

import type {
  CreatePersonalFinanceIncomeSourceInput,
  CreatePersonalFinanceMiscIncomeInput,
  DeletePersonalFinanceIncomeSourceInput,
  PersonalFinanceIncomeOccurrence,
  PersonalFinanceIncomeOccurrenceKind,
  PersonalFinanceIncomeOccurrenceStatus,
  PersonalFinanceIncomeSchedule,
  PersonalFinanceIncomeSource,
  PersonalFinanceIncomeSourceType,
  PersonalFinanceIncomeWorkspaceData,
  SetPersonalFinanceIncomeSourceActiveInput,
  UpdatePersonalFinanceIncomeReceiptInput,
  UpdatePersonalFinanceIncomeSourceInput
} from "./personal-finance-income-types";

type PersonalFinanceDatabase =
  ReturnType<
    typeof openPersonalFinanceDatabase
  >;

type IncomeSourceRow = {
  id: string;
  recipient_name: string;
  source_name: string;
  source_type: string;
  schedule: string;
  expected_amount_cents: number;
  anchor_date: string | null;
  second_pay_day: number | null;
  active_from_period: string;
  end_period: string | null;
  deposit_account_label:
    string | null;
  notes: string | null;
  is_active: number;
};

type IncomeOccurrenceRow = {
  id: string;
  source_id: string | null;
  period_key: string;
  occurrence_kind: string;
  label: string;
  recipient_name: string;
  expected_date: string;
  expected_cents: number;
  received_cents: number;
  received_date: string | null;
  notes: string | null;
};

export type LegacyPersonalFinanceIncomeEntry = {
  id: string;
  date: string;
  expected: number;
  received: number;
};

const SOURCE_TYPES =
  new Set<
    PersonalFinanceIncomeSourceType
  >([
    "employment",
    "self_employment",
    "retirement",
    "benefit",
    "other"
  ]);

const SCHEDULES =
  new Set<
    PersonalFinanceIncomeSchedule
  >([
    "weekly",
    "biweekly",
    "semimonthly",
    "monthly",
    "irregular"
  ]);

export function readPersonalFinanceIncomeWorkspace(
  periodKey: string
): PersonalFinanceIncomeWorkspaceData {
  assertLocalPersonalFinanceEnabled();

  const normalizedPeriod =
    requiredPeriodKey(
      periodKey
    );

  const database =
    openIncomeDatabase();

  try {
    return readWorkspace(
      database,
      normalizedPeriod
    );
  } finally {
    database.close();
  }
}

export function seedPersonalFinanceIncomeFromLegacy({
  periodKey,
  entries
}: {
  periodKey: string;
  entries:
    readonly LegacyPersonalFinanceIncomeEntry[];
}): void {
  assertLocalPersonalFinanceEnabled();

  const normalizedPeriod =
    requiredPeriodKey(
      periodKey
    );

  const database =
    openIncomeDatabase();

  try {
    const insert =
      database.prepare(`
        INSERT OR IGNORE INTO
          pf_income_occurrences (
            id,
            source_id,
            period_key,
            occurrence_kind,
            label,
            recipient_name,
            expected_date,
            expected_cents,
            received_cents,
            received_date,
            notes,
            source_key
          )
        VALUES (
          ?,
          NULL,
          ?,
          'imported',
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
      `);

    const seed =
      database.transaction(
        () => {
          for (
            const entry of entries
          ) {
            const sourceKey =
              [
                "legacy",
                normalizedPeriod,
                entry.id
              ].join(":");

            const expectedDate =
              normalizeLegacyDate(
                entry.date,
                normalizedPeriod
              );

            const expectedCents =
              toCents(
                Math.max(
                  entry.expected,
                  0
                )
              );

            const receivedCents =
              toCents(
                Math.max(
                  entry.received,
                  0
                )
              );

            insert.run(
              createPersonalFinanceId(
                "income_occurrence",
                [sourceKey]
              ),
              normalizedPeriod,
              "Imported household income",
              "Household",
              expectedDate,
              expectedCents,
              receivedCents,
              receivedCents > 0
                ? expectedDate
                : null,
              "Preserved from the existing monthly budget CSV.",
              sourceKey
            );
          }
        }
      );

    seed.immediate();
  } finally {
    database.close();
  }
}

export function createPersonalFinanceIncomeSource(
  periodKey: string,
  input:
    CreatePersonalFinanceIncomeSourceInput
): PersonalFinanceIncomeWorkspaceData {
  assertLocalPersonalFinanceEnabled();

  const normalizedPeriod =
    requiredPeriodKey(
      periodKey
    );

  const recipientName =
    requiredText(
      input.recipientName,
      "Assigned person"
    );

  const sourceName =
    requiredText(
      input.sourceName,
      "Income source"
    );

  const sourceType =
    validateSetValue(
      input.sourceType,
      SOURCE_TYPES,
      "Income type"
    );

  const schedule =
    validateSetValue(
      input.schedule,
      SCHEDULES,
      "Pay schedule"
    );

  const expectedAmount =
    requiredAmount(
      input.expectedAmount,
      "Expected pay"
    );

  const activeFromPeriod =
    input.activeFromPeriod
      ? requiredPeriodKey(
          String(
            input.activeFromPeriod
          )
        )
      : normalizedPeriod;

  const endPeriod =
    optionalPeriodKey(
      input.endPeriod
    );

  assertIncomeSourcePeriodRange(
    activeFromPeriod,
    endPeriod
  );

  const anchorDate =
    schedule === "irregular"
      ? optionalText(
          input.anchorDate
        )
      : requiredDate(
          input.anchorDate,
          "Known payday"
        );

  const secondPayDay =
    schedule ===
    "semimonthly"
      ? requiredPayDay(
          input.secondPayDay
        )
      : null;

  const database =
    openIncomeDatabase();

  try {
    const create =
      database.transaction(
        () => {
          const id =
            createPersonalFinanceId(
              "income_source",
              [
                recipientName,
                sourceName,
                new Date()
                  .toISOString()
              ]
            );

          database
            .prepare(`
              INSERT INTO
                pf_income_sources (
                  id,
                  recipient_name,
                  source_name,
                  source_type,
                  schedule,
                  expected_amount_cents,
                  anchor_date,
                  second_pay_day,
                  active_from_period,
                  end_period,
                  deposit_account_label,
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
              id,
              recipientName,
              sourceName,
              sourceType,
              schedule,
              toCents(
                expectedAmount
              ),
              anchorDate,
              secondPayDay,
              activeFromPeriod,
              endPeriod,
              optionalText(
                input.depositAccountLabel
              ),
              optionalText(
                input.notes
              )
            );

          return readWorkspace(
            database,
            normalizedPeriod
          );
        }
      );

    return create.immediate();
  } finally {
    database.close();
  }
}

export function updatePersonalFinanceIncomeSource(
  periodKey: string,
  input:
    UpdatePersonalFinanceIncomeSourceInput
): PersonalFinanceIncomeWorkspaceData {
  assertLocalPersonalFinanceEnabled();

  const normalizedPeriod =
    requiredPeriodKey(
      periodKey
    );

  const sourceId =
    requiredText(
      input.sourceId,
      "Income source"
    );

  const recipientName =
    requiredText(
      input.recipientName,
      "Assigned person"
    );

  const sourceName =
    requiredText(
      input.sourceName,
      "Income source name"
    );

  const sourceType =
    validateSetValue(
      input.sourceType,
      SOURCE_TYPES,
      "Income type"
    );

  const schedule =
    validateSetValue(
      input.schedule,
      SCHEDULES,
      "Pay schedule"
    );

  const expectedAmount =
    requiredAmount(
      input.expectedAmount,
      "Expected pay"
    );

  const activeFromPeriod =
    input.activeFromPeriod
      ? requiredPeriodKey(
          String(
            input.activeFromPeriod
          )
        )
      : normalizedPeriod;

  const endPeriod =
    optionalPeriodKey(
      input.endPeriod
    );

  assertIncomeSourcePeriodRange(
    activeFromPeriod,
    endPeriod
  );

  const anchorDate =
    schedule === "irregular"
      ? optionalText(
          input.anchorDate
        )
      : requiredDate(
          input.anchorDate,
          "Known payday"
        );

  const secondPayDay =
    schedule ===
    "semimonthly"
      ? requiredPayDay(
          input.secondPayDay
        )
      : null;

  const database =
    openIncomeDatabase();

  try {
    const update =
      database.transaction(
        () => {
          assertIncomeSourceExists(
            database,
            sourceId
          );

          database
            .prepare(`
              UPDATE
                pf_income_sources
              SET
                recipient_name = ?,
                source_name = ?,
                source_type = ?,
                schedule = ?,
                expected_amount_cents = ?,
                anchor_date = ?,
                second_pay_day = ?,
                active_from_period = ?,
                end_period = ?,
                deposit_account_label = ?,
                notes = ?,
                updated_at =
                  CURRENT_TIMESTAMP
              WHERE
                id = ?
            `)
            .run(
              recipientName,
              sourceName,
              sourceType,
              schedule,
              toCents(
                expectedAmount
              ),
              anchorDate,
              secondPayDay,
              activeFromPeriod,
              endPeriod,
              optionalText(
                input.depositAccountLabel
              ),
              optionalText(
                input.notes
              ),
              sourceId
            );

          deleteUnreceivedScheduledOccurrences(
            database,
            sourceId,
            normalizedPeriod
          );

          return readWorkspace(
            database,
            normalizedPeriod
          );
        }
      );

    return update.immediate();
  } finally {
    database.close();
  }
}

export function setPersonalFinanceIncomeSourceActive(
  periodKey: string,
  input:
    SetPersonalFinanceIncomeSourceActiveInput
): PersonalFinanceIncomeWorkspaceData {
  assertLocalPersonalFinanceEnabled();

  const normalizedPeriod =
    requiredPeriodKey(
      periodKey
    );

  const sourceId =
    requiredText(
      input.sourceId,
      "Income source"
    );

  if (
    typeof input.isActive !==
    "boolean"
  ) {
    throw new Error(
      "Income source status must be true or false."
    );
  }

  const database =
    openIncomeDatabase();

  try {
    const update =
      database.transaction(
        () => {
          assertIncomeSourceExists(
            database,
            sourceId
          );

          database
            .prepare(`
              UPDATE
                pf_income_sources
              SET
                is_active = ?,
                updated_at =
                  CURRENT_TIMESTAMP
              WHERE
                id = ?
            `)
            .run(
              input.isActive
                ? 1
                : 0,
              sourceId
            );

          if (!input.isActive) {
            deleteUnreceivedScheduledOccurrences(
              database,
              sourceId,
              normalizedPeriod
            );
          }

          return readWorkspace(
            database,
            normalizedPeriod
          );
        }
      );

    return update.immediate();
  } finally {
    database.close();
  }
}

export function deletePersonalFinanceIncomeSource(
  periodKey: string,
  input:
    DeletePersonalFinanceIncomeSourceInput
): PersonalFinanceIncomeWorkspaceData {
  assertLocalPersonalFinanceEnabled();

  const normalizedPeriod =
    requiredPeriodKey(
      periodKey
    );

  const sourceId =
    requiredText(
      input.sourceId,
      "Income source"
    );

  const database =
    openIncomeDatabase();

  try {
    const remove =
      database.transaction(
        () => {
          assertIncomeSourceExists(
            database,
            sourceId
          );

          database
            .prepare(`
              DELETE FROM
                pf_income_occurrences
              WHERE
                source_id = ? AND
                occurrence_kind =
                  'scheduled' AND
                received_cents = 0
            `)
            .run(
              sourceId
            );

          database
            .prepare(`
              UPDATE
                pf_income_occurrences
              SET
                source_id = NULL,
                updated_at =
                  CURRENT_TIMESTAMP
              WHERE
                source_id = ?
            `)
            .run(
              sourceId
            );

          database
            .prepare(`
              DELETE FROM
                pf_income_sources
              WHERE
                id = ?
            `)
            .run(
              sourceId
            );

          return readWorkspace(
            database,
            normalizedPeriod
          );
        }
      );

    return remove.immediate();
  } finally {
    database.close();
  }
}

export function createPersonalFinanceMiscIncome(
  periodKey: string,
  input:
    CreatePersonalFinanceMiscIncomeInput
): PersonalFinanceIncomeWorkspaceData {
  assertLocalPersonalFinanceEnabled();

  const normalizedPeriod =
    requiredPeriodKey(
      periodKey
    );

  const label =
    requiredText(
      input.label,
      "Miscellaneous income label"
    );

  const recipientName =
    requiredText(
      input.recipientName,
      "Assigned person"
    );

  const expectedAmount =
    requiredAmount(
      input.expectedAmount,
      "Expected amount"
    );

  const expectedDate =
    requiredDate(
      input.expectedDate,
      "Expected date"
    );

  assertDateInPeriod(
    expectedDate,
    normalizedPeriod
  );

  const receivedAmount =
    optionalAmount(
      input.receivedAmount
    ) ?? 0;

  const receivedDate =
    receivedAmount > 0
      ? (
          optionalText(
            input.receivedDate
          ) ??
          expectedDate
        )
      : null;

  if (receivedDate) {
    requiredDate(
      receivedDate,
      "Received date"
    );
  }

  const database =
    openIncomeDatabase();

  try {
    const create =
      database.transaction(
        () => {
          const id =
            createPersonalFinanceId(
              "income_occurrence",
              [
                "misc",
                normalizedPeriod,
                label,
                recipientName,
                new Date()
                  .toISOString()
              ]
            );

          const sourceKey =
            `misc:${id}`;

          database
            .prepare(`
              INSERT INTO
                pf_income_occurrences (
                  id,
                  source_id,
                  period_key,
                  occurrence_kind,
                  label,
                  recipient_name,
                  expected_date,
                  expected_cents,
                  received_cents,
                  received_date,
                  notes,
                  source_key
                )
              VALUES (
                ?,
                NULL,
                ?,
                'misc',
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
              normalizedPeriod,
              label,
              recipientName,
              expectedDate,
              toCents(
                expectedAmount
              ),
              toCents(
                receivedAmount
              ),
              receivedDate,
              optionalText(
                input.notes
              ),
              sourceKey
            );

          return readWorkspace(
            database,
            normalizedPeriod
          );
        }
      );

    return create.immediate();
  } finally {
    database.close();
  }
}

export function updatePersonalFinanceIncomeReceipt(
  periodKey: string,
  input:
    UpdatePersonalFinanceIncomeReceiptInput
): PersonalFinanceIncomeWorkspaceData {
  assertLocalPersonalFinanceEnabled();

  const normalizedPeriod =
    requiredPeriodKey(
      periodKey
    );

  const occurrenceId =
    requiredText(
      input.occurrenceId,
      "Income occurrence"
    );

  const receivedAmount =
    requiredAmount(
      input.receivedAmount,
      "Received amount"
    );

  const database =
    openIncomeDatabase();

  try {
    const update =
      database.transaction(
        () => {
          const current =
            database
              .prepare(`
                SELECT
                  id,
                  expected_date
                FROM
                  pf_income_occurrences
                WHERE
                  id = ? AND
                  period_key = ?
              `)
              .get(
                occurrenceId,
                normalizedPeriod
              ) as
              | {
                  id: string;
                  expected_date:
                    string;
                }
              | undefined;

          if (!current) {
            throw new Error(
              "Income entry was not found."
            );
          }

          const receivedDate =
            receivedAmount > 0
              ? (
                  optionalText(
                    input.receivedDate
                  ) ??
                  current.expected_date
                )
              : null;

          if (receivedDate) {
            requiredDate(
              receivedDate,
              "Received date"
            );
          }

          database
            .prepare(`
              UPDATE
                pf_income_occurrences
              SET
                received_cents = ?,
                received_date = ?,
                updated_at =
                  CURRENT_TIMESTAMP
              WHERE
                id = ?
            `)
            .run(
              toCents(
                receivedAmount
              ),
              receivedDate,
              occurrenceId
            );

          return readWorkspace(
            database,
            normalizedPeriod
          );
        }
      );

    return update.immediate();
  } finally {
    database.close();
  }
}

function openIncomeDatabase():
  PersonalFinanceDatabase {
  const database =
    openPersonalFinanceDatabase();

  try {
    ensureIncomeSchema(
      database
    );

    return database;
  } catch (error) {
    database.close();
    throw error;
  }
}

function ensureIncomeSchema(
  database:
    PersonalFinanceDatabase
): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS
      pf_income_sources (
        id TEXT PRIMARY KEY,
        recipient_name TEXT NOT NULL,
        source_name TEXT NOT NULL,
        source_type TEXT NOT NULL CHECK (
          source_type IN (
            'employment',
            'self_employment',
            'retirement',
            'benefit',
            'other'
          )
        ),
        schedule TEXT NOT NULL CHECK (
          schedule IN (
            'weekly',
            'biweekly',
            'semimonthly',
            'monthly',
            'irregular'
          )
        ),
        expected_amount_cents
          INTEGER NOT NULL CHECK (
            expected_amount_cents >= 0
          ),
        anchor_date TEXT,
        second_pay_day INTEGER CHECK (
          second_pay_day IS NULL OR
          (
            second_pay_day >= 1 AND
            second_pay_day <= 31
          )
        ),
        active_from_period
          TEXT NOT NULL,
        end_period TEXT,
        deposit_account_label TEXT,
        notes TEXT,
        is_active INTEGER NOT NULL
          DEFAULT 1 CHECK (
            is_active IN (0, 1)
          ),
        created_at TEXT NOT NULL
          DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL
          DEFAULT CURRENT_TIMESTAMP
      ) STRICT;

    CREATE INDEX IF NOT EXISTS
      pf_income_sources_active_index
    ON pf_income_sources (
      is_active,
      active_from_period,
      recipient_name
    );

    CREATE TABLE IF NOT EXISTS
      pf_income_occurrences (
        id TEXT PRIMARY KEY,
        source_id TEXT,
        period_key TEXT NOT NULL,
        occurrence_kind TEXT NOT NULL
          CHECK (
            occurrence_kind IN (
              'scheduled',
              'misc',
              'imported'
            )
          ),
        label TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        expected_date TEXT NOT NULL,
        expected_cents INTEGER NOT NULL
          CHECK (
            expected_cents >= 0
          ),
        received_cents INTEGER NOT NULL
          DEFAULT 0 CHECK (
            received_cents >= 0
          ),
        received_date TEXT,
        notes TEXT,
        source_key TEXT NOT NULL
          UNIQUE,
        created_at TEXT NOT NULL
          DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL
          DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (source_id)
          REFERENCES
            pf_income_sources(id)
          ON DELETE SET NULL
      ) STRICT;

    CREATE INDEX IF NOT EXISTS
      pf_income_occurrences_period_index
    ON pf_income_occurrences (
      period_key,
      expected_date,
      recipient_name
    );

    CREATE INDEX IF NOT EXISTS
      pf_income_occurrences_source_index
    ON pf_income_occurrences (
      source_id,
      period_key
    );
  `);

  ensureIncomeSourceEndPeriodColumn(
    database
  );
}

function ensureIncomeSourceEndPeriodColumn(
  database:
    PersonalFinanceDatabase
): void {
  const columns =
    database
      .prepare(
        "PRAGMA table_info(pf_income_sources)"
      )
      .all() as
      {
        name: string;
      }[];

  if (
    columns.some(
      (column) =>
        column.name ===
        "end_period"
    )
  ) {
    return;
  }

  database.exec(`
    ALTER TABLE
      pf_income_sources
    ADD COLUMN
      end_period TEXT;
  `);
}

function readWorkspace(
  database:
    PersonalFinanceDatabase,
  periodKey: string
): PersonalFinanceIncomeWorkspaceData {
  ensureRecurringOccurrences(
    database,
    periodKey
  );

  const sources =
    readSources(database);

  const occurrenceRows =
    database
      .prepare(`
        SELECT
          id,
          source_id,
          period_key,
          occurrence_kind,
          label,
          recipient_name,
          expected_date,
          expected_cents,
          received_cents,
          received_date,
          notes
        FROM
          pf_income_occurrences
        WHERE
          period_key = ?
        ORDER BY
          expected_date ASC,
          recipient_name COLLATE NOCASE,
          label COLLATE NOCASE
      `)
      .all(
        periodKey
      ) as IncomeOccurrenceRow[];

  const occurrences =
    occurrenceRows.map(
      mapOccurrence
    );

  const expected =
    roundMoney(
      occurrences.reduce(
        (
          total,
          occurrence
        ) =>
          total +
          occurrence.expected,
        0
      )
    );

  const received =
    roundMoney(
      occurrences.reduce(
        (
          total,
          occurrence
        ) =>
          total +
          occurrence.received,
        0
      )
    );

  const pending =
    roundMoney(
      occurrences.reduce(
        (
          total,
          occurrence
        ) =>
          total +
          occurrence.remaining,
        0
      )
    );

  return {
    periodKey,
    periodLabel:
      personalFinancePeriodLabel(
        periodKey
      ),
    sources,
    occurrences,
    totals: {
      expected,
      received,
      pending,
      upcoming:
        occurrences.filter(
          (occurrence) =>
            occurrence.remaining > 0
        ).length
    },
    importedCount:
      occurrences.filter(
        (occurrence) =>
          occurrence.kind ===
          "imported"
      ).length,
    miscCount:
      occurrences.filter(
        (occurrence) =>
          occurrence.kind ===
          "misc"
      ).length
  };
}

function readSources(
  database:
    PersonalFinanceDatabase
): PersonalFinanceIncomeSource[] {
  const rows =
    database
      .prepare(`
        SELECT
          id,
          recipient_name,
          source_name,
          source_type,
          schedule,
          expected_amount_cents,
          anchor_date,
          second_pay_day,
          active_from_period,
          end_period,
          deposit_account_label,
          notes,
          is_active
        FROM
          pf_income_sources
        ORDER BY
          recipient_name COLLATE NOCASE,
          source_name COLLATE NOCASE
      `)
      .all() as IncomeSourceRow[];

  return rows.map(
    (row) => ({
      id:
        row.id,
      recipientName:
        row.recipient_name,
      sourceName:
        row.source_name,
      sourceType:
        row.source_type as
          PersonalFinanceIncomeSourceType,
      schedule:
        row.schedule as
          PersonalFinanceIncomeSchedule,
      expectedAmount:
        fromCents(
          row.expected_amount_cents
        ),
      anchorDate:
        row.anchor_date,
      secondPayDay:
        row.second_pay_day,
      activeFromPeriod:
        row.active_from_period,
      endPeriod:
        row.end_period,
      depositAccountLabel:
        row.deposit_account_label,
      notes:
        row.notes,
      isActive:
        row.is_active === 1
    })
  );
}

function ensureRecurringOccurrences(
  database:
    PersonalFinanceDatabase,
  periodKey: string
): void {
  const sources =
    readSources(database);

  const insert =
    database.prepare(`
      INSERT OR IGNORE INTO
        pf_income_occurrences (
          id,
          source_id,
          period_key,
          occurrence_kind,
          label,
          recipient_name,
          expected_date,
          expected_cents,
          received_cents,
          received_date,
          notes,
          source_key
        )
      VALUES (
        ?,
        ?,
        ?,
        'scheduled',
        ?,
        ?,
        ?,
        ?,
        0,
        NULL,
        ?,
        ?
      )
    `);

  for (
    const source of sources
  ) {
    if (
      !source.isActive ||
      source.activeFromPeriod >
        periodKey ||
      (
        source.endPeriod !== null &&
        source.endPeriod <
          periodKey
      )
    ) {
      continue;
    }

    const dates =
      generateIncomeOccurrenceDates({
        periodKey,
        schedule:
          source.schedule,
        anchorDate:
          source.anchorDate,
        secondPayDay:
          source.secondPayDay
      });

    for (
      const date of dates
    ) {
      const sourceKey =
        [
          "scheduled",
          source.id,
          date
        ].join(":");

      insert.run(
        createPersonalFinanceId(
          "income_occurrence",
          [sourceKey]
        ),
        source.id,
        periodKey,
        source.sourceName,
        source.recipientName,
        date,
        toCents(
          source.expectedAmount
        ),
        source.notes,
        sourceKey
      );
    }
  }
}

function mapOccurrence(
  row:
    IncomeOccurrenceRow
): PersonalFinanceIncomeOccurrence {
  const expected =
    fromCents(
      row.expected_cents
    );

  const received =
    fromCents(
      row.received_cents
    );

  const remaining =
    roundMoney(
      Math.max(
        expected -
          received,
        0
      )
    );

  let status:
    PersonalFinanceIncomeOccurrenceStatus =
      "pending";

  if (
    received > 0 &&
    remaining > 0
  ) {
    status = "partial";
  } else if (
    received > 0 ||
    (
      expected === 0 &&
      received === 0
    )
  ) {
    status = "received";
  }

  return {
    id:
      row.id,
    sourceId:
      row.source_id,
    periodKey:
      row.period_key,
    kind:
      row.occurrence_kind as
        PersonalFinanceIncomeOccurrenceKind,
    label:
      row.label,
    recipientName:
      row.recipient_name,
    expectedDate:
      row.expected_date,
    expected,
    received,
    remaining,
    receivedDate:
      row.received_date,
    notes:
      row.notes,
    status
  };
}

function assertIncomeSourceExists(
  database:
    PersonalFinanceDatabase,
  sourceId: string
): void {
  const row =
    database
      .prepare(`
        SELECT
          id
        FROM
          pf_income_sources
        WHERE
          id = ?
      `)
      .get(
        sourceId
      );

  if (!row) {
    throw new Error(
      "Income source was not found."
    );
  }
}

function deleteUnreceivedScheduledOccurrences(
  database:
    PersonalFinanceDatabase,
  sourceId: string,
  fromPeriod: string
): void {
  database
    .prepare(`
      DELETE FROM
        pf_income_occurrences
      WHERE
        source_id = ? AND
        occurrence_kind =
          'scheduled' AND
        period_key >= ? AND
        received_cents = 0
    `)
    .run(
      sourceId,
      fromPeriod
    );
}

function optionalPeriodKey(
  value: unknown
): string | null {
  const text =
    optionalText(
      value
    );

  if (!text) {
    return null;
  }

  return requiredPeriodKey(
    text
  );
}

function assertIncomeSourcePeriodRange(
  activeFromPeriod: string,
  endPeriod: string | null
): void {
  if (
    endPeriod !== null &&
    endPeriod <
      activeFromPeriod
  ) {
    throw new Error(
      "Income source end month cannot be before its start month."
    );
  }
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

function requiredPeriodKey(
  value: string
): string {
  const normalized =
    value.trim();

  if (
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(
      normalized
    )
  ) {
    throw new Error(
      "Income period must use YYYY-MM."
    );
  }

  return normalized;
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

function requiredAmount(
  value: unknown,
  label: string
): number {
  const parsed =
    parseAmount(value);

  if (parsed === null) {
    throw new Error(
      `${label} is required.`
    );
  }

  return parsed;
}

function optionalAmount(
  value: unknown
): number | null {
  return parseAmount(value);
}

function parseAmount(
  value: unknown
): number | null {
  const text =
    optionalText(value);

  if (!text) {
    return null;
  }

  const normalized =
    text.replace(
      /[$,\s]/g,
      ""
    );

  const parsed =
    Number(normalized);

  if (
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    throw new Error(
      "Income amounts must be zero or greater."
    );
  }

  return roundMoney(
    parsed
  );
}

function requiredDate(
  value: unknown,
  label: string
): string {
  const text =
    requiredText(
      value,
      label
    );

  const match =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (!match) {
    throw new Error(
      `${label} is not valid.`
    );
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  const day =
    Number(match[3]);

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  if (
    date.getUTCFullYear() !==
      year ||
    date.getUTCMonth() !==
      month - 1 ||
    date.getUTCDate() !==
      day
  ) {
    throw new Error(
      `${label} is not valid.`
    );
  }

  return text;
}

function requiredPayDay(
  value: unknown
): number {
  const text =
    requiredText(
      value,
      "Second pay day"
    );

  const parsed =
    Number(text);

  if (
    !Number.isInteger(parsed) ||
    parsed < 1 ||
    parsed > 31
  ) {
    throw new Error(
      "Second pay day must be from 1 through 31."
    );
  }

  return parsed;
}

function validateSetValue<
  T extends string
>(
  value: unknown,
  allowed:
    ReadonlySet<T>,
  label: string
): T {
  const text =
    requiredText(
      value,
      label
    ) as T;

  if (!allowed.has(text)) {
    throw new Error(
      `${label} is not valid.`
    );
  }

  return text;
}

function assertDateInPeriod(
  date: string,
  periodKey: string
): void {
  if (
    !date.startsWith(
      `${periodKey}-`
    )
  ) {
    throw new Error(
      "Miscellaneous income date must be inside the selected month."
    );
  }
}

function normalizeLegacyDate(
  value: string,
  periodKey: string
): string {
  const match =
    value.trim().match(
      /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/
    );

  const periodYear =
    Number(
      periodKey.slice(
        0,
        4
      )
    );

  if (match) {
    const month =
      Number(match[1]);

    const day =
      Number(match[2]);

    let year =
      match[3]
        ? Number(match[3])
        : periodYear;

    if (year < 100) {
      year += 2000;
    }

    const date =
      new Date(
        Date.UTC(
          year,
          month - 1,
          day
        )
      );

    if (
      date.getUTCFullYear() ===
        year &&
      date.getUTCMonth() ===
        month - 1 &&
      date.getUTCDate() ===
        day
    ) {
      return [
        String(year),
        String(month)
          .padStart(
            2,
            "0"
          ),
        String(day)
          .padStart(
            2,
            "0"
          )
      ].join("-");
    }
  }

  return `${periodKey}-01`;
}

function toCents(
  value: number
): number {
  return Math.round(
    value * 100
  );
}

function fromCents(
  value: number
): number {
  return roundMoney(
    value / 100
  );
}

function roundMoney(
  value: number
): number {
  return Math.round(
    value * 100
  ) / 100;
}
