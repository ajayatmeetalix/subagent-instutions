"use client"

import { useState } from "react"
import { camelToTitleCase } from "@/lib/jurisdictionUtils"

type Props = {
  fees: Record<string, string>
}

const FEE_LABEL_MAP: Record<string, string> = {
  smallEstate: "Small / Summary Estate",
  probateOfWill: "Probate of Will",
  lettersTestamentary: "Letters Testamentary",
  noticePublication: "Notice of Publication",
}

function feeLabel(key: string): string {
  return FEE_LABEL_MAP[key] ?? camelToTitleCase(key)
}

export function FeesCard({ fees }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const entries = Object.entries(fees)
  if (entries.length === 0) return null

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">
      <p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide mb-3">
        Fees
      </p>
      <div className="flex flex-col">
        {entries.map(([key, value], i) => {
          const isExpanded = expanded.has(key)
          const isLong = value.length > 120

          return (
            <div key={key}>
              <div className="py-2">
                <p className="text-xs text-[#6b675f] mb-0.5">{feeLabel(key)}</p>
                <p className="text-sm text-[#1a1a2e]">
                  {isExpanded || !isLong ? value : `${value.slice(0, 120)}…`}
                </p>
                {isLong && (
                  <button
                    onClick={() => toggleExpand(key)}
                    className="text-xs text-[#7c6fc4] hover:underline mt-0.5"
                  >
                    {isExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
              {i < entries.length - 1 && <hr className="border-[#f0f0f0]" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
