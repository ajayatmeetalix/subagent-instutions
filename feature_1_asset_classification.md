# Feature 1: Validate Asset Classification

**Slug:** `validate_asset_classification` | **Task ID:** `t2`
**Status:** ✅ Shipped
**Position in sequence:** Job 1 of 4

---

## What the Modal Does

SAUL runs automatically when this job becomes visible on the Jobs Board. The specialist opens the card to find SAUL's classification already complete (or in progress). Their job is to validate SAUL's output — review, override if needed, approve.

**Flow:**
1. Job appears in To Do with "Processing" badge — SAUL starts automatically after 1s
2. Specialist can click the card while processing → modal opens to processing state: *"SAUL is classifying assets..."*
3. When SAUL finishes → card transitions to normal To Do, modal opens directly to REVIEW
4. REVIEW renders: blocked paths banner (if any) + asset classification table
5. Specialist reviews each asset — bucket, rationale, confidence, unvalidated flag
6. Optionally overrides any bucket — each override requires a written reason
7. "↻ Refresh assets" button at the bottom of the table — see section below
8. Clicks "Approve classification" → 2s success state → closes → job sequencing fires

---

## Processing and Error States

**Processing state** (card badge: amber "Processing")
- Card is clickable while processing
- Modal shows: spinner + "SAUL is classifying assets..." + "This usually takes a few seconds. We'll update this card when it's ready to review."
- Footer: Cancel only

**Error state** (card badge: red "Error", 10% random failure rate for demo)
- Modal shows specific error message identifying what blocked SAUL:
  *"Classification failed — 2 assets are missing titling status: Money Owed to Decedent, Rental income from 22 University. Update these assets and retry."*
- Footer: "Retry" button + Cancel

---

## Mock SAUL Response

Hardcoded as `SAUL_CLASSIFICATION_RESPONSE` in `app/page.tsx`.

```json
{
  "classification": {
    "assets": [
      {
        "asset": "Income Property Apartment",
        "bucket": "PROBATE",
        "reason": "Sole ownership real estate requires probate for transfer.",
        "confidence": 0.95,
        "validated": true
      },
      {
        "asset": "Trading Account",
        "bucket": "PROBATE",
        "reason": "Brokerage account without POD/TOD designation requires probate.",
        "confidence": 0.88,
        "validated": true
      },
      {
        "asset": "Primary Savings Account",
        "bucket": "PROBATE",
        "reason": "Savings account without POD/TOD designation requires probate.",
        "confidence": 0.88,
        "validated": true
      },
      {
        "asset": "Rental income from 22 University",
        "bucket": "PROBATE",
        "reason": "Income received after death is part of the probate estate.",
        "confidence": 0.72,
        "validated": false,
        "validation_note": "Classification may change when titling is confirmed."
      },
      {
        "asset": "Money Owed to Decedent",
        "bucket": "PROBATE",
        "reason": "Unvalidated money owed is part of the probate estate.",
        "confidence": 0.61,
        "validated": false,
        "validation_note": "Classification may change when titling is confirmed."
      },
      {
        "asset": "Family Home",
        "bucket": "TRUST",
        "reason": "Property owned by a trust is transferred through trust administration.",
        "confidence": 0.97,
        "validated": true
      },
      {
        "asset": "Art Collection",
        "bucket": "PROBATE",
        "reason": "Personal property exceeding SEA threshold requires probate.",
        "confidence": 0.74,
        "validated": true
      },
      {
        "asset": "Vehicle (Kia Soul)",
        "bucket": "SMALL_ESTATE_AFFIDAVIT",
        "reason": "Vehicle can be transferred using DMV REG 5 without probate.",
        "confidence": 0.93,
        "validated": true
      },
      {
        "asset": "Life Insurance",
        "bucket": "POD_TOD",
        "reason": "Life insurance with a named beneficiary transfers directly outside probate.",
        "confidence": 0.96,
        "validated": true
      },
      {
        "asset": "Retirement Account (401k)",
        "bucket": "POD_TOD",
        "reason": "Retirement account with a named beneficiary transfers directly outside probate.",
        "confidence": 0.96,
        "validated": true
      }
    ]
  },
  "plan": {
    "actions": [...],
    "flags": [
      {
        "type": "MISSED_DEADLINE",
        "description": "Lodge original will with court was due Jun 14, 2025. Court may impose penalties under §8200.",
        "severity": "HIGH"
      }
    ],
    "blocked_paths": [
      {
        "procedure": "Spousal Property Petition (§13500)",
        "reason": "Unavailable — no surviving spouse."
      },
      {
        "procedure": "Spousal Wage Affidavit",
        "reason": "Unavailable — no surviving spouse."
      }
    ]
  }
}
```

> `plan.flags` not rendered in this modal. `plan.blocked_paths` surfaces above the asset table. `plan.actions` passed to Sub-Agent 2.

---

## Bucket Display

Defined as `BUCKET_CONFIG` in `app/page.tsx`:

| Enum | Label | Tailwind bg | Tailwind text |
|---|---|---|---|
| `PROBATE` | Probate | `bg-gray-100` | `text-gray-600` |
| `TRUST` | Trust | `bg-purple-50` | `text-purple-700` |
| `SMALL_ESTATE_AFFIDAVIT` | Small estate affidavit | `bg-blue-50` | `text-blue-600` |
| `POD_TOD` | POD / TOD | `bg-green-50` | `text-green-700` |
| `COMMUNITY_PROPERTY` | Community property | `bg-teal-50` | `text-teal-700` |
| `JOINT_TENANCY` | Joint tenancy | `bg-teal-50` | `text-teal-700` |
| `SPOUSAL_TRANSFER` | Spousal transfer | `bg-teal-50` | `text-teal-700` |

---

## Unvalidated Asset Display

Assets with `validated: false` render differently from low-confidence assets:

| State | What it means | Badge | Row treatment |
|---|---|---|---|
| `validated: false` | Titling data not yet confirmed — classification is provisional | Gray "Unvalidated — provisional" badge | Light gray row tint `bg-gray-50/60` |
| `confidence < 0.70` | SAUL classified but with low certainty | Red confidence dot | `bg-red-50/40` row tint |

Unvalidated is a data completeness flag. Low confidence is a SAUL certainty flag. They are distinct and can co-occur.

---

## Confidence Display

| Score | Dot color | Label | Row treatment |
|---|---|---|---|
| 0.90–1.0 | `bg-green-500` | High | None |
| 0.70–0.89 | `bg-amber-400` | Medium | None |
| Below 0.70 | `bg-red-500` | Low | `bg-red-50/40` row tint |

---

## Override Behavior

- Changing a bucket fires `setBucketOverrides({ ...prev, [idx]: newBucket })`
- Changing back to original removes override: `delete next[idx]`
- Override reason stored in `overrideReasons[idx]`
- Approve disabled if: `Object.keys(bucketOverrides).some(idx => !overrideReasons[Number(idx)]?.trim())`

---

## Refresh Assets

A "↻ Refresh assets" button appears at the bottom of the asset table in REVIEW state.

**Behavior:**
1. Clicking triggers a 1.5s simulated SAUL call (spinner shown while loading)
2. Result appends to the bottom of the classification table with a "New — needs review" amber badge
3. New asset follows the same override/approve logic as existing assets
4. **If `t2` is already in Completed status at click time:** `t4` (Re-validate Asset Classification) surfaces in To Do with a Processing badge and auto-runs SAUL

**Mock response** (`SAUL_REVALIDATE_ASSET` constant in `app/page.tsx`):
```json
{
  "asset": "Checking Account — Wells Fargo",
  "bucket": "PROBATE",
  "reason": "Bank account without POD/TOD designation requires probate.",
  "confidence": 0.85,
  "validated": true,
  "isNew": true
}
```

---

## Job Sequencing

On approval:
```typescript
setTaskStatuses(prev => ({ ...prev, t2: "completed" }))
setTaskVisibility(prev => ({ ...prev, t1: true }))
startSaulForTask("t1")  // t1 auto-runs immediately
```

Next jobs: `feature_2_legal_path.md` (t1), `feature_4_revalidate_asset_classification.md` (t4 — conditional)
