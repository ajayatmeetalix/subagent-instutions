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
  smallEstateThreshold: string  // Formatted string, e.g. "$47,000"
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
  fees: string[] | null
  paymentMethods: string | null
  estimatedTimelines: string[] | null
  efilingRequired: boolean | null  // null = unknown
  efilingPortal: string | null     // ⚠️ May have trailing punctuation — use cleanUrl()
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
  hours?: string           // May have "Hours: " prefix — strip it
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
