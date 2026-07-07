# Developer Handoff

## Project Status

Reynalds OS is in repository-first development.

Current version: v11.0.0

## Start Here

Read these first:

1. `START_HERE.md`
2. `CURRENT_STATE.md`
3. `PROJECT_MEMORY.md`
4. `AI_DEVELOPMENT_CHARTER.md`
5. `NEXT_ACTION.md`

## Do Not Start From

Do not start from the old standalone app shell as the main application.

The v7.2 shell is preserved historically under:

```text
07_Application_Prototypes/ROS_Koinonia_Interactive_App_Shell_v7_2.html
```

It is not the active production app source.

## Start From

Primary app:

```text
apps/web/
```

Primary database schema:

```text
packages/database/prisma/schema.prisma
```

Primary source-of-truth docs:

```text
BRAIN/
START_HERE.md
CURRENT_STATE.md
PROJECT_MEMORY.md
NEXT_ACTION.md
AI_DEVELOPMENT_CHARTER.md
```

Koinonia website knowledge:

```text
03_Knowledge/Website/
```

## First Local Commands

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm --filter @reynalds-os/database db:generate
pnpm --filter @reynalds-os/database db:migrate
pnpm --filter @reynalds-os/database db:seed
pnpm dev
```

## First Routes To Check

- `/`
- `/objects`
- `/crm`
- `/transactions`
- `/operations`
- `/finance`
- `/knowledge`
- `/copilot`
- `/notifications`
- `/workflows`

## Most Important Warning

Do not claim work is complete from conversation history alone. Complete means real repository files changed and the release package reflects those changes.
