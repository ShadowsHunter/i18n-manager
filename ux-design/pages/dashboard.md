# Dashboard - Project List Page

**Page ID:** dashboard  
**User Type:** All users (Product Managers, Developers, Admins)  
**Priority:** High  

---

## Page Overview

The Dashboard is the entry point for all users. It displays a list of all projects the user has access to, with quick access to create new projects and navigate to existing ones.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  Logo                    MultiLanguageManager          User Avatar │
├──────────┬──────────────────────────────────────────────────────────┤
│          │  [Breadcrumb: Home]                                       │
│          │                                                           │
│  Sidebar  │  Header                                                 │
│  - Logo   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  - Home   │                                                           │
│  - Projects│  Projects                                              │
│  - Settings│                                                           │
│           │  [Search input]  [Filter: All/Active/Archived]        │
│           │                                                           │
│           │  [New Project] (primary button)                          │
│           │                                                           │
│           │  Project Cards Grid (2-3 columns)                        │
│           │                                                           │
│           │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐ │
│           │  │  Project 1    │  │  Project 2    │  │  Project 3    │ │
│           │  │  Description  │  │  Description  │  │  Description  │ │
│           │  │  🏷 12 langs  │  │  🏷 10 langs  │  │  🏷 8 langs   │ │
│           │  │  📅 2 days ago│  │  📅 1 week ago│  │  📅 Today     │ │
│           │  │               │  │               │  │               │ │
│           │  │  [Edit] [🗑]  │  │  [Edit] [🗑]  │  │  [Edit] [🗑]  │ │
│           │  └───────────────┘  └───────────────┘  └───────────────┘ │
│           │                                                           │
│           │  ┌───────────────┐  ┌───────────────┐                    │
│           │  │  Project 4    │  │  [Create New] │                    │
│           │  │  Description  │  │               │                    │
│           │  │  🏷 12 langs  │  │  Click to add │                    │
│           │  │  📅 3 days ago│  │  new project │                    │
│           │  │               │  │               │                    │
│           │  │  [Edit] [🗑]  │  │               │                    │
│           │  └───────────────┘  └───────────────┘                    │
│           │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

---

## Components

### Header

**Elements:**
- Breadcrumb: "Home"
- Title: "Projects"
- Search input (left aligned)
- Filter dropdown (left aligned, after search)
- "New Project" button (right aligned, primary CTA)

**Search Input:**
- Placeholder: "Search projects..."
- Icon: Search icon (left)
- Width: 300px
- Real-time filtering (no submit required)

**Filter Dropdown:**
- Options: All, Active, Archived
- Default: All
- Badge showing count for each option

### Sidebar

**Elements:**
- Logo at top
- Navigation items:
  - Home (Dashboard) - active state
  - Projects
  - Settings
- Bottom: User info (avatar, name, logout)

**Active State:**
- Blue accent bar on left
- Background: slightly lighter
- Icon color: blue

### Project Card

**Structure:**
```
┌────────────────────────────┐
│  Project Name              │
│  Truncated description...  │
│  ━━━━━━━━━━━━━━━━━━━━━━━  │
│  [Badge: 12 languages]     │
│  Last updated: 2 days ago  │
│                           │
│  [Edit] [Delete]          │
└────────────────────────────┘
```

**Elements:**
- **Title:** Project name (Archivo, 18px, weight 600)
- **Description:** Project description (truncated at 2 lines)
- **Language Count Badge:** Blue badge with icon + count
- **Last Updated:** Relative date (e.g., "2 days ago", "Today")
- **Actions:** Edit (icon button), Delete (icon button)

**Hover State:**
- Border color changes to blue
- Slight lift (translateY -2px)
- Box shadow increases

**Delete Confirmation:**
- Modal with:
  - "Are you sure you want to delete [Project Name]?"
  - Warning text: "This action cannot be undone"
  - Cancel button (secondary)
  - Delete button (danger, primary)

### "Create New Project" Card

**Purpose:** Encourage users to create their first project

**Elements:**
- Dashed border (instead of solid)
- Centered text: "Create New Project"
- Icon: Plus circle icon
- Hover: Background becomes light blue

**Behavior:**
- Click opens "New Project" modal

---

## User Flow

### Creating a New Project

1. User clicks "New Project" button or "Create New Project" card
2. Modal opens with form:
   - Project name (required)
   - Description (optional, textarea)
   - Supported languages (multiselect, default: all 12 languages)
3. User fills form and clicks "Create"
4. Loading state: Button shows spinner
5. Success: Modal closes, toast notification appears
6. New project card appears in grid (at beginning, sorted by date)

### Editing a Project

1. User clicks "Edit" icon on project card
2. Modal opens with pre-filled form
3. User modifies fields and clicks "Save"
4. Loading state
5. Success: Modal closes, toast appears, card updates

### Deleting a Project

1. User clicks "Delete" icon on project card
2. Confirmation modal opens
3. User clicks "Delete" button
4. Loading state
5. Success: Modal closes, card removed from grid with animation

### Searching Projects

1. User types in search input
2. Grid filters in real-time
3. Matching projects shown, non-matching hidden
4. Empty state: "No projects found matching '[search term]'"

---

## States

### Empty State (No Projects)

**Content:**
- Large icon: Empty folder or project icon
- Heading: "No projects yet"
- Description: "Create your first project to start managing multilingual text"
- Button: "Create New Project" (primary CTA)

### Loading State

**Content:**
- Skeleton loader cards (3-6)
- Each skeleton has:
  - Title bar (75% width)
  - Description bar (50% width)
  - Badge placeholder
  - Button placeholders

### Error State

**Content:**
- Error icon and message
- "Unable to load projects"
- Button: "Retry"
- Button: "Contact Support"

---

## Responsive Behavior

### Desktop (> 1024px)
- Full sidebar (280px)
- 3-column grid for project cards
- Full-width header

### Tablet (768px - 1024px)
- Sidebar collapses to icons only (64px)
- Tooltips on hover for navigation items
- 2-column grid for project cards
- Search and filter stack vertically

### Mobile (< 768px)
- Hamburger menu for sidebar
- Full-width overlay when sidebar open
- 1-column grid for project cards
- Search and filter stack vertically
- "New Project" button full width

---

## Accessibility

### Keyboard Navigation

- Tab order: Search → Filter → New Project button → Project cards (in reading order)
- Enter/Space: Activate buttons and cards
- Escape: Close modals

### ARIA Labels

- Search input: `aria-label="Search projects"`
- Filter dropdown: `aria-label="Filter projects"`
- New Project button: `aria-label="Create new project"`
- Project card: `role="article"`, `aria-label="[Project name]"`
- Edit button: `aria-label="Edit [Project name]"`
- Delete button: `aria-label="Delete [Project name]"`

### Focus States

- All interactive elements show 2px blue outline on focus
- Focus trap in modals

---

## Technical Specifications

### API Endpoints

- **GET /api/projects** - Fetch all projects
  - Query params: `?search=term&filter=active`
  - Response: Array of project objects

- **POST /api/projects** - Create new project
  - Request body: Project data
  - Response: Created project object

- **PUT /api/projects/:id** - Update project
  - Request body: Updated project data
  - Response: Updated project object

- **DELETE /api/projects/:id** - Delete project
  - Response: 204 No Content

### Data Structure

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  languages: string[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived';
}
```

---

## Performance Considerations

- **Initial load:** Fetch all projects in single request
- **Search:** Client-side filtering for < 100 projects, server-side for > 100
- **Pagination:** Virtual scrolling for > 50 projects
- **Caching:** Cache project list for 5 minutes
- **Skeleton loading:** Show skeletons while fetching data

---

## Success Metrics

- **Time to create project:** < 30 seconds
- **Search response time:** < 200ms
- **Card click response:** < 100ms
- **Page load time:** < 2 seconds

