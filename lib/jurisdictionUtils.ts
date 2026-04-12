import type {
  JurisdictionState,
  JurisdictionCounty,
  JurisdictionFilterOptions,
} from "@/types/jurisdiction"

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

/**
 * Convert a slug to a display name.
 * "harris-county" → "Harris County"
 */
export function slugToDisplayName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/**
 * Convert a state slug to its 2-letter postal abbreviation.
 * Returns null if slug is not recognized.
 */
export function stateSlugToAbbr(slug: string): string | null {
  return STATE_ABBR[slug] ?? null
}

/**
 * Find a state by its slug. Returns undefined if not found.
 */
export function findState(
  data: JurisdictionState[],
  stateSlug: string | null | undefined
): JurisdictionState | undefined {
  if (!stateSlug) return undefined
  return data.find((s) => s.slug === stateSlug)
}

/**
 * Find a county by state slug + county slug. Returns undefined if not found.
 */
export function findCounty(
  data: JurisdictionState[],
  stateSlug: string | null | undefined,
  countySlug: string | null | undefined
): JurisdictionCounty | undefined {
  if (!stateSlug || !countySlug) return undefined
  const state = findState(data, stateSlug)
  return state?.counties.find((c) => c.slug === countySlug)
}

/**
 * Get the best available phone number for a county.
 * Uses county.courthouse.phone.
 */
export function getPrimaryPhone(county: JurisdictionCounty): string | null {
  return county.courthouse?.phone ?? null
}

/**
 * Get the best available fax number for a county.
 * Uses county.courthouse.fax.
 */
export function getPrimaryFax(county: JurisdictionCounty): string | null {
  return county.courthouse?.fax ?? null
}

/**
 * Clean a URL string that may have trailing scraped punctuation.
 * "https://example.com/)." → "https://example.com/"
 * Returns null if input is null/undefined/empty or does not start with "http".
 */
export function cleanUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed.startsWith("http")) return null
  return trimmed.replace(/[).]+$/, "")
}

/**
 * Extract the domain name from a URL for display as a label.
 * "https://www.jeffcoprobatecourt.com/home/forms/" → "jeffcoprobatecourt.com"
 * Returns the full input string if URL parsing fails.
 */
export function urlToDisplayLabel(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

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

/**
 * Convert a camelCase key to Title Case with spaces.
 * "lettersTestamentary" → "Letters Testamentary"
 */
export function camelToTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim()
}

/**
 * Filter the full jurisdiction data array.
 * Returns a NEW array — does not mutate the input.
 *
 * Logic:
 * 1. If stateSlug is set: only include that state
 * 2. For each state, filter its counties by query and/or efilingFilter
 * 3. Exclude states where all counties were filtered out (unless stateSlug is set)
 * 4. Return filtered states with their filtered county arrays
 */
export function filterJurisdictions(
  data: JurisdictionState[],
  options: JurisdictionFilterOptions
): JurisdictionState[] {
  const { query, stateSlug, efilingFilter } = options
  const lowerQuery = query.toLowerCase().trim()

  const states = stateSlug ? data.filter((s) => s.slug === stateSlug) : data

  return states.reduce<JurisdictionState[]>((acc, state) => {
    const stateDisplayName = slugToDisplayName(state.slug).toLowerCase()

    const filteredCounties = state.counties.filter((county) => {
      if (lowerQuery) {
        const countyDisplayName = slugToDisplayName(county.slug).toLowerCase()
        const matchesQuery =
          countyDisplayName.includes(lowerQuery) ||
          stateDisplayName.includes(lowerQuery)
        if (!matchesQuery) return false
      }

      if (efilingFilter) {
        if (efilingFilter === "required" && county.efilingRequired !== true) return false
        if (efilingFilter === "not-required" && county.efilingRequired !== false) return false
        if (efilingFilter === "unknown" && county.efilingRequired !== null) return false
      }

      return true
    })

    if (filteredCounties.length > 0) {
      acc.push({ ...state, counties: filteredCounties })
    }

    return acc
  }, [])
}
