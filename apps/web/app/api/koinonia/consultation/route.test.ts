import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
  });

  afterEach(() => {
    if (originalResendApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalResendApiKey;
    }

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
  });

  it("accepts a valid weekday request and sends it through Resend", async () => {
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
        notes: "Automated W7 validation request."
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      message: "Your consultation request has been sent. Koinonia will follow up with next steps."
    });

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
