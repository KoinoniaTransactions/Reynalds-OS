import { describe, expect, it } from "vitest";
import {
  REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL,
  REYNALDS_BROTHERS_GMAIL_LABEL_NAME,
  buildEmailCandidates,
  classifyEmailForWorkItem,
  reynaldsBrothersFallbackEmails,
  validateEmailIntake
} from "./reynalds-brothers-email-intake";
import { reynaldsBrothersFallbackWorkItems } from "./reynalds-brothers-work-items";

describe("Reynalds Brothers email intake", () => {
  it("records the Gmail label used for the WalMart Tanks mailbox", () => {
    expect(REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL).toBe("wmtanks");
    expect(REYNALDS_BROTHERS_GMAIL_LABEL_NAME).toBe("WalMart Tanks");
  });

  it("files matching emails under an existing Work Item", () => {
    const result = classifyEmailForWorkItem(reynaldsBrothersFallbackEmails[0], reynaldsBrothersFallbackWorkItems);

    expect(result.action).toBe("link_to_work_item");
    expect(result.matchedWorkItemName).toContain("WM-450");
    expect(result.confidence).toBe("high");
  });

  it("suggests creating a Work Item from a new job email", () => {
    const result = classifyEmailForWorkItem(reynaldsBrothersFallbackEmails[1], reynaldsBrothersFallbackWorkItems);

    expect(result.action).toBe("create_work_item");
    expect(result.suggestedServiceLine).toBe("UCO");
    expect(result.suggestedCustomer).toBe("Walmart");
    expect(result.suggestedWorkItemName).toBe("WM-9001 Tulsa, Oklahoma - UCO Tank Replacement");
    expect(result.requiresApproval).toBe(true);
  });

  it("flags multi-store email-created jobs for approval review", () => {
    const result = classifyEmailForWorkItem(reynaldsBrothersFallbackEmails[2], reynaldsBrothersFallbackWorkItems);

    expect(result.action).toBe("create_work_item");
    expect(result.multiStoreFlag).toBe(true);
    expect(result.extractedStoreNumbers).toEqual(["331", "746"]);
  });

  it("keeps ambiguous emails in review instead of guessing", () => {
    const result = classifyEmailForWorkItem(reynaldsBrothersFallbackEmails[3], reynaldsBrothersFallbackWorkItems);

    expect(result.action).toBe("needs_review");
    expect(result.confidence).toBe("low");
  });

  it("extracts job identity from ServiceChannel note subjects", () => {
    const result = classifyEmailForWorkItem({
      from: "ServiceChannel 349228841@wonote.servicechannel.net",
      subject: "New Note | Location ID: 3347 | WINTER HAVEN | FL | P3-ONSITE W/I 3 DAYS | 349228841 | WALMART STORES, INC | Reynalds Brothers, LLC",
      body: "New Work Order Note Tracking number 349228841 has a new note."
    }, []);

    expect(result.action).toBe("create_work_item");
    expect(result.suggestedStoreNumber).toBe("3347");
    expect(result.suggestedCity).toBe("Winter Haven");
    expect(result.suggestedState).toBe("FL");
    expect(result.suggestedCustomer).toBe("Walmart");
  });

  it("extracts completion packets from Jotform store/club messages", () => {
    const result = classifyEmailForWorkItem({
      from: "\"'Jotform' via Walmart Paperwork\" wmpw@reynaldsbrothers.com",
      subject: "Re: store: WM 6958 07-29-2026 Walmart ACC UCO Work Completion",
      body: "City/State Cameron, NC Store/Club 6958 Completion Date 07-29-2026"
    }, []);

    expect(result.action).toBe("create_work_item");
    expect(result.suggestedStoreNumber).toBe("6958");
    expect(result.suggestedCity).toBe("Cameron");
    expect(result.suggestedState).toBe("NC");
    expect(result.suggestedNextAction).toContain("completion proof");
  });

  it("recognizes Frontline tracking emails by Walmart PO store number", () => {
    const result = classifyEmailForWorkItem({
      from: "Orders clerk@frontlineii.com",
      subject: "Tracking Information For PO# WM-0157",
      body: "Your Order Has Shipped! Tracking Number: 111-0065466"
    }, []);

    expect(result.action).toBe("create_work_item");
    expect(result.suggestedStoreNumber).toBe("0157");
    expect(result.suggestedNextAction).toContain("tracking information");
  });

  it("builds an email filing queue", () => {
    const candidates = buildEmailCandidates(reynaldsBrothersFallbackEmails, reynaldsBrothersFallbackWorkItems);

    expect(candidates).toHaveLength(4);
    expect(candidates[0].classification.suggestedNextAction).toContain("Confirm");
    expect(candidates[0].sourceLabel).toBe(REYNALDS_BROTHERS_EMAIL_SOURCE_LABEL);
  });

  it("validates manually submitted email intake", () => {
    const email = validateEmailIntake({
      from: "client@example.com",
      subject: "New service request",
      body: "Please schedule pressure washing.",
      attachments: "scope.pdf, photo.jpg"
    });

    expect(email.subject).toBe("New service request");
    expect(email.sourceLabel).toBe("wmtanks");
    expect(email.attachments).toEqual(["scope.pdf", "photo.jpg"]);
  });
});
