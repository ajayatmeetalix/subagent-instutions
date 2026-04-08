# Legal Path Determination Feature

---

## Status: ✅ Shipped

Modal for task `t1` (`determine_the_path_of_legal_administration_applicable_to_the_decedent`). Surfaces automatically in the To Do column after `t2` (Confirm Asset Classification) is approved.

---

## What the Modal Does

After asset classification is approved, the specialist opens this modal. SAUL evaluates the classified assets, runs threshold math, and recommends the correct legal path(s) to settle the estate.

**Flow (IDLE → LOADING → REVIEW → APPROVED):**
1. Specialist clicks "Determine legal path"
2. 2.5s simulated delay, then mock JSON loads
3. Modal renders two sections:
   - **Threshold evaluation** — probate value vs. SEA threshold, qualified/not
   - **Recommended legal path** — primary path badge + SAUL's rationale + parallel tracks + single override control
4. Specialist can override the recommended primary path (requires a reason); approve stays enabled when no override is set
5. Clicks "Approve legal path" → 2s success state → `t1` moves to Completed

**What was intentionally excluded:**
- Action plan / required filings — those belong to the Generate Probate Plan job (separate prototype)
- Blocked paths banner — removed to keep the modal focused

---

## Mock SAUL Response

Hardcoded as `SAUL_LEGAL_PATH_RESPONSE` in `app/page.tsx` (after `SAUL_CLASSIFICATION_RESPONSE`).

```json
{
  "threshold_evaluation": {
    "SEA": {
      "countable_value": 485000,
      "threshold": 184500,
      "exceeds_threshold": true,
      "qualified": false
    },
    "PROBATE": {
      "countable_value": 485000,
      "threshold": 184500,
      "exceeds_threshold": true,
      "qualified": true
    }
  },
  "legal_path": {
    "primary": "PROBATE_INDEPENDENT_ADMINISTRATION",
    "parallel_tracks": [
      { "track": "TRUST_ADMINISTRATION", "assets": ["Family Home"] },
      { "track": "SMALL_ESTATE_AFFIDAVIT", "assets": ["Vehicle (Kia Soul)"] },
      { "track": "NON_PROBATE", "assets": ["Life Insurance", "Retirement Account (401k)"] }
    ],
    "reason": "Probate estate exceeds SEA threshold. No surviving spouse. Will exists — Independent Administration of Estates Act applies."
  },
  "plan": {
    "actions": [
      { "description": "File DMV Form REG 5 for vehicle transfer.", "deadline": "As soon as practicable", "required_forms": ["REG 5"], "track": "SMALL_ESTATE_AFFIDAVIT" },
      { "description": "Contact State Farm with certified death certificate to claim life insurance.", "deadline": "As soon as practicable", "required_forms": ["DEATH_CERTIFICATE"], "track": "NON_PROBATE" },
      { "description": "Contact Fidelity with certified death certificate for 401k transfer.", "deadline": "As soon as practicable", "required_forms": ["DEATH_CERTIFICATE"], "track": "NON_PROBATE" },
      { "description": "Distribute Family Home per trust terms.", "deadline": "As soon as practicable", "required_forms": [], "track": "TRUST_ADMINISTRATION" },
      { "description": "File petition for probate (DE-111) with supporting inventory (DE-160, DE-161).", "deadline": "As soon as practicable", "required_forms": ["DE-111", "DE-160", "DE-161"], "track": "PROBATE" },
      { "description": "File Change in Ownership Statement for real property.", "deadline": "2025-10-12", "required_forms": ["BOE-502-D"], "track": "PROBATE" }
    ],
    "flags": [
      {
        "type": "MISSED_DEADLINE",
        "description": "Lodge original will with court was due Jun 14, 2025. Court may impose penalties under §8200.",
        "severity": "HIGH"
      }
    ],
    "blocked_paths": [
      { "procedure": "Small Estate Affidavit (§13100)", "reason": "Probate estate value ($485,000) exceeds SEA threshold ($184,500)." },
      { "procedure": "Spousal Property Petition (§13500)", "reason": "No surviving spouse." },
      { "procedure": "Spousal Wage Affidavit", "reason": "No surviving spouse." }
    ]
  }
}
```

> **Note:** `plan.actions`, `plan.flags`, and `plan.blocked_paths` are present in the mock data but are **not rendered** in this modal. They are intentionally preserved in the constant so the next prototype (Generate Probate Plan) can use them as a starting point or reference.

---

## Legal Path Display

Defined as `LEGAL_PATH_CONFIG` in `app/page.tsx`:

| Enum | Label | Badge colors |
|---|---|---|
| `PROBATE_INDEPENDENT_ADMINISTRATION` | Probate — Independent Administration | `bg-gray-100` / `text-gray-700` |
| `PROBATE_SUPERVISED` | Probate — Supervised | `bg-gray-100` / `text-gray-700` |
| `TRUST_ADMINISTRATION` | Trust administration | `bg-purple-50` / `text-purple-700` |
| `SMALL_ESTATE_AFFIDAVIT` | Small estate affidavit | `bg-blue-50` / `text-blue-600` |
| `NON_PROBATE` | Non-probate transfer | `bg-green-50` / `text-green-700` |
| `ANCILLARY_PROBATE` | Ancillary probate | `bg-orange-50` / `text-orange-700` |

Override dropdown options defined as `LEGAL_PATH_OPTIONS` array in `app/page.tsx`.

---

## Modal UI Spec

### IDLE
- Description text + card with `FileCheck` icon + "Determine legal path" button (`bg-[#7c6fc4]`)
- Footer: Cancel only

### LOADING
- Same card, button replaced with `Loader2 animate-spin` + "SAUL is evaluating the estate..."
- Footer: Cancel only

### REVIEW
Two sections in the left panel:

**Section 1 — Threshold evaluation**
Gray `bg-[#fafafa]` card showing:
- Probate estate value: $485,000
- SEA threshold (CA): $184,500
- SEA qualified? ✗ No — exceeds threshold (red)
- Probate required? ✓ Yes (green)

**Section 2 — Recommended legal path**
- Primary path badge (`LEGAL_PATH_CONFIG` colors) + SAUL's reason text
- "Running in parallel" section: each parallel track as a smaller badge + associated assets
- **Override control** (always visible, not behind a button):
  - Dropdown showing the current effective path (SAUL's recommendation by default)
  - Selecting a different path → required reason field appears inline
  - Reverting to SAUL's recommendation → override and reason both cleared

Footer (REVIEW state):
```
[Primary: Probate — Independent Administration · 4 tracks]    [Approve legal path →]
```
- Approve enabled unless override is selected without a reason

### APPROVED
- `CheckCircle2` (green) + "Legal path approved" + "Closing..."
- Auto-closes after 2s; `t1` moves to Completed
- Footer: hidden

---

## Implementation

**State hooks** (in `EstateManagementPage`):
```typescript
const [taskVisibility, setTaskVisibility] = useState<Record<string, boolean>>({ t1: false })
const [taskStatuses, setTaskStatuses] = useState<Record<string, string>>({})
const [legalPathState, setLegalPathState] = useState<"idle"|"loading"|"review"|"approved">("idle")
const [legalPathData, setLegalPathData] = useState<typeof SAUL_LEGAL_PATH_RESPONSE | null>(null)
const [legalPathOverride, setLegalPathOverride] = useState<string | null>(null)
const [legalPathOverrideReason, setLegalPathOverrideReason] = useState("")
```

**Key handlers:**
- `resetLegalPathState()` — called on modal open AND close (all paths)
- `handleRunLegalPath()` — sets loading, setTimeout 2500ms, sets data + review
- `handleApproveLegalPath()` — sets approved, setTimeout 2000ms, closes + resets + marks `t1` completed

**Job sequencing:**
- `t1` is hidden on initial load via `taskVisibility: { t1: false }`
- `handleApproveClassification` sets `taskStatuses.t2 = "completed"` and `taskVisibility.t1 = true`
- `handleApproveLegalPath` sets `taskStatuses.t1 = "completed"`

**Conditional rendering trigger:**
```tsx
task.slug === "determine_the_path_of_legal_administration_applicable_to_the_decedent"
```
Checked as the second branch in the left panel ternary chain and footer ternary chain inside the task modal IIFE.

---

## What This Feeds Into

The `plan.actions` from `SAUL_LEGAL_PATH_RESPONSE` are the natural seed for the Generate Probate Plan job. That prototype lives in a separate repo. See `generate_probate_plan_feature.md` for full handoff context.
