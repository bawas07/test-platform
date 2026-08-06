# [PROJECT NAME] — Frontend Spec

## Stack

| Layer | Choice |
|---|---|
| Framework | Nuxt 3 (Vue 3, Composition API) |
| Deployment | Vercel (Nitro preset) |
| State management | Pinia |
| HTTP client | `$fetch` (Nuxt built-in, wraps ofetch) |
| Styling | Tailwind CSS v3 + CSS custom properties (design tokens) |
| Icons | Tabler Icons webfont |
| Font | Plus Jakarta Sans (Google Fonts) |
| PDF (certificate) | `html2pdf.js` (client-side, print from styled page) |
| Form validation | `vee-validate` + `zod` |
| Drag and drop (admin) | `vue-draggable-plus` |
| Audio | Native HTML5 `<audio>` element (no external lib needed) |

---

## Nuxt config notes

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/tokens.css', '~/assets/css/global.css'],
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      appName: '[PROJECT NAME]'
    }
  }
})
```

---

## Folder structure

```
assets/
  css/
    tokens.css        ← CSS custom properties (all design tokens)
    global.css        ← base resets, body font, scrollbar
components/
  ui/
    AppButton.vue
    AppInput.vue
    AppBadge.vue
    AppCard.vue
    AppModal.vue
    AppToast.vue
  test/
    TimerDisplay.vue
    AudioPlayer.vue
    AnswerOption.vue
    StrikeWarningBanner.vue
    SectionProgressBar.vue
    QuestionCard.vue
  admin/
    SidebarNav.vue
    DataTable.vue
    DragList.vue
    ScoreMapEditor.vue
    ResultsTable.vue
  certificate/
    CertificateView.vue
layouts/
  default.vue          ← admin layout (sidebar + topbar)
  student.vue          ← student layout (centered, minimal)
  blank.vue            ← certificate, login (no nav)
pages/
  index.vue                          ← code entry
  start.vue                          ← student info confirm
  test/
    [attemptId]/
      index.vue                      ← test runner
      section-done.vue               ← section time's up
      complete.vue                   ← test complete
  certificate/
    [attemptId].vue                  ← certificate view
  admin/
    login.vue
    index.vue                        ← dashboard
    questions/
      index.vue
      [id].vue
    sections/
      index.vue
      [id].vue
    tests/
      index.vue
      [id].vue
    groups/
      index.vue
      [id].vue
      [id]/results.vue
    users/
      index.vue
      [id].vue
stores/
  auth.ts              ← admin access token (memory only), admin info
  test.ts              ← current attempt state, section state, answers
middleware/
  admin.ts             ← redirect to /admin/login if no access token in store
composables/
  useTimer.ts          ← client-side countdown from server ends_at
  useFullscreen.ts     ← fullscreen request + exit detection
  useTabSwitch.ts      ← visibility change + window blur detection
  useAudio.ts          ← single-play audio control
  useTestApi.ts        ← all student-facing API calls
  useAdminApi.ts       ← all admin API calls
```

---

## Pinia stores

### `stores/auth.ts`
```typescript
export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)  // memory only, NOT persisted
  const admin = ref<{ id: string; email: string } | null>(null)

  const isLoggedIn = computed(() => !!accessToken.value)

  async function login(email: string, password: string) { ... }
  async function logout() { ... }
  async function refresh() { ... }  // called automatically by useAdminApi on 401

  return { accessToken, admin, isLoggedIn, login, logout, refresh }
})
```

### `stores/test.ts`
```typescript
export const useTestStore = defineStore('test', () => {
  const attempt = ref<Attempt | null>(null)
  const currentSection = ref<SectionAttempt | null>(null)
  const questions = ref<Question[]>([])
  const answers = ref<Record<string, string>>({})  // questionId → selectedOptionId
  const audioPlayed = ref<Set<string>>(new Set())   // questionId set
  const strikeCount = ref(0)

  async function loadState(attemptId: string) { ... }
  async function submitAnswer(questionId: string, optionId: string) { ... }
  async function markAudioPlayed(questionId: string) { ... }
  async function reportTabSwitch() { ... }
  async function submitSection() { ... }

  return { attempt, currentSection, questions, answers, audioPlayed, strikeCount, loadState, submitAnswer, markAudioPlayed, reportTabSwitch, submitSection }
})
```

---

## Key composables

### `useTimer.ts`
Derives a client-side countdown from the server-provided `ends_at` timestamp. Never used to close the section — only for display. Section is actually closed by the server on the next API call.

```typescript
export function useTimer(endsAt: Ref<string | null>) {
  const secondsLeft = ref(0)
  const urgency = computed(() => {
    if (secondsLeft.value > 60) return 'safe'
    if (secondsLeft.value > 30) return 'warning'
    return 'danger'
  })

  let interval: ReturnType<typeof setInterval>

  watch(endsAt, (val) => {
    clearInterval(interval)
    if (!val) return
    interval = setInterval(() => {
      secondsLeft.value = Math.max(0, Math.floor((new Date(val).getTime() - Date.now()) / 1000))
    }, 500)
  }, { immediate: true })

  onUnmounted(() => clearInterval(interval))

  return { secondsLeft, urgency }
}
```

### `useFullscreen.ts`
```typescript
export function useFullscreen() {
  async function enter() {
    await document.documentElement.requestFullscreen()
  }
  function onExit(cb: () => void) {
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) cb()
    })
  }
  return { enter, onExit }
}
```

### `useTabSwitch.ts`
Detects tab/window focus loss. Fires immediately on any blur or `visibilitychange` to hidden — no debounce.

```typescript
export function useTabSwitch(onSwitch: () => void) {
  function handleVisibility() {
    if (document.visibilityState === 'hidden') onSwitch()
  }
  function handleBlur() {
    onSwitch()
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleBlur)
  })
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibility)
    window.removeEventListener('blur', handleBlur)
  })
}
```

### `useAudio.ts`
```typescript
export function useAudio(audioUrl: Ref<string | null>, alreadyPlayed: Ref<boolean>) {
  const state = ref<'idle' | 'playing' | 'done'>(alreadyPlayed.value ? 'done' : 'idle')
  let audio: HTMLAudioElement | null = null

  async function play(onPlayStart: () => Promise<void>) {
    if (state.value !== 'idle') return
    await onPlayStart()  // mark as played server-side first
    state.value = 'playing'
    audio = new Audio(audioUrl.value!)
    audio.play()
    audio.onended = () => { state.value = 'done' }
  }

  return { state, play }
}
```

---

## Page wireframes

### `/` — Code entry

```
┌─────────────────────────────────────┐
│          [Project Logo / Name]      │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  Enter your test code       │   │
│   │  [________________________] │   │
│   │                             │   │
│   │  [    Start Test     ]      │   │
│   └─────────────────────────────┘   │
│                                     │
│   Error state: "Invalid or          │
│   expired code" in danger color     │
└─────────────────────────────────────┘

Layout: blank layout, vertically + horizontally centered card
Card: max-width 400px
```

---

### `/start` — Student info confirm

```
┌──────────────────────────────────────┐
│         [Project Logo / Name]        │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Hello, [Student Name]         │  │
│  │                                │  │
│  │  Test:    [Test Name]          │  │
│  │  Group:   [Group Name]         │  │
│  │  Starts:  [start_time]         │  │
│  │  Ends:    [end_time]           │  │
│  │  Sections: 3                   │  │
│  │                                │  │
│  │  ⚠ Once started, the test      │  │
│  │  must be completed in one      │  │
│  │  sitting per section.          │  │
│  │                                │  │
│  │  [       Start Test       ]    │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘

Layout: blank layout, centered card, max-width 480px
```

---

### `/test/[attemptId]` — Test runner (most critical page)

```
┌──────────────────────────────────────────────────────┐
│ STICKY TOP BAR                                        │
│ [Logo]  Section 2 of 3: Listening   [⏱ 18:42]       │
│ Progress: [✓ Done] [● Active] [○ Next]                │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [Strike warning banner — shown on 1st strike]       │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ Question 3 of 10                             │   │
│  │                                              │   │
│  │ [Audio player — if listening question]       │   │
│  │ ┌──────────────────────────────────────┐    │   │
│  │ │ ▶ Play audio          [idle state]  │    │   │
│  │ └──────────────────────────────────────┘    │   │
│  │                                              │   │
│  │ What is the main topic of the passage?       │   │
│  │                                              │   │
│  │ ┌──────────────────────────────────────┐    │   │
│  │ │ A  Climate change effects            │    │   │
│  │ └──────────────────────────────────────┘    │   │
│  │ ┌──────────────────────────────────────┐    │   │
│  │ │ B  Economic growth trends  [selected]│    │   │
│  │ └──────────────────────────────────────┘    │   │
│  │ ┌──────────────────────────────────────┐    │   │
│  │ │ C  Political history                 │    │   │
│  │ └──────────────────────────────────────┘    │   │
│  │ ┌──────────────────────────────────────┐    │   │
│  │ │ D  Cultural traditions               │    │   │
│  │ └──────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│              [← Prev]          [Next →]              │
└──────────────────────────────────────────────────────┘

Notes:
- Top bar is sticky (position: sticky, top: 0)
- Timer color transitions: safe → warning → danger (pulse at <30s)
- Prev/Next only navigate within the section's question list
- Selecting an option immediately calls the answer API (no separate "confirm" step)
- Full-screen enforced on this route only
- Tab-switch detection active on this route only
```

---

### `/test/[attemptId]/section-done` — Section time's up / force closed

```
┌──────────────────────────────────┐
│                                  │
│        ⏱ Time's up              │
│                                  │
│  Section "Listening" has ended.  │
│  Your answers have been saved.   │
│                                  │
│  [  Continue to next section  ]  │
│                                  │
│  — or —                          │
│                                  │
│  "You've completed all sections" │
│  (if last section)               │
│  [  View results  ]              │
└──────────────────────────────────┘

Layout: centered, no timer, no fullscreen enforcement
```

---

### `/test/[attemptId]/complete` — Test complete

```
┌──────────────────────────────────┐
│                                  │
│   ✓  Test complete               │
│                                  │
│   Thank you, [Student Name].     │
│   Your responses have been       │
│   recorded.                      │
│                                  │
│   Your certificate will be       │
│   available in [N] hours.        │
│                                  │
│   [  Check certificate  ]        │
│   (button disabled until ready)  │
└──────────────────────────────────┘
```

---

### `/certificate/[attemptId]` — Certificate

```
┌─────────────────────────────────────────┐  ← A4 portrait, print-safe
│  ████████████████████████████████████  │  ← teal top border (8px)
│                                         │
│            [PROJECT NAME]               │
│                                         │
│         This certifies that             │
│                                         │
│           BUDI SANTOSO                  │  ← --text-2xl, teal dark
│                                         │
│             has completed               │
│                                         │
│         English Proficiency Test        │  ← --text-lg
│                                         │
│           on 5 August 2026              │  ← --text-sm, muted
│                                         │
│              Score: 87                  │  ← --text-xl, teal
│                                         │
│  ─────────────────────────────────────  │
│  Issued by: [Teacher Name]              │
│  Generated: [timestamp]                 │
│                                         │
│              [ Download PDF ]           │
└─────────────────────────────────────────┘
```

---

### Admin pages — general layout

```
┌────────────────────────────────────────────────────┐
│ TOP BAR                                            │
│ [PROJECT NAME]                    [Admin email] ▾  │
├──────────┬─────────────────────────────────────────┤
│ SIDEBAR  │  PAGE CONTENT                           │
│          │  ┌──────────────────────────────────┐   │
│ Dashboard│  │ [Page title]       [+ Add button]│   │
│ Questions│  ├──────────────────────────────────┤   │
│ Sections │  │ [Search / filter bar]            │   │
│ Tests    │  ├──────────────────────────────────┤   │
│ Groups   │  │ [Data table or list]             │   │
│ Students │  │                                  │   │
│          │  │                                  │   │
│          │  │ [Pagination]                     │   │
│          │  └──────────────────────────────────┘   │
└──────────┴─────────────────────────────────────────┘
```

---

### Admin — Section detail (`/admin/sections/[id]`)

Sections have two identifiers: `sectionKey` (unique admin-facing key, e.g. `"listening-toefl"` or `"listening-ielts"`) and `displayName` (student-visible label like `"Listening"`). This allows two sections to share the same student-facing name while remaining distinct in the admin UI.

Contains the drag-and-drop question reorder UI + score map editor.

```
┌─────────────────────────────────────────────────────┐
│  Section: Listening Part 1     [Save] [Delete]       │
├─────────────────────────────────────────────────────┤
│  Name: [___________]   Time limit: [__] min          │
│  Max score: [__]   Randomize: [Toggle]               │
├─────────────────────────────────────────────────────┤
│  Questions                        [+ Add question]   │
│  (drag-and-drop disabled/dimmed when randomize=on)   │
│  ┌──────────────────────────────────────────────┐   │
│  │ ⠿  1.  What is the speaker discussing?  [×] │   │
│  │ ⠿  2.  Which option best describes...   [×] │   │
│  │ ⠿  3.  The word "adjacent" means...    [×] │   │
│  └──────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  Score conversion table (optional — for TOEFL/IELTS) │
│  [+ Add row]                                         │
│  ┌──────────────┬──────────────┐                     │
│  │ Correct ans  │ Scaled score │                     │
│  ├──────────────┼──────────────┤                     │
│  │ 0            │ 0            │                     │
│  │ 1            │ 3            │                     │
│  │ 2            │ 6            │                     │
│  │ ...          │ ...          │                     │
│  └──────────────┴──────────────┘                     │
└─────────────────────────────────────────────────────┘
```

---

## Reusable components spec

### `AppButton.vue`
Props: `variant` (primary|secondary|danger|ghost), `size` (sm|md|lg), `loading` (bool), `disabled` (bool)
Emits: `click`

### `AppInput.vue`
Props: `label`, `placeholder`, `error`, `helper`, `type`, `disabled`
Uses `v-model`.

### `AppBadge.vue`
Props: `variant` (success|warning|danger|neutral|primary), `label`

### `AppCard.vue`
Slot-based. Props: `padding` (sm|md|lg — default md)

### `AppModal.vue`
Props: `modelValue` (bool — v-model), `title`, `size` (sm|md|lg)
Slots: default (body), `footer`
Emits: `update:modelValue`
Backdrop click closes modal.

### `AppToast.vue`
Global toast via Pinia toast store. Auto-dismiss after 4s.
Variants: success, warning, danger, info.

### `TimerDisplay.vue`
Props: `endsAt` (ISO string)
Internally uses `useTimer` composable.
Displays `MM:SS`, color transitions per urgency, pulse animation at danger.

### `AudioPlayer.vue`
Props: `audioUrl` (string), `questionId` (string), `alreadyPlayed` (bool)
Emits: `played`
Internally uses `useAudio` composable.
Three visual states: idle / playing / done.

### `AnswerOption.vue`
Props: `label` (A/B/C/D), `text` (string), `selected` (bool), `disabled` (bool)
Emits: `select`

### `StrikeWarningBanner.vue`
Props: `strikeCount` (1|2)
Renders warning (yellow) on strike 1, danger (red) on strike 2.
Auto-hides after 5s on strike 1; stays visible on strike 2 until section advances.

### `SectionProgressBar.vue`
Props: `sections` (array of `{ displayName, status }`)
Renders a horizontal pill list — not clickable, purely display.

### `DragList.vue`
Wraps `vue-draggable-plus`. Props: `items` (array), `itemKey` (string).
Emits: `reorder` with new ordered array.
Exposes drag handle slot.

### `ScoreMapEditor.vue`
Props: `rows` (array of `{ raw_score, scaled_score }`), `maxRaw` (total question count)
Emits: `update` with updated rows array.
Inline editable table, add/delete rows.

### `DataTable.vue`
Props: `columns` (array of `{ key, label, sortable? }`), `rows`, `loading`, `pagination`
Emits: `sort`, `page`
Slot per column for custom cell rendering.

---

## Route middleware

### `middleware/admin.ts`
Applied to all `/admin/*` routes (except `/admin/login`).
Checks `useAuthStore().isLoggedIn`. If false, redirects to `/admin/login`.
On page load, if token exists in store but is expired, calls `refresh()` silently before allowing navigation.

---

## Full-screen + proctoring (test runner page only)

```typescript
// pages/test/[attemptId]/index.vue — onMounted
const { enter, onExit } = useFullscreen()
const { reportTabSwitch, strikeCount } = useTestStore()

await enter()

onExit(async () => {
  // user escaped fullscreen — treat same as tab switch
  await handleTabSwitch()
  await enter()  // immediately re-enter fullscreen
})

useTabSwitch(async () => {
  await handleTabSwitch()
})

async function handleTabSwitch() {
  const result = await reportTabSwitch()
  if (result.code === 'S_STRIKE_SECTION_CLOSED') {
    // navigate to section-done
    navigateTo(`/test/${attemptId}/section-done`)
  }
  // S_STRIKE_WARNING: banner is shown via strikeCount in store
}
```

---

## Error handling

Global `$fetch` wrapper in `useAdminApi.ts` and `useTestApi.ts`:
- On `401`: attempt token refresh once, retry original request. If refresh also fails, clear store and redirect to login.
- On `S_SECTION_TIME_UP` / `S_GROUP_TIME_UP` in any test API response: immediately navigate to `/test/[attemptId]/section-done` regardless of which API call triggered it.
- On network error: show AppToast with retry option for admin pages; show inline error message on test runner (don't interrupt the test with a toast).

---

## Environment variables (client-visible)

```env
NUXT_PUBLIC_APP_NAME=[PROJECT NAME]
```

All other env vars (Supabase keys, JWT secret) are server-only and never exposed to the client.
