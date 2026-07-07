# Plugin / Extension Architecture

## Purpose

Allow future modules to be added without rewriting the core platform.

## Plugin Types

- Module plugin
- Workflow plugin
- Object type plugin
- Dashboard widget plugin
- Automation rule plugin
- Report plugin
- AI skill plugin
- Integration plugin

## Plugin Requirements

Every plugin must define:

- Plugin ID
- Name
- Version
- Required permissions
- Object types used
- Workflows added
- Events emitted
- Dashboards impacted
- Repository documentation
- Installation status

## Rule

New capabilities should extend ROS, not fork ROS.
