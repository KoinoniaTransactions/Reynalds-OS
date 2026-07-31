import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export function parseRequiredReading(startHere) {
  return [...startHere.matchAll(/^\d+\.\s+`?([^`\n]+\.md)`?\s*$/gm)].map(
    (match) => match[1]
  );
}

export function displayName(value) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normalizeChangedPaths(status) {
  return status
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((path) =>
      path.includes(" -> ") ? path.split(" -> ").at(-1) : path
    );
}

export function discoverCompanyBrains(root) {
  const companiesRoot = join(root, "02_Companies");

  if (!existsSync(companiesRoot)) {
    return [];
  }

  return readdirSync(companiesRoot)
    .map((company) => ({
      company,
      brain: join(companiesRoot, company, "06_Brain")
    }))
    .filter(
      ({ brain }) => existsSync(brain) && statSync(brain).isDirectory()
    );
}

export function resolveActiveDomain({
  root,
  branch,
  changedPaths,
  companyBrains
}) {
  const touchedCompanies = companyBrains.filter(({ company }) =>
    changedPaths.some((path) =>
      path.startsWith(`02_Companies/${company}/`)
    )
  );

  if (touchedCompanies.length === 1) {
    return {
      activeDomain: displayName(touchedCompanies[0].company),
      domainSource: relative(root, touchedCompanies[0].brain)
    };
  }

  if (touchedCompanies.length === 0) {
    const normalizedBranch = branch.toLowerCase().replaceAll("-", "_");

    const branchMatches = companyBrains.filter(({ company }) =>
      normalizedBranch.includes(company.toLowerCase())
    );

    if (branchMatches.length === 1) {
      return {
        activeDomain: displayName(branchMatches[0].company),
        domainSource: relative(root, branchMatches[0].brain)
      };
    }
  }

  return {
    activeDomain: "Global / unresolved",
    domainSource:
      "Inspect the request and canonical registry before proceeding."
  };
}
