export type JurisdictionData = JurisdictionState[]

export type JurisdictionState = {
  name: string
  abbr: string | null
  slug: string
  url: string
  smallEstateThreshold: string | null
  timeline: string | null
  countyCount: number | null
  quickReference: StateQuickReference | null
  overviewSnippet: string
  counties: JurisdictionCounty[]
}

export type StateQuickReference = {
  smallEstateThreshold: string
  filingDeadline: string
  creditorClaimPeriod: string
}

export type JurisdictionCounty = {
  name: string
  slug: string
  url: string
  stateSlug: string
  timeline: string | null
  filingFee: string | null
  courthouse: CountyCourthouse
  fees: Record<string, string> | null
  timelines: Record<string, string> | null
  newspapers: string[]
  efilingRequired: boolean | null
  efilingPortal: string | null
  resources: CountyResource[]
  quickReference: CountyQuickReference
  faqs: CountyFaq[]
}

export type CountyCourthouse = {
  phones: string[]
  websites: string[]
  hours: string
  judges: string[]
}

export type CountyResource = {
  label: string
  url: string
}

export type CountyQuickReference = {
  Courthouse?: string
  Phone?: string
  Website?: string
  [key: string]: string | undefined
}

export type CountyFaq = {
  question: string
  answer: string
}

export type EfilingFilter = "required" | "not-required" | "unknown"

export type JurisdictionFilterOptions = {
  query: string
  stateSlug: string | null
  efilingFilter: EfilingFilter | null
}
