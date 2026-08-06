# [PROJECT NAME] — PRD

## Problem
An indie teacher needs a way to run timed, proctored multiple-choice tests (including listening sections) for groups of students online, with results auto-scored and certificates issued automatically. Existing big-name platforms are overkill/expensive for a single indie teacher running small batches (tens of students). Needs to be cheap to run and simple to administer with no email dependency in phase 1.

## Goals
- Students can take a test entirely unauthenticated, using only a one-time test code issued by the admin.
- Tests run as a fixed sequence of timed sections; all students in the same group start/end within the same overall time window.
- Test integrity is enforced: full-screen lock, tab/window-switch detection with a 2-strike auto-submit per section, single-play audio for listening questions.
- A student can resume an in-progress section on a different device without losing progress or restarting the timer — the timer is absolute and server-tracked, not tied to a single device session.
- Scoring supports multiple modes (SUM, LOWEST_SECTION, HIGHEST_SECTION, PERCENTAGE) configured per test, with optional raw→scaled score conversion tables per section — suiting both simple quizzes and TOEFL/IELTS-style prediction tests with non-standard max scores and fixed question ordering.
- Certificates auto-generate after a configurable delay, containing student name, test data, and score. Admin can disable per-student. Certificate is a shareable URL, downloadable as PDF.
- Admin can fully author tests (sections, questions, answers), reuse sections/tests across multiple groups, and manage which students belong to which groups.

## Non-goals (Phase 1)
- No email functionality — codes are handed out by the admin manually.
- No retake logic in code — handled administratively (run a second group, disregard the lower score).
- No live/real-time proctoring (no webcam) — integrity enforced via full-screen + visibility-change detection only.
- No reuse-detection / token-theft security on refresh tokens — simple delete-and-reissue on rotation is sufficient for a single-admin app.
- No per-question custom point values — points split evenly within a section (flagged for revisit).
- No mobile native app (architecture is API-first, keeps this open for later).
- Single vs. multi-session admin login policy deferred (easy to add later as a `DELETE WHERE admin_id = ?` before insert on login).

## Target users / roles
- **Admin (Teacher)** — creates tests, sections, questions, test groups, and students; assigns students to groups; configures scoring mode, certificate delay, and per-student certificate eligibility; views results.
- **Student** — no account/login. Enters a test code, sees their info, starts the test, answers questions within timed sections, eventually receives a certificate (if enabled).

## Core features

### Test authoring
- Admin creates Tests made of reusable Sections, made of Questions with multiple-choice options and a correct-answer flag.
- Test ↔ Section is many-to-many; Section ↔ Question is many-to-many.
- Each Section has a time limit (minutes), a max score, and a `randomize_questions` flag.
  - `randomize_questions = true`: order is randomized per section attempt, locked server-side at section start, preserved on resume across devices.
  - `randomize_questions = false`: questions are served in the explicit order defined by admin via drag-and-drop reorder UI. Required for TOEFL/IELTS where question sequence is fixed.
- Questions are multiple-choice only; one flagged correct option per question.
- Some questions carry an audio file (listening questions) — one play only per attempt, ever, including across device switches. Enforced at DB level via unique constraint.
- Question order within a section is determined by creation order.

### Scoring configuration
- Each Test has a `scoring_mode`: `SUM`, `LOWEST_SECTION`, `HIGHEST_SECTION`, or `PERCENTAGE`.
  - `SUM`: total = sum of all section scores.
  - `LOWEST_SECTION` / `HIGHEST_SECTION`: total = min/max of section totals.
  - `PERCENTAGE`: total = Σ(section score × section weight). Weight is per Test–Section pairing (not on Section itself). Weights must sum to 100% per test.
- **Score conversion table** (optional per section): admin defines a raw→scaled score mapping (e.g. 23 correct → 27 scaled). If rows exist, the scoring engine uses them; otherwise falls back to evenly-split raw points. Replaces the teacher's current Excel VLOOKUP formula for TOEFL/IELTS-style scoring. No hardcoded test-type logic in code — fully configurable.

### Test group scheduling
- Admin creates a Test Group: a named instance of a Test with `start_time`, `end_time`, and `certificate_delay_hours`.
- Test Group → Test is many-to-one (one group uses exactly one test; a test can be reused by many groups).
- Test Group ↔ User is many-to-many.
- The group's `start_time`/`end_time` is a hard outer boundary — any API call after `end_time` closes the current section immediately and returns a "time's up" response.

### Student identity & access
- Admin creates Users, assigns them to Test Groups, each user gets a unique test code.
- Students enter the code only — no login, no password.
- Admin can disable certificate issuance per-student.

### Timed, proctored test-taking
- Fixed section order — no skipping, no going back.
- Full-screen enforced on test runner page; restored immediately if student exits.
- Any tab switch or window blur = immediate strike (no debounce). Counter resets each new section.
  - Strike 1: warning shown.
  - Strike 2: section auto-submitted with current answers.
- Section timer is an absolute server-side deadline (`started_at + time_limit`), set once on first section entry.
- Every API call (submit answer, play audio, fetch state) validates time server-side. If either the section deadline or group `end_time` has passed, section closes and response returns `time_up`.
- Device resume: student re-enters same code on a new device, gets their saved state (answers, locked question order, audio played flags) — timer unaffected.
- Daily housekeeping cron sweeps `in_progress` attempts past their deadline, force-closes them, and computes their score.

### Certificate generation
- Configurable delay (`certificate_delay_hours`) per Test Group before certificate becomes available.
- Shareable URL (`/certificate/[attemptId]`), downloadable as PDF client-side.
- Contains: student name, test name, date taken, score.
- Suppressed if admin has disabled certificate for that student.

## Data entities

| Entity | Description |
|---|---|
| `questions` | Multiple-choice question; optional audio URL for listening questions. Has `section_id` FK. |
| `question_options` | Answer choices per question; one flagged correct. |
| `sections` | Timed question group with max score and `randomize_questions` flag. |
| `section_score_maps` | Optional raw→scaled score conversion table per section (replaces Excel formula). |
| `tests` | Named test with a `scoring_mode`. |
| `test_sections` | Test↔Section join; carries `order` and optional `weight` (for PERCENTAGE mode). |
| `test_groups` | Scheduled test instance for a cohort — start/end time, certificate delay. |
| `users` | Student — name, unique test code, certificate-enabled flag. |
| `test_group_users` | TestGroup↔User join (many-to-many). |
| `attempts` | One student's full run through a Test Group — status, total score. |
| `section_attempts` | One student's run through one section — absolute deadline, locked question order, tab-switch count, status, score. |
| `answers` | Student's selected option per question in a section attempt. Upsertable. |
| `audio_plays` | Existence = audio played. Unique constraint enforces one-play-only at DB level. |
| `admins` | Teacher account — email, password hash. Separate from students. |
| `refresh_tokens` | Admin session — token hash, paired access token JTI, device/location (nullable), expiry. Delete-and-reissue on rotation. |

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Nuxt 3 (Vue) on Vercel | Vue-first preference; Nitro serverless fits "validate on each request, no persistent timer" design |
| Database | Supabase (Postgres) | Cheap, managed, portable — only Nuxt server routes touch Supabase (service role key) |
| Auth | Custom JWT + refresh token | No Supabase Auth dependency — cleaner code migration if DB is ever moved |
| Styling | Tailwind CSS + CSS custom properties | Design tokens via CSS vars, Tailwind for utility layout |
| Font | Plus Jakarta Sans | Geometric, modern, readable at all weights |
| Color palette | Laut Siang | Light teal-based, calm, focused — not "institutional" |
| Cron | Vercel Cron → `/api/internal/housekeeping` | Daily sweep; also manually triggerable |
| Audio storage | TBD (pluggable via storage abstraction layer) | Decision deferred |

## Out-of-scope / future
- Retake handling in-product.
- Per-question custom point weighting.
- Email-based code delivery / notifications.
- Webcam/live proctoring.
- Refresh token reuse-detection.
- Single vs. multi-session admin login.
- Mobile native app.
- Migration off Vercel/Supabase (architecture kept portable for this).
