import { ExternalLink } from "lucide-react"
import type { CountyResource } from "@/types/jurisdiction"

type Props = {
  resources: CountyResource[]
}

export function ResourcesCard({ resources }: Props) {
  if (resources.length === 0) return null

  return (
    <div className="border border-[#e5e5e5] rounded-lg p-4 bg-white">
      <p className="text-xs font-semibold text-[#6b675f] uppercase tracking-wide mb-3">
        Resources
      </p>
      <nav className="flex flex-col">
        {resources.map((resource) => (
          <a
            key={resource.url}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-1.5 text-sm text-[#3d3d3d] hover:text-[#7c6fc4] transition-colors group"
          >
            <span>{resource.label}</span>
            <ExternalLink
              size={12}
              className="text-[#9b9b9b] group-hover:text-[#7c6fc4] shrink-0 ml-2"
            />
          </a>
        ))}
      </nav>
    </div>
  )
}
