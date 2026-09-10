# Private Records Boundary

## Purpose

This document defines the storage boundary between the public Reynalds OS Git repository and external secure private workspaces.

## Public Repository

The public Git repository may contain:

- application source code;
- public business documentation;
- non-sensitive operating procedures;
- generic architecture and governance;
- sanitized continuity notes that do not identify a private matter or expose confidential facts.

## Secure Private Workspace

Confidential or personal records must remain outside the public repository in the designated secure private workspace. This includes, without limitation:

- legal case records and pleadings;
- court evidence and source records;
- family communications;
- attorney or advisor notes;
- litigation strategy and draft legal work product;
- bank, tax, payroll, credit, insurance, or other personal financial records;
- medical or similarly sensitive personal records;
- private identifiers, credentials, account numbers, or other protected information.

## Synchronization Rule

When work spans both Reynalds OS and a secure private workspace:

1. Keep the substantive private record and its revision history in the secure workspace.
2. Do not copy private source documents, identifying case details, or confidential analysis into the public repository.
3. Git may record only the generic governance, architecture, or workflow needed to maintain the storage boundary.
4. Preserve material revisions in the secure workspace rather than overwriting history when lineage matters.
5. If classification is uncertain, default to the secure workspace.

## Source of Truth

The public repository remains the source of truth for public Reynalds OS software, business architecture, and generic governance.

The designated secure workspace is the source of truth for each private matter's evidence, confidential work product, and matter-specific continuity records.

These two sources must not be collapsed into one merely for convenience.
