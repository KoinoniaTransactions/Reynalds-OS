import crypto from "node:crypto";
import { prisma } from "./db";
import {
  REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL,
  REYNALDS_BROTHERS_GMAIL_LABEL_NAME,
  classifyEmailForWorkItem,
  type ReynaldsBrothersEmailInput
} from "./reynalds-brothers-email-intake";
import {
  REYNALDS_BROTHERS_WORKSPACE_ID,
  REYNALDS_BROTHERS_WORK_ITEM_TYPE,
  type ReynaldsBrothersWorkItemData,
  type ReynaldsBrothersWorkItem
} from "./reynalds-brothers-work-items";
import type { Prisma } from "@reynalds-os/database";

// OAuth credentials are injected through the dedicated RB Vercel Preview environment.
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_API = "https://gmail.googleapis.com/gmail/v1";
const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const EXPECTED_ACCOUNT = process.env.RB_GMAIL_EXPECTED_ACCOUNT ?? "jeremiah@reynaldsbrothers.com";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function getGoogleClientId(): string {
  const clientId = requireEnv("GOOGLE_CLIENT_ID");
  if (!/^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/.test(clientId)) {
    throw new Error("GOOGLE_CLIENT_ID is malformed. Re-copy the Web application Client ID from Google Cloud.");
  }
  return clientId;
}

function getEncryptionKey(): Buffer {
  return crypto.createHash("sha256").update(requireEnv("RB_GMAIL_ENCRYPTION_SECRET")).digest();
}

export function encryptSecret(value: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptSecret(value: string): string {
  const [ivPart, tagPart, encryptedPart] = value.split(".");
  if (!ivPart || !tagPart || !encryptedPart) throw new Error("Stored Gmail credential is invalid.");

  const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64url")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}

export function getGoogleOauthRedirectUri(requestUrl: string): string {
  const configured = process.env.RB_GMAIL_REDIRECT_URI;
  if (configured) return configured;

  const url = new URL(requestUrl);
  return `${url.origin}/api/reynalds-brothers/gmail/callback`;
}

export function buildGoogleAuthorizationUrl(requestUrl: string, state: string): string {
  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: getGoogleOauthRedirectUri(requestUrl),
    response_type: "code",
    scope: GMAIL_SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
    login_hint: EXPECTED_ACCOUNT
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string, requestUrl: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: getGoogleClientId(),
      client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
      code,
      grant_type: "authorization_code",
      redirect_uri: getGoogleOauthRedirectUri(requestUrl)
    })
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error_description ?? payload.error ?? "Google token exchange failed.");

  return payload as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    scope?: string;
    token_type: string;
  };
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: requireEnv("GOOGLE_CLIENT_ID"),
      client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });

  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description ?? payload.error ?? "Google access token refresh failed.");
  }

  return payload.access_token as string;
}

async function gmailJson<T>(accessToken: string, path: string): Promise<T> {
  const response = await fetch(`${GMAIL_API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message ?? "Gmail API request failed.");
  return payload as T;
}

export async function getGmailProfile(accessToken: string) {
  return gmailJson<{ emailAddress: string; historyId?: string }>(accessToken, "/users/me/profile");
}

export async function getGmailLabelId(accessToken: string, labelName = REYNALDS_BROTHERS_GMAIL_LABEL_NAME) {
  const payload = await gmailJson<{ labels?: Array<{ id: string; name: string }> }>(accessToken, "/users/me/labels");
  const label = payload.labels?.find((item) => item.name === labelName);
  if (!label) throw new Error(`Gmail label "${labelName}" was not found.`);
  return label.id;
}

function decodeBase64Url(value?: string): string {
  if (!value) return "";
  return Buffer.from(value, "base64url").toString("utf8");
}

function findHeader(headers: Array<{ name?: string; value?: string }> | undefined, name: string): string {
  return headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function extractMessageBodies(payload: any): { text: string; html: string; attachments: Array<{ id?: string; fileName: string; mimeType?: string; sizeBytes?: number }> } {
  let text = "";
  let html = "";
  const attachments: Array<{ id?: string; fileName: string; mimeType?: string; sizeBytes?: number }> = [];

  function walk(part: any) {
    if (!part) return;

    if (part.filename) {
      attachments.push({
        id: part.body?.attachmentId,
        fileName: part.filename,
        mimeType: part.mimeType,
        sizeBytes: typeof part.body?.size === "number" ? part.body.size : undefined
      });
    }

    if (part.mimeType === "text/plain" && part.body?.data) text += decodeBase64Url(part.body.data);
    if (part.mimeType === "text/html" && part.body?.data) html += decodeBase64Url(part.body.data);

    for (const child of part.parts ?? []) walk(child);
  }

  walk(payload);
  return { text: text.trim(), html: html.trim(), attachments };
}

export async function getGmailMessage(accessToken: string, messageId: string): Promise<{
  id: string;
  threadId?: string;
  from: string;
  to: string;
  subject: string;
  sentAt?: string;
  snippet?: string;
  bodyText?: string;
  bodyHtml?: string;
  attachments: Array<{ id?: string; fileName: string; mimeType?: string; sizeBytes?: number }>;
}> {
  const payload = await gmailJson<any>(accessToken, `/users/me/messages/${encodeURIComponent(messageId)}?format=full`);
  const headers = payload.payload?.headers ?? [];
  const bodies = extractMessageBodies(payload.payload);

  return {
    id: payload.id,
    threadId: payload.threadId,
    from: findHeader(headers, "From"),
    to: findHeader(headers, "To"),
    subject: findHeader(headers, "Subject") || "(no subject)",
    sentAt: payload.internalDate ? new Date(Number(payload.internalDate)).toISOString() : undefined,
    snippet: payload.snippet,
    bodyText: bodies.text || payload.snippet,
    bodyHtml: bodies.html || undefined,
    attachments: bodies.attachments
  };
}

export async function listGmailMessageIds(accessToken: string, labelId: string, maxResults = 50): Promise<string[]> {
  const params = new URLSearchParams({
    labelIds: labelId,
    maxResults: String(maxResults)
  });
  const payload = await gmailJson<{ messages?: Array<{ id: string }> }>(
    accessToken,
    `/users/me/messages?${params.toString()}`
  );

  return payload.messages?.map((item) => item.id) ?? [];
}

function toWorkItemData(data: Prisma.JsonValue | null): ReynaldsBrothersWorkItemData | null {
  if (!data || Array.isArray(data) || typeof data !== "object") return null;
  return data as ReynaldsBrothersWorkItemData;
}

async function getWorkItems(): Promise<ReynaldsBrothersWorkItem[]> {
  const objects = await prisma.rosObject.findMany({
    where: {
      workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
      objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
      archivedAt: null
    }
  });

  return objects.map((object) => ({
    id: object.id,
    objectType: object.objectType,
    name: object.name,
    status: object.status,
    health: object.health,
    nextAction: object.nextAction,
    data: toWorkItemData(object.data)
  }));
}

export async function syncWalMartTanksGmail(limit = 50) {
  const connection = await prisma.gmailConnection.findFirst({
    where: {
      workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
      status: "active"
    },
    orderBy: { updatedAt: "desc" }
  });

  if (!connection) throw new Error("Reynalds Brothers Gmail is not connected.");

  const accessToken = await refreshGoogleAccessToken(decryptSecret(connection.encryptedRefreshToken));
  const labelId = await getGmailLabelId(accessToken);
  const messageIds = await listGmailMessageIds(accessToken, labelId, limit);
  const workItems = await getWorkItems();

  let imported = 0;
  let filed = 0;
  let review = 0;
  let duplicates = 0;

  for (const messageId of messageIds.reverse()) {
    const existing = await prisma.communication.findUnique({
      where: {
        workspaceId_source_externalMessageId: {
          workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
          source: "gmail",
          externalMessageId: messageId
        }
      }
    });

    if (existing) {
      duplicates += 1;
      continue;
    }

    const message = await getGmailMessage(accessToken, messageId);
    const email: ReynaldsBrothersEmailInput = {
      providerMessageId: message.id,
      providerThreadId: message.threadId,
      sourceUrl: `https://mail.google.com/mail/u/0/#all/${message.id}`,
      from: message.from,
      to: message.to,
      subject: message.subject,
      receivedAt: message.sentAt,
      snippet: message.snippet,
      body: message.bodyText,
      sourceLabel: REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL,
      attachments: message.attachments.map((attachment) => attachment.fileName)
    };
    const classification = classifyEmailForWorkItem(email, workItems);
    const confidenceScore = classification.confidence === "high" ? 100 : classification.confidence === "medium" ? 70 : 30;
    const shouldFile = classification.action === "link_to_work_item" && Boolean(classification.matchedWorkItemId);

    const communication = await prisma.communication.create({
      data: {
        workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
        source: "gmail",
        externalMessageId: message.id,
        externalThreadId: message.threadId,
        workItemId: shouldFile ? classification.matchedWorkItemId : null,
        subject: message.subject,
        sender: message.from,
        recipients: message.to ? [message.to] : [],
        sentAt: message.sentAt ? new Date(message.sentAt) : null,
        snippet: message.snippet,
        bodyText: message.bodyText,
        bodyHtml: message.bodyHtml,
        sourceUrl: email.sourceUrl,
        status: shouldFile ? "filed" : "review",
        matchConfidence: confidenceScore,
        matchEvidence: {
          confidence: classification.confidence,
          action: classification.action,
          reasons: classification.reasons
        },
        identifiers: {
          storeNumbers: classification.extractedStoreNumbers ?? [],
          suggestedStoreNumber: classification.suggestedStoreNumber ?? null
        },
        location: classification.suggestedLocation
          ? {
              display: classification.suggestedLocation,
              city: classification.suggestedCity ?? null,
              state: classification.suggestedState ?? null
            }
          : undefined,
        rawMetadata: {
          channel: "email",
          direction: "inbound",
          sourceLabel: REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL,
          humanResponseStatus: shouldFile ? "Needs Response" : "Needs Review"
        }
      }
    });

    if (message.attachments.length > 0) {
      await prisma.communicationAttachment.createMany({
        data: message.attachments.map((attachment, index) => ({
          communicationId: communication.id,
          externalAttachmentId: attachment.id ?? `${message.id}:${index + 1}`,
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          sizeBytes: attachment.sizeBytes
        })),
        skipDuplicates: true
      });
    }

    if (shouldFile && classification.matchedWorkItemId) {
      filed += 1;
    } else {
      await prisma.communicationReviewItem.create({
        data: {
          workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
          communicationId: communication.id,
          suggestedWorkItemId: classification.matchedWorkItemId,
          category: classification.multiStoreFlag
            ? "multi_store"
            : classification.action === "create_work_item"
              ? "new_work"
              : "unmatched",
          reason: classification.reasons.join(" "),
          status: "open",
          confidence: confidenceScore,
          evidence: {
            classification,
            sourceLabel: REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL
          }
        }
      });
      review += 1;
    }

    imported += 1;
  }

  await prisma.importCheckpoint.upsert({
    where: {
      workspaceId_source_mailbox_label: {
        workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
        source: "gmail",
        mailbox: EXPECTED_ACCOUNT,
        label: REYNALDS_BROTHERS_GMAIL_LABEL_NAME
      }
    },
    update: {
      lastSyncedAt: new Date(),
      status: "ok",
      metadata: { imported, filed, review, duplicates, limit }
    },
    create: {
      workspaceId: REYNALDS_BROTHERS_WORKSPACE_ID,
      source: "gmail",
      mailbox: EXPECTED_ACCOUNT,
      label: REYNALDS_BROTHERS_GMAIL_LABEL_NAME,
      lastSyncedAt: new Date(),
      status: "ok",
      metadata: { imported, filed, review, duplicates, limit }
    }
  });

  return { imported, filed, review, duplicates, scanned: messageIds.length };
}

export const RB_GMAIL_EXPECTED_ACCOUNT = EXPECTED_ACCOUNT;
export const RB_GMAIL_SCOPE = GMAIL_SCOPE;
