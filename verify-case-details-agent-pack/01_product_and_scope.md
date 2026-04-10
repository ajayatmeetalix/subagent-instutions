# Verify Case Details - Product + Scope

## Objective
Build a single Estate Manager legal job where a settlement specialist verifies case-derived data that maps to KB tables at estate close.

## Job Name
- UI title: `Verify Case Details`
- Internal slug: `verify_case_details`
- Task ID: `k1`

## Why this exists
- Knowledge from completed estates is not captured in structured form.
- The job should convert normal close-work into reusable KB contributions.
- Specialist remains in the loop; nothing is auto-published to production KB.

## Where it runs
- Trigger when estate enters `CLOSING`.
- Only one job in this prototype (no asset classification, legal path, or plan generation jobs).

## Hard constraints
- No backend.
- No real API calls.
- Mock data constants only.
- Single-page prototype is fine.
- Use specialist approval modal pattern.

## Non-goals
- No KB promotion workflow.
- No attorney review UI.
- No production KB write.
- No statute citation authoring by specialists.
