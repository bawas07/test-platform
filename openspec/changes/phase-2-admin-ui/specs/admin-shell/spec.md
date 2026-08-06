## ADDED Requirements

### Requirement: Admin application chrome
The system SHALL provide an admin layout with a fixed-width sidebar, sticky top bar, and main content area for authenticated admin pages.

#### Scenario: Layout structure
- **WHEN** an admin page using the default layout is shown while logged in
- **THEN** the UI shows a sidebar (approximately 240px), a top bar with the app name and admin identity area, and a content region for the page

### Requirement: Sidebar navigation
The system SHALL show sidebar links for Dashboard, Questions, Sections, Tests, Groups, Students, and Results with active-route highlighting and Tabler icons per the design system.

#### Scenario: Active route highlight
- **WHEN** the teacher is on an admin route matching a nav item
- **THEN** that nav item is visually highlighted as active

#### Scenario: Navigation works
- **WHEN** the teacher clicks a sidebar nav item
- **THEN** the app navigates to the corresponding admin route

### Requirement: Demo admin login
The system SHALL provide `/admin/login` with email and password fields where submitting valid non-empty credentials (or any submit per demo policy) establishes an in-memory admin session.

#### Scenario: Successful demo login
- **WHEN** the teacher submits the login form with credentials accepted by the demo policy
- **THEN** the auth store marks the admin as logged in and the app navigates to `/admin`

#### Scenario: Login page layout
- **WHEN** the teacher opens `/admin/login`
- **THEN** the page uses a minimal layout without the admin sidebar

### Requirement: Admin route protection
The system SHALL redirect unauthenticated users away from protected admin routes to `/admin/login`.

#### Scenario: Unauthenticated access blocked
- **WHEN** a user without an in-memory admin session opens a protected `/admin` page
- **THEN** the app redirects to `/admin/login`

#### Scenario: Login excluded from protection
- **WHEN** a user opens `/admin/login`
- **THEN** the login page is accessible without an existing session

### Requirement: Logout control
The system SHALL provide a logout control in the admin top bar that clears the in-memory session and returns the user to the login page.

#### Scenario: Logout
- **WHEN** the logged-in teacher activates logout
- **THEN** the session is cleared and the app navigates to `/admin/login`

### Requirement: Admin identity placeholder
The system SHALL display the demo admin email (or placeholder) in the admin top bar while logged in.

#### Scenario: Email visible
- **WHEN** the teacher is logged in on an admin page
- **THEN** the top bar shows the admin email from the session
