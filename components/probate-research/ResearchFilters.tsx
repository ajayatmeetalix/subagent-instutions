"use client"

import { useRef, useEffect, useState } from "react"
import { Search, ChevronDown, ChevronUp, Check } from "lucide-react"
import * as Select from "@radix-ui/react-select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { slugToDisplayName } from "@/lib/jurisdictionUtils"
import type { JurisdictionState } from "@/types/jurisdiction"
import type { ReadonlyURLSearchParams } from "next/navigation"

type Props = {
  jurisdictionData: JurisdictionState[]
  searchParams: ReadonlyURLSearchParams
  setParam: (key: string, value: string) => void
  setParams: (updates: Record<string, string | null>) => void
}

const ALL_SENTINEL = "__all__"

const EFILING_OPTIONS = [
  { value: ALL_SENTINEL, label: "All E-Filing" },
  { value: "required", label: "E-Filing Required" },
  { value: "not-required", label: "E-Filing Not Required" },
  { value: "unknown", label: "E-Filing Unknown" },
]

// Convert between URL param value ("" = all) and Select value (sentinel for "all")
function toSelectValue(param: string): string {
  return param === "" ? ALL_SENTINEL : param
}
function fromSelectValue(value: string): string {
  return value === ALL_SENTINEL ? "" : value
}

function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <Select.Item
      value={value}
      className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-[#1a1a2e] cursor-pointer rounded-md outline-none data-[highlighted]:bg-[#f0f0f0]"
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator>
        <Check size={14} className="text-[#7c6fc4]" />
      </Select.ItemIndicator>
    </Select.Item>
  )
}

export function ResearchFilters({ jurisdictionData, searchParams, setParam, setParams }: Props) {
  const q = searchParams.get("q") ?? ""
  const stateValue = searchParams.get("state") ?? ""
  const efilingValue = searchParams.get("efiling") ?? ""

  const [localSearch, setLocalSearch] = useState(q)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalSearch(q)
  }, [q])

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setParam("q", value)
    }, 200)
  }

  const sortedStates = [...jurisdictionData].sort((a, b) =>
    slugToDisplayName(a.slug).localeCompare(slugToDisplayName(b.slug))
  )

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e5e5e5] bg-white flex-shrink-0">
      {/* Search */}
      <div className="relative w-80">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9b9b] pointer-events-none"
        />
        <Input
          placeholder="Search states or counties…"
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm border-[#e5e5e5] bg-white text-[#1a1a2e] placeholder:text-[#9b9b9b]"
        />
      </div>

      {/* State Dropdown */}
      <Select.Root
        value={toSelectValue(stateValue)}
        onValueChange={(value) => {
          setParams({ state: fromSelectValue(value) || null, county: null })
        }}
      >
        <Select.Trigger
          className={cn(
            "flex items-center gap-2 h-9 px-3 text-sm rounded-md border border-[#e5e5e5] bg-white hover:border-[#d0d0d0] outline-none transition-colors min-w-[140px]",
            stateValue ? "text-[#1a1a2e]" : "text-[#9b9b9b]"
          )}
        >
          <Select.Value placeholder="All States" />
          <Select.Icon className="ml-auto">
            <ChevronDown size={14} className="text-[#9b9b9b]" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className="z-50 bg-white rounded-lg border border-[#e5e5e5] shadow-lg p-1 max-h-72 overflow-hidden"
            position="popper"
            sideOffset={4}
          >
            <Select.ScrollUpButton className="flex items-center justify-center py-1 text-[#9b9b9b]">
              <ChevronUp size={14} />
            </Select.ScrollUpButton>
              <Select.Viewport className="max-h-64 overflow-y-auto">
              <SelectItem value={ALL_SENTINEL}>All States</SelectItem>
              {sortedStates.map((state) => (
                <SelectItem key={state.slug} value={state.slug}>
                  {slugToDisplayName(state.slug)}
                </SelectItem>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="flex items-center justify-center py-1 text-[#9b9b9b]">
              <ChevronDown size={14} />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {/* E-Filing Dropdown */}
      <Select.Root
        value={toSelectValue(efilingValue)}
        onValueChange={(value) => setParam("efiling", fromSelectValue(value))}
      >
        <Select.Trigger
          className={cn(
            "flex items-center gap-2 h-9 px-3 text-sm rounded-md border border-[#e5e5e5] bg-white hover:border-[#d0d0d0] outline-none transition-colors min-w-[160px]",
            efilingValue ? "text-[#1a1a2e]" : "text-[#9b9b9b]"
          )}
        >
          <Select.Value placeholder="All E-Filing" />
          <Select.Icon className="ml-auto">
            <ChevronDown size={14} className="text-[#9b9b9b]" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className="z-50 bg-white rounded-lg border border-[#e5e5e5] shadow-lg p-1"
            position="popper"
            sideOffset={4}
          >
            <Select.Viewport>
              {EFILING_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}
