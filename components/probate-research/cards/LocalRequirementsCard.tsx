import { Newspaper, CreditCard } from "lucide-react"
import { formatProse } from "@/lib/jurisdictionUtils"

type Props = {
  localRequirements: string | null
  paymentMethods: string | null
  publicationNewspaper: string | null
}

export function LocalRequirementsCard({
  localRequirements,
  paymentMethods,
  publicationNewspaper,
}: Props) {
  const hasContent = localRequirements || paymentMethods || publicationNewspaper
  if (!hasContent) return null

  const requirementParagraphs = localRequirements ? formatProse(localRequirements) : []

  return (
    <div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">
      <p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide mb-3">
        Local Requirements
      </p>
      <div className="flex flex-col gap-3">
        {requirementParagraphs.length > 0 && (
          <div>
            <p className="text-xs text-[#6b675f] mb-1">Requirements</p>
            <div className="flex flex-col gap-1.5">
              {requirementParagraphs.map((p, i) => (
                <p key={i} className="text-sm text-[#1a1a2e] leading-relaxed">{p}</p>
              ))}
            </div>
          </div>
        )}

        {paymentMethods && (
          <div className="flex items-start gap-2">
            <CreditCard size={14} className="text-[#9b9b9b] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-[#6b675f] mb-0.5">Payment Methods</p>
              <p className="text-sm text-[#1a1a2e]">{paymentMethods}</p>
            </div>
          </div>
        )}

        {publicationNewspaper && (
          <div className="flex items-start gap-2">
            <Newspaper size={14} className="text-[#9b9b9b] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-[#6b675f] mb-0.5">Publication Newspaper</p>
              <p className="text-sm text-[#1a1a2e]">{publicationNewspaper}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
