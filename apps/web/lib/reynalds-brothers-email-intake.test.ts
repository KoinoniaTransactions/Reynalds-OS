import { describe, expect, it } from "vitest";
import {
  buildEmailCandidates,
  classifyEmailForWorkItem,
  reynaldsBrothersFallbackEmails,
  validateEmailIntake
} from "./reynalds-brothers-email-intake";
import { reynaldsBrothersFallbackWorkItems } from "./reynalds-brothers-work-items";

describe("Reynalds Brothers email intake", () => {
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

  it("builds an email filing queue", () => {
    const candidates = buildEmailCandidates(reynaldsBrothersFallbackEmails, reynaldsBrothersFallbackWorkItems);

    expect(candidates).toHaveLength(4);
    expect(candidates[0].classification.suggestedNextAction).toContain("Confirm");
  });

  it("validates manually submitted email intake", () => {
    expect(validateEmailIntake({
      from: "client@example.com",
      subject: "New service request",
      body: "Please schedule pressure washing."
    }).subject).toBe("New service request");
  });
});
