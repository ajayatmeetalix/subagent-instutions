---
name: Research Tool + Dashboard Alerts
overview: Fix the two real spec update gaps in the research tool (missing `formatProse()`), then add three jurisdiction-aware alert cards to the estate jobs board — uniqueStateRules, localRequirements, and small estate detector.
todos:
  - id: formatprose-util
    content: Add formatProse() to lib/jurisdictionUtils.ts
    status: completed
  - id: formatprose-overview
    content: Apply formatProse() in OverviewCard.tsx — render as paragraph array
    status: completed
  - id: formatprose-localreq
    content: Apply formatProse() in LocalRequirementsCard.tsx on localRequirements field
    status: completed
  - id: wire-jurisdiction
    content: Import swiftprobate_full.json + findState/findCounty into app/page.tsx with mock CA + LA County slugs
    status: completed
  - id: alert-uniquestaterules
    content: "Add #7 uniqueStateRules dismissible alert banner before kanban in app/page.tsx"
    status: completed
  - id: alert-localrequirements
    content: "Add #3 localRequirements amber ⚠️ alert card before kanban in app/page.tsx"
    status: completed
  - id: alert-smallestate
    content: "Add #5 small estate detector banner — compare estate value vs state.smallEstateThreshold"
    status: completed
isProject: false
---

# Research Tool Spec Updates + Estate Dashboard Alerts

## Current state

The research tool is mostly complete. The only real gap is `formatProse()`:

- `lastUpdated` badge — already implemented in [`CountyDetailPanel.tsx`](components/probate-research/CountyDetailPanel.tsx) ✅
- `paymentMethods` — already in [`LocalRequirementsCard.tsx`](components/probate-research/cards/LocalRequirementsCard.tsx) ✅
- `filingSteps`, `forms`, `faqs` cards — all exist and are wired ✅
- `formatProse()` — **not in `lib/jurisdictionUtils.ts`**, not called in `OverviewCard` or `LocalRequirementsCard` ❌

The estate jobs board ([`app/page.tsx`](app/page.tsx)) has no jurisdiction data wired yet. The mock estate (Microsoft Zune) is implicitly California + Los Angeles County based on the mock SAUL responses, but no `stateSlug`/`countySlug` are attached.

---

## Part 1 — Research Tool: add `formatProse()`

### 1a. Add to `lib/jurisdictionUtils.ts`

```typescript
/**
 * Normalize scraped prose where sentences are concatenated without spaces.
 * "death.Alabama" → "death. Alabama"
 * Returns an array of sentence-level paragraph strings.
 */
export function formatProse(text: string): string[] {
  if (!text?.trim()) return []
  const normalized = text
    .replace(/([.!?])([A-Z])/g, '$1 $2')
    .trim()
  const sentences = normalized.match(/[^.!?]*[.!?]+/g) ?? [normalized]
  return sentences.map(s => s.trim()).filter(s => s.length > 0)
}
```

### 1b. Apply in `OverviewCard.tsx`

Currently renders `{overview}` as a raw string. Change to:

```tsx
import { formatProse } from "@/lib/jurisdictionUtils"

const paragraphs = formatProse(overview)
if (paragraphs.length === 0) return null

// render:
<div className="flex flex-col gap-2">
  {paragraphs.map((p, i) => (
    <p key={i} className="text-sm text-[#3d3d3d] leading-relaxed">{p}</p>
  ))}
</div>
```

### 1c. Apply in `LocalRequirementsCard.tsx`

`localRequirements` is the same scraped-prose field. Pass it through `formatProse()` and render as a paragraph list, same pattern as `OverviewCard`.

---

## Part 2 — Estate Dashboard Alerts

### 2a. Wire jurisdiction data into `app/page.tsx`

Add two module-level constants (outside the component, runs once at parse time):

```typescript
import rawJurisdictionData from "../swiftprobate_full.json"
import type { JurisdictionState } from "@/types/jurisdiction"
import { findState, findCounty, formatProse } from "@/lib/jurisdictionUtils"

const jurisdictionData = rawJurisdictionData as JurisdictionState[]

// Mock estate is California · Los Angeles County based on SAUL mock data
const MOCK_ESTATE_STATE_SLUG = "california"
const MOCK_ESTATE_COUNTY_SLUG = "los-angeles-county"

const estateJurisdictionState = findState(jurisdictionData, MOCK_ESTATE_STATE_SLUG)
const estateJurisdictionCounty = findCounty(jurisdictionData, MOCK_ESTATE_STATE_SLUG, MOCK_ESTATE_COUNTY_SLUG)
```

These are read-only lookups against the static JSON, no render cost.

### 2b. Add dismissed-alert state inside the component

```typescript
const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
const dismissAlert = (key: string) =>
  setDismissedAlerts(prev => new Set(prev).add(key))
```

### 2c. Insert the three alert blocks

Place just before the Kanban columns, inside the `<div className="flex-1 overflow-auto p-5">` (currently line ~3246):

```
┌─ Jobs Board Header (estate name, executors) ─────────────────┐
│                                                               │
├─ Toolbar (search, priority, create task) ─────────────────────┤
│                                                               │
├─ Scrollable content area (p-5) ───────────────────────────────┤
│                                                               │
│  [#7] UniqueStateRules alert   ← dismissible, purple/blue    │
│  [#3] LocalRequirements alert  ← ⚠️ amber, not dismissible   │
│  [#5] SmallEstate banner       ← green, shown if eligible    │
│                                                               │
│  ──── Kanban columns ────                                     │
```

#### Alert #7 — `uniqueStateRules` (dismissible)

```tsx
{estateJurisdictionState?.uniqueStateRules &&
 !dismissedAlerts.has("uniqueStateRules") && (
  <div className="mb-4 flex items-start gap-3 bg-[#f4f2ff] border border-[#c4bef0] rounded-lg px-4 py-3">
    <Map size={15} className="text-[#7c6fc4] shrink-0 mt-0.5" />
    <p className="text-sm text-[#3d3d3d] flex-1">
      <span className="font-medium text-[#5a4fa0]">California: </span>
      {estateJurisdictionState.uniqueStateRules}
    </p>
    <button onClick={() => dismissAlert("uniqueStateRules")}>
      <X size={14} className="text-[#9b9b9b] hover:text-[#3d3d3d]" />
    </button>
  </div>
)}
```

#### Alert #3 — `localRequirements` (persistent ⚠️)

```tsx
{estateJurisdictionCounty?.localRequirements && (
  <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
    <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
    <div>
      <p className="text-xs font-semibold text-amber-700 mb-1">
        Local Requirements · Los Angeles County
      </p>
      {formatProse(estateJurisdictionCounty.localRequirements).map((p, i) => (
        <p key={i} className="text-sm text-[#3d3d3d] leading-relaxed">{p}</p>
      ))}
    </div>
  </div>
)}
```

(Use `slugToDisplayName(MOCK_ESTATE_COUNTY_SLUG)` instead of hardcoding "Los Angeles County".)

#### Alert #5 — Small estate detector

Compare `SAUL_LEGAL_PATH_RESPONSE.threshold_evaluation.SEA.countable_value` against `estateJurisdictionState?.smallEstateThreshold` (numeric field on the state).

```tsx
{estateJurisdictionState?.smallEstateThreshold !== null &&
 estateJurisdictionState?.smallEstateOptions &&
 SAUL_LEGAL_PATH_RESPONSE.threshold_evaluation.SEA.countable_value <
   (estateJurisdictionState?.smallEstateThreshold ?? Infinity) && (
  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
    <p className="text-sm font-medium text-green-800">
      ✦ This estate (${...toLocaleString()}) is below California's
      {estateJurisdictionState.quickReference?.smallEstateThreshold} small estate threshold.
    </p>
    <p className="text-sm text-green-700 mt-1">
      {estateJurisdictionState.smallEstateOptions}
    </p>
  </div>
)}
```

**Note on demo visibility:** The mock estate value is $485,000 — above CA's threshold — so this alert will be hidden by default. To demo it, temporarily set `SEA.countable_value` to `44200` in `SAUL_LEGAL_PATH_RESPONSE`.

---

## File change summary

| File | Change |
|------|--------|
| [`lib/jurisdictionUtils.ts`](lib/jurisdictionUtils.ts) | Add `formatProse()` |
| [`components/probate-research/cards/OverviewCard.tsx`](components/probate-research/cards/OverviewCard.tsx) | Use `formatProse()`, render as `<p>` array |
| [`components/probate-research/cards/LocalRequirementsCard.tsx`](components/probate-research/cards/LocalRequirementsCard.tsx) | Use `formatProse()` on `localRequirements` |
| [`app/page.tsx`](app/page.tsx) | Import JSON + utils, add `dismissedAlerts` state, insert 3 alert blocks before kanban |
