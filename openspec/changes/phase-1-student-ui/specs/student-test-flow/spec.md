## ADDED Requirements

### Requirement: Sample-backed test session store
The system SHALL maintain client-only student test session state (attempt, current section, questions, answers, audio played set, strike count) populated from hardcoded sample data, with async-shaped store methods for verify, start, answer, audio, strike, and section submit.

#### Scenario: Valid code verification
- **WHEN** the student submits the sample valid code `DEMO2026`
- **THEN** the store accepts the code and exposes student/test/group preview data for the start page

#### Scenario: Invalid code verification
- **WHEN** the student submits any code other than the sample valid code
- **THEN** the store rejects the code and the UI can show an invalid-or-expired error

### Requirement: Code entry page
The system SHALL provide a code entry page at `/` using the blank layout with app name, code input, and submit control.

#### Scenario: Happy path navigation
- **WHEN** the student successfully verifies a valid code
- **THEN** the app navigates to `/start`

#### Scenario: Invalid code feedback
- **WHEN** the student submits an invalid code
- **THEN** the page shows an error in danger styling indicating the code is invalid or expired

### Requirement: Student info confirmation page
The system SHALL provide `/start` showing sample student name, test name, group name, schedule window, section count, a one-sitting warning, and a start action.

#### Scenario: Start test
- **WHEN** the student is verified and clicks start test
- **THEN** the store initializes a sample attempt and the app navigates to `/test/sample-attempt-1`

#### Scenario: Guard without verification
- **WHEN** a user opens `/start` without a verified preview in the store
- **THEN** the app redirects to `/`

### Requirement: Test runner page structure
The system SHALL provide `/test/[attemptId]` as the timed test runner with sticky top bar (app identity, section name/progress, timer), question area, and in-section previous/next navigation.

#### Scenario: Question navigation within section
- **WHEN** the student is on a section with multiple questions
- **THEN** Previous/Next move between questions in that section only without leaving the runner route

#### Scenario: Answer selection feedback
- **WHEN** the student selects an answer option
- **THEN** the option appears selected immediately and the choice is stored in session state

### Requirement: Fullscreen gate before runner content
The test runner SHALL require an explicit user action to enter fullscreen before showing the active question UI.

#### Scenario: Gate then enter
- **WHEN** the student lands on the runner for an active section
- **THEN** a gate control labeled to enter fullscreen is shown before question content
- **WHEN** the student activates the gate control and fullscreen is granted
- **THEN** the runner question UI becomes available

### Requirement: Countdown timer display
The system SHALL show a section countdown derived from a local `endsAt` timestamp (sample sections use approximately five minutes from section start), with urgency styling for safe, warning (≤60s), and danger (≤30s with pulse).

#### Scenario: Urgency transitions
- **WHEN** remaining time crosses the warning and danger thresholds
- **THEN** the timer display updates color/urgency accordingly and pulses in the danger state

#### Scenario: Timer expiry in sample mode
- **WHEN** the displayed countdown reaches zero during a sample run
- **THEN** the app navigates to the section-done page with a time-up outcome

### Requirement: One-play audio for listening questions
Listening questions SHALL offer a single-play audio control with idle, playing, and done visual states; replay MUST NOT be allowed once played in the session.

#### Scenario: Play once
- **WHEN** the student plays audio on a listening question that has not been played
- **THEN** playback starts, the control enters playing then done, and further play attempts are blocked
- **WHEN** the question is shown again in the same section session
- **THEN** the control remains in the done/disabled state

### Requirement: Tab-switch and fullscreen-exit strikes
While the runner is active past the gate, the system SHALL treat tab/window focus loss and fullscreen exit as strikes. Strike 1 shows a warning banner; strike 2 auto-closes the section and navigates to section-done.

#### Scenario: First strike warning
- **WHEN** the first strike occurs in the current section
- **THEN** a warning strike banner is shown and the student remains in the section

#### Scenario: Second strike auto-submit
- **WHEN** a second strike occurs in the current section
- **THEN** the section is marked closed due to integrity rules and the app navigates to section-done

#### Scenario: Fullscreen re-entry after exit
- **WHEN** the student exits fullscreen during an active gated session
- **THEN** the system counts a strike and attempts to re-enter fullscreen

### Requirement: Demo strike controls
The test runner SHALL expose a clearly labeled Demo control to set strike 1 or trigger strike 2 for walkthroughs without relying solely on real focus loss.

#### Scenario: Demo strike 1
- **WHEN** the teacher activates Demo strike 1 on the runner
- **THEN** strike count becomes 1 and the warning banner path is shown

#### Scenario: Demo strike 2
- **WHEN** the teacher activates Demo strike 2 on the runner
- **THEN** the section closes and the app navigates to section-done as with a real second strike

### Requirement: Section progress indicator
The runner SHALL display non-clickable section progress for all sections with statuses including not started, in progress, completed, and auto-closed as applicable.

#### Scenario: Active section highlighted
- **WHEN** the student is mid-test
- **THEN** the progress indicator reflects the current section as in progress and prior sections with their terminal status

### Requirement: Manual section completion
The student SHALL be able to finish a section through normal question navigation/submit without strikes, moving to section-done.

#### Scenario: Submit section via UI
- **WHEN** the student completes the section flow via the runner’s advance/submit path
- **THEN** the section is marked completed and the app navigates to section-done

### Requirement: Section-done page
The system SHALL provide `/test/[attemptId]/section-done` explaining why the section ended (time up, strike, or manual) and offering continue-to-next-section or proceed-to-results when appropriate.

#### Scenario: More sections remain
- **WHEN** the student continues after a non-final section
- **THEN** the store advances to the next section and the app returns to the runner (including a new fullscreen gate)

#### Scenario: Last section finished
- **WHEN** the student continues after the final section
- **THEN** the app navigates to the test complete page

### Requirement: Test complete page
The system SHALL provide `/test/[attemptId]/complete` thanking the student and describing certificate availability, with navigation to the certificate page enabled for the sample dataset.

#### Scenario: Navigate to certificate
- **WHEN** the student chooses to view/check the certificate on the complete page in the sample flow
- **THEN** the app navigates to `/certificate/sample-attempt-1` (or the active sample attempt id)

### Requirement: Certificate page and PDF download
The system SHALL provide `/certificate/[attemptId]` showing a styled certificate (student name, test name, date, score) and a control that downloads a PDF client-side.

#### Scenario: Certificate content
- **WHEN** the student opens the sample certificate page
- **THEN** the page shows sample student name, test name, date, and score using certificate layout styling

#### Scenario: PDF download
- **WHEN** the student activates Download PDF
- **THEN** the browser obtains a PDF generated client-side from the certificate view without a backend

### Requirement: Attempt route guard
Test runner and related attempt routes SHALL require an initialized sample attempt consistent with the route param; otherwise redirect to code entry.

#### Scenario: Missing attempt
- **WHEN** a user opens `/test/sample-attempt-1` without an active attempt in the store
- **THEN** the app redirects to `/`
