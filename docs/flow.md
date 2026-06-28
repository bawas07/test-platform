 Online Test Platform — Flow

## Page list

| Page | Role(s) | Purpose | Route (if known) |
|---|---|---|---|
| Code entry | Student | Enter test code | `/` |
| Student info confirm | Student | Show name/test info, "Start" action | `/start` |
| Test runner | Student | Full-screen section-by-section question UI | `/test/[attemptId]` |
| Section finished / time's up | Student | Shown when a section auto-closes (deadline or strikes) | `/test/[attemptId]/section-done` |
| Test complete | Student | Shown after last section submitted | `/test/[attemptId]/complete` |
| Certificate view | Student | Shown once certificate delay has passed (if enabled) | `/certificate/[attemptId]` |
| Admin login | Admin | Email/password login | `/admin/login` |
| Admin dashboard | Admin | Overview — groups, recent attempts | `/admin` |
| Question bank | Admin | Create/edit Questions | `/admin/questions` |
| Section management | Admin | Create/edit Sections, assign Questions | `/admin/sections` |
| Test management | Admin | Create/edit Tests, assign Sections + weights + scoring mode | `/admin/tests` |
| Test group management | Admin | Create/edit Test Groups, schedule, certificate delay | `/admin/groups` |
| Student (User) management | Admin | Create Users, generate codes, assign to groups, toggle certificate flag | `/admin/users` |
| Results / scores view | Admin | Per-group, per-student score breakdown | `/admin/groups/[groupId]/results` |

## Navigation structure

```mermaid
flowchart TD
    Root[Code entry] --> Start[start - Confirm info]
    Start --> Runner[Test runner]
    Runner --> SectionDone[Section time's up page]
    SectionDone --> Runner
    Runner --> Complete[complete]
    Complete --> Cert[attemptId]

    AdminLogin[admin login] --> AdminDash[admin - Dashboard]
    AdminDash --> Questions[admin questions]
    AdminDash --> Sections[admin sections]
    AdminDash --> Tests[admin tests]
    AdminDash --> Groups[admin groups]
    AdminDash --> Users[admin users]
    Groups --> Results[admin groups groupId results]
```

## User flows

### Flow: Student takes a test (happy path, single device)
Triggered when a student enters their code within the Test Group's active window.

```mermaid
flowchart TD
    Start([Student enters code]) --> Valid{Code valid & group active?}
    Valid -->|No| Error[Show error: invalid/expired code]
    Valid -->|Yes| ShowInfo[Show student name + test info]
    ShowInfo --> Click[Student clicks Start]
    Click --> CreateAttempt[Create/resume Attempt, enter Section 1]
    CreateAttempt --> Fullscreen[Force full-screen]
    Fullscreen --> LockOrder[Lock randomized question order for section]
    LockOrder --> Answer[Student answers questions]
    Answer --> MoreQ{More questions in section?}
    MoreQ -->|Yes| Answer
    MoreQ -->|No| SectionSubmit[Submit section]
    SectionSubmit --> MoreSections{More sections in test?}
    MoreSections -->|Yes| NextSection[Advance to next section]
    NextSection --> Fullscreen
    MoreSections -->|No| Done([Test complete])
    Done --> WaitCert[Wait certificate_delay_hours]
    WaitCert --> CertReady{Certificate enabled for user?}
    CertReady -->|Yes| ShowCert[Certificate available]
    CertReady -->|No| NoCert[No certificate shown]
```

### Flow: Section auto-closes (tab-switch strikes or timeout)
Two independent triggers can force-close a section attempt; both lead to the same outcome.

```mermaid
flowchart TD
    InSection([Student mid-section]) --> Event{What happens?}

    Event -->|Tab/window blur #1| Warn[Show warning, strike count = 1]
    Warn --> InSection

    Event -->|Tab/window blur #2| ForceClose1[Auto-submit section now]

    Event -->|API call lands after section ends_at| ForceClose2[Server returns time_up, section closed]
    Event -->|API call lands after group end_time| ForceClose3[Server returns time_up, entire test closed]

    ForceClose1 --> NextOrEnd{More sections left?}
    ForceClose2 --> NextOrEnd
    NextOrEnd -->|Yes| NextSection[Advance to next section]
    NextOrEnd -->|No| Complete([Test complete])
    ForceClose3 --> Complete
```

### Flow: Resume on a different device mid-section
Section timer keeps counting server-side throughout, regardless of device state.

```mermaid
flowchart TD
    DeviceA([Device A: answering Section 2, Q1-5 done]) --> Crash[Device A hangs/closes]
    Crash --> StillRunning[Server-side timer keeps counting toward ends_at]
    StillRunning --> DeviceB[Student enters same code on Device B]
    DeviceB --> CheckTime{now > ends_at or group end_time?}
    CheckTime -->|Yes| TimeUp[Show: time is up, section closed]
    CheckTime -->|No| Restore[Fetch saved state: same locked question order, Q1-5 answers, audio-played flags]
    Restore --> Continue[Student continues from Q6]
    Continue --> Finish[Finishes remaining questions]
    Finish --> NextSection([Advance to next section as normal])
```

### Flow: Admin creates and schedules a test
End-to-end authoring path from question bank to a runnable group.

```mermaid
flowchart TD
    Login([Admin logs in]) --> CreateQ[Create Questions in bank]
    CreateQ --> CreateSec[Create Section, assign Questions, set time limit + max score]
    CreateSec --> CreateTest[Create Test, assign Sections]
    CreateTest --> SetMode{Choose scoring_mode}
    SetMode -->|PERCENTAGE| SetWeights[Set per-section weight, must sum to 100%]
    SetMode -->|SUM / LOWEST / HIGHEST| SkipWeights[No weight config needed]
    SetWeights --> CreateGroup
    SkipWeights --> CreateGroup[Create Test Group: pick Test, set start/end time, certificate_delay_hours]
    CreateGroup --> CreateUsers[Create Users, generate codes]
    CreateUsers --> AssignUsers[Assign Users to Test Group]
    AssignUsers --> Ready([Group ready - students can enter codes once start_time reached])
```

## Wireframe-level notes

- Test runner page is the most layout-critical screen: needs a visible (but not anxiety-inducing) countdown derived from the server `ends_at`, a question area, and an audio player for listening questions that visually shows "play" before use and a disabled/used state after — no scrub bar, no replay.
- Full-screen enforcement and exit-detection are page-level behaviors on the Test runner route specifically — not global to the app.
- Section "time's up" and "test complete" are deliberately separate pages from the runner itself, so there's a clear state boundary between "actively timed" and "no longer timed."
