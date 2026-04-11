type Props = {
  timelines: string[]
}

export function TimelinesCard({ timelines }: Props) {
  if (timelines.length === 0) return null

  return (
    <div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">
      <p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide mb-3">
        Estimated Timelines
      </p>
      <div className="flex flex-col">
        {timelines.map((value, i) => (
          <div key={i}>
            <div className="py-2">
              <p className="text-sm text-[#1a1a2e]">{value}</p>
            </div>
            {i < timelines.length - 1 && <hr className="border-[#f0f0f0]" />}
          </div>
        ))}
      </div>
    </div>
  )
}
