"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import * as Collapsible from "@radix-ui/react-collapsible"
import type { CountyFaq } from "@/types/jurisdiction"

type Props = {
  faqs: CountyFaq[]
}

export function FAQsCard({ faqs }: Props) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  if (faqs.length === 0) return null

  const toggle = (idx: number) => {
    setOpenItems((prev) => {
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
        FAQs
      </p>
      <div className="flex flex-col">
        {faqs.map((faq, i) => {
          const isOpen = openItems.has(i)
          return (
            <div key={i}>
              <Collapsible.Root open={isOpen} onOpenChange={() => toggle(i)}>
                <Collapsible.Trigger asChild>
                  <button className="flex items-start gap-2 w-full py-2 text-left hover:text-[#7c6fc4] transition-colors group">
                    {isOpen
                      ? <ChevronDown size={14} className="shrink-0 mt-0.5 text-[#9b9b9b] group-hover:text-[#7c6fc4]" />
                      : <ChevronRight size={14} className="shrink-0 mt-0.5 text-[#9b9b9b] group-hover:text-[#7c6fc4]" />
                    }
                    <span className="text-sm font-medium text-[#1a1a2e] group-hover:text-[#7c6fc4]">
                      {faq.question}
                    </span>
                  </button>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <p className="text-sm text-[#3d3d3d] pl-6 pb-2 leading-relaxed">{faq.answer}</p>
                </Collapsible.Content>
              </Collapsible.Root>
              {i < faqs.length - 1 && <hr className="border-[#f0f0f0]" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
