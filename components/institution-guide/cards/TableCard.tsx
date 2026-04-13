import { parseTable } from "@/lib/institutionUtils"

type Props = {
  label: string
  raw: string | null | undefined
}

export function TableCard({ label, raw }: Props) {
  const table = parseTable(raw)
  if (!table || table.rows.length === 0) return null

  return (
    <div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">
      <p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide mb-3">
        {label}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#e5e5e5]">
              {table.headers.map((header, i) => (
                <th
                  key={i}
                  className="text-left py-2 pr-4 text-xs font-semibold text-[#6b675f] uppercase tracking-wide whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-[#f0f0f0] last:border-0">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="py-2 pr-4 text-sm text-[#3d3d3d] leading-relaxed align-top"
                  >
                    {cell}
                  </td>
                ))}
                {/* Fill missing cells if row is shorter than headers */}
                {row.length < table.headers.length &&
                  Array.from({ length: table.headers.length - row.length }).map((_, i) => (
                    <td key={`empty-${i}`} className="py-2 pr-4" />
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
