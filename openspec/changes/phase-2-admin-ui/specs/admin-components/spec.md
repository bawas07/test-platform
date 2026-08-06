## ADDED Requirements

### Requirement: Sidebar nav component
The system SHALL provide a `SidebarNav` component that renders admin navigation items with icons, labels, and active state based on the current route.

#### Scenario: Renders nav items
- **WHEN** `SidebarNav` is mounted in the admin layout
- **THEN** all configured admin destinations are listed and clickable

### Requirement: Data table component
The system SHALL provide a `DataTable` component supporting column definitions, row data, optional sortable columns, pagination controls, loading state, and empty state.

#### Scenario: Empty state
- **WHEN** `DataTable` receives an empty rows list and is not loading
- **THEN** an empty state message is shown instead of a data body

#### Scenario: Pagination controls
- **WHEN** pagination metadata indicates multiple pages
- **THEN** the teacher can move between pages via table controls and a page change event is emitted

#### Scenario: Sort interaction
- **WHEN** the teacher activates a sortable column header
- **THEN** the component emits a sort event for that column

### Requirement: Drag list component
The system SHALL provide a `DragList` component wrapping drag-and-drop reorder for an array of items, emitting the new order, with a drag handle affordance.

#### Scenario: Reorder items
- **WHEN** the teacher drags an item to a new position
- **THEN** the component emits `reorder` with the updated ordered array

#### Scenario: Disabled drag
- **WHEN** the drag list is disabled
- **THEN** items cannot be reordered and the list appears dimmed or non-interactive for dragging

### Requirement: Score map editor component
The system SHALL provide a `ScoreMapEditor` inline table for raw_score → scaled_score rows with add and remove row actions and editable values.

#### Scenario: Add and edit rows
- **WHEN** the teacher adds a row and edits raw or scaled values
- **THEN** the component emits an updated rows array reflecting the changes

#### Scenario: Remove row
- **WHEN** the teacher removes a row
- **THEN** that row no longer appears in the emitted rows

### Requirement: Results table component
The system SHALL provide a `ResultsTable` that shows per-student scores including section score breakdown columns and a total score column.

#### Scenario: Section breakdown visible
- **WHEN** results data includes multiple sections
- **THEN** each student row shows scores for those sections and a total
