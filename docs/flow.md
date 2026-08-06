# [PROJECT NAME] — Flow

## Page list

| Page | Role | Purpose | Route |
|---|---|---|---|
| Code entry | Student | Enter test code | `/` |
| Student info confirm | Student | Show name/test info, Start action | `/start` |
| Test runner | Student | Full-screen section-by-section question UI | `/test/[attemptId]` |
| Section done / time's up | Student | Shown when section auto-closes or is submitted | `/test/[attemptId]/section-done` |
| Test complete | Student | Shown after last section submitted | `/test/[attemptId]/complete` |
| Certificate view | Student | Shareable URL, downloadable as PDF | `/certificate/[attemptId]` |
| Admin login | Admin | Email/password login | `/admin/login` |
| Admin dashboard | Admin | Overview — groups, recent attempts | `/admin` |
| Question bank | Admin | Create/edit Questions + options | `/admin/questions` |
| Section management | Admin | Create/edit Sections; assign + reorder Questions; score map | `/admin/sections/[id]` |
| Test management | Admin | Create/edit Tests; assign Sections + weights + scoring mode | `/admin/tests/[id]` |
| Test group management | Admin | Create/edit Groups — schedule, certificate delay, users | `/admin/groups/[id]` |
| Student management | Admin | Create Users, generate codes, assign to groups, certificate flag | `/admin/users` |
| Results view | Admin | Per-group, per-student score + section breakdown | `/admin/groups/[id]/results` |

## Navigation structure

```mermaid
flowchart TD
    Root["/ - Code entry"] --> Start["/start - Confirm info"]
    Start --> Runner["/test/attemptId - Test runner"]
    Runner --> SectionDone["/test/attemptId/section-done"]
    SectionDone -->|More sections| Runner
    SectionDone -->|Last section| Complete["/test/attemptId/complete"]
    Runner --> Complete
    Complete --> Cert["/certificate/attemptId"]

    AdminLogin["/admin/login"] --> AdminDash["/admin - Dashboard"]
    AdminDash --> Questions["/admin/questions"]
    AdminDash --> Sections["/admin/sections/id"]
    AdminDash --> Tests["/admin/tests/id"]
    AdminDash --> Groups["/admin/groups/id"]
    AdminDash --> Users["/admin/users"]
    Groups --> Results["/admin/groups/id/results"]
```

## User flows

### Flow: Student takes a test (happy path, single device)

```mermaid
flowchart TD
    Start([Student enters code]) --> Valid{Code valid & group active?}
    Valid -->|No| Error[Show error: invalid or expired code]
    Valid -->|Yes| ShowInfo[Show student name + test info]
    ShowInfo --> Click[Student clicks Start]
    Click --> CreateAttempt[Create Attempt, enter Section 1]
    CreateAttempt --> Fullscreen[Force full-screen]
    Fullscreen --> RandomizeCheck{randomize_questions?}
    RandomizeCheck -->|Yes| GenOrder[Generate + store locked random question order]
    RandomizeCheck -->|No| UseOrder[Use admin-defined order (creation order)]
    GenOrder --> ShowQ[Show questions]
    UseOrder --> ShowQ
    ShowQ --> Answer[Student selects answer → API call saves it]
    Answer --> MoreQ{More questions?}
    MoreQ -->|Yes| ShowQ
    MoreQ -->|No| SectionSubmit[Submit section → compute + store section score]
    SectionSubmit --> MoreSections{More sections?}
    MoreSections -->|Yes| NextSection[Advance to next section]
    NextSection --> Fullscreen
    MoreSections -->|No| ComputeTotal[Compute total via scoring_mode]
    ComputeTotal --> Done([Test complete page])
    Done --> WaitCert[Wait certificate_delay_hours]
    WaitCert --> CertCheck{Certificate enabled?}
    CertCheck -->|Yes| ShowCert[Certificate available at shareable URL]
    CertCheck -->|No| NoCert[No certificate]
```

### Flow: Section score computation (runs on every section close)

```mermaid
flowchart TD
    Close([Section closes]) --> Count[Count correct answers]
    Count --> MapCheck{section_score_maps rows exist?}
    MapCheck -->|Yes| Lookup[scaled_score = lookup raw_score]
    MapCheck -->|No| Raw[score = correct × max_score / question_count]
    Lookup --> Store[Store score on section_attempt]
    Raw --> Store
    Store --> LastCheck{Last section in test?}
    LastCheck -->|No| Wait([Done — wait for next section])
    LastCheck -->|Yes| ModeCheck{scoring_mode?}
    ModeCheck -->|SUM| TotalSum[total = Σ section scores]
    ModeCheck -->|LOWEST_SECTION| TotalMin[total = MIN of section scores]
    ModeCheck -->|HIGHEST_SECTION| TotalMax[total = MAX of section scores]
    ModeCheck -->|PERCENTAGE| TotalPct[total = Σ score × weight per section]
    TotalSum --> Save[Save total_score on attempt, status = completed]
    TotalMin --> Save
    TotalMax --> Save
    TotalPct --> Save
```

### Flow: Section auto-closes (strikes or timeout)

```mermaid
flowchart TD
    InSection([Student mid-section]) --> Event{Event}
    Event -->|Tab/window blur — strike 1| Warn[Show strike warning banner]
    Warn --> InSection
    Event -->|Tab/window blur — strike 2| ForceClose1[Auto-submit section]
    Event -->|API call after section ends_at| ForceClose2[Server returns S_SECTION_TIME_UP]
    Event -->|API call after group end_time| ForceClose3[Server returns S_GROUP_TIME_UP]
    ForceClose1 --> Score[Compute section score]
    ForceClose2 --> Score
    Score --> More{More sections?}
    More -->|Yes| Next[Advance to next section]
    More -->|No| Complete([Test complete])
    ForceClose3 --> FinalScore[Compute score, mark attempt completed]
    FinalScore --> Complete
```

### Flow: Resume on a different device mid-section

```mermaid
flowchart TD
    DeviceA([Device A: Section 2, Q1-5 answered]) --> Crash[Device A hangs or closes]
    Crash --> Counting[Server ends_at keeps counting — nothing pauses]
    Counting --> DeviceB[Student enters same code on Device B]
    DeviceB --> TimeCheck{now > ends_at or group end_time?}
    TimeCheck -->|Yes| TimeUp[Section already closed — show section-done page]
    TimeCheck -->|No| Restore[Fetch saved state: same question order, Q1-5 answers, audio played flags]
    Restore --> Continue[Continue from Q6]
    Continue --> Finish[Complete remaining questions]
    Finish --> NextSection([Next section as normal])
```

### Flow: Admin creates and schedules a test

```mermaid
flowchart TD
    Login([Admin logs in]) --> CreateQ[Create Questions + options in question bank]
    CreateQ --> CreateSec[Create Section: name, time limit, max score, randomize flag]
    CreateSec --> AssignQ[Assign Questions to Section]
    AssignQ --> ReorderQ{randomize = false?}
    ReorderQ -->|Yes| Drag[Drag-and-drop reorder questions]
    ReorderQ -->|No| Skip[Skip — order irrelevant]
    Drag --> ScoreMap
    Skip --> ScoreMap{TOEFL/IELTS scoring needed?}
    ScoreMap -->|Yes| EnterMap[Enter raw→scaled score conversion table]
    ScoreMap -->|No| SkipMap[Skip — raw score used directly]
    EnterMap --> CreateTest
    SkipMap --> CreateTest[Create Test: name + scoring_mode]
    CreateTest --> AssignSec[Assign Sections to Test with order]
    AssignSec --> WeightCheck{scoring_mode = PERCENTAGE?}
    WeightCheck -->|Yes| SetWeights[Set per-section weight — must sum to 100%]
    WeightCheck -->|No| SkipWeights[Skip]
    SetWeights --> CreateGroup
    SkipWeights --> CreateGroup[Create Test Group: pick Test, start/end time, certificate_delay_hours]
    CreateGroup --> CreateUsers[Create Users, generate test codes]
    CreateUsers --> AssignUsers[Assign Users to Test Group, set certificate flags]
    AssignUsers --> Ready([Group ready])
```

## Wireframe-level notes

- **Test runner** has a sticky top bar with timer (`MM:SS`), section name, and section progress pills. Timer color transitions safe → warning → danger, pulses at <30s. Full-screen and tab-switch detection are scoped to this route only.
- **Audio player** has three visual states: `idle` (teal play button active), `playing` (waveform animation, button locked), `done` (greyed out, disabled). State is synced from `audio_plays` table on load — correct state shown immediately on device resume.
- **Answer options** save immediately on selection (no separate submit button per question). The section submit happens at the end (Next on last question) or is forced by the server.
- **Question reorder in admin** is drag-and-drop, visually dimmed/disabled when `randomize_questions = true` to avoid confusion.
- **Score map editor in admin** is a simple inline table (correct answers | scaled score, one row per band) — no file upload needed for phase 1.
- **Certificate** is a styled page at a shareable URL. Download via `html2pdf.js` client-side print. Contains: student name, test name, date taken, score.
- **Section-done and test-complete** pages are separate routes from the runner — clear state boundary between "actively timed" and "done".
