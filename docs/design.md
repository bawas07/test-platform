# [PROJECT NAME] — Design System

## Design philosophy
Clean, focused, and calm. The UI should never compete with the test content — every visual decision serves one goal: keeping the student's attention on the question in front of them. For the admin side, clarity and efficiency over decoration — the teacher needs to get things done fast.

## Typography

### Typeface
**Plus Jakarta Sans** — Google Fonts, loaded via CDN.

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
font-family: 'Plus Jakarta Sans', sans-serif;
```

### Scale

| Token | Size | Weight | Line height | Usage |
|---|---|---|---|---|
| `--text-xs` | 12px | 400 | 1.5 | Captions, meta, timestamps |
| `--text-sm` | 14px | 400 | 1.5 | Secondary labels, helper text |
| `--text-base` | 16px | 400 | 1.7 | Body text, question content |
| `--text-md` | 18px | 500 | 1.5 | Section headings, card titles |
| `--text-lg` | 24px | 600 | 1.3 | Page headings |
| `--text-xl` | 32px | 700 | 1.2 | Timer display, score on certificate |
| `--text-2xl` | 48px | 700 | 1.1 | Certificate name display |

### Rules
- Always sentence case — never ALL CAPS or Title Case in UI labels.
- Body text for question content uses `--text-base` at weight 400 — never bold the question stem, it creates visual noise during timed reading.
- Timer display uses `--text-xl` monospace fallback (`font-variant-numeric: tabular-nums`) so digits don't shift width as the countdown changes.

---

## Color palette — Laut Siang

### Base tokens

```css
:root {
  /* Surfaces */
  --color-bg-page:     #F5F8F8;   /* outer page background */
  --color-bg-card:     #FFFFFF;   /* cards, panels, modals */
  --color-bg-tint:     #E0F7FA;   /* subtle teal tint — highlights, selected states */

  /* Primary — teal */
  --color-primary:     #00BFA5;   /* buttons, links, active states */
  --color-primary-dark:#00796B;   /* hover states, dark teal headings */
  --color-primary-text:#FFFFFF;   /* text on primary bg */

  /* Text */
  --color-text-primary:  #1C2B36; /* headings, body */
  --color-text-secondary:#546E7A; /* labels, placeholders, meta */
  --color-text-muted:    #90A4AE; /* disabled, hints */
  --color-text-inverse:  #FFFFFF; /* text on dark/teal bg */

  /* Semantic */
  --color-danger:      #FF5252;   /* time's up, 2nd strike, error states */
  --color-danger-bg:   #FFF5F5;   /* danger tint background */
  --color-warning:     #FFB300;   /* 1st strike warning, caution */
  --color-warning-bg:  #FFFBEA;   /* warning tint background */
  --color-success:     #00897B;   /* correct answer reveal (if ever used), completed states */
  --color-success-bg:  #E0F2F1;   /* success tint background */

  /* Borders */
  --color-border:      #CFD8DC;   /* default hairline */
  --color-border-strong:#90A4AE;  /* hover, focus rings */

  /* Timer urgency — applied progressively as time runs out */
  --color-timer-safe:    #1C2B36; /* > 60s remaining */
  --color-timer-warning: #FFB300; /* 30–60s remaining */
  --color-timer-danger:  #FF5252; /* < 30s remaining */
}
```

### Semantic usage map

| Context | Token |
|---|---|
| Page background | `--color-bg-page` |
| Card / modal / panel | `--color-bg-card` |
| Primary button bg | `--color-primary` |
| Primary button hover | `--color-primary-dark` |
| Active nav item | `--color-bg-tint` + left border `--color-primary` |
| Selected answer option | `--color-bg-tint` + border `--color-primary` |
| 1st tab-switch strike warning | `--color-warning` banner |
| 2nd strike / section force-close | `--color-danger` banner |
| Timer > 60s | `--color-timer-safe` |
| Timer 30–60s | `--color-timer-warning` |
| Timer < 30s | `--color-timer-danger` (pulse animation) |
| Audio played / disabled | `--color-text-muted` + disabled cursor |
| Section completed badge | `--color-success` bg, `--color-text-inverse` text |

---

## Spacing

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
}
```

Use multiples of 4px. No arbitrary pixel values.

---

## Border radius

```css
:root {
  --radius-sm:   4px;   /* inputs, badges, small chips */
  --radius-md:   8px;   /* buttons, cards */
  --radius-lg:   12px;  /* modals, panels */
  --radius-full: 9999px; /* pills, avatar circles */
}
```

---

## Elevation / shadow

Flat-first design — shadows used sparingly, only to separate overlapping layers.

```css
:root {
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.10); /* modals only */
}
```

---

## Reusable components

### Button

Three variants. All use Plus Jakarta Sans 500, 14px, sentence case.

```
Primary   — bg: --color-primary,      text: white,                   hover: --color-primary-dark
Secondary — bg: transparent,          text: --color-primary,         border: --color-primary,    hover: bg --color-bg-tint
Danger    — bg: --color-danger,       text: white,                   hover: darken 10%
Ghost     — bg: transparent,          text: --color-text-secondary,  hover: bg --color-bg-page
Disabled  — bg: --color-border,       text: --color-text-muted,      cursor: not-allowed
```

Sizes: `sm` (32px height, px-3), `md` (40px height, px-4 — default), `lg` (48px height, px-6).

---

### Input / Textarea

```
Default  — border: --color-border,        bg: white,   focus ring: --color-primary 2px
Error    — border: --color-danger,        bg: --color-danger-bg
Disabled — border: --color-border,        bg: --color-bg-page,   text: --color-text-muted
```

Label: `--text-sm` weight 500, `--color-text-primary`, 6px gap above input.
Helper text: `--text-xs`, `--color-text-secondary`.
Error text: `--text-xs`, `--color-danger`.

---

### Badge / Chip

Inline status indicators. Small pill shape (`--radius-full`), `--text-xs` weight 500.

| Variant | bg | text |
|---|---|---|
| `success` | `--color-success-bg` | `--color-success` |
| `warning` | `--color-warning-bg` | `#B45309` (amber dark) |
| `danger` | `--color-danger-bg` | `--color-danger` |
| `neutral` | `--color-bg-page` | `--color-text-secondary` |
| `primary` | `--color-bg-tint` | `--color-primary-dark` |

---

### Card

```
bg: --color-bg-card
border: 1px solid --color-border
border-radius: --radius-lg
padding: --space-6
box-shadow: --shadow-sm
```

---

### Timer display

The most critical UI element on the test runner. Lives in a sticky top bar throughout the section.

```
font-size: --text-xl (32px)
font-weight: 700
font-variant-numeric: tabular-nums
letter-spacing: 0.02em
color: transitions through --color-timer-safe → warning → danger
```

When `< 30s`: add a subtle pulse animation (`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`, 1s loop) on the timer number — enough to signal urgency without being distracting.

---

### Audio player

Single-use audio control for listening questions. No scrub bar, no volume control, no replay.

```
States:
  idle    — play button (teal, --color-primary), label: "Play audio"
  playing — animated waveform icon or spinner, label: "Playing...", button disabled
  done    — greyed out icon (--color-text-muted), label: "Audio played", cursor: not-allowed

Width: full width of question card
Height: 56px fixed
Border-radius: --radius-md
Background: --color-bg-tint when idle, --color-bg-page when done
```

---

### Answer option

Multiple-choice option row. Full-width, tappable/clickable area.

```
Default   — bg: white, border: --color-border, text: --color-text-primary
Hover     — bg: --color-bg-tint, border: --color-primary
Selected  — bg: --color-bg-tint, border: --color-primary (2px), text: --color-primary-dark, left accent bar
Disabled  — bg: --color-bg-page, border: --color-border, text: --color-text-muted (when section closed)

Height: min 56px (taller for longer answer text)
Border-radius: --radius-md
Padding: --space-4
Option label (A/B/C/D): --text-sm weight 600, --color-primary, min-width 24px
```

---

### Strike warning banner

Full-width banner injected above the question area on 1st tab-switch strike.

```
1st strike — bg: --color-warning-bg, border-left: 4px solid --color-warning
             text: "Warning: switching tabs is not allowed. One more and this section will be submitted."
2nd strike — bg: --color-danger-bg, border-left: 4px solid --color-danger
             text: "Section submitted due to tab switching." (then auto-advance)
```

---

### Modal / overlay

Used for: confirm start, section transition, test complete.

```
Backdrop:  rgba(28, 43, 54, 0.6)   ← --color-text-primary at 60% opacity
Panel:     bg: --color-bg-card, border-radius: --radius-lg, shadow: --shadow-lg
Max-width: 480px, centered
Padding:   --space-8
```

---

### Progress indicator (section nav)

Horizontal row of section status dots/pills shown above the timer. Not clickable (fixed order, no going back).

```
Not started — neutral badge
In progress — primary badge + pulsing dot
Completed   — success badge + checkmark icon
Auto-closed — danger badge + x icon
```

---

### Drag-and-drop reorder (admin only)

Used in section question ordering and test section ordering.

```
Drag handle: ti-grip-vertical icon (--color-text-muted), left side of row
Row hover: bg: --color-bg-tint, show drag cursor
Dragging:  shadow: --shadow-md, slight scale(1.01), opacity 0.95
Drop zone: dashed border --color-primary, bg: --color-bg-tint
```

---

## Page layouts

### Student pages — full-width centered, max-width 680px

Clean single-column layout. No sidebar. No distractions.

```
Page bg:    --color-bg-page
Content:    max-width 680px, centered, padding --space-6
Top bar:    sticky, bg: --color-bg-card, border-bottom: --color-border
            contains: [project name/logo] [section name] [timer]
```

### Admin pages — sidebar + content

```
Sidebar:    width 240px, bg: --color-bg-card, border-right: --color-border
Content:    flex-1, bg: --color-bg-page, padding --space-8
Top bar:    sticky, bg: --color-bg-card, border-bottom: --color-border
            contains: [page title] [action buttons]
```

---

## Certificate design

Shareable URL, downloadable as PDF via browser print / `html2pdf.js`.

```
Layout:     A4 portrait, centered content
Background: white with subtle teal top border (8px, --color-primary)
Logo/name:  top center
Body:
  "This certifies that"
  [Student name]   ← --text-2xl, weight 700, --color-primary-dark
  "has completed"
  [Test name]      ← --text-lg, weight 600
  "on [date]"      ← --text-sm, --color-text-secondary
  "Score: [score]" ← --text-xl, weight 700, --color-primary
Footer:     teacher name or institution name (configurable), date generated
```

---

## Iconography

Use **Tabler Icons** (outline, consistent 1.5px stroke). Load via CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"/>
```

Key icons used:

| Context | Icon |
|---|---|
| Play audio | `ti-player-play` |
| Audio played/disabled | `ti-player-play` (muted) |
| Section complete | `ti-circle-check` |
| Section auto-closed | `ti-circle-x` |
| Timer | `ti-clock` |
| Warning / strike | `ti-alert-triangle` |
| Drag handle | `ti-grip-vertical` |
| Admin nav — questions | `ti-list` |
| Admin nav — sections | `ti-layout-list` |
| Admin nav — tests | `ti-file-description` |
| Admin nav — groups | `ti-users-group` |
| Admin nav — students | `ti-user` |
| Admin nav — results | `ti-chart-bar` |
| Download certificate | `ti-download` |
| Settings | `ti-settings` |

---

## Animation

Minimal. Purpose-driven only.

```css
/* Default transition for interactive elements */
transition: all 150ms ease;

/* Timer urgency pulse (< 30s) */
@keyframes timer-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.55; }
}

/* Section advance — content fade */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
animation: fade-in 200ms ease forwards;
```

No decorative motion. No page-transition slideshows. The test runner is a stress environment — animation should reduce anxiety, not add to it.
