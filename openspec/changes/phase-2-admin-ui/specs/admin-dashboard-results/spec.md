## ADDED Requirements

### Requirement: Admin dashboard
The system SHALL provide `/admin` dashboard with summary cards for sample totals (groups, active tests/students or equivalent milestone metrics) and a recent attempts list from sample data.

#### Scenario: Summary cards render
- **WHEN** the teacher opens the dashboard while logged in
- **THEN** summary cards show sample numeric totals

#### Scenario: Recent attempts list
- **WHEN** sample attempt data exists
- **THEN** the dashboard lists recent attempts with enough context to identify student and test/group

### Requirement: Group results view
The system SHALL provide `/admin/groups/[id]/results` showing a results table of sample attempts for that group with per-student section score breakdown and total score.

#### Scenario: Results for group
- **WHEN** the teacher opens results for a sample group that has attempts
- **THEN** each student row shows section scores and total score

#### Scenario: Empty results
- **WHEN** a group has no sample attempts
- **THEN** the results view shows an empty state rather than a broken table

### Requirement: Results navigation entry
The system SHALL expose a Results entry in admin navigation that leads to a group results view using sample group data so the teacher can open results in one click during demo.

#### Scenario: Open results from nav
- **WHEN** the teacher selects Results in the sidebar
- **THEN** the app navigates to a group results page backed by sample data
