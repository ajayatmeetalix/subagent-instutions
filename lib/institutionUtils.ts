import type {
  Institution,
  InstitutionGroup,
  InstitutionFilterOptions,
  ParsedTable,
} from "@/types/institution"

/**
 * Convert a category display name to a URL-safe slug.
 * "Life Insurance Companies" → "life-insurance-companies"
 * "Brokerages & Investment Firms" → "brokerages-investment-firms"
 */
export function categoryToSlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

/**
 * Group flat institution array by category, returning sorted groups.
 * Categories are sorted alphabetically; institutions within each group
 * are sorted alphabetically by institution_name.
 */
export function groupInstitutions(data: Institution[]): InstitutionGroup[] {
  const map = new Map<string, InstitutionGroup>()

  for (const inst of data) {
    const cat = inst.category || "Other"
    const slug = categoryToSlug(cat)
    if (!map.has(slug)) {
      map.set(slug, { category: cat, categorySlug: slug, institutions: [] })
    }
    map.get(slug)!.institutions.push(inst)
  }

  return Array.from(map.values())
    .sort((a, b) => a.category.localeCompare(b.category))
    .map((group) => ({
      ...group,
      institutions: [...group.institutions].sort((a, b) =>
        a.institution_name.localeCompare(b.institution_name)
      ),
    }))
}

/**
 * Filter the institution data by free-text query and/or category slug.
 * Returns grouped results matching the filters.
 */
export function filterInstitutions(
  data: Institution[],
  options: InstitutionFilterOptions
): InstitutionGroup[] {
  const { query, categorySlug } = options
  const lowerQuery = query.toLowerCase().trim()

  let filtered = data

  if (categorySlug) {
    filtered = filtered.filter((inst) => categoryToSlug(inst.category) === categorySlug)
  }

  if (lowerQuery) {
    filtered = filtered.filter(
      (inst) =>
        inst.institution_name.toLowerCase().includes(lowerQuery) ||
        inst.category.toLowerCase().includes(lowerQuery)
    )
  }

  return groupInstitutions(filtered)
}

/**
 * Find a single institution by its slug.
 */
export function findInstitution(
  data: Institution[],
  slug: string | null | undefined
): Institution | undefined {
  if (!slug) return undefined
  return data.find((inst) => inst.slug === slug)
}

/**
 * Parse a pipe-delimited table string into headers and rows.
 *
 * Format: "Col1 | Col2 || Val1 | Val2 || Val3 | Val4"
 * - "||" separates rows
 * - "|" separates columns within a row
 * - The first row is treated as the header
 * - Duplicate header rows mid-table (sub-section headers) are omitted
 *
 * Returns null if the input is empty or unparseable.
 */
export function parseTable(raw: string | null | undefined): ParsedTable | null {
  if (!raw?.trim()) return null

  const rawRows = raw
    .split("||")
    .map((row) => row.split("|").map((cell) => cell.trim()).filter((cell) => cell.length > 0))
    .filter((row) => row.length > 0)

  if (rawRows.length === 0) return null

  const headers = rawRows[0]
  const headerKey = headers.join("|").toLowerCase()

  const rows = rawRows.slice(1).filter((row) => {
    // Skip rows that are duplicate headers (same text as the header row)
    const rowKey = row.join("|").toLowerCase()
    return rowKey !== headerKey
  })

  return { headers, rows }
}

/**
 * Normalize scraped prose where sentences are concatenated without spaces.
 * "death.Alabama" → "death. Alabama"
 * Returns an array of sentence-level paragraph strings.
 *
 * Strips a leading section title if the prose starts with one
 * (e.g. "Overview JPMorgan Chase is the largest..." → strips "Overview").
 */
export function formatProse(text: string | null | undefined): string[] {
  if (!text?.trim()) return []

  const normalized = text
    .replace(/([.!?])([A-Z])/g, "$1 $2")
    .trim()

  const sentences = normalized.match(/[^.!?]*[.!?]+/g) ?? [normalized]
  return sentences.map((s) => s.trim()).filter((s) => s.length > 0)
}

/**
 * Clean a URL string that may have trailing scraped punctuation.
 */
export function cleanUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed.startsWith("http")) return null
  return trimmed.replace(/[).]+$/, "")
}
