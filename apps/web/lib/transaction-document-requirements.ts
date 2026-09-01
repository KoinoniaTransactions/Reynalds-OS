import type { TransactionSide, TransactionStage } from "./transaction-intake";

export type TransactionDocumentRequirementLevel = "required" | "expected" | "optional";
export type TransactionDocumentRequirementPhase =
  | "representation"
  | "listing"
  | "contract"
  | "due_diligence"
  | "closing"
  | "final_file";

export type TransactionFacts = {
  propertyUse?: "residential" | "income_residential" | "land" | "commercial" | "unknown";
  yearBuilt?: number;
  inHoa?: boolean;
  squareFootageAdvertised?: boolean;
  sellerDisclosureExempt?: boolean;
  waterDisclosureSatisfied?: boolean;
  financingType?: "cash" | "loan" | "owner_carry" | "unknown";
  shortSale?: boolean;
  foreclosure?: boolean;
  manufacturedHome?: boolean;
  hasCounterproposal?: boolean;
  contractAmended?: boolean;
  inspectionObjectionUsed?: boolean;
  titleObjectionUsed?: boolean;
  appraisalObjectionUsed?: boolean;
  contractTerminated?: boolean;
  contractRevived?: boolean;
  powerOfAttorneyUsed?: boolean;
  personalPropertyAgreementUsed?: boolean;
  postClosingOccupancy?: boolean;
  preClosingOccupancy?: boolean;
  affiliatedBusinessReferral?: boolean;
  referralFee?: boolean;
};

export type TransactionFactKey = keyof TransactionFacts;

export type TransactionDocumentRequirement = {
  id: string;
  label: string;
  level: TransactionDocumentRequirementLevel;
  phase: TransactionDocumentRequirementPhase;
  aliases: string[];
  guidance: string;
  source: "colorado_dre" | "transaction_workflow";
  appliesWhen?: (facts: TransactionFacts) => boolean | undefined;
  factKeys?: TransactionFactKey[];
};

export type TransactionDocumentChecklistStatus =
  | "received"
  | "missing"
  | "expected"
  | "optional"
  | "upcoming";

export type TransactionDocumentChecklistItem = TransactionDocumentRequirement & {
  status: TransactionDocumentChecklistStatus;
  documentId?: string;
  fileName?: string;
};

export type TransactionRequirementQuestion = {
  factKey: TransactionFactKey;
  prompt: string;
  helpText: string;
  options: Array<{ label: string; value: string }>;
};

type RequirementSet = {
  side: TransactionSide;
  stage: TransactionStage;
  requirements: TransactionDocumentRequirement[];
};

const requirementSets: RequirementSet[] = [
  {
    side: "buyer",
    stage: "pre_contract",
    requirements: [
      req("buyer-agency-agreement", "Buyer Agency / Representation Agreement", "required", "representation", ["exclusive right to buy listing contract", "buyer agency agreement", "buyer representation agreement"], "Establishes the buyer representation relationship.", "colorado_dre"),
      req("brokerage-disclosure-buyer", "Brokerage Disclosure to Buyer", "expected", "representation", ["brokerage disclosure to buyer"], "Used when the brokerage relationship requires this disclosure rather than an agency listing contract.", "colorado_dre"),
      req("definitions-working-relationships", "Definitions of Working Relationships", "expected", "representation", ["definitions of working relationships"], "Relationship disclosure retained when used.", "colorado_dre"),
      req("lender-letter", "Lender Pre-Approval / Prequalification", "expected", "representation", ["pre-approval letter", "preapproval letter", "prequalification letter", "lender letter"], "Track for financed buyers when the broker receives a copy.", "colorado_dre", (facts) => boolWhen(facts.financingType, (value) => value === "loan"), ["financingType"]),
      req("affiliated-business-disclosure", "Affiliated Business Arrangement Disclosure", "required", "representation", ["affiliated business arrangement disclosure", "affiliated business disclosure"], "Required when an affiliated-business referral/disclosure is triggered.", "colorado_dre", (facts) => facts.affiliatedBusinessReferral, ["affiliatedBusinessReferral"]),
      req("referral-fee-agreement", "Referral Fee Agreement", "required", "representation", ["referral fee agreement"], "Track when a referral fee applies.", "colorado_dre", (facts) => facts.referralFee, ["referralFee"])
    ]
  },
  {
    side: "buyer",
    stage: "under_contract",
    requirements: [
      req("purchase-contract", "Executed Contract to Buy and Sell", "required", "contract", ["contract to buy and sell real estate", "executed contract to buy and sell", "purchase contract", "sales contract"], "Primary executed purchase contract.", "colorado_dre"),
      req("buyer-agency-agreement", "Buyer Agency / Representation Agreement", "required", "representation", ["exclusive right to buy listing contract", "buyer agency agreement", "buyer representation agreement"], "Buyer representation agreement for the client relationship.", "colorado_dre"),
      req("counterproposal", "Counterproposal", "required", "contract", ["counterproposal", "counter proposal"], "Required when a counterproposal forms part of the agreement.", "colorado_dre", (facts) => facts.hasCounterproposal, ["hasCounterproposal"]),
      req("contract-addenda", "Contract Addenda / Attachments", "expected", "contract", ["addendum", "addenda", "contract attachment"], "Retain addenda and attachments that form part of the contract.", "colorado_dre"),
      req("amend-extend", "Agreement to Amend / Extend", "required", "due_diligence", ["agreement to amend extend", "amend extend", "amendment", "extension"], "Required when contract terms or deadlines are amended.", "colorado_dre", (facts) => facts.contractAmended, ["contractAmended"]),
      req("earnest-money-receipt", "Earnest Money Receipt", "expected", "contract", ["earnest money receipt", "earnest money deposit receipt"], "Track receipt/third-party evidence when earnest money is delivered.", "colorado_dre"),
      req("seller-property-disclosure", "Seller Property Disclosure", "expected", "due_diligence", ["seller property disclosure", "seller's property disclosure", "sellers property disclosure"], "Common residential due-diligence document unless the seller/transaction is exempt.", "colorado_dre", residentialAndNotExempt, ["propertyUse", "sellerDisclosureExempt"]),
      req("square-footage-disclosure", "Square Footage Disclosure", "required", "due_diligence", ["square footage disclosure"], "Required when a broker advertises residential square footage.", "colorado_dre", (facts) => residentialRule(facts, facts.squareFootageAdvertised), ["propertyUse", "squareFootageAdvertised"]),
      req("lead-based-paint-disclosure", "Lead-Based Paint Disclosure", "required", "due_diligence", ["lead-based paint disclosure", "lead based paint disclosure", "lead-based paint"], "Applies to covered residential housing built before 1978.", "colorado_dre", leadPaintRule, ["propertyUse", "yearBuilt"]),
      req("source-of-water-addendum", "Source of Water Addendum / Disclosure", "required", "due_diligence", ["source of water addendum", "source of water disclosure"], "Track when the residential source-of-water disclosure is not already satisfied in another approved document.", "colorado_dre", (facts) => residentialRule(facts, facts.waterDisclosureSatisfied === undefined ? undefined : !facts.waterDisclosureSatisfied), ["propertyUse", "waterDisclosureSatisfied"]),
      req("association-documents", "HOA / Association Documents", "required", "due_diligence", ["association documents", "hoa documents", "common interest community documents"], "Seller must provide the contract-defined association documents when the property is in a common-interest community.", "transaction_workflow", (facts) => residentialRule(facts, facts.inHoa), ["propertyUse", "inHoa"]),
      req("inspection-report", "Inspection Report", "optional", "due_diligence", ["inspection report"], "Retain when the broker receives a copy.", "colorado_dre"),
      req("inspection-objection", "Inspection Objection Notice", "required", "due_diligence", ["inspection objection", "inspection objection notice"], "Required when an inspection objection is made.", "colorado_dre", (facts) => facts.inspectionObjectionUsed, ["inspectionObjectionUsed"]),
      req("inspection-resolution", "Inspection Resolution", "required", "due_diligence", ["inspection resolution"], "Track when an inspection objection is resolved by written resolution.", "colorado_dre", (facts) => facts.inspectionObjectionUsed, ["inspectionObjectionUsed"]),
      req("title-objection", "Title-Related Objection Notice", "required", "due_diligence", ["title-related objection notice", "title objection notice"], "Required when a title objection is made.", "colorado_dre", (facts) => facts.titleObjectionUsed, ["titleObjectionUsed"]),
      req("appraisal-objection", "Appraised Value Objection Notice", "required", "due_diligence", ["appraised value objection notice", "appraisal objection"], "Required when the appraisal objection process is used.", "colorado_dre", (facts) => facts.appraisalObjectionUsed, ["appraisalObjectionUsed"]),
      req("manufactured-home-addendum", "Manufactured Home Addendum", "required", "contract", ["manufactured home addendum"], "Track when the property/contract includes a manufactured home and the addendum is applicable.", "colorado_dre", (facts) => facts.manufacturedHome, ["manufacturedHome"]),
      req("short-sale-addendum", "Short Sale Addendum", "required", "contract", ["short sale addendum"], "Required when the transaction is a short sale.", "colorado_dre", (facts) => facts.shortSale, ["shortSale"]),
      req("foreclosure-protection-documents", "Foreclosure Protection Act Documents", "required", "contract", ["foreclosure protection act contract", "seller warning", "homeowner warning notice", "notice of cancellation"], "Special Colorado foreclosure-protection documents may be required for covered transactions; supervisory/legal review is appropriate.", "colorado_dre", (facts) => facts.foreclosure, ["foreclosure"]),
      req("personal-property-agreement", "Personal Property Agreement / Bill of Sale", "required", "contract", ["personal property agreement", "bill of sale"], "Track when personal property is handled in a separate agreement.", "colorado_dre", (facts) => facts.personalPropertyAgreementUsed, ["personalPropertyAgreementUsed"]),
      req("power-of-attorney", "Power of Attorney", "required", "contract", ["power of attorney"], "Track when a party signs through a power of attorney.", "colorado_dre", (facts) => facts.powerOfAttorneyUsed, ["powerOfAttorneyUsed"]),
      req("preclosing-occupancy", "Rental / Occupancy Agreement Prior to Closing", "required", "closing", ["rental occupancy agreement", "pre-closing occupancy agreement", "preclosing occupancy agreement"], "Required when occupancy occurs before closing.", "colorado_dre", (facts) => facts.preClosingOccupancy, ["preClosingOccupancy"]),
      req("postclosing-occupancy", "Post-Closing Occupancy Agreement", "required", "closing", ["post-closing occupancy agreement", "seller rent-back agreement", "seller rent back agreement"], "Required when seller remains in possession after closing under an occupancy agreement.", "colorado_dre", (facts) => facts.postClosingOccupancy, ["postClosingOccupancy"]),
      req("closing-instructions", "Closing Instructions", "expected", "closing", ["closing instructions"], "Retain the executed closing instructions.", "colorado_dre"),
      req("closing-statement", "Signed Closing / Settlement Statement", "expected", "final_file", ["closing statement", "settlement statement", "closing disclosure"], "Retain the signed closing/settlement statement for the represented consumer.", "colorado_dre"),
      req("notice-to-terminate", "Notice to Terminate", "required", "due_diligence", ["notice to terminate"], "Required when the contract is terminated by notice.", "colorado_dre", (facts) => facts.contractTerminated, ["contractTerminated"]),
      req("agreement-to-revive", "Agreement to Revive Contract", "required", "contract", ["agreement to revive contract"], "Required when a terminated/expired contract is revived.", "colorado_dre", (facts) => facts.contractRevived, ["contractRevived"]),
      req("affiliated-business-disclosure", "Affiliated Business Arrangement Disclosure", "required", "contract", ["affiliated business arrangement disclosure", "affiliated business disclosure"], "Required when an affiliated-business referral/disclosure is triggered.", "colorado_dre", (facts) => facts.affiliatedBusinessReferral, ["affiliatedBusinessReferral"]),
      req("referral-fee-agreement", "Referral Fee Agreement", "required", "final_file", ["referral fee agreement"], "Track when a referral fee applies.", "colorado_dre", (facts) => facts.referralFee, ["referralFee"]),
      req("lender-letter", "Lender Letter / Pre-Approval", "expected", "contract", ["pre-approval letter", "preapproval letter", "prequalification letter", "lender letter"], "Retain when the broker has a copy for financed transactions.", "colorado_dre", (facts) => boolWhen(facts.financingType, (value) => value === "loan"), ["financingType"])
    ]
  },
  {
    side: "seller",
    stage: "pre_contract",
    requirements: [
      req("listing-agreement", "Listing Agreement", "required", "listing", ["exclusive right to sell listing contract", "listing agreement", "executed listing agreement"], "Primary listing-side agreement.", "colorado_dre"),
      req("listing-amend-extend", "Listing Contract Amend / Extend", "required", "listing", ["listing contract amend extend", "listing amend extend"], "Required when the listing agreement is amended or extended.", "colorado_dre", (facts) => facts.contractAmended, ["contractAmended"]),
      req("seller-property-disclosure", "Seller Property Disclosure", "expected", "listing", ["seller property disclosure", "seller's property disclosure", "sellers property disclosure"], "Common residential listing document unless the seller/transaction is exempt.", "colorado_dre", residentialAndNotExempt, ["propertyUse", "sellerDisclosureExempt"]),
      req("square-footage-disclosure", "Square Footage Disclosure", "required", "listing", ["square footage disclosure"], "Required when a broker advertises residential square footage, including MLS advertising.", "colorado_dre", (facts) => residentialRule(facts, facts.squareFootageAdvertised), ["propertyUse", "squareFootageAdvertised"]),
      req("lead-based-paint-disclosure", "Lead-Based Paint Disclosure", "required", "listing", ["lead-based paint disclosure", "lead based paint disclosure", "lead-based paint"], "Applies to covered residential housing built before 1978.", "colorado_dre", leadPaintRule, ["propertyUse", "yearBuilt"]),
      req("source-of-water-addendum", "Source of Water Addendum / Disclosure", "required", "listing", ["source of water addendum", "source of water disclosure"], "Track when the residential source-of-water disclosure is not already satisfied in another approved document.", "colorado_dre", (facts) => residentialRule(facts, facts.waterDisclosureSatisfied === undefined ? undefined : !facts.waterDisclosureSatisfied), ["propertyUse", "waterDisclosureSatisfied"]),
      req("association-documents", "HOA / Association Documents", "expected", "listing", ["association documents", "hoa documents", "common interest community documents"], "Collect early when the property is in a common-interest community so the under-contract delivery deadline can be met.", "transaction_workflow", (facts) => residentialRule(facts, facts.inHoa), ["propertyUse", "inHoa"]),
      req("short-sale-listing-addendum", "Short Sale Addendum — Seller Listing Contract", "required", "listing", ["short sale addendum seller listing contract", "short sale listing addendum"], "Required when the listing is being handled as a short sale.", "colorado_dre", (facts) => facts.shortSale, ["shortSale"]),
      req("power-of-attorney", "Power of Attorney", "required", "listing", ["power of attorney"], "Track when a seller signs through a power of attorney.", "colorado_dre", (facts) => facts.powerOfAttorneyUsed, ["powerOfAttorneyUsed"]),
      req("mls-history", "MLS Listing History / Current Marketing Record", "expected", "listing", ["mls listing history", "mls history", "mls listing"], "Retain current marketing/MLS information used in the transaction.", "colorado_dre"),
      req("cma", "Comparable Market Analysis", "optional", "listing", ["comparable market analysis", "cma"], "Retain when prepared/used in the file.", "colorado_dre"),
      req("property-marketing", "Property Brochure / Marketing Materials", "optional", "listing", ["property brochure", "marketing materials"], "Retain when used in the transaction file.", "colorado_dre"),
      req("affiliated-business-disclosure", "Affiliated Business Arrangement Disclosure", "required", "listing", ["affiliated business arrangement disclosure", "affiliated business disclosure"], "Required when an affiliated-business referral/disclosure is triggered.", "colorado_dre", (facts) => facts.affiliatedBusinessReferral, ["affiliatedBusinessReferral"]),
      req("referral-fee-agreement", "Referral Fee Agreement", "required", "listing", ["referral fee agreement"], "Track when a referral fee applies.", "colorado_dre", (facts) => facts.referralFee, ["referralFee"])
    ]
  },
  {
    side: "seller",
    stage: "under_contract",
    requirements: []
  }
];

// Seller-under-contract needs the listing file plus the sale-side contract-to-close file.
requirementSets.find((set) => set.side === "seller" && set.stage === "under_contract")!.requirements = [
  ...requirementSets.find((set) => set.side === "seller" && set.stage === "pre_contract")!.requirements,
  ...requirementSets.find((set) => set.side === "buyer" && set.stage === "under_contract")!.requirements.filter(
    (requirement) => !["buyer-agency-agreement", "brokerage-disclosure-buyer", "lender-letter"].includes(requirement.id)
  )
];

export function getTransactionDocumentRequirements(
  side: TransactionSide,
  stage: TransactionStage
): TransactionDocumentRequirement[] {
  return requirementSets.find((set) => set.side === side && set.stage === stage)?.requirements ?? [];
}

export function getApplicableTransactionDocumentRequirements(
  side: TransactionSide,
  stage: TransactionStage,
  facts: TransactionFacts
): TransactionDocumentRequirement[] {
  return getTransactionDocumentRequirements(side, stage).filter((requirement) => {
    if (!requirement.appliesWhen) return true;
    return requirement.appliesWhen(facts) === true;
  });
}

export function getTransactionDocumentRequirement(
  side: TransactionSide,
  stage: TransactionStage,
  requirementId: string | undefined
): TransactionDocumentRequirement | undefined {
  if (!requirementId) return undefined;
  return getTransactionDocumentRequirements(side, stage).find((requirement) => requirement.id === requirementId);
}

export function buildTransactionDocumentChecklist(
  side: TransactionSide,
  stage: TransactionStage,
  documents: Array<{ id: string; documentType: string; fileName: string }>,
  facts: TransactionFacts = {},
  currentPhase: TransactionDocumentRequirementPhase = stage === "pre_contract"
    ? side === "seller" ? "listing" : "representation"
    : "contract"
): TransactionDocumentChecklistItem[] {
  const availableDocuments = [...documents];
  const phaseOrder: TransactionDocumentRequirementPhase[] = ["representation", "listing", "contract", "due_diligence", "closing", "final_file"];
  const currentPhaseIndex = phaseOrder.indexOf(currentPhase);

  return getTransactionDocumentRequirements(side, stage).flatMap((requirement) => {
    const applies = requirement.appliesWhen?.(facts);
    if (applies === false || applies === undefined && requirement.appliesWhen) return [];

    const matchIndex = availableDocuments.findIndex((document) => documentTypeMatchesRequirement(document.documentType, requirement));
    const matched = matchIndex >= 0 ? availableDocuments.splice(matchIndex, 1)[0] : undefined;
    const requirementPhaseIndex = phaseOrder.indexOf(requirement.phase);

    return [{
      ...requirement,
      status: matched
        ? "received"
        : requirementPhaseIndex > currentPhaseIndex
          ? "upcoming"
          : requirement.level === "required"
            ? "missing"
            : requirement.level,
      documentId: matched?.id,
      fileName: matched?.fileName
    }];
  });
}

export function getTransactionRequirementQuestions(
  side: TransactionSide,
  stage: TransactionStage,
  facts: TransactionFacts
): TransactionRequirementQuestion[] {
  const unresolved = new Set<TransactionFactKey>();
  for (const requirement of getTransactionDocumentRequirements(side, stage)) {
    if (!requirement.appliesWhen || requirement.appliesWhen(facts) !== undefined) continue;
    for (const factKey of requirement.factKeys ?? []) {
      if (facts[factKey] === undefined || facts[factKey] === "unknown") unresolved.add(factKey);
    }
  }

  return [...unresolved]
    .map((factKey) => factQuestions[factKey])
    .filter((question): question is TransactionRequirementQuestion => Boolean(question));
}

export function documentTypeMatchesRequirement(
  documentType: string,
  requirement: TransactionDocumentRequirement
): boolean {
  const normalized = normalizeDocumentType(documentType);
  return [requirement.label, ...requirement.aliases]
    .map(normalizeDocumentType)
    .some((candidate) => candidate === normalized || normalized.includes(candidate) || candidate.includes(normalized));
}

const factQuestions: Partial<Record<TransactionFactKey, TransactionRequirementQuestion>> = {
  propertyUse: q("propertyUse", "What type of property is this?", "This controls residential-only disclosures and property-specific forms.", [["Residential", "residential"], ["Income-residential", "income_residential"], ["Land", "land"], ["Commercial", "commercial"]]),
  yearBuilt: q("yearBuilt", "What year was the dwelling built?", "Lead-based-paint requirements generally apply to covered residential housing built before 1978.", []),
  inHoa: q("inHoa", "Is the property in an HOA or other common-interest community?", "If yes, the transaction needs the association-document workflow.", [["Yes", "true"], ["No", "false"]]),
  squareFootageAdvertised: q("squareFootageAdvertised", "Will residential square footage be advertised or entered in MLS?", "Colorado requires the approved square-footage disclosure when a broker advertises residential square footage.", [["Yes", "true"], ["No", "false"]]),
  sellerDisclosureExempt: q("sellerDisclosureExempt", "Is the seller/transaction exempt from the Seller Property Disclosure workflow?", "If you are unsure, leave this for broker review rather than guessing.", [["No / use disclosure", "false"], ["Yes / exempt", "true"]]),
  waterDisclosureSatisfied: q("waterDisclosureSatisfied", "Is the residential source-of-water disclosure already satisfied in the listing contract, sale contract, or Seller Property Disclosure?", "If not, the Source of Water Addendum/Disclosure remains outstanding.", [["Yes", "true"], ["No", "false"]]),
  financingType: q("financingType", "How is the buyer planning to purchase?", "This helps determine lender-document tracking.", [["Financing / loan", "loan"], ["Cash", "cash"], ["Owner carry", "owner_carry"]]),
  shortSale: q("shortSale", "Is this a short sale?", "Short-sale files use additional Colorado forms.", [["Yes", "true"], ["No", "false"]]),
  foreclosure: q("foreclosure", "Is the property in foreclosure or potentially subject to Colorado Foreclosure Protection Act requirements?", "Covered foreclosure transactions need specialized broker/legal review and additional documents.", [["Yes / needs review", "true"], ["No", "false"]]),
  manufacturedHome: q("manufacturedHome", "Does the transaction include a manufactured home?", "A manufactured-home addendum or specialized contract may be required depending on the structure of the deal.", [["Yes", "true"], ["No", "false"]]),
  postClosingOccupancy: q("postClosingOccupancy", "Will the seller remain in the property after closing?", "A post-closing occupancy agreement is tracked when the seller has a rent-back/continued possession arrangement.", [["Yes", "true"], ["No", "false"]]),
  preClosingOccupancy: q("preClosingOccupancy", "Will anyone occupy the property before closing?", "A pre-closing rental/occupancy agreement is tracked when applicable.", [["Yes", "true"], ["No", "false"]]),
  powerOfAttorneyUsed: q("powerOfAttorneyUsed", "Will any party sign through a power of attorney?", "If yes, the file should retain the relevant power-of-attorney document.", [["Yes", "true"], ["No", "false"]]),
  personalPropertyAgreementUsed: q("personalPropertyAgreementUsed", "Is personal property being handled in a separate agreement or bill of sale?", "If yes, track that agreement in the transaction file.", [["Yes", "true"], ["No", "false"]]),
  affiliatedBusinessReferral: q("affiliatedBusinessReferral", "Is there an affiliated-business referral or arrangement in this transaction?", "If yes, the appropriate disclosure must be tracked.", [["Yes", "true"], ["No", "false"]]),
  referralFee: q("referralFee", "Is there a referral fee agreement for this client or transaction?", "If yes, retain the referral agreement.", [["Yes", "true"], ["No", "false"]])
};

function req(
  id: string,
  label: string,
  level: TransactionDocumentRequirementLevel,
  phase: TransactionDocumentRequirementPhase,
  aliases: string[],
  guidance: string,
  source: TransactionDocumentRequirement["source"],
  appliesWhen?: TransactionDocumentRequirement["appliesWhen"],
  factKeys?: TransactionFactKey[]
): TransactionDocumentRequirement {
  return { id, label, level, phase, aliases, guidance, source, appliesWhen, factKeys };
}

function q(
  factKey: TransactionFactKey,
  prompt: string,
  helpText: string,
  options: Array<[string, string]>
): TransactionRequirementQuestion {
  return { factKey, prompt, helpText, options: options.map(([label, value]) => ({ label, value })) };
}

function leadPaintRule(facts: TransactionFacts): boolean | undefined {
  const residential = residentialState(facts);
  if (residential === false) return false;
  if (residential === undefined || facts.yearBuilt === undefined) return undefined;
  return facts.yearBuilt < 1978;
}

function residentialAndNotExempt(facts: TransactionFacts): boolean | undefined {
  const residential = residentialState(facts);
  if (residential === false) return false;
  if (residential === undefined || facts.sellerDisclosureExempt === undefined) return undefined;
  return !facts.sellerDisclosureExempt;
}

function residentialRule(facts: TransactionFacts, condition: boolean | undefined): boolean | undefined {
  const residential = residentialState(facts);
  if (residential === false) return false;
  if (residential === undefined || condition === undefined) return undefined;
  return condition;
}

function residentialState(facts: TransactionFacts): boolean | undefined {
  if (facts.propertyUse === undefined || facts.propertyUse === "unknown") return undefined;
  return facts.propertyUse === "residential" || facts.propertyUse === "income_residential";
}

function boolWhen<T>(value: T | undefined, test: (value: T) => boolean): boolean | undefined {
  return value === undefined || value === "unknown" ? undefined : test(value);
}

function normalizeDocumentType(value: string): string {
  return value.trim().toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, " ").trim();
}
