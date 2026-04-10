# Probate Research Tool — Prototype

## What This Is

You are building a **standalone Probate Research Tool** in this Next.js prototype app.
The tool is a searchable, filterable reference panel that surfaces probate jurisdiction rules
(fees, timelines, court contacts, e-filing requirements) for all 50 US states and ~3,100 counties.

This is an internal tool for Alix — an ops platform for post-death estate settlement. Care team
members use this page to look up court info, fees, and timelines when opening a new estate,
without leaving the app or Googling.

Your work is **additive only**. Do not modify any existing pages, components, or files
unless explicitly instructed to.

## Your Task

Build the Probate Research Tool. Full product spec is in `docs/FEATURE_SPEC.md`.
Full data schema is in `docs/DATA_SCHEMA.md`.

## Domain Vocabulary

| Term | Meaning |
|------|---------|
| **Estate** | A deceased person's estate being administered through probate |
| **Component** | A workflow unit within an estate (e.g. "Probate", "Trust Administration") |
| **Job / Task** | A unit of work assigned to a care team member |
| **Settlement Director / Specialist** | Care team roles who own and work estates |
| **Jurisdiction** | The state + county where probate is filed — determines rules, fees, timelines |

---

## Tech Stack (Already Installed — Do Not Add Packages)

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | 16 (App Router) | `app/` directory, server + client components |
| React | 19 | |
| TypeScript | 5 | Strict mode. No `any`. |
| Tailwind CSS | **v4** | Utility classes only. No `sx` prop. No CSS modules. |
| Radix UI | Full suite | All primitives already installed (see below) |
| Lucide React | 0.454 | Icons — use these, not any other icon library |
| date-fns | 4 | Date formatting |
| react-resizable-panels | 2 | Use for the two-panel left/right layout |
| clsx + tailwind-merge | — | Available via `cn()` in `lib/utils.ts` |

**Radix UI primitives already installed:**
- `@radix-ui/react-collapsible` — use for the expandable state/county tree in the left panel
- `@radix-ui/react-select` — use for the State and E-Filing dropdowns
- `@radix-ui/react-scroll-area` — use for independently scrollable panels
- `@radix-ui/react-separator` — use for dividers between sections
- `@radix-ui/react-tooltip` — use for the "Copied!" clipboard feedback on phone numbers

Do NOT use `@radix-ui/react-dialog` — this feature is a page, not a modal.

**Pre-built shadcn components available:**
```typescript
import { Button } from "@/components/ui/button"   // variants: default, outline, ghost
import { Input } from "@/components/ui/input"      // standard text input
```

**`cn()` utility:**
```typescript
import { cn } from "@/lib/utils"
cn("base-class", condition && "conditional-class")
```

---

## How to Add the New Page

This is a Next.js App Router app. Routing is filesystem-based — no route registration needed.

Create: `app/probate-research/page.tsx`

```tsx
"use client"

export default function ProbateResearchPage() {
  // ...
}
```

The page is accessible at `http://localhost:3000/probate-research`. That's it.

Do NOT add anything to `app/page.tsx`. Leave the existing home page untouched.

---

## File Structure for Your Work

```
app/
  probate-research/
    page.tsx                       ← page shell + URL state wiring ("use client")
components/
  probate-research/
    StateCountyList.tsx            ← left panel: expandable state/county tree
    CountyDetailPanel.tsx          ← right panel: all detail cards
    ResearchFilters.tsx            ← top filter bar (search + dropdowns)
    cards/
      CourthouseCard.tsx
      FeesCard.tsx
      TimelinesCard.tsx
      QuickReferenceCard.tsx
      ResourcesCard.tsx
      EfilingChip.tsx
lib/
  jurisdictionUtils.ts             ← pure helper functions (no React, no hooks)
types/
  jurisdiction.ts                  ← all TypeScript types for the JSON data
```

All types live in `types/jurisdiction.ts`. Import from there — never inline types in components.

---

## Data Source

The JSON data file is at the **repo root**: `swiftprobate_full.json`

Import it with a type assertion:

```typescript
import rawData from "../../swiftprobate_full.json"
import type { JurisdictionState } from "@/types/jurisdiction"

const jurisdictionData = rawData as JurisdictionState[]
```

The relative path depth depends on where you're importing from — adjust `../../` accordingly.
The file is ~13 MB. Next.js handles it without issue. **Do not fetch at runtime — static import only.**

See `docs/DATA_SCHEMA.md` for the full schema and critical data quality notes.

---

## Styling

Use **Tailwind CSS v4 utility classes only**. No `sx` prop, no `style={{}}` objects, no CSS modules.

**Existing color palette — use these values for consistency:**

| Role | Value |
|------|-------|
| Page background | `#f8f7f5` |
| Card background | `#ffffff` |
| Dark text | `#1a1a2e` |
| Muted text | `#6b675f` |
| Very muted | `#9b9b9b` |
| Border | `#e5e5e5` |
| Accent (purple) | `#7c6fc4` |
| Accent dark | `#5a4fa0` |

---

## URL State

Use `useSearchParams` and `useRouter` from **`next/navigation`** — not `react-router-dom`.

```typescript
import { useSearchParams, useRouter } from "next/navigation"

const searchParams = useSearchParams()
const router = useRouter()

// Read:
const q = searchParams.get("q") ?? ""

// Write (non-destructive — preserves other params):
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

`useSearchParams` requires a `<Suspense>` boundary above it. The root `app/layout.tsx` already
wraps all children in `<Suspense>` — this is handled for you.

---

## MUI → Tailwind/Radix Translation

The feature spec describes components semantically. Use these equivalents:

| Concept | Implementation |
|---------|---------------|
| Horizontal flex row | `<div className="flex items-center gap-4">` |
| Vertical flex column | `<div className="flex flex-col gap-4">` |
| Outlined card | `<div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">` |
| Divider | `<hr className="border-[#e5e5e5] my-4" />` or `<Separator />` from Radix |
| Page heading | `<h2 className="text-xl font-semibold text-[#1a1a2e]">` |
| Section label | `<p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide">` |
| Muted caption | `<span className="text-xs text-[#9b9b9b]">` |
| Outlined chip/badge | `<span className="text-xs border border-[#e5e5e5] rounded-full px-2 py-0.5">` |
| Success chip | `<span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">` |
| Expandable section | `<Collapsible>` from `@radix-ui/react-collapsible` |
| Dropdown | `<Select>` from `@radix-ui/react-select` |
| Text input | `<Input>` from `@/components/ui/input` |
| Link list | `<a>` tags inside `<nav>` with `py-1.5 px-3` classes |
| Search icon | `import { Search } from "lucide-react"` |
| E-filing bolt icon | `import { Zap } from "lucide-react"` |
| Phone icon | `import { Phone } from "lucide-react"` |
| Globe/website icon | `import { Globe } from "lucide-react"` |
| External link icon | `import { ExternalLink } from "lucide-react"` |
| Copy icon | `import { Copy } from "lucide-react"` |
| Location pin icon | `import { MapPin } from "lucide-react"` |
| Search-off icon | `import { SearchX } from "lucide-react"` |
| Chevron right | `import { ChevronRight } from "lucide-react"` |
| Chevron down | `import { ChevronDown } from "lucide-react"` |

---

## Two-Panel Layout

Use `react-resizable-panels` for the resizable left/right split:

```tsx
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

<PanelGroup direction="horizontal" className="h-full">
  <Panel defaultSize={25} minSize={20} maxSize={35}>
    {/* StateCountyList — use ScrollArea from Radix for independent scroll */}
  </Panel>
  <PanelResizeHandle className="w-px bg-[#e5e5e5] hover:bg-[#7c6fc4] transition-colors cursor-col-resize" />
  <Panel>
    {/* CountyDetailPanel — use ScrollArea from Radix for independent scroll */}
  </Panel>
</PanelGroup>
```

Each panel body: `overflow-y-auto h-full` or wrapped in `<ScrollArea>` from Radix.

---

## Core Principles

1. **URL-driven state.** All filter and selection state lives in URL query params. Use
   `useSearchParams` + `useRouter` from `next/navigation`. Never use `useState` for things
   the user could want to share, bookmark, or reload.

2. **Tailwind only.** No inline `style` objects, no CSS modules, no `sx` prop. Use the
   color palette defined above for consistency with the rest of the app.

3. **TypeScript strict.** No `any`, no `unknown` without narrowing. All types in
   `types/jurisdiction.ts`. Import from there everywhere.

4. **Defensive rendering.** The JSON has missing fields and scraped noise. Use optional
   chaining (`?.`) everywhere. Never crash on missing data — render `null` or a fallback.
   Read `docs/DATA_SCHEMA.md` carefully before writing any rendering code.

5. **No mutations, no network calls.** Read-only tool. No API calls, no `fetch`, no
   form submissions. The entire data layer is the static JSON import.

6. **Implement utils first.** Write all functions in `lib/jurisdictionUtils.ts` before
   building any components. All filtering, lookups, and formatting live in utils. Components
   contain zero data-manipulation logic.
