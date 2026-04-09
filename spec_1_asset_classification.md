# Sub-Agent 1: Validate Asset Classification

**Author:** Ajay  **Status:** Shipped  **Last updated:** April 2026

---

## The short version

Right now, asset classification happens manually. A settlement specialist looks at the estate's asset list, applies their knowledge of California probate rules, and decides which assets need to go through probate, which pass outside it, and which qualify for simplified transfer. There's no system support for this — it's entirely in the specialist's head.

This feature replaces that manual step with a SAUL-driven review workflow backed by KB v5. When the job surfaces on the Jobs Board, SAUL starts automatically — the specialist doesn't trigger it. By the time they open the card, classification is already running or complete. They review SAUL's output, can override any classification they disagree with, and approve. That approval is the formal gate that unlocks the rest of the legal workflow.

A working prototype is available at [prototype link].

---

## Background

Estate settlement in California requires determining which assets can pass outside probate (through trust, named beneficiaries, joint tenancy, or simplified affidavit) before any legal work can begin. Getting this wrong at the start cascades through everything downstream — wrong filings, wrong timelines, wrong forms.

Today, specialists do this by hand. That creates inconsistency across cases, slows down the intake process, and puts cognitive load on the specialist that doesn't need to be there. SAUL, backed by KB v5, has the structured legal rules to do this classification reliably and systematically. This feature surfaces that capability as a specialist review workflow rather than a fully automated black box — the specialist stays in the loop, but the heavy lifting is done for them.

---

## What this sub-agent does

This is the first job in the legal sub-agent sequence. SAUL runs automatically when the job becomes visible, reading all assets on the estate record and classifying each one into a settlement bucket using KB v5's transfer mechanism rules. The specialist reviews the classifications, can override any bucket with a reason, then approves. Approval moves the job to Completed and surfaces the Validate Legal Administration Path job — which also begins running SAUL automatically.

**Inputs:**
- All assets on the estate record (type, value, titling status, POD/TOD flag, trust-held flag)
- Estate jurisdiction and date of death (used to query the correct KB v5 rules)

**Output:**
- Approved classification for each asset (bucket + reason + confidence)
- Total countable probate estate value (passed to Sub-Agent 2 for threshold evaluation)
- Override log if specialist changed any of SAUL's classifications

---

## Flow

1. Job appears in To Do with an amber "Processing" badge — SAUL starts automatically
2. Specialist can open the card while processing → modal shows spinner + *"SAUL is classifying assets..."*
3. When SAUL finishes → card transitions to normal To Do state, modal opens directly to REVIEW
4. REVIEW renders: blocked paths banner (if any) + asset classification table
5. Specialist reviews each asset — bucket, rationale, confidence level, unvalidated flag
6. Optionally overrides any bucket — each override requires a written reason
7. "↻ Refresh assets" button at the bottom of the table — pulls any newly discovered assets (see below)
8. Clicks "Approve classification" → 2s success state → modal closes → Validate Legal Path surfaces and auto-runs

---

## Processing and error states

**Processing state** (card badge: amber "Processing")
- Card is clickable while processing
- Modal shows: spinner + *"SAUL is classifying assets..."* + *"This usually takes a few seconds. We'll update this card when it's ready to review."*
- Footer: Cancel only

**Error state** (card badge: red "Error")
- Occurs when SAUL cannot complete classification — typically due to missing titling data
- Modal shows a specific error message identifying what blocked SAUL: *"Classification failed — 2 assets are missing titling status: Money Owed to Decedent, Rental income from 22 University. Update these assets and retry."*
- Footer: "Retry" button + Cancel
- Retry re-runs the full SAUL classification call

---

## Mock SAUL response

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

> `plan.flags` is present in the schema but not rendered in this modal. `plan.blocked_paths` surfaces in the blocked paths banner above the asset table. `plan.actions` is passed to Sub-Agent 2.

---

## What we're building

A modal in CoPilot, populated from the "Validate Asset Classification" job. It replaces the current manual checklist with a SAUL-driven UI backed by KB v5.

When the job appears, SAUL starts automatically — the specialist doesn't need to trigger it. Opening the card while SAUL is running shows a processing state. Once complete, the modal opens directly to the review table.

The review table shows each asset with its assigned bucket, SAUL's plain-English rationale, a confidence level, and an unvalidated flag where titling hasn't been confirmed. Low-confidence assets are visually flagged so the specialist knows where to focus. Unvalidated assets are flagged separately — these are provisional classifications that may change once titling is confirmed. If any blocked paths exist (procedures that are unavailable for this estate, like a spousal transfer when there's no surviving spouse), those surface in a banner above the table.

The specialist can change any bucket via a dropdown. If they do, a required reason field appears — they have to write down why they're overriding SAUL before they can approve. The approve button stays disabled until all overrides have reasons.

A "↻ Refresh assets" button at the bottom of the table lets specialists pull newly discovered assets into the classification without re-running the full job. If a new asset is discovered after the job is already approved, refreshing from the completed card surfaces a dedicated Re-validate Asset Classification job (Sub-Agent 4) for that asset alone.

Approving the classification closes the modal, moves the job to Completed, and automatically surfaces Validate Legal Administration Path — which also starts running SAUL immediately.

---

## Asset classification buckets

SAUL classifies each asset into one of seven buckets:

| Bucket | When it applies |
|---|---|
| **Probate** | Assets with no transfer mechanism — sole ownership real estate, accounts without POD/TOD, personal property above SEA threshold |
| **Trust** | Assets titled to a trust — pass through trust administration outside probate |
| **POD / TOD** | Financial accounts and insurance with a named Pay on Death or Transfer on Death beneficiary |
| **Small estate affidavit** | Assets eligible for simplified transfer — primarily vehicles via DMV REG 5, or estates under the §13100 threshold |
| **Community property** | Property held as community property with a surviving spouse |
| **Joint tenancy** | Property with right of survivorship that passes to the surviving joint tenant |
| **Spousal transfer** | Assets eligible for spousal property petition under §13500 |

---

## Confidence levels

SAUL returns a confidence score for each classification. The specialist interface uses this to direct their attention:

| Score | Label | Visual treatment |
|---|---|---|
| 0.90–1.0 | High | Green dot, no row highlight |
| 0.70–0.89 | Medium | Amber dot, no row highlight |
| Below 0.70 | Low | Red dot, red row tint |

Low-confidence assets require closer review. The specialist should investigate these before approving.

---

## Unvalidated assets

Some assets carry a `validated: false` flag — meaning titling data has not yet been confirmed at the time SAUL runs. This is distinct from low confidence.

| State | What it means | Visual treatment |
|---|---|---|
| `validated: false` | Titling not yet confirmed — classification is provisional | "Unvalidated — provisional" badge, light gray row tint |
| `confidence < 0.70` | SAUL classified but with low certainty | Red confidence dot, red row tint |

These states are independent and can co-occur. An unvalidated asset can also be low-confidence. The specialist should note that unvalidated classifications may change once the missing titling data arrives — approving them is approving a provisional classification.

In this estate: Money Owed to Decedent and Rental income from 22 University are unvalidated.

---

## Override behavior

The specialist can change any bucket SAUL assigns. When they do:

- A required text field appears below that row: *"Why are you changing this classification?"*
- The approve button is disabled until the reason is filled in
- Reverting the dropdown back to SAUL's original value clears the override and hides the reason field

**Why this matters:** Every override is logged against the estate record. This serves two purposes — it's the audit trail if the classification is ever questioned, and it's the feedback loop for improving SAUL. Consistent overrides on a pattern tell us where SAUL's reasoning needs work.

---

## Refresh assets

A "↻ Refresh assets" button appears at the bottom of the asset table in REVIEW state. This lets specialists pull a newly discovered asset into the current classification without re-running the full SAUL job.

**Behavior:**
1. Clicking triggers a SAUL call for the new asset (1.5s)
2. Result appends to the bottom of the classification table with a "New — needs review" amber badge
3. New asset follows the same override/approve logic as existing assets

**If the job is already approved:** Clicking refresh from the completed card surfaces a dedicated Re-validate Asset Classification job (t4) in To Do. That job auto-runs SAUL for the new asset immediately and follows its own approval flow. See Sub-Agent 4 spec.

**Mock response for the refreshed asset:**
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

## What this unlocks

Approving the classification fires the job sequencing that starts the legal workflow:

```
Validate Asset Classification  →  Validate Legal Administration Path  →  Validate Probate Plan
```

The Validate Legal Path job will not surface until this job is approved — and when it does, SAUL begins running immediately. This is intentional: SAUL cannot run threshold math and determine the legal path until it knows which assets are in the probate estate and which aren't.

---

## How SAUL and the KB work together

SAUL does not generate legal facts. It reasons over structured facts injected from KB v5 at call time. For asset classification, the relevant KB tables are:

- **T3 — Non-Probate Transfer Mechanisms:** The rules SAUL applies to determine whether an asset has a transfer mechanism that operates outside probate (named beneficiary, joint tenancy, trust title, TOD/POD designation). This is the primary classification logic.
- **T4 — Threshold Calculation Rules:** What counts toward the probate estate value, what's excluded, and how to calculate the total SAUL uses for threshold evaluation in Sub-Agent 2.

Before calling SAUL, the backend queries the relevant KB v5 rows for the estate's jurisdiction and date of death, injects them into the SAUL prompt, and passes the estate's asset list. SAUL classifies each asset against those injected rules. It never classifies from training knowledge alone.

---

## What's out of scope

- **Multi-state estates** — the initial build is California only. Ancillary probate for out-of-state real property is not handled in this version.
- **Bulk override** — overrides are per-asset. There is no "apply to all" or "reject all" action in this version.

---

## Open questions

- **What triggers this job?** Currently it fires when the case enters the legal workflow phase. The right trigger is `asset_discovery_complete` — a formal signal that all POD/TOD lookups and titling data have been gathered. That event doesn't exist yet. For the initial build, the job fires on case intake. We need to define the preconditions before production.
- **Where do override logs get surfaced?** They're stored on the asset record. Is there a view in Estate Manager where a specialist or attorney can see the full override history for an estate? If not, we need one.
- **Unvalidated assets at approval time** — the specialist can approve a classification that includes unvalidated assets. Is that acceptable? Should unvalidated assets block approval, or is a provisional classification sufficient to unlock Sub-Agent 2?

---

## Monitoring and EVAL

### Performance target
SAUL should classify each asset correctly **90% of the time**. Override rate >10% across all asset classifications in a given week triggers investigation.

Override rate is measured at the **asset level**: number of bucket changes / total assets classified. One estate with 10 assets and 2 overrides = 20% for that estate, but the rolling metric is across all asset classifications across all estates.

### Metrics

**Override rate by bucket** — are certain buckets overridden more than others?
- High PROBATE override rate → SAUL may be over-classifying assets that have a transfer mechanism
- High POD_TOD override rate → titling data may be arriving after SAUL runs
- High TRUST override rate → trust titling may not be consistently recorded in Estate Manager

**Override rate on unvalidated vs. validated assets** — unvalidated assets are expected to have higher override rates (classification is provisional by design). Track separately so unvalidated noise doesn't inflate the core accuracy metric.

**Confidence calibration** — do confidence scores predict overrides?
- Assets with confidence ≥0.90 should have override rate <5%
- Assets with confidence 0.70–0.89 should have override rate ~10%
- Assets with confidence <0.70 should have override rate >15%
- If high-confidence assets are being overridden frequently, SAUL's confidence signal is miscalibrated and is misleading specialists

**Re-validate rate (t4)** — how often does the refresh button surface new assets after SA1 is approved? A high rate is an upstream signal that asset discovery is completing too late in the workflow, not a SAUL accuracy signal.

**Failure rate** — target ≤2%. Failures logged with reason (KB query failure, missing estate data, timeout).

### Investigating overrides

When override rate exceeds 10%, analyze the written reasons:

| Pattern | Root cause |
|---|---|
| "POD/TOD confirmed after classification ran" | Data timing — asset data arriving late |
| "Trust confirmed by deed review" | Data completeness — titling not in EM at classification time |
| "SAUL applied wrong rule for joint tenancy" | KB T3 data or prompt issue |
| Specialists overriding inconsistently on same asset type | Specialist calibration gap |

### What feeds SAUL improvement

Every override with a written reason is a potential training signal. Monthly review of override reasons should produce one of:
- A KB v5 data update (wrong rule, outdated threshold, missing transfer mechanism)
- A SAUL prompt update (reasoning pattern that needs correction)
- A specialist training note (overrides driven by misunderstanding, not SAUL error)
- An Estate Manager data quality flag (overrides driven by missing or late data)

---

## Links

- Prototype: [link]
- Jira epic: [link]
- Feature reference doc: `feature_1_asset_classification.md`
- Next: Sub-Agent 2 spec — Validate Legal Administration Path
- Conditional: Sub-Agent 4 spec — Re-validate Asset Classification
