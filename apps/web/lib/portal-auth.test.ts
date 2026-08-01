import { afterEach, describe, expect, it } from "vitest";
import {
  getAccessDeniedPath,
  getHostedSignInUrl,
  getSignInPath,
  isAllowedHostedAuthUrl,
  normalizePortalReturnTo
} from "./portal-auth";

const originalAuthSignInUrl = process.env.NEXT_PUBLIC_AUTH_SIGN_IN_URL;
const originalClerkSignInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
const originalNodeEnv = process.env.NODE_ENV;

describe("portal permission denials", () => {
  it("identifies employee portal permission failures", () => {
    expect(getAccessDeniedPath("employee-portal:view")).toBe(
      "/portal/access-denied?portal=employee"
    );
  });

  it("identifies client portal permission failures", () => {
    expect(getAccessDeniedPath("client-portal:view")).toBe(
      "/portal/access-denied?portal=client"
    );
  });

  it("uses a generic portal denial for other permissions", () => {
    expect(getAccessDeniedPath("billing-workspace:view")).toBe(
      "/portal/access-denied?portal=portal"
    );
  });
});

describe("portal auth redirects", () => {
  afterEach(() => {
    restoreEnvValue("NEXT_PUBLIC_AUTH_SIGN_IN_URL", originalAuthSignInUrl);
    restoreEnvValue("NEXT_PUBLIC_CLERK_SIGN_IN_URL", originalClerkSignInUrl);
    restoreEnvValue("NODE_ENV", originalNodeEnv);
  });

  it("normalizes unsafe return destinations to the client dashboard", () => {
    expect(normalizePortalReturnTo("https://not-koinonia.example/client/dashboard")).toBe("/client/dashboard");
    expect(normalizePortalReturnTo("//not-koinonia.example/client/dashboard")).toBe("/client/dashboard");
    expect(getSignInPath("javascript:alert(1)")).toBe("/sign-in?return_to=%2Fclient%2Fdashboard");
  });

  it("allows same-site return destinations", () => {
    expect(normalizePortalReturnTo("/employee/dashboard")).toBe("/employee/dashboard");
    expect(getSignInPath("/employee/dashboard")).toBe("/sign-in?return_to=%2Femployee%2Fdashboard");
  });

  it("does not build hosted sign-in links from unsafe environment values", () => {
    process.env.NEXT_PUBLIC_AUTH_SIGN_IN_URL = "javascript:alert(1)";
    delete process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;

    expect(getHostedSignInUrl("/client/dashboard")).toBeNull();
  });

  it("builds hosted sign-in links from same-site paths with a safe redirect", () => {
    process.env.NEXT_PUBLIC_AUTH_SIGN_IN_URL = "/sign-in";
    delete process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;

    expect(getHostedSignInUrl("https://not-koinonia.example/client/dashboard")).toBe(
      "/sign-in?redirect_url=%2Fclient%2Fdashboard"
    );
  });

  it("falls back to Clerk sign-in when the generic auth sign-in URL is blank", () => {
    process.env.NEXT_PUBLIC_AUTH_SIGN_IN_URL = "";
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL = "/sign-in";

    expect(getHostedSignInUrl("/client/documents")).toBe(
      "/sign-in?redirect_url=%2Fclient%2Fdocuments"
    );
  });

  it("allows public HTTPS hosted sign-in destinations", () => {
    process.env.NEXT_PUBLIC_AUTH_SIGN_IN_URL = "https://accounts.koinoniatransactions.com/sign-in?mode=portal";
    delete process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;

    expect(getHostedSignInUrl("/employee/dashboard")).toBe(
      "https://accounts.koinoniatransactions.com/sign-in?mode=portal&redirect_url=%2Femployee%2Fdashboard"
    );
  });

  it("allows local hosted sign-in destinations only outside production", () => {
    expect(isAllowedHostedAuthUrl("http://localhost:3000/sign-in", "development")).toBe(true);
    expect(isAllowedHostedAuthUrl("http://localhost:3000/sign-in", "production")).toBe(false);
  });
});

function restoreEnvValue(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
