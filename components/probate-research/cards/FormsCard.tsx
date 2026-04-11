import { FileText, ExternalLink } from "lucide-react"
import type { CountyForm } from "@/types/jurisdiction"
import { cleanUrl } from "@/lib/jurisdictionUtils"

type Props = {
  forms: CountyForm[]
}

export function FormsCard({ forms }: Props) {
  if (forms.length === 0) return null

  return (
    <div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">
      <p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide mb-3">
        Forms
      </p>
      <div className="flex flex-col">
        {forms.map((form, i) => {
          const href = cleanUrl(form.url)
          return (
            <div key={i}>
              <div className="py-2">
                <div className="flex items-start gap-2">
                  <FileText size={14} className="text-[#9b9b9b] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-[#7c6fc4] hover:underline inline-flex items-center gap-1"
                      >
                        {form.name}
                        <ExternalLink size={11} className="shrink-0" />
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-[#1a1a2e]">{form.name}</p>
                    )}
                    {form.description && (
                      <p className="text-xs text-[#6b675f] mt-0.5">{form.description}</p>
                    )}
                  </div>
                </div>
              </div>
              {i < forms.length - 1 && <hr className="border-[#f0f0f0]" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
