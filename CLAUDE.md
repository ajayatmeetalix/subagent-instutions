# CLAUDE.md — Estate Manager Prototype

This is a prototype. There is no full backend. Mock all SAUL API calls using sample JSON defined as constants in `app/page.tsx`.

---

## What's Been Built

### Confirm Asset Classification (✅ Shipped)

A job modal that replaces a manual checklist with a SAUL-driven asset classification review UI.

**Flow:**
1. Specialist opens the "Confirm Asset Classification" modal → sees description + "Run classification" button
2. Clicks "Run classification" → 2.5s simulated delay → SAUL mock response loads
3. Modal renders: blocked paths banner + asset table with bucket dropdowns and confidence indicators
4. Specialist can override any bucket (requires a reason per override)
5. Clicks "Approve classification" → 2s success state → modal closes
6. **Job sequencing:** `t2` moves to Completed; `t1` (Determine Legal Path) appears in To Do

### Determine the Legal Administration Path (✅ Shipped)

The next job in the sequence. Surfaces automatically after asset classification is approved.

**Flow:**
1. Specialist opens the "Determine the Legal Administration Path" modal → sees description + "Determine legal path" button
2. Clicks "Determine legal path" → 2.5s simulated delay → SAUL mock response loads
3. Modal renders three sections:
   - **Threshold evaluation** — probate estate value vs. SEA threshold, qualified/not
   - **Recommended legal path** — primary path badge + SAUL's rationale + parallel tracks (Trust, SEA, Non-probate)
   - **Override control** — single dropdown (always visible); selecting a different path reveals a required reason field
4. "Approve legal path" is always enabled unless an override is selected without a reason
5. Clicks "Approve legal path" → 2s success state → modal closes; `t1` moves to Completed

### Next: Generate Probate Plan (🔜 Next prototype — separate repo)

After legal path is approved, a "Generate Probate Plan" job surfaces. This is being built as a **separate prototype**. See `generate_probate_plan_feature.md` for full context to hand off to that session.

---

## Codebase at a Glance

| | |
|---|---|
| **Framework** | Next.js (App Router), single `app/page.tsx` file (~4,800 lines), `'use client'` |
| **Styling** | Tailwind CSS v4, hardcoded hex colors throughout (see palette below) |
| **UI Library** | shadcn/ui — only `Button` (`components/ui/button.tsx`) and `Input` (`components/ui/input.tsx`) are used |
| **Icons** | Lucide React |
| **State** | React `useState` only — no Redux, no Context |
| **Dev server** | `npx next dev` via `.claude/launch.json` (preview server auto-assigns port) |

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
| `asset_classification_feature.md` | SAUL output schema, mock JSON, bucket/confidence display rules for classification |
| `classification_modal_ui_spec.md` | Classification modal states, layout, implementation decisions |
| `legal_path_feature.md` | Legal path SAUL schema, mock JSON, UI spec, implementation notes |
| `generate_probate_plan_feature.md` | Context doc for the next prototype (separate repo) |
| `.claude/launch.json` | Dev server config |

---

## Jobs Board Data Model

Tasks are defined in the `JOBS_BOARD_TASKS` array (top of `app/page.tsx`):

```typescript
{
  id: string           // "t1", "t2", etc.
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
  jobId: string        // UUID
  steps: { done: number; total: number }
  description: string
  stepItems: Array<{ id: number; text: string }>
}
```

**Current tasks:**
- `t1` — `determine_the_path_of_legal_administration_applicable_to_the_decedent` — hidden on load; appears when `t2` is approved ← has custom SAUL UI
- `t2` — `confirm_asset_classification` (To Do) ← has custom SAUL UI
- `c1–c3` — completed tasks

**Pattern for custom modal UIs:** check `task.slug === "your_slug"` inside the task modal IIFE to swap out the left panel content and footer. The IIFE uses a ternary chain — add new slugs before the final `else` branch.

---

## Job Sequencing Pattern

Task visibility and status are controlled by two state variables, not the hardcoded `JOBS_BOARD_TASKS` array:

```typescript
const [taskVisibility, setTaskVisibility] = useState<Record<string, boolean>>({ t1: false })
const [taskStatuses, setTaskStatuses] = useState<Record<string, string>>({})
```

The kanban board filters/maps over `JOBS_BOARD_TASKS` using these at render time:
```typescript
const tasksWithState = JOBS_BOARD_TASKS
  .filter(t => taskVisibility[t.id] !== false)
  .map(t => ({ ...t, status: (taskStatuses[t.id] ?? t.status) }))
```

To hide a task on load: add `taskId: false` to `taskVisibility` initial state.
To surface a task after an approval: call `setTaskVisibility(prev => ({ ...prev, taskId: true }))`.
To move a task to Completed: call `setTaskStatuses(prev => ({ ...prev, taskId: "completed" }))`.

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

Defined as `BUCKET_CONFIG` constant in `app/page.tsx` (after `JOBS_BOARD_TASKS`).

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

Defined as `LEGAL_PATH_CONFIG` constant in `app/page.tsx` (after `BUCKET_OPTIONS`).

---

## SAUL Mock Pattern

All SAUL responses are hardcoded constants defined outside the component, then loaded via `setTimeout` to simulate network delay:

```typescript
const SAUL_RESPONSE = { ... } // hardcoded at top of file, after JOBS_BOARD_TASKS

const handleRunSaul = () => {
  setState("loading")
  setTimeout(() => {
    setData(SAUL_RESPONSE)
    setState("review")
  }, 2500)
}
```

**Existing mock constants:**
- `SAUL_CLASSIFICATION_RESPONSE` — asset buckets, confidence scores, blocked paths, plan actions
- `SAUL_LEGAL_PATH_RESPONSE` — threshold evaluation, primary path, parallel tracks, blocked paths, plan actions

---

## Prototype Conventions

- No real API calls, no real auth, no real state persistence
- Mock SAUL responses as top-level constants in `app/page.tsx`
- Simulate 2–3 second loading delays
- All state lives in the main `EstateManagementPage` component via `useState`
- When adding a new SAUL-driven job modal:
  1. Add mock data constant after `SAUL_LEGAL_PATH_RESPONSE` (~line 280)
  2. Add state hooks after `legalPathOverrideReason` (~line 306)
  3. Add reset + run + approve handlers after `handleApproveLegalPath` (~line 345)
  4. Add task to `JOBS_BOARD_TASKS` with `status: "todo"` and hide it in `taskVisibility`
  5. Add conditional rendering inside the task modal IIFE left panel (ternary chain ~line 3150)
  6. Add conditional rendering inside the task modal IIFE footer (ternary chain ~line 3700)
  7. Wire up visibility + status transitions in the approve handler
