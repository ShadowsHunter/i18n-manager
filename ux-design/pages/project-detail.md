# Project Detail Page

**Page ID:** project-detail  
**User Type:** Product Managers, Developers, Admins  
**Priority:** High  

---

## Page Overview

The Project Detail page is the central hub for managing multilingual text entries within a specific project. It allows users to view, search, filter, edit, and delete text entries across all supported languages.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  Logo                    MultiLanguageManager          User Avatar │
├──────────┬──────────────────────────────────────────────────────────┤
│          │  [Breadcrumb: Home > My Project]                         │
│          │                                                           │
│  Sidebar  │  Header                                                 │
│  - Logo   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  - Home   │                                                           │
│  - Projects│  My Project                                             │
│  - Settings│                                                           │
│           │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│           │                                                           │
│           │  [Tab Navigation]                                         │
│           │  [Text Entries] [Settings] [API Keys] [Export History]  │
│           │                                                           │
│           │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│           │                                                           │
│           │  [Search: Search by UUID or text...]  [Filter: ▼]       │
│           │                                                           │
│           │  [Bulk Actions] [Upload Excel] [+ Add Entry]             │
│           │                                                           │
│           │  ┌──────────────────────────────────────────────────────┐ │
│           │  │ ☐  UUID             │ CN  │ EN  │ DE  │ Actions    │ │
│           │  │ ☐  [truncated...]  │ ... │ ... │ ... │ [Edit][🗑] │ │
│           │  │ ☐  [truncated...]  │ ... │ ... │ ... │ [Edit][🗑] │ │
│           │  │ ☐  [truncated...]  │ ... │ ... │ ... │ [Edit][🗑] │ │
│           │  │ ...                                              │ │
│           │  │                                                  │ │
│           │  │ [Rows per page: 20 ▼]  [←]  Page 1 of 5  [→]    │ │
│           │  └──────────────────────────────────────────────────────┘ │
│           │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

---

## Components

### Header

**Elements:**
- Breadcrumb: "Home > [Project Name]"
- Title: Project name (large, bold)
- Back button (left)
- Project actions (right):
  - "Export" button (secondary)
  - "Settings" button (icon)

### Tab Navigation

**Tabs:**
1. **Text Entries** (default, active)
   - Shows all text entries in table
   - Search and filter functionality
   - Bulk actions
   - Add/edit/delete operations

2. **Settings**
   - Project configuration
   - Language settings
   - Project metadata

3. **API Keys**
   - Manage API keys
   - Generate new keys
   - Revoke existing keys
   - View API documentation

4. **Export History**
   - View past exports
   - Download previous versions
   - Export statistics

**Tab Behavior:**
- Click to switch tabs
- Active tab: Blue underline + bold text
- Tab content switches without page reload (SPA behavior)

### Search & Filter Bar

**Elements:**
- Search input (left)
  - Placeholder: "Search by UUID or text..."
  - Icon: Search icon (left)
  - Width: 400px
  - Real-time filtering

- Filter dropdown (right of search)
  - Options:
    - All entries
    - New entries
    - Modified entries
    - Entries with missing translations
    - Entries with errors
  - Badge showing count for each option
  - Multi-select support (future)

**Search Behavior:**
- Searches across:
  - UUID (key)
  - All language columns
- Debounced (300ms)
- Highlights matching text in results
- Empty state: "No entries found matching '[search term]'"

### Bulk Actions Toolbar

**Elements:**
- Checkbox for "Select All"
- Selected count badge: "[N] selected"
- Bulk action buttons:
  - "Export Selected" (dropdown: iOS/Android/Web/All)
  - "Delete Selected" (danger, primary)
  - "Edit Selected" (batch edit modal)

**Behavior:**
- Disabled when no rows selected
- Enabled when ≥1 row selected
- Confirmation modal for destructive actions (delete)

### Action Buttons

**Primary Buttons:**
1. **Upload Excel** - Opens upload modal
2. **+ Add Entry** - Opens create entry modal

**Button Placement:**
- Right-aligned in toolbar
- Upload Excel: Primary (blue)
- Add Entry: Secondary

### Text Entries Table

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│ ☐ │ UUID (key)      │ CN │ EN │ DE │ ES │ ... │ Actions          │
├────┼─────────────────┼────┼────┼────┼────┼─────┼─────────────────┤
│ ☐  │ 550e8400-e29b...│ 确定│ OK │ OK │ OK │ ... │ [Edit][🗑]      │
│ ☐  │ 6ba7b810-9dad...│ 取消│Cancel│Cancel│Cancel│...│ [Edit][🗑]      │
│ ☐  │ ...             │ ...│ ...│ ...│ ...│ ... │ ...             │
└────┴─────────────────┴────┴────┴────┴────┴─────┴─────────────────┘
```

**Columns:**

1. **Checkbox Column** (width: 40px)
   - Checkbox for row selection
   - "Select All" in header

2. **UUID (key) Column** (width: 200px, sticky)
   - Truncated with ellipsis
   - Full UUID on hover (tooltip)
   - Monospace font
   - Copy button on hover

3. **Language Columns** (width: 150px each)
   - CN, DA, DE, EN, ES, FI, FR, IT, NL, NO, PL, SE
   - Truncated with ellipsis
   - Empty state: "-" or "⚠️" (missing translation)
   - Missing translation indicator: Yellow background

4. **Actions Column** (width: 100px)
   - Edit button (icon)
   - Delete button (icon)
   - View history button (icon, future)

**Table Behavior:**
- Horizontal scroll for language columns
- Sticky header
- Sticky first column (UUID)
- Row hover: Light blue background
- Row selection: Blue border
- Sortable columns (click header)
- Pagination: 20/50/100 rows per page

### Pagination

**Elements:**
- Rows per page dropdown (left)
  - Options: 10, 20, 50, 100
  - Default: 20

- Pagination controls (right)
  - Previous button (←)
  - Page indicator: "Page [N] of [M]"
  - Next button (→)
  - Jump to page input

**Behavior:**
- Disable Prev on first page
- Disable Next on last page
- Preserve selection across pages (via local storage)
- Jump to page on Enter key

---

## User Flows

### Viewing Text Entries

1. User navigates to Project Detail page
2. User sees table with all entries
3. User can:
   - Search entries
   - Filter by status
   - Sort columns
   - Paginate through results

### Adding a New Entry

1. User clicks "+ Add Entry" button
2. Modal opens with form:
   - UUID (optional, auto-generated if empty)
   - Language fields (12 inputs)
   - Context/Notes (optional, textarea)
3. User fills form and clicks "Save"
4. Loading state
5. Success: Modal closes, toast appears, entry added to table

### Editing an Entry

1. User clicks "Edit" button on entry row
2. Modal opens with pre-filled form
3. User modifies fields
4. User clicks "Save"
5. Loading state
6. Success: Modal closes, toast appears, entry updated

### Deleting an Entry

1. User clicks "Delete" button on entry row
2. Confirmation modal opens:
   - "Are you sure you want to delete this entry?"
   - Show UUID and language samples
   - "This action cannot be undone"
3. User clicks "Delete" button
4. Loading state
5. Success: Modal closes, entry removed with animation

### Bulk Delete

1. User selects multiple rows (checkboxes)
2. "Delete Selected" button becomes enabled
3. User clicks "Delete Selected"
4. Confirmation modal:
   - "Delete [N] selected entries?"
   - "This action cannot be undone"
5. User confirms
6. Loading state with progress
7. Success: Entries removed, toast appears

### Copying UUID

1. User hovers over UUID column
2. Copy button appears
3. User clicks copy button
4. Toast: "UUID copied to clipboard"

### Bulk Export

1. User selects multiple rows
2. User clicks "Export Selected" dropdown
3. User selects format (iOS/Android/Web/All)
4. Download begins
5. Success: Toast: "Exported [N] entries to [format]"

---

## Modals

### Add/Edit Entry Modal

**Content:**
- Title: "Add New Entry" or "Edit Entry"
- Form fields:
  - UUID (optional, auto-generated)
    - Help text: "Leave empty to auto-generate"
    - Validation: Must be unique
  - Language fields (12 text inputs)
    - Each with language label (CN, DA, DE, etc.)
    - Character count indicator
    - Translation status indicator
  - Context/Notes (optional textarea)
    - Help text: "Add context for translators"
- Buttons:
  - Cancel (secondary)
  - Save (primary, disabled until valid)

**Validation:**
- At least one language must have text
- UUID must be unique (if provided)
- Character limits (optional, per project settings)

### Delete Confirmation Modal

**Content:**
- Warning icon (red)
- Heading: "Are you sure you want to delete this entry?"
- Show entry details:
  - UUID
  - Sample text (first 2 languages)
- Warning text: "This action cannot be undone"
- Buttons:
  - Cancel (secondary)
  - Delete (danger, primary)

---

## States

### Loading State

- Skeleton loader for table
- Shimmer effect on rows
- Disabled actions

### Empty State (No Entries)

- Large icon: Empty file or document
- Heading: "No text entries yet"
- Description: "Upload an Excel file or add entries manually to get started"
- Buttons:
  - Upload Excel (primary)
  - Add Entry (secondary)

### Search Results State

- Table shows matching entries
- Clear search button appears
- "Showing [N] results for '[search term]'"

### Selected State

- Selected rows highlighted with blue border
- Bulk actions toolbar enabled
- Selected count badge visible

---

## Responsive Behavior

### Desktop (> 1024px)
- Full table with all columns
- Sidebar: Full width (280px)
- Pagination: Desktop layout

### Tablet (768px - 1024px)
- Sidebar: Icons only (64px)
- Table: Show first 4 language columns
- Horizontal scroll for rest
- Search: Reduced width (250px)

### Mobile (< 768px)
- Sidebar: Hamburger menu
- Table: Card layout instead of table
  - Each entry as a card
  - Expandable to show all languages
- Search: Full width
- Bulk actions: Slide-up panel
- Pagination: Mobile layout

**Mobile Card Layout:**
```
┌─────────────────────────┐
│ UUID                    │
│ 550e8400-e29b...  [Copy]│
│ ━━━━━━━━━━━━━━━━━━━━━━  │
│ CN: 确定                │
│ EN: OK                  │
│ DE: OK                  │
│ [+ Show All Languages]  │
│                         │
│ [Edit] [Delete]         │
└─────────────────────────┘
```

---

## Accessibility

### Keyboard Navigation

- Tab order: Search → Filter → Upload → Add Entry → Table rows
- Enter/Space: Activate buttons
- Arrow keys: Navigate table rows
- Ctrl/Cmd + Click: Multi-select rows
- Ctrl/Cmd + A: Select all rows

### ARIA Labels

- Table: `role="table"`
- Table header: `role="columnheader"`
- Row checkbox: `aria-label="Select this entry"`
- Select All: `aria-label="Select all entries"`
- Search input: `aria-label="Search entries"`
- Filter dropdown: `aria-label="Filter entries"`

### Screen Reader Support

- Announce selection changes
- Announce filter changes
- Announce search results count
- Announce pagination changes

---

## Technical Specifications

### API Endpoints

- **GET /api/projects/:id/entries** - Fetch all entries
  - Query params: `?search=term&filter=status&page=1&limit=20`
  - Response: Paginated entries

- **POST /api/projects/:id/entries** - Create new entry
  - Request: Entry data
  - Response: Created entry

- **PUT /api/projects/:id/entries/:uuid** - Update entry
  - Request: Updated entry data
  - Response: Updated entry

- **DELETE /api/projects/:id/entries/:uuid** - Delete entry
  - Response: 204 No Content

- **DELETE /api/projects/:id/entries** - Bulk delete
  - Request: Array of UUIDs
  - Response: Bulk delete confirmation

### Data Structure

```typescript
interface TextEntry {
  uuid: string;
  cn?: string;
  da?: string;
  de?: string;
  en?: string;
  es?: string;
  fi?: string;
  fr?: string;
  it?: string;
  nl?: string;
  no?: string;
  pl?: string;
  se?: string;
  context?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationResponse {
  data: TextEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## Performance Considerations

- **Virtual scrolling:** For large datasets (> 1000 rows)
- **Debounce search:** 300ms delay before API call
- **Lazy loading:** Load images/icons on demand
- **Pagination:** Server-side pagination, not client-side
- **Caching:** Cache entries for 5 minutes
- **Bulk operations:** Process in batches (100 entries at a time)

---

## Success Metrics

- **Initial load time:** < 2 seconds
- **Search response time:** < 300ms
- **Add entry time:** < 2 seconds (including server)
- **Edit entry time:** < 2 seconds (including server)
- **Delete entry time:** < 1 second (including server)
- **Bulk delete time:** < 5 seconds (100 entries)

---

## Future Enhancements

### Advanced Search

- Regex search support
- Search by language
- Search by date range
- Saved search filters

### Bulk Edit

- Batch edit modal
- Apply changes to multiple entries
- Preview before applying

### Version History

- View entry history
- Compare versions
- Rollback to previous version

### Translation Status

- Visual indicator for translation completeness
- Progress bar per entry
- Missing translation alerts

### Export Options

- Custom export templates
- Select specific languages
- Export by date range
- Export by status

