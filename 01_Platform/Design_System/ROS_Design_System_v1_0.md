# ROS-0042 — ROS Design System v1.0

## Mission

Create a reusable visual and interaction language for every ROS screen, beginning with Koinonia ERP and eventually extending to Environmental, Family, Finance, and future company modules.

Core principle: Consistency in interface design creates consistency in decision-making.

## Visual Direction

ROS should feel:
- Professional
- Calm
- Organized
- Executive
- Premium
- Operationally clear
- Data-aware without feeling cluttered

ROS should not feel:
- Flashy
- Trendy
- Overly colorful
- Consumer-app casual
- Dashboard-heavy without purpose

## Color Tokens

Primary Background:
- Cream: #f7f1e8

Primary Surface:
- White: #ffffff

Primary Text:
- Black: #161616

Secondary Text:
- Gray: #5f5f5f

Accent:
- Gold: #b88a44

Border:
- Soft Gold Border: rgba(184,138,68,0.28)

Status:
- Healthy Green
- Attention Yellow
- Critical Red
- Neutral Gray

## Typography

Primary Interface Font:
- Arial / Helvetica / sans-serif

Display Font:
- Georgia / Times New Roman / serif

Usage:
- Serif for major headings and brand-level titles.
- Sans-serif for dashboards, tables, forms, buttons, and operational text.

## Spacing System

Use consistent spacing:
- 8px base unit
- 16px compact section spacing
- 24px standard card spacing
- 32px major section spacing
- 48px large page spacing

## Component Library

### Header
Always includes:
- Global Search
- Quick Actions
- Notifications
- Profile
- AI Command Bar

### Sidebar Navigation
Persistent desktop navigation:
- Dashboard
- CRM
- Transactions
- Contracts
- Showings
- Operations
- Finance
- Success
- Knowledge
- Reports
- ROS

### Cards
Used for:
- KPIs
- Priorities
- Work queues
- Recommendations
- Object summaries

Card rules:
- Clear title
- One primary value or message
- Status indicator when relevant
- One primary action when needed

### Status Badges
Approved states:
- Healthy
- Attention
- Critical
- Waiting
- Draft
- Active
- Complete
- Archived
- Certified

### Tables
Used for operational lists:
- Transactions
- Leads
- Tasks
- Invoices
- Draft requests
- Showing requests

Table rules:
- Columns must support action.
- Avoid unnecessary data.
- Every row should open the related object.

### Work Queue Items
Each item should show:
- Title
- Related object
- Priority
- Due date
- Owner
- Status
- Next action

### Forms
Forms should:
- Capture required fields first.
- Group optional fields.
- Show missing required information clearly.
- Avoid overwhelming the user.

### Modals
Use for:
- Quick create
- Confirm action
- Add note
- Send draft
- Assign task

Avoid using modals for complex workflows.

### AI Recommendation Cards
Each recommendation must show:
- Recommendation
- Reason
- Supporting data
- Confidence level
- Suggested next action

## Interaction Standards

Every screen must:
- Show the current context.
- Show the next best action.
- Make risk visible.
- Reduce unnecessary choices.
- Link back to source objects.

## Mobile Standards

Mobile should prioritize:
- Priorities
- Tasks
- Calendar
- Notifications
- Quick capture
- Object status

Mobile should not attempt to replicate every desktop dashboard feature.

## Accessibility Standards

- Maintain strong contrast.
- Avoid relying on color alone for status.
- Use clear labels.
- Keep buttons large enough for touch.
- Use plain language.

## Product Principle

Every screen should reduce work, reduce uncertainty, or improve decision-making.
