# Contributing to Reynalds OS

## Core Rule

Every approved change must update:
1. The related object file.
2. object_registry.csv if object metadata changes.
3. 05_Change_Log/change_log.csv.
4. manifest.json.
5. RELEASE_NOTES.md when release-level changes occur.

## Change ID Format

Use the format:

ROS-####

Example:

ROS-0034

## Object Standard

Every production object must follow ROS-OS1 and the Production Object Standard.

## No Duplicate Truth

Do not create standalone documents that conflict with repository objects. If a document is needed, it should be generated from or linked back to the repository.

## Release Rules

Patch release: documentation or minor object updates.  
Minor release: new certified objects or major repository features.  
Major release: architecture or platform-level change.
