# [PROJECT NAME] — Milestones

## Philosophy
UI-first, then wire it up. Each phase produces something demonstrable. No phase starts until the previous one is signed off. Sample data drives the UI in phases 1–2 so the teacher can see and feel the product before a single DB migration runs.

---

## Phase 1 — Student UI (static, sample data)
**Goal**: The teacher can open a browser and experience the full student journey end-to-end with hardcoded data. No backend, no database — just the UI working correctly.

**Deliverables**:

### 1.1 Project scaffold
- Nuxt 3 project initialised with Vercel preset
- Tailwind CSS configured with Laut Siang design tokens (`tokens.css`)
- Plus Jakarta Sans loaded via Google Fonts
- Tabler Icons loaded via CDN
- Pinia installed
- Folder structure set up (`pages/`, `components/`, `stores/`, `composables/`, `layouts/`, `server/tools/`)
- Blank, student, and default (admin) layouts created

### 1.2 Design system components
All reusable UI components built and verified in isolation before being used in pages:
- `AppButton` — all variants (primary, secondary, danger, ghost) + sizes + loading + disabled states
- `AppInput` — default, error, disabled states + label + helper text
- `AppBadge` — all variants
- `AppCard`
- `AppModal` — open/close, backdrop click, footer slot
- `AppToast` — success, warning, danger, info; auto-dismiss

### 1.3 Student pages (sample data)
All student-facing pages built with hardcoded sample data in the Pinia test store:

- **`/` — Code entry**: input + submit button; simulate valid/invalid code states
- **`/start` — Student info confirm**: show hardcoded student name, test name, group schedule, warnings
- **`/test/[attemptId]` — Test runner**:
  - Sticky top bar: logo, section name, progress pills, timer
  - `TimerDisplay` component — countdown from a hardcoded `ends_at` 5 minutes from now; color transitions at warning/danger thresholds; pulse at <30s
  - `AudioPlayer` component — idle → playing → done state transitions (sample audio or silent mp3); one-play-only enforced in local state
  - `QuestionCard` with `AnswerOption` list — select answer, highlight selected, immediate visual feedback
  - Prev/Next navigation within section questions
  - `StrikeWarningBanner` — manually triggerable via a dev toggle to demo warning (strike 1) and auto-submit (strike 2) states
  - Full-screen enforcement on page enter; re-enter on exit
  - Tab-switch detection wired to `StrikeWarningBanner` (local strike counter only — no API call yet)
  - `SectionProgressBar` — not_started / in_progress / completed / auto-closed states shown
- **`/test/[attemptId]/section-done`** — time's up / strike close / manual submit variants
- **`/test/[attemptId]/complete`** — test complete, certificate pending message
- **`/certificate/[attemptId]`** — styled certificate with sample name/score/date; Download PDF button wired via `html2pdf.js`

**Sign-off criteria**: Teacher reviews all student pages, confirms UX, flow, and visual design. No changes to student UI scope after this sign-off.

---

## Phase 2 — Admin UI (static, sample data)
**Goal**: The teacher can navigate the full admin interface with sample data. CRUD forms work visually but don't persist anything — submit just resets the form or updates local state.

**Deliverables**:

### 2.1 Admin layout + navigation
- Sidebar with all nav items (Questions, Sections, Tests, Groups, Students, Results)
- Top bar with admin email placeholder + logout button (no-op for now)
- Active route highlight in sidebar
- Admin route middleware (redirects to `/admin/login` — login page built but submit is a no-op for now)

### 2.2 Admin pages (sample data)

- **`/admin/login`** — email + password form; hardcoded "success" on any submit for demo purposes
- **`/admin` — Dashboard** — summary cards (total groups, active tests, students) with sample numbers; recent attempts list
- **`/admin/questions`** — paginated list of sample questions; create/edit modal with question text, options (add/remove option rows), correct answer flag, optional audio upload field (visual only)
- **`/admin/sections/[id]`** — section config form (name, time limit, max score, randomize toggle); `DragList` question reorder (functional drag-and-drop in local state, dimmed when randomize=on); `ScoreMapEditor` inline table (add/remove rows, edit values in local state)
- **`/admin/tests/[id]`** — test config form (name, scoring mode); assign sections with order; weight inputs shown/hidden based on scoring mode = PERCENTAGE; weight sum validation shown inline
- **`/admin/groups/[id]`** — group config form (name, test picker, start/end time, certificate delay); assign/remove users list
- **`/admin/users`** — paginated list; create user modal (name → generates a sample code client-side); certificate enabled toggle; group assignment
- **`/admin/groups/[id]/results`** — results table with sample attempt data; per-student section score breakdown; total score column

### 2.3 Remaining UI components
- `DragList` — fully functional drag-and-drop (local state only)
- `ScoreMapEditor` — fully functional inline table editor (local state only)
- `DataTable` — sortable columns, pagination controls, loading state, empty state
- `ResultsTable` — section score breakdown per student

**Sign-off criteria**: Teacher reviews admin UI, confirms all CRUD flows make sense, results display is clear, section score map entry is understandable. No changes to admin UI scope after this sign-off.

---

## Phase 3 — Database & Supabase setup
**Goal**: Schema live in Supabase, seed data inserted, ready for API layer to connect to.

**Deliverables**:

### 3.1 Supabase project setup
- Supabase project created (staging environment first)
- Environment variables configured in `.env` and Vercel project settings
- Service role key stored server-side only — never exposed to client

### 3.2 Migrations
- All 16 tables created via SQL migration files (one file per logical group):
  - `001_questions.sql` — `questions`, `question_options`
  - `002_sections.sql` — `sections`, `section_questions`, `section_score_maps`
  - `003_tests.sql` — `tests`, `test_sections`
  - `004_groups.sql` — `test_groups`, `users`, `test_group_users`
  - `005_attempts.sql` — `attempts`, `section_attempts`, `answers`, `audio_plays`
  - `006_admin.sql` — `admins`, `refresh_tokens`
- All indexes created
- All enums created (`scoring_mode`, `attempt_status`, `section_attempt_status`)

### 3.3 Seed data
- 1 admin account (teacher)
- 1 test with 2–3 sections (mix of randomized and fixed-order)
- 10–15 questions per section (mix of text-only and audio)
- 1 section with a score conversion table (TOEFL-style)
- 1 test group with `start_time` / `end_time` window
- 5–10 sample users with test codes

**Sign-off criteria**: All tables exist, seed data visible in Supabase table editor, migration files committed to repo.

---

## Phase 4 — Backend / API implementation
**Goal**: All server routes implemented and tested. UI still uses sample data at the start of this phase — routes are built and tested independently (via Postman / REST client) before the FE switches over.

**Deliverables**:

### 4.1 Server tools
- `server/tools/response.ts` — `ok()`, `paginated()`, `fail()` helpers
- `server/tools/jwt.ts` — sign + verify access token
- `server/tools/hash.ts` — bcrypt helpers
- `server/tools/scoring.ts` — section score + total score computation (all 4 modes + score map lookup)
- `server/tools/time.ts` — deadline validation (`checkDeadlines()`)
- `server/tools/storage.ts` — audio file abstraction (TBD provider, placeholder for now)
- `server/middleware/admin-auth.ts` — JWT validation middleware

### 4.2 Auth routes
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `POST /api/admin/refresh`

### 4.3 Admin CRUD routes
In build order (dependencies first):
1. Questions — `GET/POST /api/questions`, `GET/PUT/DELETE /api/questions/:id`
2. Sections — `GET/POST /api/sections`, `GET/PUT /api/sections/:id`, question assignment + reorder, score map upsert
3. Tests — `GET/POST /api/tests`, `GET/PUT/DELETE /api/tests/:id`, section assignment + weight + order
4. Groups — `GET/POST /api/groups`, `GET/PUT /api/groups/:id`, user assignment, results
5. Users — `GET/POST /api/users`, `GET/PUT /api/users/:id`

### 4.4 Student test flow routes
In strict order (each depends on the previous):
1. `POST /api/test/verify-code`
2. `POST /api/test/start`
3. `GET /api/test/:attemptId/state`
4. `POST /api/test/:attemptId/section/start`
5. `POST /api/test/:attemptId/section/answer`
6. `POST /api/test/:attemptId/section/audio-play`
7. `POST /api/test/:attemptId/tab-switch`
8. `POST /api/test/:attemptId/section/submit`
9. `GET /api/certificate/:attemptId`

### 4.5 Housekeeping cron
- `POST /api/internal/housekeeping` — sweep overdue section_attempts + attempts + expired refresh tokens
- Vercel Cron configured in `vercel.json` (daily schedule)

**Sign-off criteria**: All routes return correct responses and status codes for both success and error cases. Tested via Postman/REST client with seed data. Scoring engine verified against known expected values (manual check against teacher's Excel formula).

---

## Phase 5 — FE ↔ API integration
**Goal**: Replace all sample data in the UI with real API calls. Both student and admin flows work end-to-end against the live database.

**Deliverables**:

### 5.1 Server tools (FE side)
- `composables/useTestApi.ts` — all student API calls with time_up response interception
- `composables/useAdminApi.ts` — all admin API calls with 401 auto-refresh + retry

### 5.2 Auth integration
- Admin login / logout / token refresh wired to `stores/auth.ts`
- Admin route middleware active (redirects to login if no token)
- httpOnly refresh token cookie handled transparently

### 5.3 Student flow integration
Replace sample data in test store and pages with real API calls:
1. Code entry → `verify-code`
2. Start page → populated from verify-code response
3. Test runner → `start`, `state`, `section/start`, `answer`, `audio-play`, `tab-switch`, `section/submit`
4. `time_up` response interception → auto-navigate to section-done regardless of which call triggered it
5. Certificate page → `certificate/:attemptId`

### 5.4 Admin flow integration
Replace sample data in all admin pages with real API calls:
1. Question bank CRUD
2. Section management (including drag reorder → `reorder` API, score map → `scoremap` API)
3. Test management (section assignment, weight config)
4. Group management (scheduling, user assignment)
5. User management (create, certificate toggle)
6. Results view

### 5.5 Audio storage (TBD provider)
- Implement `server/tools/storage.ts` with chosen provider
- Admin question form: audio file upload wired to storage
- Test runner: audio URL served from storage, played via `AudioPlayer`

**Sign-off criteria**: Full end-to-end test run with real students (or teacher acting as student). At least one complete test attempt — code entry → all sections → certificate. Admin creates a test group from scratch and a student completes it.

---

## Phase 6 — Hardening & production deploy
**Goal**: Production-ready. Stable, observable, deployable with confidence.

**Deliverables**:

### 6.1 Validation
- `zod` schemas for all API request bodies
- Consistent `E_VALIDATION` responses with field-level error details

### 6.2 Edge cases
- Group not yet started / already ended states handled gracefully on code entry
- Attempt already completed — resume shows "test already done" not an error
- Admin tries to delete a section/question that's in use — clear error message
- Score map rows with gaps (missing raw_score values) — fallback to 0 or nearest, documented behaviour
- Certificate accessed before delay has passed — clear "not ready yet" message with expected time

### 6.3 Production environment
- Vercel production environment variables set
- Supabase production project created (separate from staging)
- Production migration run
- First admin account seeded via one-time script (not via UI — keep admin creation out of the UI for phase 1 security)
- Vercel Cron verified firing correctly in production logs

### 6.4 Basic observability
- Server-side `console.error` on all unexpected errors with enough context to debug (route, input shape, error message) — no sensitive data logged
- Vercel function logs monitored for first real test run

**Sign-off criteria**: Teacher runs a real test with real students. Certificate is issued. Admin can see results. Nothing explodes.

---

## Summary

| Phase | What | Depends on | Est. complexity |
|---|---|---|---|
| 1 | Student UI (static) | Nothing | Medium |
| 2 | Admin UI (static) | Phase 1 design system | Medium |
| 3 | DB schema + seed | Phase 2 sign-off | Low |
| 4 | API implementation | Phase 3 | High |
| 5 | FE ↔ API integration | Phase 4 | Medium |
| 6 | Hardening + production | Phase 5 | Low–Medium |

> Phases 1 and 2 can be presented to the teacher for sign-off before any backend work begins. This is intentional — cheaper to change a Tailwind class than a DB schema + API route + FE component all at once.
