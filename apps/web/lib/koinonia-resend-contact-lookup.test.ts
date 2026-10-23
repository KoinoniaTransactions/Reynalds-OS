import { describe, expect, it, vi } from "vitest";
import { getResendContactSnapshotById } from "./koinonia-resend-contact-lookup";
const id="f6a8cde9-b7e9-4dd2-a1fe-f8e193db8c85";
describe("Resend GET-only contact lookup", () => {
  it("returns one exact contact snapshot with no write method", async () => {
    const fetcher=vi.fn(async () => new Response(JSON.stringify({id,email:"qa@example.com",unsubscribed:true}),{status:200}));
    expect(await getResendContactSnapshotById(id,"re_example",fetcher as unknown as typeof fetch)).toEqual({state:"found",id,email:"qa@example.com",unsubscribed:true});
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][0]).toBe("https://api.resend.com/contacts/"+id);
    expect((fetcher.mock.calls[0] as unknown[])[1]).toMatchObject({method:"GET",cache:"no-store"});
  });
  it("rejects invalid ID without network request", async () => {
    const fetcher=vi.fn();
    expect(await getResendContactSnapshotById("qa@example.com","re_example",fetcher as unknown as typeof fetch)).toEqual({state:"unavailable"});
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("fails closed for mismatched IDs, missing subscription, and errors", async () => {
    for (const body of [{id:"other",email:"qa@example.com",unsubscribed:false},{id,email:"qa@example.com"}]) {
      const f=vi.fn(async()=>new Response(JSON.stringify(body),{status:200}));
      expect((await getResendContactSnapshotById(id,"re_example",f as unknown as typeof fetch)).state).toBe("unavailable");
    }
    const missing=vi.fn(async()=>new Response(null,{status:404}));
    expect((await getResendContactSnapshotById(id,"re_example",missing as unknown as typeof fetch)).state).toBe("not_found");
    const failed=vi.fn(async()=>{throw Error("connection failed")});
    expect((await getResendContactSnapshotById(id,"re_example",failed as unknown as typeof fetch)).state).toBe("unavailable");
  });
});
