# Generate Probate Plan Feature — Prototype Context

---

## Status: 🔜 Next prototype — separate repo

This is the third job in the sequence. It surfaces after legal path is approved and generates a comprehensive, track-by-track settlement plan by synthesizing the outputs of both prior jobs.

---

## Where This Fits

```
Confirm Asset Classification (✅ prior repo)
        ↓ approve
Determine Legal Administration Path (✅ prior repo)
        ↓ approve
Generate Probate Plan (🔜 this prototype)
        ↓ approve
... downstream filing / administration jobs
```

---

## What the Job Does

SAUL reads the approved asset classifications and the approved legal path, then generates a comprehensive estate settlement plan. This is not just a list of tasks — it's a synthesized plan that:

- Summarizes the estate and what was determined in the prior two jobs
- Organizes all required actions by settlement track
- Surfaces sequencing dependencies (e.g. Letters must issue before inventory deadline starts)
- Flags missed deadlines and blocked procedures
- Gives the specialist everything they need to begin executing

The specialist reviews the plan, can mark individual actions as not applicable, then approves. Approval activates all downstream work.

---

## Inputs SAUL Is Synthesizing

**From asset classification (job 1):**
- Income Property Apartment → PROBATE
- Trading Account → PROBATE
- Primary Savings Account → PROBATE
- Rental income from 22 University → PROBATE
- Money Owed to Decedent → PROBATE
- Art Collection → PROBATE
- Family Home → TRUST
- Vehicle (Kia Soul) → SMALL_ESTATE_AFFIDAVIT
- Life Insurance → POD_TOD
- Retirement Account (401k) → POD_TOD

**From legal path determination (job 2):**
- Primary path: PROBATE_INDEPENDENT_ADMINISTRATION
- Parallel tracks: TRUST_ADMINISTRATION, SMALL_ESTATE_AFFIDAVIT, NON_PROBATE
- Probate estate value: $485,000
- SEA disqualified (exceeds $184,500 threshold)
- No surviving spouse — spousal procedures blocked
- Missed deadline: will not lodged with court (due Jun 14, 2025)

---

## Mock SAUL Response

Hardcode as `SAUL_PROBATE_PLAN_RESPONSE` in `app/page.tsx`.

```json
{
  "estate_summary": {
    "estate_name": "Estate of Microsoft Zune",
    "approved_path": "PROBATE_INDEPENDENT_ADMINISTRATION",
    "parallel_tracks": ["TRUST_ADMINISTRATION", "SMALL_ESTATE_AFFIDAVIT", "NON_PROBATE"],
    "probate_estate_value": 485000,
    "total_assets": 10,
    "probate_assets": 6,
    "non_probate_assets": 4,
    "jurisdiction": "California",
    "summary": "This estate requires formal probate under Independent Administration of Estates Act (IAEA). Six assets totaling $485,000 must pass through probate. Four assets transfer outside probate: the Family Home via trust administration, the Kia Soul via DMV REG 5, and life insurance and retirement accounts to named beneficiaries. There is one missed deadline requiring immediate attention."
  },
  "plan": {
    "tracks": [
      {
        "track": "PROBATE",
        "label": "Probate — Independent Administration",
        "description": "Formal probate required for 6 assets. IAEA authority allows independent action on most matters without court approval.",
        "actions": [
          {
            "id": "p1",
            "description": "Lodge original will with the Superior Court.",
            "deadline": "MISSED — was due Jun 14, 2025",
            "required_forms": [],
            "status": "overdue",
            "note": "Court may impose penalties under §8200. Address before filing probate petition."
          },
          {
            "id": "p2",
            "description": "File Petition for Probate (DE-111) with the Superior Court.",
            "deadline": "As soon as practicable",
            "required_forms": ["DE-111"],
            "status": "pending"
          },
          {
            "id": "p3",
            "description": "Publish Notice of Petition to Administer Estate in a newspaper of general circulation.",
            "deadline": "Before hearing date",
            "required_forms": [],
            "status": "pending"
          },
          {
            "id": "p4",
            "description": "Attend probate hearing and obtain Letters Testamentary.",
            "deadline": "Per court scheduling",
            "required_forms": [],
            "status": "pending"
          },
          {
            "id": "p5",
            "description": "Notify all known creditors of estate administration.",
            "deadline": "30 days from Letters issuance",
            "required_forms": [],
            "status": "pending"
          },
          {
            "id": "p6",
            "description": "File Inventory and Appraisal of all probate assets (DE-160, DE-161). Probate referee will appraise: Income Property Apartment, Trading Account, Primary Savings Account, Rental Income, Money Owed to Decedent, Art Collection.",
            "deadline": "4 months from Letters issuance",
            "required_forms": ["DE-160", "DE-161"],
            "status": "pending"
          },
          {
            "id": "p7",
            "description": "File Change in Ownership Statement (BOE-502-D) for Income Property Apartment.",
            "deadline": "2025-10-12",
            "required_forms": ["BOE-502-D"],
            "status": "pending"
          },
          {
            "id": "p8",
            "description": "Pay validated debts and expenses from estate operating account.",
            "deadline": "After creditor claim period closes (4 months from first publication)",
            "required_forms": [],
            "status": "pending"
          },
          {
            "id": "p9",
            "description": "File Petition for Final Distribution (DE-295) and accounting.",
            "deadline": "After creditor period and all claims resolved",
            "required_forms": ["DE-295"],
            "status": "pending"
          }
        ]
      },
      {
        "track": "TRUST_ADMINISTRATION",
        "label": "Trust administration",
        "description": "Family Home is trust-held and transfers outside probate via trust administration.",
        "actions": [
          {
            "id": "t1",
            "description": "Send Notice to Trust Beneficiaries per Probate Code §16061.7.",
            "deadline": "60 days from date of death",
            "required_forms": [],
            "status": "pending"
          },
          {
            "id": "t2",
            "description": "Obtain date-of-death valuation for Family Home for tax purposes.",
            "deadline": "As soon as practicable",
            "required_forms": [],
            "status": "pending"
          },
          {
            "id": "t3",
            "description": "Distribute Family Home to trust beneficiaries per trust terms.",
            "deadline": "After §16061.7 notice period (120 days)",
            "required_forms": [],
            "status": "pending"
          }
        ]
      },
      {
        "track": "SMALL_ESTATE_AFFIDAVIT",
        "label": "Small estate affidavit — vehicle",
        "description": "Vehicle (Kia Soul) qualifies for DMV REG 5 transfer, excluded from the probate estate.",
        "actions": [
          {
            "id": "s1",
            "description": "Complete DMV Form REG 5 to transfer Vehicle (Kia Soul) to successor.",
            "deadline": "40 days from date of death",
            "required_forms": ["REG 5"],
            "status": "pending"
          }
        ]
      },
      {
        "track": "NON_PROBATE",
        "label": "Non-probate transfers",
        "description": "Life Insurance and Retirement Account (401k) transfer directly to named beneficiaries outside probate.",
        "actions": [
          {
            "id": "n1",
            "description": "File death benefit claim with State Farm for Life Insurance. Beneficiary receives proceeds directly.",
            "deadline": "As soon as practicable",
            "required_forms": ["DEATH_CERTIFICATE"],
            "status": "pending"
          },
          {
            "id": "n2",
            "description": "Contact Fidelity with certified death certificate to initiate Retirement Account (401k) transfer to named beneficiary.",
            "deadline": "As soon as practicable",
            "required_forms": ["DEATH_CERTIFICATE"],
            "status": "pending"
          }
        ]
      }
    ],
    "sequencing_notes": [
      "Probate track: p1 (lodge will) → p2 (petition) → p3 (publish notice) → p4 (hearing + Letters) → p5 and p6 run in parallel after Letters issue → p8 after creditor period closes → p9 final distribution.",
      "Trust track runs independently of probate. t1 notice period (120 days) must clear before t3 distribution.",
      "SEA and Non-probate tracks can begin immediately — no dependency on probate Letters."
    ],
    "flags": [
      {
        "type": "MISSED_DEADLINE",
        "description": "Lodge original will with court was due Jun 14, 2025. Court may impose penalties under §8200. Address before filing probate petition.",
        "severity": "HIGH"
      }
    ],
    "blocked_paths": [
      { "procedure": "Small Estate Affidavit §13100 (full estate)", "reason": "Probate estate value ($485,000) exceeds SEA threshold ($184,500)." },
      { "procedure": "Spousal Property Petition (§13500)", "reason": "No surviving spouse." },
      { "procedure": "Spousal Wage Affidavit", "reason": "No surviving spouse." }
    ]
  }
}
```

---

## Modal UI Spec

Same IDLE → LOADING → REVIEW → APPROVED pattern as prior modals.

### IDLE
- Description text + card with `ClipboardList` icon + "Generate probate plan" button (purple `bg-[#7c6fc4]`)
- Subtext on card: "SAUL will synthesize the asset classification and legal path determination to generate a complete settlement plan."
- Footer: Cancel only

### LOADING
- Spinner + "SAUL is generating the settlement plan..."
- Footer: Cancel only

### REVIEW
Four sections in the left panel:

**Section 1 — Missed deadline flag** (render if any flag has severity HIGH)
- Amber banner with `AlertTriangle` icon
- Flag description text

**Section 2 — Estate summary card**
- Compact `bg-[#fafafa]` card showing:
  - Estate name + approved path badge
  - Probate estate value: $485,000
  - Asset breakdown: 6 probate · 4 non-probate · 4 tracks
  - SAUL's plain-English summary paragraph in muted text

**Section 3 — Action plan by track**
- Each track as a stacked section with colored header badge (reuse `LEGAL_PATH_CONFIG` colors)
- Each action shows: description + deadline chip + required form badges
- Overdue actions (`status: "overdue"`): red left border + red deadline text
- Per-action **"Mark N/A"** toggle button — clicking reveals a required reason input inline; action grays out once N/A is confirmed
- Reverting N/A removes the reason requirement

**Section 4 — Sequencing notes**
- Small gray card, `ArrowRight` icon, plain-text list of sequencing notes

Footer (REVIEW state):
```
[N actions across N tracks · 1 flag]    [Approve plan →]
```
- Approve button: `bg-[#1a1a2e]`
- Disabled only if any N/A-toggled action is missing a reason

### APPROVED
- `CheckCircle2` (green) + "Settlement plan approved" + "Closing..."
- Auto-closes after 2 seconds

---

## Key Differences from Prior Modals

| Prior modals | Generate Probate Plan |
|---|---|
| Classification: per-row bucket dropdown override | Per-action N/A toggle with reason |
| Legal path: single path override dropdown | No path override — plan flows from already-approved path |
| No estate summary | Estate summary card synthesizing both prior jobs |
| No sequencing | Sequencing notes showing track dependencies |
| No overdue styling | Overdue actions styled distinctly (red border + red deadline) |

---

## Tech Stack

Same as prior prototype:
- Next.js App Router, single `app/page.tsx`, `'use client'`
- Tailwind CSS v4
- shadcn/ui `Button` + `Input` only
- Lucide React icons
- React `useState` only

**Color palette:**
- Dark: `#1a1a2e`, `#3d3d3d`, `#2d2d4e`
- Muted text: `#6b675f`, `#9b9b9b`
- Borders: `#e5e5e5`, `#d0d0d0`, `#f0f0f0`
- Light bg: `#f8f7f5`, `#fafafa`
- Accent purple: `#7c6fc4`, `#5a4fa0`

**Modal pattern** (no Radix Dialog):
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeModal}>
  <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
       onClick={e => e.stopPropagation()}>
    {/* header | body (left panel + right sidebar) | footer */}
  </div>
</div>
```

---

## Slug

```
generate_probate_plan
```

---

## Claude Code Prompt

> "Read all markdown files in the root directory. Build the Generate Probate Plan prototype from scratch — new Next.js app with the same stack described in this file. The Jobs Board should start with a single visible task card with slug `generate_probate_plan`. Follow the same IDLE → LOADING → REVIEW → APPROVED modal pattern as described. Use `SAUL_PROBATE_PLAN_RESPONSE` as the hardcoded mock response."
