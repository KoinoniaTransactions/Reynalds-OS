import { describe, expect, it } from "vitest";
import {
  buildEmptyPortalWorkspaceDocuments,
  buildEmptyPortalWorkspaceTimeline,
  buildPortalWorkspaceDocuments,
  buildPortalWorkspaceSummary,
  buildPortalWorkspaceTimeline
} from "./portal-workspace";

describe("portal workspace helpers", () => {
  it("builds a safe work item summary without dumping raw metadata", () => {
    const summary = buildPortalWorkspaceSummary({
      createdAt: new Date("2026-07-29T18:00:00.000Z"),
      data: {
        clientName: "Bright Homes Team",
        serviceName: "Transaction Coordination Plus",
        password: "do-not-show",
        propertyAddress: "123 Main St",
        notes: "internal details"
      },
      health: "Watch",
      id: "work_1",
      name: "Smith Contract-to-Close",
      nextAction: "Confirm inspection deadline.",
      objectType: "Transaction",
      status: "Active",
      updatedAt: new Date("2026-07-29T19:00:00.000Z")
    });

    expect(summary.type).toBe("Transaction Support");
    expect(summary.due).toBe("Date pending");
    expect(summary.meta).toEqual([
      { label: "Client", value: "Bright Homes Team" },
      { label: "Service", value: "Transaction Coordination Plus" },
      { label: "Property", value: "123 Main St" }
    ]);
  });

  it("maps documents with protected download links only when storage is ready", () => {
    const documents = buildPortalWorkspaceDocuments(
      [
        {
          createdAt: "2026-07-29T18:00:00.000Z",
          documentType: "Seller Disclosure",
          fileName: "seller-disclosure.pdf",
          fileSizeBytes: 1024,
          id: "doc_1",
          requestedAction: "Review upload.",
          status: "Uploaded",
          storageKey: "wks/doc.pdf"
        }
      ],
      { downloadBasePath: "/api/portal/documents", storageReady: true }
    );

    expect(documents[0]?.downloadHref).toBe("/api/portal/documents/doc_1/download");
    expect(documents[0]?.fileInfo).toBe("seller-disclosure.pdf - 1 KB");
  });

  it("omits document download links when storage is not ready", () => {
    const documents = buildPortalWorkspaceDocuments(
      [
        {
          createdAt: "2026-07-29T18:00:00.000Z",
          documentType: "Seller Disclosure",
          fileName: "seller-disclosure.pdf",
          id: "doc_1",
          status: "Uploaded",
          storageKey: "wks/doc.pdf"
        }
      ],
      { downloadBasePath: "/api/portal/documents", storageReady: false }
    );

    expect(documents[0]?.downloadHref).toBeUndefined();
  });

  it("formats timeline labels for display", () => {
    expect(
      buildPortalWorkspaceTimeline([
        {
          createdAt: "2026-07-29T18:00:00.000Z",
          eventType: "portal_work.assignment.updated",
          id: "event_1",
          summary: "Assignment updated"
        }
      ])[0]?.label
    ).toBe("Portal Work Assignment Updated");
  });

  it("provides empty states for documents and timeline", () => {
    expect(buildEmptyPortalWorkspaceDocuments()[0]?.title).toContain("No documents");
    expect(buildEmptyPortalWorkspaceTimeline()[0]?.summary).toContain("Timeline history");
  });
});
