#!/usr/bin/env node

import {
  chmodSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync
} from "node:fs";

import path from "node:path";

import Database from "better-sqlite3";

const ACTIONS = {
  reset: {
    mode:
      "clean",

    confirmation:
      "RESET-PERSONAL-FINANCE",

    purpose:
      "Clean launch state"
  },

  demo: {
    mode:
      "demo",

    confirmation:
      "LOAD-PERSONAL-FINANCE-DEMO",

    purpose:
      "Synthetic development data"
  }
};

function findRepositoryRoot(
  startDirectory =
    process.cwd()
) {
  let currentDirectory =
    path.resolve(
      startDirectory
    );

  for (
    let depth = 0;
    depth < 12;
    depth += 1
  ) {
    if (
      existsSync(
        path.join(
          currentDirectory,
          ".git"
        )
      )
    ) {
      return currentDirectory;
    }

    const parentDirectory =
      path.dirname(
        currentDirectory
      );

    if (
      parentDirectory ===
      currentDirectory
    ) {
      break;
    }

    currentDirectory =
      parentDirectory;
  }

  throw new Error(
    "Could not locate the repository root."
  );
}

function argumentValue(
  name
) {
  const index =
    process.argv.indexOf(
      name
    );

  if (index === -1) {
    return undefined;
  }

  const value =
    process.argv[
      index + 1
    ];

  if (
    !value ||
    value.startsWith(
      "--"
    )
  ) {
    throw new Error(
      `A value is required after ${name}.`
    );
  }

  return value;
}

function databasePath() {
  const configuredPath =
    argumentValue(
      "--database"
    ) ??
    process.env
      .PERSONAL_FINANCE_DB_PATH
      ?.trim();

  if (configuredPath) {
    return path.resolve(
      configuredPath
    );
  }

  return path.join(
    findRepositoryRoot(),
    ".local",
    "personal-finance",
    "personal-finance.sqlite3"
  );
}

function controlPath(
  resolvedDatabasePath
) {
  const configuredPath =
    argumentValue(
      "--control-file"
    ) ??
    process.env
      .PERSONAL_FINANCE_BOOTSTRAP_MODE_PATH
      ?.trim();

  if (configuredPath) {
    return path.resolve(
      configuredPath
    );
  }

  return path.join(
    path.dirname(
      resolvedDatabasePath
    ),
    "bootstrap-mode.json"
  );
}

function backupDirectory(
  resolvedDatabasePath
) {
  const configuredDirectory =
    argumentValue(
      "--backup-directory"
    );

  if (configuredDirectory) {
    return path.resolve(
      configuredDirectory
    );
  }

  return path.join(
    path.dirname(
      resolvedDatabasePath
    ),
    "backups"
  );
}

function timestampForFileName() {
  return new Date()
    .toISOString()
    .replace(
      /[-:]/g,
      ""
    )
    .replace(
      /\..+$/,
      ""
    )
    .replace(
      "T",
      "-"
    );
}

async function createBackup(
  resolvedDatabasePath,
  action
) {
  if (
    !existsSync(
      resolvedDatabasePath
    )
  ) {
    return null;
  }

  const directory =
    backupDirectory(
      resolvedDatabasePath
    );

  mkdirSync(
    directory,
    {
      recursive:
        true,

      mode:
        0o700
    }
  );

  chmodSync(
    directory,
    0o700
  );

  const backupPath =
    path.join(
      directory,
      [
        "personal-finance",
        action,
        "backup",
        timestampForFileName()
      ].join("-") +
      ".sqlite3"
    );

  const database =
    new Database(
      resolvedDatabasePath,
      {
        readonly:
          true,

        fileMustExist:
          true
      }
    );

  try {
    database.pragma(
      "busy_timeout = 5000"
    );

    await database.backup(
      backupPath
    );
  } finally {
    database.close();
  }

  chmodSync(
    backupPath,
    0o600
  );

  return backupPath;
}

function removeDatabaseFiles(
  resolvedDatabasePath
) {
  for (
    const candidate of [
      resolvedDatabasePath,
      `${resolvedDatabasePath}-wal`,
      `${resolvedDatabasePath}-shm`
    ]
  ) {
    rmSync(
      candidate,
      {
        force:
          true
      }
    );
  }
}

function writeBootstrapControl({
  resolvedControlPath,
  mode,
  purpose
}) {
  const directory =
    path.dirname(
      resolvedControlPath
    );

  mkdirSync(
    directory,
    {
      recursive:
        true,

      mode:
        0o700
    }
  );

  chmodSync(
    directory,
    0o700
  );

  const control = {
    version:
      1,

    mode,

    updatedAt:
      new Date()
        .toISOString(),

    purpose
  };

  writeFileSync(
    resolvedControlPath,
    `${JSON.stringify(
      control,
      null,
      2
    )}\n`,
    {
      encoding:
        "utf8",

      mode:
        0o600
    }
  );

  chmodSync(
    resolvedControlPath,
    0o600
  );
}

const actionName =
  process.argv[2];

const action =
  ACTIONS[
    actionName
  ];

if (!action) {
  throw new Error(
    [
      "Usage:",
      "node scripts/personal-finance-development-data.mjs reset --confirm RESET-PERSONAL-FINANCE",
      "or",
      "node scripts/personal-finance-development-data.mjs demo --confirm LOAD-PERSONAL-FINANCE-DEMO"
    ].join(" ")
  );
}

const confirmation =
  argumentValue(
    "--confirm"
  );

if (
  confirmation !==
  action.confirmation
) {
  throw new Error(
    [
      "Confirmation phrase did not match.",
      `Required: ${action.confirmation}`
    ].join(" ")
  );
}

const resolvedDatabasePath =
  databasePath();

if (
  path.basename(
    resolvedDatabasePath
  ) !==
  "personal-finance.sqlite3"
) {
  throw new Error(
    [
      "Refusing to modify an unexpected database filename.",
      `Resolved path: ${resolvedDatabasePath}`,
      "Expected filename: personal-finance.sqlite3"
    ].join(" ")
  );
}

const resolvedControlPath =
  controlPath(
    resolvedDatabasePath
  );

const skipBackup =
  process.argv.includes(
    "--no-backup"
  );

console.log(
  "Personal Finance development-data action"
);

console.log(
  `Action: ${actionName}`
);

console.log(
  `Database: ${resolvedDatabasePath}`
);

console.log(
  `Bootstrap control: ${resolvedControlPath}`
);

let backupPath =
  null;

if (
  !skipBackup
) {
  backupPath =
    await createBackup(
      resolvedDatabasePath,
      actionName
    );
}

removeDatabaseFiles(
  resolvedDatabasePath
);

writeBootstrapControl({
  resolvedControlPath,
  mode:
    action.mode,
  purpose:
    action.purpose
});

console.log(
  backupPath
    ? `Backup: ${backupPath}`
    : skipBackup
      ? "Backup: skipped by explicit --no-backup"
      : "Backup: not needed because no database existed"
);

console.log(
  `Bootstrap mode: ${action.mode}`
);

console.log(
  "Database state: removed; the application will create a fresh schema on its next writable open."
);

if (
  action.mode ===
  "clean"
) {
  console.log(
    "Legacy CSV bootstrap: disabled."
  );

  console.log(
    "Synthetic demo bootstrap: disabled."
  );
} else {
  console.log(
    "Legacy CSV bootstrap: disabled."
  );

  console.log(
    "Synthetic demo bootstrap: enabled."
  );
}
