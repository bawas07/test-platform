# Phase 1 — Student UI (static, sample data)

**Status:** Ready for implementation  
**Scope:** Medium  
**Depends on:** Nothing (greenfield)  
**Sign-off:** Teacher reviews all student pages; no student UI scope changes after sign-off

---

## Goal

The teacher can open a browser and experience the full student journey end-to-end with hardcoded data. No backend, no database — UI only.

---

## Decisions (locked)

| Item | Choice |
|---|---|
| Product name | **Test Platform** (`test-platform`) |
| App display name | `NUXT_PUBLIC_APP_NAME=Test Platform` |
| Strike demo | Dev FAB on test runner only (Strike 1 / Strike 2) |
| Fullscreen | Gate button — “Enter fullscreen to begin” before runner content |
| Admin in P1 | `layouts/default.vue` empty shell only — no admin pages/nav |
| Sample timer | `ends_at` = client now + 5 minutes on section “start” |
| Sample audio | Short clip or silent mp3 in `public/audio/sample.mp3` |

---

## Architecture

### Stack (from FE.md)

- Nuxt 3 + Vue 3 Composition API, SSR on
- Vercel Nitro preset
- Pinia (`@pinia/nuxt`)
- Tailwind CSS v3 + CSS custom properties (`tokens.css`)
- Plus Jakarta Sans (Google Fonts)
- Tabler Icons webfont (CDN)
- `html2pdf.js` for certificate download
- Native `<audio>` / `Audio()` — no audio lib

**Not installed in P1:** `vee-validate`, `zod`, `vue-draggable-plus`, Supabase client (P2+ / P3+)

### Layering

```
pages/          → route shells, wire store + composables
layouts/        → blank | student | default(shell)
components/ui/  → design-system primitives (no domain knowledge)
components/test/→ student-domain UI (timer, audio, questions, strikes)
components/certificate/ → CertificateView
stores/test.ts  → attempt state + sample fixtures + local mutations
stores/toast.ts → global toasts for AppToast
composables/    → useTimer, useFullscreen, useTabSwitch, useAudio
assets/css/     → tokens.css + global.css
public/audio/   → sample.mp3
```

**Rule:** Pages orchestrate; components stay presentational where possible. Sample-data “API” lives only in `stores/test.ts` (async functions that mutate local state and resolve — same signatures we’ll later swap for real calls in Phase 5).

### Student navigation (static)

```
/  →  /start  →  /test/:attemptId  ⇄  /test/:attemptId/section-done
                      ↓ (last section)
               /test/:attemptId/complete  →  /certificate/:attemptId
```

All transitions are client `navigateTo`. No middleware in P1 except what’s needed for layouts.

### Sample domain model (client-only types)

Colocate lightweight types in `types/test.ts` (or inline in the store if tiny). Shape mirrors future API payloads enough that Phase 5 is a swap, not a rewrite:

```
Attempt {
  id, status, studentName, testName, groupName,
  startTime, endTime, sectionCount,
  certificateDelayHours, certificateEnabled,
  certificateAvailableAt, totalScore?
  sections: SectionProgress[]  // name + status for progress bar
}

SectionAttempt {
  id, sectionId, name, status, endsAt,
  questionIndex (current UI index),
  order: string[]  // question ids
}

Question {
  id, text, audioUrl | null,
  options: { id, label, text }[]  // label A/B/C/D
}
```

### Sample fixture content

Hardcoded in `stores/test.ts` (or `data/sample-test.ts` imported by the store):

| Entity | Sample |
|---|---|
| Student | Budi Santoso |
| Test | English Proficiency Test |
| Group | Batch Agustus 2026 |
| Schedule | start/end as fixed ISO strings (display only on `/start`) |
| Sections | 3 — e.g. Listening, Grammar, Reading |
| Questions | ~4 per section (enough to demo prev/next); section 1 includes ≥1 audio question |
| Attempt id | fixed `sample-attempt-1` |
| Code | valid: `DEMO2026` · invalid: anything else |
| Certificate | score `87`, delay message “24 hours”, available immediately in demo (button enabled) so PDF can be tested |
| Timer | when entering a section locally, set `endsAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()` |

**Code entry simulation:** store method `verifyCode(code)` — if match, populate attempt preview + `navigateTo('/start')`; else set error string for the page.

**Start simulation:** `startTest()` sets attempt id/status, initializes section 0 as `in_progress` with fresh `endsAt`, loads questions, `navigateTo('/test/sample-attempt-1')`.

**Section flow (local):**
- Answers: `Record<questionId, optionId>` updated immediately on select
- Audio: `Set<questionId>` on play
- Strikes: `strikeCount` 0→1 shows banner; 2 → mark section `auto_closed`, go section-done
- Manual submit / next after last Q → mark section `completed`, go section-done
- Section-done “Continue” → next section or complete page
- Timer hitting 0 (display only): page may offer/auto navigate to section-done with variant `time_up` — **display-only close is OK in P1**; real authority is server in P4+

### Fullscreen + proctoring (runner only)

1. Runner mounts behind a **gate**: centered card “Enter fullscreen to begin” + primary button.
2. On click → `useFullscreen().enter()` then `gatePassed = true` and show runner UI.
3. `onExit` → treat as tab switch (`handleStrike`) then re-request fullscreen.
4. `useTabSwitch` → `handleStrike` while gate passed and section active.
5. `handleStrike`: increment local counter; at 2, finalize section as auto-closed and `navigateTo(.../section-done?reason=strike)`.
6. **Dev FAB** (fixed bottom-right, only on runner, only when gate passed): “Strike 1” sets count to 1; “Strike 2” sets to 2 and closes. Label clearly “Demo” so teacher knows it’s not production UI. Strip or hide behind `import.meta.dev` **or** keep always for static demo until P5 — **keep visible in all builds for Phase 1 sign-off** (teacher may review production build preview); remove/gate in a later phase.

### Certificate PDF

- Page uses `blank` layout; `CertificateView` is the printable root with A4-ish proportions.
- “Download PDF” calls `html2pdf.js` on the certificate element (client-only; dynamic import to avoid SSR issues).

### Toast

Minimal Pinia `toast` store + root-level `AppToast` host in `app.vue` or layouts. P1 usage optional (e.g. invalid edge cases); build component fully per design system for P2 reuse.

---

## File inventory

### Create

```
package.json
nuxt.config.ts
tsconfig.json
app.vue
assets/css/tokens.css
assets/css/global.css
public/audio/sample.mp3
types/test.ts
layouts/blank.vue
layouts/student.vue
layouts/default.vue
stores/test.ts
stores/toast.ts
composables/useTimer.ts
composables/useFullscreen.ts
composables/useTabSwitch.ts
composables/useAudio.ts
components/ui/AppButton.vue
components/ui/AppInput.vue
components/ui/AppBadge.vue
components/ui/AppCard.vue
components/ui/AppModal.vue
components/ui/AppToast.vue
components/test/TimerDisplay.vue
components/test/AudioPlayer.vue
components/test/AnswerOption.vue
components/test/QuestionCard.vue
components/test/StrikeWarningBanner.vue
components/test/SectionProgressBar.vue
components/test/DemoStrikeFab.vue
components/certificate/CertificateView.vue
pages/index.vue
pages/start.vue
pages/test/[attemptId]/index.vue
pages/test/[attemptId]/section-done.vue
pages/test/[attemptId]/complete.vue
pages/certificate/[attemptId].vue
```

### Optional / thin stubs (P1)

- `server/tools/.gitkeep` — folder reserved per milestones; no server logic
- `middleware/admin.ts` — **skip until P2** (no admin routes yet)
- `stores/auth.ts` — **skip until P2**

### Do not create in P1

- Any `/admin/**` pages
- `useTestApi` / `useAdminApi`
- Admin components (`SidebarNav`, `DataTable`, `DragList`, …)

---

## Design tokens & global CSS

`tokens.css` — copy Laut Siang tokens from `docs/design.md`:

- Surfaces, primary teal, text, semantic, borders, timer colors
- Spacing `--space-1` … `--space-12`
- Radius, shadows
- Typography scale as CSS variables
- `@keyframes timer-pulse`, `fade-in`

`global.css`:

- `body` font Plus Jakarta Sans, bg `--color-bg-page`, text `--color-text-primary`
- Box-sizing reset, basic scrollbar
- Utility hooks only if Tailwind mapping needs them

`tailwind.config` (via Nuxt module): extend colors/spacing to reference CSS variables where practical so components can use either tokens or Tailwind. Prefer CSS variables in component `style` / class values for brand colors to match design.md exactly.

`nuxt.config.ts`:

- `ssr: true`
- modules: `@pinia/nuxt`, `@nuxtjs/tailwindcss`
- css: tokens + global
- `app.head` links: Google Fonts preconnect + Plus Jakarta Sans + Tabler Icons CDN
- `runtimeConfig.public.appName: 'Test Platform'`
- nitro `preset: 'vercel'` (or compatibility date + vercel deployment defaults)

---

## Component contracts (implement exactly)

### UI primitives

| Component | Props | Behavior |
|---|---|---|
| `AppButton` | `variant`: primary\|secondary\|danger\|ghost; `size`: sm\|md\|lg; `loading`; `disabled` | emit `click`; heights 32/40/48; sentence case |
| `AppInput` | `label`, `placeholder`, `error`, `helper`, `type`, `disabled`; `v-model` | focus ring primary; error border/bg |
| `AppBadge` | `variant`: success\|warning\|danger\|neutral\|primary; `label` | pill |
| `AppCard` | `padding`: sm\|md\|lg | default slot |
| `AppModal` | `modelValue`, `title`, `size` | slots default + footer; backdrop click closes |
| `AppToast` | reads toast store | variants success/warning/danger/info; auto-dismiss 4s |

### Test components

| Component | Props / emits | Notes |
|---|---|---|
| `TimerDisplay` | `endsAt: string` | `useTimer`; MM:SS; tabular-nums; pulse if danger |
| `AudioPlayer` | `audioUrl`, `questionId`, `alreadyPlayed`; emit `played` | idle/playing/done per design |
| `AnswerOption` | `label`, `text`, `selected`, `disabled`; emit `select` | min-height 56px |
| `QuestionCard` | question + selection + audio flags | composes AudioPlayer + AnswerOptions; shows “Question N of M” |
| `StrikeWarningBanner` | `strikeCount: 1 \| 2` | auto-hide 5s on 1; sticky on 2 |
| `SectionProgressBar` | `sections: { name, status }[]` | statuses: not_started \| in_progress \| completed \| auto_closed |
| `DemoStrikeFab` | emit `strike` with 1\|2 | fixed, labeled Demo |

### Certificate

| Component | Props | Notes |
|---|---|---|
| `CertificateView` | studentName, testName, date, score, issuer? | teal top border; print-friendly |

### Layouts

| Layout | Use |
|---|---|
| `blank` | code entry, start, section-done, complete, certificate — centered minimal chrome |
| `student` | test runner — sticky top bar slot or default structure (logo, section, progress, timer) |
| `default` | empty `<slot />` shell for future admin |

Prefer: runner uses `student` layout with sticky top bar; gate + FAB + main question column inside page.

---

## Page specs

### `pages/index.vue` — Code entry (`blank`)

- Centered `AppCard` max-w 400px
- App name / logo text
- `AppInput` test code + primary `AppButton` “Start test”
- On submit → `testStore.verifyCode`
- Error: “Invalid or expired code” in danger color
- Valid → `/start`

### `pages/start.vue` — Confirm (`blank`)

- Guard: if no verified preview in store, redirect `/`
- Show student name, test, group, starts/ends, section count
- Warning copy per FE.md
- Primary “Start test” → `startTest()` → `/test/sample-attempt-1`

### `pages/test/[attemptId]/index.vue` — Runner (`student`)

- Guard: attempt must exist and match param (else `/`)
- **Gate** until fullscreen entered
- Sticky top: app name, “Section X of Y: {name}”, `SectionProgressBar`, `TimerDisplay`
- `StrikeWarningBanner` when strikeCount ≥ 1
- Current `QuestionCard`; prev/next within section
- Last question next / explicit submit → section submit → section-done
- Wire fullscreen exit + tab switch + Demo FAB
- Timer at 0 → navigate section-done `reason=time_up` (local)

### `pages/test/[attemptId]/section-done.vue` (`blank`)

- Variants via query or store flag: `time_up` | `strike` | `manual`
- Copy + “Continue to next section” or “View results” if last
- Continue → advance section in store + back to runner (reset gate for new section fullscreen)

### `pages/test/[attemptId]/complete.vue` (`blank`)

- Thank you + certificate delay message
- Link/button to certificate (enabled in sample)

### `pages/certificate/[attemptId].vue` (`blank`)

- `CertificateView` + Download PDF
- Sample data from store or fixture by attemptId

---

## Implementation sequence

Ordered for always-runnable checkpoints. Each task has acceptance criteria.

### Task 1 — Project scaffold

**Do:**
- `nuxi init` (or equivalent) in repo root alongside `docs/`
- Add deps: `nuxt`, `vue`, `pinia`, `@pinia/nuxt`, `@nuxtjs/tailwindcss`, `html2pdf.js`
- `nuxt.config.ts` as above
- `app.vue` with `<NuxtLayout><NuxtPage /></NuxtLayout>`
- `tokens.css` + `global.css` from design.md
- Three layouts (default = passthrough shell)
- `public/audio/sample.mp3`
- Folder placeholders: `components/ui`, `components/test`, `components/certificate`, `stores`, `composables`, `types`, `server/tools/.gitkeep`
- `.gitignore` for Nuxt (`.nuxt`, `.output`, `node_modules`, `.env`)
- README one-liner: how to `npm install && npm run dev`

**Accept:**
- `npm run dev` serves a blank page with correct font and page background color
- Tokens visible in devtools on `:root`

---

### Task 2 — UI primitives + toast store

**Do:** Build `AppButton`, `AppInput`, `AppBadge`, `AppCard`, `AppModal`, `AppToast` + `stores/toast.ts` per design.md / FE.md.

**Accept:**
- Temporary dev-only page **or** visual check via a short-lived `pages/_dev/ui.vue` (delete before sign-off **or** keep behind dev): all button variants/sizes, input states, badges, modal open/close, toast fire
- Prefer `_dev/ui` only if `import.meta.dev` — optional; manual check in Story-less setup is OK if each primitive is used by Task 4+ quickly
- No domain logic inside `components/ui`

---

### Task 3 — Types, sample data, test store

**Do:**
- `types/test.ts`
- Sample fixture (3 sections, mixed questions, valid code `DEMO2026`)
- `stores/test.ts` with:
  - state: attempt, currentSection, questions, answers, audioPlayed, strikeCount, verifiedPreview, ui flags
  - `verifyCode`, `startTest`, `selectAnswer`, `markAudioPlayed`, `reportTabSwitch` / `applyStrike`, `submitSection`, `advanceSection`, `loadCertificate`
  - all async-shaped (`async function` + local mutate) for future API swap

**Accept:**
- Store unit-smoked via a throwaway call in devtools or minimal test page: verify → start → answer → strike → submit section updates state correctly
- No `localStorage` persistence required in P1

---

### Task 4 — Composables

**Do:** `useTimer`, `useFullscreen`, `useTabSwitch`, `useAudio` exactly as FE.md behavior (adapt imports to project).

**Accept:**
- Timer counts down from a future ISO string; urgency transitions >60 / 30–60 / <30
- Fullscreen enter/exit callbacks work after user gesture
- Tab switch fires on `visibilitychange` hidden and `window` blur
- Audio one-shot: idle → playing → done; second play no-op

---

### Task 5 — Test + certificate components

**Do:** `TimerDisplay`, `AudioPlayer`, `AnswerOption`, `QuestionCard`, `StrikeWarningBanner`, `SectionProgressBar`, `DemoStrikeFab`, `CertificateView`.

**Accept:**
- Each matches design.md visual states
- `QuestionCard` renders audio block only when `audioUrl` set
- Certificate matches A4-oriented layout tokens

---

### Task 6 — Student pages (flow)

**Do in order:**
1. `pages/index.vue` + `pages/start.vue`
2. `pages/test/[attemptId]/index.vue` (gate, top bar, questions, nav, FAB, proctoring)
3. `section-done.vue` + `complete.vue`
4. `certificate/[attemptId].vue` + html2pdf download

**Accept (teacher walkthrough script):**
1. Open `/` → submit `WRONG` → see error
2. Submit `DEMO2026` → `/start` shows Budi + test info
3. Start test → fullscreen gate → enter → runner with timer ~5:00
4. Play audio once → locked; select answers; prev/next
5. Demo FAB Strike 1 → yellow banner; Strike 2 → section-done (strike copy)
6. Continue → next section; complete all → complete page → certificate → Download PDF works
7. Manual path: complete a section via Next on last question without strikes
8. (Optional) let timer hit 0 → time’s up variant

---

### Task 7 — Polish & Phase 1 sign-off prep

**Do:**
- Responsive check: usable down to ~375px width for student pages (single column)
- Empty/guard redirects consistent
- Remove or dev-guard any `_dev` pages
- Ensure no server secrets, no dead admin routes
- Quick pass: sentence case labels, tokens only (no random hex), Tabler icons where specified
- Document demo code + walkthrough in root `README.md`

**Accept:**
- Full walkthrough works on a clean `npm install && npm run dev`
- README lists demo code `DEMO2026` and strike FAB behavior
- Ready for teacher sign-off against milestones.md Phase 1 criteria

---

## Explicit non-goals (Phase 1)

- Admin UI, auth store, admin middleware
- Real HTTP APIs, Supabase, JWT
- Persisting attempt across refresh (refresh may reset sample state — acceptable; note in README)
- True server-authoritative timer close
- Email, retakes, webcam
- i18n
- Pixel-perfect print CSS beyond “good enough” html2pdf output

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Fullscreen blocked / flaky | Gate button (user gesture); on failure show error on gate and retry |
| Blur fires when opening devtools | Known demo caveat; use FAB for controlled strikes |
| html2pdf SSR crash | Client-only dynamic import in click handler |
| Sample state lost on refresh mid-test | README note; optional `sessionStorage` hydrate is YAGNI unless teacher asks |
| Scope creep into admin | default layout shell only; push back to P2 |
| Timer anxiety / 5 min too long for demo | 5 min per milestones; FAB + section submit avoid waiting |

---

## Traceability

| Deliverable (milestones.md) | Tasks |
|---|---|
| 1.1 Project scaffold | Task 1 |
| 1.2 Design system components | Task 2 |
| 1.3 Student pages + test components + sample store | Tasks 3–6 |
| Sign-off readiness | Task 7 |

| Spec | Used for |
|---|---|
| `docs/milestones.md` | Scope gate |
| `docs/FE.md` | Structure, composables, wireframes, contracts |
| `docs/design.md` | Tokens, component visuals, certificate |
| `docs/flow.md` | Navigation + student happy path / strike path |
| `docs/prd.md` | Product rules (strikes, one-play audio, code entry) — behavior simulated locally |

---

## Success criteria (phase exit)

- [ ] Teacher completes full student journey on sample data without console errors
- [ ] All visual states demoable: timer urgency, audio idle/playing/done, strikes 1 & 2, section-done variants, certificate PDF
- [ ] Design tokens + primitives reusable for Phase 2 admin UI
- [ ] No backend required
- [ ] Teacher sign-off recorded → freeze student UI scope
