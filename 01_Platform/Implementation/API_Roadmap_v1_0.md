# API Roadmap v1.0

## Purpose

Define the first API roadmap for implementing ROS as a production application.

## API Groups

### Object API
- GET /objects
- POST /objects
- GET /objects/{id}
- PATCH /objects/{id}
- POST /objects/{id}/archive

### Relationship API
- GET /objects/{id}/relationships
- POST /relationships
- DELETE /relationships/{id}

### Timeline API
- GET /timeline
- GET /objects/{id}/timeline
- POST /timeline/events

### Workflow API
- GET /workflows
- POST /workflows
- POST /workflows/{id}/start
- PATCH /workflow-runs/{id}

### Task API
- GET /tasks
- POST /tasks
- PATCH /tasks/{id}
- POST /tasks/{id}/complete

### Automation API
- GET /automation-rules
- POST /automation-rules
- POST /automation-rules/{id}/test
- PATCH /automation-rules/{id}

### Analytics API
- GET /analytics/dashboard
- GET /analytics/operations
- GET /analytics/finance
- GET /analytics/repository

### Copilot API
- POST /copilot/ask
- POST /copilot/draft
- POST /copilot/recommend-action

### Notification API
- GET /notifications
- PATCH /notifications/{id}
- POST /notifications/{id}/resolve

## API Rule

Every API response that supports AI, reporting, or automation should include object IDs and source references.
