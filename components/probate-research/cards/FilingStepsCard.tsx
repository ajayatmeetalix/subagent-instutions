import type { CountyFilingStep } from "@/types/jurisdiction"

type Props = {
  steps: CountyFilingStep[]
}

export function FilingStepsCard({ steps }: Props) {
  if (steps.length === 0) return null

  return (
    <div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">
      <p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide mb-3">
        Filing Steps
      </p>
      <ol className="flex flex-col gap-3">
        {steps.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#f0f0f0] text-[#6b675f] text-xs font-semibold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-[#1a1a2e]">{item.step}</p>
              {item.detail && (
                <p className="text-xs text-[#6b675f] mt-0.5 leading-relaxed">{item.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
