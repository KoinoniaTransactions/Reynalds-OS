import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
    database.prepare(`
      INSERT INTO accounts (
        id,
        source_key,
        institution,
        name,
        account_type
      )
      VALUES (
        'account_route',
        'account_route',
        'Test Institution',
        'Route Checking',
        'checking'
      )
    `).run();

    database.prepare(`
      INSERT INTO import_batches (
        id,
        account_id,
        importer_key,
        source_file_name,
        source_file_sha256,
        transaction_count
      )
      VALUES (
        'batch_route',
        'account_route',
        'test',
        'route.csv',
        'route_sha',
        1
      )
    `).run();

    database.prepare(`
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
      VALUES (
        'transaction_route',
        'account_route',
        'batch_route',
        'fingerprint_route',
        '2026-07-15',
        'Transfer',
        -10000,
        'transfer'
      )
    `).run();
  } finally {
    database.close();
  }
}

function request({
  method,
  host = "localhost:3003",
  origin = "http://localhost:3003",
  body
}: {
  method: "GET" | "PATCH";
  host?: string;
  origin?: string;
  body?: unknown;
}) {
  return new Request(
    `http://${host}/api/personal/transactions/transaction_route/reconciliation`,
    {
      method,
      headers: {
        host,
        origin,
        ...(method === "PATCH"
          ? {
              "content-type": "application/json"
            }
          : {})
      },
      body:
        method === "PATCH"
          ? JSON.stringify(body)
          : undefined
    }
  );
}

const params = {
  params: Promise.resolve({
    id: "transaction_route"
  })
};

beforeEach(() => {
  temporaryDirectory = mkdtempSync(
    path.join(
      os.tmpdir(),
      "personal-finance-reconciliation-route-"
    )
  );

  databasePath = path.join(
    temporaryDirectory,
    "route.sqlite3"
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

describe("personal finance reconciliation route", () => {
  it("returns local reconciliation state and rejects remote reads", async () => {
    const localResponse = await GET(
      request({ method: "GET" }),
      params
    );

    expect(localResponse.status).toBe(200);

    const localBody = await localResponse.json();

    expect(
      localBody.reconciliation.reviewStatus
    ).toBe("unreviewed");

    const remoteResponse = await GET(
      request({
        method: "GET",
        host: "example.com",
        origin: "https://example.com"
      }),
      params
    );

    expect(remoteResponse.status).toBe(404);
  });

  it("reconciles a transfer locally and preserves reviewed state", async () => {
    const response = await PATCH(
      request({
        method: "PATCH",
        body: {
          reconciled: true,
          allocations: []
        }
      }),
      params
    );

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(
      body.reconciliation.reviewStatus
    ).toBe("reconciled");
    expect(
      body.reconciliation.reviewedAt
    ).toBeNull();
    expect(
      body.reconciliation.allocations
    ).toEqual([]);
  });

  it("rejects invalid and remote writes", async () => {
    const invalidResponse = await PATCH(
      request({
        method: "PATCH",
        body: {
          reconciled: "yes"
        }
      }),
      params
    );

    expect(invalidResponse.status).toBe(400);

    const remoteResponse = await PATCH(
      request({
        method: "PATCH",
        host: "example.com",
        origin: "https://example.com",
        body: {
          reconciled: true,
          allocations: []
        }
      }),
      params
    );

    expect(remoteResponse.status).toBe(404);
  });
});
