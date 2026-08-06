## Why

Phase 1 delivered the student journey with sample data. The teacher still cannot author tests, manage students, or review results in-product. Phase 2 builds the full admin UI on the existing design system with local sample state so authoring and results UX can be signed off before any database or API work.

## What Changes

- Admin **shell**: sidebar navigation, top bar (email placeholder + logout no-op), `default` layout upgrade, admin route middleware
- Admin **login** page with demo success on any credentials (sets in-memory auth flag)
- Admin **pages** with hardcoded/sample Pinia data: dashboard, questions, sections, tests, groups, users, group results
- Admin **components**: `SidebarNav`, `DataTable`, `DragList`, `ScoreMapEditor`, `ResultsTable`
- Dependency: `vue-draggable-plus` for drag-and-drop reorder
- CRUD is **visual/local only** — mutations update client state; no persistence, no real APIs
- Student UI from Phase 1 is **unchanged** in behavior (no student scope expansion)

## Capabilities

### New Capabilities
- `admin-shell`: Admin layout, sidebar nav, top bar, middleware, demo login/logout session
- `admin-components`: DataTable, DragList, ScoreMapEditor, ResultsTable, SidebarNav
- `admin-authoring`: Sample-backed CRUD UX for questions, sections, tests, groups, and users
- `admin-dashboard-results`: Dashboard summary cards/recent attempts and per-group results breakdown

### Modified Capabilities
- _(none in main `openspec/specs/` yet — Phase 1 change not archived; no requirement deltas against published main specs)_

## Impact

- **Code**: `layouts/default.vue`, `middleware/admin.ts`, `stores/auth.ts`, `stores/admin.ts` (or domain stores), `components/admin/*`, `pages/admin/**`, sample fixtures under `data/`
- **Dependencies**: add `vue-draggable-plus`; reuse existing UI primitives and tokens
- **Systems**: none external — still static/sample; no Supabase/JWT/API
- **Follow-on**: Phase 3–5 replace sample stores with real APIs; middleware becomes real token checks
