import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile =
  fileURLToPath(import.meta.url);
const currentDir =
  path.dirname(currentFile);
const appRoot =
  path.resolve(currentDir, "..");

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

function read(relativePath) {
  const fullPath =
    path.join(appRoot, relativePath);

  if (!fs.existsSync(fullPath)) {
    fail(`missing required file: ${relativePath}`);
  }

  return fs.readFileSync(fullPath, "utf8");
}

function sorted(values) {
  return [...values].sort();
}

function assertExactSet(
  actual,
  expected,
  label
) {
  const left = sorted(actual);
  const right = sorted(expected);

  if (
    left.length !== right.length ||
    left.some(
      (value, index) =>
        value !== right[index]
    )
  ) {
    fail(
      `${label}\nExpected: ${right.join(", ")}\nActual: ${left.join(", ")}`
    );
  }
}

const expectedRoutes = [
  "/",
  "/owners",
  "/tenants",
  "/rentals",
  "/portals",
  "/rental-analysis",
  "/pricing",
  "/service-areas",
  "/contact",
  "/policies",
  "/apply",
  "/maintenance",
  "/vendors",
  "/standards"
];

const expectedAssemblies = [
  "KoinoniaProperties.tsx",
  "KoinoniaPropertiesOwners.tsx",
  "KoinoniaPropertiesTenants.tsx",
  "KoinoniaPropertiesRentals.tsx",
  "KoinoniaPropertiesPortals.tsx",
  "KoinoniaPropertiesRentalAnalysis.tsx",
  "KoinoniaPropertiesPricing.tsx",
  "KoinoniaPropertiesServiceAreas.tsx",
  "KoinoniaPropertiesContact.tsx",
  "KoinoniaPropertiesPolicies.tsx",
  "KoinoniaPropertiesApply.tsx",
  "KoinoniaPropertiesMaintenance.tsx",
  "KoinoniaPropertiesVendors.tsx",
  "KoinoniaPropertiesStandards.tsx"
];

for (const route of expectedRoutes) {
  const relativePage =
    route === "/"
      ? "app/page.tsx"
      : `app${route}/page.tsx`;

  const pageSource = read(relativePage);
  const escapedRoute =
    route.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  const metadataPattern =
    new RegExp(
      `buildPublicRouteMetadata\\(\\s*["']${escapedRoute}["']`
    );

  if (!metadataPattern.test(pageSource)) {
    fail(
      `${relativePage} does not declare metadata for ${route}`
    );
  }
}

pass(
  "all 14 standalone route pages exist with matching metadata paths"
);

const seoSource =
  read("config/seo.config.ts");

const seoPaths = [
  ...seoSource.matchAll(
    /path:\s*"([^"]+)"/g
  )
].map((match) => match[1]);

assertExactSet(
  seoPaths,
  expectedRoutes,
  "SEO public route registry mismatch"
);

pass(
  "SEO registry contains only the 14 standalone Properties routes"
);

const assemblyDir =
  path.join(
    appRoot,
    "components/site/PageAssemblies"
  );

const actualAssemblies =
  fs.readdirSync(assemblyDir)
    .filter(
      (name) => name.endsWith(".tsx")
    );

assertExactSet(
  actualAssemblies,
  expectedAssemblies,
  "Properties page assembly set mismatch"
);

pass(
  "all 14 Koinonia Properties page assemblies are isolated"
);

function walk(directory) {
  const results = [];

  for (
    const entry
    of fs.readdirSync(
      directory,
      { withFileTypes: true }
    )
  ) {
    if (
      entry.name === ".next" ||
      entry.name === "node_modules"
    ) {
      continue;
    }

    const fullPath =
      path.join(directory, entry.name);

    if (entry.isDirectory()) {
      results.push(...walk(fullPath));
      continue;
    }

    const relativePath =
      path.relative(
        appRoot,
        fullPath
      );

    if (
      relativePath ===
      "scripts/verify-boundary.mjs"
    ) {
      continue;
    }

    if (
      /\.(ts|tsx|js|jsx|mjs|json)$/.test(
        entry.name
      ) ||
      entry.name === ".env.example"
    ) {
      results.push(fullPath);
    }
  }

  return results;
}

const sourceFiles = walk(appRoot);

const forbiddenPatterns = [
  {
    label: "legacy /properties route",
    pattern:
      /["'`]\/properties(?:\/|#|["'`])/i
  },
  {
    label: "legacy /koinonia route",
    pattern:
      /["'`]\/koinonia(?:\/|["'`])/i
  },
  {
    label: "Koinonia Transactions domain",
    pattern:
      /koinoniatransactions\.com/i
  },
  {
    label: "Koinonia Transactions identity",
    pattern:
      /Koinonia Transactions/i
  },
  {
    label: "Koinonia Admin public identity",
    pattern:
      /Koinonia Admin/i
  },
  {
    label: "Koinonia Admin website URL",
    pattern:
      /https?:\/\/(?:www\.)?koinoniaadmin\.com/i
  },
  {
    label: "Transactions web package",
    pattern:
      /@reynalds-os\/web/i
  },
  {
    label: "existing Transactions web application",
    pattern:
      /apps\/web/i
  },
  {
    label: "Transactions client-login copy",
    pattern:
      /Client Login/i
  },
  {
    label: "client application route",
    pattern:
      /["'`]\/client(?:\/|["'`])/i
  },
  {
    label: "employee application route",
    pattern:
      /["'`]\/employee(?:\/|["'`])/i
  },
  {
    label: "dashboard application route",
    pattern:
      /["'`]\/dashboard(?:\/|["'`])/i
  },
  {
    label: "shared sign-in route",
    pattern:
      /["'`]\/sign-in(?:\/|["'`])/i
  },
  {
    label: "personal finance route",
    pattern:
      /["'`]\/personal-finance(?:\/|["'`])/i
  },
  {
    label: "Reynalds Brothers route",
    pattern:
      /["'`]\/reynalds-brothers(?:\/|["'`])/i
  },
  {
    label: "Clerk dependency",
    pattern:
      /@clerk\/nextjs/i
  },
  {
    label: "shared auth/core/database package",
    pattern:
      /@reynalds-os\/(?:auth|core|database)/i
  },
  {
    label: "Prisma dependency",
    pattern:
      /@?prisma/i
  },
  {
    label: "SQLite dependency",
    pattern:
      /better-sqlite3/i
  },
  {
    label: "PDF dependency",
    pattern:
      /pdf-parse/i
  },
  {
    label: "internal pre-launch public copy",
    pattern:
      /before public launch|first version|future inventory|Future City Pages|Launch Readiness|Draft Standards|Pricing Readiness|Portal Launch Gates|Pending Final Schedule|Disclosure Needed|Platform Required|Workflow Required|Accounting Required|Approval Required|once the portal is active|once the management platform is selected|while exact fees are finalized|finalizes its management operations|is being built|is being prepared|will become the tenant-facing/i
  }
];

for (const fullPath of sourceFiles) {
  const source =
    fs.readFileSync(fullPath, "utf8");

  for (
    const rule
    of forbiddenPatterns
  ) {
    if (rule.pattern.test(source)) {
      fail(
        `${rule.label} found in ${path.relative(appRoot, fullPath)}`
      );
    }
  }
}

pass(
  "no Transactions, client-login, auth, database, legacy route, or internal-launch boundary crossed into properties-web"
);

const packageJson =
  JSON.parse(
    read("package.json")
  );

assertExactSet(
  Object.keys(
    packageJson.dependencies ?? {}
  ),
  [
    "@reynalds-os/design-system",
    "next",
    "react",
    "react-dom"
  ],
  "runtime dependency boundary mismatch"
);

assertExactSet(
  Object.keys(
    packageJson.devDependencies ?? {}
  ),
  [
    "@types/node",
    "@types/react",
    "typescript"
  ],
  "development dependency boundary mismatch"
);

pass(
  "package dependency boundary is public-site only"
);

const tsconfig =
  JSON.parse(
    read("tsconfig.json")
  );

const alias =
  tsconfig.compilerOptions?.paths?.[
    "@/*"
  ];

if (
  !Array.isArray(alias) ||
  alias.length !== 1 ||
  alias[0] !== "./*"
) {
  fail(
    'TypeScript alias @/* must resolve only to "./*"'
  );
}

pass(
  "TypeScript alias is isolated from apps/web"
);

const nextConfig =
  read("next.config.ts");

if (
  /basePath|rewrites|redirects|assetPrefix|PrismaPlugin/i.test(
    nextConfig
  )
) {
  fail(
    "Next configuration contains shared-app routing or Prisma coupling"
  );
}

const navSource =
  read(
    "components/site/PropertiesNav/PropertiesNav.tsx"
  );

const directContactLinkPattern =
  /<a[^>]*href="\/contact"[^>]*>\s*Contact\s*<\/a>/s;

if (
  !directContactLinkPattern.test(navSource)
) {
  fail(
    "Properties navigation Contact must point to /contact"
  );
}

if (
  /mailto|\/koinonia|Client Login|Koinonia Transactions/i.test(
    navSource
  )
) {
  fail(
    "Properties navigation Contact still contains an external/shared-app handoff"
  );
}

const contactPageSource =
  read("app/contact/page.tsx");

const contactAssemblySource =
  read(
    "components/site/PageAssemblies/KoinoniaPropertiesContact.tsx"
  );

if (
  !contactPageSource.includes(
    'buildPublicRouteMetadata(\n  "/contact"'
  )
) {
  fail(
    "Contact route metadata is not registered for /contact"
  );
}

if (
  !contactAssemblySource.includes(
    'mailto("Koinonia Properties General Inquiry")'
  )
) {
  fail(
    "Contact page must preserve the Properties email handoff"
  );
}

if (
  !contactAssemblySource.includes(
    'actionHref: "/rental-analysis"'
  ) ||
  !contactAssemblySource.includes(
    'actionHref: "/tenants"'
  ) ||
  !contactAssemblySource.includes(
    'actionHref: "/maintenance"'
  ) ||
  !contactAssemblySource.includes(
    'actionHref: "/vendors"'
  )
) {
  fail(
    "Contact page is missing one or more Properties-local inquiry paths"
  );
}

if (
  /<form|<input|<textarea/i.test(
    contactAssemblySource
  )
) {
  fail(
    "Contact page must not collect private information in a public form during Stage 1"
  );
}

pass(
  "Contact is a Properties-local /contact route with Properties-only inquiry paths"
);

const layoutSource =
  read("app/layout.tsx");
const robotsSource =
  read("app/robots.ts");

if (
  !seoSource.includes(
    "NEXT_PUBLIC_PROPERTIES_SITE_URL"
  )
) {
  fail(
    "Properties production URL must remain environment-configured"
  );
}

if (
  !layoutSource.includes(
    "index: false"
  ) ||
  !layoutSource.includes(
    "follow: false"
  )
) {
  fail(
    "Unconfigured preview metadata must remain non-indexable"
  );
}

if (
  !robotsSource.includes(
    'disallow: "/"'
  )
) {
  fail(
    "Unconfigured preview robots must disallow crawling"
  );
}

pass(
  "unconfigured preview deployments remain non-indexable"
);

console.log(
  "\nPASS: Koinonia Properties standalone application boundary verified."
);
