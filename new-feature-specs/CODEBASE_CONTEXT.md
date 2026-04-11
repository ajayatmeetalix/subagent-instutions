# Codebase Context — Probate Research Tool

This file overrides any conflicting instructions in `CLAUDE.md`.
Read this file alongside `CLAUDE.md` and `FEATURE_SPEC.md`. Where instructions conflict,
this file wins.

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
| react-resizable-panels | 2 | Use for the two-panel layout |
| clsx + tailwind-merge | — | Available via `cn()` in `lib/utils.ts` |

**Radix UI primitives already installed (relevant ones):**
- `@radix-ui/react-collapsible` — use for the expandable state/county tree
- `@radix-ui/react-select` — use for the State and E-Filing dropdowns
- `@radix-ui/react-scroll-area` — use for independently scrollable panels
- `@radix-ui/react-separator` — use for dividers
- `@radix-ui/react-tooltip` — use for the "Copied!" phone copy feedback

Do not use `@radix-ui/react-dialog` for this feature — it's a page, not a modal.

---

## How to Add the New Page

Create a new Next.js route at `app/probate-research/page.tsx`.

```tsx
// app/probate-research/page.tsx
"use client"

export default function ProbateResearchPage() {
  // ...
}
```

The page will be accessible at `http://localhost:3000/probate-research`.
No route registration required — Next.js handles it automatically.

Do NOT add anything to `app/page.tsx`. This prototype's home page is untouched.

---

## File Structure for Your Work

```
app/
  probate-research/
    page.tsx                     ← page shell + URL state wiring
components/
  probate-research/
    StateCountyList.tsx          ← left panel: expandable state/county tree
    CountyDetailPanel.tsx        ← right panel: all detail cards
    ResearchFilters.tsx          ← top filter bar (search + dropdowns)
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
  jurisdictionUtils.ts           ← pure helper functions (no React)
types/
  jurisdiction.ts                ← all TypeScript types for the data
```

All types live in `types/jurisdiction.ts`. Import from there — do not inline types in components.

---

## Data Source

The JSON file is at the **repo root**, not inside `src/data/`:

```typescript
// Correct import path from any file in this repo:
import jurisdictionData from "../../swiftprobate_full.json"
// or from app/probate-research/page.tsx:
import jurisdictionData from "../../swiftprobate_full.json"
// or from components/probate-research/*:
import jurisdictionData from "../../swiftprobate_full.json"
```

The file is ~32 MB. Next.js handles it fine. Do not fetch at runtime — static import only.

---

## Styling

Use **Tailwind CSS v4 utility classes only**. No `sx` prop (that's MUI), no `style` objects,
no CSS modules.

**Existing color palette** (hardcoded hex — use these instead of Tailwind semantic names
where exact fidelity matters):

```
Background:   #f8f7f5, #fafafa
Dark text:    #1a1a2e, #3d3d3d, #2d2d4e
Muted text:   #6b675f, #9b9b9b
Borders:      #e5e5e5, #d0d0d0, #f0f0f0
Accent:       #7c6fc4, #5a4fa0  (purple)
```

For layout composition use Tailwind flexbox/grid utilities, not MUI `Box`, `Stack`, or `Grid`.

---

## URL State

Use `useSearchParams` and `useRouter` from **`next/navigation`** (not `react-router-dom`).

```typescript
import { useSearchParams, useRouter } from "next/navigation"

const searchParams = useSearchParams()
const router = useRouter()

// Read a param:
const q = searchParams.get("q") ?? ""

// Write params (non-destructive update):
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

The `useSearchParams` hook requires a `<Suspense>` boundary above it. The root `app/layout.tsx`
already wraps all children in `<Suspense>` so this is handled for you.

---

## Translating MUI Patterns → Tailwind + Radix

The feature spec was written for MUI. Use these equivalents:

| MUI pattern | Use this instead |
|-------------|-----------------|
| `<Box sx={{ display: "flex" }}>` | `<div className="flex">` |
| `<Stack spacing={2}>` | `<div className="flex flex-col gap-4">` |
| `<Paper variant="outlined" sx={{ p: 2 }}>` | `<div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">` |
| `<Divider sx={{ my: 2 }}>` | `<hr className="border-[#e5e5e5] my-4" />` or `<Separator />` from Radix |
| `<Typography variant="h5" fontWeight={600}>` | `<h2 className="text-xl font-semibold text-[#1a1a2e]">` |
| `<Typography variant="subtitle2" color="text.secondary">` | `<p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide">` |
| `<Typography variant="caption" color="text.secondary">` | `<span className="text-xs text-[#9b9b9b]">` |
| `<Chip label="..." size="small" variant="outlined">` | `<span className="text-xs border rounded-full px-2 py-0.5">` |
| `<Chip label="..." color="success" size="small">` | `<span className="text-xs bg-green-50 text-green-700 rounded-full px-2 py-0.5">` |
| `<Collapse in={expanded}>` | `<Collapsible>` from `@radix-ui/react-collapsible` |
| `<Select size="small">` | `<Select>` from `@radix-ui/react-select` |
| `<TextField size="small">` | `<Input>` from `@/components/ui/input` |
| `<List dense>` + `<ListItemButton>` | `<a>` tags inside a `<nav>` with `py-1.5 px-3` classes |
| `<SearchIcon>` | `import { Search } from "lucide-react"` |
| `<BoltIcon>` | `import { Zap } from "lucide-react"` |
| `<PhoneIcon>` | `import { Phone } from "lucide-react"` |
| `<LanguageIcon>` | `import { Globe } from "lucide-react"` |
| `<OpenInNewIcon>` | `import { ExternalLink } from "lucide-react"` |
| `<ContentCopyIcon>` | `import { Copy } from "lucide-react"` |
| `<PlaceIcon>` | `import { MapPin } from "lucide-react"` |
| `<SearchOffIcon>` | `import { SearchX } from "lucide-react"` |
| `<ChevronRightIcon>` | `import { ChevronRight } from "lucide-react"` |
| `<ExpandMoreIcon>` | `import { ChevronDown } from "lucide-react"` |

---

## Two-Panel Layout

Use `react-resizable-panels` for the left/right split:

```tsx
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

<PanelGroup direction="horizontal">
  <Panel defaultSize={25} minSize={20} maxSize={35}>
    {/* StateCountyList — scrolls independently */}
  </Panel>
  <PanelResizeHandle className="w-px bg-[#e5e5e5] hover:bg-[#7c6fc4] transition-colors" />
  <Panel>
    {/* CountyDetailPanel — scrolls independently */}
  </Panel>
</PanelGroup>
```

Each panel body should be `overflow-y-auto h-full` for independent scrolling.

---

## Components Available

Pre-built shadcn components you can import:

```typescript
import { Button } from "@/components/ui/button"   // variants: default, outline, ghost, etc.
import { Input } from "@/components/ui/input"      // standard text input
```

The `cn()` utility for merging class names:

```typescript
import { cn } from "@/lib/utils"
cn("base-class", condition && "conditional-class")
```

---

## TypeScript

- Strict mode is on. No `any`, no `unknown` without narrowing.
- All types go in `types/jurisdiction.ts`. Import from there everywhere.
- The JSON import will need a type assertion or a well-typed import. Cast it:

```typescript
import rawData from "../../swiftprobate_full.json"
import type { JurisdictionState } from "@/types/jurisdiction"

const jurisdictionData = rawData as JurisdictionState[]
```

---

## What to Ignore in CLAUDE.md

These instructions in `new-feature-specs/CLAUDE.md` do **not** apply to this repo:

- The entire "Tech Stack" table (wrong stack)
- The "How to Add the New Page" section (no `src/Routes.tsx`, no `react-admin`)
- References to `src/data/`, `src/pages/`, `src/types/`, `src/utils/` (no `src/` directory)
- MUI's `sx` prop, `useTheme`, or any `@mui/*` import
- `useSearchParams` from `react-router-dom` (use `next/navigation` instead)
- `React.lazy` + `CustomRoutes` pattern (Next.js App Router handles code splitting)
