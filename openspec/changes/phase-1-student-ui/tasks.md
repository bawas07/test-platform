## 1. Project scaffold

- [x] 1.1 Initialize Nuxt 3 at repo root with TypeScript, SSR, and Vercel-oriented Nitro config
- [x] 1.2 Add dependencies: `nuxt`, `vue`, `pinia`, `@pinia/nuxt`, `@nuxtjs/tailwindcss`, `html2pdf.js`
- [x] 1.3 Configure `nuxt.config.ts`: Pinia + Tailwind modules, tokens/global CSS, Google Fonts + Tabler Icons head links, `runtimeConfig.public.appName` = "Test Platform"
- [x] 1.4 Create `assets/css/tokens.css` (Laut Siang tokens, spacing, radius, shadow, timer keyframes) and `assets/css/global.css` (base body styles)
- [x] 1.5 Create `app.vue` and layouts: `blank.vue`, `student.vue`, `default.vue` (passthrough shell only)
- [x] 1.6 Create folder placeholders (`components/ui`, `components/test`, `components/certificate`, `stores`, `composables`, `types`, `server/tools/.gitkeep`) and Nuxt `.gitignore`
- [x] 1.7 Add `public/audio/sample.mp3` and minimal root `README.md` with install/dev commands
- [x] 1.8 Verify `npm install && npm run dev` serves with correct font and page background

## 2. Design system components

- [x] 2.1 Implement `components/ui/AppButton.vue` (variants, sizes, loading, disabled)
- [x] 2.2 Implement `components/ui/AppInput.vue` (v-model, label, helper, error, disabled)
- [x] 2.3 Implement `components/ui/AppBadge.vue` and `components/ui/AppCard.vue`
- [x] 2.4 Implement `components/ui/AppModal.vue` (v-model, title, size, footer slot, backdrop close)
- [x] 2.5 Implement `stores/toast.ts` and `components/ui/AppToast.vue` (variants, ~4s auto-dismiss); mount toast host in `app.vue` or layouts
- [x] 2.6 Smoke-check all primitives visually (optional dev-only page behind `import.meta.dev`, remove or keep gated before sign-off)

## 3. Sample data and test store

- [x] 3.1 Add `types/test.ts` for Attempt, SectionAttempt, Question, option, and section progress status types
- [x] 3.2 Define sample fixture: student Budi Santoso, English Proficiency Test, 3 sections, ~4 questions each, ≥1 audio question, valid code `DEMO2026`, attempt id `sample-attempt-1`, certificate score 87
- [x] 3.3 Implement `stores/test.ts` state + methods: `verifyCode`, `startTest`, `selectAnswer`, `markAudioPlayed`, `applyStrike`/`reportTabSwitch`, `submitSection`, `advanceSection`, certificate loader — all async-shaped, local mutation only
- [x] 3.4 On section start, set `endsAt` to now + 5 minutes; track answers map, audioPlayed set, strikeCount per section rules

## 4. Composables

- [x] 4.1 Implement `composables/useTimer.ts` (countdown from `endsAt`, urgency safe/warning/danger)
- [x] 4.2 Implement `composables/useFullscreen.ts` (enter + exit detection callback)
- [x] 4.3 Implement `composables/useTabSwitch.ts` (visibility hidden + window blur, no debounce)
- [x] 4.4 Implement `composables/useAudio.ts` (idle → playing → done, block replay)

## 5. Test and certificate components

- [x] 5.1 Implement `TimerDisplay.vue` (MM:SS, tabular-nums, danger pulse)
- [x] 5.2 Implement `AudioPlayer.vue` and `AnswerOption.vue` per design states
- [x] 5.3 Implement `QuestionCard.vue` (question index, optional audio, options list)
- [x] 5.4 Implement `StrikeWarningBanner.vue` and `SectionProgressBar.vue`
- [x] 5.5 Implement `DemoStrikeFab.vue` (labeled Demo; emit/set strike 1 and 2)
- [x] 5.6 Implement `components/certificate/CertificateView.vue` (name, test, date, score, teal top border)

## 6. Student pages

- [x] 6.1 Build `pages/index.vue` — code entry, valid/invalid handling, navigate to `/start`
- [x] 6.2 Build `pages/start.vue` — confirm info, warning copy, start test, guard redirect to `/`
- [x] 6.3 Build `pages/test/[attemptId]/index.vue` — attempt guard, fullscreen gate, sticky top bar, question UI, prev/next, proctoring wiring, Demo FAB, timer expiry → section-done
- [x] 6.4 Build `pages/test/[attemptId]/section-done.vue` — variants time_up/strike/manual; continue next section or complete
- [x] 6.5 Build `pages/test/[attemptId]/complete.vue` — thank-you + certificate CTA enabled for sample
- [x] 6.6 Build `pages/certificate/[attemptId].vue` — CertificateView + client-only `html2pdf.js` download

## 7. Polish and sign-off prep

- [x] 7.1 Ensure guards/redirects consistent; no `/admin` routes; no server secrets
- [x] 7.2 Responsive pass on student pages (~375px+); sentence case labels; tokens/icons per design
- [x] 7.3 Remove or dev-gate any temporary UI workshop pages
- [x] 7.4 Update README with demo code `DEMO2026`, walkthrough (invalid code, strikes via FAB, certificate PDF), and refresh-resets-state note
- [x] 7.5 Run full teacher walkthrough end-to-end without console errors
