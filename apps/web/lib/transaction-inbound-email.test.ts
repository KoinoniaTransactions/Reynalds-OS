import { afterEach, describe, expect, it } from "vitest";
import {
  getTransactionIdFromInboundRecipient,
  getTransactionInboundEmailAddress
} from "./transaction-inbound-email";

const priorDomain = process.env.KOINONIA_TRANSACTION_INBOUND_DOMAIN;

afterEach(() => {
  if (priorDomain === undefined) delete process.env.KOINONIA_TRANSACTION_INBOUND_DOMAIN;
  else process.env.KOINONIA_TRANSACTION_INBOUND_DOMAIN = priorDomain;
});

describe("transaction inbound email routing", () => {
  it("round trips a transaction id through its unique address", () => {
    process.env.KOINONIA_TRANSACTION_INBOUND_DOMAIN = "files.koinoniatransactions.com";
    const address = getTransactionInboundEmailAddress("cmtj8kzi0002145d65x9chyi");

    expect(address).toBe("tx-cmtj8kzi0002145d65x9chyi@files.koinoniatransactions.com");
    expect(getTransactionIdFromInboundRecipient(address!)).toBe("cmtj8kzi0002145d65x9chyi");
  });

  it("rejects recipients outside the configured inbound domain", () => {
    process.env.KOINONIA_TRANSACTION_INBOUND_DOMAIN = "files.koinoniatransactions.com";

    expect(getTransactionIdFromInboundRecipient("tx-abc@example.com")).toBeNull();
  });

  it("does not expose an address before an inbound domain exists", () => {
    delete process.env.KOINONIA_TRANSACTION_INBOUND_DOMAIN;

    expect(getTransactionInboundEmailAddress("abc")).toBeNull();
  });
});
