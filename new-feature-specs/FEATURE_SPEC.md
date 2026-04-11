# Feature Spec: Probate Research Tool

## Purpose

A searchable, filterable reference panel for probate jurisdiction rules across all 50 US states
and ~3,100 counties. Care team members use this to look up court contact info, filing fees,
timelines, and e-filing requirements when opening a new estate — without leaving the app.

**Route:** `/probate-research`
**File:** `app/probate-research/page.tsx`
**Data source:** `swiftprobate_full.json` at repo root — static import, no API calls.

---

## Layout

Two-panel layout with a filter bar fixed at the top. On desktop (`md+`), panels sit
side-by-side and scroll independently. On mobile, they stack vertically.

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔍 Search states or counties…    [State ▼]    [E-Filing ▼]         │  ← ResearchFilters
├──────────────────────┬──────────────────────────────────────────────┤
│                      │                                              │
│  LEFT PANEL          │  RIGHT PANEL                                 │
│  StateCountyList     │  CountyDetailPanel                           │
│  (scrollable)        │  (scrollable)                                │
│                      │                                              │
│  ▸ Alabama  (67)     │  ┌────────────────────────────────────────┐  │
│  ▾ Alaska   (29)     │  │  Jefferson County                      │  │
│      Aleutians East  │  │  Alabama · AL                          │  │
│      Anchorage       │  │  View on SwiftProbate →     Updated …  │  │
│  ▸ Arizona  (15)     │  │  ────────────────────────────────────  │  │
│  ▸ Arkansas (75)     │  │  [ Quick Reference card ]              │  │
│  ...                 │  │  [ Overview card ]                     │  │
│                      │  │  [ Fees card ]                         │  │
│                      │  │  [ Estimated Timelines card ]          │  │
│                      │  │  [ Courthouse card ]                   │  │
│                      │  │  [ E-Filing section ]                  │  │
│                      │  │  [ Filing Steps card ]                 │  │
│                      │  │  [ Local Requirements card ]           │  │
│                      │  │  [ Forms card ]                        │  │
│                      │  │  [ FAQs card ]                         │  │
│                      │  │  [ Resources card ]                    │  │
│                      │  └────────────────────────────────────────┘  │
└──────────────────────┴──────────────────────────────────────────────┘
```

Use `react-resizable-panels` for the left/right split. Each panel uses `<ScrollArea>` from
`@radix-ui/react-scroll-area` for independent scrolling.

```tsx
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import * as ScrollArea from "@radix-ui/react-scroll-area"

<div className="flex flex-col h-screen bg-[#f8f7f5]">
  <ResearchFilters />
  <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
    <Panel defaultSize={25} minSize={20} maxSize={35}>
      <ScrollArea.Root className="h-full">
        <ScrollArea.Viewport className="h-full">
          <StateCountyList ... />
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" />
      </ScrollArea.Root>
    </Panel>
    <PanelResizeHandle className="w-px bg-[#e5e5e5] hover:bg-[#7c6fc4] transition-colors cursor-col-resize" />
    <Panel>
      <ScrollArea.Root className="h-full">
        <ScrollArea.Viewport className="h-full">
          <CountyDetailPanel ... />
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" />
      </ScrollArea.Root>
    </Panel>
  </PanelGroup>
</div>
```

---

## URL Query Parameters

All state lives in the URL. Use `useSearchParams` + `useRouter` from `next/navigation`.

| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `q` | string | Free-text search | `?q=harris` |
| `state` | string | Selected state slug | `?state=texas` |
| `county` | string | Selected county slug | `?county=harris-county` |
| `efiling` | enum | E-filing filter | `?efiling=required` |

**`efiling` enum values:** `required` \| `not-required` \| `unknown`

**Behaviour rules:**
- Selecting a state via dropdown: set `?state=`, clear `?county=`
- Clicking a county row: set `?county=` (and `?state=` if not already set)
- Changing the state dropdown while a county is selected: clear `?county=`, set new `?state=`
- Search (`?q=`) and e-filing filter operate independently of state/county selection

**Non-destructive param update pattern:**
```typescript
import { useSearchParams, useRouter } from "next/navigation"

const searchParams = useSearchParams()
const router = useRouter()

const setParam = (key: string, value: string) => {
  const params = new URLSearchParams(searchParams.toString())
  if (value) {
    params.set(key, value)
  } else {
    params.delete(key)
  }
  router.replace(`/probate-research?${params.toString()}`, { scroll: false })
}
```

---

## Filter Bar (`components/probate-research/ResearchFilters.tsx`)

```
<div className="flex items-center gap-3 px-4 py-3 border-b border-[#e5e5e5] bg-white">
  [Search input]  [State dropdown]  [E-Filing dropdown]
</div>
```

### Search Input
- `<Input>` from `@/components/ui/input` with `<Search size={16} />` icon prefix
- Placeholder: `"Search states or counties…"`
- Width: `w-80` on desktop, `w-full` on mobile
- Controlled from `searchParams.get("q") ?? ""`
- Update `?q=` on change — **debounce 200ms** using `lodash/debounce`

### State Dropdown
Use `@radix-ui/react-select`:
- Trigger label: "All States" (when nothing selected)
- First item value `""` → "All States"
- Remaining items: all 51 states sorted A–Z by `slugToDisplayName(state.slug)`
- Controlled from `searchParams.get("state") ?? ""`
- On change: set `?state=`, delete `?county=`

### E-Filing Dropdown
Use `@radix-ui/react-select`:
- Trigger label: "All E-Filing"
- Items:
  - `""` → "All E-Filing"
  - `"required"` → "E-Filing Required"
  - `"not-required"` → "E-Filing Not Required"
  - `"unknown"` → "E-Filing Unknown"
- Controlled from `searchParams.get("efiling") ?? ""`
- On change: set or delete `?efiling=`

---

## Left Panel: State + County List (`components/probate-research/StateCountyList.tsx`)

### Data flow
Receives `filteredData: JurisdictionState[]` (pre-filtered by `filterJurisdictions()`) and
current URL params as props. Contains zero filtering logic — rendering only.

### Expand/collapse state
Track expanded states in `useState<Set<string>>`. This is legitimate local UI state.
- On mount: expand the state matching `?state=` param if set
- When `?q=` is non-empty: expand all states (they all have matching counties after filtering)

### State rows
Use `@radix-ui/react-collapsible` for each state section:

```tsx
import * as Collapsible from "@radix-ui/react-collapsible"
import { ChevronRight, ChevronDown } from "lucide-react"

<Collapsible.Root open={isExpanded} onOpenChange={() => toggleState(state.slug)}>
  <Collapsible.Trigger asChild>
    <button
      className="flex items-center w-full px-3 py-2 text-sm hover:bg-[#f0f0f0] transition-colors text-left"
      onClick={() => setParam("state", state.slug)}
    >
      {isExpanded
        ? <ChevronDown size={14} className="mr-2 text-[#9b9b9b] shrink-0" />
        : <ChevronRight size={14} className="mr-2 text-[#9b9b9b] shrink-0" />
      }
      <span className="flex-1 font-medium text-[#1a1a2e]">
        {slugToDisplayName(state.slug)}
      </span>
      <span className="text-xs text-[#9b9b9b] ml-2">({state.counties.length})</span>
    </button>
  </Collapsible.Trigger>
  <Collapsible.Content>
    {/* county rows */}
  </Collapsible.Content>
</Collapsible.Root>
```

### County rows
```tsx
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"

<button
  key={county.slug}
  onClick={() => selectCounty(county)}
  className={cn(
    "flex items-center w-full pl-8 pr-3 py-1.5 text-sm transition-colors text-left",
    isSelected
      ? "bg-[#7c6fc4] text-white"
      : "text-[#3d3d3d] hover:bg-[#f0f0f0]"
  )}
>
  <span className="flex-1">{slugToDisplayName(county.slug)}</span>
  {county.efilingRequired === true && (
    <Zap size={12} className={cn("ml-1 shrink-0", isSelected ? "text-white" : "text-green-600")} />
  )}
</button>
```

### Empty state
```tsx
<div className="flex flex-col items-center justify-center py-16 text-[#9b9b9b]">
  <SearchX size={32} className="mb-3" />
  <p className="text-sm">No counties match your search</p>
</div>
```

---

## Right Panel: County Detail (`components/probate-research/CountyDetailPanel.tsx`)

### Placeholder (no county selected)
```tsx
<div className="flex flex-col items-center justify-center h-full text-[#9b9b9b]">
  <MapPin size={40} className="mb-4" />
  <p className="text-sm">Select a county to view probate details</p>
</div>
```

### Data lookup
```typescript
const state = findState(jurisdictionData, searchParams.get("state"))
const county = findCounty(jurisdictionData, searchParams.get("state"), searchParams.get("county"))
```
If `county` is undefined (stale URL param), show the placeholder.

### Header
```tsx
<div className="p-6 pb-4">
  <h2 className="text-xl font-semibold text-[#1a1a2e]">
    {slugToDisplayName(county.slug)}
  </h2>
  <p className="text-sm text-[#6b675f] mt-0.5">
    {slugToDisplayName(state.slug)} · {stateSlugToAbbr(state.slug)}
  </p>
  <a
    href={county.url}
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-[#7c6fc4] hover:underline inline-flex items-center gap-1 mt-1"
  >
    View on SwiftProbate <ExternalLink size={11} />
  </a>
  <hr className="border-[#e5e5e5] mt-4" />
</div>
```

### Header
Include `county.lastUpdated` as a subtle "Updated {date}" badge in the header row (top-right).

### Cards area
```tsx
<div className="px-6 pb-6 flex flex-col gap-4">
  {state.quickReference && <QuickReferenceCard state={state} />}
  {county.overview && <OverviewCard overview={county.overview} />}
  {(county.fees?.length ?? 0) > 0 && <FeesCard fees={county.fees!} />}
  {(county.estimatedTimelines?.length ?? 0) > 0 && <TimelinesCard timelines={county.estimatedTimelines!} />}
  <CourthouseCard county={county} />
  {/* E-Filing section — inline card */}
  {(county.efilingRequired !== null || !!county.efilingPortal) && <EfilingSection county={county} />}
  {(county.filingSteps?.length ?? 0) > 0 && <FilingStepsCard steps={county.filingSteps!} />}
  <LocalRequirementsCard
    localRequirements={county.localRequirements}
    paymentMethods={county.paymentMethods}
    publicationNewspaper={county.publicationNewspaper}
  />
  {(county.forms?.length ?? 0) > 0 && <FormsCard forms={county.forms!} />}
  {county.faqs.length > 0 && <FAQsCard faqs={county.faqs} />}
  {county.resources.length > 0 && <ResourcesCard resources={county.resources} />}
</div>
```

All cards use this base wrapper:
```tsx
<div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">
  {/* card content */}
</div>
```

---

## Card: Quick Reference (`components/probate-research/cards/QuickReferenceCard.tsx`)

**Data source:** `state.quickReference` — state-level, always present for all 51 states.

```
Quick Reference                              [State-wide badge]
──────────────────────────────────────────
Small Estate Threshold    $47,000
Filing Deadline           5 years from date of death
Creditor Claim Period     6 months from date letters are granted
```

```tsx
type Props = { state: JurisdictionState }

// Card header
<div className="flex items-center justify-between mb-3">
  <p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide">Quick Reference</p>
  <span className="text-xs border border-[#e5e5e5] rounded-full px-2 py-0.5 text-[#6b675f]">
    State-wide
  </span>
</div>

// Each row
<div className="flex justify-between items-start py-1.5">
  <span className="text-sm text-[#6b675f]">{label}</span>
  <span className="text-sm font-medium text-[#1a1a2e] text-right ml-4">{value}</span>
</div>
```

Rows: Small Estate Threshold, Filing Deadline, Creditor Claim Period.

Return `null` if `state.quickReference` is null.

---

## Card: Fees (`components/probate-research/cards/FeesCard.tsx`)

**Data source:** `county.fees` — `string[]` — each item is a bullet-style fee line,
e.g. `"Probate of Will / Letters Testamentary: approximately $175.00"`.

**Long value truncation:** Items longer than 120 characters get truncated with a
`"Show more"` toggle. Use `useState<Set<number>>` keyed on array index.

```tsx
type Props = { fees: string[] }

// Each fee entry
<div key={i} className="py-2 first:pt-0 last:pb-0">
  <p className="text-sm text-[#1a1a2e]">
    {isExpanded || value.length <= 120 ? value : `${value.slice(0, 120)}…`}
  </p>
  {value.length > 120 && (
    <button onClick={() => toggleExpand(i)} className="text-xs text-[#7c6fc4] hover:underline mt-0.5">
      {isExpanded ? "Show less" : "Show more"}
    </button>
  )}
</div>
// Separator between entries (not after last):
<hr className="border-[#f0f0f0]" />
```

Return `null` if `fees.length === 0`.

---

## Card: Timelines (`components/probate-research/cards/TimelinesCard.tsx`)

**Data source:** `county.estimatedTimelines` — `string[]` — each item is a timeline description,
e.g. `"Simple estates (no disputes, limited assets): 6-9 months"`.

```tsx
type Props = { timelines: string[] }

// Each timeline entry
<div key={i} className="py-2 first:pt-0 last:pb-0">
  <p className="text-sm text-[#1a1a2e]">{value}</p>
</div>
// Separator between entries
<hr className="border-[#f0f0f0]" />
```

Return `null` if `timelines.length === 0`.

---

## Card: Courthouse (`components/probate-research/cards/CourthouseCard.tsx`)

**Data source:** `county.courthouse` — `CountyCourthouse | null`

| Field | Display | Notes |
|-------|---------|-------|
| `courthouse.name` | Court name (bold) | Optional |
| `courthouse.address` | Address with MapPin icon | Optional |
| `courthouse.phone` | Phone with copy-to-clipboard | Via `getPrimaryPhone(county)` |
| `courthouse.fax` | Fax with Printer icon + copy | Via `getPrimaryFax(county)` |
| `courthouse.hours` | Hours with Clock icon | Strip `"Hours: "` prefix |
| `courthouse.parkingAndAccess` | Parking with ParkingCircle icon | Optional |

**Phone and fax rows** each have a copy-to-clipboard button (same `<Tooltip>` pattern).

**Hours:** Strip `"Hours: "` prefix: `hours.replace(/^Hours:\s*/i, "")`

Return `null` if none of name, address, phone, fax, hours, or parkingAndAccess is available.

---

## E-Filing Section (inline in `CountyDetailPanel.tsx`)

Rendered as a card (`border border-[#e5e5e5] rounded-lg p-4 bg-white`).

```tsx
import { Zap, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

const { efilingRequired, efilingPortal } = county
const portalUrl = cleanUrl(efilingPortal)

// Badge
const badge = efilingRequired === true
  ? <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
      <Zap size={10} /> E-Filing Required
    </span>
  : efilingRequired === false
  ? <span className="text-xs border border-[#e5e5e5] rounded-full px-2 py-0.5 text-[#6b675f]">
      E-Filing Not Required
    </span>
  : <span className="text-xs border border-[#e5e5e5] rounded-full px-2 py-0.5 text-[#9b9b9b]">
      E-Filing Status Unknown
    </span>

// Portal link (only when required + portal URL present)
{efilingRequired === true && portalUrl && (
  <a
    href={portalUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="ml-3 text-xs text-[#7c6fc4] hover:underline inline-flex items-center gap-1"
  >
    E-Filing Portal <ExternalLink size={11} />
  </a>
)}
```

Omit entire section if `efilingRequired === null && !efilingPortal`.

---

## Card: Overview (`components/probate-research/cards/OverviewCard.tsx`)

**Data source:** `county.overview` — `string | null`

Renders the county-level overview prose as a paragraph.

```tsx
type Props = { overview: string }
```

Return `null` if `!overview?.trim()`.

---

## Card: Filing Steps (`components/probate-research/cards/FilingStepsCard.tsx`)

**Data source:** `county.filingSteps` — `CountyFilingStep[]`

Renders a numbered list. Each item has a `step` (bold) and `detail` (muted caption).

```tsx
type Props = { steps: CountyFilingStep[] }

<ol className="flex flex-col gap-3">
  {steps.map((item, i) => (
    <li key={i} className="flex gap-3">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#f0f0f0] text-[#6b675f] text-xs font-semibold flex items-center justify-center mt-0.5">
        {i + 1}
      </span>
      <div>
        <p className="text-sm font-medium text-[#1a1a2e]">{item.step}</p>
        {item.detail && <p className="text-xs text-[#6b675f] mt-0.5 leading-relaxed">{item.detail}</p>}
      </div>
    </li>
  ))}
</ol>
```

Return `null` if `steps.length === 0`.

---

## Card: Forms (`components/probate-research/cards/FormsCard.tsx`)

**Data source:** `county.forms` — `CountyForm[]`

Renders each form as a linked name (if URL is valid after `cleanUrl()`) with a description caption.

```tsx
type Props = { forms: CountyForm[] }
```

- Form name links to `form.url` (via `cleanUrl()`) in a new tab, with `ExternalLink` icon
- If `cleanUrl()` returns `null`, render name as plain text (no link)
- `form.description` rendered as muted caption below the name

Return `null` if `forms.length === 0`.

---

## Card: FAQs (`components/probate-research/cards/FAQsCard.tsx`)

**Data source:** `county.faqs` — `CountyFaq[]`

Collapsible Q&A list using `@radix-ui/react-collapsible`.

```tsx
type Props = { faqs: CountyFaq[] }
```

- Each question is a `<Collapsible.Trigger>` button with `ChevronRight` / `ChevronDown`
- Answer shown in `<Collapsible.Content>`
- Use `useState<Set<number>>` to track which items are open
- Multiple items can be open simultaneously

Return `null` if `faqs.length === 0`.

---

## Card: Local Requirements (`components/probate-research/cards/LocalRequirementsCard.tsx`)

**Data sources:**
- `county.localRequirements` — `string | null` — local filing requirements prose
- `county.paymentMethods` — `string | null` — payment methods accepted (CreditCard icon)
- `county.publicationNewspaper` — `string | null` — required publication newspaper (Newspaper icon)

Return `null` if all three are null/empty.

---

## Card: Resources (`components/probate-research/cards/ResourcesCard.tsx`)

**Data source:** `county.resources` — `Array<{ label: string, url: string }>`

```tsx
import { ExternalLink } from "lucide-react"

<nav className="flex flex-col">
  {resources.map((resource) => (
    <a
      key={resource.url}
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between py-1.5 text-sm text-[#3d3d3d] hover:text-[#7c6fc4] transition-colors group"
    >
      <span>{resource.label}</span>
      <ExternalLink size={12} className="text-[#9b9b9b] group-hover:text-[#7c6fc4] shrink-0" />
    </a>
  ))}
</nav>
```

Return `null` if `county.resources.length === 0`.

---

## Reusable: `EfilingChip` (`components/probate-research/cards/EfilingChip.tsx`)

Used in county list rows (icon only) and in the detail panel (full badge).

```typescript
type EfilingChipProps = {
  efilingRequired: boolean | null
  variant?: "icon-only" | "full"  // default: "full"
}
```

- `"icon-only"`: `<Zap size={12} className="text-green-600" />` if `true`, otherwise `null`
- `"full"`: full badge as described in the E-Filing section above

---

## Page Shell (`app/probate-research/page.tsx`)

```tsx
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useMemo } from "react"
import rawData from "../../swiftprobate_full.json"
import type { JurisdictionState } from "@/types/jurisdiction"
import { filterJurisdictions, findState, findCounty } from "@/lib/jurisdictionUtils"
import { ResearchFilters } from "@/components/probate-research/ResearchFilters"
import { StateCountyList } from "@/components/probate-research/StateCountyList"
import { CountyDetailPanel } from "@/components/probate-research/CountyDetailPanel"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

const jurisdictionData = rawData as JurisdictionState[]

export default function ProbateResearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const q = searchParams.get("q") ?? ""
  const stateSlug = searchParams.get("state") ?? ""
  const countySlug = searchParams.get("county") ?? ""
  const efilingFilter = searchParams.get("efiling") as "required" | "not-required" | "unknown" | null

  const filteredData = useMemo(
    () => filterJurisdictions(jurisdictionData, { query: q, stateSlug: stateSlug || null, efilingFilter }),
    [q, stateSlug, efilingFilter]
  )

  const selectedState = findState(jurisdictionData, stateSlug || null)
  const selectedCounty = findCounty(jurisdictionData, stateSlug || null, countySlug || null)

  // setParam helper — pass down to children
  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.replace(`/probate-research?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8f7f5]">
      <ResearchFilters
        jurisdictionData={jurisdictionData}
        searchParams={searchParams}
        setParam={setParam}
      />
      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <Panel defaultSize={25} minSize={20} maxSize={35} className="border-r border-[#e5e5e5]">
          <StateCountyList
            filteredData={filteredData}
            selectedStateSlug={stateSlug}
            selectedCountySlug={countySlug}
            hasActiveSearch={q.length > 0}
            setParam={setParam}
          />
        </Panel>
        <PanelResizeHandle className="w-px bg-[#e5e5e5] hover:bg-[#7c6fc4] transition-colors cursor-col-resize" />
        <Panel>
          <CountyDetailPanel
            jurisdictionData={jurisdictionData}
            selectedState={selectedState}
            selectedCounty={selectedCounty}
          />
        </Panel>
      </PanelGroup>
    </div>
  )
}
```

The page shell's only job is wiring: reading URL state, running the filter memo, passing props down. No rendering logic here.

---

## Build Order

Follow this sequence strictly — each step depends on the previous.

1. **Types** — `types/jurisdiction.ts` — all types from `docs/DATA_SCHEMA.md`
2. **Utils** — `lib/jurisdictionUtils.ts` — all helper functions; think through logic before writing
3. **Route stub** — `app/probate-research/page.tsx` — minimal shell that renders "Probate Research" to confirm routing works
4. **Filter bar** — `ResearchFilters.tsx` — verify URL params update correctly in browser
5. **Left panel** — `StateCountyList.tsx` — accordion expand/collapse, county selection, search highlighting
6. **Detail cards** — build and test each card independently with a hardcoded county object before wiring to real data:
   - `QuickReferenceCard`, `OverviewCard`
   - `FeesCard`, `TimelinesCard`
   - `CourthouseCard`
   - `EfilingChip`
   - `FilingStepsCard`, `LocalRequirementsCard`, `FormsCard`, `FAQsCard`
   - `ResourcesCard`
7. **Right panel** — `CountyDetailPanel.tsx` — compose cards, wire to URL params
8. **Page shell** — wire everything together in `page.tsx`, verify URL state round-trips on page reload
