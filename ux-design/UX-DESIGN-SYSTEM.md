# MultiLanguageManager - UX Design System

**Project:** MultiLanguageManager  
**Type:** Internal Developer Tool / Dashboard  
**Date:** 2026-02-28  
**Status:** Design System Established

---

## Design Overview

### Product Philosophy

MultiLanguageManager is a **developer-focused internal tool** designed to streamline multilingual text management across iOS, Android, and Web platforms. The design emphasizes **efficiency, clarity, and automation** over decorative elements.

### Core Design Principles

1. **Efficiency First** - Reduce time-to-task for product managers (10-minute upload) and developers (30-second sync)
2. **Clarity Over Beauty** - Prioritize information density and clear status indicators
3. **Minimal Friction** - Streamlined workflows with minimal clicks
4. **Developer-Centric** - Technical precision, API visibility, script integration focus

---

## Visual Design System

### Color Palette

| Role | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Primary | `#1E293B` (Slate 800) | `--color-primary` | Headers, sidebar, primary text |
| Secondary | `#334155` (Slate 700) | `--color-secondary` | Borders, secondary text, disabled states |
| CTA/Accent | `#3B82F6` (Blue 500) | `--color-cta` | Primary buttons, success states, active elements |
| Background | `#0F172A` (Slate 900) | `--color-background` | Page background, dark mode |
| Text | `#F8FAFC` (Slate 50) | `--color-text` | Body text, headings |
| Error | `#EF4444` (Red 500) | `--color-error` | Error states, validation errors |
| Warning | `#F59E0B` (Amber 500) | `--color-warning` | Warning states, pending actions |
| Info | `#22C55E` (Green 500) | `--color-info` | Information states, help text |

### Typography

- **Heading Font:** Archivo (weights 300, 400, 500, 600, 700)
- **Body Font:** Space Grotesk (weights 300, 400, 500, 600, 700)
- **Mood:** Minimal, technical, clean, modern

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
```

**Type Scale:**

| Element | Font Size | Weight | Line Height |
|---------|-----------|--------|-------------|
| H1 (Page Title) | 40px / 2.5rem | 700 | 1.2 |
| H2 (Section Title) | 32px / 2rem | 600 | 1.3 |
| H3 (Card Title) | 24px / 1.5rem | 600 | 1.4 |
| Body | 16px / 1rem | 400 | 1.6 |
| Small / Caption | 14px / 0.875rem | 400 | 1.5 |
| Code | 14px / 0.875rem | 400 | 1.6 |

### Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Icon gaps, tight spacing |
| `--space-sm` | `8px` / `0.5rem` | Small gaps, label spacing |
| `--space-md` | `16px` / `1rem` | Standard padding, button spacing |
| `--space-lg` | `24px` / `1.5rem` | Card padding, section spacing |
| `--space-xl` | `32px` / `2rem` | Large gaps, card margins |
| `--space-2xl` | `48px` / `3rem` | Section margins, hero padding |
| `--space-3xl` | `64px` / `4rem` | Page padding, large sections |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px` | Small elements, badges |
| `--radius-md` | `8px` | Buttons, inputs |
| `--radius-lg` | `12px` | Cards |
| `--radius-xl` | `16px` | Modals |

---

## Component Library

### Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--color-cta);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 200ms ease;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

#### Secondary Button
```css
.btn-secondary {
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-cta);
  border: 2px solid var(--color-cta);
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
}

.btn-secondary:hover {
  background: rgba(59, 130, 246, 0.2);
}
```

#### Danger Button
```css
.btn-danger {
  background: var(--color-error);
  color: white;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 200ms ease;
}

.btn-danger:hover {
  opacity: 0.9;
}
```

### Cards

```css
.card {
  background: var(--color-background);
  border: 1px solid var(--color-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
}

.card-hover {
  cursor: pointer;
}

.card-hover:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--color-cta);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid var(--color-secondary);
  border-radius: var(--radius-md);
  font-size: 16px;
  background: var(--color-background);
  color: var(--color-text);
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: var(--color-cta);
  outline: none;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-error {
  border-color: var(--color-error);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
```

### Modals

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--color-background);
  border: 1px solid var(--color-secondary);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  box-shadow: var(--shadow-xl);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}
```

### Status Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-cta);
  border: 1px solid var(--color-cta);
}

.badge-error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
  border: 1px solid var(--color-error);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
  border: 1px solid var(--color-warning);
}

.badge-info {
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-info);
  border: 1px solid var(--color-info);
}
```

---

## Layout Patterns

### Dashboard Layout

**Structure:** Fixed sidebar + Scrollable content area

```
┌─────────────────────────────────────────────────┐
│  Sidebar (fixed)  │  Main Content (scrollable) │
│  - Logo           │                             │
│  - Navigation     │  Page Header                │
│  - Projects List  │  - Breadcrumb              │
│                   │  - Actions (right)          │
│                   │                             │
│                   │  Content Area               │
│                   │  - Cards / Tables            │
│                   │  - Filters / Search         │
│                   │                             │
└─────────────────────────────────────────────────┘
```

**Sidebar:**
- Width: 280px
- Background: Dark (#0F172A)
- Fixed position
- Links with icons and labels
- Active state: highlight with green accent

**Main Content:**
- Padding: 32px
- Max-width: 1400px
- Center-aligned
- Scrollable vertically

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column, hamburger menu |
| Tablet | 768px - 1024px | Sidebar collapses to icons |
| Desktop | > 1024px | Full sidebar + content |

---

## Interaction Patterns

### File Upload Flow

1. **Upload Zone**
   - Large drop zone with dashed border
   - Drag & drop enabled
   - Click to browse files
   - Show supported formats (.xlsx only)
   - Show max file size (e.g., 10MB)

2. **Upload Progress**
   - Progress bar (0-100%)
   - Real-time status text
   - Cancel button (if upload is in progress)
   - Estimated time remaining

3. **Preview & Confirm**
   - Table preview of uploaded data
   - Highlight:
     - New records (green badge)
     - Modified records (yellow badge)
     - Deleted records (red badge)
   - Show validation errors
   - Confirm/Cancel buttons

4. **Success/Error State**
   - Success: Checkmark animation, summary statistics
   - Error: Error message, retry button, download error log

### Bulk Operations

1. **Selection**
   - Checkbox column in table
   - Select all / Deselect all
   - Show selected count
   - Keyboard shortcuts (Ctrl+A, Shift+Click)

2. **Action Confirmation**
   - Modal with action description
   - Show affected items count
   - Show preview of changes
   - Confirm/Cancel buttons

3. **Progress Tracking**
   - Real-time progress bar
   - Show current item / total items
   - Cancel button
   - Estimated time remaining

4. **Completion**
   - Success message with statistics
   - Show any errors or warnings
   - Option to download detailed report

---

## UX Guidelines

### Form Validation

- **Real-time validation** on blur
- **Clear error messages** below each input
- **Visual feedback** (red border, error icon)
- **Disable submit** until all validations pass

### Data Tables

- **Horizontal scroll** on mobile (overflow-x-auto)
- **Sortable columns** with sort indicators
- **Pagination** for large datasets
- **Row hover state** for clarity
- **Action buttons** in last column

### Feedback & Loading

- **Loading states**: Spinner or skeleton loader
- **Progress indicators**: Progress bars for long operations
- **Success messages**: Toast notifications
- **Error messages**: Clear, actionable error text
- **Empty states**: Friendly message with CTA to take action

### Accessibility

- **Keyboard navigation**: Tab through all interactive elements
- **Skip to main content**: "Skip to main content" link for keyboard users
- **Focus states**: Visible outline (2px blue)
- **ARIA labels**: Screen reader labels for icons and buttons
- **Color contrast**: Minimum 4.5:1 for text
- **Reduced motion**: Respect `prefers-reduced-motion` setting

**Skip Navigation Implementation:**
```css
.skip-nav {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-cta);
  color: white;
  padding: 8px;
  z-index: 100;
  transition: top 0.3s;
}

.skip-nav:focus {
  top: 0;
}
```

**Responsive Typography:**
```css
@media (max-width: 767px) {
  h1 { font-size: 2rem; /* 32px */ }
  h2 { font-size: 1.5rem; /* 24px */ }
  h3 { font-size: 1.25rem; /* 20px */ }
}
```

---

## Page-Specific Designs

### 1. Login Page
- Centered card layout
- Logo at top
- Email/password inputs
- "Remember me" checkbox
- Login button (full width)
- Forgot password link
- No external auth (internal tool)

### 2. Dashboard / Project List
- Sidebar navigation
- Project cards grid
- Each card shows:
  - Project name
  - Description (truncated)
  - Language count badge
  - Last updated date
  - Quick actions (Edit, Delete, Download)
- "Create New Project" button (top right)
- Search and filter options

### 3. Project Detail
- Project header with name and description
- Tabs:
  - Text Entries (default)
  - Settings
  - API Keys
  - Export History
- Text Entries table:
  - UUID (key)
  - CN, DA, DE, EN, ES, FI, FR, IT, NL, NO, PL, SE columns
  - Actions (Edit, Delete)
- Bulk actions toolbar
- "Upload Excel" button (primary CTA)
- Search and filter options

### 4. Upload Excel Page
- Large drop zone
- File format requirements
- Template download link
- Upload progress bar
- Preview table
- Confirm/Cancel actions

### 5. Export/Download Page
- Select project dropdown
- Select platform checkboxes (iOS, Android, Web)
- Select language checkboxes
- "Download" button (primary CTA)
- API endpoint display (for scripts)
- Download history table

### 6. Settings Page
- Project name input
- Description textarea
- Supported languages multiselect
- API Key management (generate, revoke)
- Delete project (danger zone)

---

## Technical Integration Notes

### API Integration

- **Script download page** should include:
  - Project ID
  - API Key
  - Endpoints documentation
  - Code snippets for Groovy, Shell, Node.js

- **Rate limiting display**: Show API usage and limits
- **Error handling**: Display API errors clearly to users

### Performance Targets

- Page load time: < 2 seconds
- Excel upload: < 30 seconds (1000 rows)
- API response time: < 10 seconds (1000 text entries)
- Interactive feedback: < 500ms

---

## Pre-Delivery Checklist

Before delivering any UI, verify:

- [ ] No emojis as icons (use Heroicons/Lucide SVG)
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states use color/opacity, not scale transforms
- [ ] All form inputs have labels (no placeholder-only inputs)
- [ ] Tables handle mobile overflow (horizontal scroll)
- [ ] Fixed navigation elements don't overlap content
- [ ] Progress indicators shown for long operations
- [ ] Loading states provided for async operations
- [ ] Error messages are clear and actionable
- [ ] Focus states visible for keyboard navigation
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] `prefers-reduced-motion` respected
- [ ] No horizontal scroll on mobile

---

## Next Steps

1. Create detailed page wireframes (Figma/Sketch)
2. Design component library (Storybook)
3. Create HTML/Tailwind prototypes
4. User testing with product managers and developers
5. Iterate based on feedback
6. Finalize design specifications
7. Hand off to development team

