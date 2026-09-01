import {
  validateTransactionExtractionProposal,
  type TransactionExtractionProposal
} from "./transaction-extraction";
import {
  getTransactionIntakeDefinition,
  type TransactionSide,
  type TransactionStage
} from "./transaction-intake";

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
  identifiedDocumentType: string;
  listPrice: number | null;
  listingEffectiveDate: string | null;
  listingExpirationDate: string | null;
  brokerageName: string | null;
  agentName: string | null;
  purchasePrice: number | null;
  earnestMoney: number | null;
  closingDate: string | null;
  possession: string | null;
  financingType: string | null;
  deadlines: Array<{ name: string; date: string }>;
  confidence: "high" | "medium" | "low";
  documentMatch: "match" | "mismatch" | "uncertain";
  documentMatchReason: string | null;
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
    const modelExtraction = await createStructuredExtraction(input, openAiFileId, apiKey);

    return validateTransactionExtractionProposal({
      clientNames: modelExtraction.clientNames,
      propertyAddress: modelExtraction.propertyAddress ?? undefined,
      identifiedDocumentType: modelExtraction.identifiedDocumentType,
      listPrice: modelExtraction.listPrice ?? undefined,
      listingEffectiveDate: modelExtraction.listingEffectiveDate ?? undefined,
      listingExpirationDate: modelExtraction.listingExpirationDate ?? undefined,
      brokerageName: modelExtraction.brokerageName ?? undefined,
      agentName: modelExtraction.agentName ?? undefined,
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
      documentMatch: modelExtraction.documentMatch,
      documentMatchReason: modelExtraction.documentMatchReason ?? undefined,
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
  const uploadBytes = new Uint8Array(input.bytes.byteLength);
  uploadBytes.set(input.bytes);

  form.set("purpose", "user_data");
  form.set("expires_after[anchor]", "created_at");
  form.set("expires_after[seconds]", "3600");
  form.set(
    "file",
    new Blob([uploadBytes.buffer], { type: input.mimeType || "application/octet-stream" }),
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
  const definition = getTransactionIntakeDefinition(input.side, input.stage);
  const expectedDocuments = [definition.preferredDocument, ...definition.alternateDocuments];
  const stageGuidance = buildStageGuidance(input.side, input.stage);

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
                "You extract factual Colorado real-estate transaction information from documents for human review. Never invent a value. Use null when a field is not stated clearly or is not applicable to this document. Client names must be the represented clients for the requested side, not every party named. First identify what document actually was uploaded (for example Listing Agreement, Buyer Agency Agreement, Contract to Buy and Sell, Counterproposal, Seller Disclosure, Pre-Approval Letter). Then decide whether that identified document is appropriate for the selected transaction side and stage. Do not mark a valid listing agreement as a mismatch merely because it is not a purchase contract. Listing agreements are expected seller-side documents before the property is under contract. Purchase-contract fields such as buyer purchase price, transaction earnest money, closing date, buyer financing, and contract possession are not required for a listing agreement and should be null unless this document truly establishes them for a sale transaction. A listing agreement's list price is listPrice, not purchasePrice. A listing agreement's minimum acceptable earnest-money term is not transaction earnestMoney. Listing effective/expiration dates belong in listingEffectiveDate/listingExpirationDate, not closingDate. Deadlines should contain only dates that actually function as deadlines for the identified document. Confidence is high only when the important fields for this document type are explicit and legible. documentMatch is advisory for the Realtor; use match when the document is suitable for the selected side/stage, mismatch when clearly unsuitable, and uncertain when ambiguous."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Selected file path: ${definition.title}. Expected/acceptable starting documents include: ${expectedDocuments.join(", ")}. ${stageGuidance} The upload was provisionally labeled "${input.sourceDocumentType}" by the intake UI; do not assume that label is correct. Identify the document from its contents, assess whether it belongs in this selected file path, and extract only fields appropriate to the identified document.`
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

function buildStageGuidance(side: TransactionSide, stage: TransactionStage): string {
  if (side === "seller" && stage === "pre_contract") {
    return "This is a seller listing-stage file. An executed listing agreement is a primary expected document and should normally be classified as a match. Extract seller names, property address, list price, listing dates, brokerage/agent, and other clearly stated listing terms. Do not expect a sale closing date or buyer purchase terms yet.";
  }

  if (side === "seller" && stage === "under_contract") {
    return "This is a seller file that is now under contract. The executed Contract to Buy and Sell is the primary transaction document; a listing agreement is still a valid supporting document but by itself does not establish the accepted sale terms.";
  }

  if (side === "buyer" && stage === "pre_contract") {
    return "This is a buyer representation-stage file. A buyer agency/representation agreement is a primary expected document. A property or purchase contract is not required yet.";
  }

  return "This is a buyer file that is under contract. The executed Contract to Buy and Sell is the primary source for purchase price, earnest money, deadlines, closing, possession, and financing terms.";
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
    identifiedDocumentType: { type: "string" },
    listPrice: { type: ["number", "null"] },
    listingEffectiveDate: { type: ["string", "null"] },
    listingExpirationDate: { type: ["string", "null"] },
    brokerageName: { type: ["string", "null"] },
    agentName: { type: ["string", "null"] },
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
    documentMatch: {
      type: "string",
      enum: ["match", "mismatch", "uncertain"]
    },
    documentMatchReason: { type: ["string", "null"] },
    notes: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: [
    "clientNames",
    "propertyAddress",
    "identifiedDocumentType",
    "listPrice",
    "listingEffectiveDate",
    "listingExpirationDate",
    "brokerageName",
    "agentName",
    "purchasePrice",
    "earnestMoney",
    "closingDate",
    "possession",
    "financingType",
    "deadlines",
    "confidence",
    "documentMatch",
    "documentMatchReason",
    "notes"
  ]
} as const;
