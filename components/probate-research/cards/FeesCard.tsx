"use client"

import { useState } from "react"

type Props = {
  fees: string[]
}

export function FeesCard({ fees }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  if (fees.length === 0) return null

  const toggleExpand = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
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
        {fees.map((value, i) => {
          const isExpanded = expanded.has(i)
          const isLong = value.length > 120

          return (
            <div key={i}>
              <div className="py-2">
                <p className="text-sm text-[#1a1a2e]">
                  {isExpanded || !isLong ? value : `${value.slice(0, 120)}…`}
                </p>
                {isLong && (
                  <button
                    onClick={() => toggleExpand(i)}
                    className="text-xs text-[#7c6fc4] hover:underline mt-0.5"
                  >
                    {isExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
              {i < fees.length - 1 && <hr className="border-[#f0f0f0]" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
