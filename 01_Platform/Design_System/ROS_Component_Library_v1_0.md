# ROS-0044 — ROS Component Library v1.0

## Mission

Create a reusable component library so every ROS application screen can be assembled consistently instead of redesigned from scratch.

Core principle: Screens should be assembled from certified components.

## Component Categories

### 1. Navigation

- Sidebar Navigation
- Top Bar
- Breadcrumbs
- Tabs
- Command Palette
- User Menu
- Workspace Switcher

### 2. Dashboard Components

- KPI Card
- Metric Card
- Revenue Card
- Health Card
- AI Recommendation Card
- Priority Card
- Timeline Card
- Calendar Widget
- Activity Feed
- Quick Actions
- Progress Widget

### 3. Tables

Reusable tables for:
- Transactions
- CRM
- Draft Queue
- Showing Queue
- Tasks
- Invoices
- Repository Objects

Table rules:
- Every row opens the related object.
- Columns must support decisions or actions.
- Tables should avoid unnecessary fields.

### 4. Forms

Reusable fields:
- Text Field
- Dropdown
- Search
- Date Picker
- Money Input
- Percentage Input
- Property Address
- Notes
- Attachments
- Status Selector
- Owner Selector

Form rules:
- Required fields first.
- Optional fields grouped below.
- Missing required data clearly flagged.
- Avoid overwhelming the user.

### 5. Buttons

- Primary
- Secondary
- Outline
- Danger
- Success
- Icon
- Floating Action Button

Button rules:
- One primary action per card or section.
- Dangerous actions require confirmation.
- Labels should be verbs.

### 6. Status System

Approved states:
- Active
- Waiting
- Draft
- Complete
- Archived
- Certified
- Healthy
- Attention
- Critical
- High Risk
- Medium Risk
- Low Risk

### 7. Object Cards

Every object card displays:
- Object ID
- Name
- Object Type
- Status
- Owner
- Last Updated
- Related Objects
- Next Action

Object cards apply to:
- Transactions
- Clients
- SOPs
- Services
- Packages
- Invoices
- Draft Requests
- Showing Requests
- Repository Objects

### 8. AI Components

- Executive Summary
- Recommendation Card
- Suggested Action
- Risk Alert
- Capacity Warning
- Opportunity Insight
- Confidence Indicator
- Supporting Data Block

AI component rule:
Every AI recommendation must show the reason and the supporting data.

### 9. Command Palette

Supported command types:
- Open object
- Create object
- Search repository
- Generate briefing
- Show dashboard
- Start workflow
- Draft communication

Long-term goal:
The command palette becomes the primary natural-language interface to ROS.

## Certification Standard

A component is certified when it has:

- Purpose
- Required fields
- Visual state
- Interaction rules
- Accessibility standard
- Related object types
- Example usage
- Mobile behavior

## Engineering Principle #28

Reusable components create scalable interfaces. If a UI pattern will appear more than twice, it should become a component.
