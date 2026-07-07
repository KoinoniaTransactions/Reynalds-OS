# ROS v8.6 — Object Create/Edit Forms

## Added

- Create Object form inside `/objects`.
- Edit Object form inside object detail panel.
- Create action using `POST /api/objects`.
- Update action using `PATCH /api/objects/:id`.
- Object list refresh after create/update.
- Detail reload after create/update.
- Form styling in design system.

## Current Limitations

- Form validation is minimal.
- No dropdowns yet for object type/status/health.
- No relationship creation UI yet.
- Search remains placeholder.

## Next Recommended Work

- Add client-side search.
- Add relationship creation UI.
- Add object type/status/health dropdowns.
- Add route tests.
