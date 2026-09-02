const DEFAULT_INBOUND_PREFIX = "tx";

export function getTransactionInboundEmailAddress(transactionId: string): string | null {
  const domain = process.env.KOINONIA_TRANSACTION_INBOUND_DOMAIN?.trim().toLocaleLowerCase("en-US");
  if (!domain) return null;

  return `${DEFAULT_INBOUND_PREFIX}-${normalizeTransactionEmailKey(transactionId)}@${domain}`;
}

export function getTransactionIdFromInboundRecipient(recipient: string): string | null {
  const domain = process.env.KOINONIA_TRANSACTION_INBOUND_DOMAIN?.trim().toLocaleLowerCase("en-US");
  if (!domain) return null;

  const normalizedRecipient = recipient.trim().toLocaleLowerCase("en-US");
  const suffix = `@${domain}`;
  if (!normalizedRecipient.endsWith(suffix)) return null;

  const localPart = normalizedRecipient.slice(0, -suffix.length);
  const prefix = `${DEFAULT_INBOUND_PREFIX}-`;
  if (!localPart.startsWith(prefix)) return null;

  const transactionId = localPart.slice(prefix.length).trim();
  return transactionId || null;
}

function normalizeTransactionEmailKey(transactionId: string): string {
  return transactionId.trim().toLocaleLowerCase("en-US").replace(/[^a-z0-9_-]/g, "");
}
