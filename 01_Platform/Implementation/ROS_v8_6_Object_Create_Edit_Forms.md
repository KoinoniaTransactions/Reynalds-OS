# ROS-0071 — Object Create/Edit Forms

## Purpose

Add production UI forms for creating and updating ROS objects through the Object API.

## Added

- Create Object form.
- Edit Object form.
- POST `/api/objects` integration.
- PATCH `/api/objects/:id` integration.
- Refresh behavior after save.
- Design system form styles.

## Platform Rule

Object creation and update must go through the platform API so timeline and permission rules remain enforceable.
