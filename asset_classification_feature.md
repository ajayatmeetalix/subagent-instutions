# Asset Classification Feature — Context & Implementation Reference

---

## Status: ✅ Shipped (including job sequencing)

The `confirm_asset_classification` job modal is fully implemented. Approving classification also fires job sequencing: `t2` moves to Completed and `t1` (Determine Legal Path) surfaces in the To Do column. This document serves as reference for the mock data schema and display rules.

---

## What the Modal Does

The `confirm_asset_classification` modal lives on the Jobs Board in Estate Manager. A specialist opens it when they're ready to classify the estate's assets. The manual checklist has been replaced with a SAUL-driven review UI.

**Implemented flow (including sequencing):**
1. Specialist clicks "Run classification" in the modal
2. 2.5 second simulated delay, then the mock JSON below loads as SAUL's response
3. Blocked paths banner renders (if any), followed by the asset classification table
4. Specialist can override any bucket via dropdown — each override requires a typed reason
5. "Approve classification" button is disabled until all overrides have reasons
6. Clicking approve shows a 2-second success state then closes the modal

---

## SAUL Response Schema

```typescript
type SaulResponse = {
  classification: {
    assets: Array<{
      asset: string        // asset name
      bucket: BucketEnum   // classification
      reason: string       // SAUL's rationale
      confidence: number   // 0.0–1.0
    }>
  }
  plan: {
    actions: Array<{
      description: string
      deadline: string
      required_forms: string[]
    }>
    flags: Array<{
      type: string         // e.g. "MISSED_DEADLINE"
      description: string
      severity: "HIGH" | "MEDIUM" | "LOW"
    }>
    blocked_paths: Array<{
      procedure: string
      reason: string
    }>
  }
}
```

> **Note:** `plan.flags` is present in the schema but the flags banner was removed from the UI (not relevant to specialist workflow). `plan.actions` is available for use in the next feature (legal path determination).

---

## Sample SAUL Response (Mock Data)

This is hardcoded as `SAUL_CLASSIFICATION_RESPONSE` in `app/page.tsx`.

```json
{
  "classification": {
    "assets": [
      {
        "asset": "Income Property Apartment",
        "bucket": "PROBATE",
        "reason": "Sole ownership real estate requires probate for transfer.",
        "confidence": 0.95
      },
      {
        "asset": "Trading Account",
        "bucket": "PROBATE",
        "reason": "Brokerage account without POD/TOD designation requires probate.",
        "confidence": 0.88
      },
      {
        "asset": "Primary Savings Account",
        "bucket": "PROBATE",
        "reason": "Savings account without POD/TOD designation requires probate.",
        "confidence": 0.88
      },
      {
        "asset": "Rental income from 22 University",
        "bucket": "PROBATE",
        "reason": "Income received after death is part of the probate estate.",
        "confidence": 0.72
      },
      {
        "asset": "Money Owed to Decedent",
        "bucket": "PROBATE",
        "reason": "Unvalidated money owed is part of the probate estate.",
        "confidence": 0.61
      },
      {
        "asset": "Family Home",
        "bucket": "TRUST",
        "reason": "Property owned by a trust is transferred through trust administration.",
        "confidence": 0.97
      },
      {
        "asset": "Art Collection",
        "bucket": "PROBATE",
        "reason": "Personal property exceeding SEA threshold requires probate.",
        "confidence": 0.74
      },
      {
        "asset": "Vehicle (Kia Soul)",
        "bucket": "SMALL_ESTATE_AFFIDAVIT",
        "reason": "Vehicle can be transferred using DMV REG 5 without probate.",
        "confidence": 0.93
      },
      {
        "asset": "Life Insurance",
        "bucket": "POD_TOD",
        "reason": "Life insurance with a named beneficiary transfers directly to the named beneficiary outside probate.",
        "confidence": 0.96
      },
      {
        "asset": "Retirement Account (401k)",
        "bucket": "POD_TOD",
        "reason": "Retirement account with a named beneficiary transfers directly outside probate.",
        "confidence": 0.96
      }
    ]
  },
  "plan": {
    "actions": [
      { "description": "File death claim with State Farm for life insurance.", "deadline": "As soon as practicable", "required_forms": [] },
      { "description": "Contact Fidelity with certified death certificate for 401k transfer.", "deadline": "As soon as practicable", "required_forms": [] },
      { "description": "Distribute Family Home per trust terms.", "deadline": "As soon as practicable", "required_forms": [] },
      { "description": "Complete DMV Form REG 5 for vehicle transfer.", "deadline": "As soon as practicable", "required_forms": ["REG 5"] },
      { "description": "Initiate formal probate for remaining assets.", "deadline": "As soon as practicable", "required_forms": ["DE-111", "DE-160", "DE-161"] },
      { "description": "File Change in Ownership Statement for real property.", "deadline": "2025-10-12", "required_forms": ["BOE-502-D"] }
    ],
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

---

## Bucket Display

Defined as `BUCKET_CONFIG` constant in `app/page.tsx`:

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

## Confidence Display

| Score | Dot color | Label | Row treatment |
|---|---|---|---|
| 0.90–1.0 | `bg-green-500` | High | None |
| 0.70–0.89 | `bg-amber-400` | Medium | None |
| Below 0.70 | `bg-red-500` | Low (red text) | `bg-red-50/40` row tint |

---

## Override Behavior (Implemented)

- Changing a bucket dropdown fires `setBucketOverrides({ ...prev, [idx]: newBucket })`
- Changing back to the original bucket removes the override: `delete next[idx]`
- Override reason stored in `overrideReasons[idx]`
- "Approve classification" disabled if: `Object.keys(bucketOverrides).some(idx => !overrideReasons[Number(idx)]?.trim())`

---

## What This Feeds Into

Both downstream jobs are now built or planned:

| Job | Status |
|---|---|
| Determine the Legal Administration Path (`t1`) | ✅ Shipped — see `legal_path_feature.md` |
| Generate Probate Plan | 🔜 Next prototype (separate repo) — see `generate_probate_plan_feature.md` |

The classification response's `plan.blocked_paths` feeds the legal path modal's blocked path display. The `plan.actions` from `SAUL_LEGAL_PATH_RESPONSE` (not the classification response) feed the Generate Probate Plan prototype.
