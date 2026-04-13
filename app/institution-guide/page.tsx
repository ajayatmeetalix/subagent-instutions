"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useMemo } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import rawData from "../../swiftprobate_institutions.json"
import type { Institution } from "@/types/institution"
import { filterInstitutions, findInstitution } from "@/lib/institutionUtils"
import { InstitutionFilters } from "@/components/institution-guide/InstitutionFilters"
import { InstitutionList } from "@/components/institution-guide/InstitutionList"
import { InstitutionDetailPanel } from "@/components/institution-guide/InstitutionDetailPanel"

const institutionData = rawData as Institution[]

export default function InstitutionGuidePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const q = searchParams.get("q") ?? ""
  const categorySlug = searchParams.get("category") ?? ""
  const institutionSlug = searchParams.get("institution") ?? ""

  const filteredGroups = useMemo(
    () =>
      filterInstitutions(institutionData, {
        query: q,
        categorySlug: categorySlug || null,
      }),
    [q, categorySlug]
  )

  const selectedInstitution = findInstitution(institutionData, institutionSlug || null)

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`/institution-guide?${params.toString()}`, { scroll: false })
  }

  const setParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value !== null && value !== "") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }
    router.replace(`/institution-guide?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8f7f5]">
      <InstitutionFilters
        searchParams={searchParams}
        setParam={setParam}
      />
      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <Panel
          defaultSize={25}
          minSize={20}
          maxSize={35}
          className="border-r border-[#e5e5e5]"
        >
          <InstitutionList
            filteredGroups={filteredGroups}
            selectedCategorySlug={categorySlug}
            selectedInstitutionSlug={institutionSlug}
            hasActiveSearch={q.length > 0}
            setParams={setParams}
          />
        </Panel>
        <PanelResizeHandle className="w-px bg-[#e5e5e5] hover:bg-[#7c6fc4] transition-colors cursor-col-resize" />
        <Panel defaultSize={75}>
          <InstitutionDetailPanel selectedInstitution={selectedInstitution} />
        </Panel>
      </PanelGroup>
    </div>
  )
}
