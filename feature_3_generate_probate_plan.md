# Feature 3: Validate Probate Plan

**Slug:** `validate_probate_plan` | **Task ID:** `t3`
**Status:** ✅ Shipped
**Position in sequence:** Job 3 of 4

---

## What the Modal Does

After the legal path is approved, this job surfaces and SAUL runs automatically. SAUL synthesizes the approved asset classifications and legal path from the two prior jobs to generate a comprehensive settlement plan. The specialist opens the card to validate SAUL's output.

**Flow:**
1. Job appears in To Do with "Processing" badge — SAUL starts automatically after 1s
2. Specialist can click while processing → modal shows: *"SAUL is building the settlement plan..."*
3. When SAUL finishes → card transitions to normal To Do, modal opens directly to REVIEW
4. REVIEW renders: missed deadline flag + estate summary + action plan by track + sequencing notes
5. Specialist reviews the plan, optionally marks individual actions as N/A — each requires a written reason
6. Clicks "Approve plan" → 2s success state → closes → `t3` moves to Completed

---

## Processing and Error States

**Processing state** (card badge: amber "Processing")
- Modal shows: spinner + *"SAUL is building the settlement plan..."*
- Footer: Cancel only

**Error state** (card badge: red "Error", 10% random failure rate for demo)
- Modal shows: *"Plan generation failed — could not retrieve required forms data for California probate. Retry or contact support."*
- Footer: "Retry" button + Cancel

---

## Mock SAUL Response

Hardcoded as `SAUL_PROBATE_PLAN_RESPONSE` in `app/page.tsx` (after `SAUL_LEGAL_PATH_RESPONSE`).

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
          { "id": "p1", "description": "Lodge original will with the Superior Court.", "deadline": "MISSED — was due Jun 14, 2025", "required_forms": [], "status": "overdue", "note": "Court may impose penalties under §8200." },
          { "id": "p2", "description": "File Petition for Probate (DE-111) with the Superior Court.", "deadline": "As soon as practicable", "required_forms": ["DE-111"], "status": "pending" },
          { "id": "p3", "description": "Publish Notice of Petition to Administer Estate.", "deadline": "Before hearing date", "required_forms": [], "status": "pending" },
          { "id": "p4", "description": "Attend probate hearing and obtain Letters Testamentary.", "deadline": "Per court scheduling", "required_forms": [], "status": "pending" },
          { "id": "p5", "description": "Notify all known creditors of estate administration.", "deadline": "30 days from Letters issuance", "required_forms": [], "status": "pending" },
          { "id": "p6", "description": "File Inventory and Appraisal (DE-160, DE-161).", "deadline": "4 months from Letters issuance", "required_forms": ["DE-160", "DE-161"], "status": "pending" },
          { "id": "p7", "description": "File Change in Ownership Statement (BOE-502-D) for Income Property Apartment.", "deadline": "2025-10-12", "required_forms": ["BOE-502-D"], "status": "pending" },
          { "id": "p8", "description": "Pay validated debts and expenses from estate operating account.", "deadline": "After creditor claim period closes", "required_forms": [], "status": "pending" },
          { "id": "p9", "description": "File Petition for Final Distribution (DE-295) and accounting.", "deadline": "After creditor period and all claims resolved", "required_forms": ["DE-295"], "status": "pending" }
        ]
      },
      {
        "track": "TRUST_ADMINISTRATION",
        "label": "Trust administration",
        "description": "Family Home is trust-held and transfers outside probate via trust administration.",
        "actions": [
          { "id": "t1", "description": "Send Notice to Trust Beneficiaries per Probate Code §16061.7.", "deadline": "60 days from date of death", "required_forms": [], "status": "pending" },
          { "id": "t2", "description": "Obtain date-of-death valuation for Family Home for tax purposes.", "deadline": "As soon as practicable", "required_forms": [], "status": "pending" },
          { "id": "t3", "description": "Distribute Family Home to trust beneficiaries per trust terms.", "deadline": "After §16061.7 notice period (120 days)", "required_forms": [], "status": "pending" }
        ]
      },
      {
        "track": "SMALL_ESTATE_AFFIDAVIT",
        "label": "Small estate affidavit — vehicle",
        "description": "Vehicle (Kia Soul) qualifies for DMV REG 5 transfer.",
        "actions": [
          { "id": "s1", "description": "Complete DMV Form REG 5 to transfer Vehicle (Kia Soul) to successor.", "deadline": "40 days from date of death", "required_forms": ["REG 5"], "status": "pending" }
        ]
      },
      {
        "track": "NON_PROBATE",
        "label": "Non-probate transfers",
        "description": "Life Insurance and Retirement Account transfer directly to named beneficiaries.",
        "actions": [
          { "id": "n1", "description": "File death benefit claim with State Farm for Life Insurance.", "deadline": "As soon as practicable", "required_forms": ["DEATH_CERTIFICATE"], "status": "pending" },
          { "id": "n2", "description": "Contact Fidelity with certified death certificate for 401k transfer.", "deadline": "As soon as practicable", "required_forms": ["DEATH_CERTIFICATE"], "status": "pending" }
        ]
      }
    ],
    "sequencing_notes": [
      "Probate track: p1 → p2 → p3 → p4 (hearing + Letters) → p5 and p6 in parallel → p8 after creditor period → p9 final distribution.",
      "Trust track runs independently. t1 notice period (120 days) must clear before t3 distribution.",
      "SEA and Non-Probate tracks can begin immediately — no dependency on probate Letters."
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

## REVIEW State Layout

Four sections in the left panel:

**Section 1 — Missed deadline flag** (render if any flag has `severity: "HIGH"`)
- Amber banner with `AlertTriangle` icon + flag description

**Section 2 — Estate summary card**
- `bg-[#fafafa]` card: estate name + approved path badge + probate value + asset breakdown + summary paragraph

**Section 3 — Action plan by track**
- Each track: colored header badge (reuse `LEGAL_PATH_CONFIG`) + track description + action rows
- Each action: description + deadline chip + required form badges
- `status: "overdue"` → red left border + red deadline text
- Per-action "Mark N/A" toggle → reveals required reason input → action grays out

**Section 4 — Sequencing notes**
- Gray card with `ArrowRight` icon + plain-text list

Footer:
```
[N actions across N tracks · 1 flag]    [Approve plan →]
```
- Approve disabled if any N/A-toggled action has empty reason

---

## N/A Override Behavior

```typescript
const [naOverrides, setNaOverrides] = useState<Record<string, boolean>>({})
const [naReasons, setNaReasons] = useState<Record<string, string>>({})

// Approve disabled condition:
Object.keys(naOverrides).some(id => naOverrides[id] && !naReasons[id]?.trim())
```

---

## Job Sequencing

On approval:
```typescript
setTaskStatuses(prev => ({ ...prev, t3: "completed" }))
```

Previous job: `feature_2_legal_path.md`
