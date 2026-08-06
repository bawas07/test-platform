## ADDED Requirements

### Requirement: Sample-backed admin data store
The system SHALL maintain client-only admin domain state (questions, sections, tests, groups, users, and related joins) initialized from sample fixtures, with mutations applying only to in-memory state.

#### Scenario: Fixture load
- **WHEN** the admin store initializes
- **THEN** sample questions, sections, tests, groups, and users are available to admin pages without calling a backend

### Requirement: Questions management
The system SHALL provide `/admin/questions` with a paginated sample question list and create/edit UI including question text, multiple options, a single correct-option flag, and an optional audio field that is visual-only (no real upload).

#### Scenario: Create question in local state
- **WHEN** the teacher completes the create-question form and saves
- **THEN** the new question appears in the local list without a server request

#### Scenario: Edit question options
- **WHEN** the teacher adds or removes option rows and marks one option correct
- **THEN** the saved question in local state reflects those options and correct flag

### Requirement: Sections list and detail
The system SHALL provide a sections index and `/admin/sections/[id]` detail with name, time limit (minutes), max score, randomize toggle, assigned questions with drag reorder, and optional score map editor.

#### Scenario: Save section config
- **WHEN** the teacher edits section fields and saves
- **THEN** local section state updates and success feedback is shown

#### Scenario: Reorder questions when randomize off
- **WHEN** `randomize_questions` is false and the teacher reorders questions via drag-and-drop
- **THEN** the local section question order updates

#### Scenario: Drag disabled when randomize on
- **WHEN** `randomize_questions` is true
- **THEN** question reorder is disabled or dimmed so order cannot be changed via drag

#### Scenario: Score map local edit
- **WHEN** the teacher edits the score conversion table on a section
- **THEN** rows are stored on the local section state

### Requirement: Tests list and detail
The system SHALL provide tests index and `/admin/tests/[id]` with name, scoring mode, assigned sections with order, and weight inputs when scoring mode is PERCENTAGE including inline weight-sum validation.

#### Scenario: Scoring mode PERCENTAGE weights
- **WHEN** scoring mode is PERCENTAGE
- **THEN** weight inputs are shown for assigned sections

#### Scenario: Weight sum validation
- **WHEN** scoring mode is PERCENTAGE and section weights do not sum to 100
- **THEN** the UI shows an inline validation message and does not treat the configuration as valid for save success

#### Scenario: Non-percentage hides weights
- **WHEN** scoring mode is not PERCENTAGE
- **THEN** weight inputs are hidden

### Requirement: Groups list and detail
The system SHALL provide groups index and `/admin/groups/[id]` with name, test picker, start/end time, certificate delay hours, and assign/remove users.

#### Scenario: Configure group schedule
- **WHEN** the teacher sets start time, end time, and certificate delay and saves
- **THEN** local group state reflects those values

#### Scenario: Assign user to group
- **WHEN** the teacher assigns a user to the group
- **THEN** the user appears in the group’s local member list

### Requirement: Users management
The system SHALL provide `/admin/users` with a paginated user list, create-user flow that generates a sample test code client-side, certificate-enabled toggle, and group assignment controls in local state.

#### Scenario: Create user generates code
- **WHEN** the teacher creates a user with a name
- **THEN** a sample test code is generated client-side and the user appears in the list with that code

#### Scenario: Toggle certificate flag
- **WHEN** the teacher toggles certificate enabled for a user
- **THEN** local user state reflects the new flag
