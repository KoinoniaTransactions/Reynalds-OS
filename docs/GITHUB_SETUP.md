# GitHub Setup

## Recommended Repository Name

`reynalds-os`

## First-Time Setup

```bash
git init
git add .
git commit -m "Initial Reynalds OS v10.1 baseline"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## Tag Release

```bash
git tag v10.1.0
git push origin v10.1.0
```

## Branch Strategy

- `main` — stable baseline.
- `feature/<ticket-id>` — feature work.
- `fix/<description>` — bug fixes.
- `release/vX.X` — release prep if needed.

## Commit Style

Use clear commits:

```text
ROS-0083 consolidate professional repo brain
ROS-MVP-018 add workflow step execution engine
fix object route params typing
```
