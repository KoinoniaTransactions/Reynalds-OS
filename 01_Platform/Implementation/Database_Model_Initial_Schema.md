# Initial Database Model

## Purpose

Define the first production database schema for ROS.

## Core Tables

### workspaces
- id
- name
- type
- status
- settings_json
- created_at
- updated_at

### users
- id
- workspace_id
- name
- email
- role_id
- status
- created_at
- updated_at

### roles
- id
- workspace_id
- name
- permissions_json
- created_at
- updated_at

### objects
- id
- workspace_id
- object_type
- name
- status
- health
- owner_id
- next_action
- data_json
- created_at
- updated_at
- archived_at

### object_relationships
- id
- source_object_id
- target_object_id
- relationship_type
- created_at

### timeline_events
- id
- workspace_id
- object_id
- actor_id
- event_type
- summary
- previous_value_json
- new_value_json
- created_at

### workflows
- id
- workspace_id
- name
- status
- trigger_event
- definition_json
- created_at
- updated_at

### workflow_runs
- id
- workflow_id
- object_id
- status
- current_stage
- started_at
- completed_at

### tasks
- id
- workspace_id
- related_object_id
- owner_id
- title
- status
- priority
- due_at
- completed_at
- created_at
- updated_at

### automation_rules
- id
- workspace_id
- name
- trigger_event
- conditions_json
- actions_json
- requires_review
- status
- created_at
- updated_at

### notifications
- id
- workspace_id
- user_id
- related_object_id
- level
- title
- message
- status
- due_at
- created_at

### documents
- id
- workspace_id
- related_object_id
- file_name
- file_url
- document_type
- status
- created_at

### invoices
- id
- workspace_id
- client_object_id
- related_object_id
- package_object_id
- amount
- status
- due_at
- paid_at
- created_at

### payments
- id
- workspace_id
- invoice_id
- amount
- status
- received_at
- created_at

## Schema Rule

The objects table is the central object registry. Specialized tables may exist, but they must not create duplicate truth.
