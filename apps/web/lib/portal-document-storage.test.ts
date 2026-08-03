import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { scanPortalDocumentUpload } from "./portal-document-storage";

describe("portal document storage", () => {
  it("scans upload bytes before R2 persistence and removes the scan-temp file", async () => {
    const uploadRoot = await mkdtemp(join(tmpdir(), "portal-document-scan-"));
    const scannerCommand = join(uploadRoot, "scanner.sh");

    await writeFile(scannerCommand, "#!/bin/sh\nexit 0\n", { mode: 0o700 });

    try {
      await scanPortalDocumentUpload({
        cleanName: "safe.pdf",
        file: new File(["safe document"], "safe.pdf", { type: "application/pdf" }),
        scannerCommand,
        uploadRoot,
        workspaceId: "wks/koinonia"
      });

      await expect(readdir(join(uploadRoot, "wks_koinonia", ".scan"))).resolves.toEqual([]);
    } finally {
      await rm(uploadRoot, { force: true, recursive: true });
    }
  });
});
