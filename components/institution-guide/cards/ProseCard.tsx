import { formatProse } from "@/lib/institutionUtils"

type Props = {
  label: string
  text: string | null | undefined
}

export function ProseCard({ label, text }: Props) {
  const paragraphs = formatProse(text)
  if (paragraphs.length === 0) return null

  return (
    <div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">
      <p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide mb-3">
        {label}
      </p>
      <div className="flex flex-col gap-2">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-[#3d3d3d] leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </div>
  )
}
