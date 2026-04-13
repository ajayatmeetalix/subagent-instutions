"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, SearchX } from "lucide-react"
import * as Collapsible from "@radix-ui/react-collapsible"
import * as ScrollArea from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils"
import type { InstitutionGroup } from "@/types/institution"

type Props = {
  filteredGroups: InstitutionGroup[]
  selectedCategorySlug: string
  selectedInstitutionSlug: string
  hasActiveSearch: boolean
  setParams: (updates: Record<string, string | null>) => void
}

export function InstitutionList({
  filteredGroups,
  selectedCategorySlug,
  selectedInstitutionSlug,
  hasActiveSearch,
  setParams,
}: Props) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(selectedCategorySlug ? [selectedCategorySlug] : [])
  )

  useEffect(() => {
    if (hasActiveSearch) {
      setExpandedCategories(new Set(filteredGroups.map((g) => g.categorySlug)))
    }
  }, [hasActiveSearch, filteredGroups])

  useEffect(() => {
    if (selectedCategorySlug) {
      setExpandedCategories((prev) => {
        if (prev.has(selectedCategorySlug)) return prev
        const next = new Set(prev)
        next.add(selectedCategorySlug)
        return next
      })
    }
  }, [selectedCategorySlug])

  const toggleCategory = (slug: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      return next
    })
  }

  const selectInstitution = (categorySlug: string, institutionSlug: string) => {
    setParams({ category: categorySlug, institution: institutionSlug })
  }

  if (filteredGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-[#9b9b9b]">
        <SearchX size={32} className="mb-3" />
        <p className="text-sm">No institutions match your search</p>
      </div>
    )
  }

  return (
    <ScrollArea.Root className="h-full">
      <ScrollArea.Viewport className="h-full w-full">
        <div className="py-2">
          {filteredGroups.map((group) => {
            const isExpanded = expandedCategories.has(group.categorySlug)
            const isCategorySelected =
              selectedCategorySlug === group.categorySlug && !selectedInstitutionSlug

            return (
              <Collapsible.Root
                key={group.categorySlug}
                open={isExpanded}
                onOpenChange={() => toggleCategory(group.categorySlug)}
              >
                <Collapsible.Trigger asChild>
                  <button
                    className={cn(
                      "flex items-center w-full px-3 py-2 text-sm hover:bg-[#f0f0f0] transition-colors text-left",
                      isCategorySelected && "bg-[#f0f0f0]"
                    )}
                    onClick={() =>
                      setParams({ category: group.categorySlug, institution: null })
                    }
                  >
                    {isExpanded ? (
                      <ChevronDown size={14} className="mr-2 text-[#9b9b9b] shrink-0" />
                    ) : (
                      <ChevronRight size={14} className="mr-2 text-[#9b9b9b] shrink-0" />
                    )}
                    <span className="flex-1 font-medium text-[#1a1a2e]">
                      {group.category}
                    </span>
                    <span className="text-xs text-[#9b9b9b] ml-2">
                      ({group.institutions.length})
                    </span>
                  </button>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  {group.institutions.map((inst) => {
                    const isSelected =
                      selectedCategorySlug === group.categorySlug &&
                      selectedInstitutionSlug === inst.slug

                    return (
                      <button
                        key={inst.slug}
                        onClick={() => selectInstitution(group.categorySlug, inst.slug)}
                        className={cn(
                          "flex items-center w-full pl-8 pr-3 py-1.5 text-sm transition-colors text-left",
                          isSelected
                            ? "bg-[#7c6fc4] text-white"
                            : "text-[#3d3d3d] hover:bg-[#f0f0f0]"
                        )}
                      >
                        <span className="flex-1 truncate">{inst.institution_name}</span>
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
