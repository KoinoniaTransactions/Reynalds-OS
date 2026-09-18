import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const databaseMocks = vi.hoisted(() => {
  const tx = {
    rosObject: {
      create: vi.fn(),
      update: vi.fn()
    },
    timelineEvent: {
      create: vi.fn()
    },
    task: {
      findFirst: vi.fn(),
      create: vi.fn()
    }
  };

  const prisma = {
    rosObject: {
      findMany: vi.fn()
    },
    user: {
      findUnique: vi.fn()
    },
    $transaction: vi.fn()
  };

  return { prisma, tx };
});

vi.mock("../../../../lib/db", () => ({
  prisma: databaseMocks.prisma
}));

import { POST } from "./route";

const originalResendApiKey = process.env.RESEND_API_KEY;

function consultationRequest(payload: Record<string, unknown>) {
  return new Request("http://localhost/api/koinonia/consultation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

describe("Koinonia consultation intake", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-resend-key";

    databaseMocks.prisma.rosObject.findMany.mockResolvedValue([]);
    databaseMocks.prisma.user.findUnique.mockResolvedValue(null);
    databaseMocks.prisma.$transaction.mockImplementation(async (callback: (tx: typeof databaseMocks.tx) => unknown) =>
      callback(databaseMocks.tx)
    );
    databaseMocks.tx.rosObject.create.mockResolvedValue({
      id: "rel_test_123",
      status: "Consultation",
      health: "Healthy",
      data: {}
    });
    databaseMocks.tx.rosObject.update.mockResolvedValue({
      id: "rel_test_123",
      status: "Consultation",
      health: "Healthy",
      data: {}
    });
    databaseMocks.tx.timelineEvent.create.mockResolvedValue({ id: "evt_test_123" });
    databaseMocks.tx.task.findFirst.mockResolvedValue(null);
    databaseMocks.tx.task.create.mockResolvedValue({
      id: "task_test_123",
      title: "Review consultation request for 2026-09-17 · 10:00 AM – 11:00 AM"
    });
  });

  afterEach(() => {
    if (originalResendApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalResendApiKey;
    }

    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("rejects incomplete consultation requests", async () => {
    const response = await POST(
      consultationRequest({
        consultationType: "Transaction Management",
        name: "QA Test"
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Please complete all required fields."
    });
    expect(databaseMocks.prisma.rosObject.findMany).not.toHaveBeenCalled();
  });

  it("accepts a valid weekday request, persists attribution, and sends through Resend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "email_test_123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      consultationRequest({
        consultationType: "Marketing Management",
        consultationSubject: "Koinonia Consultation Request — Marketing Management",
        name: "Koinonia QA",
        email: "qa@example.com",
        phone: "719-555-0100",
        preferredDate: "2026-09-17",
        preferredTime: "10:00 AM – 11:00 AM",
        notes: "Automated marketing validation request.",
        attribution: {
          version: 2,
          firstTouch: {
            utmSource: "google",
            utmMedium: "cpc",
            utmCampaign: "launch",
            utmContent: "coverage",
            utmTerm: "transaction coordinator",
            gclid: "gclid-test",
            landingPage: "https://www.koinoniatransactions.com/services",
            capturedAt: "2026-09-16T10:00:00.000Z"
          },
          latestTouch: {
            utmSource: "email",
            utmMedium: "followup",
            utmCampaign: "launch-followup",
            msclkid: "msclkid-test",
            landingPage: "https://www.koinoniatransactions.com/contact",
            capturedAt: "2026-09-16T11:00:00.000Z"
          },
          conversionTouch: {
            utmSource: "email",
            utmMedium: "followup",
            utmCampaign: "launch-followup",
            msclkid: "msclkid-test",
            landingPage: "https://www.koinoniatransactions.com/contact",
            capturedAt: "2026-09-16T11:00:00.000Z"
          }
        }
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      message: "Your consultation request has been sent. Koinonia will follow up with next steps."
    });

    expect(databaseMocks.tx.rosObject.create).toHaveBeenCalledTimes(1);
    const createInput = databaseMocks.tx.rosObject.create.mock.calls[0]?.[0];
    expect(createInput?.data?.data?.acquisition?.firstTouch?.gclid).toBe("gclid-test");
    expect(createInput?.data?.data?.acquisition?.latestTouch?.msclkid).toBe("msclkid-test");
    expect(createInput?.data?.data?.acquisition?.conversionTouch?.msclkid).toBe("msclkid-test");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-resend-key",
          "Content-Type": "application/json"
        })
      })
    );

    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const emailPayload = JSON.parse(String(requestInit.body));

    expect(emailPayload.subject).toBe(
      "Koinonia Consultation Request — Marketing Management"
    );
    expect(emailPayload.to).toEqual(["jeremiah@koinoniaadmin.com"]);
    expect(emailPayload.text).toContain("Consultation Type: Marketing Management");
    expect(emailPayload.text).toContain("Name: Koinonia QA");
  });
});
