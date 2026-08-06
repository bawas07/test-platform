# Phase 2 — Admin UI (static, sample data)

**Status:** Ready for implementation  
**Scope:** Medium (depends on Phase 1 design system)  
**Depends on:** Phase 1 student UI sign-off  
**Sign-off:** Teacher reviews all admin flows; no admin UI scope changes after sign-off

---

## Goal

The teacher can navigate the full admin interface with sample data. CRUD flows work visually (local Pinia state) but don't persist — submit resets/updates local state only. Sign-off on admin UX before database or API work begins.

---

## Scope

### Admin shell
- `layouts/default.vue` upgraded to sidebar (240px) + sticky top bar + content
- `SidebarNav` with 7 items: Dashboard, Questions, Sections, Tests, Groups, Students, Results — Tabler icons, active highlight
- `middleware/admin.ts` — redirects to `/admin/login` if no in-memory auth
- `stores/auth.ts` — demo login (any non-empty credentials succeed), logout clears

### Admin components (new)
- `DataTable` — sortable columns, pagination, loading/empty states, slots for custom cells
- `DragList` — `vue-draggable-plus` wrapper, drag handle, disabled/dimmed mode
- `ScoreMapEditor` — inline raw→scaled rows, add/remove
- `ResultsTable` — dynamic section columns + total per student

### Admin pages
- `/admin/login` — blank layout, any submit succeeds
- `/admin` — Dashboard: summary cards + recent attempts
- `/admin/questions` — paginated list, create/edit modal, options editor, audio field (visual only)
- `/admin/sections/[id]` — name/time/max/randomize, DragList reorder, ScoreMapEditor
- `/admin/tests/[id]` — name/scoringMode, section DragList, PERCENTAGE weight inputs + sum validation
- `/admin/groups/[id]` — name/test picker, schedule, user assignment
- `/admin/users` — paginated list, create modal with auto-generated code, certificate toggle
- `/admin/groups/[id]/results` — ResultsTable with section + total scores

### Index routes
- `/admin/sections`, `/admin/tests`, `/admin/groups` — list pages for navigability (milestones don't list but FE folder tree includes them)

---

## Architecture

### Data model (client-only, mirrors future schema)

```
Question { id, text, options[], correctOptionId, audioUrl? }
Section { id, name, timeLimit, maxScore, randomize, questionIds[], scoreMap }
Test { id, name, scoringMode, sectionIds[] (with order + weight) }
Group { id, name, testId, startTime, endTime, certDelay, userIds[] }
User { id, name, testCode, certificateEnabled }
Attempt { id, userId, groupId, status, totalScore, sectionScores[] }
```

### Store design
- `stores/auth.ts` — memory-only token + email; `login()`, `logout()`, `isLoggedIn`
- `stores/admin.ts` — all domain arrays + CRUD methods; seeded from `data/sample-admin.ts`
- CRUD methods mutate local arrays and return promises (swap-in for API later)

### Layout layering
```
default.vue
├── SidebarNav (fixed left)
├── TopBar (sticky, app name + email + logout)
└── <slot /> — page content
```

`blank.vue` used for login only. Admin pages use `layout: 'default'`.

### Middleware
- `middleware/admin.ts` — applied to all `/admin/**` except `/admin/login`
- Checks `useAuthStore().isLoggedIn`; if false → `navigateTo('/admin/login')`
- No token refresh in P2 (memory-only, no httpOnly)

### Sample data (`data/sample-admin.ts`)
- 8+ questions (mix text + audio URL fields)
- 3 sections tied to the question pool; section 1 has an example score map
- 2 tests (SUM, PERCENTAGE); 2 groups (one active, one past)
- 6+ users with generated codes
- 4+ sample attempts with per-section scores for results demo

**Code generation:** `CODE-XXXX` where XXXX is 4 random alphanumeric chars (client-only for demo).

### Scoring simulation
- Section scores in sample attempts are hardcoded — no real scoring engine in P2
- PERCENTAGE weight validation: inline error if sum ≠ 100; save blocked with toast warning

---

## Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Admin store shape | Single `stores/admin.ts` | Swap point for Phase 5 API; easier than 5 thin stores |
| Login demo | Any non-empty email/password succeeds | Teacher sign-off friction minimal |
| Sidebar Results | Navigate to first sample group results | One-click demo; teacher can also reach via Groups → Results |
| Section/test/group create | Generate client-side id, navigate to detail | Consistent pattern; CRUD flows feel real |
| DragList | `vue-draggable-plus` | Spec'd in FE.md; native DnD is more code |

---

## Implementation order

| Task | What | Depends on |
|---|---|---|
| 1 | Admin shell + auth + SidebarNav + login | Project scaffold |
| 2 | Sample admin data + admin store | Task 1 types |
| 3 | Admin UI components (DataTable, DragList, ScoreMapEditor, ResultsTable) | Design system |
| 4 | Admin pages: dashboard, questions, sections, tests, groups | Tasks 1–3 |
| 5 | Users + results pages | Tasks 1–4 |
| 6 | Polish, responsive, README, build verify | All |

---

## Non-goals
- Real JWT/auth/password hashing
- Supabase, DB migrations, server routes
- File upload (audio field visual-only)
- Rich text editing
- Export, bulk operations
- Persistence across refresh (documented in README)
- Changing student UI

---

## Risks

| Risk | Mitigation |
|---|---|
| SSR middleware redirects admin on hard refresh (no cookie) | Accept; README notes that refresh → re-login |
| DragList SSR issues | Client-only wrapper or dynamic import |
| Weight sum ≠ 100 UX | Inline validation with toast block on save |
| Scope creep into API | Push back; this is UX sign-off only |
