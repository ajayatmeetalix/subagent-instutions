"use client"

import { Building2, ExternalLink, CalendarDays } from "lucide-react"
import * as ScrollArea from "@radix-ui/react-scroll-area"
import { ContactCard } from "./cards/ContactCard"
import { ProseCard } from "./cards/ProseCard"
import { TableCard } from "./cards/TableCard"
import { FAQsCard } from "./cards/FAQsCard"
import { cleanUrl } from "@/lib/institutionUtils"
import type { Institution } from "@/types/institution"

type Props = {
  selectedInstitution: Institution | undefined
}

export function InstitutionDetailPanel({ selectedInstitution }: Props) {
  if (!selectedInstitution) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#9b9b9b]">
        <Building2 size={40} className="mb-4" />
        <p className="text-sm">Select an institution to view its guide</p>
      </div>
    )
  }

  const inst = selectedInstitution
  const sourceUrl = cleanUrl(inst.url)

  return (
    <ScrollArea.Root className="h-full">
      <ScrollArea.Viewport className="h-full w-full">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#1a1a2e]">
                {inst.institution_name}
              </h2>
              <p className="text-sm text-[#6b675f] mt-0.5">{inst.category}</p>
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#7c6fc4] hover:underline inline-flex items-center gap-1 mt-1"
                >
                  View on SwiftProbate <ExternalLink size={11} />
                </a>
              )}
            </div>
            {inst.last_updated && (
              <div className="flex items-center gap-1.5 text-xs text-[#9b9b9b] shrink-0 mt-1">
                <CalendarDays size={12} />
                <span>Updated {inst.last_updated}</span>
              </div>
            )}
          </div>
          <hr className="border-[#e5e5e5] mt-4" />
        </div>

        {/* Cards */}
        <div className="px-6 pb-6 flex flex-col gap-4">
          <ContactCard institution={inst} />

          <ProseCard label="Overview" text={inst.overview} />

          <ProseCard label="Notification Process" text={inst.notification_process} />

          <TableCard label="Required Documents" raw={inst.required_docs_table} />

          <TableCard label="Document Checklist" raw={inst.document_checklist_table} />

          <TableCard label="Account Types" raw={inst.account_types_table} />

          <TableCard label="Timelines" raw={inst.timelines_table} />

          {inst.state_table && (
            <TableCard label="State Considerations" raw={inst.state_table} />
          )}

          <ProseCard label="Tips &amp; Pitfalls" text={inst.tips_and_pitfalls} />

          <FAQsCard faq={inst.faq} />
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        orientation="vertical"
        className="flex select-none touch-none p-0.5 w-2 bg-transparent transition-colors hover:bg-[#f0f0f0]"
      >
        <ScrollArea.Thumb className="flex-1 bg-[#d0d0d0] rounded-full relative" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
}
