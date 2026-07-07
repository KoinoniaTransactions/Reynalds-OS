# Next Action

Run local validation from the v11.3.1 recovery baseline.

## Goal

Confirm the recovered OS can install, build, and run before calling it the Bible.

## Commands

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Verify Routes

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
- `/koinonia`
- `/koinonia/services`
- `/koinonia/about`
- `/koinonia/contact`
