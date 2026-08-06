## Context

Phase 1 shipped the student UI (Nuxt 3, Pinia, Laut Siang tokens, UI primitives). `layouts/default.vue` is a passthrough shell. No admin routes, no `auth` store, no drag-and-drop dependency yet.

Phase 2 (milestones.md) is admin UI with sample data only — teacher sign-off on authoring and results UX before DB/API.

## Goals / Non-Goals

**Goals:**
- Full admin navigation and pages with realistic sample fixtures
- Local CRUD that mutates Pinia state (create/edit/delete/reorder) so flows feel real
- Demo login gate via middleware + memory-only session
- Admin components per FE.md: DataTable, DragList, ScoreMapEditor, ResultsTable, SidebarNav
- Reuse Phase 1 design system; match admin layout wireframes

**Non-Goals:**
- Real JWT, cookies, password hashing, or API calls
- Supabase / migrations / server routes
- Persisting admin data across full page refresh (acceptable P2; document in README)
- Changing student test-runner behavior or certificate flow
- Production security hardening of the demo login

## Decisions

### D1 — Single `stores/admin.ts` (+ `stores/auth.ts`) over many domain stores
**Choice:** One admin sample store holding questions, sections, tests, groups, users, attempts/results; thin `auth` store for `accessToken` + admin email.  
**Why:** Phase 5 will introduce API composables; one sample store is easier to swap than five half-empty stores.  
**Alt:** Per-entity stores — more files, little gain while all data is fixture-backed.

### D2 — Demo auth is memory flag, any credentials succeed
**Choice:** Login form accepts any non-empty email/password (or any submit), sets `accessToken = 'demo-token'` and `admin = { id, email }`. Logout clears store. Middleware checks `isLoggedIn`.  
**Why:** Matches milestones “hardcoded success”; unblocks UI review.  
**Alt:** Hardcoded email/password only — slightly more realistic, more friction for demos.

### D3 — Middleware on admin pages except login
**Choice:** `middleware/admin.ts` applied via `definePageMeta({ middleware: 'admin' })` on all `/admin/**` except login; login uses `blank` layout.  
**Why:** FE.md pattern; no real refresh token in P2.  
**Alt:** Layout-level middleware only — harder to exclude login cleanly.

### D4 — `default` layout becomes admin chrome
**Choice:** Expand `layouts/default.vue` to sidebar + sticky top bar + content slot; admin pages use `layout: 'default'`.  
**Why:** FE.md names default as admin layout; already reserved in P1.  
**Alt:** New `admin.vue` layout — extra name vs docs.

### D5 — List + detail route shape per FE.md
**Choice:**
- Questions: `/admin/questions` (list + modal create/edit); optional `/admin/questions/[id]` only if needed — prefer modal-first per milestones
- Sections: `/admin/sections` index list + `/admin/sections/[id]` detail
- Tests: `/admin/tests` + `/admin/tests/[id]`
- Groups: `/admin/groups` + `/admin/groups/[id]` + `/admin/groups/[id]/results`
- Users: `/admin/users` (list + modal); detail optional
- Dashboard: `/admin`
- Login: `/admin/login`

Milestones omit some index routes but FE folder tree includes them — **include index list pages** for navigability.

### D6 — Sample fixture shared/extended from student sample where useful
**Choice:** `data/sample-admin.ts` with IDs aligned to student demo themes (English Proficiency Test, Budi, sections Listening/Grammar/Reading) so teacher mental model is consistent. Generate extra rows for pagination demos.  
**Why:** Coherent product story across P1/P2.  
**Alt:** Totally separate lorem data — more confusing in walkthrough.

### D7 — Drag via `vue-draggable-plus`
**Choice:** Add dependency; wrap in `DragList.vue` with handle slot (`ti-grip-vertical`). Disable/dim when section `randomize_questions` is true.  
**Why:** Spec’d in FE.md.  
**Alt:** Native HTML DnD — worse UX, more code.

### D8 — Client-side user code generation
**Choice:** On create user, generate something like `XXXX-XXXX` alphanumeric client-side; show in toast/list.  
**Why:** Milestones require sample code generation without backend.

### D9 — Save feedback via existing toast store
**Choice:** Local save/create/delete shows success toast; validation errors inline + toast.  
**Why:** Reuse P1 toast; no new notification system.

### D10 — Results under group, not global nav item alone
**Choice:** Sidebar “Results” can deep-link to first sample group results or a simple picker; primary path is group detail → Results. Nav item “Results” → `/admin/groups` with hint or `/admin/groups/{sample}/results`.  
**Why:** Milestones place results at `/admin/groups/[id]/results`. Prefer Results nav → list of groups with “View results” or direct sample group results for demo speed.

**Locked for P2:** Sidebar Results → `/admin/groups/sample-group-1/results` (or first group id in fixture) with page title showing group name; Groups nav remains full group management.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Scope explosion (full CRUD polish) | Stick to milestones pages; no export, no bulk ops, no rich text |
| Refresh loses admin session + data | README note; auth re-login; fixtures re-seed on store init |
| Drag library SSR issues | Client-only component wrapper / dynamic import if needed |
| Middleware flash on SSR | Auth is memory-only — on full SSR request, user appears logged out; use client-side middleware or accept login redirect on hard refresh of /admin. Prefer `middleware` that only runs when pinia has state; document hard-refresh → login |
| Confusing student vs admin | Clear `/admin` prefix; no shared confusing routes |
| Weight validation edge cases | Inline error if PERCENTAGE and weights ≠ 100; block save toast error |

## Migration Plan

- No production data migration.
- Add `vue-draggable-plus` to package.json.
- Rollback: remove `pages/admin`, revert `default` layout, remove middleware/auth/admin store.
- Phase 5: replace admin store methods with `useAdminApi`; auth store gets real login/refresh.

## Open Questions

- None blocking. Optional: sections/tests index “create” can navigate to new id generated client-side (`sample-section-new-1`) vs modal-only create — **prefer create generates id and navigates to detail** for sections/tests/groups; questions/users stay modal-on-list.
