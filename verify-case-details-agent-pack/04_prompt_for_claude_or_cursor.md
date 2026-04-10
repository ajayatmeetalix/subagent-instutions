# Prompt for Claude or Cursor

Implement a prototype for one Estate Manager job: **Verify Case Details**.

Read these files first and follow them strictly:
- `01_product_and_scope.md`
- `02_feature_spec_verify_case_details.md`
- `03_mock_data_contracts.md`

## Build requirements
- Build only one job card: `verify_case_details` (`k1`).
- Use modal states: Processing, Error, Review, Approved.
- Auto-run SAUL when the job becomes visible.
- Use mocked constants only (no real API calls).
- Specialist reviews KB-mapped sections and can confirm/correct/mark unknown.
- Corrected fields must require a reason.
- On approval, write a staging payload to local state with `data_status = UNVERIFIED`.
- Mark the job completed after success state.

## UI copy requirements
- Job title: "Verify Case Details"
- Processing text: "SAUL is preparing case details for verification..."
- Approval CTA: "Approve and stage"
- Success text: "Case details staged for legal review."

## Out of scope
- No production KB write
- No legal citation workflow
- No additional legal jobs (asset classification/path/plan)

## Return after implementation
1. What you built
2. Key assumptions
3. Manual test plan
