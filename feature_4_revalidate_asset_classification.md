# Feature 4: Re-validate Asset Classification

**Slug:** `revalidate_asset_classification` | **Task ID:** `t4`
**Status:** ✅ Shipped
**Position in sequence:** Job 4 of 4 (conditional)

---

## What the Modal Does

Surfaces only when "↻ Refresh assets" is clicked inside the t2 modal while t2 is already in Completed status. SAUL runs automatically the moment the job becomes visible. The specialist reviews the single newly-identified asset, overrides if needed, and approves to update the classification record.

**Flow:**
1. "↻ Refresh assets" clicked on a completed t2 → `t4` appears in To Do with "Processing" badge, SAUL starts automatically
2. Specialist can click while processing → modal shows: *"SAUL is re-classifying the new asset..."*
3. When SAUL finishes → modal opens directly to REVIEW
4. REVIEW renders: single-row asset table showing Wells Fargo Checking Account with "New — needs review" badge
5. Specialist can override the bucket — requires a written reason
6. Clicks "Approve classification" → 2s success state → `t4` → Completed

---

## Processing and Error States

**Processing state** (card badge: amber "Processing")
- Modal shows: spinner + *"SAUL is re-classifying the new asset..."* + "This usually takes a few seconds. We'll update this card when it's ready to review."
- Footer: Cancel only

**Error state** (card badge: red "Error", 10% random failure rate for demo)
- Modal shows: *"Re-classification failed — could not process the new asset. Retry or contact support."*
- Footer: "Retry" button + Cancel

---

## Mock SAUL Response

Hardcoded as `SAUL_REVALIDATE_ASSET` in `app/page.tsx` (defined at file top, outside the component).

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

> Unlike the other three jobs, t4's SAUL response is a single static object — no `setData()` call needed. On SAUL success, `t4Ready` is set to `true` and the modal renders the hardcoded asset.

---

## REVIEW State Layout

Single-row asset table (same table structure as t2):
- Asset name + "New — needs review" amber badge
- Bucket dropdown (same `BUCKET_OPTIONS` / `BUCKET_CONFIG` as t2)
- Confidence dot + label

Override behavior identical to t2: changing bucket reveals a required reason input; reverting removes it.

Footer:
```
[1 asset classified]    [Approve classification →]
```
- Approve disabled if an override is selected without a reason

---

## State

```typescript
const [t4Ready, setT4Ready] = useState(false)       // set true when SAUL succeeds
const [t4Approved, setT4Approved] = useState(false)  // set true on approve click
// Reuses shared bucketOverrides / overrideReasons (reset by openTaskModal)
```

`startSaulForTask("t4")` sets `t4Ready = true` on success. The modal REVIEW condition is:
```typescript
!taskProcessing[task.id] && !taskError[task.id] && t4Ready && !t4Approved
```

---

## Job Sequencing

On approval:
```typescript
setTaskStatuses(prev => ({ ...prev, t4: "completed" }))
```

t4 has no downstream jobs. It is the terminal step in the sequence.

Previous job: `feature_1_asset_classification.md` (triggered by "↻ Refresh assets" on completed t2)
