# CLAUDE.md — Estate Manager Prototype

This is a prototype. There is no full backend.

---

## Codebase at a Glance

| | |
|---|---|
| **Framework** | Next.js 16 (App Router), `app/` directory, server + client components |
| **Styling** | Tailwind CSS v4, hardcoded hex colors throughout (see palette below) |
| **UI Library** | shadcn/ui — `Button` (`components/ui/button.tsx`) and `Input` (`components/ui/input.tsx`) |
| **Icons** | Lucide React |
| **State** | React `useState` + URL params (`useSearchParams` / `useRouter` from `next/navigation`) |
| **Dev server** | `npx next dev` |

**Color palette:**
- Dark: `#1a1a2e`, `#3d3d3d`, `#2d2d4e`
- Muted text: `#6b675f`, `#9b9b9b`
- Borders: `#e5e5e5`, `#d0d0d0`, `#f0f0f0`
- Light bg: `#f8f7f5`, `#fafafa`
- Accent purple: `#7c6fc4`, `#5a4fa0`

---

## Key Files

| File | What it contains |
|---|---|
| `app/page.tsx` | Estate Manager jobs board — all components, state, modals, mock data, jurisdiction deep-link |
| `app/probate-research/page.tsx` | Probate Research Tool page shell |
| `components/ui/button.tsx` | shadcn Button with CVA variants |
| `components/ui/input.tsx` | shadcn Input |
| `components/probate-research/` | All Probate Research Tool components (fully built) |
| `lib/jurisdictionUtils.ts` | Pure helper functions: `filterJurisdictions`, `findState`, `findCounty`, `formatProse`, `slugToDisplayName`, `stateSlugToAbbr`, `cleanUrl`, `getPrimaryPhone`, `getPrimaryFax`, `urlToDisplayLabel`, `camelToTitleCase` |
| `types/jurisdiction.ts` | TypeScript types for `swiftprobate_full.json` |
| `swiftprobate_full.json` | Probate jurisdiction data — 51 states, ~3,100 counties (static import only) — ~32 MB |
| `new-feature-specs/SPRINT_STATUS.md` | Current build progress, next sprint items, mock data guide |

---

## Pages

### Estate Manager Jobs Board (`/`) — Active

Lives entirely in `app/page.tsx`. A SAUL-powered jobs board prototype where care team specialists validate AI output across a sequence of legal tasks (asset classification → legal path → probate plan). All data is mocked via constants.

**Jurisdiction data is wired** at module level at the top of `app/page.tsx`:
```typescript
const MOCK_ESTATE_STATE_SLUG = "california"
const MOCK_ESTATE_COUNTY_SLUG = "los-angeles-county"
const MOCK_ESTATE_CASE_NUMBER = "24STPB01882"
const MOCK_ESTATE_AUTHORITY_TYPE = "Probate — Independent Administration"
const estateJurisdictionState = findState(jurisdictionData, MOCK_ESTATE_STATE_SLUG)
const estateJurisdictionCounty = findCounty(jurisdictionData, MOCK_ESTATE_STATE_SLUG, MOCK_ESTATE_COUNTY_SLUG)
```

**Jobs Board header** (below the Executor(s) line) shows two lines of estate context:
- Small purple link: **"{County Name}, {State Abbr} · View jurisdiction rules"** — links directly to `/probate-research?state={stateSlug}&county={countySlug}`. Renders only when `estateJurisdictionState` and `estateJurisdictionCounty` are both resolved.
- Muted line: **"Case {MOCK_ESTATE_CASE_NUMBER} · {MOCK_ESTATE_AUTHORITY_TYPE}"** — always visible, case number in `font-mono`

**`JOBS_BOARD_TASKS`** mock data (9 tasks total):

| ID | Title | Status | Priority | Visible by default |
|----|-------|--------|----------|--------------------|
| `t1` | Validate Legal Administration Path | todo | — | No (hidden via `taskVisibility`) |
| `t2` | Validate Asset Classification | todo | high | Yes |
| `t3` | Validate Probate Plan | todo | — | No |
| `t4` | Re-validate Asset Classification | todo | — | No |
| `w1` | Publish Creditor Notice in Newspaper | in-progress | high | Yes |
| `w2` | Coordinate Probate Attorney Engagement | awaiting-review | medium | Yes |
| `c1` | New Settlement Created - Please review | completed | — | Yes |
| `c2` | Notify the VA of the Decedent's Passing | completed | — | Yes |
| `c3` | Define plan for probate lawyer engagement | completed | — | Yes |

Task cards show priority badges (red High, amber Medium). The priority filter dropdown is wired.
Task visibility for `t1`/`t3`/`t4` is controlled by `taskVisibility` state — they become visible after SAUL processing completes.

**Estate list** — 11 estates with three status values:
- Active (green badge) — most estates
- Completed (blue badge) — Bunny 2Folger
- Churned (red badge) — Luke Skywalker

### Probate Research Tool (`/probate-research`) — Shipped

A searchable, filterable reference panel for probate jurisdiction rules across all 50 US states and ~3,100 counties. Fully built. Care team members use this to look up court contact info, filing fees, timelines, and e-filing requirements when opening a new estate.

**Route:** `/probate-research`
**Data source:** `swiftprobate_full.json` — static import, no API calls

#### File structure

```
app/probate-research/page.tsx          ← page shell + URL state wiring
components/probate-research/
  StateCountyList.tsx                  ← left panel: expandable state/county tree
  CountyDetailPanel.tsx                ← right panel: all detail cards
  ResearchFilters.tsx                  ← top filter bar (search + dropdowns)
  cards/
    CourthouseCard.tsx
    FeesCard.tsx
    TimelinesCard.tsx
    QuickReferenceCard.tsx
    OverviewCard.tsx
    FilingStepsCard.tsx
    FormsCard.tsx
    FAQsCard.tsx
    LocalRequirementsCard.tsx
    ResourcesCard.tsx
    EfilingChip.tsx
lib/jurisdictionUtils.ts               ← pure helpers (no React, no hooks)
types/jurisdiction.ts                  ← all TypeScript types for the JSON data
```

#### URL params

| Param | Description |
|---|---|
| `q` | Free-text search |
| `state` | Selected state slug |
| `county` | Selected county slug |
| `efiling` | E-filing filter (`required` \| `not-required` \| `unknown`) |

#### Core principles

1. **URL-driven state.** Filters and selection live in URL query params — shareable and reloadable.
2. **Tailwind only.** No inline `style` objects, no CSS modules.
3. **TypeScript strict.** No `any`. All types in `types/jurisdiction.ts`.
4. **Defensive rendering.** The JSON has scraped noise and missing fields. Use `?.` everywhere.
5. **No mutations, no network calls.** Read-only tool. Static JSON import only.
6. **Prose formatting.** Long text fields (`county.overview`, `county.localRequirements`, etc.) have sentences concatenated without spaces due to scraping. Always run them through `formatProse()` from `lib/jurisdictionUtils.ts` before rendering — it normalizes spacing and returns an array of paragraph strings.

---

## `lib/jurisdictionUtils.ts` — Function Reference

All pure functions, no React, no hooks. Import from `@/lib/jurisdictionUtils`.

| Function | Signature | Purpose |
|----------|-----------|---------|
| `formatProse` | `(text: string) => string[]` | Fix scraped prose (`"death.Alabama"` → `"death. Alabama"`), split into sentence paragraphs |
| `filterJurisdictions` | `(data, options) => JurisdictionState[]` | Filter by query, state slug, e-filing status |
| `findState` | `(data, stateSlug) => JurisdictionState \| undefined` | Look up state by slug |
| `findCounty` | `(data, stateSlug, countySlug) => JurisdictionCounty \| undefined` | Look up county by state + county slugs |
| `slugToDisplayName` | `(slug: string) => string` | `"harris-county"` → `"Harris County"` |
| `stateSlugToAbbr` | `(slug: string) => string \| null` | `"california"` → `"CA"` |
| `cleanUrl` | `(raw) => string \| null` | Strip trailing scraped punctuation from URLs |
| `getPrimaryPhone` | `(county) => string \| null` | `county.courthouse?.phone` |
| `getPrimaryFax` | `(county) => string \| null` | `county.courthouse?.fax` |

---

## Prototype Conventions

- No real API calls, no real auth, no real state persistence
- All state in components via `useState` or URL params
- Tailwind v4 utility classes — hardcoded hex values for exact color fidelity
- See `new-feature-specs/SPRINT_STATUS.md` for what's been built and what's next

