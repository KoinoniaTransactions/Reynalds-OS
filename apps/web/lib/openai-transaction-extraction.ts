import {
  validateTransactionExtractionProposal,
  type TransactionExtractionProposal
} from "./transaction-extraction";
import type { TransactionSide, TransactionStage } from "./transaction-intake";

const openAiApiBase = "https://api.openai.com/v1";
const defaultModel = "gpt-5.6-luna";

export class TransactionDocumentExtractionError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "TransactionDocumentExtractionError";
    this.status = status;
  }
}

type ExtractDocumentInput = {
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
  sourceDocumentId: string;
  sourceDocumentType: string;
  side: TransactionSide;
  stage: TransactionStage;
};

type ModelExtraction = {
  clientNames: string[];
  propertyAddress: string | null;
  purchasePrice: number | null;
  earnestMoney: number | null;
  closingDate: string | null;
  possession: string | null;
  financingType: string | null;
  deadlines: Array<{ name: string; date: string }>;
  confidence: "high" | "medium" | "low";
  notes: string[];
};

export function isOpenAiTransactionExtractionConfigured(): boolean {
  return Boolean(getApiKey());
}

export async function extractTransactionDocumentWithOpenAI(
  input: ExtractDocumentInput
): Promise<TransactionExtractionProposal> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new TransactionDocumentExtractionError(
      "Automatic document extraction is not configured.",
      503
    );
  }

  const openAiFileId = await uploadShortLivedFile(input, apiKey);

  try {
    const modelExtraction = await createStructuredExtraction(
      input,
      openAiFileId,
      apiKey
    );

    return validateTransactionExtractionProposal({
      clientNames: modelExtraction.clientNames,
      propertyAddress: modelExtraction.propertyAddress ?? undefined,
      purchasePrice: modelExtraction.purchasePrice ?? undefined,
      earnestMoney: modelExtraction.earnestMoney ?? undefined,
      closingDate: modelExtraction.closingDate ?? undefined,
      possession: modelExtraction.possession ?? undefined,
      financingType: modelExtraction.financingType ?? undefined,
      deadlines: Object.fromEntries(
        modelExtraction.deadlines
          .filter((deadline) => deadline.name.trim() && deadline.date.trim())
          .map((deadline) => [deadline.name.trim(), deadline.date.trim()])
      ),
      confidence: modelExtraction.confidence,
      sourceDocumentId: input.sourceDocumentId,
      sourceDocumentType: input.sourceDocumentType,
      notes: modelExtraction.notes
    });
  } finally {
    await deleteOpenAiFileQuietly(openAiFileId, apiKey);
  }
}

async function uploadShortLivedFile(
  input: ExtractDocumentInput,
  apiKey: string
): Promise<string> {
  const form = new FormData();
  form.set("purpose", "user_data");
  form.set("expires_after[anchor]", "created_at");
  form.set("expires_after[seconds]", "3600");
  form.set(
    "file",
    new Blob([input.bytes], { type: input.mimeType || "application/octet-stream" }),
    input.fileName
  );

  const response = await fetch(`${openAiApiBase}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  });
  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok || typeof payload.id !== "string") {
    throw new TransactionDocumentExtractionError(
      getOpenAiErrorMessage(payload, "Could not prepare the document for extraction."),
      response.status >= 400 && response.status < 500 ? 400 : 502
    );
  }

  return payload.id;
}

async function createStructuredExtraction(
  input: ExtractDocumentInput,
  fileId: string,
  apiKey: string
): Promise<ModelExtraction> {
  const response = await fetch(`${openAiApiBase}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_DOCUMENT_EXTRACTION_MODEL?.trim() || defaultModel,
      store: false,
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text:
                "You extract factual real-estate transaction information from documents for human review. Never invent a value. Use null when the document does not state a value clearly. Client names must be the represented clients for the requested side, not every party in the document. Deadlines must contain only dates explicitly stated or unambiguously calculable from the document itself. Confidence is high only when the key identity/property fields are explicit and legible; otherwise use medium or low."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Extract the ${input.side} transaction fields for a ${input.stage} file from this ${input.sourceDocumentType}. Return only the structured extraction.`
            },
            {
              type: "input_file",
              file_id: fileId
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "koinonia_transaction_extraction",
          strict: true,
          schema: extractionJsonSchema
        }
      }
    })
  });
  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new TransactionDocumentExtractionError(
      getOpenAiErrorMessage(payload, "Automatic document extraction failed."),
      response.status >= 400 && response.status < 500 ? 400 : 502
    );
  }

  const outputText = getResponseOutputText(payload);

  if (!outputText) {
    throw new TransactionDocumentExtractionError(
      "The extraction provider did not return structured transaction data."
    );
  }

  try {
    return JSON.parse(outputText) as ModelExtraction;
  } catch {
    throw new TransactionDocumentExtractionError(
      "The extraction provider returned unreadable structured transaction data."
    );
  }
}

async function deleteOpenAiFileQuietly(fileId: string, apiKey: string) {
  try {
    await fetch(`${openAiApiBase}/files/${encodeURIComponent(fileId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${apiKey}` }
    });
  } catch {
    // Short-lived files also expire automatically. Cleanup is best effort.
  }
}

function getApiKey(): string | null {
  const value = process.env.OPENAI_API_KEY?.trim();
  return value || null;
}

function getOpenAiErrorMessage(
  payload: Record<string, unknown>,
  fallback: string
): string {
  const error = isRecord(payload.error) ? payload.error : null;
  return typeof error?.message === "string" && error.message.trim()
    ? error.message
    : fallback;
}

function getResponseOutputText(payload: Record<string, unknown>): string | null {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  if (!Array.isArray(payload.output)) return null;

  for (const item of payload.output) {
    if (!isRecord(item) || !Array.isArray(item.content)) continue;
    for (const content of item.content) {
      if (isRecord(content) && typeof content.text === "string" && content.text.trim()) {
        return content.text;
      }
    }
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

const extractionJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    clientNames: {
      type: "array",
      items: { type: "string" }
    },
    propertyAddress: { type: ["string", "null"] },
    purchasePrice: { type: ["number", "null"] },
    earnestMoney: { type: ["number", "null"] },
    closingDate: { type: ["string", "null"] },
    possession: { type: ["string", "null"] },
    financingType: { type: ["string", "null"] },
    deadlines: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          date: { type: "string" }
        },
        required: ["name", "date"]
      }
    },
    confidence: {
      type: "string",
      enum: ["high", "medium", "low"]
    },
    notes: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: [
    "clientNames",
    "propertyAddress",
    "purchasePrice",
    "earnestMoney",
    "closingDate",
    "possession",
    "financingType",
    "deadlines",
    "confidence",
    "notes"
  ]
} as const;
