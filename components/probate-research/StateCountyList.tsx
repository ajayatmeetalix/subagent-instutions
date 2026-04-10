"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, SearchX, Zap } from "lucide-react"
import * as Collapsible from "@radix-ui/react-collapsible"
import * as ScrollArea from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"
import { slugToDisplayName } from "@/lib/jurisdictionUtils"
import type { JurisdictionState } from "@/types/jurisdiction"

type Props = {
  filteredData: JurisdictionState[]
  selectedStateSlug: string
  selectedCountySlug: string
  hasActiveSearch: boolean
  setParam: (key: string, value: string) => void
  setParams: (updates: Record<string, string | null>) => void
}

export function StateCountyList({
  filteredData,
  selectedStateSlug,
  selectedCountySlug,
  hasActiveSearch,
  setParam,
  setParams,
}: Props) {
  const [expandedStates, setExpandedStates] = useState<Set<string>>(
    () => new Set(selectedStateSlug ? [selectedStateSlug] : [])
  )

  // When search is active, expand all visible states
  useEffect(() => {
    if (hasActiveSearch) {
      setExpandedStates(new Set(filteredData.map((s) => s.slug)))
    }
  }, [hasActiveSearch, filteredData])

  // When a state param is set externally, expand it
  useEffect(() => {
    if (selectedStateSlug) {
      setExpandedStates((prev) => {
        if (prev.has(selectedStateSlug)) return prev
        const next = new Set(prev)
        next.add(selectedStateSlug)
        return next
      })
    }
  }, [selectedStateSlug])

  const toggleState = (slug: string) => {
    setExpandedStates((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      return next
    })
  }

  const selectCounty = (stateSlug: string, countySlug: string) => {
    setParams({ state: stateSlug, county: countySlug })
  }

  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-[#9b9b9b]">
        <SearchX size={32} className="mb-3" />
        <p className="text-sm">No counties match your search</p>
      </div>
    )
  }

  return (
    <ScrollArea.Root className="h-full">
      <ScrollArea.Viewport className="h-full w-full">
        <div className="py-2">
          {filteredData.map((state) => {
            const isExpanded = expandedStates.has(state.slug)
            const isStateSelected = selectedStateSlug === state.slug

            return (
              <Collapsible.Root
                key={state.slug}
                open={isExpanded}
                onOpenChange={() => toggleState(state.slug)}
              >
                <Collapsible.Trigger asChild>
                  <button
                    className={cn(
                      "flex items-center w-full px-3 py-2 text-sm hover:bg-[#f0f0f0] transition-colors text-left",
                      isStateSelected && !selectedCountySlug && "bg-[#f0f0f0]"
                    )}
                    onClick={() => setParam("state", state.slug)}
                  >
                    {isExpanded ? (
                      <ChevronDown size={14} className="mr-2 text-[#9b9b9b] shrink-0" />
                    ) : (
                      <ChevronRight size={14} className="mr-2 text-[#9b9b9b] shrink-0" />
                    )}
                    <span className="flex-1 font-medium text-[#1a1a2e]">
                      {slugToDisplayName(state.slug)}
                    </span>
                    <span className="text-xs text-[#9b9b9b] ml-2">
                      ({state.counties.length})
                    </span>
                  </button>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  {state.counties.map((county) => {
                    const isSelected =
                      isStateSelected && selectedCountySlug === county.slug

                    return (
                      <button
                        key={county.slug}
                        onClick={() => selectCounty(state.slug, county.slug)}
                        className={cn(
                          "flex items-center w-full pl-8 pr-3 py-1.5 text-sm transition-colors text-left",
                          isSelected
                            ? "bg-[#7c6fc4] text-white"
                            : "text-[#3d3d3d] hover:bg-[#f0f0f0]"
                        )}
                      >
                        <span className="flex-1">{slugToDisplayName(county.slug)}</span>
                        {county.efilingRequired === true && (
                          <Zap
                            size={12}
                            className={cn(
                              "ml-1 shrink-0",
                              isSelected ? "text-white" : "text-green-600"
                            )}
                          />
                        )}
                      </button>
                    )
                  })}
                </Collapsible.Content>
              </Collapsible.Root>
            )
          })}
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
