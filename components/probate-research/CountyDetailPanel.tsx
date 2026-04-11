"use client"

import { MapPin, ExternalLink, Zap, CalendarDays } from "lucide-react"
import * as ScrollArea from "@radix-ui/react-scroll-area"
import { slugToDisplayName, stateSlugToAbbr, cleanUrl } from "@/lib/jurisdictionUtils"
import { QuickReferenceCard } from "./cards/QuickReferenceCard"
import { OverviewCard } from "./cards/OverviewCard"
import { FeesCard } from "./cards/FeesCard"
import { TimelinesCard } from "./cards/TimelinesCard"
import { CourthouseCard } from "./cards/CourthouseCard"
import { FilingStepsCard } from "./cards/FilingStepsCard"
import { FormsCard } from "./cards/FormsCard"
import { FAQsCard } from "./cards/FAQsCard"
import { LocalRequirementsCard } from "./cards/LocalRequirementsCard"
import { ResourcesCard } from "./cards/ResourcesCard"
import { EfilingChip } from "./cards/EfilingChip"
import type { JurisdictionState, JurisdictionCounty } from "@/types/jurisdiction"

type Props = {
  jurisdictionData: JurisdictionState[]
  selectedState: JurisdictionState | undefined
  selectedCounty: JurisdictionCounty | undefined
}

export function CountyDetailPanel({ selectedState, selectedCounty }: Props) {
  if (!selectedCounty || !selectedState) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#9b9b9b]">
        <MapPin size={40} className="mb-4" />
        <p className="text-sm">Select a county to view probate details</p>
      </div>
    )
  }

  const abbr = stateSlugToAbbr(selectedState.slug)
  const efilingPortalUrl = cleanUrl(selectedCounty.efilingPortal)
  const hasEfilingInfo =
    selectedCounty.efilingRequired !== null || !!selectedCounty.efilingPortal
  const hasFees = (selectedCounty.fees?.length ?? 0) > 0
  const hasTimelines = (selectedCounty.estimatedTimelines?.length ?? 0) > 0

  return (
    <ScrollArea.Root className="h-full">
      <ScrollArea.Viewport className="h-full w-full">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#1a1a2e]">
                {slugToDisplayName(selectedCounty.slug)}
              </h2>
              <p className="text-sm text-[#6b675f] mt-0.5">
                {slugToDisplayName(selectedState.slug)}
                {abbr ? ` · ${abbr}` : ""}
              </p>
              <a
                href={selectedCounty.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#7c6fc4] hover:underline inline-flex items-center gap-1 mt-1"
              >
                View on SwiftProbate <ExternalLink size={11} />
              </a>
            </div>
            {selectedCounty.lastUpdated && (
              <div className="flex items-center gap-1.5 text-xs text-[#9b9b9b] shrink-0 mt-1">
                <CalendarDays size={12} />
                <span>Updated {selectedCounty.lastUpdated}</span>
              </div>
            )}
          </div>
          <hr className="border-[#e5e5e5] mt-4" />
        </div>

        {/* Cards */}
        <div className="px-6 pb-6 flex flex-col gap-4">
          {selectedState.quickReference && (
            <QuickReferenceCard state={selectedState} />
          )}

          {selectedCounty.overview && (
            <OverviewCard overview={selectedCounty.overview} />
          )}

          {hasFees && <FeesCard fees={selectedCounty.fees!} />}

          {hasTimelines && <TimelinesCard timelines={selectedCounty.estimatedTimelines!} />}

          <CourthouseCard county={selectedCounty} />

          {/* E-Filing section */}
          {hasEfilingInfo && (
            <div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">
              <p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide mb-3">
                E-Filing
              </p>
              <div className="flex items-center flex-wrap gap-2">
                <EfilingChip efilingRequired={selectedCounty.efilingRequired} variant="full" />
                {selectedCounty.efilingRequired === true && efilingPortalUrl && (
                  <a
                    href={efilingPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#7c6fc4] hover:underline inline-flex items-center gap-1"
                  >
                    E-Filing Portal <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          )}

          {(selectedCounty.filingSteps?.length ?? 0) > 0 && (
            <FilingStepsCard steps={selectedCounty.filingSteps!} />
          )}

          <LocalRequirementsCard
            localRequirements={selectedCounty.localRequirements ?? null}
            paymentMethods={selectedCounty.paymentMethods ?? null}
            publicationNewspaper={selectedCounty.publicationNewspaper ?? null}
          />

          {(selectedCounty.forms?.length ?? 0) > 0 && (
            <FormsCard forms={selectedCounty.forms!} />
          )}

          {selectedCounty.faqs.length > 0 && (
            <FAQsCard faqs={selectedCounty.faqs} />
          )}

          {selectedCounty.resources.length > 0 && (
            <ResourcesCard resources={selectedCounty.resources} />
          )}
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
