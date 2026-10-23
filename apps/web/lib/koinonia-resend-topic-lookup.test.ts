import { describe, expect, it, vi } from "vitest";
import { getResendContactTopicsSnapshot as get } from "./koinonia-resend-topic-lookup";
const id = "f6a8cde9-b7e9-4dd2-a1fe-f8e193db8c85";
const response = (payload: unknown, status=200) => vi.fn(async () => new Response(JSON.stringify(payload), {status}));
describe("Resend contact topics (GET only)", () => {
  it("reads subscription summaries without reporting permission granted", async () => {
    const mock=response({object:"list",has_more:false,data:[{id:"topic-1",subscription:"opt_in"},{id:"topic-2",subscription:"opt_out"}]});
    expect(await get(id,"re_test",mock as unknown as typeof fetch)).toEqual({state:"found",count:2,hasMore:false,optedIn:1,optedOut:1});
    expect(mock.mock.calls[0][0]).toBe("https://api.resend.com/contacts/"+id+"/topics");
    expect((mock.mock.calls[0] as unknown[])[1]).toMatchObject({method:"GET",cache:"no-store"});
  });
  it("does not infer clearance from an empty or paginated topic list", async () => {
    expect(await get(id,"re_test",response({object:"list",has_more:true,data:[]}) as unknown as typeof fetch))
      .toMatchObject({state:"found",hasMore:true,optedIn:0});
  });
  it("rejects unexpected subscription state and duplicate topic ids", async () => {
    for(const data of [[{id:"x",subscription:"unknown"}],[{id:"x",subscription:"opt_in"},{id:"x",subscription:"opt_out"}]]) {
      expect((await get(id,"re_test",response({object:"list",has_more:false,data}) as unknown as typeof fetch)).state).toBe("unavailable");
    }
  });
  it("fails closed on API errors and invalid input", async () => {
    expect((await get(id,"re_test",response({},403) as unknown as typeof fetch)).state).toBe("unavailable");
    const mock=vi.fn();
    expect((await get("not-an-id","re_test",mock as unknown as typeof fetch)).state).toBe("unavailable");
    expect(mock).not.toHaveBeenCalled();
  });
});
