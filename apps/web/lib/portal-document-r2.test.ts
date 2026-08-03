import { afterEach, describe, expect, it } from "vitest";
import {
  getPortalDocumentR2Config,
  isPortalDocumentR2Configured,
  isPortalDocumentR2UploadEnabled
} from "./portal-document-r2";

const variableNames = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "PORTAL_DOCUMENT_R2_UPLOADS_ENABLED"
] as const;

afterEach(() => {
  for (const variableName of variableNames) {
    delete process.env[variableName];
  }
});

describe("portal document R2 configuration", () => {
  it("returns null when any required R2 setting is missing", () => {
    process.env.R2_ACCOUNT_ID = "account";
    process.env.R2_ACCESS_KEY_ID = "access";
    process.env.R2_SECRET_ACCESS_KEY = "secret";

    expect(getPortalDocumentR2Config()).toBeNull();
    expect(isPortalDocumentR2Configured()).toBe(false);
  });

  it("returns trimmed configuration when all values are present", () => {
    process.env.R2_ACCOUNT_ID = " account ";
    process.env.R2_ACCESS_KEY_ID = " access ";
    process.env.R2_SECRET_ACCESS_KEY = " secret ";
    process.env.R2_BUCKET_NAME = " koinonia-portal-documents ";

    expect(getPortalDocumentR2Config()).toEqual({
      accountId: "account",
      accessKeyId: "access",
      secretAccessKey: "secret",
      bucketName: "koinonia-portal-documents"
    });
    expect(isPortalDocumentR2Configured()).toBe(true);
  });
  it("requires an explicit upload flag before R2 uploads are enabled", () => {
    process.env.R2_ACCOUNT_ID = "account";
    process.env.R2_ACCESS_KEY_ID = "access";
    process.env.R2_SECRET_ACCESS_KEY = "secret";
    process.env.R2_BUCKET_NAME = "koinonia-portal-documents";

    expect(isPortalDocumentR2UploadEnabled()).toBe(false);

    process.env.PORTAL_DOCUMENT_R2_UPLOADS_ENABLED = "true";

    expect(isPortalDocumentR2UploadEnabled()).toBe(true);
  });

});
