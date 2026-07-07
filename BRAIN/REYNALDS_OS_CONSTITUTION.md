# Reynalds OS Architectural Principles

> This document defines the core engineering philosophy of Reynalds OS.
>
> It exists to preserve architectural consistency across development sessions, future contributors, and AI assistants.
>
> Every significant design decision should align with these principles.

---

# A. Development Philosophy

## 1. The Repository Is the Source of Truth

The Git repository is the authoritative source of truth for Reynalds OS.

Documentation is developed alongside the software and is considered part of the product.

Chat conversations are temporary working sessions.

The repository preserves long-term project knowledge.

---

## 2. Documentation Is a Product

Documentation is not an afterthought.

Architecture, workflows, major features, and engineering decisions should be documented as they are built.

A new developer—or a new AI session—should be able to understand the project directly from the repository.

---

## 3. Applications Build on the Platform

Applications should inherit capabilities from Reynalds OS rather than implementing their own versions.

Reusable infrastructure always takes priority over application-specific implementations.

Avoid duplicate systems whenever practical.

---

## 4. Explain Before Changing

Major architectural changes should always be proposed before implementation.

Large refactors require review and approval before execution.

Evolution is preferred over replacement.

---

## 5. Build Incrementally

Commit after every stable milestone.

Preserve backward compatibility whenever practical.

Every development session should leave the repository easier to understand than it was before.

---

# B. Platform Architecture

## 6. Object Engine First

All major business records should be represented as shared ROS Objects whenever practical.

Examples include:

- Relationship
- Transaction
- Task
- Invoice
- Property
- Company
- Contact
- Workflow
- Service
- Knowledge Item
- Timeline Event
- Notification
- Customer Success Record

Objects become the shared language of every application.

---

## 7. No Isolated Module Truth

Modules provide different views of the same data.

CRM

Transactions

Finance

Operations

Knowledge

Workflow

Customer Success

should all consume shared platform objects.

Modules should never maintain conflicting copies of business data.

---

## 8. Timeline Everything That Matters

Every meaningful action should automatically create a timeline event.

Examples:

- Object created
- Object updated
- Task assigned
- Task completed
- Invoice created
- Invoice paid
- Workflow started
- Workflow completed
- Customer communication
- AI recommendation accepted

The timeline becomes the historical record of Reynalds OS.

---

## 9. Workflow Over Hardcoding

Repeated business processes should become configurable workflows rather than duplicated application logic.

Whenever similar logic appears in multiple places, it should become part of the Workflow Engine.

---

## 10. Dashboard Metrics Must Be Calculated

Dashboard values originate from platform services and database queries.

Dashboard cards should never contain manually maintained business numbers.

The dashboard reflects the platform—it does not define it.

---

## 11. Permissions Wrap Every Write

Every create, update, archive, execute, or delete action should pass through centralized authorization.

Business logic should never bypass permission checks.

---

## 12. Build for Traceability

Every meaningful change should answer:

- Who performed it?
- What changed?
- Which object changed?
- When did it happen?
- Why does it matter?

Auditability is a core platform capability.

---

# C. Artificial Intelligence Principles

## 13. Copilot Recommends Before It Acts

AI assists by:

- Explaining
- Prioritizing
- Drafting
- Summarizing
- Recommending
- Planning

Production data should only be modified through explicit, reviewable user actions or approved workflows.

The AI should amplify decision-making—not replace user authority.

---

## 14. Context Before Code

Before implementing significant functionality, AI should understand:

- Current project architecture
- Existing modules
- Brain documentation
- Active priorities
- Previous architectural decisions

The goal is to extend Reynalds OS rather than reinvent it.

---

# D. Long-Term Vision

## 15. Reynalds OS Is an Operating System

Reynalds OS is not a website.

It is a business operating system designed to support multiple companies, applications, and workflows from a shared platform.

Every new capability should strengthen the operating system itself.

Applications are built on the platform—not beside it.

---

## 16. Koinonia Is the First Production Application

Koinonia serves as the first production implementation of Reynalds OS.

The operating system should evolve as real-world application requirements emerge.

Platform development should be driven by practical business needs rather than speculative architecture.

---

## 17. Build for Decades

Architectural decisions should favor:

- Maintainability
- Extensibility
- Reusability
- Documentation
- Simplicity
- Long-term stability

The objective is to build a platform that can continue evolving for many years while preserving clarity, consistency, and trust.