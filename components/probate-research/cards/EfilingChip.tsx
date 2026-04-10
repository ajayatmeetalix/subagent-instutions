import { Zap } from "lucide-react"

type Props = {
  efilingRequired: boolean | null
  variant?: "icon-only" | "full"
}

export function EfilingChip({ efilingRequired, variant = "full" }: Props) {
  if (variant === "icon-only") {
    return efilingRequired === true ? (
      <Zap size={12} className="text-green-600" />
    ) : null
  }

  if (efilingRequired === true) {
    return (
      <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
        <Zap size={10} />
        E-Filing Required
      </span>
    )
  }

  if (efilingRequired === false) {
    return (
      <span className="text-xs border border-[#e5e5e5] rounded-full px-2 py-0.5 text-[#6b675f]">
        E-Filing Not Required
      </span>
    )
  }

  return (
    <span className="text-xs border border-[#e5e5e5] rounded-full px-2 py-0.5 text-[#9b9b9b]">
      E-Filing Status Unknown
    </span>
  )
}
