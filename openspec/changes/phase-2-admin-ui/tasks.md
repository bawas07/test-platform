## 1. Admin shell and auth

- [x] 1.1 Add `vue-draggable-plus` dependency to package.json
- [x] 1.2 Implement `stores/auth.ts` (accessToken, admin email, isLoggedIn, login/logout with demo success on any non-empty credentials)
- [x] 1.3 Implement `middleware/admin.ts` (redirect to `/admin/login` if not logged in; skip middleware on login page)
- [x] 1.4 Implement `components/admin/SidebarNav.vue` (sidebar with all 7 nav items, icons, active-route highlight, link to routes)
- [x] 1.5 Upgrade `layouts/default.vue` to admin chrome: SidebarNav on left (240px), sticky top bar with app name + admin email + logout button, content slot
- [x] 1.6 Build `pages/admin/login.vue` (blank layout, email + password, submit logs in via auth store and navigates to `/admin`)
- [x] 1.7 Add admin route middleware to admin pages pattern (via `definePageMeta` on each page or layout-level)

## 2. Sample admin data

- [x] 2.1 Add admin domain types (`types/admin.ts`): Question, Section, Test, Group, User, Attempt/Result shapes aligned with future real schema
- [x] 2.2 Create `data/sample-admin.ts`: questions (8+), sections (3, one with score map), tests (2), groups (2), users (6+), sample attempts with section scores
- [x] 2.3 Implement `stores/admin.ts` with sample-backed CRUD: create/update/delete for questions/sections/tests/groups/users, group user assignment, reorder helpers, code generation utility

## 3. Admin UI components

- [x] 3.1 Implement `components/admin/DataTable.vue` (columns, rows, pagination, empty state, loading state, sort emit)
- [x] 3.2 Implement `components/admin/DragList.vue` (vue-draggable-plus wrapper, drag handle slot, disabled mode, reorder emit)
- [x] 3.3 Implement `components/admin/ScoreMapEditor.vue` (inline table, raw_score/scaled_score, add/remove rows, update emit)
- [x] 3.4 Implement `components/admin/ResultsTable.vue` (per-student rows with dynamic section score columns + total column)

## 4. Admin pages — management

- [x] 4.1 Build Dashboard `/admin` (summary cards: group/student/test totals; recent attempts table from sample data)
- [x] 4.2 Build Questions page `/admin/questions` (paginated DataTable, create/edit modal with question text, options editor with add/remove + correct-flag radio, optional audio URL field visual)
- [x] 4.3 Build Sections page `/admin/sections` + `/admin/sections/[id]` (index list, detail with name/time/max/randomize, DragList for assigned questions, ScoreMapEditor)
- [x] 4.4 Build Tests page `/admin/tests` + `/admin/tests/[id]` (index list, detail with name/scoringMode, section assignment with DragList reorder, weight inputs conditional on PERCENTAGE mode, weight-sum inline validation)
- [x] 4.5 Build Groups page `/admin/groups` + `/admin/groups/[id]` (index list, detail with name/test-picker/start/end/delay, user assignment add/remove UI)

## 5. Admin pages — users and results

- [x] 5.1 Build Users page `/admin/users` (paginated DataTable, create modal with name → auto-generate code, certificate toggle, group chip display)
- [x] 5.2 Build Results page `/admin/groups/[id]/results` (ResultsTable with section scores + total; empty state)
- [x] 5.3 Wire sidebar Results nav item to navigate to first sample group results (`/admin/groups/sample-group-1/results`)

## 6. Polish and sign-off prep

- [x] 6.1 Responsive pass: admin layout collapses sidebar or adjusts ~1024px+; tables scroll horizontally on narrow screens; modals functional on mobile
- [x] 6.2 Copy/sentence-case pass; all actions use reusable icons; toast on CRUD success
- [x] 6.3 Guard `/admin` root route with middleware; ensure login page accessible when not logged in
- [x] 6.4 Update README with admin demo instructions (login credentials, known limitations: refresh resets; no real persistence)
- [x] 6.5 Verify build (`npm run build`) and spot-check sample CRUD flows locally
