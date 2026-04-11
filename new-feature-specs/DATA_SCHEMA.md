# Data Schema: swiftprobate_full.json

## Source & Loading

The JSON file lives at the **repo root**: `swiftprobate_full.json`

```typescript
import rawData from "../../swiftprobate_full.json"
import type { JurisdictionState } from "@/types/jurisdiction"

const jurisdictionData = rawData as JurisdictionState[]
```

Adjust the relative path depth based on where you're importing from. The file is ~32 MB.
Next.js handles it without issue. **Do not fetch at runtime — static import only.**

## Coverage

| Metric | Value |
|--------|-------|
| States | 51 (50 states + DC) |
| Total counties | ~3,100 |
| Counties with fees | ~3,075 |
| Counties with estimated timelines | ~3,075 |
| Counties with e-filing info | ~3,099 |
| Counties with filing steps | ~3,075 |
| Counties with forms | ~3,050 |
| Counties with FAQs | ~3,075 |

---

## TypeScript Types

Define all of the following in `types/jurisdiction.ts`. Import from there everywhere —
never inline types in components.

```typescript
export type JurisdictionData = JurisdictionState[]

export type JurisdictionState = {
  name: string                         // ⚠️ SCRAPED NOISE — do not display. Use slug.
  abbr: string | null                  // ⚠️ Frequently null. Derive from slug instead.
  slug: string                         // ✅ Stable ID. e.g. "alabama", "district-of-columbia"
  url: string
  smallEstateThreshold: number | null  // Numeric dollars, e.g. 47000
  timeline: string | null
  countyCount: number | null
  quickReference: StateQuickReference | null
  overview: string | null
  whenProbateRequired: string | null
  smallEstateOptions: string | null
  stepByStep: string[] | null
  timelineAndCosts: string | null
  requiredForms: string[] | null
  executorDuties: string | null
  uniqueStateRules: string | null
  vehicleTitleTransfers: string | null
  faqs: null
  counties: JurisdictionCounty[]
}

export type StateQuickReference = {
  smallEstateThreshold: string  // Formatted string e.g. "$47,000" (see note on state.smallEstateThreshold)
  filingDeadline: string
  creditorClaimPeriod: string
}

export type JurisdictionCounty = {
  name: string          // ⚠️ SCRAPED NOISE — do not display. Use slug.
  slug: string          // ✅ Stable ID. e.g. "jefferson-county"
  url: string           // Link to SwiftProbate source page
  stateSlug: string     // Parent state slug
  lastUpdated: string | null
  timeline: string | null
  filingFee: string | null
  overview: string | null
  courthouse: CountyCourthouse | null
  filingSteps: CountyFilingStep[] | null
  localRequirements: string | null
  timelineAndFees: string | null
  fees: string[] | null             // Bullet-style fee lines
  paymentMethods: string | null
  estimatedTimelines: string[] | null
  efilingRequired: boolean | null   // null = unknown
  efilingPortal: string | null      // ⚠️ May have trailing punctuation — use cleanUrl()
  resources: CountyResource[]
  resourcesContact: string[] | null
  publicationNewspaper: string | null
  publicationNewspapers: string[] | null
  forms: CountyForm[] | null
  faqs: CountyFaq[]
}

export type CountyCourthouse = {
  name?: string
  address?: string
  phone?: string
  fax?: string
  hours?: string           // May have "Hours: " prefix — strip with /^Hours:\s*/i
  parkingAndAccess?: string
}

export type CountyFilingStep = {
  step: string
  detail: string
}

export type CountyForm = {
  name: string
  url: string
  description: string
}

export type CountyResource = {
  label: string
  url: string
}

export type CountyFaq = {
  question: string
  answer: string
}

// For use in filter functions
export type EfilingFilter = "required" | "not-required" | "unknown"

export type JurisdictionFilterOptions = {
  query: string
  stateSlug: string | null
  efilingFilter: EfilingFilter | null
}
```

---

## Complete Annotated Example

**State: Wyoming** — `state.quickReference`
```json
{
  "smallEstateThreshold": "$400,000",
  "filingDeadline": "No statutory deadline; within a reasonable time",
  "creditorClaimPeriod": "3 months from first publication"
}
```

Note: `state.smallEstateThreshold` is a **number** (`400000`) while
`state.quickReference.smallEstateThreshold` is a **formatted string** (`"$400,000"`).
Use the quickReference string for display.

**County: Teton County, WY** — full object
```json
{
  "name": "Teton County6-9 months · Filing fee: $160",
  "slug": "teton-county",
  "url": "https://www.swiftprobate.com/probate/wyoming/teton-county",
  "stateSlug": "wyoming",
  "lastUpdated": "February 15, 2026",
  "timeline": null,
  "filingFee": null,
  "overview": "Teton County probate proceedings are handled by the Teton County District Court...",
  "courthouse": {
    "name": "Teton County District Court",
    "address": "180 S. King Street, Jackson, WY 83001",
    "phone": "(307) 733-2533",
    "hours": "Hours: Monday through Friday, 8:00 AM to 5:00 PM",
    "parkingAndAccess": "Parking available in the adjacent lot..."
  },
  "filingSteps": [
    { "step": "File Petition for Probate", "detail": "Submit to the Teton County District Court..." },
    { "step": "Publish Notice to Creditors", "detail": "Publish in a newspaper of general circulation..." }
  ],
  "localRequirements": "All petitions must include a certified copy of the death certificate.",
  "timelineAndFees": "Simple estates: 6-9 months. Complex or contested: 12-24 months.",
  "fees": [
    "Probate of Will / Letters Testamentary: approximately $175.00",
    "Small Estate Affidavit: $50.00"
  ],
  "paymentMethods": "Cash, check, or money order payable to Teton County District Court.",
  "estimatedTimelines": [
    "Simple estates (no disputes, limited assets): 6-9 months",
    "Complex or contested estates: 12 months to 2 years"
  ],
  "efilingRequired": true,
  "efilingPortal": "https://www.fileandservexpress.com/wyoming/).",
  "resources": [
    { "label": "tetoncountywy.gov", "url": "https://www.tetoncountywy.gov/204/Clerk-of-the-District-Court" },
    { "label": "Wyoming Judicial Branch", "url": "https://www.wyocourts.gov/legal-help-by-topic/probate/" }
  ],
  "resourcesContact": ["(307) 733-2533", "clerk@tetoncountywy.gov"],
  "publicationNewspaper": "Jackson Hole News & Guide",
  "publicationNewspapers": ["Jackson Hole News & Guide"],
  "forms": [
    {
      "name": "Petition for Probate",
      "url": "https://www.wyocourts.gov/forms/probate-petition.pdf",
      "description": "Required for opening a formal probate proceeding."
    }
  ],
  "faqs": [
    {
      "question": "How long does probate take in Teton County?",
      "answer": "Simple estates typically take 6-9 months. Complex or contested estates may take 12-24 months."
    }
  ]
}
```

What's wrong in this example — exactly what to watch for:
- `name`: `"Teton County6-9 months · Filing fee: $160"` → use slug only
- `efilingPortal`: ends with `")."` → must be cleaned before use as `href` via `cleanUrl()`
- `courthouse.hours`: has `"Hours: "` prefix → strip with `.replace(/^Hours:\s*/i, "")`

---

## Data Quality Field Reference

### Fields that are ALWAYS safe to display
| Field | Notes |
|-------|-------|
| `state.slug` | Stable, clean |
| `state.quickReference.*` | Well-formed across all 51 states |
| `state.overview` | Clean prose (may be null) |
| `county.slug` | Stable, clean |
| `county.url` | Valid URL to SwiftProbate source |
| `county.stateSlug` | Stable |
| `county.lastUpdated` | Date string e.g. "February 15, 2026" (may be null) |
| `county.efilingRequired` | Boolean or null — use as-is |
| `county.resources` | Array of `{label, url}` — safe |
| `county.faqs` | Array of `{question, answer}` — safe, often populated |
| `county.courthouse.name` | Court name — safe when present |
| `county.courthouse.address` | Physical address — safe when present |
| `county.courthouse.phone` | Phone number — safe when present |
| `county.courthouse.fax` | Fax number — safe when present |
| `county.courthouse.parkingAndAccess` | Parking info — safe when present |
| `county.fees` | Array of strings — safe (may be null or empty) |
| `county.estimatedTimelines` | Array of strings — safe (may be null or empty) |
| `county.filingSteps` | Array of `{step, detail}` — safe (may be null or empty) |
| `county.forms` | Array of `{name, url, description}` — safe (may be null or empty) |

### Fields requiring validation or cleaning
| Field | Problem | Fix |
|-------|---------|-----|
| `county.efilingPortal` | May have trailing punctuation e.g. `")."` | Run through `cleanUrl()` |
| `county.courthouse.hours` | Prefixed with `"Hours: "` | Strip with `.replace(/^Hours:\s*/i, "")` |
| `county.forms[].url` | May be relative or malformed | Run through `cleanUrl()` |

### Fields that must NEVER be displayed
| Field | Problem |
|-------|---------|
| `state.name` | Raw scraped string e.g. `"AlabamaALSmall estate: $47,000 · 6-12 months (simple)..."` |
| `county.name` | Raw scraped string e.g. `"Teton County6-9 months · Filing fee: $160"` |

### State abbreviations
`state.abbr` is frequently `null`. Use `stateSlugToAbbr(slug)` from `lib/jurisdictionUtils.ts`
which maps slugs to abbreviations via a hardcoded lookup.

---

## Helper Functions (`lib/jurisdictionUtils.ts`)

All functions must be pure — no side effects, no React, no hooks.

```typescript
import type {
  JurisdictionState,
  JurisdictionCounty,
  JurisdictionFilterOptions,
} from "@/types/jurisdiction"

/** "harris-county" → "Harris County" */
export function slugToDisplayName(slug: string): string

/** "alabama" → "AL", "district-of-columbia" → "DC". Returns null if not recognized. */
export function stateSlugToAbbr(slug: string): string | null

/** Find a state by slug. Returns undefined if not found. */
export function findState(
  data: JurisdictionState[],
  stateSlug: string | null | undefined
): JurisdictionState | undefined

/** Find a county by state slug + county slug. Returns undefined if not found. */
export function findCounty(
  data: JurisdictionState[],
  stateSlug: string | null | undefined,
  countySlug: string | null | undefined
): JurisdictionCounty | undefined

/** Get the courthouse phone from county.courthouse.phone. Returns null if not available. */
export function getPrimaryPhone(county: JurisdictionCounty): string | null

/** Get the courthouse fax from county.courthouse.fax. Returns null if not available. */
export function getPrimaryFax(county: JurisdictionCounty): string | null

/**
 * Clean a URL string with possible trailing scraped punctuation.
 * "https://example.com/)." → "https://example.com/"
 * Returns null if input is null/undefined/empty or does not start with "http".
 */
export function cleanUrl(raw: string | null | undefined): string | null

/**
 * Extract the domain name from a URL for display.
 * "https://www.jeffcoprobatecourt.com/home/forms/" → "jeffcoprobatecourt.com"
 * Returns the full input string if URL parsing fails.
 */
export function urlToDisplayLabel(url: string): string

/** "lettersTestamentary" → "Letters Testamentary" */
export function camelToTitleCase(str: string): string

/**
 * Filter the full jurisdiction data array.
 * Returns a NEW array — does not mutate the input.
 *
 * Logic:
 * 1. If stateSlug is set: only include that state
 * 2. For each state, filter its counties:
 *    - If query is non-empty: county or state display name must contain the query (case-insensitive)
 *    - If efilingFilter is set:
 *        "required"     → county.efilingRequired === true
 *        "not-required" → county.efilingRequired === false
 *        "unknown"      → county.efilingRequired === null
 * 3. Exclude states where all counties were filtered out
 * 4. Return filtered states with their filtered county arrays
 */
export function filterJurisdictions(
  data: JurisdictionState[],
  options: JurisdictionFilterOptions
): JurisdictionState[]
```

---

## State Slug → Abbreviation Map

```typescript
const STATE_ABBR: Record<string, string> = {
  "alabama": "AL",
  "alaska": "AK",
  "arizona": "AZ",
  "arkansas": "AR",
  "california": "CA",
  "colorado": "CO",
  "connecticut": "CT",
  "delaware": "DE",
  "district-of-columbia": "DC",
  "florida": "FL",
  "georgia": "GA",
  "hawaii": "HI",
  "idaho": "ID",
  "illinois": "IL",
  "indiana": "IN",
  "iowa": "IA",
  "kansas": "KS",
  "kentucky": "KY",
  "louisiana": "LA",
  "maine": "ME",
  "maryland": "MD",
  "massachusetts": "MA",
  "michigan": "MI",
  "minnesota": "MN",
  "mississippi": "MS",
  "missouri": "MO",
  "montana": "MT",
  "nebraska": "NE",
  "nevada": "NV",
  "new-hampshire": "NH",
  "new-jersey": "NJ",
  "new-mexico": "NM",
  "new-york": "NY",
  "north-carolina": "NC",
  "north-dakota": "ND",
  "ohio": "OH",
  "oklahoma": "OK",
  "oregon": "OR",
  "pennsylvania": "PA",
  "rhode-island": "RI",
  "south-carolina": "SC",
  "south-dakota": "SD",
  "tennessee": "TN",
  "texas": "TX",
  "utah": "UT",
  "vermont": "VT",
  "virginia": "VA",
  "washington": "WA",
  "west-virginia": "WV",
  "wisconsin": "WI",
  "wyoming": "WY",
}
```
