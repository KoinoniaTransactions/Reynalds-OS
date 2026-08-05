import {
  mkdtempSync,
  rmSync
} from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

vi.mock("server-only", () => ({}));

import {
  openPersonalFinanceDatabase
} from "../../../../../../lib/personal-finance-db-local";
import {
  GET,
  PATCH
} from "./route";

let temporaryDirectory = "";
let databasePath = "";

function createFixtureDatabase() {
  const database = openPersonalFinanceDatabase({
    databasePath
  });

  try {
    database.exec(`
      INSERT INTO accounts (
        id,
        source_key,
        institution,
        name,
        account_type
      )
      VALUES
        (
          'account_a',
          'account_a',
          'Test',
          'Checking A',
          'checking'
        ),
        (
          'account_b',
          'account_b',
          'Test',
          'Savings B',
          'savings'
        );

      INSERT INTO import_batches (
        id,
        account_id,
        importer_key,
        source_file_name,
        source_file_sha256,
        transaction_count
      )
      VALUES
        (
          'batch_a',
          'account_a',
          'test',
          'a.csv',
          'sha_a',
          1
        ),
        (
          'batch_b',
          'account_b',
          'test',
          'b.csv',
          'sha_b',
          1
        );

      INSERT INTO transactions (
        id,
        account_id,
        import_batch_id,
        source_fingerprint,
        posted_date,
        original_description,
        amount_cents,
        classification
      )
      VALUES
        (
          'transaction_out',
          'account_a',
          'batch_a',
          'fingerprint_out',
          '2026-07-20',
          'Transfer',
          -10000,
          'transfer'
        ),
        (
          'transaction_in',
          'account_b',
          'batch_b',
          'fingerprint_in',
          '2026-07-21',
          'Transfer',
          10000,
          'unknown'
        );
    `);
  } finally {
    database.close();
  }
}

function request(
  method: "GET" | "PATCH",
  host: string,
  body?: unknown
) {
  return new Request(
    `http://${host}/api/personal/transactions/transaction_out/matching`,
    {
      method,
      headers: {
        host,
        ...(body === undefined
          ? {}
          : {
              "content-type":
                "application/json"
            })
      },
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body)
    }
  );
}

const params = {
  params: Promise.resolve({
    id: "transaction_out"
  })
};

beforeEach(() => {
  temporaryDirectory = mkdtempSync(
    path.join(
      os.tmpdir(),
      "personal-finance-matching-route-"
    )
  );

  databasePath = path.join(
    temporaryDirectory,
    "test.sqlite3"
  );

  process.env.ENABLE_LOCAL_PERSONAL_FINANCE =
    "true";

  process.env.PERSONAL_FINANCE_DB_PATH =
    databasePath;

  createFixtureDatabase();
});

afterEach(() => {
  delete process.env.ENABLE_LOCAL_PERSONAL_FINANCE;
  delete process.env.PERSONAL_FINANCE_DB_PATH;

  rmSync(temporaryDirectory, {
    recursive: true,
    force: true
  });
});

describe("personal finance matching route", () => {
  it("returns local transfer candidates and rejects remote reads", async () => {
    const local = await GET(
      request("GET", "127.0.0.1"),
      params
    );

    expect(local.status).toBe(200);

    const localBody = await local.json();

    expect(
      localBody.matching.transferCandidates
    ).toHaveLength(1);

    const remote = await GET(
      request("GET", "example.com"),
      params
    );

    expect(remote.status).toBe(404);
  });

  it("confirms and rejects a transfer pair locally", async () => {
    const confirmed = await PATCH(
      request(
        "PATCH",
        "localhost",
        {
          counterpartTransactionId:
            "transaction_in",
          status: "confirmed"
        }
      ),
      params
    );

    expect(confirmed.status).toBe(200);

    const confirmedBody =
      await confirmed.json();

    expect(
      confirmedBody.matching.confirmedTransfer
        .transactionId
    ).toBe("transaction_in");

    const rejected = await PATCH(
      request(
        "PATCH",
        "localhost",
        {
          counterpartTransactionId:
            "transaction_in",
          status: "rejected"
        }
      ),
      params
    );

    expect(rejected.status).toBe(200);

    const rejectedBody =
      await rejected.json();

    expect(
      rejectedBody.matching.confirmedTransfer
    ).toBeNull();
  });

  it("validates the matching request body", async () => {
    const response = await PATCH(
      request(
        "PATCH",
        "localhost",
        {
          counterpartTransactionId: "",
          status: "maybe"
        }
      ),
      params
    );

    expect(response.status).toBe(400);
  });
});
