import { afterEach, describe, expect, it } from "vitest";
import {
  getHostedSignInUrl,
  getSignInPath,
  isAllowedHostedAuthUrl,
  normalizePortalReturnTo
} from "./portal-auth";

const originalAuthSignInUrl = process.env.NEXT_PUBLIC_AUTH_SIGN_IN_URL;
const originalClerkSignInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
const originalNodeEnv = process.env.NODE_ENV;

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
