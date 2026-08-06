import {
  describe,
  expect,
  it
} from "vitest";

import {
  decryptPersonalFinanceValue,
  encryptPersonalFinanceValue,
  maskSensitiveValue
} from "./personal-finance-sensitive-local";

const TEST_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe(
  "personal finance sensitive values",
  () => {
    it(
      "encrypts and decrypts a full account number",
      () => {
        const encrypted =
          encryptPersonalFinanceValue(
            "1234 5678 9012 7788",
            {
              key: TEST_KEY
            }
          );

        expect(
          encrypted.ciphertext
        ).not.toContain("7788");

        expect(
          encrypted.lastFour
        ).toBe("7788");

        expect(
          decryptPersonalFinanceValue(
            encrypted,
            {
              key: TEST_KEY
            }
          )
        ).toBe(
          "1234 5678 9012 7788"
        );
      }
    );

    it(
      "rejects decryption with the wrong key",
      () => {
        const encrypted =
          encryptPersonalFinanceValue(
            "9876543210",
            {
              key: TEST_KEY
            }
          );

        expect(() =>
          decryptPersonalFinanceValue(
            encrypted,
            {
              key:
                "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"
            }
          )
        ).toThrow();
      }
    );

    it(
      "masks stored values by default",
      () => {
        expect(
          maskSensitiveValue("7788")
        ).toBe("•••• 7788");
      }
    );
  }
);
