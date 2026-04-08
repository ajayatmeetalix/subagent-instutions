# Generate Probate Plan Feature — Handoff Context

---

## Status: 🔜 Next prototype — separate repo

This is the job that surfaces after the legal path is approved. It is **not built in this repo** — it will be its own prototype. This document captures everything the next session needs to build it from scratch.

---

## Where This Fits in the Sequence

```
Confirm Asset Classification (✅ this repo)
        ↓ approve
Determine Legal Administration Path (✅ this repo)
        ↓ approve
Generate Probate Plan (🔜 next repo)
        ↓ approve
... downstream filing / administration jobs
```

---

## What the Job Does

After the specialist approves the legal path, this job surfaces in the To Do column. The specialist opens it, runs SAUL, and gets a full probate action plan: required filings, court forms, deadlines, and track-by-track sequencing. The output of this job activates all downstream work.

---

## Inputs SAUL Already Has

The `SAUL_LEGAL_PATH_RESPONSE` mock in the prior prototype contains everything needed to seed this job. Specifically:

```json
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
```

The approved legal path from the prior step was `PROBATE_INDEPENDENT_ADMINISTRATION` with parallel tracks:
- `TRUST_ADMINISTRATION` → Family Home
- `SMALL_ESTATE_AFFIDAVIT` → Vehicle (Kia Soul)
- `NON_PROBATE` → Life Insurance, Retirement Account (401k)

---

## Proposed Mock SAUL Response

Hardcode as `SAUL_PROBATE_PLAN_RESPONSE` in the new repo's `app/page.tsx`.

```json
{
  "approved_path": "PROBATE_INDEPENDENT_ADMINISTRATION",
  "parallel_tracks": ["TRUST_ADMINISTRATION", "SMALL_ESTATE_AFFIDAVIT", "NON_PROBATE"],
  "plan": {
    "tracks": [
      {
        "track": "PROBATE",
        "label": "Probate — Independent Administration",
        "actions": [
          {
            "id": "p1",
            "description": "File Petition for Probate (DE-111) with the Superior Court.",
            "deadline": "As soon as practicable",
            "required_forms": ["DE-111"],
            "status": "pending"
          },
          {
            "id": "p2",
            "description": "File Inventory and Appraisal (DE-160, DE-161).",
            "deadline": "4 months from Letters issuance",
            "required_forms": ["DE-160", "DE-161"],
            "status": "pending"
          },
          {
            "id": "p3",
            "description": "File Change in Ownership Statement for real property.",
            "deadline": "2025-10-12",
            "required_forms": ["BOE-502-D"],
            "status": "pending"
          },
          {
            "id": "p4",
            "description": "Publish Notice of Petition to Administer Estate in local newspaper.",
            "deadline": "Before hearing date",
            "required_forms": [],
            "status": "pending"
          },
          {
            "id": "p5",
            "description": "Notify known creditors of estate administration.",
            "deadline": "30 days from Letters issuance",
            "required_forms": [],
            "status": "pending"
          }
        ]
      },
      {
        "track": "TRUST_ADMINISTRATION",
        "label": "Trust administration",
        "actions": [
          {
            "id": "t1",
            "description": "Send Notice to Trust Beneficiaries (Probate Code §16061.7).",
            "deadline": "60 days from date of death",
            "required_forms": [],
            "status": "pending"
          },
          {
            "id": "t2",
            "description": "Distribute Family Home per trust terms.",
            "deadline": "As soon as practicable",
            "required_forms": [],
            "status": "pending"
          }
        ]
      },
      {
        "track": "SMALL_ESTATE_AFFIDAVIT",
        "label": "Small estate affidavit",
        "actions": [
          {
            "id": "s1",
            "description": "Complete DMV Form REG 5 for vehicle transfer (Kia Soul).",
            "deadline": "40 days from date of death",
            "required_forms": ["REG 5"],
            "status": "pending"
          }
        ]
      },
      {
        "track": "NON_PROBATE",
        "label": "Non-probate transfer",
        "actions": [
          {
            "id": "n1",
            "description": "File death claim with State Farm for life insurance.",
            "deadline": "As soon as practicable",
            "required_forms": ["DEATH_CERTIFICATE"],
            "status": "pending"
          },
          {
            "id": "n2",
            "description": "Contact Fidelity with certified death certificate for 401k transfer.",
            "deadline": "As soon as practicable",
            "required_forms": ["DEATH_CERTIFICATE"],
            "status": "pending"
          }
        ]
      }
    ],
    "flags": [
      {
        "type": "MISSED_DEADLINE",
        "description": "Lodge original will with court was due Jun 14, 2025. Court may impose penalties under §8200.",
        "severity": "HIGH"
      }
    ]
  }
}
```

---

## Proposed Modal UI

Same IDLE → LOADING → REVIEW → APPROVED pattern as prior modals.

### IDLE
- Description + card with icon + "Generate plan" button (purple `bg-[#7c6fc4]`)
- Footer: Cancel only

### LOADING
- Spinner + "SAUL is generating the plan..."
- Footer: Cancel only

### REVIEW
Two sections in the left panel:

**Section 1 — Missed deadline flag** (if `plan.flags` contains `MISSED_DEADLINE` with severity HIGH)
- Amber/red banner with `AlertTriangle` icon
- Flag description text

**Section 2 — Action plan by track**
- Actions grouped by track, each track labeled with its colored badge (use `LEGAL_PATH_CONFIG` colors from the prior repo for consistency)
- Each action shows: description + deadline + required form badges
- **Per-action override:** specialist can mark any action as "Not applicable" or edit its deadline — requires a reason
- "Approve plan" disabled if any action has an override without a reason

Footer (REVIEW state):
```
[N actions across N tracks]    [Approve plan →]
```

### APPROVED
- `CheckCircle2` (green) + "Plan approved" + "Closing..."
- Auto-closes after 2s

---

## Tech Stack to Replicate

Copy the same stack from this repo:
- Next.js App Router, single `app/page.tsx` file, `'use client'`
- Tailwind CSS v4
- shadcn/ui `Button` + `Input` only
- Lucide React icons
- React `useState` only — no Redux, no Context

**Same color palette:**
- Dark: `#1a1a2e`, `#3d3d3d`, `#2d2d4e`
- Muted text: `#6b675f`, `#9b9b9b`
- Borders: `#e5e5e5`, `#d0d0d0`, `#f0f0f0`
- Light bg: `#f8f7f5`, `#fafafa`
- Accent purple: `#7c6fc4`, `#5a4fa0`

**Same modal pattern** (no Radix Dialog):
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeModal}>
  <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
       onClick={e => e.stopPropagation()}>
    {/* header | body (left panel + right sidebar) | footer */}
  </div>
</div>
```

---

## Key Differences from Prior Modals

| Prior modals | Generate Probate Plan |
|---|---|
| Single global override (legal path) or per-row override (classification) | Per-action override — each action can be individually marked N/A or have its deadline edited |
| Flat list of assets or a single path recommendation | Actions grouped by track with track-colored headers |
| No flags rendered | Missed deadline flag rendered as a prominent banner |

---

## Slug

```
generate_probate_plan
```

Use this as the `slug` on the task card and as the conditional rendering trigger in the modal IIFE.
