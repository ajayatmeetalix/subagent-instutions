# Data Schema: swiftprobate_full.json

## Source & Loading

The JSON file lives at the **repo root**: `swiftprobate_full.json`

```typescript
import rawData from "../../swiftprobate_full.json"
import type { JurisdictionState } from "@/types/jurisdiction"

const jurisdictionData = rawData as JurisdictionState[]
```

Adjust the relative path depth based on where you're importing from. The file is ~13 MB.
Next.js handles it without issue. **Do not fetch at runtime — static import only.**

## Coverage

| Metric | Value |
|--------|-------|
| States | 51 (50 states + DC) |
| Total counties | ~3,100 |
| Counties with fees | ~3,075 |
| Counties with timelines | ~3,025 |
| Counties with e-filing info | ~2,900 |

---

## TypeScript Types

Define all of the following in `types/jurisdiction.ts`. Import from there everywhere —
never inline types in components.

```typescript
export type JurisdictionData = JurisdictionState[]

export type JurisdictionState = {
  name: string                        // ⚠️ SCRAPED NOISE — do not display. Use slug.
  abbr: string | null                 // ⚠️ Frequently null. Derive from slug instead.
  slug: string                        // ✅ Stable ID. e.g. "alabama", "district-of-columbia"
  url: string
  smallEstateThreshold: string | null
  timeline: string | null
  countyCount: number | null
  quickReference: StateQuickReference | null
  overviewSnippet: string
  counties: JurisdictionCounty[]
}

export type StateQuickReference = {
  smallEstateThreshold: string        // e.g. "$47,000"
  filingDeadline: string              // e.g. "5 years from date of death"
  creditorClaimPeriod: string         // e.g. "6 months from date letters are granted"
}

export type JurisdictionCounty = {
  name: string                        // ⚠️ SCRAPED NOISE — do not display. Use slug.
  slug: string                        // ✅ Stable ID. e.g. "jefferson-county"
  url: string                         // Link to SwiftProbate source page
  stateSlug: string                   // Parent state slug
  timeline: string | null
  filingFee: string | null
  courthouse: CountyCourthouse
  fees: Record<string, string> | null
  timelines: Record<string, string> | null
  newspapers: string[]                // ⚠️ SCRAPED NOISE — do not display (see notes)
  efilingRequired: boolean | null     // null = unknown
  efilingPortal: string | null        // ⚠️ May have trailing punctuation — use cleanUrl()
  resources: CountyResource[]
  quickReference: CountyQuickReference
  faqs: CountyFaq[]
}

export type CountyCourthouse = {
  phones: string[]
  websites: string[]
  hours: string
  judges: string[]                    // ⚠️ SCRAPED FRAGMENTS — do not display (see notes)
}

export type CountyResource = {
  label: string
  url: string
}

export type CountyQuickReference = {
  Courthouse?: string                 // Physical address. e.g. "180 S. King Street, Jackson, WY 83001"
  Phone?: string                      // Primary phone. e.g. "(307) 733-2533"
  Website?: string                    // ⚠️ Sometimes plain text "Court website" — validate before use
  [key: string]: string | undefined
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

**County: Teton County, WY** — full object
```json
{
  "name": "Teton County6-9 months · Filing fee: $160",
  "slug": "teton-county",
  "url": "https://www.swiftprobate.com/probate/wyoming/teton-county",
  "stateSlug": "wyoming",
  "timeline": null,
  "filingFee": null,
  "courthouse": {
    "phones": ["(307)733-2533", "(307)632-9061", "(877)432-9955", "(307)733-2047"],
    "websites": ["https://www.wyocourts.gov/legal-help-by-topic/probate/"],
    "hours": "Hours: Monday through Friday, 8:00 AM to 5:00 PM",
    "judges": ["reviews the petition and"]
  },
  "fees": {
    "smallEstate": "Wyoming offers a simplified procedure for small estates. If the value of the estate (less liens and encumbrances) does not exceed $400,000, successors...",
    "lettersTestamentary": "$5",
    "noticePublication": "$150"
  },
  "timelines": {
    "independentAdmin": "Simple estates (no disputes, limited assets): 6-9 months",
    "dependentAdmin": "Complex or contested estates: 12 months to 2 years"
  },
  "newspapers": ["Home", "Probate Guides", "Wyoming", "Teton County"],
  "efilingRequired": true,
  "efilingPortal": "https://www.fileandservexpress.com/wyoming/).",
  "resources": [
    { "label": "tetoncountywy.gov", "url": "https://www.tetoncountywy.gov/204/Clerk-of-the-District-Court" },
    { "label": "Wyoming Judicial Branch", "url": "https://www.wyocourts.gov/legal-help-by-topic/probate/" },
    { "label": "wyomingbar.org", "url": "https://www.wyomingbar.org/for-the-public/hire-a-lawyer/" },
    { "label": "wyopublicnotices.com", "url": "https://www.wyopublicnotices.com/" }
  ],
  "quickReference": {
    "Courthouse": "180 S. King Street, Jackson, WY 83001",
    "Phone": "(307) 733-2533",
    "Website": "Court website"
  },
  "faqs": []
}
```

What's wrong in this example — exactly what to watch for:
- `name`: `"Teton County6-9 months · Filing fee: $160"` → use slug only
- `courthouse.judges`: `["reviews the petition and"]` → sentence fragment, not a name
- `newspapers`: `["Home", "Probate Guides", "Wyoming", "Teton County"]` → nav text, not papers
- `efilingPortal`: ends with `")."` → must be cleaned before use as `href`
- `quickReference.Website`: `"Court website"` → a label, not a URL

---

## Data Quality Field Reference

### Fields that are ALWAYS safe to display
| Field | Notes |
|-------|-------|
| `state.slug` | Stable, clean |
| `state.quickReference.*` | Well-formed across all 51 states |
| `state.overviewSnippet` | Clean prose |
| `county.slug` | Stable, clean |
| `county.url` | Valid URL to SwiftProbate source |
| `county.stateSlug` | Stable |
| `county.efilingRequired` | Boolean or null — use as-is |
| `county.resources` | Array of `{label, url}` — safe |
| `county.faqs` | Array of `{question, answer}` — safe but often empty |
| `county.quickReference.Courthouse` | Physical address — safe when present |
| `county.quickReference.Phone` | Phone number — safe when present |
| `county.courthouse.phones` | Array of phone strings — safe |
| `county.courthouse.hours` | Has `"Hours: "` prefix — strip it |
| `county.courthouse.websites` | Valid URLs — safe |

### Fields requiring validation or cleaning
| Field | Problem | Fix |
|-------|---------|-----|
| `county.efilingPortal` | May have trailing punctuation e.g. `")."` | Run through `cleanUrl()` |
| `county.quickReference.Website` | Sometimes `"Court website"` plain text | Check `startsWith("http")` before using as href |
| `county.fees[key]` | Values may be full paragraphs (100+ chars) | Truncate at 120 chars with "Show more" toggle |
| `county.courthouse.hours` | Prefixed with `"Hours: "` | Strip with `.replace(/^Hours:\s*/i, "")` |

### Fields that must NEVER be displayed
| Field | Problem |
|-------|---------|
| `state.name` | Raw scraped string e.g. `"AlabamaALSmall estate: $47,000 · 6-12 months (simple)..."` |
| `county.name` | Raw scraped string e.g. `"Teton County6-9 months · Filing fee: $160"` |
| `county.newspapers` | Navigation page text mixed with newspaper names |
| `county.courthouse.judges` | Scraped sentence fragments, not real judge names |

### State abbreviations
`state.abbr` is frequently `null`. Use `stateSlugToAbbr(slug)` from `lib/jurisdictionUtils.ts`
which maps slugs to abbreviations via a hardcoded lookup.

---

## Helper Functions (`lib/jurisdictionUtils.ts`)

All functions must be pure — no side effects, no React, no hooks. Implement in this order.

```typescript
import type {
  JurisdictionState,
  JurisdictionCounty,
  JurisdictionFilterOptions,
} from "@/types/jurisdiction"

/**
 * Convert a slug to a display name.
 * "harris-county" → "Harris County"
 * "district-of-columbia" → "District Of Columbia"
 */
export function slugToDisplayName(slug: string): string

/**
 * Convert a state slug to its 2-letter postal abbreviation.
 * "alabama" → "AL", "district-of-columbia" → "DC"
 * Returns null if slug is not recognized.
 * Implement with a hardcoded Record<string, string> map for all 51 slugs.
 */
export function stateSlugToAbbr(slug: string): string | null

/**
 * Find a state by its slug. Returns undefined if not found.
 */
export function findState(
  data: JurisdictionState[],
  stateSlug: string | null | undefined
): JurisdictionState | undefined

/**
 * Find a county by state slug + county slug. Returns undefined if not found.
 */
export function findCounty(
  data: JurisdictionState[],
  stateSlug: string | null | undefined,
  countySlug: string | null | undefined
): JurisdictionCounty | undefined

/**
 * Get the best available phone number for a county.
 * Prefers county.quickReference.Phone over county.courthouse.phones[0].
 * Returns null if neither is available.
 */
export function getPrimaryPhone(county: JurisdictionCounty): string | null

/**
 * Get the best available court website URL for a county.
 * Uses county.courthouse.websites[0].
 * Does NOT use county.quickReference.Website (often plain text, not a URL).
 * Returns null if not available.
 */
export function getPrimaryWebsite(county: JurisdictionCounty): string | null

/**
 * Clean a URL string that may have trailing scraped punctuation.
 * "https://example.com/)." → "https://example.com/"
 * Returns null if input is null/undefined/empty or does not start with "http".
 */
export function cleanUrl(raw: string | null | undefined): string | null

/**
 * Extract the domain name from a URL for display as a label.
 * "https://www.jeffcoprobatecourt.com/home/forms/" → "jeffcoprobatecourt.com"
 * Returns the full input string if URL parsing fails.
 */
export function urlToDisplayLabel(url: string): string

/**
 * Convert a camelCase key to Title Case with spaces.
 * "lettersTestamentary" → "Letters Testamentary"
 * "noticePublication" → "Notice Publication"
 */
export function camelToTitleCase(str: string): string

/**
 * Filter the full jurisdiction data array.
 * Returns a NEW array — does not mutate the input.
 *
 * Logic:
 * 1. If stateSlug is set: only include that state
 * 2. For each state, filter its counties:
 *    - If query is non-empty: slugToDisplayName(county.slug) or state display name
 *      must contain the query (case-insensitive)
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
