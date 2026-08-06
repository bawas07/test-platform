# Test Platform

Online test platform for students. Phase 1 is a client-only student demo with sample data (no backend).

## Setup

```bash
npm install
npm run dev
```

Open the app at the URL shown in the terminal (usually `http://localhost:3000`).

## Demo code

Use this test code on the landing page (case-sensitive):

```text
DEMO2026
```

Any other code shows an invalid/expired error.

## Student walkthrough

1. Enter an invalid code → error message appears.
2. Enter `DEMO2026` → continue to the start screen with student/test details.
3. Click **Start test** → open the test runner.
4. Click **Enter fullscreen** (required gate; if the browser blocks fullscreen, the demo still continues with a note).
5. Answer questions; play audio once on listening items.
6. Use the floating **Demo** FAB to simulate integrity strikes:
   - **Strike 1** — warning banner
   - **Strike 2** — section auto-closes
7. Complete or close each section → section-done screen → continue through remaining sections.
8. After the last section → test complete → **Check certificate**.
9. On the certificate page, review the certificate and **Download PDF**.

## Notes

- Refresh mid-test resets sample state and returns you to code entry.
- `/dev/ui` is a design-system smoke page and is only available in development.
- There are no admin pages in Phase 1.

## Admin demo

The admin interface is available at `/admin`. Login with any email and password (demo mode).

### Walkthrough
1. Go to `/admin/login` — enter any email/password, click **Log in**
2. Dashboard shows stats and recent attempts
3. **Questions**: create, edit, delete sample questions with options
4. **Sections**: configure sections, reorder questions (drag), add score maps
5. **Tests**: create tests with scoring modes, assign sections, set PERCENTAGE weights
6. **Groups**: schedule test groups, assign students
7. **Students**: create students, auto-generated codes, certificate toggle
8. **Results**: view per-group results with section score breakdowns

**Known limitations:**
- Admin session is memory-only — refresh clears login state; just log in again
- All data is sample/local — changes reset on page refresh
- No real API/persistence until Phase 5

## Build

```bash
npm run build
npm run preview
```
