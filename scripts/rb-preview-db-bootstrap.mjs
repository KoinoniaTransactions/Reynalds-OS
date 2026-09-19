import { spawnSync } from "node:child_process";
import path from "node:path";

const RB_PREVIEW_PROJECT_ID = "prj_2U3rbFvAHgFHnuJPGPoDcKYoN79Q";

const isVercel = process.env.VERCEL === "1";
const isPreview = process.env.VERCEL_ENV === "preview";
const hasDatabase = Boolean(process.env.DATABASE_URL);
const isDedicatedRbPreview = process.env.VERCEL_PROJECT_ID === RB_PREVIEW_PROJECT_ID;

if (!isVercel || !isPreview || !hasDatabase || !isDedicatedRbPreview) {
  console.log("[rb-db-bootstrap] skipped: not the dedicated Reynalds Brothers preview database build");
  process.exit(0);
}

const workspaceRoot = path.resolve(process.cwd(), "../..");

console.log("[rb-db-bootstrap] applying migrations and safe RB-only seed");

const result = spawnSync(
  "pnpm",
  ["--filter", "@reynalds-os/database", "db:setup:rb"],
  {
    cwd: workspaceRoot,
    env: {
      ...process.env,
      REYNALDS_SEED_MODE: "rb-only"
    },
    stdio: "inherit"
  }
);

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("[rb-db-bootstrap] complete");
