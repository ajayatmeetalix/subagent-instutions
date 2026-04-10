import type { JurisdictionState } from "@/types/jurisdiction"

type Props = {
  state: JurisdictionState
}

export function QuickReferenceCard({ state }: Props) {
  const qr = state.quickReference
  if (!qr) return null

  const rows = [
    { label: "Small Estate Threshold", value: qr.smallEstateThreshold },
    { label: "Filing Deadline", value: qr.filingDeadline },
    { label: "Creditor Claim Period", value: qr.creditorClaimPeriod },
  ]

  return (
    <div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide">
          Quick Reference
        </p>
        <span className="text-xs border border-[#e5e5e5] rounded-full px-2 py-0.5 text-[#6b675f]">
          State-wide
        </span>
      </div>
      <div className="flex flex-col divide-y divide-[#f0f0f0]">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between items-start py-1.5">
            <span className="text-sm text-[#6b675f]">{row.label}</span>
            <span className="text-sm font-medium text-[#1a1a2e] text-right ml-4">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
