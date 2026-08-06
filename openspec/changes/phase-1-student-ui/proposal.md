## Why

An indie teacher needs to experience the full student test journey in a browser before any backend or database exists. Building the student UI first with sample data is cheaper to revise than changing schema, API, and UI together, and produces a demonstrable product for sign-off.

## What Changes

- Greenfield **Nuxt 3** application (**Test Platform**) with Vercel preset, Pinia, Tailwind, and Laut Siang design tokens
- Shared **design-system** primitives (button, input, badge, card, modal, toast)
- Full **student journey** on hardcoded sample data: code entry → confirm → timed test runner → section done → complete → certificate PDF
- Client-only test integrity UI: fullscreen gate, tab-switch strikes, one-play audio, countdown timer
- Dev **Demo FAB** on the runner to trigger strike 1 / strike 2 for walkthroughs
- Empty admin `default` layout shell only (no admin pages)

## Capabilities

### New Capabilities
- `project-scaffold`: Nuxt 3 app shell, tokens, fonts/icons, Pinia, layouts (blank / student / default)
- `design-system`: Reusable UI primitives and global toast behavior per design tokens
- `student-test-flow`: Sample-data student journey from code entry through certificate download, including runner controls and integrity UI

### Modified Capabilities
- _(none — greenfield; `openspec/specs/` is empty)_

## Impact

- **Code**: New app at repo root (`app.vue`, `pages/`, `components/`, `stores/`, `composables/`, `layouts/`, `assets/`, `types/`); `docs/` unchanged except existing plan reference
- **Dependencies**: `nuxt`, `vue`, `@pinia/nuxt`, `@nuxtjs/tailwindcss`, `html2pdf.js` (no Supabase, zod, or admin drag libs in this change)
- **Systems**: None external — static UI only; no API, DB, or auth
- **Follow-on**: Phase 2 admin UI reuses design-system and scaffold; Phase 5 replaces sample store methods with real APIs
