import { describe, expect, it } from "vitest";
import {
  databaseCommunicationToEntry,
  mergeCommunicationHistory
} from "./reynalds-brothers-communications";

describe("Reynalds Brothers first-class communications", () => {
  it("maps a database communication into the Work Item communication shape", () => {
    const entry = databaseCommunicationToEntry({
      id: "comm_1",
      source: "gmail",
      externalMessageId: "gmail_123",
      externalThreadId: "thread_123",
      workItemId: "wi_1",
      subject: "WM 6960 tracking",
      sender: "orders@frontlineii.com",
      recipients: ["wmtanks@reynaldsbrothers.com"],
      sentAt: new Date("2026-09-18T15:43:15Z"),
      snippet: "Tracking information",
      bodyText: "Your order has shipped.",
      sourceUrl: "https://mail.google.com/example",
      status: "filed",
      matchConfidence: 100,
      matchEvidence: {
        confidence: "high",
        reasons: ["Matched store 6960."]
      },
      rawMetadata: {
        channel: "email",
        direction: "inbound",
        sourceLabel: "wmtanks",
        humanResponseStatus: "Needs Response",
        filedBy: "Office"
      },
      createdAt: new Date("2026-09-18T15:44:00Z"),
      attachments: [{ fileName: "tracking.pdf" }]
    });

    expect(entry.providerMessageId).toBe("gmail_123");
    expect(entry.subject).toBe("WM 6960 tracking");
    expect(entry.to).toBe("wmtanks@reynaldsbrothers.com");
    expect(entry.attachments).toEqual(["tracking.pdf"]);
    expect(entry.classificationConfidence).toBe("high");
    expect(entry.matchedBy).toEqual(["Matched store 6960."]);
  });

  it("prefers the first-class database row over duplicate legacy JSON history", () => {
    const data = {
      communications: [
        {
          gmailId: "gmail_123",
          subject: "Legacy subject",
          sender: "legacy@example.com",
          sentAt: "2026-09-17T12:00:00Z"
        }
      ]
    };

    const merged = mergeCommunicationHistory(data, [
      {
        id: "comm_db",
        channel: "email",
        direction: "inbound",
        subject: "Current database subject",
        from: "current@example.com",
        occurredAt: "2026-09-18T12:00:00Z",
        providerMessageId: "gmail_123",
        humanResponseStatus: "Documented"
      }
    ]);

    expect(merged.communicationLog).toHaveLength(1);
    expect(merged.communicationLog?.[0].subject).toBe("Current database subject");
    expect(merged.communicationNeedsResponse).toBe(false);
    expect(merged.communicationResponseStatus).toBe("Current");
  });

  it("keeps unmatched legacy history that has not migrated yet", () => {
    const merged = mergeCommunicationHistory({
      communications: [
        {
          gmailId: "legacy_only",
          subject: "Historical completion packet",
          sender: "walmart@example.com",
          sentAt: "2026-07-29T12:00:00Z"
        }
      ]
    }, []);

    expect(merged.communicationLog).toHaveLength(1);
    expect(merged.communicationLog?.[0].providerMessageId).toBe("legacy_only");
  });
});
