# Upload Excel Page

**Page ID:** upload-excel  
**User Type:** Product Managers  
**Priority:** High  

---

## Page Overview

The Upload Excel page allows product managers to upload Excel files containing multilingual text entries. This is the primary workflow for bulk updating text across multiple languages.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  Logo                    MultiLanguageManager          User Avatar │
├──────────┬──────────────────────────────────────────────────────────┤
│          │  [Breadcrumb: Home > My Project > Upload]              │
│          │                                                           │
│  Sidebar  │  Header                                                 │
│  - Logo   │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  - Home   │                                                           │
│  - Projects│  Upload Excel for: My Project                          │
│  - Settings│                                                           │
│           │  ┌───────────────────────────────────────────────────┐  │
│           │  │                                                   │  │
│           │  │           Drag & Drop Excel File Here             │  │
│           │  │                                                   │  │
│           │  │              or                                   │  │
│           │  │                                                   │  │
│           │  │         [Browse Files]                           │  │
│           │  │                                                   │  │
│           │  │  Supported format: .xlsx | Max size: 10MB        │  │
│           │  │                                                   │  │
│           │  │  [Download Template] 📥                           │  │
│           │  │                                                   │  │
│           │  └───────────────────────────────────────────────────┘  │
│           │                                                           │
│           │  ┌───────────────────────────────────────────────────┐  │
│           │  │  Upload Progress                                 │  │
│           │  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│           │  │  ████████████████░░░░  75%                        │  │
│           │  │  Uploading... 2.5MB / 3.3MB (15s remaining)      │  │
│           │  │                                                  │  │
│           │  │              [Cancel]                              │  │
│           │  └───────────────────────────────────────────────────┘  │
│           │                                                           │
│           │  ┌───────────────────────────────────────────────────┐  │
│           │  │  Preview & Confirm                                │  │
│           │  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│           │  │                                                   │  │
│           │  │  Summary:                                         │  │
│           │  │  • 100 text entries found                        │  │
│           │  │  • [🟢] 85 new entries                           │  │
│           │  │  • [🟡] 10 modified entries                     │  │
│           │  │  • [🔴] 5 deleted entries                        │  │
│           │  │  • [⚠️] 2 validation errors                     │  │
│           │  │                                                   │  │
│           │  │  Preview Table (first 20 rows, scrollable):       │  │
│           │  │  ┌─────────────────────────────────────────────┐ │  │
│           │  │  │ UUID │ CN │ EN │ DE │ Status    │ Actions │ │  │
│           │  │  │ [🟢]  │ ...│ ...│ ...│ New       │ [Edit] │ │  │
│           │  │  │ [🟡]  │ ...│ ...│ ...│ Modified  │ [Edit] │ │  │
│           │  │  │ [🔴]  │ ...│ ...│ ...│ Deleted   │ -      │ │  │
│           │  │  │ [⚠️]  │ ...│ ...│ ...│ Error     │ [Fix]  │ │  │
│           │  │  └─────────────────────────────────────────────┘ │  │
│           │  │                                                   │  │
│           │  │  Validation Errors:                               │  │
│           │  │  • Row 23: Missing Finnish translation           │  │
│           │  │  • Row 45: Duplicate UUID detected              │  │
│           │  │                                                   │  │
│           │  │  [Cancel]      [Confirm Upload]                  │  │
│           │  └───────────────────────────────────────────────────┘  │
│           │                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

---

## Components

### Header

**Elements:**
- Breadcrumb: "Home > [Project Name] > Upload"
- Title: "Upload Excel for: [Project Name]"
- Back button (left)

### Upload Zone

**States:**

#### 1. Initial State (Empty)

**Visual:**
- Large dashed border (3px, color: #334155)
- Background: transparent
- Padding: 48px
- Center-aligned content
- Border radius: 12px

**Content:**
- Icon: Upload cloud icon (48px, color: #3B82F6)
- Heading: "Drag & Drop Excel File Here"
- Subheading: "or"
- Button: "Browse Files" (secondary)
- Footer:
  - "Supported format: .xlsx"
  - "Max size: 10MB"
  - Separator: "•"
  - Link: "Download Template" (with download icon)

**Hover State:**
- Border color: #3B82F6
- Background: rgba(59, 130, 246, 0.05)

**Active State (Drag Over):**
- Border color: #3B82F6
- Background: rgba(59, 130, 246, 0.1)
- Scale: 1.02

#### 2. File Selected State

**Visual:**
- Same as Initial State, but with:
- Background: solid (#0F172A)
- Border: solid (2px, #1E293B)

**Content:**
- Icon: File icon (Excel logo)
- File name (truncated)
- File size
- Remove button (X icon)
- "Upload" button (primary, full width)

#### 3. Error State

**Visual:**
- Red border (#EF4444)
- Error icon

**Content:**
- Error message: "Invalid file format. Please upload a .xlsx file."
- "Try Again" button

### Upload Progress

**Visual:**
- Card with padding (24px)
- Border: 1px solid #334155
- Border radius: 12px

**Content:**
- Heading: "Upload Progress"
- Divider line
- Progress bar:
  - Background: #334155
  - Fill: #3B82F6
  - Rounded ends
- Status text:
  - "Uploading... [current]MB / [total]MB"
  - "([time] remaining)"
- Cancel button (secondary, full width)

**Progress Bar Animation:**
- Smooth transition (0.3s ease)
- Striped background animation (optional)

**Cancel Behavior:**
- Cancels upload
- Shows confirmation dialog (if upload is > 50%)
- Returns to initial state

### Preview & Confirm

**Visual:**
- Large card with padding (32px)
- Border: 1px solid #334155
- Border radius: 12px
- Scrollable if needed

**Content:**

#### Summary Section

**Layout:** 2-column grid

**Left Column:**
- Heading: "Summary"
- List with badges:
  - [🟢] 85 new entries
  - [🟡] 10 modified entries
  - [🔴] 5 deleted entries
  - [⚠️] 2 validation errors

**Right Column:**
- "View Full Report" link (opens modal)
- Export options (optional)

#### Preview Table

**Structure:**
- Sticky header
- First column: UUID (key) - truncates with ellipsis
- Language columns: CN, EN, DE, etc. (scrollable horizontally)
- Status column: Badge (New/Modified/Deleted/Error)
- Actions column: Edit/Fix button

**Status Badges:**
- New: Blue badge (#3B82F6)
- Modified: Yellow badge (#F59E0B)
- Deleted: Red badge (#EF4444)
- Error: Red badge with warning icon (#EF4444)

**Table Behavior:**
- First 20 rows shown initially
- "Show All [count] Rows" button
- Horizontal scroll for language columns
- Hover: Row highlight
- Click: Open edit modal

#### Validation Errors

**Visual:**
- Warning section with yellow background
- Warning icon

**Content:**
- Heading: "Validation Errors"
- List of errors:
  - Row [number]: Error message
  - [Fix] button per error (opens edit modal)

#### Actions

**Layout:** Right-aligned, stacked vertically

**Buttons:**
1. Cancel (secondary) - Full width on mobile
2. Confirm Upload (primary, blue) - Full width on mobile

---

## User Flow

### Complete Upload Workflow

#### Step 1: Select File

1. User navigates to Upload page
2. User sees empty upload zone
3. User drags file or clicks "Browse Files"
4. File selected, upload zone shows file details
5. User clicks "Upload" button
6. Upload begins

#### Step 2: Upload Progress

1. Progress bar shows 0-100%
2. Status text updates in real-time
3. User can cancel if needed
4. Upload completes (100%)

#### Step 3: Preview & Confirm

1. Preview modal/card appears
2. Summary shows breakdown
3. Preview table shows first 20 rows
4. Validation errors listed (if any)
5. User reviews data

#### Step 4: Fix Errors (Optional)

1. User clicks "Fix" on error row
2. Edit modal opens
3. User modifies data
4. User clicks "Save"
5. Modal closes, error resolved

#### Step 5: Confirm Upload

1. User clicks "Confirm Upload"
2. Loading state: Button shows spinner
3. Success: Toast notification appears
4. Redirect to Project Detail page
5. Success modal shows:
   - "Upload completed successfully!"
   - Summary statistics
   - Button: "View Entries" or "Close"

---

## States

### Empty State (No File)

- Initial upload zone shown
- Template download available
- Help text visible

### Loading State (Uploading)

- Upload zone replaced with progress card
- Progress bar animates
- Cancel button available
- Other UI disabled

### Preview State (File Parsed)

- Upload zone hidden
- Preview card shown
- Data summary displayed
- Table with first 20 rows

### Error State (Upload Failed)

- Error card shown
- Error message displayed
- Retry button
- Back to upload button

### Success State (Upload Complete)

- Success modal shown
- Checkmark animation
- Summary statistics
- Action buttons:
  - "View Entries" (primary)
  - "Upload Another" (secondary)
  - "Close"

---

## Edit Modal (Fix Validation Errors)

**Purpose:** Allow user to fix validation errors before confirming upload

**Content:**
- Modal with form
- Pre-filled with data from row
- All language fields visible
- Error message displayed at top
- Buttons:
  - Cancel
  - Save
  - Save & Continue (moves to next error)

**Validation:**
- Real-time validation on blur
- Error messages inline
- Disable save until valid

---

## Download Template

**Behavior:**
- Click triggers download of Excel template
- Template includes:
  - Header row with language codes (CN, DA, DE, EN, etc.)
  - Sample row with example data
  - Notes sheet with format requirements

**Template Format:**
```
| UUID (auto-generated) | CN | DA | DE | EN | ES | FI | FR | IT | NL | NO | PL | SE |
|----------------------|----|----|----|----|----|----|----|----|----|----|----|----|
|                      |    |    |    |    |    |    |    |    |    |    |    |    |
```

---

## Validation Rules

### File Format

- Must be .xlsx (not .xls)
- Must have header row
- Header must contain language codes
- File size: Max 10MB

### Data Validation

- UUID column: Optional (auto-generated if empty)
- Language columns: Optional (but at least one must have data)
- Character encoding: Must be UTF-8
- Special characters: Allowed (emoji, Unicode)
- Duplicate detection: Check for duplicate CN text across rows

### Error Types

1. **Missing Required Data**
   - Error: "Row [number]: Missing required translation"
   - Severity: Warning (can proceed with missing data)

2. **Invalid Format**
   - Error: "File format invalid. Please use .xlsx format."
   - Severity: Error (cannot proceed)

3. **Duplicate Detection**
   - Error: "Row [number]: Duplicate text detected"
   - Severity: Warning (can proceed, but will merge)

4. **Encoding Issues**
   - Error: "Row [number]: Character encoding issue"
   - Severity: Error (cannot proceed)

5. **File Too Large**
   - Error: "File exceeds 10MB limit"
   - Severity: Error (cannot proceed)

---

## Responsive Behavior

### Desktop (> 1024px)
- Full upload zone (max-width: 800px, centered)
- Preview table shows 6 language columns
- Horizontal scroll for remaining languages
- Buttons: Side-by-side

### Tablet (768px - 1024px)
- Upload zone: Full width
- Preview table: Shows 4 language columns
- Summary: Stacked vertically
- Buttons: Stacked

### Mobile (< 768px)
- Upload zone: Full width
- Preview table: Shows 2 language columns, full horizontal scroll
- Summary: Stacked vertically
- Buttons: Full width, stacked
- Hamburger menu for sidebar

---

## Accessibility

### Keyboard Navigation

- Tab order: Upload zone → Browse button → Template link → Confirm button
- Enter/Space: Activate buttons
- Escape: Close modals
- Arrow keys: Navigate table rows

### ARIA Labels

- Upload zone: `role="button"`, `aria-label="Upload Excel file"`
- Drop zone: `aria-label="Drop zone for Excel files"`
- Progress bar: `role="progressbar"`, `aria-valuenow="75"`, `aria-valuemin="0"`, `aria-valuemax="100"`
- Table: `aria-label="Preview of uploaded text entries"`

### Screen Reader Support

- Announce file selection: "File [filename] selected"
- Announce upload progress: "Upload [percent]% complete"
- Announce completion: "Upload completed successfully"
- Announce errors: "Error: [error message]"

---

## Technical Specifications

### API Endpoints

- **POST /api/projects/:id/upload** - Upload Excel file
  - Content-Type: multipart/form-data
  - Request: File data
  - Response: Upload progress, parsed data

- **PUT /api/projects/:id/entries** - Confirm and save entries
  - Request: Array of text entries
  - Response: Success confirmation, statistics

- **GET /api/projects/:id/template** - Download template
  - Response: Excel file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

### File Upload

```typescript
interface UploadRequest {
  file: File;
}

interface UploadResponse {
  uploadId: string;
  totalRows: number;
  newEntries: number;
  modifiedEntries: number;
  deletedEntries: number;
  validationErrors: ValidationError[];
  previewData: TextEntry[];
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}
```

---

## Performance Considerations

- **Chunked upload:** Upload in 1MB chunks for large files
- **Progress tracking:** Real-time progress updates via WebSocket or polling
- **Preview pagination:** Load preview in batches (20 rows at a time)
- **Debounce:** Debounce file parsing during preview
- **Caching:** Cache parsed data until confirmation

---

## Success Metrics

- **Time to upload 1000 rows:** < 30 seconds
- **Time to parse and preview:** < 5 seconds
- **Time to confirm upload:** < 10 seconds
- **Error detection accuracy:** > 95%
- **User satisfaction:** Upload success rate > 90%

---

## Error Handling

### Upload Errors

- Network error: "Network error. Please check your connection and try again."
- Server error: "Server error. Please try again later."
- Timeout: "Upload timeout. Please try again with a smaller file."

### Parsing Errors

- Invalid format: "Invalid Excel format. Please download the template and try again."
- Encoding error: "Encoding error detected. Please ensure file is UTF-8 encoded."
- Too many rows: "File contains too many rows. Maximum 10,000 rows allowed."

### Confirmation Errors

- Duplicate UUID: "Duplicate UUID detected. System will auto-generate new UUIDs."
- Validation failed: "Validation failed. Please fix errors before confirming."

---

## Future Enhancements

### Batch Operations

- Support uploading multiple files at once
- Batch preview across multiple files
- Merge strategies (overwrite, merge, skip)

### Advanced Validation

- Custom validation rules per project
- Regex pattern matching
- Mandatory language requirements

### Smart Features

- Auto-duplicate detection and merging
- Auto-translation suggestions
- Historical comparison with previous uploads
- Smart UUID generation based on text content

