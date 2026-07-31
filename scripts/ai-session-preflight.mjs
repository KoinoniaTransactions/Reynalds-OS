#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  discoverCompanyBrains,
  normalizeChangedPaths,
  parseRequiredReading,
  resolveActiveDomain
} from "./ai-session-preflight-lib.mjs";

function runGit(args, options = {}) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      ...options
    }).trim();
  } catch {
    return "";
  }
}

function heading(title) {
  console.log(`\n=== ${title} ===`);
}

const root = runGit(["rev-parse", "--show-toplevel"]);

if (!root) {
  console.error("ERROR: This command must be run inside a Git repository.");
  process.exit(1);
}

process.chdir(root);

const startHerePath = join(root, "START_HERE.md");

if (!existsSync(startHerePath)) {
  console.error("ERROR: START_HERE.md is missing.");
  process.exit(1);
}

const startHere = readFileSync(startHerePath, "utf8");
const readingOrder = parseRequiredReading(startHere);

if (readingOrder.length === 0) {
  console.error(
    "ERROR: No required reading order could be discovered in START_HERE.md."
  );
  process.exit(1);
}

const requiredFiles = ["START_HERE.md", ...readingOrder];
const missingFiles = requiredFiles.filter(
  (file) => !existsSync(join(root, file))
);

const remote =
  runGit(["remote", "get-url", "origin"]) || "No origin remote";
const branch =
  runGit(["branch", "--show-current"]) || "Detached HEAD";
const commit =
  runGit(["rev-parse", "--short", "HEAD"]) || "Unknown";
const status = runGit(["status", "--short"]);
const changedPaths = normalizeChangedPaths(status);
const companyBrains = discoverCompanyBrains(root);

const { activeDomain, domainSource } = resolveActiveDomain({
  root,
  branch,
  changedPaths,
  companyBrains
});

console.log("=========================================================");
console.log(" REYNALDS OS AI SESSION PREFLIGHT");
console.log("=========================================================");
console.log();
console.log(`Repository root: ${root}`);
console.log(`Remote:          ${remote}`);
console.log(`Branch:          ${branch}`);
console.log(`Commit:          ${commit}`);

heading("WORKING TREE");

if (status) {
  console.log("WARNING: Existing uncommitted work is present.");
  console.log("Do not modify, stage, or commit unrelated files.");
  console.log(status);
} else {
  console.log("Clean");
}

heading("REQUIRED GOVERNANCE FILES");

for (const file of requiredFiles) {
  console.log(
    `${missingFiles.includes(file) ? "MISSING" : "FOUND  "} ${file}`
  );
}

if (missingFiles.length > 0) {
  console.error("\nERROR: Required governance files are missing.");
  process.exit(1);
}

heading("ACTIVE DOMAIN SIGNAL");
console.log(`Detected domain: ${activeDomain}`);
console.log(`Domain source:   ${domainSource}`);

heading("REQUIRED AI ACKNOWLEDGMENT");
console.log(
  [
    "Before proposing implementation, report:",
    "",
    "OS PREFLIGHT COMPLETE",
    "",
    "Repository:",
    "Branch:",
    "Working tree:",
    "Active domain:",
    "Governance documents reviewed:",
    "Canonical sources reviewed:",
    "Existing implementations searched:",
    "Proposed files:",
    "Validation plan:",
    "Approval required: Yes"
  ].join("\n")
);

console.log("\nPreflight completed successfully.");
