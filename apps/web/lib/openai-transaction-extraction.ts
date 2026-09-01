import {
  validateTransactionExtractionProposal,
  type TransactionExtractionProposal
} from "./transaction-extraction";
import {
  getTransactionDocumentRequirements,
  type TransactionDocumentRequirement
} from "./transaction-document-requirements";
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
  documentRequirementId: string;
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
    const requirements = getTransactionDocumentRequirements(input.side, input.stage);
    const modelExtraction = await createStructuredExtraction(
      input,
      openAiFileId,
      apiKey,
      requirements
    );
    const allowedRequirementIds = new Set(requirements.map((requirement) => requirement.id));
    const documentRequirementId = allowedRequirementIds.has(modelExtraction.documentRequirementId)
      ? modelExtraction.documentRequirementId
      : undefined;

    return validateTransactionExtractionProposal({
      clientNames: modelExtraction.clientNames,
      propertyAddress: modelExtraction.propertyAddress ?? undefined,
      identifiedDocumentType: modelExtraction.identifiedDocumentType,
      documentRequirementId,
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
  apiKey: string,
  requirements: TransactionDocumentRequirement[]
): Promise<ModelExtraction> {
  const definition = getTransactionIntakeDefinition(input.side, input.stage);
  const stageGuidance = buildStageGuidance(input.side, input.stage);
  const requirementGuide = requirements
    .map(
      (requirement) =>
        `${requirement.id}: ${requirement.label} (${requirement.level}) — ${requirement.guidance}`
    )
    .join("\n");

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
                "You extract factual Colorado real-estate transaction information from documents for human review. Never invent a value. Use null when a field is not stated clearly or is not applicable. First identify what document actually was uploaded, then classify it against the exact checklist supplied by the user. documentRequirementId must be one supplied checklist ID or other. Use a checklist ID when the document clearly satisfies that requirement even if its printed title varies. Use other when none fit. documentMatch asks whether the upload belongs in the selected transaction path at all: match when suitable, mismatch when clearly unrelated/unsuitable, uncertain when ambiguous. A valid supporting or conditional document can be a match even when it is not the primary contract. Client names must be the represented clients for the requested side, not every party named. A listing agreement's list price is listPrice, not purchasePrice. A listing agreement's minimum acceptable earnest-money term is not transaction earnestMoney. Listing effective/expiration dates belong in listingEffectiveDate/listingExpirationDate, not closingDate. Purchase-contract fields are only for documents that actually establish an accepted sale transaction. Deadlines must be genuine deadlines for the identified document. Confidence is high only when the important fields for this document type are explicit and legible."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Selected path: ${definition.title}. ${stageGuidance}\n\nKnown document checklist for this path:\n${requirementGuide}\n\nThe upload was provisionally labeled "${input.sourceDocumentType}" by the intake UI; do not assume that label is correct. Identify the document from its contents, choose the best checklist ID or other, assess whether it belongs in this selected path, and extract fields appropriate to the identified document.`
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
          schema: buildExtractionJsonSchema(requirements)
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
    return "This is a seller listing-stage file. A listing agreement is a primary expected document. Seller disclosures, property/HOA documents, and MLS information may also legitimately belong in this file. Do not expect an accepted sale contract yet.";
  }

  if (side === "seller" && stage === "under_contract") {
    return "This seller file is under contract. The executed purchase contract is the primary source for accepted sale terms, while the listing agreement and applicable seller/property disclosures remain valid required or supporting documents.";
  }

  if (side === "buyer" && stage === "pre_contract") {
    return "This is a buyer representation-stage file. A buyer agency/representation agreement is primary; lender qualification material and buyer intake material may also legitimately belong in the file. A purchase contract is not required yet.";
  }

  return "This buyer file is under contract. The executed purchase contract is primary for sale terms, while the buyer representation agreement and applicable lender/counter/amendment documents also legitimately belong in the file.";
}

function buildExtractionJsonSchema(requirements: TransactionDocumentRequirement[]) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      clientNames: { type: "array", items: { type: "string" } },
      propertyAddress: { type: ["string", "null"] },
      identifiedDocumentType: { type: "string" },
      documentRequirementId: {
        type: "string",
        enum: [...requirements.map((requirement) => requirement.id), "other"]
      },
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
      confidence: { type: "string", enum: ["high", "medium", "low"] },
      documentMatch: { type: "string", enum: ["match", "mismatch", "uncertain"] },
      documentMatchReason: { type: ["string", "null"] },
      notes: { type: "array", items: { type: "string" } }
    },
    required: [
      "clientNames",
      "propertyAddress",
      "identifiedDocumentType",
      "documentRequirementId",
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
