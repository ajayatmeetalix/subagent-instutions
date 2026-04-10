# Repo Pruning Instructions (When Copying This Repo)

Use this file if you copy the current repository as the starter and want to keep the Estate Manager design while removing old legal sub-agent flows.

## Goal
Preserve layout and design system, but remove the existing legal sequence:
- Validate Asset Classification (`t2`)
- Validate Legal Administration Path (`t1`)
- Validate Probate Plan (`t3`)
- Re-validate Asset Classification (`t4`)

Replace with one job:
- Verify Case Details (`k1`, slug `verify_case_details`)

---

## Keep As-Is

- Overall page shell and sidebar/nav layout.
- Jobs board layout and card visual style.
- Modal shell pattern and typography treatment.
- Tailwind color palette and spacing rhythm already used in UI.
- Generic processing/error/success interaction pattern.

---

## Remove or Replace in `app/page.tsx`

### 1) Task definitions
In `JOBS_BOARD_TASKS`, remove old legal tasks with ids/slugs:
- `t1` / `validate_legal_administration_path`
- `t2` / `validate_asset_classification`
- `t3` / `validate_probate_plan`
- `t4` / `revalidate_asset_classification`

Add one task:
- `k1` / `verify_case_details`

---

### 2) Mock response constants
Delete old constants:
- `SAUL_CLASSIFICATION_RESPONSE`
- `SAUL_LEGAL_PATH_RESPONSE`
- `SAUL_PROBATE_PLAN_RESPONSE`
- `SAUL_REVALIDATE_ASSET`
- bucket/legal-path configs only if no longer needed by the new UI

Add:
- `SAUL_VERIFY_CASE_DETAILS_RESPONSE` (see `03_mock_data_contracts.md`)

---

### 3) State variables
Remove old task-specific state:
- classification state (`classificationData`, `classificationApproved`, `bucketOverrides`, `overrideReasons`, `refreshingAssets`, `newClassifiedAssets`)
- legal path state (`legalPathData`, `legalPathApproved`, `legalPathOverride`, `legalPathOverrideReason`)
- probate plan state (`probatePlanData`, `probatePlanApproved`, `naActions`, `naReasons`)
- revalidation state (`t4Ready`, `t4Approved`)
- old visibility defaults tied to `t1/t3/t4`

Keep/repurpose:
- `taskProcessing`
- `taskError`
- `taskStatuses`
- modal open/close state

Add new state for:
- verify sections and field statuses
- correction reasons
- staged payload entries
- `k1` approval state

---

### 4) SAUL run orchestration
In `startSaulForTask(taskId)`:
- Remove all `if (taskId === "t2"/"t1"/"t3"/"t4")` branches.
- Add only `if (taskId === "k1")` branch to load verify-case-details data.

In mount `useEffect`:
- Replace auto-start of `t2` with auto-start for `k1`.

---

### 5) Approval handlers and sequencing
Delete old handlers:
- `handleApproveClassification`
- `handleApproveLegalPath`
- `handleApproveProbatePlan`
- `handleApproveT4`
- `handleRefreshAssets`

Add one handler:
- `handleApproveVerifyCaseDetails`
  - validates reasons and required sections
  - writes `UNVERIFIED` staging payload to local state
  - sets `k1` to completed
  - closes modal after success delay

No next-job sequencing for this prototype.

---

### 6) Modal content branches
Inside task modal body, remove slug branches for:
- `validate_asset_classification`
- `validate_legal_administration_path`
- `validate_probate_plan`
- `revalidate_asset_classification`

Replace with one branch:
- `verify_case_details`
  - processing UI
  - error UI
  - review sections (T5, T6, T8, T9, T1/T2/T3/T4/T7 observations)
  - approved/success UI

---

### 7) Footer button logic
Remove old per-task footer conditions.
Implement one set for `k1`:
- Processing: Cancel only
- Error: Retry + Cancel
- Review: Approve and stage (disabled until valid) + Cancel
- Approved: no CTA / passive close

---

## Search-and-clean checklist (quick grep terms)

Search and eliminate references to:
- `validate_asset_classification`
- `validate_legal_administration_path`
- `validate_probate_plan`
- `revalidate_asset_classification`
- `t1`, `t2`, `t3`, `t4` (legal flow references)
- `classificationData`
- `legalPathData`
- `probatePlanData`
- `t4Ready`
- `handleRefreshAssets`

Then verify only `k1` + `verify_case_details` remain for legal workflow.

---

## Done Criteria

- Jobs board shows one prototype legal job: Verify Case Details.
- Modal supports processing, error, review, approved states.
- Corrections require reasons.
- Approval writes one staging payload with `data_status = UNVERIFIED`.
- No old legal sequence logic remains.
