# App Shell Version Guidance

## Question

Do I need a newer Dashboard/App Shell than v7.2?

## Answer

Yes, but the better path is not to keep updating the old standalone static shell.

The old v7.2 app shell is now superseded by the production Next.js app inside this repository.

## Current Direction

Use the production app:

```text
apps/web/
```

Not the old standalone shell:

```text
ROS_Koinonia_Interactive_App_Shell_v7_2.html
```

## Why

The production app now includes:

- Object API persistence.
- Database-backed dashboard metrics.
- CRM MVP.
- Transactions MVP.
- Operations Queue MVP.
- Finance MVP.
- Knowledge MVP.
- Copilot MVP.
- Notifications MVP.
- Workflow Engine MVP.

The static app shell cannot properly represent those database-backed modules without becoming a second separate product.


## v11.0.0 Clarification

The standalone `ROS_Koinonia_Interactive_App_Shell_v7_2.html` is preserved as a historical prototype. It is useful for visual reference and platform thinking, but active production development belongs in `apps/web` unless a specific migration decision is documented.
