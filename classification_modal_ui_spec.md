# Classification Modal — UI Spec (✅ Shipped)

---

## Modal States

```
IDLE → LOADING → REVIEW → APPROVED
```

### IDLE
- Shows task description
- "Asset Classification" card with `BarChart3` icon + subtext + purple "Run classification" button (`bg-[#7c6fc4]`)
- Footer: Cancel only (no Save)

### LOADING
- Same card but button replaced with `Loader2 animate-spin` + "SAUL is classifying assets..."
- Footer: Cancel only

### REVIEW
Two sections in the left panel:

**Section 1 — Blocked paths** (only if `plan.blocked_paths` is non-empty)
- Gray card with `Ban` icon + "BLOCKED PATHS" label
- Each path: `procedure — reason` in `text-sm`

**Section 2 — Asset table**
- 3-column div-based grid: `grid-cols-[1fr_140px_90px]`
- Columns: Asset (+ reason in muted subtext) | Bucket (dropdown) | Confidence
- Bucket dropdown: colored badge using `BUCKET_CONFIG` — `<select>` inside a colored `inline-flex` container with `ChevronDown` overlay
- Confidence: colored dot (`w-2 h-2 rounded-full`) + label
- Low confidence rows (`< 0.70`): `bg-red-50/40` row tint
- Override: changing bucket reveals inline required text input below that row; button disabled until filled
- Reverting bucket to original removes the override requirement

Footer (REVIEW state):
```
[N assets classified · N low confidence]    [Approve classification →]
```
- Approve button: `bg-[#1a1a2e]`, disabled (`opacity-50 cursor-not-allowed`) while any override is missing a reason

### APPROVED
- Centered `CheckCircle2` (green) + "Classification approved" + "Closing..."
- Auto-closes modal after 2 seconds, resets all classification state
- **Job sequencing fires:** `t2` → Completed, `t1` (Determine Legal Path) → visible in To Do
- Footer: hidden

---

## Implementation Details

**State hooks** (in `EstateManagementPage`):
```typescript
const [classificationState, setClassificationState] = useState<"idle"|"loading"|"review"|"approved">("idle")
const [classificationData, setClassificationData] = useState<typeof SAUL_CLASSIFICATION_RESPONSE | null>(null)
const [bucketOverrides, setBucketOverrides] = useState<Record<number, string>>({})
const [overrideReasons, setOverrideReasons] = useState<Record<number, string>>({})
```

**Key handlers:**
- `resetClassificationState()` — called on modal open AND close (all paths)
- `handleRunClassification()` — sets loading, setTimeout 2500ms, then sets data + review
- `handleApproveClassification()` — sets approved, setTimeout 2000ms, closes + resets + fires job sequencing:
  ```typescript
  setTaskStatuses(prev => ({ ...prev, t2: "completed" }))
  setTaskVisibility(prev => ({ ...prev, t1: true }))
  ```

**Conditional rendering trigger:**
```tsx
task.slug === "confirm_asset_classification"
```
Checked as the first branch in the left panel ternary chain and footer ternary chain inside the task modal IIFE.

**Mock data constant:** `SAUL_CLASSIFICATION_RESPONSE` — defined after `JOBS_BOARD_TASKS` in `app/page.tsx`
