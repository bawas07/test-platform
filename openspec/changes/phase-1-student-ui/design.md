## Context

Greenfield repo: product docs live under `docs/` (PRD, milestones, FE/BE/design/flow). No application code yet. Phase 1 is UI-first — the teacher must walk the full student path with hardcoded data before DB or API work.

Stakeholders: indie teacher (sign-off), implementer. Constraints from docs: Nuxt 3 + Pinia + Tailwind + Laut Siang tokens, Plus Jakarta Sans, Tabler Icons, `html2pdf.js`, no email/auth for students.

## Goals / Non-Goals

**Goals:**
- Runnable Nuxt app demonstrating the complete student journey
- Design tokens and UI primitives reusable in Phase 2 admin
- Sample Pinia store with async-shaped methods so Phase 5 can swap in real APIs
- Demoable integrity UX (fullscreen gate, strikes, one-play audio, timer urgency)
- Teacher sign-off freeze on student UI scope

**Non-Goals:**
- Admin pages, auth store, admin middleware
- Real HTTP APIs, Supabase, JWT, server routes beyond empty `server/tools/` placeholder
- Persistence of attempt across browser refresh
- Server-authoritative timer enforcement
- `vee-validate` / `zod` / `vue-draggable-plus` (later phases)

## Decisions

### D1 — Sample state only in Pinia test store
**Choice:** All student domain state and “API” behavior live in `stores/test.ts` (+ optional `types/test.ts` / fixture module). Methods are `async` and mutate local state.  
**Why:** Single swap point in Phase 5; pages stay thin.  
**Alt:** Composables calling fake handlers scattered in pages — harder to replace consistently.

### D2 — Valid demo code `DEMO2026`; attempt id `sample-attempt-1`
**Choice:** Fixed fixture identity for predictable walkthrough and README.  
**Why:** Teacher demos and QA scripts need a stable code.  
**Alt:** Accept any non-empty code — weaker invalid-state demo.

### D3 — Fullscreen gate button (not auto-enter on mount)
**Choice:** Runner shows “Enter fullscreen to begin”; user gesture calls `requestFullscreen`, then reveals test UI. Exit → strike + re-enter attempt.  
**Why:** Browsers block fullscreen without gesture; gate matches real exam friction better than silent failure.  
**Alt:** Soft-fail banner — weaker integrity demo.

### D4 — Dev Demo FAB for strikes (always visible in P1 builds)
**Choice:** Fixed FAB on runner (post-gate): Strike 1 / Strike 2. Real `useTabSwitch` + fullscreen exit also increment strikes.  
**Why:** Reliable teacher walkthrough (devtools blur is noisy). Remove or dev-gate in a later phase if needed.  
**Alt:** Keyboard-only or real blur only — awkward on shared screen.

### D5 — Timer display-only close in P1
**Choice:** `endsAt = now + 5 minutes` when a section starts locally; at 0s UI may navigate to section-done (`time_up`). Not authoritative.  
**Why:** Matches milestones demo; real enforcement is server-side in P4+.  
**Alt:** No auto-navigate — teacher must use FAB/submit only.

### D6 — Certificate immediately available in sample
**Choice:** Complete page enables certificate CTA; sample score `87` so PDF path is testable without waiting `certificate_delay_hours`. Copy may still mention delay for realism.  
**Why:** Sign-off must include PDF download.  
**Alt:** Disabled button until fake delay — blocks demo.

### D7 — Layout split: `blank` | `student` | `default` shell
**Choice:** `blank` for entry/start/done/cert; `student` for runner sticky chrome; `default` empty slot for future admin.  
**Why:** Per FE.md; avoids building admin nav in P1.  
**Alt:** Single layout with conditionals — messier.

### D8 — html2pdf via client-only dynamic import
**Choice:** Load `html2pdf.js` inside download click handler; target `CertificateView` root.  
**Why:** Avoids SSR breakage.  
**Alt:** Browser print only — less polished download UX.

### D9 — Stack installs limited to P1 needs
**Choice:** `nuxt`, `vue`, `@pinia/nuxt`, `@nuxtjs/tailwindcss`, `html2pdf.js`. Tabler + font via CDN in `nuxt.config` head.  
**Why:** YAGNI on admin/validation libs.  
**Alt:** Install full FE.md stack now — unused weight.

### D10 — Product name placeholder “Test Platform”
**Choice:** `NUXT_PUBLIC_APP_NAME` / package name `test-platform`.  
**Why:** Locked in planning; rename later via config.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Fullscreen API flaky / denied | Gate retry + clear error on gate card |
| `window.blur` fires when opening devtools | Document caveat; prefer FAB for controlled demo |
| Refresh loses mid-test state | Accept in P1; note in README (sessionStorage is YAGNI) |
| Scope creep into admin | Only `default` layout shell; no `/admin` routes |
| html2pdf visual drift vs screen | Good-enough A4 layout; polish in hardening if needed |
| Strike FAB ships to “prod” preview | Intentional for P1 sign-off; remove/gate later |

## Migration Plan

- N/A for production data (greenfield).
- Deploy: standard Nuxt/Vercel preview when ready; no env secrets required beyond public app name.
- Rollback: delete app artifacts or revert commit; docs-only history remains.
- Phase 5 migration path: replace store method bodies with `useTestApi` calls; keep method names/signatures where possible.

## Open Questions

- None blocking. Sample audio may be silent mp3 or short clip — either satisfies one-play UI states.
- Exact section/question copy can be lorem/exam-like as long as counts and audio mix meet demo needs (3 sections, ~4 questions each, ≥1 audio in section 1).
