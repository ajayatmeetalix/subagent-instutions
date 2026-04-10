# Feature Spec - Verify Case Details

**Title:** `Verify Case Details`  
**Slug:** `verify_case_details`  
**Task ID:** `k1`  
**Position:** Single close-stage legal job

---

## Modal Flow

1. Job appears in To Do with "Processing" badge.
2. SAUL auto-runs after 1 second.
3. If opened while running, modal shows processing state.
4. On success, modal opens to REVIEW state.
5. Specialist verifies each KB-mapped section, correcting when needed.
6. Corrections require a reason.
7. Specialist clicks "Approve and stage".
8. Success state shows for 2 seconds, modal closes, job moves to Completed.

---

## States

### PROCESSING
- Card remains clickable.
- Copy: "SAUL is preparing case details for verification..."
- Footer: Cancel only.

### ERROR
- 10% random failure for demo.
- Copy: "Case detail preparation failed - required estate history records could not be retrieved."
- Footer: Retry + Cancel.

### REVIEW
Render these sections:
- T5 form sequence (forms used, order, deviations)
- T6 court logistics (county-level logistics)
- T8 pathway used + actual duration
- T9 deadline observations
- T1/T2/T3/T4/T7 observations (specialist-confirmed notes)

### APPROVED
- Success copy: "Case details staged for legal review."
- Auto-close modal after 2 seconds.

---

## Validation Rules

- Field statuses: Confirmed, Corrected, Unknown.
- Unknown is allowed only for T6 and observational sections.
- Any corrected field requires non-empty reason text.
- Approve button disabled if:
  - any corrected field has no reason, or
  - required core sections (T5, T8, T9) are unresolved.

---

## Output Rule (Critical)

Approval writes one in-memory staging payload only.

- `data_status` must be `UNVERIFIED`
- include `estate_id`, `jurisdiction`, `captured_by`, `captured_at`
- include table rows for KB-mapped sections

Do not write to production KB context.
