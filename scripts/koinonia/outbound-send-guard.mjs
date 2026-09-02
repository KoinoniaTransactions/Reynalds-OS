#!/usr/bin/env node

/**
 * Koinonia outbound prospecting send guard.
 *
 * This module intentionally fails closed. Provider credentials, a prepared
 * message, a staged campaign, or KOINONIA_OUTBOUND_EMAIL_ENABLED=true are not
 * sufficient by themselves to authorize a prospect transmission.
 *
 * Every future outbound marketing sender must call assertKoinoniaSendAuthorized
 * immediately before handing a live prospect message to a provider.
 */

const TRUE_VALUES = new Set(['true', '1', 'yes']);

function normalize(value) {
  return String(value ?? '').trim();
}

export function isKoinoniaOutboundEnabled(env = process.env) {
  return TRUE_VALUES.has(normalize(env.KOINONIA_OUTBOUND_EMAIL_ENABLED).toLowerCase());
}

export function assertKoinoniaSendAuthorized({
  campaignId,
  batchId,
  authorization,
  env = process.env,
}) {
  if (!isKoinoniaOutboundEnabled(env)) {
    throw new Error(
      'Koinonia outbound email is disabled. No prospect message may be transmitted.'
    );
  }

  if (!authorization || authorization.status !== 'AUTHORIZED') {
    throw new Error(
      'Koinonia send blocked: a current explicit Jeremiah authorization record is required.'
    );
  }

  if (!campaignId || !batchId) {
    throw new Error('Koinonia send blocked: campaignId and batchId are required.');
  }

  if (authorization.campaignId !== campaignId || authorization.batchId !== batchId) {
    throw new Error(
      'Koinonia send blocked: authorization scope does not match this campaign/batch.'
    );
  }

  if (!authorization.authorizedBy || authorization.authorizedBy !== 'Jeremiah Reynalds') {
    throw new Error('Koinonia send blocked: authorization owner is invalid.');
  }

  if (!authorization.authorizedAt) {
    throw new Error('Koinonia send blocked: authorization timestamp is required.');
  }

  if (authorization.revokedAt) {
    throw new Error('Koinonia send blocked: authorization has been revoked.');
  }

  return true;
}

// Manual diagnostic only. This never sends anything.
if (import.meta.url === `file://${process.argv[1]}`) {
  const enabled = isKoinoniaOutboundEnabled();
  console.log(
    JSON.stringify(
      {
        outbound_environment_gate: enabled ? 'ENABLED' : 'DISABLED',
        live_send_authorized: false,
        note: 'Environment state alone never authorizes a send.',
      },
      null,
      2
    )
  );
}
