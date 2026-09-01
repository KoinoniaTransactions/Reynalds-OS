import { describe, expect, it } from "vitest";
import {
  buildTransactionDocumentChecklist,
  getTransactionDocumentRequirements,
  getTransactionRequirementQuestions
} from "./transaction-document-requirements";

describe("transaction document requirements", () => {
  it("tracks a listing agreement as received for a seller listing-stage file", () => {
    const checklist = buildTransactionDocumentChecklist("seller", "pre_contract", [
      {
        id: "doc_listing",
        documentType: "Listing Agreement",
        fileName: "listing-agreement.pdf"
      }
    ]);

    expect(checklist.find((item) => item.id === "listing-agreement")).toMatchObject({
      status: "received",
      documentId: "doc_listing",
      fileName: "listing-agreement.pdf"
    });
  });

  it("does not count a pending-classification upload as received", () => {
    const checklist = buildTransactionDocumentChecklist("seller", "pre_contract", [
      {
        id: "doc_pending",
        documentType: "Pending Classification",
        fileName: "unknown.pdf"
      }
    ]);

    expect(checklist.find((item) => item.id === "listing-agreement")?.status).toBe("missing");
    expect(checklist.every((item) => item.documentId !== "doc_pending")).toBe(true);
  });

  it("changes the required document set when a seller goes under contract", () => {
    const listingRequirements = getTransactionDocumentRequirements("seller", "pre_contract");
    const contractRequirements = getTransactionDocumentRequirements("seller", "under_contract");

    expect(listingRequirements.find((item) => item.id === "purchase-contract")).toBeUndefined();
    expect(contractRequirements.find((item) => item.id === "purchase-contract")?.level).toBe("required");
    expect(contractRequirements.find((item) => item.id === "listing-agreement")?.level).toBe("required");
  });

  it("recognizes common canonical aliases", () => {
    const checklist = buildTransactionDocumentChecklist("buyer", "under_contract", [
      {
        id: "doc_contract",
        documentType: "Purchase Contract",
        fileName: "contract.pdf"
      }
    ]);

    expect(checklist.find((item) => item.id === "purchase-contract")?.status).toBe("received");
  });

  it("requires lead-based-paint disclosure for covered pre-1978 residential property", () => {
    const checklist = buildTransactionDocumentChecklist(
      "seller",
      "pre_contract",
      [],
      {
        propertyUse: "residential",
        yearBuilt: 1965,
        squareFootageAdvertised: false,
        sellerDisclosureExempt: false,
        waterDisclosureSatisfied: true,
        inHoa: false,
        shortSale: false,
        powerOfAttorneyUsed: false,
        affiliatedBusinessReferral: false,
        referralFee: false,
        contractAmended: false
      }
    );

    expect(checklist.find((item) => item.id === "lead-based-paint-disclosure")?.status).toBe("missing");
  });

  it("does not show lead-based-paint disclosure for newer residential property", () => {
    const checklist = buildTransactionDocumentChecklist(
      "seller",
      "pre_contract",
      [],
      {
        propertyUse: "residential",
        yearBuilt: 1995,
        squareFootageAdvertised: false,
        sellerDisclosureExempt: false,
        waterDisclosureSatisfied: true,
        inHoa: false,
        shortSale: false,
        powerOfAttorneyUsed: false,
        affiliatedBusinessReferral: false,
        referralFee: false,
        contractAmended: false
      }
    );

    expect(checklist.find((item) => item.id === "lead-based-paint-disclosure")).toBeUndefined();
  });

  it("asks property type before residential-only follow-up facts", () => {
    const questions = getTransactionRequirementQuestions("seller", "pre_contract", {});
    expect(questions).toHaveLength(1);
    expect(questions[0]?.factKey).toBe("propertyUse");
  });

  it("asks for year built after a seller listing is known to be residential", () => {
    const questions = getTransactionRequirementQuestions("seller", "pre_contract", {
      propertyUse: "residential"
    });
    expect(questions.some((question) => question.factKey === "yearBuilt")).toBe(true);
  });

  it("does not ask future due-diligence questions at initial under-contract setup", () => {
    const questions = getTransactionRequirementQuestions("buyer", "under_contract", {
      propertyUse: "residential"
    });
    expect(questions.some((question) => question.factKey === "inspectionObjectionUsed")).toBe(false);
    expect(questions.some((question) => question.factKey === "titleObjectionUsed")).toBe(false);
  });
});
