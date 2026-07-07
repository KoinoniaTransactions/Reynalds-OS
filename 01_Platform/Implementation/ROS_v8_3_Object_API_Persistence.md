# ROS-0068 — Object API Persistence

## Purpose

Connect the production Object API to Prisma persistence.

## Added

- Shared Prisma client helper.
- Object validation helpers.
- Prisma-backed Object API.
- Object detail route.
- Update route.
- Soft archive route.
- Timeline event creation on object create/update/archive.
- Prisma-backed Timeline API.
- Relationship create API.

## Platform Rule

Object changes must create timeline events so the system remains auditable.
