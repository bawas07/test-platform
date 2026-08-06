## ADDED Requirements

### Requirement: Nuxt application bootstrap
The project SHALL provide a Nuxt 3 application at the repository root that starts with the standard dev command and serves the student UI.

#### Scenario: Dev server starts
- **WHEN** a developer runs the install and dev scripts from the repository root
- **THEN** the app serves without build errors and renders `app.vue` with Nuxt layout and page outlets

#### Scenario: Vercel-oriented Nitro setup
- **WHEN** the Nuxt config is inspected
- **THEN** it is configured for SSR and a Vercel-compatible Nitro deployment preset

### Requirement: Core frontend modules and assets
The application SHALL include Pinia, Tailwind CSS, Laut Siang design tokens, Plus Jakarta Sans, and Tabler Icons as specified for the student UI foundation.

#### Scenario: Design tokens loaded globally
- **WHEN** any page loads
- **THEN** CSS custom properties from the Laut Siang token set are available on `:root` (surfaces, primary teal, text, semantic, timer, spacing, radius, shadow)

#### Scenario: Typography and icons available
- **WHEN** any page loads
- **THEN** Plus Jakarta Sans is applied as the UI font and Tabler Icon webfont classes are available

#### Scenario: Pinia enabled
- **WHEN** the app boots
- **THEN** Pinia is registered via the Nuxt module and stores can be used in pages and components

### Requirement: Application display name
The application SHALL expose a public runtime config value for the product display name defaulting to "Test Platform".

#### Scenario: App name in runtime config
- **WHEN** client code reads the public runtime config app name
- **THEN** the value is "Test Platform" unless overridden by environment

### Requirement: Layout shells
The application SHALL provide three layouts: `blank`, `student`, and `default`.

#### Scenario: Blank layout for focused flows
- **WHEN** a page uses the `blank` layout
- **THEN** the page renders without admin sidebar chrome and supports centered content

#### Scenario: Student layout for test runner chrome
- **WHEN** a page uses the `student` layout
- **THEN** the layout supports sticky top-bar student test chrome (logo/name area and main content slot)

#### Scenario: Default layout is admin shell only
- **WHEN** a page uses the `default` layout
- **THEN** content is rendered in a passthrough shell without admin navigation items (admin nav is out of scope)

### Requirement: Reserved folder structure
The repository SHALL include the agreed source folders for pages, components, stores, composables, layouts, types, assets, and a placeholder `server/tools` directory.

#### Scenario: Expected directories exist
- **WHEN** the scaffold is complete
- **THEN** `pages/`, `components/`, `stores/`, `composables/`, `layouts/`, `assets/css/`, and `server/tools/` exist for subsequent work

### Requirement: Sample audio asset
The application SHALL ship a sample audio file under `public/audio/` for listening-question demos.

#### Scenario: Sample audio is publicly reachable
- **WHEN** the dev server is running
- **THEN** `/audio/sample.mp3` is requestable as a static asset
