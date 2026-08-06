# Test Platform

Online test platform for students and teachers. Phase 1–2 are client-only demos with sample data (no backend).

## Setup

```bash
npm install
npm run dev
```

Open the app at the URL shown in the terminal (usually `http://localhost:3000`).

---

## Student demo

### Test code

```text
DEMO2026
```

Case-sensitive. Any other code shows an invalid/expired error.

### Walkthrough

1. Enter an invalid code → error message appears.
2. Enter `DEMO2026` → continue to the start screen (Budi Santoso, English Proficiency Test).
3. Click **Start test** → open the test runner.
4. Click **Enter fullscreen** (required gate; if the browser blocks fullscreen, the demo continues with a note).
5. Answer questions; play audio once on listening items.
6. Use the floating **Demo** FAB to simulate integrity strikes:
   - **Strike 1** — warning banner
   - **Strike 2** — section auto-closes
7. Complete or close each section → section-done screen → continue through remaining sections.
8. After the last section → test complete → **Check certificate**.
9. On the certificate page, review the certificate and **Download PDF**.

---

## Admin demo

Login at `/admin/login` with **any email and password** (demo mode).

### Dashboard (`/admin`)

Summary cards (total groups, active tests, students) and a recent attempts table.

### Navigation

| Section | Description |
|---|---|
| **Questions** | Create/edit/delete multiple-choice questions. Each question belongs to one section. Filter by text, section, or audio presence. |
| **Sections** | Timed question groups with scoring config. Filter by name/key or test. Questions are shown inline — click the count to jump to questions filtered by that section. Hover over "Part of test" to see test names. |
| **Tests** | Combine sections with scoring modes (SUM, lowest, highest, PERCENTAGE with weight validation). Sections are drag-reorderable. |
| **Groups** | Schedule a test for a cohort with start/end time and certificate delay. Filter by name or test. Assign students — student table shows names, emails, codes, and certificate flags. |
| **Students** | Create students with auto-generated test codes, email, and phone. Certificate toggle. Click a student name to see their detail page. |
| **Results** | Per-group section-score breakdown with totals. |

### Entity relationships

```
Question ──belongs to──▶ Section ──assigned to──▶ Test ──used by──▶ Group ◀──has──▶ Student
                                                                     │
                                                                     ▼
                                                                 Attempt / Scores
```

- A question belongs to exactly **one** section (one-to-many).
- Sections are reusable across tests. Tests are reusable across groups.
- Students are assigned to groups and receive a unique test code.

### View mode

Every entity has a read-only "View" option that shows a clean detail card instead of editable form fields:
- **Questions**: modal showing text, options with correct answer marked, audio URL, and linked section.
- **Sections**: summary card with key/name/time/score/randomize, ordered question list, score map, linked tests and groups.
- **Tests**: summary card with name/scoring mode, ordered section list with weights, linked groups.
- **Students**: detail page with name/email/phone/code/certificate, groups list, and scores table with section breakdowns.

All related entities are clickable — you can navigate from a question → section → test → groups → students and back.

### Filters and pagination

- **Questions**: text search, section dropdown, audio toggle.
- **Sections**: text search (name + key), test dropdown.
- **Groups**: text search, test dropdown.
- All tables have pagination with configurable page size (10, 25, 50) and full navigation controls.

### Design system

Built on **Laut Siang** tokens (teal-based palette), Plus Jakarta Sans, and Tabler Icons. Includes reusable primitives: `AppButton`, `AppInput`, `AppBadge`, `AppCard`, `AppModal`, `AppToast`, and admin components: `DataTable`, `DragList`, `ScoreMapEditor`, `ResultsTable`.

### `sectionKey` vs `displayName`

Sections have two name fields:
- `sectionKey` — unique admin identifier (e.g. `listening-toefl`, `listening-ielts`).
- `displayName` — what students see (e.g. "Listening").

This lets teachers create multiple sections with the same student-facing label but different internal purposes.

---

## Known limitations

- Admin session is memory-only — refresh clears login state; just log in again.
- All data is sample/local — changes reset on page refresh (no real API/persistence yet).
- `/dev/ui` is a design-system smoke page available only in development (`npm run dev`).

## Build

```bash
npm run build
npm run preview
```

## Project structure

```
├── assets/css/          Design tokens + global styles
├── components/
│   ├── ui/              Reusable primitives (AppButton, AppInput, …)
│   ├── test/            Student test-taking components
│   ├── certificate/     Certificate view
│   └── admin/           DataTable, DragList, ScoreMapEditor, ResultsTable, SidebarNav
├── composables/         useTimer, useFullscreen, useTabSwitch, useAudio
├── data/                Sample fixtures (student + admin)
├── docs/                PRD, milestones, design, flow, FE/BE specs, plans
├── layouts/             blank, student, default (admin chrome)
├── middleware/           Admin auth guard
├── pages/
│   ├── admin/           Login, dashboard, questions, sections, tests, groups, students, results
│   ├── test/            Student test runner, section-done, complete
│   └── certificate/     Shareable certificate + PDF download
├── stores/              Pinia stores (auth, admin, test, toast)
├── types/               TypeScript interfaces
└── openspec/            Change artifacts and specs
```
