"use client"

import { useRef, useEffect, useState } from "react"
import { Search, ArrowLeft, Map } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { ReadonlyURLSearchParams } from "next/navigation"

type Props = {
  searchParams: ReadonlyURLSearchParams
  setParam: (key: string, value: string) => void
}

export function InstitutionFilters({ searchParams, setParam }: Props) {
  const q = searchParams.get("q") ?? ""
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

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e5e5e5] bg-white flex-shrink-0">
      <a
        href="/"
        className="flex items-center gap-1.5 text-sm text-[#6b675f] hover:text-[#1a1a2e] transition-colors mr-1"
      >
        <ArrowLeft size={15} />
        <span className="whitespace-nowrap">Estate Manager</span>
      </a>
      <div className="w-px h-5 bg-[#e5e5e5]" />
      <a
        href="/probate-research"
        className="flex items-center gap-1.5 text-sm text-[#6b675f] hover:text-[#1a1a2e] transition-colors"
      >
        <Map size={15} />
        <span className="whitespace-nowrap">Probate Research</span>
      </a>
      <div className="w-px h-5 bg-[#e5e5e5]" />
      <div className="relative w-80">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9b9b] pointer-events-none"
        />
        <Input
          placeholder="Search institutions…"
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm border-[#e5e5e5] bg-white text-[#1a1a2e] placeholder:text-[#9b9b9b]"
        />
      </div>
      <div className="flex items-center gap-1.5 ml-auto">
        <span className="text-xs text-[#9b9b9b]">Institution Guide</span>
        <span className="text-xs text-[#d0d0d0]">·</span>
        <span className="text-xs text-[#9b9b9b]">160 institutions</span>
      </div>
    </div>
  )
}
