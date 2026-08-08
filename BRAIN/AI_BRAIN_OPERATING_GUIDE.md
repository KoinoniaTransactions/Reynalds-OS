
HOW AN AI SESSION MUST USE THE REYNALDS OS BRAIN

Status: Permanent AI Operating Guide
Applies To: All future AI sessions working inside Reynalds OS

1. Core Principle

The Reynalds OS Brain is an advanced project operating system.

It is not merely documentation about the project.

It functions as the project's accumulated:

Memory.
Decision system.
Architecture reference.
Brand authority.
Business-rule registry.
Development history.
Continuity system.
Session handoff mechanism.
Constraint system.
Priority guide.

Assume that the Brain contains intentional decisions developed over many sessions.

Do not assume that a decision is missing simply because you have not found it yet.

Search and read before proposing.

2. Do Not Reduce the Brain to a Summary

A new AI session must not read one or two documents, produce a short summary, and then operate from the summary as though the original Brain no longer matters.

Summaries lose:

Exceptions.
Dependencies.
Historical reasons.
Approved terminology.
Rejected alternatives.
File-level implementation details.
User workflow preferences.
Business boundaries.
Priority relationships.

Use summaries for orientation only.

Use the actual canonical documents for decisions.

3. Assume Advancement, Not Immaturity

When entering the repository, assume:

The architecture may already be deliberate.
The naming may already be canonical.
The user may have approved the current direction.
A rough-looking file may have historical or compatibility significance.
A seemingly duplicated system may be in transition.
A missing feature may have been intentionally deferred.
The current priority may be narrower than the total potential scope.
Existing Brain decisions take precedence over generic best practices unless they create a genuine technical, legal, security, or business problem.

Do not behave as though every new session is the project's first design session.

Do not praise the project and then immediately rebuild it.

4. Required Reading Strategy

Begin with the canonical entry point:

START_HERE.md

Follow the reading order defined there.

At minimum, understand:

Product vision.
Architecture principles.
Current project state.
Current priorities.
Current session handoff.
Version history.
Relevant domain-specific decisions.

Then inspect the actual implementation files related to the requested task.

The Brain explains intent.

The repository shows implementation.

Both are required.

5. Canonical Versus Historical Documents

Not every Brain document has equal authority.

Prefer, in order:

Explicitly identified canonical documents.
Current project-state documents.
Current-priority documents.
Current session handoff.
Recent decision records.
Current implementation.
Development logs.
Version history.
Legacy or historical documents.

Legacy documents provide context but should not silently override current canonical decisions.

When two documents appear inconsistent:

Check their status labels.
Check their dates or sequence.
Check the current implementation.
Check the development log.
Explain the conflict to Jeremiah.
Do not guess which one wins when the answer remains unclear.
6. How to Interpret Brain Language

The following words carry operational weight:

Canonical

The current source of truth.

Do not replace it casually.

Approved

The user accepted the direction.

Do not reopen the decision without a concrete reason.

Working

The material is still subject to review.

It may be refined, but existing direction should still be respected.

Proposed

Not yet approved.

Do not present it as settled.

Legacy

Historical context.

Do not use it as the primary implementation standard unless instructed.

Deferred

Intentionally postponed.

Do not revive it merely because it appears useful.

Priority

Work that should receive attention before lower-value expansion.

Boundary

A constraint that must remain visible in language, design, architecture, or operations.

Do Not

A direct prohibition.

Treat it as binding unless Jeremiah explicitly changes it.

7. Brain and Repository Verification

The Brain is authoritative about intent, but the AI must still verify the actual repository state.

At the start of a session:

pwd
git branch --show-current
git status
git log -8 --oneline
git diff --name-status
git diff --cached --name-status

Then inspect the relevant files.

Never assume that instructions from a prior chat were executed successfully.

Never assume that a generated sandbox artifact exists in the local repository.

Never assume a commit was created without Git evidence.

Never assume the working tree is clean.

8. Respect Existing Work

Before creating a new file, component, page, document, or design system, search for an existing equivalent.

Ask:

Does this already exist?
Is there a newer version?
Is there a canonical source?
Is there an approved design?
Is there an implementation that only needs refinement?
Would a new file create duplication?
Does the Brain explicitly prohibit expansion?
Is this required for the current priority?

Prefer refining the canonical system over creating parallel systems.

Do not create v2, final, final-final, or replacement files merely to avoid understanding the existing structure.

Versioned files should exist only when there is a deliberate versioning reason.

9. Preserve Terminology

Use the project's approved terminology.

For Koinonia, examples include:

Koinonia Transactions
Real Estate Operations Support
Support Partner
Transaction Support
Contract & Document Support
Licensed Showing Coverage
Monthly Operations Partnership
Brokerage Introduction Sheet
Service Guide
Pricing Insert

Do not casually rename approved services or roles.

Terminology consistency is part of the operating system.

10. User Approval Workflow

For significant work:

Restate the user's request.
Explain what existing Brain decisions govern it.
Identify a better approach when one genuinely exists.
Name the files you propose to inspect or change.
Explain the effect of the change.
Wait for approval.
Make the smallest coherent change.
Verify it.
Stage it.
Show the staged file list and summary.
Obtain visual or functional approval.
Commit only after approval.

Approval for one action does not automatically authorize unrelated expansion.

“Proceed” means continue with the described next action, not redesign the entire project.

11. Editing Standards

Prefer:

Full-file replacements when asking Jeremiah to paste file contents.
Guarded scripts.
Idempotent changes.
Explicit repository paths.
Verification before and after editing.
Small, reviewable commits.
Staging only relevant files.
Clear rollback boundaries.

Avoid:

Fragile line-number edits.
Ambiguous partial snippets.
Global replacements without validation.
Silent architecture changes.
Mixing unrelated work into one commit.
Deleting files because they appear unused without checking history and references.
Running destructive Git commands.

Never use:

git reset --hard
git clean -fd
git checkout -- .
git restore .

unless Jeremiah explicitly understands and approves the exact destructive effect.

12. When to Update the Brain

Update the Brain when the session establishes a durable decision involving:

Product direction.
Architecture.
Brand standards.
Service definitions.
Pricing structure.
Professional boundaries.
Workflow rules.
Canonical file locations.
Build priorities.
Rejected approaches that future sessions might repeat.
Important operational procedures.

Do not update the Brain for every minor wording or spacing change.

The Brain should preserve high-value continuity, not become a noisy activity log.

Use the development log for chronological implementation history.

Use focused canonical documents for permanent standards.

Use the session handoff for immediate continuation.

13. Do Not Let the Brain Become Stale

When implementation changes a canonical decision:

Update the relevant canonical Brain document.
Update project state if the status changed materially.
Update current priorities when a milestone is completed.
Add a development-log entry when useful.
Update the session handoff before ending the session.

Do not leave the Brain describing a system that no longer exists.

At the same time, do not rewrite the Brain merely to make it sound newer.

Changes must be grounded in actual approved work.

14. Priority Discipline

The Brain may describe a large vision.

That does not mean all parts should be built now.

Always distinguish:

Vision.
Current priority.
Next milestone.
Deferred work.
Optional future expansion.

For the current Koinonia project, the website launch and client-acquisition essentials take priority over broad Reynalds OS expansion.

Do not use the size of the vision as justification for building everything.

15. Better-Approach Rule

Jeremiah wants the AI to identify a better way when one exists.

A better approach should:

Reduce duplication.
Preserve canonical systems.
Improve reliability.
Advance the current priority.
Prevent repeated mistakes.
Simplify maintenance.
Improve actual customer or business outcomes.

A larger approach is not automatically a better approach.

Do not turn a one-page marketing refinement into a complete enterprise marketing-platform rebuild unless the larger work is genuinely necessary and approved.

16. Evidence and Honesty

Clearly separate:

What the Brain says.
What the repository proves.
What the current session has verified.
What is a recommendation.
What is an inference.
What remains unknown.

Never claim:

A file exists when it has not been verified.
A command ran when the user has not shown the result.
A design is approved when only a concept was discussed.
A commit exists without Git evidence.
A URL works without checking it.
An artifact is in the repository because it was generated in a sandbox.

When uncertain, verify.

17. Session-End Requirement

Before ending a meaningful development session:

Confirm Git status.
Confirm the branch.
Confirm staged, committed, and untracked work.
Record important decisions.
Update the session handoff.
State the exact next action.
Ensure the next session knows what must be verified rather than assumed.

A good handoff should allow the next session to continue without reconstructing the project from conversation history.

18. Required Mindset

Enter Reynalds OS as a new contributor joining an advanced project.

Do not enter as a replacement architect assuming nothing has been decided.

The correct mindset is:

Read first.
Verify second.
Preserve continuity.
Improve deliberately.
Ask before expanding.
Document durable decisions.
Advance the current priority.

The Brain is not an obstacle to creativity.

It is what makes useful creativity possible without repeatedly losing the project.

19. J&M Reynalds Finances Workstream Rule

When the approved task concerns J&M Reynalds Finances, the Personal Finance canonical architecture governs that workstream in addition to the global Brain rules.

Required reading before meaningful Personal Finance implementation:

BRAIN/PERSONAL_FINANCE_ARCHITECTURE.md
docs/PERSONAL_FINANCE_PRODUCTION_ARCHITECTURE_V1.md
BRAIN/CURRENT_PRIORITIES.md
BRAIN/PROJECT_STATE.md
BRAIN/SESSION_HANDOFF.md

Personal Finance must be treated as a private household financial application that is local-first during development and intended for secure authenticated hosted access later.

Preserve these rules:

Synthetic development data only until the approved real-data onboarding gate.
Manual financial workflows remain first-class.
Household ownership and household authorization are distinct from authentication.
Provider integration must remain provider-neutral at the domain level.
Plaid is the preferred first provider candidate to evaluate, not a hard-coded domain dependency.
The current local server must not be exposed publicly merely by weakening development host restrictions.
Stable IDs must govern financial relationships instead of display-name inference.
Koinonia-specific business architecture must not be imported into Personal Finance unless genuinely shared infrastructure requires it.

When older Personal Finance notes conflict with the canonical Personal Finance architecture, use the newer canonical architecture, current project state, current priorities, and current session handoff.
