# UI/UX Design Brief
## AI-Powered Financial Document Similarity Finder
**Version:** 1.0 · **Status:** Ready for Handoff · **Audience:** Design → Development

---

## 1. Design Goals

Five guiding principles that govern every design decision in this product.

### 1.1 Clarity Over Cleverness
Financial documents carry real monetary and legal weight. Every label, button, and status message must communicate precisely what it does. No clever metaphors, no ambiguous icons used alone, no mystery-meat navigation. If a designer has to explain a UI element, it needs to be redesigned.

### 1.2 Trust Through Transparency
Users are finance professionals handling sensitive data. The system must make its reasoning visible — show similarity scores as explicit percentages, surface the matched text excerpt, explain *why* two documents are related. Never present a black-box result. Trust is earned by showing work.

### 1.3 Speed Over Feature Richness
Finance staff are processing high document volumes under time pressure. The primary flows (upload → search → act) must complete in 3 clicks or fewer. Secondary features (audit trail, analytics, approvals) live behind navigation — present but never in the way.

### 1.4 Density With Breathing Room
This is a data-heavy application. Compact tables and information-rich cards are expected and appropriate — but density must be governed by a strict spacing system. Never sacrifice scanability for packing more in. White space around critical data (similarity scores, fraud flags) is mandatory.

### 1.5 Error States Are First-Class Citizens
Every upload, OCR extraction, embedding call, and search can fail. Failed states must be designed before happy paths are finalized. Error messages must name the problem, explain the impact, and offer a next action. "Something went wrong" is never acceptable copy.

---

## 2. Target Users

### Primary Persona — Finance Analyst / AP Clerk
**Who:** 25–45 years old, works in accounts payable or financial operations. Processes 50–200 invoices per week. Comfortable with Excel and ERP systems. Not a developer.

**What they do:** Upload invoices, verify vendors, catch duplicates, flag anomalies, route documents for approval.

**How they need to feel:**
- *Confident* — the system surface enough evidence that they can stand behind every decision
- *In control* — they approve the machine's suggestions; the machine never acts autonomously
- *Unbothered by technology* — the AI layer should be invisible infrastructure, not a feature they have to understand

**Pain points today:** Manually cross-referencing invoices in spreadsheets, missing duplicate billing, no easy way to search historical documents semantically.

---

### Secondary Persona — Finance Manager / Controller
**Who:** 35–55 years old, manages a team of analysts. Concerned with compliance, audit readiness, and fraud risk. Views dashboards more than individual documents.

**What they do:** Review approval queues, monitor fraud alerts, check audit trails, analyze vendor spend.

**How they need to feel:**
- *Oversight without micromanagement* — visibility at a glance, drill-down when needed
- *Audit-ready at all times* — every action is logged, attributable, exportable
- *Proactively informed* — the system should surface anomalies, not wait to be asked

---

### Tertiary Persona — IT / System Administrator
**Who:** Sets up and maintains the local deployment. Configures users, roles, retention policies.

**What they need:** Clear admin screens, meaningful health/status indicators, no obscure configuration buried in config files.

---

## 3. Visual Identity

### 3.1 Aesthetic Direction
**Refined Institutional** — the visual language of a sophisticated financial institution's internal tool. Not cold and clinical, not playful. Think: structured grid, controlled whitespace, data presented with editorial precision. Dark navy anchors authority; warm amber signals alerts without panic; clean slate neutrals for document surfaces.

---

### 3.2 Color Palette

#### Primary Scale — Navy
| Token | Hex | Usage |
|---|---|---|
| `navy-950` | `#0A0F1E` | Page backgrounds (dark mode) |
| `navy-900` | `#0F1729` | Sidebar, top nav |
| `navy-800` | `#162040` | Card backgrounds (dark) |
| `navy-700` | `#1E2D5A` | Active nav items, selected rows |
| `navy-600` | `#263A73` | Primary button (rest) |
| `navy-500` | `#2E4899` | Primary button (hover) |
| `navy-100` | `#E8EDF8` | Page background (light mode) |
| `navy-50` | `#F4F6FB` | Panel/card backgrounds (light) |

#### Neutral Scale — Slate
| Token | Hex | Usage |
|---|---|---|
| `slate-900` | `#1A1D23` | Body text (dark) |
| `slate-700` | `#374151` | Body text (light) |
| `slate-500` | `#6B7280` | Secondary text, placeholders |
| `slate-300` | `#D1D5DB` | Borders, dividers |
| `slate-100` | `#F3F4F6` | Table zebra rows, disabled states |
| `slate-50` | `#F9FAFB` | Base background |

#### Semantic Colors
| Token | Hex | Usage |
|---|---|---|
| `success-600` | `#16A34A` | Approved, matched, success |
| `success-100` | `#DCFCE7` | Success backgrounds |
| `warning-600` | `#D97706` | Possible duplicate, review needed |
| `warning-100` | `#FEF3C7` | Warning backgrounds |
| `danger-600` | `#DC2626` | Fraud alert, high-risk, error |
| `danger-100` | `#FEE2E2` | Error/alert backgrounds |
| `info-600` | `#2563EB` | Informational, links |
| `info-100` | `#DBEAFE` | Info backgrounds |

#### Accent — Amber (Similarity Score Highlight)
| Token | Hex | Usage |
|---|---|---|
| `amber-500` | `#F59E0B` | Similarity score rings, AI indicators |
| `amber-300` | `#FCD34D` | Score bar fills |
| `amber-100` | `#FEF3C7` | Score chip backgrounds |

---

### 3.3 Typography Scale

**Display Font:** `DM Serif Display` (Google Fonts) — used only for page titles and marketing moments. Gives gravitas without stiffness.

**UI Font:** `IBM Plex Sans` (Google Fonts) — purpose-built for data interfaces. Excellent at small sizes. Ligatures and tabular numbers for financial data.

**Mono Font:** `IBM Plex Mono` — for invoice numbers, document IDs, similarity scores, code/technical values.

| Role | Font | Weight | Size | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Page Title | DM Serif Display | 400 | 28px | 36px | -0.02em |
| Section Heading | IBM Plex Sans | 600 | 20px | 28px | -0.01em |
| Card Title | IBM Plex Sans | 600 | 16px | 24px | 0 |
| Body / Default | IBM Plex Sans | 400 | 14px | 22px | 0 |
| Body Small | IBM Plex Sans | 400 | 13px | 20px | 0 |
| Label / Uppercase | IBM Plex Sans | 500 | 11px | 16px | +0.08em |
| Data / Score | IBM Plex Mono | 500 | 14px | 20px | 0 |
| Invoice ID / Code | IBM Plex Mono | 400 | 13px | 18px | 0 |
| Micro / Caption | IBM Plex Sans | 400 | 12px | 16px | 0 |

---

### 3.4 Iconography

**Style:** Lucide Icons (MIT licensed, consistent with React ecosystem). Stroke weight: 1.5px. Size: 16px (inline), 20px (action buttons), 24px (nav items), 32px (empty states).

**Rules:**
- Never use an icon without a visible text label in primary actions
- Tooltips required on icon-only buttons (aria-label mandatory)
- Use filled variants only for "active" / "selected" states
- No custom icon illustrations — use Lucide exclusively for consistency

**Key icon assignments:**
| Action | Icon |
|---|---|
| Upload | `Upload` / `FileUp` |
| Search | `Search` |
| Similarity match | `GitMerge` |
| Duplicate detected | `Copy` |
| Fraud flag | `AlertTriangle` |
| Approved | `CheckCircle` |
| Rejected | `XCircle` |
| Pending review | `Clock` |
| Audit log | `ClipboardList` |
| Vendor | `Building2` |
| Document | `FileText` |
| Settings | `Settings` |
| Download | `Download` |

---

### 3.5 Spacing System

Base unit: **4px**. All spacing values are multiples.

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Inline icon gap, micro padding |
| `space-2` | 8px | Input internal padding (vertical) |
| `space-3` | 12px | Chip padding, badge |
| `space-4` | 16px | Card padding (compact), table cell |
| `space-5` | 20px | Section gap (tight) |
| `space-6` | 24px | Card padding (default) |
| `space-8` | 32px | Section spacing |
| `space-10` | 40px | Page section gap |
| `space-12` | 48px | Hero/empty state vertical padding |
| `space-16` | 64px | Between major page sections |

---

### 3.6 Border Radius & Shadow

#### Border Radius
| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 4px | Badges, chips, tags |
| `radius-md` | 8px | Buttons, inputs, small cards |
| `radius-lg` | 12px | Cards, panels, modals |
| `radius-xl` | 16px | Upload drop zone, large modals |
| `radius-full` | 9999px | Pill buttons, avatars, score rings |

#### Shadow
| Token | Value | Usage |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Inputs on focus |
| `shadow-sm` | `0 2px 4px rgba(0,0,0,0.08)` | Cards at rest |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.12)` | Dropdowns, popovers |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.16)` | Modals, drawers |
| `shadow-glow-amber` | `0 0 0 3px rgba(245,158,11,0.25)` | Similarity score rings |
| `shadow-glow-danger` | `0 0 0 3px rgba(220,38,38,0.25)` | Fraud alert cards |

---

## 4. Component Inventory

### 4.1 Buttons
| Component | Variants |
|---|---|
| Primary Button | Default · Hover · Active · Disabled · Loading (spinner) |
| Secondary Button | Default · Hover · Active · Disabled |
| Ghost Button | Default · Hover · Active · Disabled |
| Danger Button | Default · Hover · Active · Disabled |
| Icon Button | Default · Hover · With tooltip |
| Split Button | Primary action + dropdown chevron |

**Rules:** Min width 80px. Min tap target 44×44px. Loading state replaces label with spinner + "Processing…" text. Never disable submit buttons without surfacing why.

---

### 4.2 Form Elements
| Component | Variants |
|---|---|
| Text Input | Default · Focus · Error · Disabled · With icon prefix · With clear button |
| Textarea | Default · Focus · Error · Character count |
| Select / Dropdown | Default · Open · Selected · Disabled · Multi-select |
| Date Picker | Single date · Date range |
| File Upload Zone | Idle · Drag-over · Uploading (progress bar) · Error · Success |
| Checkbox | Unchecked · Checked · Indeterminate · Disabled |
| Radio Button | Unselected · Selected · Disabled |
| Toggle / Switch | Off · On · Disabled |
| Search Input | Default · Active · With results count |
| Filter Bar | Tag-based filters · Clear all |

---

### 4.3 Data Display
| Component | Variants |
|---|---|
| Data Table | Default · Sortable columns · Selectable rows · Loading skeleton · Empty state · Paginated |
| Table Row | Default · Hover · Selected · Flagged (danger) · Duplicate (warning) |
| Similarity Score Badge | Percentage chip with color coding (green/amber/red thresholds) |
| Score Ring | Circular progress ring with % label (used in result cards) |
| Document Card | Compact (list) · Expanded (detail) · Flagged variant |
| Metadata Chip | Vendor · Date · Amount · Invoice # · Document type |
| Stat Card | Single metric with label + trend indicator |
| Progress Bar | Upload progress · Processing progress |
| Confidence Meter | Horizontal bar for similarity confidence |

---

### 4.4 Feedback & Status
| Component | Variants |
|---|---|
| Toast Notification | Success · Warning · Error · Info (with dismiss) |
| Alert Banner | Inline page-level alerts (same 4 types) |
| Fraud Alert Card | High-priority red card with action buttons |
| Status Badge | Approved · Pending · Rejected · Flagged · Processing |
| Loading Skeleton | Table row skeleton · Card skeleton · Full page skeleton |
| Empty State | No documents · No results · Error state (each with unique illustration prompt + CTA) |
| Processing Indicator | Step-by-step pipeline status (Extracting → Chunking → Embedding → Searching) |

---

### 4.5 Navigation
| Component | Variants |
|---|---|
| Top Navigation Bar | With user avatar · With search · With notification bell |
| Sidebar Navigation | Collapsed (icon only) · Expanded (icon + label) · Active item |
| Breadcrumb | Standard · With document name truncation |
| Tab Bar | Horizontal tabs (page sections) · With count badges |
| Pagination | Standard · Items-per-page selector |
| Command Palette | Keyboard-triggered quick search (Cmd+K) |

---

### 4.6 Overlays & Modals
| Component | Variants |
|---|---|
| Modal | Small (confirmation) · Medium (form) · Large (document preview) |
| Drawer / Side Panel | Document detail drawer · Audit log drawer |
| Confirmation Dialog | Destructive action · Non-destructive |
| Tooltip | Default (top) · With rich content |
| Popover | Filter popover · Info popover |
| Dropdown Menu | Action menu · Context menu (right-click) |

---

### 4.7 Finance-Specific Components
| Component | Variants |
|---|---|
| Document Comparison View | Side-by-side diff · Highlighted matching text |
| Similarity Match List | Ranked list with score, filename, matched excerpt |
| Invoice Metadata Panel | Structured fields: vendor, date, amount, currency, invoice # |
| Fraud Flag Card | Severity level · Reason text · Recommended action |
| Vendor Cluster Chart | Scatter or grouped card view |
| OCR Confidence Indicator | Field-level confidence tags (High / Medium / Low) |
| Approval Queue Row | Document summary + approver actions inline |
| Audit Trail Entry | Timestamped log line with actor, action, document ref |

---

## 5. Screen Inventory

### 5.1 Core Application Screens

---

#### S-01 · Dashboard / Home
**Purpose:** Command center — give finance staff instant visibility into recent activity, pending reviews, and system alerts.

**Primary Action:** Navigate to Upload or open the Approval Queue.

**Key UI Elements:**
- Stat cards row: Documents uploaded (today / week), Duplicates detected, Fraud flags, Pending approvals
- Recent uploads table (last 10, with status badges)
- Active alerts panel (fraud flags, duplicates needing review)
- Quick upload button (prominent, always visible)
- Processing pipeline status (if jobs are running)

---

#### S-02 · Document Upload
**Purpose:** Allow users to ingest a new financial document into the system.

**Primary Action:** Drop or select a file → trigger the processing pipeline.

**Key UI Elements:**
- Large drag-and-drop upload zone (full-width, high visual priority)
- File type indicators: PDF, DOCX, TXT, image formats accepted
- Optional metadata form (vendor, invoice number, document type) — pre-fills from OCR extraction
- Processing status stepper: Upload → Extract Text → OCR (if needed) → Chunk → Embed → Store
- Success state: confirmation with document ID and link to view
- Error state: specific failure message with retry CTA

---

#### S-03 · Similarity Search
**Purpose:** Find documents semantically similar to a query document or text input.

**Primary Action:** Upload a query document or enter text → view ranked similar documents.

**Key UI Elements:**
- Query input: file upload zone OR text input (tab-switcher)
- Filter sidebar: vendor, date range, amount range, document type, currency
- Results list: ranked cards with score ring, filename, vendor, date, matched text excerpt
- Threshold slider: allow users to set minimum similarity score
- "Compare" button per result (opens side-by-side view)
- Empty state if no matches above threshold

---

#### S-04 · Document Detail
**Purpose:** View a single document's full metadata, extracted text, embeddings metadata, and history.

**Primary Action:** Approve / Flag / Route for review.

**Key UI Elements:**
- Document preview (PDF viewer or text renderer)
- Metadata panel: all structured fields (invoice #, vendor, amount, date, currency, account)
- OCR confidence indicators per extracted field
- Similarity matches sidebar (top 3 similar docs, always visible)
- Status badge + approval action buttons
- Audit trail tab (all actions on this document)
- Related documents tab (same vendor, same period)

---

#### S-05 · Document Comparison
**Purpose:** Compare two documents side-by-side to evaluate similarity, detect duplicates, or resolve discrepancies.

**Primary Action:** Confirm as duplicate / Mark as distinct / Flag for review.

**Key UI Elements:**
- Split-pane layout: Document A (left) · Document B (right)
- Overall similarity score (prominent, top center)
- Highlighted matching text passages (color-coded overlays)
- Field-by-field metadata diff table (green = match, red = differs)
- Verdict section: Duplicate / Similar / Unrelated (with confidence)
- Action buttons: Merge records / Flag fraud / Approve both / Reject one

---

#### S-06 · Document List / Library
**Purpose:** Browse, filter, and manage all ingested documents.

**Primary Action:** Search, filter, bulk-select for actions.

**Key UI Elements:**
- Search bar (semantic + keyword)
- Filter bar: vendor, date range, document type, status, amount range, uploaded by
- Data table: filename, vendor, invoice #, date, amount, status, similarity risk, uploaded at
- Bulk actions bar (appears on row selection): export, delete, flag, route to approval
- Sortable columns
- Row-level context menu: View · Compare · Audit trail · Delete

---

#### S-07 · Alerts & Fraud Flags
**Purpose:** Centralized view of all system-generated alerts (duplicates, fraud patterns, anomalies).

**Primary Action:** Review and resolve each alert.

**Key UI Elements:**
- Alert severity tabs: Critical · High · Medium · Resolved
- Alert cards: alert type, affected documents, detection reason, recommended action
- Bulk resolve actions
- Filter by alert type, date, vendor
- Link to document comparison for each alert
- Alert resolution history

---

#### S-08 · Approval Queue
**Purpose:** Workflow screen for approving or rejecting documents that have been routed for review.

**Primary Action:** Approve / Reject / Request changes on each document.

**Key UI Elements:**
- Queue table: document name, submitted by, submitted at, document type, amount, days pending
- Inline approve / reject buttons (no modal required for standard decisions)
- Comment field for rejection reason
- Bulk approve for low-risk items
- Priority badges (flagged items, overdue items)
- Filters: by submitter, department, document type, age

---

#### S-09 · Audit Trail
**Purpose:** Compliance view — every action on every document, fully attributable.

**Primary Action:** Filter and export logs for compliance reporting.

**Key UI Elements:**
- Timeline / table of log entries: timestamp, actor, action, document reference, IP address
- Filters: date range, actor, action type, document
- Export to CSV / PDF
- Document-level audit trail (accessible from Document Detail)
- Immutable — no edit/delete controls visible

---

#### S-10 · Analytics Dashboard
**Purpose:** Executive/manager view of spend patterns, vendor activity, duplicate rates, and fraud trends.

**Primary Action:** Drill down into a vendor or time period.

**Key UI Elements:**
- Date range selector (quick presets: this month, last quarter, YTD)
- Vendor spend breakdown (bar chart)
- Duplicate detection rate over time (line chart)
- Document volume by type (donut chart)
- Top vendors by document count and total amount
- Anomaly trend line
- Export report button

---

#### S-11 · User & Role Management (Admin)
**Purpose:** IT/admin screen to manage users, assign roles, and configure access.

**Primary Action:** Add user / Edit role / Deactivate account.

**Key UI Elements:**
- User table: name, email, role, department, last active, status
- Role editor: Finance Analyst · Finance Manager · Admin (with permission matrix)
- Invite user flow (email-based)
- Deactivate / Reactivate controls
- Session and access log per user

---

#### S-12 · System Settings (Admin)
**Purpose:** Configure system behavior: retention policies, similarity thresholds, OCR settings, integrations.

**Primary Action:** Save configuration changes.

**Key UI Elements:**
- Similarity threshold settings (default score cutoffs per alert type)
- Document retention policy (years by document type)
- OCR language pack configuration
- Qdrant / embedding service health status
- Backup configuration
- PII redaction rules

---

#### S-13 · Login / Authentication
**Purpose:** Secure entry point.

**Primary Action:** Sign in with credentials.

**Key UI Elements:**
- Company logo / application name
- Email + password fields
- "Remember this device" checkbox
- Error state for invalid credentials (generic message — no username enumeration)
- Forgot password link
- No self-registration (admin-provisioned only)

---

## 6. Responsive Breakpoints

### Breakpoint Definitions
| Name | Range | Target Device |
|---|---|---|
| `xs` | < 480px | Small mobile |
| `sm` | 480px – 767px | Mobile landscape / large phone |
| `md` | 768px – 1023px | Tablet portrait |
| `lg` | 1024px – 1279px | Tablet landscape / small laptop |
| `xl` | 1280px – 1535px | Desktop |
| `2xl` | ≥ 1536px | Large desktop / wide monitors |

---

### Per-Screen Behavior

#### Navigation
- **Desktop (xl+):** Sidebar always visible, expanded (icon + label), 240px wide
- **Tablet (md–lg):** Sidebar collapsed to icon-only (60px), expands on hover/tap
- **Mobile (xs–sm):** Sidebar hidden; bottom navigation bar with 4 primary tabs; hamburger opens drawer for secondary nav

#### Document Upload (S-02)
- **Desktop:** Upload zone left, metadata form right (50/50 split)
- **Tablet:** Stacked vertically, full width
- **Mobile:** Upload zone top (large tap target), metadata form scrolls below

#### Document List (S-06)
- **Desktop:** Full data table with all columns visible
- **Tablet:** Table with 4–5 columns; secondary columns hidden, accessible via row expansion
- **Mobile:** Card-list layout replaces table entirely; each card shows: filename, vendor, amount, status badge

#### Document Comparison (S-05)
- **Desktop:** Side-by-side split-pane layout
- **Tablet:** Tabbed layout (Document A / Document B / Diff), no side-by-side
- **Mobile:** Not available at xs/sm; show message directing user to tablet/desktop

#### Analytics Dashboard (S-10)
- **Desktop:** Multi-column chart grid
- **Tablet:** 2-column chart grid; charts reflow
- **Mobile:** Single column; charts stack vertically; simplified stat cards replace complex charts

#### Modals
- **Desktop/Tablet:** Centered modal with max-width constraints
- **Mobile:** Full-screen bottom sheet pattern

---

## 7. Accessibility Requirements

### Target: WCAG 2.1 Level AA

### Color Contrast
- All body text on backgrounds: minimum **4.5:1** contrast ratio
- Large text (18px+ or 14px bold): minimum **3:1**
- UI component boundaries and focus indicators: minimum **3:1**
- Similarity score colors (green/amber/red) must never rely on color alone — pair with icon and text label

### Keyboard Navigation
- Full keyboard operability required for all screens
- Logical tab order: top-left to bottom-right, no focus traps except modals
- Modal dialogs: trap focus within modal; Escape closes; focus returns to trigger element
- Data tables: arrow key navigation within cells for complex tables
- File upload zone: keyboard-accessible via Enter/Space to open file picker
- Dropdown menus: arrow keys to navigate, Enter to select, Escape to close
- All interactive elements: visible focus ring (2px solid `navy-500`, 2px offset)

### ARIA Patterns
- File upload zone: `role="button"`, `aria-label="Upload financial document"`, live region for status updates
- Data table: `<table>` with proper `<thead>`, `<th scope>`, `aria-sort` on sortable columns
- Similarity score: `role="meter"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label="Similarity score: [X]%"`
- Alert cards: `role="alert"` for fraud flags injected dynamically; `role="status"` for non-critical updates
- Loading states: `aria-busy="true"` on containers, `aria-live="polite"` for completion announcements
- Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to modal title
- Toast notifications: `role="status"` (success/info) or `role="alert"` (error/warning), auto-dismiss with `aria-live`
- Navigation: `<nav aria-label="Main navigation">` and `<nav aria-label="Breadcrumb">`
- Icons: decorative icons `aria-hidden="true"`; meaningful icons get `aria-label`
- Form fields: all inputs have associated `<label>`, error messages linked via `aria-describedby`

### Additional Requirements
- No content flashes > 3Hz (seizure safety)
- All video/animation: prefers-reduced-motion media query must disable or reduce all transitions
- Touch targets: minimum 44×44px on all interactive elements
- No time limits on user tasks (OCR may be slow — use async + notification, never a countdown)
- Text must be resizable to 200% without horizontal scroll (desktop)

---

## 8. Interaction & Motion

### Motion Philosophy
**Purposeful and restrained.** Motion communicates state, not personality. Every animation must either: (a) help orient the user after a state change, or (b) indicate that work is being done. Gratuitous decorative animation is prohibited.

`prefers-reduced-motion` media query must disable all transitions and replace animated states with instant cuts.

---

### Transition Standards
| Type | Duration | Easing | Usage |
|---|---|---|---|
| Instant | 0ms | — | Focus rings, hover color changes |
| Fast | 100ms | `ease-out` | Button hover, badge state change |
| Standard | 200ms | `ease-in-out` | Dropdown open/close, tab switch |
| Deliberate | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Modal appear, drawer slide, card expand |
| Slow | 500ms | `ease-out` | Page transitions, skeleton → content |

---

### Loading States

#### Upload & Processing Pipeline
Replace the upload zone with a step-by-step pipeline indicator immediately after file selection. Each step activates sequentially with a pulsing dot indicator:
1. ⬤ Uploading file… (progress bar, %)
2. ⬤ Extracting text…
3. ⬤ Running OCR… *(only if needed; skip and animate past if not)*
4. ⬤ Chunking document…
5. ⬤ Generating embeddings…
6. ⬤ Storing in vector database…
7. ✓ Complete — View document / Search similar

Each completed step gets a green checkmark. Failed steps show a red X with error detail inline.

#### Search Loading
After submitting a search, the results area shows skeleton cards (3–5 placeholder cards with pulsing grey blocks) while the real results load. Do not use a spinner overlay — keep the page layout stable.

#### Table Loading
On initial load and filter application, table rows replace with skeleton rows (same height as real rows). Number of skeleton rows matches the current `items-per-page` setting.

---

### Skeleton Screen Specifications
- Background: `slate-200` (`#E5E7EB`)
- Shimmer: CSS `background: linear-gradient(90deg, slate-200 25%, slate-100 50%, slate-200 75%)` animated at 1.5s infinite
- No text content in skeletons — shape-only placeholders
- Skeleton shapes must match the final content layout exactly (no layout shift on content load)

---

### Toast / Notification Patterns

#### Behavior
- Appear bottom-right (desktop), bottom-center (mobile)
- Stack vertically if multiple, newest on top
- Auto-dismiss: Success → 4s · Info → 5s · Warning → 8s · Error → no auto-dismiss (requires manual close)
- Maximum 3 toasts visible simultaneously; queue additional

#### Toast Anatomy
- Left colored border (4px) matching semantic color
- Icon (16px) + Title (bold, 14px) + Optional description (13px, secondary)
- Dismiss button (×) always visible
- Progress bar along bottom edge counting down to auto-dismiss

#### Content Rules
| Type | Title | Description |
|---|---|---|
| Success | "Invoice uploaded" | "INV-2048 has been processed and stored." |
| Warning | "Possible duplicate detected" | "This document is 87% similar to INV-1994. Review before saving." |
| Error | "OCR extraction failed" | "Could not extract text from page 3. Try re-uploading a higher resolution scan." |
| Info | "Processing in background" | "Large document queued. You'll be notified when complete." |

---

### Micro-interactions
- **Score ring:** Animates from 0 to final percentage on card mount (300ms, ease-out). Disabled with `prefers-reduced-motion`.
- **Row selection checkbox:** Scale 0.8 → 1 on check (100ms). Bulk action bar slides up from bottom (200ms).
- **Alert card:** Shake animation (200ms) on first render for Critical/Fraud severity only.
- **Upload drag-over:** Zone border pulses and background shifts to `navy-100`; icon scales 1 → 1.1.
- **Button click:** Scale 0.97 → 1 feedback (80ms). Never delay button response for async actions — start async, give instant visual feedback.

---

## 9. Do's and Don'ts

### ✅ DO: Show Similarity Scores as Explicit Numbers with Color + Label
Always render similarity as `87% match` with both the percentage AND a color-coded badge (green/amber/red) AND a text label ("Strong Match" / "Possible Match" / "Weak Match"). Never use color alone or a vague "high/medium/low" without numbers.

### ❌ DON'T: Use Red for Anything Except Genuine Alerts
Red (`danger-600`) is reserved exclusively for fraud flags, critical errors, and destructive confirmation dialogs. Do not use red for general "not selected" states, inactive toggles, or decorative purposes. Overusing red destroys its signal value in a financial context where it must trigger immediate attention.

---

### ✅ DO: Make Every Loading State Document-Specific
When processing, always show which document is being processed (filename, truncated if needed). "Processing…" with no context is unacceptable when a user may have initiated multiple actions. Every loading state must be attributable to a specific action.

### ❌ DON'T: Disable Filters While Results Load
Keep filter controls active during search. Show loading state in the results area only. Disabling filters during loading forces users to wait before refining — this is a primary workflow inefficiency. Results should update reactively as filters change (with 300ms debounce).

---

### ✅ DO: Surface the "Why" for Every AI Match
Every similarity result must show a matched text excerpt — the specific passage that drove the high score. Finance staff cannot act on "87% match" without understanding what matched. The excerpt may be truncated (2–3 lines) with a "Show more" expansion.

### ❌ DON'T: Let System-Generated IDs Appear in the Primary UI
Qdrant point IDs, internal UUIDs, and chunk indices are system artifacts. They must never appear in the primary UI as-is. Always map to human-readable references: invoice number, filename, vendor name, or a formatted document reference.

---

### ✅ DO: Confirm Destructive Actions With Context
Before deleting a document or resolving a fraud alert, the confirmation dialog must state exactly what will happen: "Permanently delete INV-2048 (Acme Corp, $1,250.75, uploaded by J. Smith on 2026-05-29)?" Generic "Are you sure?" dialogs are insufficient for financial data.

### ❌ DON'T: Auto-Submit Forms on Last Field Completion
Financial data entry requires deliberate submission. Never trigger upload, search, or approval on blur/change events. All form submission must require an explicit button click. The one exception: real-time search filtering in the document library, which uses debounced auto-query (clearly indicated with a search spinner).

---

### ✅ DO: Preserve Filter State Across Navigation
When a user navigates from the Document List to a Document Detail and returns, their filters must be restored. Use URL query parameters to encode active filters so state persists through browser back/forward navigation and is shareable via URL.

### ❌ DON'T: Use Abbreviations for Financial Fields Without Tooltips
"Amt", "Inv#", "Curr" — always write out "Amount", "Invoice Number", "Currency" in column headers and field labels. If space constraints force abbreviation, a tooltip with the full term is mandatory. Financial precision requires precise language.

---

*— End of UI/UX Brief —*

**Document prepared for:** Design Team → Developer Handoff  
**Maintained by:** Product · Last updated: May 2026  
**Questions:** Refer back to project documentation in `deep-research-report-1.md` and `financial_document_similarity_guide.md`
