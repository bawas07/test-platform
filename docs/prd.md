# Online Test Platform — PRD

## Problem
An indie teacher needs a way to run timed, proctored multiple-choice tests (including listening sections) for groups of students online, with results auto-scored and certificates issued automatically. Existing big-name platforms are overkill/expensive for a single indie teacher running small batches (tens of students). Needs to be cheap to run and simple to administer with no email dependency in phase 1.

## Goals
- Students can take a test entirely unauthenticated, using only a one-time test code issued by the admin.
- Tests run as a fixed sequence of timed sections; all students in the same group start/end within the same overall time window.
- Test integrity is enforced: full-screen lock, tab/window-switch detection with a 2-strike auto-submit per section, single-play audio for listening questions.
- A student can resume an in-progress section on a different device without losing progress or restarting the timer — the timer is absolute and server-tracked, not tied to a single device session.
- Scoring supports multiple modes (sum, lowest section, highest section, weighted percentage) configured per test, suiting both simple quizzes and TOEFL/IELTS-style prediction tests with non-standard max scores.
- Certificates auto-generate some configurable number of hours after test completion, containing name, test data, and score — admin can disable per-student.
- Admin can fully author tests (sections, questions, answers), reuse sections/tests across multiple groups, and manage which students belong to which groups.

## Non-goals
- No email functionality in phase 1 — codes are handed out by the admin manually.
- No retake logic in code — if a student needs a retake, that's handled administratively (e.g. run a second test group, manually disregard the lower score). Phase 1 has no concept of "attempt 2."
- No live/real-time proctoring (no webcam, no human monitor) — integrity is enforced via full-screen + visibility-change detection only.
- No reuse-detection / token-theft security on refresh tokens — simple delete-and-reissue on rotation is sufficient for a single-admin app.
- No per-question custom point values in phase 1 — points split evenly within a section (flagged as revisit-later).
- No mobile native app in phase 1 (architecture keeps this open for later, but not building it now).

## Target users / roles

- **Admin (Teacher)** — creates tests, sections, questions, test groups, and students; assigns students to groups; configures scoring mode, certificate delay, and per-student certificate eligibility; views results.
- **Student** — no account/login. Enters a test code, sees their info, starts the test, answers questions within timed sections, eventually receives a certificate (if enabled).

## Core features

### Test authoring
- **What**: Admin creates Tests, made of reusable Sections, made of Questions with multiple-choice options and a correct-answer flag.
- **Why**: Lets the same Section (e.g. "Listening Part 1") be reused across multiple Tests, and the same Test reused across multiple Groups (e.g. two time slots for the same English test).
- **Key requirements**:
  - Test ↔ Section relationship is many-to-many.
  - Each Section has a time limit (minutes) and a max score.
  - Questions are multiple-choice only; one flagged correct option per question.
  - Some questions carry an audio file (listening questions) that can only be played once per attempt, ever — including across a device switch (does not reset).
  - Question order is randomized per section attempt; order is locked at the moment the section starts (not re-shuffled on resume).
- **Open questions**: none outstanding.

### Scoring configuration
- **What**: Each Test has a `scoring_mode`: `SUM`, `LOWEST_SECTION`, `HIGHEST_SECTION`, or `PERCENTAGE` (weighted average).
- **Why**: Supports both simple quizzes (sum of everything) and standardized-test-style scoring (e.g. "your score is your weakest section" or a weighted blend across sections, where max score isn't always 100).
- **Key requirements**:
  - `SUM`: total = sum of all section scores.
  - `LOWEST_SECTION` / `HIGHEST_SECTION`: total = min/max of the section totals.
  - `PERCENTAGE`: total = Σ(section score × section weight), where weight is configured per Test–Section pairing (not on the Section itself, since the same Section can carry different weights in different Tests) and weights across a Test's sections sum to 100%.
  - Points within a Section are split evenly across its questions (max_score / question_count) — flagged for revisit once the teacher confirms whether custom per-question weighting is needed.

### Test group scheduling
- **What**: Admin creates a Test Group: a named instance of a Test with a `start_time`, `end_time`, and `certificate_delay_hours`.
- **Why**: Lets the same Test run at multiple time slots (e.g. two groups both running "English Test A" at 9am and 2pm) with independent schedules and independent rosters.
- **Key requirements**:
  - Test Group → Test is many-to-one (one group uses exactly one test; a test can be reused by many groups).
  - Test Group ↔ User (student) is many-to-many (a student can belong to multiple groups; a group has multiple students).
  - The group's `start_time`/`end_time` is a hard outer boundary — even if a student has time left on a section's own clock, the test is force-closed (returns a "time's up" response) the moment any API call lands after `end_time`.

### Student identity & access
- **What**: Admin creates Users and assigns them to one or more Test Groups; each user gets a test code. Students enter the code (no login) to see their info and begin.
- **Why**: Keeps phase 1 simple — no email/password flow needed.
- **Key requirements**:
  - Code-based entry only; on code entry, show student name/info, then a "Start" action.
  - Admin can disable certificate issuance per-student (a checkbox/flag on the User).

### Timed, proctored test-taking
- **What**: Once started, a test runs through its sections in a fixed order (no skipping/reordering, no going back). Full-screen is enforced; tab/window switches are tracked.
- **Why**: This is the integrity core of the product — without it, it's just an untimed quiz form.
- **Key requirements**:
  - On test/section start, the browser is forced into full-screen.
  - Any tab switch or window blur counts immediately (no debounce/grace period) as a strike, tracked per section (counter resets at the start of each new section).
  - First strike = warning. Second strike = that section is auto-submitted immediately with whatever answers exist.
  - Section timer is an absolute server-side deadline (`started_at + time_limit`), set once when the student first enters that section — not a client-side countdown that can be paused by closing the browser.
  - Every API call that touches a section attempt (submit answer, play audio, fetch state) checks current time against both the section deadline and the group's overall `end_time`; if either has passed, the section is closed server-side and the response tells the client "time is up."
  - If a device fails mid-section, the student can resume on a different device and continue from their last saved answer — remaining questions only, same section, timer unaffected by the gap. Listening audio that was already played stays "used" (does not reset on the new device).
  - A daily scheduled job sweeps any section/test attempts still sitting `in_progress` past their deadline (e.g. a student who never came back on any device) and force-closes them, so nothing lingers indefinitely.

### Certificate generation
- **What**: Some configurable number of hours after a test attempt completes, a certificate becomes available containing the student's name, test-taken date, and score.
- **Why**: Lets the teacher add a delay (e.g. to manually review before release) without manual generation work.
- **Key requirements**:
  - Delay hours is configured per Test Group (`certificate_delay_hours`).
  - Certificate is suppressed entirely for students the admin has flagged as certificate-disabled.
- **Open questions**: exact certificate format/template (PDF? on-screen page?) not yet discussed — deferred to Design/FE doc.

## Data entities (high level)

| Entity | Description |
|---|---|
| Question | A single multiple-choice question; may carry a one-play audio file for listening sections. |
| Section | A timed group of questions with a max score (e.g. "Listening", "Reading"). |
| Test | A named test made of multiple sections (M:N), with a scoring mode. |
| TestSection | Join table between Test and Section; carries the per-test weight used by `PERCENTAGE` scoring. |
| TestGroup | A scheduled instance of a Test for a specific cohort — start/end time, certificate delay. |
| User | A student — name, test code, certificate-enabled flag. |
| Attempt | One student's full run through a Test Group — holds the overall total score once computed. |
| SectionAttempt | One student's run through one Section within an Attempt — holds started_at/ends_at, locked question order, tab-switch count, status, score. |
| Answer | A student's selected option for a question within a SectionAttempt. |
| AudioPlay | Marks that a listening question's audio has been played for a given SectionAttempt (existence = used up). |
| Admin | The teacher account — email, password hash. Separate from Users (students); has its own auth (custom JWT + refresh token, not Supabase Auth). |
| RefreshToken | Admin auth session record — refresh token hash, paired access token id, device/location (nullable), expiry. Deleted and reissued on every refresh (no revoked flag). |

## Out-of-scope / future considerations
- Retake handling in-product (currently a manual/administrative process).
- Per-question custom point weighting within a section.
- Email-based code delivery / notifications.
- Live human or webcam-based proctoring.
- Refresh token reuse-detection / theft-lineage tracking.
- Migrating off Vercel/Supabase if scale grows beyond tens of students (architecture is deliberately kept portable — Nuxt server API as the only thing touching Supabase — to make this easier later).
- Mobile native app (API-first design keeps this open).
