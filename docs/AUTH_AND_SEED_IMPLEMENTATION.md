# ROS v8.2 — Authentication Scaffold & Seed Data

## Added

- `packages/auth`
- Role permission definitions
- Mock current user
- Permission guard helpers
- `/api/me` route
- Permission checks on Object API scaffold
- Prisma seed script
- Koinonia workspace seed
- Owner role seed
- Owner user seed
- Initial ROS objects seed
- Initial timeline event seed

## Important

This is an implementation scaffold. It uses a mock user so development can continue before managed authentication is connected.

## Next Implementation Step

Replace `getMockUser()` with a managed authentication provider session lookup.

## Seed Command

```bash
pnpm --filter @reynalds-os/database db:seed
```

## Recommended Next Work

1. Connect Object API to Prisma.
2. Add validation.
3. Add timeline event creation on object updates.
4. Replace mock auth with managed auth provider.
