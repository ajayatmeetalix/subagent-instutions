import { formatProse } from "@/lib/jurisdictionUtils"

type Props = {
  overview: string
}

export function OverviewCard({ overview }: Props) {
  const paragraphs = formatProse(overview)
  if (paragraphs.length === 0) return null

  return (
    <div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">
      <p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide mb-3">
        Overview
      </p>
      <div className="flex flex-col gap-2">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-[#3d3d3d] leading-relaxed">{p}</p>
        ))}
      </div>
    </div>
  )
}
