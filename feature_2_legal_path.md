# Feature 2: Validate Legal Administration Path

**Slug:** `validate_legal_administration_path` | **Task ID:** `t1`
**Status:** ✅ Shipped
**Position in sequence:** Job 2 of 4

---

## What the Modal Does

After asset classification is approved, this job surfaces and SAUL runs automatically. The specialist opens the card to find the legal path evaluation already complete (or in progress). Their job is to validate SAUL's recommendation.

**Flow:**
1. Job appears in To Do with "Processing" badge — SAUL starts automatically after 1s
2. Specialist can click while processing → modal shows: *"SAUL is evaluating the legal path..."*
3. When SAUL finishes → card transitions to normal To Do, modal opens directly to REVIEW
4. REVIEW renders: threshold evaluation card + recommended legal path + override control
5. Specialist reviews threshold math and path recommendation
6. Optionally overrides primary path — requires a written reason
7. Clicks "Approve legal path" → 2s success state → closes → job sequencing fires

---

## Processing and Error States

**Processing state** (card badge: amber "Processing")
- Modal shows: spinner + *"SAUL is evaluating the legal path..."*
- Footer: Cancel only

**Error state** (card badge: red "Error", 10% random failure rate for demo)
- Modal shows: *"Legal path evaluation failed — threshold data could not be retrieved for this jurisdiction. Retry or contact support."*
- Footer: "Retry" button + Cancel

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
    "actions": [...],
    "flags": [...],
    "blocked_paths": [...]
  }
}
```

> `plan.actions`, `plan.flags`, and `plan.blocked_paths` are present but not rendered in this modal. Preserved for Sub-Agent 3.

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

## REVIEW State Layout

**Section 1 — Threshold evaluation**
Gray `bg-[#fafafa]` card:
- Probate estate value: $485,000
- SEA threshold (CA): $184,500
- SEA qualified? ✗ No — exceeds threshold (red)
- Probate required? ✓ Yes (green)

**Section 2 — Recommended legal path**
- Primary path badge + SAUL's reason text
- "Running in parallel" section: track badges + associated assets
- Override control (always visible): dropdown defaulting to SAUL's recommendation
  - Selecting a different path → required reason field appears
  - Reverting → override and reason cleared

Footer:
```
[Primary: Probate — Independent Administration · 4 tracks]    [Approve legal path →]
```
- Approve enabled unless override selected without a reason

---

## Override Behavior

Single override — one dropdown, one reason field:
- `legalPathOverride` state: `string | null`
- `legalPathOverrideReason` state: `string`
- Approve disabled if: `legalPathOverride !== null && !legalPathOverrideReason.trim()`

---

## Job Sequencing

On approval:
```typescript
setTaskStatuses(prev => ({ ...prev, t1: "completed" }))
setTaskVisibility(prev => ({ ...prev, t3: true }))
startSaulForTask("t3")  // t3 auto-runs immediately
```

Previous job: `feature_1_asset_classification.md`
Next job: `feature_3_generate_probate_plan.md`
