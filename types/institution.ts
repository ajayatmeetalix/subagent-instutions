export type Institution = {
  slug: string
  url: string
  error: string
  page_title: string
  institution_name: string
  category: string
  last_updated: string
  estate_phone: string
  hours: string
  fax: string
  mailing_address: string
  overnight_address: string
  online_notification_url: string
  overview: string
  notification_process: string
  required_documents: string
  account_types: string
  state_considerations: string
  timelines: string
  tips_and_pitfalls: string
  faq: string
  required_docs_table: string
  document_checklist_table: string
  account_types_table: string
  timelines_table: string
  state_table: string
  always_required_docs: string
  full_page_text: string
}

export type InstitutionGroup = {
  category: string
  categorySlug: string
  institutions: Institution[]
}

export type InstitutionFilterOptions = {
  query: string
  categorySlug?: string | null
}

export type ParsedTable = {
  headers: string[]
  rows: string[][]
}
