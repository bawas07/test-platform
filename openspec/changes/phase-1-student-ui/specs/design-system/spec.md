## ADDED Requirements

### Requirement: Primary button component
The system SHALL provide an `AppButton` component with variants `primary`, `secondary`, `danger`, and `ghost`; sizes `sm`, `md`, and `lg`; and `loading` and `disabled` states.

#### Scenario: Primary click
- **WHEN** the user clicks an enabled non-loading `AppButton`
- **THEN** the component emits a click event

#### Scenario: Disabled or loading ignores activation
- **WHEN** `disabled` or `loading` is true
- **THEN** the button does not emit click for user activation and presents a non-interactive appearance

### Requirement: Text input component
The system SHALL provide an `AppInput` component supporting `v-model`, optional label, placeholder, helper text, error text, input type, and disabled state.

#### Scenario: Error presentation
- **WHEN** an `error` message is provided
- **THEN** the input shows danger styling and displays the error text

#### Scenario: Value binding
- **WHEN** the user types into the input
- **THEN** the bound model value updates

### Requirement: Badge component
The system SHALL provide an `AppBadge` component with variants `success`, `warning`, `danger`, `neutral`, and `primary`, displaying the given label in pill form.

#### Scenario: Variant rendering
- **WHEN** an `AppBadge` is rendered with a variant and label
- **THEN** the label is visible with styling consistent with that variant’s semantic colors

### Requirement: Card component
The system SHALL provide an `AppCard` component as a slotted container with configurable padding (`sm` | `md` | `lg`).

#### Scenario: Default card chrome
- **WHEN** content is placed in `AppCard`
- **THEN** it renders on the card surface with border, radius, and light elevation per design tokens

### Requirement: Modal component
The system SHALL provide an `AppModal` controlled by `v-model` boolean visibility, with title, size, default body slot, footer slot, and backdrop-click dismiss.

#### Scenario: Open and close via model
- **WHEN** `modelValue` becomes true
- **THEN** the modal panel and backdrop are visible
- **WHEN** the user clicks the backdrop
- **THEN** the modal requests close via updating `modelValue` to false

### Requirement: Global toast notifications
The system SHALL provide toast notifications with variants `success`, `warning`, `danger`, and `info` that auto-dismiss after approximately 4 seconds.

#### Scenario: Show and auto-dismiss
- **WHEN** application code enqueues a toast message with a variant
- **THEN** the toast is visible to the user and disappears after the auto-dismiss interval without requiring navigation
