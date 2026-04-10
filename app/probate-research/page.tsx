"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useMemo } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import rawData from "../../swiftprobate_full.json"
import type { JurisdictionState } from "@/types/jurisdiction"
import { filterJurisdictions, findState, findCounty } from "@/lib/jurisdictionUtils"
import { ResearchFilters } from "@/components/probate-research/ResearchFilters"
import { StateCountyList } from "@/components/probate-research/StateCountyList"
import { CountyDetailPanel } from "@/components/probate-research/CountyDetailPanel"
import type { EfilingFilter } from "@/types/jurisdiction"

const jurisdictionData = rawData as JurisdictionState[]

export default function ProbateResearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const q = searchParams.get("q") ?? ""
  const stateSlug = searchParams.get("state") ?? ""
  const countySlug = searchParams.get("county") ?? ""
  const efilingFilter = (searchParams.get("efiling") ?? null) as EfilingFilter | null

  const filteredData = useMemo(
    () =>
      filterJurisdictions(jurisdictionData, {
        query: q,
        stateSlug: stateSlug || null,
        efilingFilter,
      }),
    [q, stateSlug, efilingFilter]
  )

  const selectedState = findState(jurisdictionData, stateSlug || null)
  const selectedCounty = findCounty(jurisdictionData, stateSlug || null, countySlug || null)

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`/probate-research?${params.toString()}`, { scroll: false })
  }

  // Set multiple params at once — pass null to delete a key
  const setParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value !== null && value !== "") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }
    router.replace(`/probate-research?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8f7f5]">
      <ResearchFilters
        jurisdictionData={jurisdictionData}
        searchParams={searchParams}
        setParam={setParam}
        setParams={setParams}
      />
      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <Panel
          defaultSize={25}
          minSize={20}
          maxSize={35}
          className="border-r border-[#e5e5e5]"
        >
          <StateCountyList
            filteredData={filteredData}
            selectedStateSlug={stateSlug}
            selectedCountySlug={countySlug}
            hasActiveSearch={q.length > 0}
            setParam={setParam}
            setParams={setParams}
          />
        </Panel>
        <PanelResizeHandle className="w-px bg-[#e5e5e5] hover:bg-[#7c6fc4] transition-colors cursor-col-resize" />
        <Panel defaultSize={75}>
          <CountyDetailPanel
            jurisdictionData={jurisdictionData}
            selectedState={selectedState}
            selectedCounty={selectedCounty}
          />
        </Panel>
      </PanelGroup>
    </div>
  )
}
