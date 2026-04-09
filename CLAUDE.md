# CLAUDE.md — Estate Manager Prototype

This is a prototype. There is no full backend. Mock all SAUL API calls using sample JSON defined as constants in `app/page.tsx`.

---

## What's Been Built

### Validate Asset Classification (✅ Shipped)

**Slug:** `validate_asset_classification` | **Task ID:** `t2`

SAUL runs automatically when the job becomes visible. The specialist opens the modal to find results already populated and validates SAUL's output.

**Flow:**
1. Job appears in To Do with a "Processing" badge — SAUL starts running automatically after a 1s delay
2. While processing: clicking the card opens the modal to a processing state showing "SAUL is classifying assets..."
3. When SAUL finishes: card transitions to normal To Do state, modal opens directly to REVIEW
4. REVIEW renders: blocked paths banner (if any) + asset classification table with unvalidated asset indicators
5. Specialist can override any bucket (requires a reason per override)
6. "↻ Refresh assets" button at bottom of table — 1.5s SAUL call, appends Wells Fargo Checking Account with "New — needs review" badge; if `t2` is already Completed, also surfaces `t4` with Processing badge
7. Clicks "Approve classification" → 2s success state → modal closes
8. **Job sequencing:** `t2` → Completed; `t1` (Validate Legal Path) appears with "Processing" badge

**Failure state:** 10% random failure rate for demo. Card shows "Error" badge. Modal shows specific error message + "Retry" button.

**Unvalidated assets:** Assets without confirmed titling show a gray "Unvalidated — provisional" badge. Apply to: Money Owed to Decedent, Rental income from 22 University.

---

### Validate Legal Administration Path (✅ Shipped)

**Slug:** `validate_legal_administration_path` | **Task ID:** `t1`

**Flow:**
1. Job appears in To Do with "Processing" badge after `t2` is approved — SAUL starts automatically
2. While processing: modal shows "SAUL is evaluating the legal path..."
3. When SAUL finishes: modal opens directly to REVIEW
4. REVIEW renders: threshold evaluation card + recommended legal path + single override control
5. "Approve legal path" enabled unless override selected without a reason
6. Clicks "Approve legal path" → 2s success state → `t1` → Completed; `t3` appears with "Processing" badge

---

### Validate Probate Plan (✅ Shipped)

**Slug:** `validate_probate_plan` | **Task ID:** `t3`

**Flow:**
1. Job appears in To Do with "Processing" badge after `t1` is approved — SAUL starts automatically
2. While processing: modal shows "SAUL is building the settlement plan..."
3. When SAUL finishes: modal opens directly to REVIEW
4. REVIEW renders: missed deadline flag + estate summary + action plan by track + sequencing notes
5. Specialist can mark individual actions as N/A (requires a reason per action)
6. Clicks "Approve plan" → 2s success state → `t3` → Completed

### Re-validate Asset Classification (✅ Shipped)

**Slug:** `revalidate_asset_classification` | **Task ID:** `t4`

Surfaces conditionally when "↻ Refresh assets" is clicked inside the t2 modal while t2 is already in Completed status. SAUL auto-runs immediately.

**Flow:**
1. "↻ Refresh assets" clicked on completed t2 → `t4` appears in To Do with "Processing" badge, SAUL starts automatically
2. While processing: modal shows "SAUL is re-classifying the new asset..."
3. When SAUL finishes: modal opens directly to REVIEW
4. REVIEW renders: single-row asset table showing the Wells Fargo Checking Account with "New — needs review" badge
5. Specialist can override the bucket (requires a reason)
6. Clicks "Approve classification" → 2s success state → `t4` → Completed

**Failure state:** 10% random failure rate. Card shows "Error" badge. Modal shows error message + "Retry" button.

---

## Codebase at a Glance

| | |
|---|---|
| **Framework** | Next.js (App Router), single `app/page.tsx` file, `'use client'` |
| **Styling** | Tailwind CSS v4, hardcoded hex colors throughout (see palette below) |
| **UI Library** | shadcn/ui — only `Button` (`components/ui/button.tsx`) and `Input` (`components/ui/input.tsx`) |
| **Icons** | Lucide React |
| **State** | React `useState` only — no Redux, no Context |
| **Dev server** | `npx next dev` via `.claude/launch.json` |

**Color palette:**
- Dark: `#1a1a2e`, `#3d3d3d`, `#2d2d4e`
- Muted text: `#6b675f`, `#9b9b9b`
- Borders: `#e5e5e5`, `#d0d0d0`, `#f0f0f0`
- Light bg: `#f8f7f5`, `#fafafa`
- Accent purple: `#7c6fc4`, `#5a4fa0`

**Modal pattern** (used throughout — no Radix Dialog):
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeModal}>
  <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
       onClick={e => e.stopPropagation()}>
    {/* header | body (left panel + right sidebar) | footer */}
  </div>
</div>
```

---

## Key Files

| File | What it contains |
|---|---|
| `app/page.tsx` | Entire app — all components, state, modals, data |
| `components/ui/button.tsx` | shadcn Button with CVA variants |
| `components/ui/input.tsx` | shadcn Input |
| `feature_1_asset_classification.md` | t2 mock JSON, bucket/confidence/unvalidated display rules, refresh button behavior |
| `feature_2_legal_path.md` | t1 legal path mock JSON, UI spec, threshold evaluation |
| `feature_3_generate_probate_plan.md` | t3 probate plan mock JSON, track display, N/A override behavior |
| `feature_4_revalidate_asset_classification.md` | t4 re-validation modal, single-asset REVIEW, SAUL_REVALIDATE_ASSET mock |
| `.claude/launch.json` | Dev server config |

---

## Jobs Board Data Model

Tasks are defined in the `JOBS_BOARD_TASKS` array (top of `app/page.tsx`):

```typescript
{
  id: string           // "t1", "t2", "t3", "t4"
  slug: string         // used to conditionally render custom modal UIs
  title: string
  assignee: string
  assigneeEmail: string
  reviewer: string
  createdAt: string
  updatedAt: string
  status: "todo" | "in-progress" | "awaiting-review" | "completed"
  priority: string
  jobVersion: number
  jobId: string
  steps: { done: number; total: number }
  description: string
  stepItems: Array<{ id: number; text: string }>
}
```

**Current tasks:**
- `t2` — `validate_asset_classification` — visible on load, auto-runs SAUL
- `t1` — `validate_legal_administration_path` — hidden on load; appears + auto-runs when `t2` approved
- `t3` — `validate_probate_plan` — hidden on load; appears + auto-runs when `t1` approved
- `t4` — `revalidate_asset_classification` — hidden on load; appears + auto-runs when "↻ Refresh assets" clicked while `t2` is Completed
- `c1–c3` — completed tasks

---

## Auto-Run Pattern

SAUL runs automatically when a job becomes visible. The card shows a "Processing" badge while running. State machine: `PROCESSING → REVIEW → APPROVED` (no IDLE state — SAUL always starts immediately).

```typescript
// Task processing state — separate from task visibility/status
const [taskProcessing, setTaskProcessing] = useState<Record<string, boolean>>({ t2: true })
const [taskError, setTaskError] = useState<Record<string, string | null>>({})

// When a task becomes visible, start SAUL automatically
const startSaulForTask = (taskId: string) => {
  setTaskProcessing(prev => ({ ...prev, [taskId]: true }))
  setTimeout(() => {
    // 10% failure rate for demo
    if (Math.random() < 0.1) {
      setTaskError(prev => ({ ...prev, [taskId]: "Classification failed — 2 assets are missing titling status." }))
      setTaskProcessing(prev => ({ ...prev, [taskId]: false }))
    } else {
      setTaskProcessing(prev => ({ ...prev, [taskId]: false }))
      // set modal data for this task
    }
  }, 2500)
}
```

**Card badge logic:**
- `taskProcessing[id] === true` → show "Processing" badge (amber/gray)
- `taskError[id]` → show "Error" badge (red)
- Otherwise → normal card

**Modal open behavior:**
- If `taskProcessing[id]` → open to processing state with job-specific message
- If `taskError[id]` → open to error state with message + Retry button
- Otherwise → open directly to REVIEW state

---

## Job Sequencing Pattern

```typescript
const [taskVisibility, setTaskVisibility] = useState<Record<string, boolean>>({ t1: false, t3: false, t4: false })
const [taskStatuses, setTaskStatuses] = useState<Record<string, string>>({})
```

On `t2` approval:
```typescript
setTaskStatuses(prev => ({ ...prev, t2: "completed" }))
setTaskVisibility(prev => ({ ...prev, t1: true }))
startSaulForTask("t1")  // auto-run immediately
```

On `t1` approval:
```typescript
setTaskStatuses(prev => ({ ...prev, t1: "completed" }))
setTaskVisibility(prev => ({ ...prev, t3: true }))
startSaulForTask("t3")  // auto-run immediately
```

On `t3` approval:
```typescript
setTaskStatuses(prev => ({ ...prev, t3: "completed" }))
```

On "↻ Refresh assets" clicked while `taskStatuses.t2 === "completed"`:
```typescript
setTaskVisibility(prev => ({ ...prev, t4: true }))
startSaulForTask("t4")  // auto-run immediately
```

---

## Asset Buckets (enum)

| Enum | Label | Badge colors |
|---|---|---|
| `PROBATE` | Probate | gray-100 / gray-600 |
| `TRUST` | Trust | purple-50 / purple-700 |
| `SMALL_ESTATE_AFFIDAVIT` | Small estate affidavit | blue-50 / blue-600 |
| `POD_TOD` | POD / TOD | green-50 / green-700 |
| `COMMUNITY_PROPERTY` | Community property | teal-50 / teal-700 |
| `JOINT_TENANCY` | Joint tenancy | teal-50 / teal-700 |
| `SPOUSAL_TRANSFER` | Spousal transfer | teal-50 / teal-700 |
| `UNVALIDATED` | Unvalidated — provisional | gray-50 / gray-400 |

Defined as `BUCKET_CONFIG` in `app/page.tsx`.

---

## Legal Path Enums

| Enum | Label | Badge colors |
|---|---|---|
| `PROBATE_INDEPENDENT_ADMINISTRATION` | Probate — Independent Administration | gray-100 / gray-700 |
| `PROBATE_SUPERVISED` | Probate — Supervised | gray-100 / gray-700 |
| `TRUST_ADMINISTRATION` | Trust administration | purple-50 / purple-700 |
| `SMALL_ESTATE_AFFIDAVIT` | Small estate affidavit | blue-50 / blue-600 |
| `NON_PROBATE` | Non-probate transfer | green-50 / green-700 |
| `ANCILLARY_PROBATE` | Ancillary probate | orange-50 / orange-700 |

Defined as `LEGAL_PATH_CONFIG` in `app/page.tsx`.

---

## SAUL Mock Constants

All hardcoded after `JOBS_BOARD_TASKS` in `app/page.tsx`:

- `SAUL_CLASSIFICATION_RESPONSE` — asset buckets, confidence scores, unvalidated flags, blocked paths
- `SAUL_LEGAL_PATH_RESPONSE` — threshold evaluation, primary path, parallel tracks
- `SAUL_PROBATE_PLAN_RESPONSE` — estate summary, tracks, actions, sequencing notes, flags
- `SAUL_REVALIDATE_ASSET` — single asset mock for t4 (Wells Fargo Checking Account, PROBATE, confidence 0.85)

---

## Prototype Conventions

- No real API calls, no real auth, no real state persistence
- SAUL auto-runs on task visibility — no manual trigger buttons
- 10% random failure rate on all SAUL calls for demo purposes
- 1s delay before SAUL starts, 2.5s processing delay
- "↻ Refresh assets" in t2 REVIEW: 1.5s delay, appends Wells Fargo asset; if t2 is Completed, also surfaces t4
- t4 SAUL response is the hardcoded `SAUL_REVALIDATE_ASSET` constant (no network call needed — `t4Ready` flag set on success)
- All state in `EstateManagementPage` via `useState` + `useEffect` (mount-time auto-start for t2)
