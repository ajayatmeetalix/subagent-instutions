# Sprint Status — Jurisdiction Intelligence

Tracks progress against the feature roadmap in `JURISDICTION_FEATURES.md`
(lives in the Alix repo at `estate-manager/docs/JURISDICTION_FEATURES.md`).

For demo walkthroughs of everything built so far, see `DEMO_GUIDE.md`.

---

## What's Done

### Sprint 1 — Research Tool ✅ Complete

The Probate Research Tool at `/probate-research` is fully shipped.

**All 14 component files built and wired:**
- `app/probate-research/page.tsx` — shell, URL state, filter memo
- `components/probate-research/ResearchFilters.tsx` — search + state + e-filing dropdowns
- `components/probate-research/StateCountyList.tsx` — expandable tree with e-filing icons
- `components/probate-research/CountyDetailPanel.tsx` — header with `lastUpdated` badge, all cards
- `components/probate-research/cards/` — all 11 card components

**`lib/jurisdictionUtils.ts` exports:**
`filterJurisdictions`, `findState`, `findCounty`, `formatProse`, `slugToDisplayName`,
`stateSlugToAbbr`, `cleanUrl`, `getPrimaryPhone`, `getPrimaryFax`, `urlToDisplayLabel`,
`camelToTitleCase`

**`formatProse()` applied to all scraped prose fields:**
- `OverviewCard` — renders `county.overview` as sentence-split `<p>` array
- `LocalRequirementsCard` — renders `county.localRequirements` as sentence-split `<p>` array

---

### Sprint 2 (partial) — Estate Dashboard Jurisdiction Link ✅ Complete

Jurisdiction data is wired into `app/page.tsx` (module level, before `DEADLINE_CATEGORIES`):
```typescript
const MOCK_ESTATE_STATE_SLUG = "california"
const MOCK_ESTATE_COUNTY_SLUG = "los-angeles-county"
const MOCK_ESTATE_CASE_NUMBER = "24STPB01882"
const MOCK_ESTATE_AUTHORITY_TYPE = "Probate — Independent Administration"
const estateJurisdictionState = findState(jurisdictionData, MOCK_ESTATE_STATE_SLUG)
const estateJurisdictionCounty = findCounty(jurisdictionData, MOCK_ESTATE_STATE_SLUG, MOCK_ESTATE_COUNTY_SLUG)
```

The Jobs Board header (below the Executor(s) line) shows two lines of estate context:

```
Los Angeles County, CA · View jurisdiction rules  →  /probate-research?state=california&county=los-angeles-county
Case 24STPB01882 · Probate — Independent Administration
```

Only the jurisdiction link is conditional (renders when both state + county resolve). The case/authority line is always visible.

The **Legal tab** was removed — it was a PROTO-badged form view with no demo value. The essential case info (case number, authority type) now lives as a single muted line in the Jobs Board header where it's always in context.

---

### Jobs Board Polish ✅ Complete

Done alongside Sprint 2:

- `JOBS_BOARD_TASKS` now covers all four kanban columns:
  - `w1` — "Publish Creditor Notice in Newspaper" (`in-progress`, `priority: "high"`)
  - `w2` — "Coordinate Probate Attorney Engagement" (`awaiting-review`, `priority: "medium"`)
- `t2` updated to `priority: "high"`
- **Priority badges** on task cards (red High, amber Medium)
- **Priority filter** wired — was previously dead UI
- **Estate status badges** — colored pills (green Active, blue Completed, red Churned)
- "Bunny 2Folger" set to `Completed` so all three statuses appear in the list

---

## What's Next

### Sprint 3 — Task Modal Layer

All three features add content inside the existing SAUL task detail modals.
The modal is opened by `openTaskModal(task.id)`. The modal component is defined
inline within the IIFE in `app/page.tsx`.

| Feature | Where | Data | Effort |
|---------|-------|------|--------|
| **#2** Jurisdiction reference panel | Right column of task detail modal, below assignee/reviewer | `state.quickReference`, `county.courthouse`, `county.estimatedTimelines`, `county.efilingRequired` | Low |
| **#6** Forms checklist | New "Required Forms" section in task modal | `county.forms[]` — `{ name, url, description }[]` | Low |
| **#4** Publication newspaper on filing step | Pre-populate the `w1` "Publish Creditor Notice" step description | `county.publicationNewspapers[]` | Very Low |

**#2 Jurisdiction Reference Panel** — target layout:
```
────────────────────────────────────
Jurisdiction
Los Angeles County · CA
  Small estate:      $184,500
  Filing deadline:   4 years from death
  Creditor period:   4 months from letters
  Simple timeline:   6–9 months
  (213) 974-5500  [copy]
  Mon–Fri 8am–4:30pm
  E-filing: Required  [portal →]
────────────────────────────────────
```
Data: `estateJurisdictionState` + `estateJurisdictionCounty` (already available at module level — do not re-import).

**#4** — The `w1` task description currently hardcodes "Los Angeles Daily Journal." Replace with dynamic lookup from `estateJurisdictionCounty?.publicationNewspapers` — render all entries if multiple. Use `formatProse` only if the field contains prose; `publicationNewspapers` is a clean `string[]`, so just join with `", "` or render as a list.

---

### Sprint 4 — Auto-generation (highest ROI)

| Feature | Where | Data | Effort |
|---------|-------|------|--------|
| **#1** Auto-generate job steps from `filingSteps` | Replaces hardcoded actions in `SAUL_PROBATE_PLAN_RESPONSE.plan.tracks[0]` (probate track) | `county.filingSteps[]` | Low |
| **#9** Executor duties onboarding job | New task auto-generated after probate plan approved | `state.executorDuties` | Low |

For **#1**: `county.filingSteps` is a `{ step: string, detail: string }[]` array that maps directly to job steps. Replace the hardcoded `p1`–`p9` action items in the probate track with steps built from `estateJurisdictionCounty?.filingSteps`. Keep the `status: "overdue"` flag on the first item (lodge will deadline) since that's hardcoded mock data.

---

### Sprint 5 — Intelligence Layer

| Feature | What | Effort |
|---------|------|--------|
| **#8** Statutory deadline chain | Compute petition deadline, creditor period close date, estimated close date from estate dates | Medium |
| **#10** Is probate required? pre-screener | Cross-reference asset types against `state.whenProbateRequired` | Medium |
| **#11** Deadline swimlane on jobs board | New board grouping: Overdue / This Week / This Month / Later | Medium |

---

## Mock Data Reference

### Estate in scope

All jurisdiction features target the **"Microsoft Zune"** estate (first in list, `highlight: true`).
State: California · County: Los Angeles County.

To change the target jurisdiction, update these two constants at the top of `app/page.tsx`:
```typescript
const MOCK_ESTATE_STATE_SLUG = "california"
const MOCK_ESTATE_COUNTY_SLUG = "los-angeles-county"
```

### SAUL mock data constants in `app/page.tsx`

| Constant | What it mocks |
|----------|--------------|
| `SAUL_CLASSIFICATION_RESPONSE` | Asset bucket classification (t2 modal) |
| `SAUL_LEGAL_PATH_RESPONSE` | Legal path + SEA threshold (t1 modal). `threshold_evaluation.SEA.countable_value = 485000` |
| `SAUL_PROBATE_PLAN_RESPONSE` | Full probate plan with tracks + actions (t3 modal) |

### `JOBS_BOARD_TASKS` visibility

Task visibility is controlled by `taskVisibility` state (initial: `{ t1: false, t3: false, t4: false }`).
Keys not present default to visible (`taskVisibility[t.id] !== false`).
Tasks `t1`, `t3`, `t4` become visible after SAUL processing completes on their prerequisite tasks.
Tasks `t2`, `w1`, `w2`, `c1`, `c2`, `c3` are always visible.

### Estate statuses

Valid values: `"Active"`, `"Completed"`, `"Churned"`.
Rendered as color-coded badge pills in the estate list table.
