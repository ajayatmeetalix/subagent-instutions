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
| `app/page.tsx` | Estate Manager jobs board — all components, state, modals, data (see `feature_*.md` files for details) |
| `app/probate-research/page.tsx` | Probate Research Tool page shell |
| `components/ui/button.tsx` | shadcn Button with CVA variants |
| `components/ui/input.tsx` | shadcn Input |
| `components/probate-research/` | All Probate Research Tool components |
| `lib/jurisdictionUtils.ts` | Pure helper functions for probate research data |
| `types/jurisdiction.ts` | TypeScript types for `swiftprobate_full.json` |
| `swiftprobate_full.json` | Probate jurisdiction data — 51 states, ~3,100 counties (static import only) |

---

## Pages

### Estate Manager Jobs Board (`/`) — Shipped

Lives entirely in `app/page.tsx`. A SAUL-powered jobs board prototype where care team specialists validate AI output across a sequence of legal tasks (asset classification → legal path → probate plan). All data is mocked via constants. See the `feature_*.md` files at the repo root for per-task specs.

### Probate Research Tool (`/probate-research`) — Active

A searchable, filterable reference panel for probate jurisdiction rules across all 50 US states and ~3,100 counties. Care team members use this to look up court info, fees, timelines, and e-filing requirements when opening an estate.

**Route:** `/probate-research`
**Data source:** `swiftprobate_full.json` — static import, no API calls
**Spec files:** `new-feature-specs/FEATURE_SPEC.md`, `new-feature-specs/DATA_SCHEMA.md`, `new-feature-specs/CODEBASE_CONTEXT.md`

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

---

## Prototype Conventions

- No real API calls, no real auth, no real state persistence
- All state in components via `useState` or URL params
- Tailwind v4 utility classes — hardcoded hex values for exact color fidelity
