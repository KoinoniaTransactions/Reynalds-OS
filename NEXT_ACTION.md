# Next Action

## Immediate Goal

Finish the current Brain/continuity synchronization and review it before integration.

After that, resume work on the **Koinonia Transactions website** from the current repository state.

---

# Before Starting the Next Product Task

1. Read `START_HERE.md`.
2. Read `BRAIN/CANONICAL_REGISTRY.md`.
3. Read `BRAIN/PROJECT_STATE.md`.
4. Read `BRAIN/CURRENT_PRIORITIES.md`.
5. Read `BRAIN/SESSION_HANDOFF.md`.
6. Verify the repository path, branch, status, and intended target files.
7. Inspect current Koinonia Transactions implementation before recommending changes.
8. Restate the proposed next slice and wait for approval before execution.

---

# Do Not Reopen by Default

Do not continue Reynalds Brothers recovery, feature expansion, or seed-parity work merely because recovery evidence remains available.

The RB recovery/closure milestone is complete enough to leave the active critical path.

Preserve:

`recovery/reynalds-brothers-main-workspace-20260731`

until an intentional seed-parity review is completed.

---

# Verified RB Checkpoint for Reference

`reynalds-brothers-only` at:

`e84b4e610e6075f6f54907f277714a94b24dd7e6`

Company data map:

`02_Companies/Reynalds_Brothers/06_Brain/README.md`

---

# Current CI Reminder

When full repository CI/build behavior is relevant, the established sequence is:

1. `pnpm install --frozen-lockfile`
2. `pnpm db:generate`
3. `pnpm test`
4. `pnpm build`

Do not remove explicit Prisma generation without verifying an intentional architecture change.
