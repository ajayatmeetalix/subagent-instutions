"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import * as Collapsible from "@radix-ui/react-collapsible"

type QA = { question: string; answer: string }

function parseFAQs(raw: string | null | undefined): QA[] {
  if (!raw?.trim()) return []

  // Strip leading "Frequently Asked Questions" heading
  const text = raw.replace(/^Frequently Asked Questions\s*/i, "").trim()

  // Split into Q/A pairs by finding sentences ending in "?"
  // Strategy: split the text on "?" boundaries
  const parts = text.split(/\?(?=\s)/)
  const pairs: QA[] = []

  for (let i = 0; i < parts.length - 1; i++) {
    const question = parts[i].trim() + "?"
    // The answer is everything up to the next question mark
    // Clean up the question: it may have a preceding answer fragment at the start
    // (from the prior split), so we take only the last sentence as the question
    const sentences = question.split(/(?<=[.!])\s+/)
    const q = sentences[sentences.length - 1].trim()

    // The answer is the start of the next part, up to the next "?"
    const nextPart = parts[i + 1]
    const nextSentences = nextPart.split(/(?<=[.!])\s+/)
    // Answer: everything except the last fragment (which becomes next question)
    const answerSentences =
      i < parts.length - 2 ? nextSentences.slice(0, -1) : nextSentences
    const answer = answerSentences.join(" ").trim()

    if (q && answer) {
      pairs.push({ question: q, answer })
    }
  }

  return pairs
}

type Props = {
  faq: string | null | undefined
}

export function FAQsCard({ faq }: Props) {
  const pairs = parseFAQs(faq)
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  if (pairs.length === 0) return null

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
        {pairs.map((qa, i) => {
          const isOpen = openItems.has(i)
          return (
            <div key={i}>
              <Collapsible.Root open={isOpen} onOpenChange={() => toggle(i)}>
                <Collapsible.Trigger asChild>
                  <button className="flex items-start gap-2 w-full py-2 text-left hover:text-[#7c6fc4] transition-colors group">
                    {isOpen ? (
                      <ChevronDown
                        size={14}
                        className="shrink-0 mt-0.5 text-[#9b9b9b] group-hover:text-[#7c6fc4]"
                      />
                    ) : (
                      <ChevronRight
                        size={14}
                        className="shrink-0 mt-0.5 text-[#9b9b9b] group-hover:text-[#7c6fc4]"
                      />
                    )}
                    <span className="text-sm font-medium text-[#1a1a2e] group-hover:text-[#7c6fc4]">
                      {qa.question}
                    </span>
                  </button>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <p className="text-sm text-[#3d3d3d] pl-6 pb-2 leading-relaxed">
                    {qa.answer}
                  </p>
                </Collapsible.Content>
              </Collapsible.Root>
              {i < pairs.length - 1 && <hr className="border-[#f0f0f0]" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
