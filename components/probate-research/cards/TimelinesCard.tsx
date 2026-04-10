import { camelToTitleCase } from "@/lib/jurisdictionUtils"

type Props = {
  timelines: Record<string, string>
}

const TIMELINE_LABEL_MAP: Record<string, string> = {
  independentAdmin: "Simple / Independent Administration",
  dependentAdmin: "Complex / Dependent Administration",
}

function timelineLabel(key: string): string {
  return TIMELINE_LABEL_MAP[key] ?? camelToTitleCase(key)
}

export function TimelinesCard({ timelines }: Props) {
  const entries = Object.entries(timelines)
  if (entries.length === 0) return null

  return (
    <div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">
      <p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide mb-3">
        Timelines
      </p>
      <div className="flex flex-col">
        {entries.map(([key, value], i) => (
          <div key={key}>
            <div className="py-2">
              <p className="text-xs text-[#6b675f] mb-0.5">{timelineLabel(key)}</p>
              <p className="text-sm text-[#1a1a2e]">{value}</p>
            </div>
            {i < entries.length - 1 && <hr className="border-[#f0f0f0]" />}
          </div>
        ))}
      </div>
    </div>
  )
}
