# [PROJECT NAME] — Backend Spec

## Stack

| Layer | Choice |
|---|---|
| Framework | Nuxt 3 (Nitro server) — full API mode, deployed on Vercel |
| Database | Supabase (Postgres) — accessed only from server-side via service role key |
| Auth | Custom JWT (access token) + refresh token stored in httpOnly cookie — no Supabase Auth |
| Password hashing | `bcryptjs` (argon2 as future upgrade option) |
| Audio storage | TBD — pluggable; abstracted behind a storage service layer so provider can be swapped |
| Scheduled jobs | Vercel Cron → `POST /api/internal/housekeeping` (daily) |
| Validation | `zod` for all request body validation in server routes |
| ORM | Supabase JS client (service role) for direct SQL where needed; raw SQL via `postgres` or Supabase RPC for complex queries |

---

## Project structure (Nuxt server side)

```
server/
  api/
    admin/
      login.post.ts
      logout.post.ts
      refresh.post.ts
    tests/
      index.get.ts         ← list tests
      index.post.ts        ← create test
      [id].get.ts
      [id].put.ts
      [id].delete.ts
      [id]/sections.post.ts   ← assign section to test
      [id]/sections/[sectionId].delete.ts
      [id]/sections/[sectionId]/weight.put.ts
      [id]/sections/[sectionId]/order.put.ts
    sections/
      index.get.ts
      index.post.ts
      [id].get.ts
      [id].put.ts
      [id]/scoremap.get.ts
      [id]/scoremap.put.ts   ← upsert full score map for section
    questions/
      index.get.ts
      index.post.ts
      [id].get.ts
      [id].put.ts
      [id].delete.ts
    groups/
      index.get.ts
      index.post.ts
      [id].get.ts
      [id].put.ts
      [id]/users.post.ts
      [id]/users/[userId].delete.ts
      [id]/results.get.ts
    users/
      index.get.ts
      index.post.ts
      [id].get.ts
      [id].put.ts
    test/
      verify-code.post.ts       ← student: validate test code
      start.post.ts             ← student: create/resume attempt
      [attemptId]/state.get.ts  ← student: get current attempt state
      [attemptId]/section/start.post.ts     ← student: enter a section
      [attemptId]/section/answer.post.ts    ← student: submit answer
      [attemptId]/section/audio-play.post.ts← student: mark audio as played
      [attemptId]/section/submit.post.ts    ← student: manually submit section
      [attemptId]/tab-switch.post.ts        ← student: report tab switch event
    certificate/
      [attemptId].get.ts        ← student: get certificate data
    internal/
      housekeeping.post.ts      ← cron: sweep overdue attempts + expired tokens
  middleware/
    admin-auth.ts               ← validates access token JWT on all /api/admin/* and management routes
  tools/
    response.ts                 ← ok(), paginated(), fail() — unified response envelope helpers
    jwt.ts                      ← sign / verify access tokens
    hash.ts                     ← bcrypt helpers
    scoring.ts                  ← section score + total score computation
    time.ts                     ← deadline helpers
    storage.ts                  ← audio file upload/url abstraction (TBD provider)
```

---

## Authentication (admin only)

Students do not authenticate — they use a test code.

### Access token
- JWT signed with `JWT_SECRET` env var
- Payload: `{ sub: adminId, jti: uuid, iat, exp }`
- Expiry: 15 minutes
- Sent in response body on login/refresh; stored in Pinia (memory only, NOT localStorage)

### Refresh token
- Random UUID, stored as `bcrypt(token)` hash in `refresh_tokens` table
- Expiry: 7 days
- Sent and received via `httpOnly; Secure; SameSite=Strict` cookie (`__rt`)
- On every refresh: old row deleted, new access + refresh pair issued, new row inserted
- On logout: row deleted

### Middleware (`admin-auth.ts`)
Applied to all admin API routes. Extracts `Authorization: Bearer <token>` header, verifies JWT signature and expiry, attaches `adminId` to event context. Returns `401` if missing or invalid.

---

## Database schema (DDL)

```sql
-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Questions
create table questions (
  id           uuid primary key default gen_random_uuid(),
  section_id   uuid not null references sections(id) on delete cascade,
  text         text not null,
  audio_url    text,
  created_at   timestamptz not null default now()
);

-- Answer options
create table question_options (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references questions(id) on delete cascade,
  text         text not null,
  is_correct   boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Sections
create table sections (
  id                   uuid primary key default gen_random_uuid(),
  section_key          text not null unique,
  display_name         text not null,
  time_limit_minutes   int not null,
  max_score            numeric not null,
  randomize_questions  boolean not null default true,
  created_at           timestamptz not null default now()
);

-- Optional raw→scaled score map per section
create table section_score_maps (
  id           uuid primary key default gen_random_uuid(),
  section_id   uuid not null references sections(id) on delete cascade,
  raw_score    int not null,
  scaled_score numeric not null,
  unique(section_id, raw_score)
);

-- Tests
create type scoring_mode as enum ('SUM', 'LOWEST_SECTION', 'HIGHEST_SECTION', 'PERCENTAGE');

create table tests (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  scoring_mode scoring_mode not null default 'SUM',
  created_at   timestamptz not null default now()
);

-- Test ↔ Section join (with order + weight)
create table test_sections (
  id           uuid primary key default gen_random_uuid(),
  test_id      uuid not null references tests(id) on delete cascade,
  section_id   uuid not null references sections(id) on delete cascade,
  "order"      int not null,
  weight       numeric,   -- only used when scoring_mode = PERCENTAGE; must sum to 1.0 per test
  unique(test_id, section_id),
  unique(test_id, "order")
);

-- Test groups
create table test_groups (
  id                       uuid primary key default gen_random_uuid(),
  name                     text not null,
  test_id                  uuid not null references tests(id),
  start_time               timestamptz not null,
  end_time                 timestamptz not null,
  certificate_delay_hours  int not null default 0,
  created_at               timestamptz not null default now()
);

-- Users (students)
create table users (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  test_code             text not null unique,
  certificate_enabled   boolean not null default true,
  created_at            timestamptz not null default now()
);

-- Test group ↔ User join
create table test_group_users (
  id              uuid primary key default gen_random_uuid(),
  test_group_id   uuid not null references test_groups(id) on delete cascade,
  user_id         uuid not null references users(id) on delete cascade,
  unique(test_group_id, user_id)
);

-- Attempts (one per student per group)
create type attempt_status as enum ('not_started', 'in_progress', 'completed');

create table attempts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id),
  test_group_id   uuid not null references test_groups(id),
  status          attempt_status not null default 'not_started',
  total_score     numeric,
  started_at      timestamptz,
  completed_at    timestamptz,
  unique(user_id, test_group_id)
);

-- Section attempts
create type section_attempt_status as enum (
  'not_started',
  'in_progress',
  'completed',
  'auto_closed_timeout',
  'auto_closed_group_deadline',
  'auto_closed_tab_switch'
);

create table section_attempts (
  id                uuid primary key default gen_random_uuid(),
  attempt_id        uuid not null references attempts(id) on delete cascade,
  section_id        uuid not null references sections(id),
  status            section_attempt_status not null default 'not_started',
  started_at        timestamptz,
  ends_at           timestamptz,          -- set once on first entry
  tab_switch_count  int not null default 0,
  question_order    uuid[],               -- locked random order; null if randomize=false
  score             numeric,              -- written on section close
  unique(attempt_id, section_id)
);

-- Answers (upsertable)
create table answers (
  id                    uuid primary key default gen_random_uuid(),
  section_attempt_id    uuid not null references section_attempts(id) on delete cascade,
  question_id           uuid not null references questions(id),
  selected_option_id    uuid not null references question_options(id),
  answered_at           timestamptz not null default now(),
  unique(section_attempt_id, question_id)
);

-- Audio plays (existence = used, unique = can only play once)
create table audio_plays (
  id                    uuid primary key default gen_random_uuid(),
  section_attempt_id    uuid not null references section_attempts(id) on delete cascade,
  question_id           uuid not null references questions(id),
  played_at             timestamptz not null default now(),
  unique(section_attempt_id, question_id)
);

-- Admins
create table admins (
  id             uuid primary key default gen_random_uuid(),
  email          text not null unique,
  password_hash  text not null,
  created_at     timestamptz not null default now()
);

-- Refresh tokens
create table refresh_tokens (
  id                  uuid primary key default gen_random_uuid(),
  admin_id            uuid not null references admins(id) on delete cascade,
  token_hash          text not null unique,
  access_token_jti    uuid not null,
  device              text,
  location            text,
  expires_at          timestamptz not null,
  created_at          timestamptz not null default now()
);

-- Indexes
create index on section_attempts(attempt_id);
create index on answers(section_attempt_id);
create index on audio_plays(section_attempt_id);
create index on test_group_users(user_id);
create index on refresh_tokens(admin_id);
create index on attempts(status) where status = 'in_progress';
create index on section_attempts(status) where status = 'in_progress';
```

---

## Scoring engine (`server/tools/scoring.ts`)

Called on every section close and on attempt completion.

```typescript
// 1. Compute section score
async function computeSectionScore(sectionAttemptId: string): Promise<number> {
  const { correctCount, totalQuestions, maxScore, sectionId } = await getSectionStats(sectionAttemptId)

  const scoreMap = await getScoreMap(sectionId)
  if (scoreMap.length > 0) {
    const entry = scoreMap.find(r => r.raw_score === correctCount)
    return entry?.scaled_score ?? 0
  }

  const pointsPerQuestion = maxScore / totalQuestions
  return correctCount * pointsPerQuestion
}

// 2. Compute attempt total score (called when last section closes)
async function computeTotalScore(attemptId: string, scoringMode: ScoringMode): Promise<number> {
  const sectionScores = await getAllSectionScores(attemptId) // numeric[]

  switch (scoringMode) {
    case 'SUM':             return sum(sectionScores)
    case 'LOWEST_SECTION':  return Math.min(...sectionScores)
    case 'HIGHEST_SECTION': return Math.max(...sectionScores)
    case 'PERCENTAGE':      return await computeWeightedScore(attemptId)
  }
}

async function computeWeightedScore(attemptId: string): Promise<number> {
  const rows = await getSectionScoresWithWeights(attemptId)
  // rows: [{ score, weight }]
  return rows.reduce((acc, r) => acc + (r.score * r.weight), 0)
}
```

---

## Time validation (applied on every student API call)

```typescript
// server/tools/time.ts
export function checkDeadlines(sectionAttempt, testGroup): 'ok' | 'section_expired' | 'group_expired' {
  const now = new Date()
  if (now > new Date(testGroup.end_time)) return 'group_expired'
  if (sectionAttempt.ends_at && now > new Date(sectionAttempt.ends_at)) return 'section_expired'
  return 'ok'
}
```

On `section_expired` or `group_expired`: close the section, compute score, return `time_up` response.

---

## Housekeeping cron (`/api/internal/housekeeping`)

Protected by a shared secret header (`x-cron-secret`). Called daily via Vercel Cron.

```
1. Find all section_attempts WHERE status = 'in_progress' AND ends_at < now()
   → close each, compute score, update status = 'auto_closed_timeout'

2. Find all attempts WHERE status = 'in_progress' AND test_group.end_time < now()
   → close all their in_progress section_attempts (status = 'auto_closed_group_deadline')
   → compute total score, set attempt.status = 'completed'

3. DELETE FROM refresh_tokens WHERE expires_at < now()
```

---

## Environment variables

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
JWT_EXPIRY_SECONDS=900
REFRESH_TOKEN_EXPIRY_DAYS=7
CRON_SECRET=
AUDIO_STORAGE_PROVIDER=tbd
```

---

## API response format

All endpoints return this envelope. No exceptions — every route goes through the helpers below, never constructs the object manually.

```typescript
interface ApiResponse<T> {
  status:  boolean        // true = success, false = error
  message: string         // user-facing message
  code:    string         // S_* for success, E_* for error
  data:    T | null       // response payload or null on error
}

interface PaginatedData<T> {
  items:   T[]
  total:   number
  page:    number
  perPage: number
}
```

### `server/tools/response.ts`

Response helpers — the only place the envelope is constructed. Always explicit, never magic: errors are returned with `return fail(...)`, not thrown. This keeps every route readable top-to-bottom with no hidden control flow.

```typescript
import { setResponseStatus } from 'h3'
import type { H3Event } from 'h3'

export function ok<T>(
  event: H3Event,
  data: T,
  message = 'Success',
  code = 'S_OK',
  httpStatus = 200
) {
  setResponseStatus(event, httpStatus)
  return { status: true, message, code, data }
}

export function paginated<T>(
  event: H3Event,
  items: T[],
  total: number,
  page: number,
  perPage: number,
  message = 'Success',
  code = 'S_OK'
) {
  setResponseStatus(event, 200)
  return { status: true, message, code, data: { items, total, page, perPage } }
}

export function fail(
  event: H3Event,
  message: string,
  code: string,
  httpStatus: number,
  data: unknown = null
) {
  setResponseStatus(event, httpStatus)
  return { status: false, message, code, data }
}
```

### HTTP status mapping

| Scenario | HTTP status |
|---|---|
| Success | 200 |
| Created (POST that creates a resource) | 201 |
| Invalid input / validation error | 400 |
| Unauthorized (missing/invalid token) | 401 |
| Forbidden (valid token, wrong permission) | 403 |
| Resource not found | 404 |
| Conflict (duplicate, e.g. test code exists) | 409 |
| Unprocessable (e.g. section already closed) | 422 |
| Server error | 500 |

### Usage example

```typescript
// server/api/test/verify-code.post.ts
import { ok, fail } from '~/server/tools/response'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = verifyCodeSchema.safeParse(body)
  if (!parsed.success)
    return fail(event, 'Invalid request body', 'E_VALIDATION', 400, parsed.error.flatten())

  const user = await getUserByCode(parsed.data.code)
  if (!user)
    return fail(event, 'Invalid or expired test code', 'E_INVALID_CODE', 404)

  const group = await getActiveGroup(user.id)
  if (!group)
    return fail(event, 'No active test window for this code', 'E_GROUP_NOT_ACTIVE', 403)

  return ok(event, { user, group }, 'Code verified', 'S_CODE_VALID')
})
```

---

## API route list

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/login` | — | Admin login. Returns access token + sets refresh cookie |
| POST | `/api/admin/logout` | Admin | Delete refresh token, clear cookie |
| POST | `/api/admin/refresh` | — (cookie) | Rotate refresh token, return new access token |

### Tests (admin)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/tests` | Admin | List all tests |
| POST | `/api/tests` | Admin | Create test |
| GET | `/api/tests/:id` | Admin | Get test with sections |
| PUT | `/api/tests/:id` | Admin | Update test name / scoring mode |
| DELETE | `/api/tests/:id` | Admin | Delete test |
| POST | `/api/tests/:id/sections` | Admin | Assign section to test (with order + optional weight) |
| DELETE | `/api/tests/:id/sections/:sectionId` | Admin | Remove section from test |
| PUT | `/api/tests/:id/sections/:sectionId/weight` | Admin | Update section weight |
| PUT | `/api/tests/:id/sections/:sectionId/order` | Admin | Reorder section within test |

### Sections (admin)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/sections` | Admin | List all sections |
| POST | `/api/sections` | Admin | Create section |
| GET | `/api/sections/:id` | Admin | Get section with questions |
| PUT | `/api/sections/:id` | Admin | Update section config |
| GET | `/api/sections/:id/scoremap` | Admin | Get score conversion table |
| PUT | `/api/sections/:id/scoremap` | Admin | Upsert full score map |

### Questions (admin)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/questions` | Admin | List questions (paginated) |
| POST | `/api/questions` | Admin | Create question + options |
| GET | `/api/questions/:id` | Admin | Get question with options |
| PUT | `/api/questions/:id` | Admin | Update question + options |
| DELETE | `/api/questions/:id` | Admin | Delete question |

### Test Groups (admin)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/groups` | Admin | List test groups |
| POST | `/api/groups` | Admin | Create group |
| GET | `/api/groups/:id` | Admin | Get group detail |
| PUT | `/api/groups/:id` | Admin | Update group config |
| POST | `/api/groups/:id/users` | Admin | Add user to group |
| DELETE | `/api/groups/:id/users/:userId` | Admin | Remove user from group |
| GET | `/api/groups/:id/results` | Admin | Get all attempt results for group |

### Users / Students (admin)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | List users (paginated) |
| POST | `/api/users` | Admin | Create user + generate test code |
| GET | `/api/users/:id` | Admin | Get user detail |
| PUT | `/api/users/:id` | Admin | Update user info / certificate flag |

### Student test flow (no auth)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/test/verify-code` | — | Validate test code, return student info + group info |
| POST | `/api/test/start` | — | Create or resume attempt, return attempt state |
| GET | `/api/test/:attemptId/state` | — | Get full current state (section, questions, answers, timer) |
| POST | `/api/test/:attemptId/section/start` | — | Enter next section, set ends_at if first entry |
| POST | `/api/test/:attemptId/section/answer` | — | Submit / update answer for a question |
| POST | `/api/test/:attemptId/section/audio-play` | — | Mark audio as played for a question |
| POST | `/api/test/:attemptId/section/submit` | — | Manually submit current section |
| POST | `/api/test/:attemptId/tab-switch` | — | Report tab switch event, returns strike count or time_up |

### Certificate (no auth)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/certificate/:attemptId` | — | Get certificate data if delay has passed and certificate enabled |

### Internal (cron)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/internal/housekeeping` | Cron secret header | Sweep overdue attempts + expired tokens |

---

## Response codes

### Success codes

| Code | Meaning |
|---|---|
| `S_OK` | Generic success |
| `S_LOGIN_OK` | Admin login successful |
| `S_LOGOUT_OK` | Logged out |
| `S_TOKEN_REFRESHED` | Access token refreshed |
| `S_CODE_VALID` | Test code validated |
| `S_ATTEMPT_CREATED` | New attempt created |
| `S_ATTEMPT_RESUMED` | Existing attempt resumed |
| `S_SECTION_STARTED` | Section started, timer set |
| `S_ANSWER_SAVED` | Answer saved |
| `S_AUDIO_MARKED` | Audio marked as played |
| `S_SECTION_SUBMITTED` | Section manually submitted |
| `S_SECTION_TIME_UP` | Section closed due to timeout |
| `S_GROUP_TIME_UP` | Test closed due to group end_time |
| `S_STRIKE_WARNING` | First tab-switch strike, warning issued |
| `S_STRIKE_SECTION_CLOSED` | Second strike, section auto-closed |
| `S_CERTIFICATE_READY` | Certificate data returned |
| `S_HOUSEKEEPING_DONE` | Cron sweep completed |

### Error codes

| Code | Meaning |
|---|---|
| `E_INVALID_CODE` | Test code not found |
| `E_GROUP_NOT_ACTIVE` | Test group window not open yet or already closed |
| `E_ATTEMPT_NOT_FOUND` | Attempt ID not found |
| `E_SECTION_CLOSED` | Section already closed, no more submissions |
| `E_AUDIO_ALREADY_PLAYED` | Audio has already been played for this question |
| `E_CERTIFICATE_NOT_READY` | Certificate delay not yet passed |
| `E_CERTIFICATE_DISABLED` | Certificate disabled for this user |
| `E_UNAUTHORIZED` | Missing or invalid admin token |
| `E_FORBIDDEN` | Valid token but insufficient permission |
| `E_VALIDATION` | Request body failed validation |
| `E_NOT_FOUND` | Resource not found |
| `E_CONFLICT` | Duplicate resource (e.g. test code already exists) |
| `E_SERVER_ERROR` | Unexpected server error |
