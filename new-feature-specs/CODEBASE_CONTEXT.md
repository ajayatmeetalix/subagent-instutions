# Codebase Context — Probate Research Tool + Estate Dashboard

This file overrides any conflicting instructions in `CLAUDE.md`.
Read this file alongside `CLAUDE.md` and `FEATURE_SPEC.md`. Where instructions conflict,
this file wins.

**Current status:** The Probate Research Tool is fully shipped. Active work is on the
Estate Jobs Board (`app/page.tsx`) — jurisdiction data from `swiftprobate_full.json` is
being layered into the existing SAUL features. See `SPRINT_STATUS.md` for what's done
and what's next.

---

## What This Repo Actually Is

This is a **Next.js 16 App Router** prototype, not a Vite + React Admin app.

- No `src/` directory — files live under `app/`, `components/`, `lib/`
- No `src/Routes.tsx` — routing is the Next.js filesystem
- No MUI — styling is Tailwind CSS v4 + Radix UI primitives
- No hash router — URLs are plain paths (e.g. `/probate-research`)
- No `react-admin`, no `Authenticated` wrapper, no `CustomRoutes`
- Everything is already installed. Do not `npm install` anything.

---

## Actual Tech Stack

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | 16 (App Router) | `app/` directory, server + client components |
| React | 19 | |
| TypeScript | 5 | Strict mode. No `any`. |
| Tailwind CSS | **v4** | Utility classes only. No `sx` prop. No CSS modules. |
| Radix UI | Full suite | All primitives already installed (see below) |
| Lucide React | 0.454 | Icons — use instead of MUI icons |
| date-fns | 4 | Date formatting |
| react-resizable-panels | 2 | Powers the two-panel layout in `/probate-research` |
| clsx + tailwind-merge | — | Available via `cn()` in `lib/utils.ts` |

**Radix UI primitives already installed (relevant ones):**
- `@radix-ui/react-collapsible` — expandable state/county tree in left panel
- `@radix-ui/react-select` — State and E-Filing dropdowns
- `@radix-ui/react-scroll-area` — independently scrollable panels
- `@radix-ui/react-separator` — dividers
- `@radix-ui/react-tooltip` — "Copied!" phone copy feedback

---

## File Structure

```
app/
  page.tsx                             ← Estate Jobs Board (all state, modals, mock data)
  probate-research/
    page.tsx                           ← Research Tool page shell + URL state wiring
components/
  probate-research/
    StateCountyList.tsx
    CountyDetailPanel.tsx
    ResearchFilters.tsx
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
lib/
  jurisdictionUtils.ts                 ← pure helpers — formatProse, filterJurisdictions, findState, findCounty, etc.
  utils.ts                             ← cn() utility
types/
  jurisdiction.ts                      ← all TypeScript types for swiftprobate_full.json
swiftprobate_full.json                 ← repo root, ~32 MB, static import only
```

All types live in `types/jurisdiction.ts`. Import from there — do not inline types in components.

---

## Jurisdiction Data in `app/page.tsx`

The Estate Jobs Board now imports jurisdiction data at module level. These module-level
constants live just below the `import` block, before `DEADLINE_CATEGORIES`:

```typescript
import rawJurisdictionData from "../swiftprobate_full.json"
import type { JurisdictionState } from "@/types/jurisdiction"
import { findState, findCounty, formatProse, slugToDisplayName } from "@/lib/jurisdictionUtils"

const jurisdictionData = rawJurisdictionData as JurisdictionState[]

const MOCK_ESTATE_STATE_SLUG = "california"
const MOCK_ESTATE_COUNTY_SLUG = "los-angeles-county"

const estateJurisdictionState = findState(jurisdictionData, MOCK_ESTATE_STATE_SLUG)
const estateJurisdictionCounty = findCounty(jurisdictionData, MOCK_ESTATE_STATE_SLUG, MOCK_ESTATE_COUNTY_SLUG)
```

When adding more jurisdiction features to `app/page.tsx`, use these existing constants.
Do not re-import `swiftprobate_full.json` — it is already imported.

To wire a different estate's jurisdiction, change `MOCK_ESTATE_STATE_SLUG` and
`MOCK_ESTATE_COUNTY_SLUG`. In future, these will come from the selected estate's metadata.

---

## Data Source

The JSON file is at the **repo root**: `swiftprobate_full.json`

```typescript
// From app/page.tsx (already done):
import rawJurisdictionData from "../swiftprobate_full.json"

// From app/probate-research/page.tsx:
import rawData from "../../swiftprobate_full.json"

// From components/probate-research/*:
import rawData from "../../swiftprobate_full.json"
```

The file is ~32 MB. Next.js handles it fine. Do not fetch at runtime — static import only.

**Prose fields (`county.overview`, `county.localRequirements`, etc.) contain scraped text
where sentences are concatenated without spaces.** Always run them through `formatProse()`
from `lib/jurisdictionUtils.ts` before rendering — it normalizes spacing and returns an
array of paragraph strings, each intended to be a separate `<p>` element.

---

## Styling

Use **Tailwind CSS v4 utility classes only**. No `sx` prop, no `style` objects, no CSS modules.

**Existing color palette:**

```
Background:   #f8f7f5, #fafafa
Dark text:    #1a1a2e, #3d3d3d, #2d2d4e
Muted text:   #6b675f, #9b9b9b
Borders:      #e5e5e5, #d0d0d0, #f0f0f0
Accent:       #7c6fc4, #5a4fa0  (purple)
```

**Alert card colors in use on the dashboard:**
- Jurisdiction state alert (dismissible): `bg-[#f4f2ff] border-[#c4bef0]`, icon `text-[#7c6fc4]`
- Local requirements (amber): `bg-amber-50 border-amber-200`, icon `text-amber-600`
- Small estate (green): `bg-green-50 border-green-200`, text `text-green-800`

---

## URL State (Research Tool)

Use `useSearchParams` and `useRouter` from **`next/navigation`** (not `react-router-dom`).

```typescript
import { useSearchParams, useRouter } from "next/navigation"

const searchParams = useSearchParams()
const router = useRouter()

const setParam = (key: string, value: string) => {
  const params = new URLSearchParams(searchParams.toString())
  if (value) params.set(key, value)
  else params.delete(key)
  router.replace(`/probate-research?${params.toString()}`, { scroll: false })
}
```

`useSearchParams` requires a `<Suspense>` boundary. The root `app/layout.tsx` already
wraps all children in `<Suspense>` — no additional setup needed.

---

## MUI → Tailwind/Radix Translation

| MUI pattern | Use this instead |
|-------------|-----------------|
| `<Box sx={{ display: "flex" }}>` | `<div className="flex">` |
| `<Stack spacing={2}>` | `<div className="flex flex-col gap-4">` |
| `<Paper variant="outlined" sx={{ p: 2 }}>` | `<div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">` |
| `<Divider sx={{ my: 2 }}>` | `<hr className="border-[#e5e5e5] my-4" />` or `<Separator />` from Radix |
| `<Typography variant="h5" fontWeight={600}>` | `<h2 className="text-xl font-semibold text-[#1a1a2e]">` |
| `<Typography variant="subtitle2" color="text.secondary">` | `<p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide">` |
| `<Chip label="..." size="small" variant="outlined">` | `<span className="text-xs border rounded-full px-2 py-0.5">` |
| `<Collapse in={expanded}>` | `<Collapsible>` from `@radix-ui/react-collapsible` |
| `<Select size="small">` | `<Select>` from `@radix-ui/react-select` |
| `<TextField size="small">` | `<Input>` from `@/components/ui/input` |

