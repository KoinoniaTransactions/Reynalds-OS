# OBJ-RB-000004 — Communication

## Purpose

A Communication is any email, call, text, or message related to Reynalds Brothers work.

Most Reynalds Brothers jobs begin, change, wait, and move forward through email. Communication objects preserve that evidence under the correct Work Item so planning can last one week or six months without losing context.

---

## Core Principle

Emails are not just inbox messages.

Emails are operational evidence connected to Work Items.

An email should be:

1. Filed under an existing Work Item
2. Used to create a new Work Item
3. Held for review if the AI cannot identify the correct job

---

## Required Fields

- Communication ID
- Channel
- Source system
- Source message ID
- From
- To
- Subject
- Received date
- Snippet or body summary
- Classification
- Filing status
- Related Work Item
- Suggested next action

---

## Email Intake Workflow

1. Email enters from Gmail, Outlook, forwarded inbox, or manual paste.
2. AI reads the sender, subject, body, store number, work order number, customer, service line, and project language.
3. AI checks active Reynalds Brothers Work Items.
4. If a confident match exists, the email is filed under that Work Item.
5. If the email describes new work, the AI suggests or creates a Work Item.
6. If the email is ambiguous, it stays in review.
7. Filed emails become timeline evidence and can update the Work Item next action.

---

## First Software Implementation

The first implementation is:

`/api/reynalds-brothers/email-intake`

Initial supported actions:

- Analyze email
- Suggest Work Item match
- Suggest new Work Item
- Create Communication object
- Link Communication to Work Item
- Create Work Item from email
- Add timeline event to the Work Item

---

## AI Role

AI may assist by:

- Identifying likely Work Item matches
- Detecting new job requests
- Extracting service line, customer, store number, work order number, and next action
- Monitoring long planning cycles for unanswered emails, missing approvals, missing scope, and stalled jobs

AI may not silently file ambiguous emails. Low-confidence emails must remain in review.

---

## Governance

This object belongs to the Reynalds Brothers company domain under `02_Companies/Reynalds_Brothers`.

It must remain separate from Koinonia business communications and platform-level Reynalds OS objects.
