import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes
} from "node:crypto";

export type EncryptedPersonalFinanceValue = {
  ciphertext: string;
  initializationVector: string;
  authenticationTag: string;
  keyVersion: number;
  lastFour: string | null;
};

type EncryptionOptions = {
  key?: string;
  keyVersion?: number;
};

function resolveEncryptionKey(
  configuredKey?: string
): Buffer {
  const value =
    configuredKey ??
    process.env
      .PERSONAL_FINANCE_ENCRYPTION_KEY;

  if (!value?.trim()) {
    throw new Error(
      "PERSONAL_FINANCE_ENCRYPTION_KEY is required."
    );
  }

  const trimmed = value.trim();

  if (/^[a-f0-9]{64}$/i.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }

  try {
    const decoded =
      Buffer.from(trimmed, "base64");

    if (decoded.length === 32) {
      return decoded;
    }
  } catch {
    // Continue to the validation error.
  }

  throw new Error(
    "PERSONAL_FINANCE_ENCRYPTION_KEY must be a 32-byte base64 value or 64 hexadecimal characters."
  );
}

function normalizedSensitiveValue(
  value: string
): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(
      "A sensitive value is required."
    );
  }

  return normalized;
}

function lastFourCharacters(
  value: string
): string | null {
  const compact = value.replace(
    /[\s-]+/g,
    ""
  );

  return compact.length >= 4
    ? compact.slice(-4)
    : null;
}

export function encryptionKeyFingerprint(
  options: EncryptionOptions = {}
): string {
  return createHash("sha256")
    .update(
      resolveEncryptionKey(
        options.key
      )
    )
    .digest("hex")
    .slice(0, 12);
}

export function encryptPersonalFinanceValue(
  value: string,
  options: EncryptionOptions = {}
): EncryptedPersonalFinanceValue {
  const normalized =
    normalizedSensitiveValue(value);

  const key =
    resolveEncryptionKey(options.key);

  const initializationVector =
    randomBytes(12);

  const cipher = createCipheriv(
    "aes-256-gcm",
    key,
    initializationVector
  );

  const ciphertext = Buffer.concat([
    cipher.update(
      normalized,
      "utf8"
    ),
    cipher.final()
  ]);

  const authenticationTag =
    cipher.getAuthTag();

  return {
    ciphertext:
      ciphertext.toString("base64"),
    initializationVector:
      initializationVector.toString(
        "base64"
      ),
    authenticationTag:
      authenticationTag.toString(
        "base64"
      ),
    keyVersion:
      options.keyVersion ?? 1,
    lastFour:
      lastFourCharacters(normalized)
  };
}

export function decryptPersonalFinanceValue(
  encrypted:
    EncryptedPersonalFinanceValue,
  options: EncryptionOptions = {}
): string {
  const key =
    resolveEncryptionKey(options.key);

  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(
      encrypted.initializationVector,
      "base64"
    )
  );

  decipher.setAuthTag(
    Buffer.from(
      encrypted.authenticationTag,
      "base64"
    )
  );

  return Buffer.concat([
    decipher.update(
      Buffer.from(
        encrypted.ciphertext,
        "base64"
      )
    ),
    decipher.final()
  ]).toString("utf8");
}

export function maskSensitiveValue(
  lastFour: string | null | undefined
): string {
  return lastFour
    ? `•••• ${lastFour}`
    : "Stored securely";
}
