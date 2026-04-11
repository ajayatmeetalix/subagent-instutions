type Props = {
  overview: string
}

export function OverviewCard({ overview }: Props) {
  if (!overview.trim()) return null

  return (
    <div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">
      <p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide mb-3">
        Overview
      </p>
      <p className="text-sm text-[#3d3d3d] leading-relaxed">{overview}</p>
    </div>
  )
}
